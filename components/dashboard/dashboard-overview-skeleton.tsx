import { Card } from "@/components/ui/card";
import { DashboardTableSkeleton } from "@/components/dashboard/dashboard-table-skeleton";

export function DashboardOverviewSkeleton() {
  return (
    <div className="flex flex-col gap-8 animate-pulse">
      <div
        className="h-4 w-full max-w-md rounded-[6px] -mt-6"
        style={{ backgroundColor: "var(--ds-surface)" }}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="p-6">
            <div
              className="h-4 w-24 rounded-[6px] mb-3"
              style={{ backgroundColor: "var(--ds-surface)" }}
            />
            <div
              className="h-8 w-16 rounded-[6px]"
              style={{ backgroundColor: "var(--ds-surface)" }}
            />
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {[1, 2].map((i) => (
          <Card key={i} className="p-6 min-h-[180px]">
            <div
              className="h-5 w-40 rounded-[6px] mb-2"
              style={{ backgroundColor: "var(--ds-surface)" }}
            />
            <div
              className="h-4 w-full max-w-xs rounded-[6px] mb-6"
              style={{ backgroundColor: "var(--ds-surface)" }}
            />
            <div
              className="h-11 w-full rounded-[8px]"
              style={{ backgroundColor: "var(--ds-surface)" }}
            />
          </Card>
        ))}
      </div>

      <Card className="overflow-hidden">
        <div className="p-6 pb-4">
          <div
            className="h-5 w-36 rounded-[6px] mb-2"
            style={{ backgroundColor: "var(--ds-surface)" }}
          />
          <div
            className="h-4 w-56 rounded-[6px]"
            style={{ backgroundColor: "var(--ds-surface)" }}
          />
        </div>
        <DashboardTableSkeleton rows={4} />
      </Card>
    </div>
  );
}
