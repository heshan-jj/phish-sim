import { config } from "dotenv";
import postgres from "postgres";

config({ path: ".env.local" });

const requiredTables = [
  "organizations",
  "employees",
  "campaigns",
  "campaign_events",
];

function getDatabaseUrl() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not set in .env.local");
  }
  return url;
}

async function run() {
  const sql = postgres(getDatabaseUrl(), { prepare: false });

  try {
    const [{ ok }] = await sql`select 1 as ok`;
    if (ok !== 1) {
      throw new Error("Database ping failed");
    }

    const rows = await sql`
      select table_name
      from information_schema.tables
      where table_schema = 'public'
        and table_name = any(${requiredTables})
    `;

    const existing = new Set(rows.map((row) => row.table_name));
    const missing = requiredTables.filter((table) => !existing.has(table));

    if (missing.length > 0) {
      throw new Error(
        `Missing required tables: ${missing.join(", ")}. Run npm run db:migrate.`,
      );
    }

    console.log("DB test passed.");
    console.log(`Connected and verified tables: ${requiredTables.join(", ")}`);
  } finally {
    await sql.end({ timeout: 5 });
  }
}

run().catch((error) => {
  console.error("DB test failed.");
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
