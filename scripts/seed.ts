import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";
import postgres from "postgres";

config({ path: ".env.local" });

const DEPARTMENTS = [
  "Engineering",
  "Finance",
  "HR",
  "Marketing",
  "Sales",
] as const;

const SENIORITIES = ["junior", "mid", "senior", "manager"] as const;

const SEED_EMPLOYEES: Array<{
  name: string;
  email: string;
  department: (typeof DEPARTMENTS)[number];
  role: string;
  seniority: (typeof SENIORITIES)[number];
}> = [
  {
    name: "Alex Chen",
    email: "alex.chen@company.com",
    department: "Engineering",
    role: "Software Engineer",
    seniority: "junior",
  },
  {
    name: "Jordan Lee",
    email: "jordan.lee@company.com",
    department: "Engineering",
    role: "Backend Engineer",
    seniority: "mid",
  },
  {
    name: "Samira Patel",
    email: "samira.patel@company.com",
    department: "Engineering",
    role: "Engineering Manager",
    seniority: "manager",
  },
  {
    name: "Chris Nguyen",
    email: "chris.nguyen@company.com",
    department: "Engineering",
    role: "Staff Engineer",
    seniority: "senior",
  },
  {
    name: "Morgan Blake",
    email: "morgan.blake@company.com",
    department: "Finance",
    role: "Financial Analyst",
    seniority: "junior",
  },
  {
    name: "Taylor Brooks",
    email: "taylor.brooks@company.com",
    department: "Finance",
    role: "Accountant",
    seniority: "mid",
  },
  {
    name: "Riley Adams",
    email: "riley.adams@company.com",
    department: "Finance",
    role: "Finance Manager",
    seniority: "manager",
  },
  {
    name: "Casey Wright",
    email: "casey.wright@company.com",
    department: "Finance",
    role: "Senior Controller",
    seniority: "senior",
  },
  {
    name: "Jamie Foster",
    email: "jamie.foster@company.com",
    department: "HR",
    role: "HR Coordinator",
    seniority: "junior",
  },
  {
    name: "Drew Martinez",
    email: "drew.martinez@company.com",
    department: "HR",
    role: "People Partner",
    seniority: "mid",
  },
  {
    name: "Avery Collins",
    email: "avery.collins@company.com",
    department: "HR",
    role: "HR Director",
    seniority: "manager",
  },
  {
    name: "Quinn Reed",
    email: "quinn.reed@company.com",
    department: "HR",
    role: "Senior Recruiter",
    seniority: "senior",
  },
  {
    name: "Parker Hayes",
    email: "parker.hayes@company.com",
    department: "Marketing",
    role: "Marketing Associate",
    seniority: "junior",
  },
  {
    name: "Skyler Grant",
    email: "skyler.grant@company.com",
    department: "Marketing",
    role: "Content Strategist",
    seniority: "mid",
  },
  {
    name: "Reese Morgan",
    email: "reese.morgan@company.com",
    department: "Marketing",
    role: "Marketing Manager",
    seniority: "manager",
  },
  {
    name: "Blake Turner",
    email: "blake.turner@company.com",
    department: "Marketing",
    role: "Brand Lead",
    seniority: "senior",
  },
  {
    name: "Cameron Diaz",
    email: "cameron.diaz@company.com",
    department: "Sales",
    role: "Sales Development Rep",
    seniority: "junior",
  },
  {
    name: "Harper Kim",
    email: "harper.kim@company.com",
    department: "Sales",
    role: "Account Executive",
    seniority: "mid",
  },
  {
    name: "Logan Price",
    email: "logan.price@company.com",
    department: "Sales",
    role: "Sales Manager",
    seniority: "manager",
  },
  {
    name: "Sydney Cole",
    email: "sydney.cole@company.com",
    department: "Sales",
    role: "Enterprise AE",
    seniority: "senior",
  },
];

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env.local",
    );
  }

  return createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

function getDatabaseUrl() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not set in .env.local");
  }
  return url;
}

async function resolveOrgId(): Promise<string> {
  const fromEnv = process.env.SEED_ORG_ID?.trim();
  if (fromEnv) return fromEnv;

  const sql = postgres(getDatabaseUrl(), { prepare: false });
  try {
    const rows = await sql<{ id: string }[]>`
      select id from organizations order by created_at asc limit 1
    `;
    const org = rows[0];
    if (!org) {
      throw new Error(
        "No organization found. Sign up first or set SEED_ORG_ID in .env.local",
      );
    }
    return org.id;
  } finally {
    await sql.end({ timeout: 5 });
  }
}

async function run() {
  const orgId = await resolveOrgId();
  const supabase = getSupabaseAdmin();

  const { data: existing, error: fetchError } = await supabase
    .from("employees")
    .select("email")
    .eq("org_id", orgId);

  if (fetchError) {
    throw new Error(fetchError.message);
  }

  const existingEmails = new Set(
    (existing ?? []).map((row) => row.email.toLowerCase()),
  );

  const toInsert = SEED_EMPLOYEES.filter(
    (employee) => !existingEmails.has(employee.email.toLowerCase()),
  ).map((employee) => ({
    org_id: orgId,
    name: employee.name,
    email: employee.email,
    department: employee.department,
    role: employee.role,
    seniority: employee.seniority,
  }));

  if (toInsert.length === 0) {
    console.log(`All ${SEED_EMPLOYEES.length} seed employees already exist for org ${orgId}.`);
    return;
  }

  const { error: insertError } = await supabase.from("employees").insert(toInsert);

  if (insertError) {
    throw new Error(insertError.message);
  }

  const skipped = SEED_EMPLOYEES.length - toInsert.length;
  console.log(
    `Seeded ${toInsert.length} employees for org ${orgId}${skipped > 0 ? ` (${skipped} skipped as duplicates)` : ""}.`,
  );
}

run().catch((error) => {
  console.error("Seed failed.");
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
