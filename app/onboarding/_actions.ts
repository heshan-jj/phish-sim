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

export async function uploadLogo(formData: FormData) {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthenticated");
  }

  const file = formData.get("logo") as File;
  if (!file || file.size === 0) {
    throw new Error("No file provided");
  }

  const ext = file.name.split(".").pop() ?? "png";
  const path = `${user.id}/logo.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("logos")
    .upload(path, file, { upsert: true });

  if (uploadError) {
    throw new Error(`Upload failed: ${uploadError.message}`);
  }

  const { data: urlData } = supabase.storage.from("logos").getPublicUrl(path);
  const publicUrl = urlData.publicUrl;

  // Update the org row with the logo URL
  await db
    .update(organizations)
    .set({ logoUrl: publicUrl })
    .where(eq(organizations.userId, user.id));

  return publicUrl;
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
