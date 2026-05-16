import { and, asc, eq, isNotNull, ne } from "drizzle-orm";
import { db } from "@/lib/db";
import { employees } from "@/lib/db/schema";

export type EmployeeUpdateData = {
  name: string;
  email: string;
  department: string | null;
  role: string | null;
  seniority: string | null;
};

export async function getEmployeeEmails(orgId?: string) {
  const query = db.select({ email: employees.email }).from(employees);

  if (orgId) {
    return query.where(eq(employees.orgId, orgId));
  }

  return query;
}

export async function listEmployeesByOrg(orgId: string) {
  return db
    .select({
      id: employees.id,
      name: employees.name,
      email: employees.email,
      department: employees.department,
      role: employees.role,
      seniority: employees.seniority,
    })
    .from(employees)
    .where(eq(employees.orgId, orgId))
    .orderBy(asc(employees.name));
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

export async function emailExistsForOrg(
  orgId: string,
  email: string,
  excludeEmployeeId?: string,
) {
  const conditions = [
    eq(employees.orgId, orgId),
    eq(employees.email, email),
  ];
  if (excludeEmployeeId) {
    conditions.push(ne(employees.id, excludeEmployeeId));
  }

  const [row] = await db
    .select({ id: employees.id })
    .from(employees)
    .where(and(...conditions))
    .limit(1);

  return Boolean(row);
}

export async function updateEmployeeForOrg(
  orgId: string,
  employeeId: string,
  data: EmployeeUpdateData,
) {
  const [updated] = await db
    .update(employees)
    .set(data)
    .where(and(eq(employees.id, employeeId), eq(employees.orgId, orgId)))
    .returning({
      id: employees.id,
      name: employees.name,
      email: employees.email,
      department: employees.department,
      role: employees.role,
      seniority: employees.seniority,
    });

  return updated ?? null;
}

export async function deleteEmployeeForOrg(orgId: string, employeeId: string) {
  const deleted = await db
    .delete(employees)
    .where(and(eq(employees.id, employeeId), eq(employees.orgId, orgId)))
    .returning({ id: employees.id });

  return deleted.length > 0;
}
