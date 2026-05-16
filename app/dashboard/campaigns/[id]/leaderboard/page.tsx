import { Suspense } from "react";
import { LeaderboardContent } from "./_components/leaderboard-content";
import { LeaderboardSkeleton } from "./_components/leaderboard-skeleton";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function CampaignLeaderboardPage({ params }: Props) {
  const { id } = await params;

  return (
    <Suspense fallback={<LeaderboardSkeleton />}>
      <LeaderboardContent campaignId={id} />
    </Suspense>
  );
}
