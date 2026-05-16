"use server";

import {
  deleteEmployeeForOrg,
  emailExistsForOrg,
  getEmployeeEmails,
  listEmployeesByOrg,
  updateEmployeeForOrg,
} from "@/lib/db/queries/employees";
import { getOrgForUser } from "@/lib/org";
import {
  createServerClient,
  createServiceRoleClient,
} from "@/lib/supabase/server";

/**
 * Deletes ALL employees belonging to the current user's organisation.
 */
export async function deleteAllEmployees(): Promise<{ deleted: number; error?: string }> {
  const org = await getOrgForUser();
  if (!org) return { deleted: 0, error: "Unauthenticated" };

  const supabase = createServiceRoleClient() ?? (await createServerClient());

  const { error, count } = await supabase
    .from("employees")
    .delete({ count: "exact" })
    .eq("org_id", org.id);

  if (error) return { deleted: 0, error: error.message };
  return { deleted: count ?? 0 };
}

export interface CsvEmployeeRow {
  name: string;
  email: string;
  department?: string | null;
  role?: string | null;
  seniority?: string | null;
}

export interface ImportEmployeesResult {
  inserted: number;
  skipped: number;
  duplicateEmails: string[];
  error?: string;
}

export interface EmployeeFormPayload {
  name: string;
  email: string;
  department?: string | null;
  role?: string | null;
  seniority?: string | null;
}

export type UpdateEmployeeResult =
  | { ok: true }
  | { ok: false; error: string };

export type DeleteEmployeeResult =
  | { ok: true }
  | { ok: false; error: string };

function deriveDepartments(
  employees: Awaited<ReturnType<typeof listEmployeesByOrg>>,
) {
  const set = new Set<string>();
  for (const employee of employees) {
    const dept = employee.department?.trim();
    if (dept) set.add(dept);
  }
  return [...set].sort((a, b) => a.localeCompare(b));
}

export async function getEmployeesPageData(orgId: string) {
  const employees = await listEmployeesByOrg(orgId);
  return { employees, departments: deriveDepartments(employees) };
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

async function insertEmployees(
  rows: Array<{
    org_id: string;
    name: string;
    email: string;
    department: string | null;
    role: string | null;
    seniority: string | null;
  }>,
) {
  const supabase = await createServerClient();
  const { error } = await supabase.from("employees").insert(rows);

  if (!error) return { error: null };

  // If RLS blocks anon inserts, use service role after server-side authZ.
  if (
    error.code === "42501" ||
    error.message.toLowerCase().includes("row-level security")
  ) {
    const admin = createServiceRoleClient();
    if (!admin) {
      return {
        error:
          "Could not insert employees. Set SUPABASE_SERVICE_ROLE_KEY or adjust RLS.",
      };
    }
    const { error: adminError } = await admin.from("employees").insert(rows);
    return { error: adminError };
  }

  return { error };
}

export async function importEmployees(
  rows: CsvEmployeeRow[],
): Promise<ImportEmployeesResult> {
  const org = await getOrgForUser();
  if (!org) {
    return {
      inserted: 0,
      skipped: 0,
      duplicateEmails: [],
      error: "Unauthenticated",
    };
  }

  const existingRows = await getEmployeeEmails(org.id);
  const existingEmails = new Set(
    existingRows.map((r) => normalizeEmail(r.email)),
  );

  const duplicateEmails: string[] = [];
  const toInsert: CsvEmployeeRow[] = [];

  for (const row of rows) {
    const email = normalizeEmail(row.email);
    if (!email) continue;

    if (existingEmails.has(email)) {
      duplicateEmails.push(row.email.trim());
      continue;
    }

    existingEmails.add(email);
    toInsert.push(row);
  }

  if (toInsert.length === 0) {
    return {
      inserted: 0,
      skipped: duplicateEmails.length,
      duplicateEmails,
    };
  }

  const payload = toInsert.map((row) => ({
    org_id: org.id,
    name: row.name.trim(),
    email: normalizeEmail(row.email),
    department: row.department?.trim() || null,
    role: row.role?.trim() || null,
    seniority: row.seniority?.trim() || null,
  }));

  const { error } = await insertEmployees(payload);

  if (error) {
    const pgError =
      error && typeof error === "object" && "code" in error ? error : null;
    const code = pgError ? String(pgError.code) : "";
    const message =
      pgError && "message" in pgError && typeof pgError.message === "string"
        ? pgError.message
        : typeof error === "string"
          ? error
          : "Failed to import employees";

    if (code === "23505") {
      return {
        inserted: 0,
        skipped: rows.length,
        duplicateEmails: rows.map((r) => r.email),
        error: "Some emails already exist for this organization.",
      };
    }

    return {
      inserted: 0,
      skipped: duplicateEmails.length,
      duplicateEmails,
      error: message,
    };
  }

  return {
    inserted: toInsert.length,
    skipped: duplicateEmails.length,
    duplicateEmails,
  };
}

function normalizeOptionalField(value: string | null | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function buildEmployeePayload(payload: EmployeeFormPayload) {
  return {
    name: payload.name.trim(),
    email: normalizeEmail(payload.email),
    department: normalizeOptionalField(payload.department),
    role: normalizeOptionalField(payload.role),
    seniority: normalizeOptionalField(payload.seniority),
  };
}

function validateEmployeePayload(payload: EmployeeFormPayload) {
  const name = payload.name.trim();
  const email = normalizeEmail(payload.email);

  if (!name) {
    return { ok: false as const, error: "Name is required." };
  }
  if (!email) {
    return { ok: false as const, error: "Email is required." };
  }

  return {
    ok: true as const,
    data: buildEmployeePayload(payload),
  };
}

export async function updateEmployee(
  employeeId: string,
  payload: EmployeeFormPayload,
): Promise<UpdateEmployeeResult> {
  const org = await getOrgForUser();
  if (!org) {
    return { ok: false, error: "Unauthenticated" };
  }

  const validated = validateEmployeePayload(payload);
  if (!validated.ok) {
    return validated;
  }

  const duplicate = await emailExistsForOrg(
    org.id,
    validated.data.email,
    employeeId,
  );
  if (duplicate) {
    return {
      ok: false,
      error: "Another employee already uses this email.",
    };
  }

  try {
    const updated = await updateEmployeeForOrg(
      org.id,
      employeeId,
      validated.data,
    );

    if (!updated) {
      return { ok: false, error: "Employee not found." };
    }

    return { ok: true };
  } catch (err) {
    const code =
      err &&
      typeof err === "object" &&
      "code" in err &&
      typeof err.code === "string"
        ? err.code
        : "";

    if (code === "23505") {
      return {
        ok: false,
        error: "Another employee already uses this email.",
      };
    }

    return { ok: false, error: "Failed to update employee." };
  }
}

export async function deleteEmployee(
  employeeId: string,
): Promise<DeleteEmployeeResult> {
  const org = await getOrgForUser();
  if (!org) {
    return { ok: false, error: "Unauthenticated" };
  }

  const deleted = await deleteEmployeeForOrg(org.id, employeeId);
  if (!deleted) {
    return { ok: false, error: "Employee not found." };
  }

  return { ok: true };
}

export async function suggestCsvEmployeeFields(
  rows: CsvEmployeeRow[],
): Promise<Array<{ index: number; department: string; seniority: string }>> {
  const org = await getOrgForUser();
  if (!org) return [];

  const { suggestEmployeeFieldMappings } = await import("@/lib/ai-extended");
  try {
    return await suggestEmployeeFieldMappings(
      rows.map((r) => ({
        name: r.name,
        email: r.email,
        role: r.role ?? undefined,
      })),
    );
  } catch {
    return [];
  }
}
