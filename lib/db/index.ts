import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

function getDatabaseUrl(): string {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not set");
  }
  return url;
}

/** Reuse one pool in dev (Turbopack HMR) and avoid stale Supabase pooler sockets. */
const globalForDb = globalThis as unknown as {
  pgClient?: ReturnType<typeof postgres>;
};

function createPgClient() {
  return postgres(getDatabaseUrl(), {
    prepare: false,
    // Transaction pooler (Supabase :6543): keep pool small to reduce ECONNRESET in dev.
    max: process.env.NODE_ENV === "production" ? 10 : 3,
    idle_timeout: 20,
    connect_timeout: 15,
    max_lifetime: 60 * 10,
  });
}

const client = globalForDb.pgClient ?? createPgClient();
if (process.env.NODE_ENV !== "production") {
  globalForDb.pgClient = client;
}

export const db = drizzle(client, { schema });

export * from "./schema";
