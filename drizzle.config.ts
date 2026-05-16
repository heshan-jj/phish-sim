import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config({ path: ".env.local" });

/** Drizzle Kit introspection fails on Supabase's transaction pooler (6543). */
function getDrizzleKitDatabaseUrl(): string {
  const url =
    process.env.DATABASE_URL_MIGRATE ??
    process.env.DATABASE_URL_DIRECT ??
    process.env.DATABASE_URL;

  if (!url) {
    throw new Error(
      "DATABASE_URL is not set. Add it to .env.local (see README)."
    );
  }

  const parsed = new URL(url);
  if (parsed.port === "6543" || parsed.searchParams.get("pgbouncer") === "true") {
    parsed.port = "5432";
    parsed.searchParams.delete("pgbouncer");
  }
  return parsed.toString();
}

export default defineConfig({
  schema: "./lib/db/schema/index.ts",
  dialect: "postgresql",
  schemaFilter: ["public"],
  dbCredentials: {
    url: getDrizzleKitDatabaseUrl(),
  },
});
