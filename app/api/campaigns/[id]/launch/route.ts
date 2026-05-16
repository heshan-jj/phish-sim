import type { CampaignSettings } from "@/lib/campaign-settings";
import { generatePhishingEmail, type CompanyContext } from "@/lib/ai";
import { db } from "@/lib/db";
import { listEmployeesByOrg } from "@/lib/db/queries/employees";
import { campaignEvents, campaigns, organizations } from "@/lib/db/schema";
import { createServerClient } from "@/lib/supabase/server";
import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const BATCH_SIZE = 10;
const BATCH_DELAY_MS = 1000;
const MAX_STAGGER_MINUTES = 240;
const DEFAULT_FROM_EMAIL = "security@yourdomain.com";

type OrgContextRecord = Partial<{
  vendors: string;
  terminology: string;
  events: string;
  orgStructure: string;
}>;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function normalizeDifficulty(value: string): "easy" | "medium" | "hard" {
  const normalized = value.trim().toLowerCase();
  if (normalized === "easy" || normalized === "hard") return normalized;
  return "medium";
}

function toCompanyContext(value: unknown): CompanyContext {
  const context =
    value && typeof value === "object" && !Array.isArray(value)
      ? (value as OrgContextRecord)
      : {};

  return {
    vendors: context.vendors ?? "",
    tools: context.vendors ?? "",
    internalTerms: context.terminology ?? "",
    recentEvents: context.events ?? "",
    orgStructure: context.orgStructure ?? "",
  };
}

function addMinutes(input: Date, minutes: number) {
  return new Date(input.getTime() + minutes * 60 * 1000);
}

function moveIntoBusinessHoursUTC(date: Date): Date {
  const adjusted = new Date(date);
  while (true) {
    const year = adjusted.getUTCFullYear();
    const month = adjusted.getUTCMonth();
    const day = adjusted.getUTCDate();
    const windowStart = new Date(Date.UTC(year, month, day, 9, 0, 0, 0));
    const windowEnd = new Date(Date.UTC(year, month, day, 17, 0, 0, 0));

    if (adjusted < windowStart) return windowStart;
    if (adjusted >= windowEnd) {
      adjusted.setUTCDate(adjusted.getUTCDate() + 1);
      adjusted.setUTCHours(9, 0, 0, 0);
      continue;
    }
    return adjusted;
  }
}

/**
 * Computes a randomised scheduled time within the stagger window (0–240 min)
 * anchored at baseDate, adjusted to fall within business hours UTC.
 * Only called when staggerSends is enabled.
 */
function computeStaggeredScheduledAt(baseDate: Date): Date {
  const randomOffsetMinutes = Math.floor(
    Math.random() * (MAX_STAGGER_MINUTES + 1),
  );
  return moveIntoBusinessHoursUTC(addMinutes(baseDate, randomOffsetMinutes));
}

function buildTrackUrl({
  origin,
  token,
  action,
  redirect,
}: {
  origin: string;
  token: string;
  action: "link_clicked" | "email_opened";
  redirect?: string;
}) {
  const url = new URL("/api/track", origin);
  url.searchParams.set("token", token);
  url.searchParams.set("action", action);
  if (redirect) {
    url.searchParams.set("redirect", redirect);
  }
  return url.toString();
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function ensureHtmlBody(body: string) {
  if (/<[a-z][\s\S]*>/i.test(body)) return body;
  return `<div>${escapeHtml(body).replace(/\n/g, "<br />")}</div>`;
}

function replaceLinksWithTracking({
  html,
  origin,
  token,
}: {
  html: string;
  origin: string;
  token: string;
}) {
  let replacedHref = false;
  const withHrefTracking = html.replace(
    /href=(["'])(.*?)\1/gi,
    (_match, quote: string, target: string) => {
      replacedHref = true;
      const trackingUrl = buildTrackUrl({
        origin,
        token,
        action: "link_clicked",
        redirect: target,
      });
      return `href=${quote}${trackingUrl}${quote}`;
    },
  );

  if (replacedHref) return withHrefTracking;

  return withHrefTracking.replace(/https?:\/\/[^\s<>"']+/gi, (target) =>
    buildTrackUrl({
      origin,
      token,
      action: "link_clicked",
      redirect: target,
    }),
  );
}

function appendTrackingPixel({
  html,
  origin,
  token,
}: {
  html: string;
  origin: string;
  token: string;
}) {
  const pixelUrl = buildTrackUrl({ origin, token, action: "email_opened" });
  const pixel = `<img src="${pixelUrl}" width="1" height="1" alt="" style="display:block;border:0;outline:none;text-decoration:none;" />`;
  if (/<\/body>/i.test(html)) {
    return html.replace(/<\/body>/i, `${pixel}</body>`);
  }
  return `${html}${pixel}`;
}

function isRateLimitError(error: unknown) {
  if (!error || typeof error !== "object") return false;
  const candidate = error as Record<string, unknown>;
  const message = typeof candidate.message === "string" ? candidate.message : "";
  const statusCode = candidate.statusCode;
  return statusCode === 429 || /rate limit/i.test(message);
}

async function sendWithRetry(
  resend: Resend,
  payload: Parameters<Resend["emails"]["send"]>[0],
) {
  for (let attempt = 0; attempt < 3; attempt++) {
    const { error } = await resend.emails.send(payload);
    if (!error) return;
    if (isRateLimitError(error) && attempt < 2) {
      await sleep(1000 * (attempt + 1));
      continue;
    }
    throw error;
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [org] = await db
    .select({ id: organizations.id, context: organizations.context })
    .from(organizations)
    .where(eq(organizations.userId, user.id))
    .limit(1);

  if (!org) {
    return NextResponse.json({ error: "Organization not found" }, { status: 404 });
  }

  const [campaign] = await db
    .select()
    .from(campaigns)
    .where(and(eq(campaigns.id, id), eq(campaigns.orgId, org.id)))
    .limit(1);

  if (!campaign) {
    return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
  }

  const settings = (campaign.settings as CampaignSettings | null) ?? null;
  const allEmployees = await listEmployeesByOrg(org.id);

  let recipients = allEmployees;
  if (settings?.targetMode === "departments" && settings.departments?.length) {
    const departmentSet = new Set(settings.departments);
    recipients = allEmployees.filter(
      (employee) =>
        typeof employee.department === "string" &&
        departmentSet.has(employee.department),
    );
  } else if (
    settings?.targetMode === "employees" &&
    settings.employeeIds?.length
  ) {
    const employeeIdSet = new Set(settings.employeeIds);
    recipients = allEmployees.filter((employee) =>
      employeeIdSet.has(employee.id),
    );
  }

  if (recipients.length === 0) {
    return NextResponse.json(
      { error: "No recipients matched targeting rules" },
      { status: 400 },
    );
  }

  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey) {
    return NextResponse.json(
      { error: "RESEND_API_KEY is not configured" },
      { status: 500 },
    );
  }
  const resend = new Resend(resendApiKey);
  const origin = process.env.NEXT_PUBLIC_APP_URL ?? request.nextUrl.origin;
  const fromEmail = process.env.RESEND_FROM_EMAIL ?? DEFAULT_FROM_EMAIL;
  const companyContext = toCompanyContext(org.context);
  const batchFailures: string[] = [];
  const scheduledTimes: Date[] = [];

  // Determine the base send time.
  // - sendImmediately=true (or no stored schedule) → omit scheduledAt so
  //   Resend delivers immediately without any "time in the past" rejection.
  // - sendImmediately=false + stored schedule → honour the schedule,
  //   optionally spreading sends within the stagger window.
  const sendImmediately = settings?.sendImmediately ?? true;
  const staggerSends = settings?.staggerSends ?? false;
  const baseSendDate =
    !sendImmediately && campaign.schedule ? campaign.schedule : null;

  let queued = 0;

  console.info("[campaign-launch] starting", {
    campaignId: campaign.id,
    orgId: org.id,
    targetMode: settings?.targetMode ?? "all",
    recipientCount: recipients.length,
    batchSize: BATCH_SIZE,
    sendImmediately,
    staggerSends,
    baseSendDate: baseSendDate?.toISOString() ?? "immediate",
    fromEmail,
  });

  for (let start = 0; start < recipients.length; start += BATCH_SIZE) {
    const batch = recipients.slice(start, start + BATCH_SIZE);
    const batchNumber = Math.floor(start / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(recipients.length / BATCH_SIZE);

    console.info("[campaign-launch] batch starting", {
      campaignId: campaign.id,
      batchNumber,
      totalBatches,
      batchSize: batch.length,
    });

    await Promise.all(
      batch.map(async (employee) => {
        try {
          console.info("[campaign-launch] generating email", {
            campaignId: campaign.id,
            employeeId: employee.id,
            department: employee.department,
          });

          const phishingEmail = await generatePhishingEmail({
            employeeName: employee.name,
            employeeRole: employee.role ?? "Employee",
            employeeDepartment: employee.department ?? "General",
            seniority: employee.seniority ?? "Individual Contributor",
            companyContext,
            templateCategory: campaign.templateCategory,
            difficulty: normalizeDifficulty(campaign.difficulty),
          });

          const token = crypto.randomUUID();

          // Only compute a future scheduledAt when the campaign is NOT
          // immediate. When sendImmediately is true, omitting scheduledAt
          // entirely is correct — passing any timestamp (even "now") risks
          // Resend rejecting it as a past time due to clock skew.
          let scheduledAt: Date | null = null;
          if (!sendImmediately && baseSendDate) {
            scheduledAt = staggerSends
              ? computeStaggeredScheduledAt(baseSendDate)
              : moveIntoBusinessHoursUTC(baseSendDate);
          }

          console.info("[campaign-launch] email generated", {
            campaignId: campaign.id,
            employeeId: employee.id,
            token,
            scheduledAt: scheduledAt?.toISOString() ?? "immediate",
            subjectLength: phishingEmail.subject.length,
            bodyLength: phishingEmail.body.length,
          });

          const htmlWithTrackedLinks = replaceLinksWithTracking({
            html: ensureHtmlBody(phishingEmail.body),
            origin,
            token,
          });
          const htmlBody = appendTrackingPixel({
            html: htmlWithTrackedLinks,
            origin,
            token,
          });

          await db.insert(campaignEvents).values({
            campaignId: campaign.id,
            employeeId: employee.id,
            action: "sent",
            metadata: {
              token,
              status: "sent",
              sentAt: scheduledAt?.toISOString() ?? new Date().toISOString(),
              phishingEmail: {
                subject: phishingEmail.subject,
                body: htmlBody,
                senderName: phishingEmail.senderName,
                senderEmail: phishingEmail.senderEmail,
              },
            },
          });

          // Build the Resend payload.
          // - Omit scheduledAt for immediate sends (avoids past-time rejection).
          // - Use reply_to (snake_case) — Resend SDK v3+ dropped camelCase replyTo.
          const resendPayload: Parameters<Resend["emails"]["send"]>[0] = {
            from: fromEmail,
            to: employee.email,
            subject: phishingEmail.subject,
            html: htmlBody,
            reply_to: `${phishingEmail.senderName} <${phishingEmail.senderEmail}>`,
          };
          if (scheduledAt) {
            resendPayload.scheduledAt = scheduledAt.toISOString();
          }

          await sendWithRetry(resend, resendPayload);

          queued += 1;
          if (scheduledAt) scheduledTimes.push(scheduledAt);

          console.info("[campaign-launch] email queued", {
            campaignId: campaign.id,
            employeeId: employee.id,
            token,
            scheduledAt: scheduledAt?.toISOString() ?? "immediate",
          });
        } catch (error) {
          const reason =
            error instanceof Error ? error.message : "Unknown error";
          batchFailures.push(`${employee.email}: ${reason}`);
          console.error("[campaign-launch] recipient failed", {
            campaignId: campaign.id,
            employeeId: employee.id,
            email: employee.email,
            reason,
          });
        }
      }),
    );

    console.info("[campaign-launch] batch completed", {
      campaignId: campaign.id,
      batchNumber,
      totalBatches,
      queued,
      failures: batchFailures.length,
    });

    if (start + BATCH_SIZE < recipients.length) {
      await sleep(BATCH_DELAY_MS);
    }
  }

  await db
    .update(campaigns)
    .set({ status: "active" })
    .where(eq(campaigns.id, campaign.id));

  const estimatedCompletionTime =
    scheduledTimes.length > 0
      ? new Date(
          Math.max(...scheduledTimes.map((timestamp) => timestamp.getTime())),
        ).toISOString()
      : new Date().toISOString();

  if (queued === 0 && batchFailures.length > 0) {
    console.error("[campaign-launch] failed to queue campaign", {
      campaignId: campaign.id,
      failures: batchFailures.slice(0, 10),
    });

    return NextResponse.json(
      {
        error: "Failed to queue any campaign emails",
        failures: batchFailures.slice(0, 5),
      },
      { status: 500 },
    );
  }

  return NextResponse.json({
    queued,
    estimatedCompletionTime,
    failures: batchFailures.length,
  });
}
