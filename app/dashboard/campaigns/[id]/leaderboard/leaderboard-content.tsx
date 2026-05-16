import { notFound } from "next/navigation";
import { getLeaderboardData } from "@/lib/db/queries/leaderboard";
import { LeaderboardClient } from "./leaderboard-client";

interface Props {
  campaignId: string;
}

/** Async server component — fetches data, then passes serialisable props to the client shell. */
export async function LeaderboardContent({ campaignId }: Props) {
  const data = await getLeaderboardData(campaignId);
  if (!data) notFound();

  return (
    <LeaderboardClient
      campaign={data.campaign}
      templateName={data.templateName}
      compromiseRate={data.compromiseRate}
      orgAvgScore={data.orgAvgScore}
      employees={data.employees}
      departments={data.departments}
    />
  );
}
