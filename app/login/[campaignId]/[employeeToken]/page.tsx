import { LoginSimulationClient } from "@/app/login/[campaignId]/[employeeToken]/login-simulation-client";
import { getTemplateById, type LandingPageType } from "@/lib/campaign-templates";
import { createServerClient, createServiceRoleClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { unstable_noStore as noStore } from "next/cache";

type JsonRecord = Record<string, unknown>;
type LoginVariant = LandingPageType;

const DEFAULT_RED_FLAGS: Record<LoginVariant, string[]> = {
  google_workspace: [
    "The email asks you to sign in from a link rather than a known portal.",
    "Unexpected account prompts should be verified directly in the app.",
    "The sender domain should match the real workspace notification domain.",
  ],
  microsoft365: [
    "Urgent pressure to verify credentials immediately",
    "Sender domain looks close to legitimate but not exact",
    "Security warning language without internal verification details",
  ],
  generic_sso: [
    "The login page is generic and not clearly tied to the company domain.",
    "Unexpected SSO prompts should be opened from a bookmark.",
    "The message relies on account urgency to drive action.",
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
  helpdesk: [
    "The ticket update should match a request you opened.",
    "Helpdesk portals should be accessed from the company intranet.",
    "The message gives limited context before asking you to sign in.",
  ],
  vpn: [
    "VPN changes should be verified through IT documentation.",
    "The email threatens access loss to create urgency.",
    "Certificate renewals should not start from an unexpected email link.",
  ],
  teams: [
    "Executive-message notifications can abuse authority and urgency.",
    "Open Teams directly instead of following a sign-in link.",
    "The sender domain should match the real collaboration platform.",
  ],
  dropbox: [
    "Storage quota alerts should be checked inside the storage app.",
    "The email pushes quick action to avoid service interruption.",
    "The sender domain should match the real cloud provider.",
  ],
  mfa: [
    "MFA enrollment should start from a trusted identity portal.",
    "A credential prompt before MFA setup is a warning sign.",
    "Security policy language can be used to rush sign-ins.",
  ],
  benefits: [
    "Benefits deadlines can create pressure to click quickly.",
    "HR portals should be opened from known bookmarks.",
    "Sensitive benefits changes deserve out-of-band verification.",
  ],
  shipping: [
    "Unexpected package notices often hide suspicious links.",
    "Carrier delivery changes should be verified on the carrier site.",
    "The message lacks a recognizable tracking domain.",
  ],
  linkedin: [
    "Curiosity about profile views is a common social lure.",
    "Social notifications should be opened in the official app.",
    "The sender is not clearly tied to the real platform domain.",
  ],
  software_license: [
    "Software renewals should be confirmed with IT or procurement.",
    "The email threatens loss of work tools to create urgency.",
    "License portals should be opened from trusted company resources.",
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

function isLoginVariant(value: string): value is LoginVariant {
  return value in DEFAULT_RED_FLAGS;
}

function resolveLoginVariant(templateCategory: string): LoginVariant {
  return getTemplateById(templateCategory)?.landingPageType ?? "generic_sso";
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
  const landingPageType =
    firstString(eventMetadata, ["landingPageType", "landing_page_type"]) ??
    firstString(eventEmail, ["landingPageType", "landing_page_type"]) ??
    firstString(phishingEmail, ["landingPageType", "landing_page_type"]) ??
    firstString(campaignEmail, ["landingPageType", "landing_page_type"]);

  const totalEmployees = new Set<string>();
  const clickedEmployees = new Set<string>();
  for (const row of relatedRows ?? []) {
    if (typeof row.employee_id !== "string") continue;
    totalEmployees.add(row.employee_id);
    if (
      row.action === "link_clicked" ||
      row.action === "credential_attempted" ||
      row.action === "credentials_submitted"
    ) {
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
    landingPageType,
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

  const variant =
    simulationData.landingPageType && isLoginVariant(simulationData.landingPageType)
      ? simulationData.landingPageType
      : resolveLoginVariant(simulationData.templateCategory);
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
