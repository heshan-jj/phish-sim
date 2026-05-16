import { createServerClient, createServiceRoleClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { unstable_noStore as noStore } from "next/cache";
import { InboxClient, type InboxMessage } from "@/app/inbox/[token]/inbox-client";

type JsonRecord = Record<string, unknown>;

function isJsonRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function pickString(source: JsonRecord | null, keys: string[]): string | null {
  if (!source) return null;
  for (const key of keys) {
    const value = source[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return null;
}

function stripHtmlPreview(html: string) {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function buildFallbackHtml({
  employeeName,
  campaignName,
  difficulty,
}: {
  employeeName: string;
  campaignName: string;
  difficulty: string;
}) {
  return `
    <p>Hi ${employeeName},</p>
    <p>This is a simulated phishing email from your company security training campaign <strong>${campaignName}</strong>.</p>
    <p>Difficulty level: <strong>${difficulty}</strong>.</p>
    <p>Please review this message carefully and practice identifying suspicious links and requests.</p>
    <p><a href="https://example.com/security-review">Review message details</a></p>
  `;
}

async function getInboxMessage(token: string): Promise<InboxMessage | null> {
  const serviceRole = createServiceRoleClient();
  const supabase = serviceRole ?? (await createServerClient());

  const { data: eventRows, error: eventError } = await supabase
    .from("campaign_events")
    .select("id,campaign_id,employee_id,metadata,created_at")
    .contains("metadata", { token })
    .order("created_at", { ascending: false })
    .limit(1);

  if (eventError) {
    throw new Error(`Failed to load campaign event: ${eventError.message}`);
  }

  const event = eventRows?.[0];
  if (!event) return null;

  const [{ data: employee, error: employeeError }, { data: campaign, error: campaignError }] =
    await Promise.all([
      supabase
        .from("employees")
        .select("id,name,email")
        .eq("id", event.employee_id)
        .maybeSingle(),
      supabase
        .from("campaigns")
        .select("id,name,template_category,difficulty,settings")
        .eq("id", event.campaign_id)
        .maybeSingle(),
    ]);

  if (employeeError) {
    throw new Error(`Failed to load employee: ${employeeError.message}`);
  }
  if (campaignError) {
    throw new Error(`Failed to load campaign: ${campaignError.message}`);
  }
  if (!employee || !campaign) return null;

  const eventMetadata = isJsonRecord(event.metadata) ? event.metadata : null;
  const eventEmailData = isJsonRecord(eventMetadata?.email) ? eventMetadata.email : null;
  const phishingEmail = isJsonRecord(eventMetadata?.phishingEmail)
    ? eventMetadata.phishingEmail
    : null;
  const campaignSettings = isJsonRecord(campaign.settings) ? campaign.settings : null;
  const campaignEmailData = isJsonRecord(campaignSettings?.email)
    ? campaignSettings.email
    : null;

  const subject =
    pickString(eventMetadata, ["subject"]) ??
    pickString(eventEmailData, ["subject"]) ??
    pickString(phishingEmail, ["subject"]) ??
    pickString(campaignEmailData, ["subject"]) ??
    `Urgent action required - ${campaign.template_category}`;

  const senderName =
    pickString(eventMetadata, ["senderName", "sender_name"]) ??
    pickString(eventEmailData, ["senderName", "sender_name"]) ??
    pickString(phishingEmail, ["senderName", "sender_name"]) ??
    pickString(campaignEmailData, ["senderName", "sender_name"]) ??
    "IT Security Team";

  const senderEmail =
    pickString(eventMetadata, ["senderEmail", "sender_email"]) ??
    pickString(eventEmailData, ["senderEmail", "sender_email"]) ??
    pickString(phishingEmail, ["senderEmail", "sender_email"]) ??
    pickString(campaignEmailData, ["senderEmail", "sender_email"]) ??
    "security-alerts@company-verify.example";

  const bodyHtml =
    pickString(eventMetadata, ["body", "bodyHtml", "emailBody"]) ??
    pickString(eventEmailData, ["body", "bodyHtml", "emailBody"]) ??
    pickString(phishingEmail, ["body", "bodyHtml", "emailBody"]) ??
    pickString(campaignEmailData, ["body", "bodyHtml", "emailBody"]) ??
    buildFallbackHtml({
      employeeName: employee.name,
      campaignName: campaign.name,
      difficulty: campaign.difficulty,
    });

  return {
    id: event.id,
    senderName,
    senderEmail,
    employeeName: employee.name,
    employeeEmail: employee.email,
    subject,
    bodyHtml,
    previewText: stripHtmlPreview(bodyHtml).slice(0, 160),
    timestamp: event.created_at,
    unread: true,
  };
}

export default async function InboxPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  noStore();
  const { token } = await params;
  const message = await getInboxMessage(token);

  if (!message) {
    notFound();
  }

  return <InboxClient token={token} message={message} />;
}
