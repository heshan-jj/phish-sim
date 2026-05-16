"use server";

import { getTemplateRecommendations } from "@/lib/campaign-recommendations";
import { listCampaignsByOrg } from "@/lib/db/queries/campaigns";
import { getDepartmentScoresForRecommendations } from "@/lib/db/queries/recommendations-input";
import { getOrgForUser } from "@/lib/org";
import {
  getCachedOrgRecommendations,
  saveOrgRecommendations,
} from "@/lib/org-recommendations";

export async function getCachedTemplateRecommendationsAction() {
  const org = await getOrgForUser();
  if (!org) {
    throw new Error("Unauthenticated");
  }

  return getCachedOrgRecommendations(org.id);
}

export async function refreshTemplateRecommendationsAction() {
  const org = await getOrgForUser();
  if (!org) {
    throw new Error("Unauthenticated");
  }

  const [campaigns, departmentScores] = await Promise.all([
    listCampaignsByOrg(org.id),
    getDepartmentScoresForRecommendations(org.id),
  ]);

  const pastTemplateIds = campaigns.map((c) => c.templateCategory);
  const recommendations = await getTemplateRecommendations({
    departmentScores,
    pastTemplateIds,
  });

  const generatedAt = await saveOrgRecommendations(org.id, recommendations);

  return { recommendations, generatedAt };
}
