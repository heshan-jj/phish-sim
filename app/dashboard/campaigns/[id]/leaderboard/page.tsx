import { notFound } from "next/navigation";
import { Suspense } from "react";
import { LeaderboardContent } from "./leaderboard-content";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function LeaderboardPage({ params }: Props) {
  const { id } = await params;

  return (
    <div className="flex flex-col gap-8">
      <Suspense fallback={<LeaderboardSkeleton />}>
        <LeaderboardContent campaignId={id} />
      </Suspense>
    </div>
  );
}

function LeaderboardSkeleton() {
  return (
    <div className="flex flex-col gap-6 animate-pulse">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <div className="h-7 w-64 rounded-lg" style={{ backgroundColor: "var(--ds-hairline)" }} />
        <div className="h-4 w-48 rounded" style={{ backgroundColor: "var(--ds-hairline)" }} />
      </div>
      {/* Summary banner */}
      <div className="h-16 rounded-[12px]" style={{ backgroundColor: "var(--ds-hairline)" }} />
      {/* Stat row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-24 rounded-[12px]"
            style={{ backgroundColor: "var(--ds-hairline)" }}
          />
        ))}
      </div>
      {/* Cards grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-40 rounded-[12px]"
            style={{ backgroundColor: "var(--ds-hairline)" }}
          />
        ))}
      </div>
    </div>
  );
}
