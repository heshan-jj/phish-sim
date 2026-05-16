"use server";

import { db } from "@/lib/db";
import { organizations } from "@/lib/db/schema";

export async function createOrganization(userId: string, orgName: string) {
  await db.insert(organizations).values({
    userId,
    name: orgName,
  });
}
