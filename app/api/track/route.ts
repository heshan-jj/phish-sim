import { createServerClient, createServiceRoleClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

const ALLOWED_ACTIONS = new Set([
  "sent",
  "email_opened",
  "link_clicked",
  "credential_attempted",
  "reported",
  "call_answered",
  "call_hung_up",
]);

type JsonRecord = Record<string, unknown>;

function isJsonRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeRedirect(raw: string | null): string {
  if (!raw) return "";
  try {
    const url = new URL(raw);
    if (url.protocol === "http:" || url.protocol === "https:") {
      return url.toString();
    }
    return "";
  } catch {
    return "";
  }
}

function mergeMetadata(
  token: string,
  requestMetadata: unknown,
  extra: JsonRecord = {},
): JsonRecord {
  const metadata: JsonRecord = { token, ...extra };
  if (typeof requestMetadata === "object" && requestMetadata !== null && !Array.isArray(requestMetadata)) {
    Object.assign(metadata, requestMetadata as JsonRecord);
  }
  return metadata;
}

function sanitizeCredentialMetadata(metadata: unknown): JsonRecord {
  if (!isJsonRecord(metadata)) {
    return {};
  }

  const sanitized: JsonRecord = { ...metadata };
  if ("password" in sanitized) {
    delete sanitized.password;
  }

  const rawPasswordLength = sanitized.passwordLength;
  if (typeof rawPasswordLength !== "number" || Number.isNaN(rawPasswordLength)) {
    sanitized.passwordLength = 0;
  }

  sanitized.employeeStatus = "compromised";
  sanitized.compromisedAt = new Date().toISOString();
  return sanitized;
}

async function resolveTrackingContext(token: string) {
  const serviceRole = createServiceRoleClient();
  const supabase = serviceRole ?? (await createServerClient());

  const { data: rows, error } = await supabase
    .from("campaign_events")
    .select("campaign_id,employee_id,action")
    .contains("metadata", { token })
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    throw new Error(`Failed to resolve tracking token: ${error.message}`);
  }

  const sentRow =
    rows?.find((row) => row.action === "sent") ??
    rows?.find((row) => typeof row.campaign_id === "string");
  const row = sentRow ?? null;
  if (!row) return null;

  return {
    supabase,
    campaignId: row.campaign_id as string,
    employeeId: row.employee_id as string,
  };
}

async function insertEvent({
  token,
  action,
  metadata,
  userAgent,
  ip,
}: {
  token: string;
  action: string;
  metadata: unknown;
  userAgent: string | null;
  ip: string | null;
}) {
  const context = await resolveTrackingContext(token);
  if (!context) return false;

  const payload = {
    campaign_id: context.campaignId,
    employee_id: context.employeeId,
    action,
    metadata: mergeMetadata(token, metadata),
    user_agent: userAgent,
    ip,
  };

  const { error } = await context.supabase.from("campaign_events").insert(payload);
  if (error) {
    throw new Error(`Failed to record tracking event: ${error.message}`);
  }

  return true;
}

const TRANSPARENT_PIXEL = Uint8Array.from([
  137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 13, 73, 72, 68, 82, 0, 0, 0, 1, 0,
  0, 0, 1, 8, 6, 0, 0, 0, 31, 21, 196, 137, 0, 0, 0, 13, 73, 68, 65, 84, 8, 215,
  99, 248, 255, 255, 255, 127, 0, 9, 251, 3, 253, 5, 67, 69, 202, 0, 0, 0, 0, 73,
  69, 78, 68, 174, 66, 96, 130,
]);

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  const action = request.nextUrl.searchParams.get("action");
  const redirect = normalizeRedirect(request.nextUrl.searchParams.get("redirect"));

  if (
    !token ||
    !action ||
    !ALLOWED_ACTIONS.has(action) ||
    (action !== "link_clicked" && action !== "email_opened")
  ) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  const userAgent = request.headers.get("user-agent");
  const ip = request.headers.get("x-forwarded-for") ?? request.headers.get("x-real-ip");

  const context = await resolveTrackingContext(token);
  if (!context) {
    return NextResponse.json({ error: "Invalid tracking token" }, { status: 404 });
  }

  try {
    const inserted = await insertEvent({
      token,
      action,
      metadata: { redirect },
      userAgent,
      ip,
    });
    if (!inserted) {
      return NextResponse.json({ error: "Invalid tracking token" }, { status: 404 });
    }
  } catch (error) {
    console.error("[api/track:get]", error);
  }

  if (action === "link_clicked") {
    const loginUrl = new URL(
      `/login/${context.campaignId}/${token}`,
      request.nextUrl.origin,
    );
    if (redirect) {
      loginUrl.searchParams.set("redirect", redirect);
    }
    return NextResponse.redirect(loginUrl);
  }

  return new NextResponse(TRANSPARENT_PIXEL, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "no-store, max-age=0",
      Pragma: "no-cache",
      Expires: "0",
    },
  });
}

export async function POST(request: NextRequest) {
  const searchToken = request.nextUrl.searchParams.get("token");
  const searchAction = request.nextUrl.searchParams.get("action");

  let body: JsonRecord = {};
  try {
    body = (await request.json()) as JsonRecord;
  } catch {
    // Body is optional for this endpoint.
  }

  const token =
    (typeof body.token === "string" && body.token) || searchToken || "";
  const action =
    (typeof body.action === "string" && body.action) || searchAction || "";

  if (!token || !action || !ALLOWED_ACTIONS.has(action)) {
    return NextResponse.json({ error: "Invalid token or action" }, { status: 400 });
  }

  const userAgent = request.headers.get("user-agent");
  const ip = request.headers.get("x-forwarded-for") ?? request.headers.get("x-real-ip");
  const metadata =
    action === "credential_attempted"
      ? sanitizeCredentialMetadata(body.metadata)
      : body.metadata;

  try {
    const inserted = await insertEvent({
      token,
      action,
      metadata,
      userAgent,
      ip,
    });

    if (!inserted) {
      return NextResponse.json({ error: "Invalid tracking token" }, { status: 404 });
    }
  } catch (error) {
    console.error("[api/track:post]", error);
    return NextResponse.json({ error: "Failed to track event" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
