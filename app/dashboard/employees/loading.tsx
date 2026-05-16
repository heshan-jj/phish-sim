import { EmployeesContentSkeleton } from "@/components/dashboard/employees-content-skeleton";

export default function EmployeesLoading() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 animate-pulse">
        <div
          className="h-8 w-48 rounded-[8px]"
          style={{ backgroundColor: "var(--ds-surface)" }}
        />
        <div
          className="h-4 w-full max-w-md rounded-[6px]"
          style={{ backgroundColor: "var(--ds-surface)" }}
        />
      </div>
      <EmployeesContentSkeleton />
    </div>
  );
}
