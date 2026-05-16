"use server";

import { db } from "@/lib/db";
import { campaigns } from "@/lib/db/schema";
import { getCampaignAnalytics } from "@/lib/db/queries/analytics";
import { getTemplateDisplayName } from "@/lib/campaign-templates";
import { generateCampaignSummary } from "@/lib/ai-extended";
import { orgContextToCompanyContext, parseOrgContext } from "@/lib/org-context";
import { getOrgForUser } from "@/lib/org";
import type { CampaignSettings } from "@/lib/campaign-settings";
import { eq } from "drizzle-orm";

export async function refreshCampaignAiSummary(campaignId: string): Promise<string> {
  const org = await getOrgForUser();
  if (!org) throw new Error("Unauthenticated");

  const [campaignRow] = await db
    .select({
      settings: campaigns.settings,
      templateCategory: campaigns.templateCategory,
    })
    .from(campaigns)
    .where(eq(campaigns.id, campaignId))
    .limit(1);

  if (!campaignRow) throw new Error("Campaign not found");

  const data = await getCampaignAnalytics(campaignId);
  if (!data) throw new Error("Campaign not found");

  const topDept = [...data.departments].sort(
    (a, b) => b.vulnerabilityScore - a.vulnerabilityScore,
  )[0];

  const summary = await generateCampaignSummary(
    {
      totalSent: data.totalSent,
      openRate: data.openRate,
      clickRate: data.clickRate,
      compromiseRate: data.compromiseRate,
      reportRate: data.reportRate,
      topDepartment: topDept?.department,
    },
    org.name,
    getTemplateDisplayName(campaignRow.templateCategory),
    orgContextToCompanyContext(parseOrgContext(org.context)),
  );

  const settings = (campaignRow.settings as CampaignSettings | null) ?? {};
  await db
    .update(campaigns)
    .set({
      settings: {
        ...settings,
        lastAiSummary: summary,
        lastAiSummaryAt: new Date().toISOString(),
      },
    })
    .where(eq(campaigns.id, campaignId));

  return summary;
}
