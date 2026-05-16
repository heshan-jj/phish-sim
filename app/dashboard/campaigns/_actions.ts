"use server";

import { getOrgForUser } from "@/lib/org";
import { createServerClient, createServiceRoleClient } from "@/lib/supabase/server";

/**
 * Deletes a campaign by ID. Verifies the campaign belongs to the current user's
 * organisation before deleting to prevent cross-tenant deletion.
 */
export async function deleteCampaign(campaignId: string): Promise<{ error?: string }> {
  const org = await getOrgForUser();
  if (!org) return { error: "Unauthenticated" };

  // Prefer service-role so RLS doesn't block the delete.
  const supabase = createServiceRoleClient() ?? (await createServerClient());

  // Verify ownership before deleting.
  const { data: campaign, error: fetchError } = await supabase
    .from("campaigns")
    .select("id")
    .eq("id", campaignId)
    .eq("org_id", org.id)
    .maybeSingle();

  if (fetchError) return { error: fetchError.message };
  if (!campaign) return { error: "Campaign not found" };

  const { error } = await supabase
    .from("campaigns")
    .delete()
    .eq("id", campaignId)
    .eq("org_id", org.id);

  if (error) return { error: error.message };
  return {};
}

/**
 * Deletes ALL campaigns belonging to the current user's organisation.
 */
export async function deleteAllCampaigns(): Promise<{ deleted: number; error?: string }> {
  const org = await getOrgForUser();
  if (!org) return { deleted: 0, error: "Unauthenticated" };

  const supabase = createServiceRoleClient() ?? (await createServerClient());

  const { error, count } = await supabase
    .from("campaigns")
    .delete({ count: "exact" })
    .eq("org_id", org.id);

  if (error) return { deleted: 0, error: error.message };
  return { deleted: count ?? 0 };
}
