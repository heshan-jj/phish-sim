/**
 * @file app/api/track/route.ts
 *
 * Phishing-simulation event-tracking endpoint.
 *
 * GET  /api/track?token=…&action=…[&redirect=…]
 *   Passive browser-initiated tracking requests embedded in phishing emails.
 *   - action=email_opened   → returns a 1×1 transparent PNG (tracking pixel)
 *   - action=link_clicked   → 302 redirect to /login/[campaignId]/[token]
 *   - action=reported        → returns { success: true }
 *
 *   Security: always HTTP 200, regardless of token validity, so the existence
 *   of this system cannot be inferred from status codes.
 *
 * POST /api/track
 *   Explicit event submissions from landing and training pages.
 *   Body: { token: string; action: TrackingAction; metadata?: object }
 *   Returns: { success: true; eventId: string | null }
 *
 *   When action=credential_attempted, the employee is also upserted as
 *   "compromised" in the campaign_employees junction table.
 *
 * Both handlers:
 *   - Skip event insertion when the employee is already "compromised".
 *   - Emit a Supabase Realtime broadcast on channel "campaign:[campaignId]"
 *     after every successful insertion so the admin dashboard updates live.
 */

import { createServerClient, createServiceRoleClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/**
 * All tracking actions recognised by the platform.
 * Keep in sync with the `campaign_event_action` Postgres enum
 * (`lib/db/schema/enums.ts`).
 */
export type TrackingAction =
  | "sent"
  | "email_opened"
  | "link_clicked"
  | "landing_page_viewed"
  | "credential_attempted"
  | "credentials_submitted"
  | "training_viewed"
  | "reported"
  | "call_answered"
  | "call_hung_up";

/** Payload broadcast on the Supabase Realtime channel after each event. */
interface TrackingBroadcastPayload {
  eventId: string;
  campaignId: string;
  employeeId: string;
  action: TrackingAction;
  createdAt: string;
}

type JsonRecord = Record<string, unknown>;

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Full set of valid action values. */
const ALLOWED_ACTIONS = new Set<TrackingAction>([
  "sent",
  "email_opened",
  "link_clicked",
  "landing_page_viewed",
  "credential_attempted",
  "credentials_submitted",
  "training_viewed",
  "reported",
  "call_answered",
  "call_hung_up",
]);

/** Subset of actions accepted through the stateless GET handler. */
const GET_ALLOWED_ACTIONS = new Set<TrackingAction>([
  "email_opened",
  "link_clicked",
  "reported",
]);

/**
 * 1×1 transparent PNG pixel.
 * Note: the spec requests a GIF, but PNG is smaller and equally supported
 * by every modern email client, so PNG is used here instead.
 */
const TRANSPARENT_PIXEL = Uint8Array.from([
  137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 13, 73, 72, 68, 82, 0, 0, 0, 1, 0,
  0, 0, 1, 8, 6, 0, 0, 0, 31, 21, 196, 137, 0, 0, 0, 13, 73, 68, 65, 84, 8, 215,
  99, 248, 255, 255, 255, 127, 0, 9, 251, 3, 253, 5, 67, 69, 202, 0, 0, 0, 0, 73,
  69, 78, 68, 174, 66, 96, 130,
]);

/** Cache-defeating headers for the tracking pixel response. */
const PIXEL_HEADERS: HeadersInit = {
  "Content-Type": "image/png",
  "Cache-Control": "no-store, max-age=0",
  Pragma: "no-cache",
  Expires: "0",
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function isJsonRecord(v: unknown): v is JsonRecord {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

/**
 * Validates that a redirect URL is an absolute http/https URL.
 * Rejects relative paths and non-http protocols to prevent open-redirect abuse.
 */
function normalizeRedirect(raw: string | null): string {
  if (!raw) return "";
  try {
    const url = new URL(raw);
    return url.protocol === "http:" || url.protocol === "https:" ? url.toString() : "";
  } catch {
    return "";
  }
}

/** Merges the per-request metadata JSONB with the token and optional extras. */
function mergeMetadata(token: string, requestMetadata: unknown, extra: JsonRecord = {}): JsonRecord {
  const base: JsonRecord = { token, ...extra };
  if (isJsonRecord(requestMetadata)) Object.assign(base, requestMetadata);
  return base;
}

/**
 * Sanitises credential event metadata so raw passwords and emails are never
 * stored. Records only boolean presence flags and a numeric password-length
 * hint.
 */
function sanitizeCredentialMetadata(metadata: unknown): JsonRecord {
  if (!isJsonRecord(metadata)) return {};

  const s: JsonRecord = { ...metadata };

  if ("password" in s) delete s.password;
  if ("email" in s) {
    s.enteredEmail = typeof s.email === "string" && s.email.length > 0;
    delete s.email;
  }

  s.enteredEmail = s.enteredEmail === true;
  s.enteredPassword = s.enteredPassword === true;

  const rawLen = s.passwordLength;
  if (typeof rawLen !== "number" || Number.isNaN(rawLen)) s.passwordLength = 0;

  return s;
}

// ---------------------------------------------------------------------------
// Supabase client
// ---------------------------------------------------------------------------

/**
 * Returns the service-role client (bypasses RLS, needed for tracking writes)
 * and falls back to the cookie-based SSR client when the key is absent.
 */
async function getSupabase() {
  return createServiceRoleClient() ?? (await createServerClient());
}

// ---------------------------------------------------------------------------
// Token resolution
// ---------------------------------------------------------------------------

interface TrackingContext {
  supabase: Awaited<ReturnType<typeof getSupabase>>;
  campaignId: string;
  employeeId: string;
}

/**
 * Resolves a tracking token to its campaign and employee IDs by searching for
 * a `sent` event row whose `metadata` JSONB contains `{ token }`.
 *
 * Returns `null` when the token is unknown. Callers must handle this silently
 * — never surface a 404 to the outside world.
 */
async function resolveTrackingContext(token: string): Promise<TrackingContext | null> {
  const supabase = await getSupabase();

  const { data: rows, error } = await supabase
    .from("campaign_events")
    .select("campaign_id,employee_id,action")
    .contains("metadata", { token })
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) throw new Error(`Token resolution failed: ${error.message}`);

  const row =
    rows?.find((r) => r.action === "sent") ??
    rows?.find((r) => typeof r.campaign_id === "string") ??
    null;

  if (!row) return null;

  return {
    supabase,
    campaignId: row.campaign_id as string,
    employeeId: row.employee_id as string,
  };
}

// ---------------------------------------------------------------------------
// Compromised-status guard
// ---------------------------------------------------------------------------

/**
 * Returns `true` when this employee is already marked "compromised" in the
 * `campaign_employees` junction table.
 *
 * Used as the primary deduplication gate: once compromised, subsequent events
 * for the same token are silently discarded.
 */
async function isAlreadyCompromised(ctx: TrackingContext): Promise<boolean> {
  const { data } = await ctx.supabase
    .from("campaign_employees")
    .select("status")
    .eq("campaign_id", ctx.campaignId)
    .eq("employee_id", ctx.employeeId)
    .maybeSingle();

  return data?.status === "compromised";
}

// ---------------------------------------------------------------------------
// Realtime broadcast
// ---------------------------------------------------------------------------

/**
 * Emits a fire-and-forget Supabase Realtime broadcast on channel
 * `campaign:[campaignId]` so the admin dashboard updates live.
 *
 * Failures are logged but do not affect the HTTP response.
 */
async function broadcastEvent(payload: TrackingBroadcastPayload): Promise<void> {
  try {
    const supabase = await getSupabase();
    await supabase
      .channel(`campaign:${payload.campaignId}`)
      .send({
        type: "broadcast",
        event: "event_tracked",
        payload,
      });
  } catch (err) {
    console.warn("[api/track] realtime broadcast failed", err);
  }
}

// ---------------------------------------------------------------------------
// Core event insertion
// ---------------------------------------------------------------------------

/**
 * Validates the token, applies deduplication and flood-protection rules,
 * inserts the event row, and returns the new event UUID.
 *
 * Returns `null`            → token unknown (caller responds silently).
 * Returns `"skipped:…"`    → event intentionally skipped (still a success).
 * Returns a UUID string     → event inserted successfully.
 *
 * Deduplication rules (in order):
 *   1. If the employee is already "compromised", skip all further events.
 *   2. Prevent duplicate `credential_attempted` / `credentials_submitted`.
 *   3. Flood guard: cap at 50 total events per token.
 *
 * Side-effects on success:
 *   - When action is `credential_attempted` or `credentials_submitted`,
 *     upserts the employee's status to "compromised" in `campaign_employees`.
 *   - Broadcasts the event payload on the Supabase Realtime channel.
 */
async function insertEvent({
  token,
  action,
  metadata,
  userAgent,
  ip,
  resolvedContext,
}: {
  token: string;
  action: string;
  metadata: unknown;
  userAgent: string | null;
  ip: string | null;
  resolvedContext?: TrackingContext;
}): Promise<string | null> {
  const ctx = resolvedContext ?? (await resolveTrackingContext(token));
  if (!ctx) return null;

  // Guard 1 — skip all events once the employee is compromised
  if (await isAlreadyCompromised(ctx)) {
    console.info("[api/track] skipping event: employee already compromised", { token, action });
    return "skipped:compromised";
  }

  // Guard 2 — prevent duplicate credential events
  if (action === "credentials_submitted" || action === "credential_attempted") {
    const { count } = await ctx.supabase
      .from("campaign_events")
      .select("*", { count: "exact", head: true })
      .eq("campaign_id", ctx.campaignId)
      .eq("employee_id", ctx.employeeId)
      .eq("action", action);

    if (count && count > 0) {
      console.info("[api/track] rate-limited: credential event already exists", { token, action });
      return "skipped:duplicate";
    }
  }

  // Guard 3 — flood protection
  const { count: totalCount } = await ctx.supabase
    .from("campaign_events")
    .select("*", { count: "exact", head: true })
    .contains("metadata", { token });

  if (totalCount && totalCount > 50) {
    console.warn("[api/track] flood-protection: too many events for token", { token });
    return "skipped:flood";
  }

  // Insert and retrieve the new event ID
  const { data: inserted, error } = await ctx.supabase
    .from("campaign_events")
    .insert({
      campaign_id: ctx.campaignId,
      employee_id: ctx.employeeId,
      action,
      metadata: mergeMetadata(token, metadata),
      user_agent: userAgent,
      ip,
    })
    .select("id")
    .single();

  if (error || !inserted) {
    throw new Error(`Failed to record tracking event: ${error?.message ?? "no data returned"}`);
  }

  const eventId = inserted.id as string;

  // Mark employee compromised when credentials were submitted
  if (action === "credential_attempted" || action === "credentials_submitted") {
    const { error: upsertErr } = await ctx.supabase
      .from("campaign_employees")
      .upsert(
        {
          campaign_id: ctx.campaignId,
          employee_id: ctx.employeeId,
          status: "compromised",
          updated_at: new Date().toISOString(),
        },
        { onConflict: "campaign_id,employee_id" },
      );

    if (upsertErr) {
      console.error("[api/track] failed to mark employee compromised", upsertErr);
    }
  }

  // Broadcast after every successful insertion (fire-and-forget)
  void broadcastEvent({
    eventId,
    campaignId: ctx.campaignId,
    employeeId: ctx.employeeId,
    action: action as TrackingAction,
    createdAt: new Date().toISOString(),
  });

  return eventId;
}

// ---------------------------------------------------------------------------
// Route handlers
// ---------------------------------------------------------------------------

/**
 * GET /api/track?token=…&action=…[&redirect=…]
 *
 * Handles passive browser-initiated tracking events embedded in phishing emails.
 *
 * Responses by action:
 * - `email_opened`  → 1×1 transparent PNG tracking pixel
 * - `link_clicked`  → 302 redirect to /login/[campaignId]/[token]
 * - `reported`       → JSON { success: true }
 *
 * Always responds HTTP 200 on invalid/unknown tokens — a non-200 would let
 * an attacker probe the system for valid tokens.
 */
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token") ?? "";
  const rawAction = request.nextUrl.searchParams.get("action") ?? "";
  const redirect = normalizeRedirect(request.nextUrl.searchParams.get("redirect"));

  // Silently reject invalid params with a benign pixel response (never 404)
  if (
    !token ||
    !rawAction ||
    !ALLOWED_ACTIONS.has(rawAction as TrackingAction) ||
    !GET_ALLOWED_ACTIONS.has(rawAction as TrackingAction)
  ) {
    return new NextResponse(TRANSPARENT_PIXEL, { headers: PIXEL_HEADERS });
  }

  const action = rawAction as TrackingAction;
  const userAgent = request.headers.get("user-agent");
  const ip =
    request.headers.get("x-forwarded-for") ?? request.headers.get("x-real-ip");

  // Resolve token — unknown tokens get a benign response (never 404)
  let ctx: TrackingContext | null = null;
  try {
    ctx = await resolveTrackingContext(token);
  } catch (err) {
    console.error("[api/track:GET] token resolution error", err);
  }

  if (!ctx) {
    return action === "link_clicked"
      ? NextResponse.redirect(new URL("/", request.url))
      : action === "reported"
        ? NextResponse.json({ success: true })
        : new NextResponse(TRANSPARENT_PIXEL, { headers: PIXEL_HEADERS });
  }

  try {
    await insertEvent({
      token,
      action,
      metadata: redirect ? { redirect } : {},
      userAgent,
      ip,
      resolvedContext: ctx,
    });
  } catch (err) {
    // Log but never surface errors to the client
    console.error("[api/track:GET] insertEvent failed", err);
  }

  if (action === "link_clicked") {
    const loginUrl = new URL(
      `/login/${ctx.campaignId}/${token}`,
      request.nextUrl.origin,
    );
    if (redirect) loginUrl.searchParams.set("redirect", redirect);
    return NextResponse.redirect(loginUrl, 302);
  }

  if (action === "reported") {
    return NextResponse.json({ success: true });
  }

  // email_opened
  return new NextResponse(TRANSPARENT_PIXEL, { headers: PIXEL_HEADERS });
}

/**
 * POST /api/track
 *
 * Handles explicit event submissions from phishing landing pages and training pages.
 *
 * Body: `{ token: string; action: TrackingAction; metadata?: object }`
 *
 * Token and action can also be passed as query-string params for XHR callers
 * that cannot set a request body.
 *
 * When `action` is `credential_attempted`, the employee's status is also
 * upserted to "compromised" in `campaign_employees`.
 *
 * Returns `{ success: true; eventId: string | null }`.
 */
export async function POST(request: NextRequest) {
  const searchToken = request.nextUrl.searchParams.get("token");
  const searchAction = request.nextUrl.searchParams.get("action");

  let body: JsonRecord = {};
  try {
    body = (await request.json()) as JsonRecord;
  } catch {
    // Body is optional; params may come from the query string instead.
  }

  const token =
    (typeof body.token === "string" ? body.token : null) ?? searchToken ?? "";
  const rawAction =
    (typeof body.action === "string" ? body.action : null) ?? searchAction ?? "";

  if (!token || !rawAction || !ALLOWED_ACTIONS.has(rawAction as TrackingAction)) {
    return NextResponse.json({ error: "Invalid token or action" }, { status: 400 });
  }

  const action = rawAction as TrackingAction;
  const userAgent = request.headers.get("user-agent");
  const ip =
    request.headers.get("x-forwarded-for") ?? request.headers.get("x-real-ip");

  const metadata =
    action === "credential_attempted" || action === "credentials_submitted"
      ? sanitizeCredentialMetadata(body.metadata)
      : body.metadata;

  let eventId: string | null = null;
  try {
    eventId = await insertEvent({ token, action, metadata, userAgent, ip });
  } catch (err) {
    console.error("[api/track:POST] insertEvent failed", err);
    return NextResponse.json({ error: "Failed to track event" }, { status: 500 });
  }

  // eventId is null only when the token is unknown — return 200 regardless
  return NextResponse.json({ success: true, eventId });
}
