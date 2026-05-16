import { count, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { campaigns, employees } from "@/lib/db/schema";
import { listCampaignsByOrg } from "./campaigns";

export async function getDashboardStats(orgId: string) {
  const [employeeRow] = await db
    .select({ count: count() })
    .from(employees)
    .where(eq(employees.orgId, orgId));

  const campaignRows = await db
    .select({ status: campaigns.status })
    .from(campaigns)
    .where(eq(campaigns.orgId, orgId));

  const statusCounts = {
    draft: 0,
    active: 0,
    complete: 0,
  };

  for (const row of campaignRows) {
    statusCounts[row.status] += 1;
  }

  const recentCampaigns = (await listCampaignsByOrg(orgId)).slice(0, 5);

  return {
    employeeCount: employeeRow?.count ?? 0,
    campaignCount: campaignRows.length,
    statusCounts,
    recentCampaigns,
  };
}
