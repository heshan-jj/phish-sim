import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Trophy } from "lucide-react";
import { getCampaignLeaderboard } from "@/lib/db/queries/leaderboard";
import { LeaderboardClient } from "./leaderboard-client";

interface Props {
  campaignId: string;
}

export async function LeaderboardContent({ campaignId }: Props) {
  const data = await getCampaignLeaderboard(campaignId);
  if (!data) notFound();

  return (
    <div className="flex flex-col gap-8">
      <div>
        <Link
          href={`/dashboard/campaigns/${campaignId}/analytics`}
          className="inline-flex items-center gap-1.5 text-[13px] font-[500] mb-4 ds-interactive-link"
          style={{ color: "var(--ds-link)" }}
        >
          <ArrowLeft className="size-3.5" />
          Back to analytics
        </Link>
        <div className="flex items-center gap-3 mb-1">
          <Trophy className="size-7" style={{ color: "var(--ds-primary)" }} />
          <h1
            className="text-[28px] font-[600] leading-[1.25]"
            style={{ color: "var(--ds-ink)" }}
          >
            Security Awareness Leaderboard
          </h1>
        </div>
        <p className="text-[14px]" style={{ color: "var(--ds-steel)" }}>
          {data.campaign.name} — ranked by security awareness score
        </p>
      </div>

      <LeaderboardClient
        entries={data.entries}
        templateName={data.templateName}
        templateSuccessRate={data.templateSuccessRate}
      />
    </div>
  );
}
