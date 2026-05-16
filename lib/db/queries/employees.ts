import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { employees } from "@/lib/db/schema";

export async function getEmployeeEmails(orgId?: string) {
  const query = db.select({ email: employees.email }).from(employees);

  if (orgId) {
    return query.where(eq(employees.orgId, orgId));
  }

  return query;
}
