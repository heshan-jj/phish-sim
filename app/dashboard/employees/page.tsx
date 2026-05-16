import { getEmployeesPageData } from "@/app/dashboard/employees/_actions";
import { EmployeesClient } from "@/app/dashboard/employees/employees-client";
import { redirect } from "next/navigation";

export default async function EmployeesPage() {
  const data = await getEmployeesPageData();

  if (!data) {
    redirect("/login");
  }

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

      <EmployeesClient
        initialEmployees={data.employees}
        departments={data.departments}
      />
    </div>
  );
}
