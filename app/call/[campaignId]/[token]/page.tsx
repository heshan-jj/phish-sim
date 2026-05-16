import { CallSimulationClient } from "@/app/call/[campaignId]/[token]/call-simulation-client";
import { createServerClient, createServiceRoleClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { unstable_noStore as noStore } from "next/cache";

function isJsonRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

async function getCallData(campaignId: string, token: string) {
  const supabase = createServiceRoleClient() ?? (await createServerClient());

  const { data: events } = await supabase
    .from("campaign_events")
    .select("metadata")
    .eq("campaign_id", campaignId)
    .contains("metadata", { token })
    .order("created_at", { ascending: false })
    .limit(1);

  const event = events?.[0];
  if (!event) return null;

  const metadata = isJsonRecord(event.metadata) ? event.metadata : {};
  const voiceScript = isJsonRecord(metadata.voiceScript)
    ? metadata.voiceScript
    : null;

  return {
    script:
      typeof voiceScript?.script === "string"
        ? voiceScript.script
        : "Hello, this is IT support calling about your account access.",
    callerName:
      typeof voiceScript?.callerName === "string"
        ? voiceScript.callerName
        : "IT Support",
    callerRole:
      typeof voiceScript?.callerRole === "string"
        ? voiceScript.callerRole
        : "Help Desk",
  };
}

export default async function CallSimulationPage({
  params,
}: {
  params: Promise<{ campaignId: string; token: string }>;
}) {
  noStore();
  const { campaignId, token } = await params;
  const data = await getCallData(campaignId, token);
  if (!data) notFound();

  const loginUrl = `/login/${campaignId}/${token}`;

  return (
    <CallSimulationClient
      token={token}
      callerName={data.callerName}
      callerRole={data.callerRole}
      script={data.script}
      loginUrl={loginUrl}
    />
  );
}
