import { DashboardTableSkeleton } from "@/components/dashboard/dashboard-table-skeleton";

export function EmployeesContentSkeleton() {
  return (
    <div className="flex flex-col gap-4 animate-pulse">
      <div className="flex flex-col sm:flex-row gap-3">
        <div
          className="h-11 flex-1 rounded-[8px]"
          style={{ backgroundColor: "var(--ds-surface)" }}
        />
        <div
          className="h-11 w-full sm:w-52 rounded-[8px]"
          style={{ backgroundColor: "var(--ds-surface)" }}
        />
        <div
          className="h-11 w-32 rounded-[8px]"
          style={{ backgroundColor: "var(--ds-surface)" }}
        />
      </div>
      <DashboardTableSkeleton rows={6} />
    </div>
  );
}
