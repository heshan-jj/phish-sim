import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { campaigns } from "@/lib/db/schema";

export async function listCampaignsByOrg(orgId: string) {
  return db
    .select({
      id: campaigns.id,
      name: campaigns.name,
      templateCategory: campaigns.templateCategory,
      difficulty: campaigns.difficulty,
      status: campaigns.status,
      schedule: campaigns.schedule,
      createdAt: campaigns.createdAt,
    })
    .from(campaigns)
    .where(eq(campaigns.orgId, orgId))
    .orderBy(desc(campaigns.createdAt));
}
