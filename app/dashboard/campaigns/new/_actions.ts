"use server";

import type { CampaignDifficulty } from "@/lib/campaign-templates";
import type { CampaignSettings } from "@/lib/campaign-settings";
import { db } from "@/lib/db";
import {
  getDepartmentsByOrg,
  getEmployeesByOrg,
} from "@/lib/db/queries/employees";
import { campaigns, organizations } from "@/lib/db/schema";
import type { CampaignStatus } from "@/types";
import { createServerClient } from "@/lib/supabase/server";
import { eq } from "drizzle-orm";

import type { TargetingOptions } from "./types";

export interface CreateCampaignInput {
  name: string;
  templateCategory: string;
  difficulty: CampaignDifficulty;
  status: CampaignStatus;
  schedule: Date | null;
  settings: CampaignSettings;
}

async function getOrgForUser() {
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

export async function getTargetingOptions(): Promise<TargetingOptions | null> {
  const org = await getOrgForUser();
  if (!org) return null;

  const [departments, employeesList] = await Promise.all([
    getDepartmentsByOrg(org.id),
    getEmployeesByOrg(org.id),
  ]);

  return { departments, employees: employeesList };
}

export async function createCampaign(
  input: CreateCampaignInput,
): Promise<{ id: string }> {
  const org = await getOrgForUser();
  if (!org) {
    throw new Error("Unauthenticated");
  }

  const [campaign] = await db
    .insert(campaigns)
    .values({
      orgId: org.id,
      name: input.name,
      templateCategory: input.templateCategory,
      difficulty: input.difficulty,
      status: input.status,
      schedule: input.schedule,
      settings: input.settings,
    })
    .returning({ id: campaigns.id });

  if (!campaign) {
    throw new Error("Failed to create campaign");
  }

  return { id: campaign.id };
}
