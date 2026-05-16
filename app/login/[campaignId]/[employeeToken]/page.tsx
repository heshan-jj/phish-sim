import { LoginSimulationClient } from "@/app/login/[campaignId]/[employeeToken]/login-simulation-client";
import { createServerClient, createServiceRoleClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { unstable_noStore as noStore } from "next/cache";

type JsonRecord = Record<string, unknown>;
type LoginVariant = "microsoft365" | "workday" | "docusign" | "slack";

const DEFAULT_RED_FLAGS: Record<LoginVariant, string[]> = {
  microsoft365: [
    "Urgent pressure to verify credentials immediately",
    "Sender domain looks close to legitimate but not exact",
    "Security warning language without internal verification details",
  ],
  workday: [
    "Unexpected payroll or HR urgency outside normal process",
    "Request asks for credentials rather than using SSO flow",
    "Message uses fear of missed payment to rush action",
  ],
  docusign: [
    "Unexpected invoice approval request from unknown sender",
    "Call-to-action pushes immediate login before reviewing details",
    "Generic greeting and unusual signing context",
  ],
  slack: [
    "Account verification warning creates artificial urgency",
    "Message asks you to re-enter workspace credentials",
    "Tone and formatting differ from normal Slack notifications",
  ],
};

function isJsonRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function firstString(source: JsonRecord | null, keys: string[]) {
  if (!source) return null;
  for (const key of keys) {
    const value = source[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return null;
}

function firstStringArray(source: JsonRecord | null, keys: string[]) {
  if (!source) return null;
  for (const key of keys) {
    const value = source[key];
    if (Array.isArray(value)) {
      const strings = value.filter(
        (entry): entry is string => typeof entry === "string" && entry.trim().length > 0,
      );
      if (strings.length > 0) return strings;
    }
  }
  return null;
}

function parseCommaSeparated(value: string | undefined): string[] {
  if (!value) return [];
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function resolveLoginVariant(templateCategory: string): LoginVariant {
  const value = templateCategory.toLowerCase();
  if (value.includes("it-security") || value.includes("account-verification")) {
    return "microsoft365";
  }
  if (value.includes("hr-payroll") || value.includes("executive")) {
    return "workday";
  }
  if (value.includes("vendor-invoice")) {
    return "docusign";
  }
  if (value.includes("saas")) {
    return "slack";
  }
  return "microsoft365";
}

async function getSimulationData(campaignId: string, employeeToken: string) {
  const serviceRole = createServiceRoleClient();
  const supabase = serviceRole ?? (await createServerClient());

  const { data: eventRows, error: eventError } = await supabase
    .from("campaign_events")
    .select("id,campaign_id,employee_id,metadata")
    .eq("campaign_id", campaignId)
    .contains("metadata", { token: employeeToken })
    .order("created_at", { ascending: false })
    .limit(1);

  if (eventError) {
    throw new Error(`Failed to load simulation event: ${eventError.message}`);
  }

  const event = eventRows?.[0];
  if (!event) return null;

  const [{ data: campaign, error: campaignError }, { data: relatedRows, error: relatedError }] =
    await Promise.all([
      supabase
        .from("campaigns")
        .select("id,name,template_category,settings")
        .eq("id", campaignId)
        .maybeSingle(),
      supabase
        .from("campaign_events")
        .select("employee_id,action")
        .eq("campaign_id", campaignId),
    ]);

  if (campaignError) {
    throw new Error(`Failed to load campaign: ${campaignError.message}`);
  }
  if (relatedError) {
    throw new Error(`Failed to load campaign stats: ${relatedError.message}`);
  }
  if (!campaign) return null;

  const eventMetadata = isJsonRecord(event.metadata) ? event.metadata : null;
  const eventEmail = isJsonRecord(eventMetadata?.email) ? eventMetadata.email : null;
  const phishingEmail = isJsonRecord(eventMetadata?.phishingEmail)
    ? eventMetadata.phishingEmail
    : null;
  const campaignSettings = isJsonRecord(campaign.settings) ? campaign.settings : null;
  const campaignEmail = isJsonRecord(campaignSettings?.email) ? campaignSettings.email : null;

  const senderName =
    firstString(eventMetadata, ["senderName", "sender_name"]) ??
    firstString(eventEmail, ["senderName", "sender_name"]) ??
    firstString(phishingEmail, ["senderName", "sender_name"]) ??
    firstString(campaignEmail, ["senderName", "sender_name"]) ??
    "Security Operations";

  const senderEmail =
    firstString(eventMetadata, ["senderEmail", "sender_email"]) ??
    firstString(eventEmail, ["senderEmail", "sender_email"]) ??
    firstString(phishingEmail, ["senderEmail", "sender_email"]) ??
    firstString(campaignEmail, ["senderEmail", "sender_email"]) ??
    "security-alerts@company-training.example";

  const subject =
    firstString(eventMetadata, ["subject"]) ??
    firstString(eventEmail, ["subject"]) ??
    firstString(phishingEmail, ["subject"]) ??
    firstString(campaignEmail, ["subject"]) ??
    "Action required: account verification";

  const redFlagsFromDb =
    firstStringArray(eventMetadata, ["redFlags", "red_flags"]) ??
    firstStringArray(eventEmail, ["redFlags", "red_flags"]) ??
    firstStringArray(phishingEmail, ["redFlags", "red_flags"]) ??
    firstStringArray(campaignEmail, ["redFlags", "red_flags"]);

  const totalEmployees = new Set<string>();
  const clickedEmployees = new Set<string>();
  for (const row of relatedRows ?? []) {
    if (typeof row.employee_id !== "string") continue;
    totalEmployees.add(row.employee_id);
    if (row.action === "link_clicked" || row.action === "credential_attempted") {
      clickedEmployees.add(row.employee_id);
    }
  }
  const clickRate =
    totalEmployees.size > 0
      ? Math.round((clickedEmployees.size / totalEmployees.size) * 100)
      : 27;

  return {
    templateCategory: campaign.template_category as string,
    senderName,
    senderEmail,
    subject,
    redFlagsFromDb,
    clickRate,
  };
}

export default async function LoginSimulationPage({
  params,
  searchParams,
}: {
  params: Promise<{ campaignId: string; employeeToken: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  noStore();
  const { campaignId, employeeToken } = await params;
  const query = await searchParams;
  const simulationData = await getSimulationData(campaignId, employeeToken);

  if (!simulationData) {
    notFound();
  }

  const variant = resolveLoginVariant(simulationData.templateCategory);
  const fallbackFlags = DEFAULT_RED_FLAGS[variant];

  const queryFlags = parseCommaSeparated(
    typeof query.redFlags === "string" ? query.redFlags : undefined,
  );
  const redFlags = (queryFlags.length ? queryFlags : simulationData.redFlagsFromDb) ?? fallbackFlags;

  const senderName =
    (typeof query.senderName === "string" && query.senderName.trim()) ||
    simulationData.senderName;
  const senderEmail =
    (typeof query.senderEmail === "string" && query.senderEmail.trim()) ||
    simulationData.senderEmail;
  const subject =
    (typeof query.subject === "string" && query.subject.trim()) ||
    simulationData.subject;

  return (
    <LoginSimulationClient
      token={employeeToken}
      campaignId={campaignId}
      variant={variant}
      senderName={senderName}
      senderEmail={senderEmail}
      subject={subject}
      redFlags={redFlags}
      clickRate={simulationData.clickRate}
    />
  );
}
