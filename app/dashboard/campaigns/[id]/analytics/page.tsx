import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Campaign analytics",
};
import { AnalyticsContent } from "./_components/analytics-content";
import { AnalyticsSkeleton } from "./_components/analytics-skeleton";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function CampaignAnalyticsPage({ params }: Props) {
  const { id } = await params;

  return (
    <div className="flex flex-col gap-8">
      <Suspense fallback={<AnalyticsSkeleton />}>
        <AnalyticsContent campaignId={id} />
      </Suspense>
    </div>
  );
}
