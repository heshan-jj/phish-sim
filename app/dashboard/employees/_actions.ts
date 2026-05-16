"use server";

import {
  getDepartmentsByOrg,
  getEmployeeEmails,
  listEmployeesByOrg,
} from "@/lib/db/queries/employees";
import { getOrgForUser } from "@/lib/org";
import {
  createServerClient,
  createServiceRoleClient,
} from "@/lib/supabase/server";

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

export async function getEmployeesPageData() {
  const org = await getOrgForUser();
  if (!org) return null;

  const [employees, departments] = await Promise.all([
    listEmployeesByOrg(org.id),
    getDepartmentsByOrg(org.id),
  ]);

  return { employees, departments };
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
