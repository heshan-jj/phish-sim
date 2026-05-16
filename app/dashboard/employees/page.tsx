import { EmployeesContent } from "@/app/dashboard/employees/employees-content";
import { EmployeesContentSkeleton } from "@/components/dashboard/employees-content-skeleton";
import { Suspense } from "react";

export default function EmployeesPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1
          className="text-[28px] font-[600] leading-[1.25] mb-2"
          style={{ color: "var(--ds-ink)" }}
        >
          Employees
        </h1>
        <p
          className="text-[14px] leading-[1.50]"
          style={{ color: "var(--ds-steel)" }}
        >
          Manage your organization&apos;s employee directory for phishing
          simulations and risk tracking.
        </p>
      </div>

      <Suspense fallback={<EmployeesContentSkeleton />}>
        <EmployeesContent />
      </Suspense>
    </div>
  );
}
