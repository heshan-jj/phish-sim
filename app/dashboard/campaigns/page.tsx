import { CampaignsContent } from "@/app/dashboard/campaigns/campaigns-content";
import { DashboardTableSkeleton } from "@/components/dashboard/dashboard-table-skeleton";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

export default function CampaignsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1
            className="text-[28px] font-[600] leading-[1.25] mb-2"
            style={{ color: "var(--ds-ink)" }}
          >
            Campaigns
          </h1>
          <p className="text-[14px] leading-[1.50]" style={{ color: "var(--ds-steel)" }}>
            View and manage phishing simulation campaigns.
          </p>
        </div>
        <Link href="/dashboard/campaigns/new" className="shrink-0">
          <Button
            type="button"
            className="h-11 rounded-[8px] px-4"
            style={{
              backgroundColor: "var(--ds-primary)",
              color: "#ffffff",
            }}
          >
            <Plus className="size-4" />
            New campaign
          </Button>
        </Link>
      </div>

      <div
        className="rounded-[12px] border overflow-hidden"
        style={{
          backgroundColor: "var(--ds-canvas)",
          borderColor: "var(--ds-hairline)",
        }}
      >
        <Suspense fallback={<DashboardTableSkeleton rows={5} />}>
          <CampaignsContent />
        </Suspense>
      </div>
    </div>
  );
}
