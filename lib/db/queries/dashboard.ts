import { count, desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { campaigns, employees } from "@/lib/db/schema";

export async function getDashboardStats(orgId: string) {
  const [employeeRows, campaignRows, statusRows, recentCampaigns] = await Promise.all([
    db
      .select({ count: count() })
      .from(employees)
      .where(eq(employees.orgId, orgId)),
    db
      .select({ count: count() })
      .from(campaigns)
      .where(eq(campaigns.orgId, orgId)),
    db
      .select({ status: campaigns.status, count: count() })
      .from(campaigns)
      .where(eq(campaigns.orgId, orgId))
      .groupBy(campaigns.status),
    db
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
      .orderBy(desc(campaigns.createdAt))
      .limit(5),
  ]);

  const statusCounts = {
    draft: 0,
    active: 0,
    complete: 0,
  };

  for (const row of statusRows) {
    statusCounts[row.status] = row.count;
  }

  return {
    employeeCount: employeeRows[0]?.count ?? 0,
    campaignCount: campaignRows[0]?.count ?? 0,
    statusCounts,
    recentCampaigns,
  };
}
