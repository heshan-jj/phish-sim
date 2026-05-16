import { getEmployeesPageData } from "@/app/dashboard/employees/_actions";
import { EmployeesClient } from "@/app/dashboard/employees/employees-client";
import { requireDashboardOrg } from "@/lib/org";

export async function EmployeesContent() {
  const org = await requireDashboardOrg();
  const data = await getEmployeesPageData(org.id);

  return (
    <EmployeesClient
      initialEmployees={data.employees}
      departments={data.departments}
    />
  );
}
