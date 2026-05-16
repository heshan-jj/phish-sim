"use server";

import { db } from "@/lib/db";
import { organizations } from "@/lib/db/schema";
import { createServerClient } from "@/lib/supabase/server";
import { eq } from "drizzle-orm";

export interface OrgContext {
  vendors: string;
  terminology: string;
  events: string;
  orgStructure: string;
}

export async function saveStep1(
  orgId: string,
  data: { name: string; industry: string },
) {
  await db
    .update(organizations)
    .set({ name: data.name, industry: data.industry })
    .where(eq(organizations.id, orgId));
}


export async function saveContext(orgId: string, context: OrgContext) {
  await db
    .update(organizations)
    .set({ context })
    .where(eq(organizations.id, orgId));
}

export async function getOrgForUser() {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const [org] = await db
    .select()
    .from(organizations)
    .where(eq(organizations.userId, user.id))
    .limit(1);

  return org ?? null;
}

/** Returns the user's org, creating one if missing (e.g. after signup race). */
export async function ensureOrgForUser(defaultName = "My Organization") {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const existing = await getOrgForUser();
  if (existing) return existing;

  const name = defaultName.trim() || "My Organization";

  try {
    const [created] = await db
      .insert(organizations)
      .values({ userId: user.id, name })
      .returning();

    return created ?? null;
  } catch {
    return getOrgForUser();
  }
}
