import { DashboardOverviewContent } from "@/app/dashboard/dashboard-overview-content";
import { DashboardOverviewSkeleton } from "@/components/dashboard/dashboard-overview-skeleton";
import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Overview",
};

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1
          className="text-[28px] font-[600] leading-[1.25] mb-2"
          style={{ color: "var(--ds-ink)" }}
        >
          Overview
        </h1>
      </div>

      <Suspense fallback={<DashboardOverviewSkeleton />}>
        <DashboardOverviewContent />
      </Suspense>
    </div>
  );
}
