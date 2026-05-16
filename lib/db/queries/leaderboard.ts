import { and, asc, eq } from "drizzle-orm";
import { getTemplateDisplayName } from "@/lib/campaign-templates";
import {
  calculateRiskScore,
  getDepartmentScores,
  getRiskTier,
  getRiskTierLabel,
  type DepartmentScore,
} from "@/lib/scoring";
import { db } from "@/lib/db";
import {
  campaignEmployees,
  campaignEvents,
  campaigns,
  employees,
} from "@/lib/db/schema";
import type { CampaignEvent } from "@/types";

export type LeaderboardEntry = {
  employeeId: string;
  name: string;
  email: string;
  department: string | null;
  role: string | null;
  score: number;
  tier: ReturnType<typeof getRiskTier>;
  tierLabel: string;
  timeToActionMinutes: number | null;
};

export type LeaderboardData = {
  campaign: {
    id: string;
    name: string;
  };
  templateName: string;
  templateSuccessRate: number;
  entries: LeaderboardEntry[];
  departmentScores: DepartmentScore[];
};

export async function getCampaignLeaderboard(
  campaignId: string,
): Promise<LeaderboardData | null> {
  const [campaignRows, empRows, eventRows] = await Promise.all([
    db.select().from(campaigns).where(eq(campaigns.id, campaignId)).limit(1),

    db
      .selectDistinct({
        employeeId: employees.id,
        name: employees.name,
        email: employees.email,
        department: employees.department,
        role: employees.role,
        status: campaignEmployees.status,
      })
      .from(campaignEvents)
      .innerJoin(employees, eq(campaignEvents.employeeId, employees.id))
      .leftJoin(
        campaignEmployees,
        and(
          eq(campaignEmployees.campaignId, campaignEvents.campaignId),
          eq(campaignEmployees.employeeId, campaignEvents.employeeId),
        ),
      )
      .where(eq(campaignEvents.campaignId, campaignId)),

    db
      .select()
      .from(campaignEvents)
      .where(eq(campaignEvents.campaignId, campaignId))
      .orderBy(asc(campaignEvents.createdAt)),
  ]);

  if (!campaignRows[0]) return null;

  const campaign = campaignRows[0];
  const templateName = getTemplateDisplayName(campaign.templateCategory);

  const eventsByEmployee = new Map<string, CampaignEvent[]>();
  for (const evt of eventRows) {
    const list = eventsByEmployee.get(evt.employeeId) ?? [];
    list.push(evt);
    eventsByEmployee.set(evt.employeeId, list);
  }

  const entries: LeaderboardEntry[] = empRows.map((emp) => {
    const evts = eventsByEmployee.get(emp.employeeId) ?? [];
    const score = calculateRiskScore(evts);
    const tier = getRiskTier(score);

    const sentEvt = evts.find((e) => e.action === "sent");
    const firstAction = evts.find((e) => e.action !== "sent");
    const timeToActionMinutes =
      sentEvt && firstAction
        ? Math.max(
            0,
            Math.round(
              (firstAction.createdAt.getTime() - sentEvt.createdAt.getTime()) /
                60_000,
            ),
          )
        : null;

    return {
      employeeId: emp.employeeId,
      name: emp.name,
      email: emp.email,
      department: emp.department,
      role: emp.role,
      score,
      tier,
      tierLabel: getRiskTierLabel(tier),
      timeToActionMinutes,
    };
  });

  const credentialFails = entries.filter((entry) => {
    const evts = eventsByEmployee.get(entry.employeeId) ?? [];
    return evts.some(
      (e) =>
        e.action === "credential_attempted" ||
        e.action === "credentials_submitted",
    );
  }).length;
  const total = entries.length;
  const templateSuccessRate =
    total > 0 ? Math.round((credentialFails / total) * 100) : 0;

  const departmentScores = getDepartmentScores(
    empRows.map((row) => ({ id: row.employeeId, department: row.department })),
    eventRows,
    templateName,
  );

  return {
    campaign: {
      id: campaign.id,
      name: campaign.name,
    },
    templateName,
    templateSuccessRate,
    entries,
    departmentScores,
  };
}
