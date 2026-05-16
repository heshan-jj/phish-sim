import { and, eq, isNotNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { employees } from "@/lib/db/schema";

export async function getEmployeeEmails(orgId?: string) {
  const query = db.select({ email: employees.email }).from(employees);

  if (orgId) {
    return query.where(eq(employees.orgId, orgId));
  }

  return query;
}

export async function getEmployeesByOrg(orgId: string) {
  return db
    .select({
      id: employees.id,
      name: employees.name,
      email: employees.email,
      department: employees.department,
    })
    .from(employees)
    .where(eq(employees.orgId, orgId));
}

export async function getDepartmentsByOrg(orgId: string) {
  const rows = await db
    .selectDistinct({ department: employees.department })
    .from(employees)
    .where(
      and(eq(employees.orgId, orgId), isNotNull(employees.department)),
    );

  return rows
    .map((r) => r.department)
    .filter((d): d is string => Boolean(d))
    .sort((a, b) => a.localeCompare(b));
}
