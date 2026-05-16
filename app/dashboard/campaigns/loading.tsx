import { DashboardTableSkeleton } from "@/components/dashboard/dashboard-table-skeleton";

export default function CampaignsLoading() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 animate-pulse">
        <div className="flex flex-col gap-2 flex-1">
          <div
            className="h-8 w-48 rounded-[8px]"
            style={{ backgroundColor: "var(--ds-surface)" }}
          />
          <div
            className="h-4 w-full max-w-md rounded-[6px]"
            style={{ backgroundColor: "var(--ds-surface)" }}
          />
        </div>
        <div
          className="h-11 w-36 rounded-[8px] shrink-0"
          style={{ backgroundColor: "var(--ds-surface)" }}
        />
      </div>
      <div
        className="rounded-[12px] border overflow-hidden"
        style={{
          backgroundColor: "var(--ds-canvas)",
          borderColor: "var(--ds-hairline)",
        }}
      >
        <DashboardTableSkeleton rows={5} />
      </div>
    </div>
  );
}
