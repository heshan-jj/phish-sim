import { count, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { employees } from "@/lib/db/schema";
import { listCampaignsByOrg } from "./campaigns";

export async function getDashboardStats(orgId: string) {
  // Run both queries in parallel and derive status counts from the campaign
  // list that is already fetched, avoiding a separate round-trip.
  const [[employeeRow], allCampaigns] = await Promise.all([
    db
      .select({ count: count() })
      .from(employees)
      .where(eq(employees.orgId, orgId)),
    listCampaignsByOrg(orgId),
  ]);

  const statusCounts = {
    draft: 0,
    active: 0,
    complete: 0,
  };

  for (const c of allCampaigns) {
    statusCounts[c.status] += 1;
  }

  return {
    employeeCount: employeeRow?.count ?? 0,
    campaignCount: allCampaigns.length,
    statusCounts,
    recentCampaigns: allCampaigns.slice(0, 5),
  };
}
