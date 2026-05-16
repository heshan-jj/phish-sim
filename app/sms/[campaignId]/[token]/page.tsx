import { SmsSimulationClient } from "@/app/sms/[campaignId]/[token]/sms-simulation-client";
import { createServerClient, createServiceRoleClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { unstable_noStore as noStore } from "next/cache";

function isJsonRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

async function getSmsData(campaignId: string, token: string) {
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
  const smishing = isJsonRecord(metadata.smishing) ? metadata.smishing : null;

  return {
    message:
      typeof smishing?.message === "string"
        ? smishing.message
        : "Urgent: verify your account now.",
    senderLabel:
      typeof smishing?.senderLabel === "string"
        ? smishing.senderLabel
        : "ALERT",
  };
}

export default async function SmsSimulationPage({
  params,
}: {
  params: Promise<{ campaignId: string; token: string }>;
}) {
  noStore();
  const { campaignId, token } = await params;
  const data = await getSmsData(campaignId, token);
  if (!data) notFound();

  return (
    <SmsSimulationClient
      token={token}
      campaignId={campaignId}
      message={data.message}
      senderLabel={data.senderLabel}
      loginUrl={`/login/${campaignId}/${token}`}
    />
  );
}
