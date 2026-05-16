import { and, asc, eq } from "drizzle-orm";
import { getTemplateDisplayName } from "@/lib/campaign-templates";
import {
  calculateRiskScore,
  getDepartmentScores,
  getRiskTier,
  getRiskTierLabel,
  type DepartmentScore,
  type RiskTier,
} from "@/lib/scoring";
import { db } from "@/lib/db";
import {
  campaignEmployees,
  campaignEvents,
  campaigns,
  employees,
} from "@/lib/db/schema";
import type { CampaignEvent } from "@/types";

export type { DepartmentScore };

/** Full per-employee leaderboard record, including action history and display helpers. */
export type EmployeeScore = {
  employeeId: string;
  name: string;
  email: string;
  initials: string;
  department: string | null;
  role: string | null;
  score: number;
  tier: RiskTier;
  tierLabel: string;
  actions: string[];
  timeToActionMinutes: number | null;
};

/** @deprecated Use EmployeeScore */
export type LeaderboardEntry = EmployeeScore;

export type LeaderboardData = {
  campaign: {
    id: string;
    name: string;
    status: string;
  };
  templateName: string;
  /** Percentage of employees who submitted credentials. */
  compromiseRate: number;
  templateSuccessRate: number;
  orgAvgScore: number;
  employees: EmployeeScore[];
  /** @deprecated Use employees */
  entries: EmployeeScore[];
  departments: DepartmentScore[];
  /** @deprecated Use departments */
  departmentScores: DepartmentScore[];
};

export async function getLeaderboardData(
  campaignId: string,
): Promise<LeaderboardData | null> {
  return getCampaignLeaderboard(campaignId);
}

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

  const employeeScores: EmployeeScore[] = empRows.map((emp) => {
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

    const initials = emp.name
      .split(/\s+/)
      .filter(Boolean)
      .map((p) => p[0]?.toUpperCase() ?? "")
      .join("")
      .slice(0, 3);

    return {
      employeeId: emp.employeeId,
      name: emp.name,
      email: emp.email,
      initials,
      department: emp.department,
      role: emp.role,
      score,
      tier,
      tierLabel: getRiskTierLabel(tier),
      actions: evts.map((e) => e.action),
      timeToActionMinutes,
    };
  });

  const credentialFails = employeeScores.filter((entry) => {
    const evts = eventsByEmployee.get(entry.employeeId) ?? [];
    return evts.some(
      (e) =>
        e.action === "credential_attempted" ||
        e.action === "credentials_submitted",
    );
  }).length;
  const total = employeeScores.length;
  const compromiseRate =
    total > 0 ? Math.round((credentialFails / total) * 100) : 0;

  const orgAvgScore =
    total > 0
      ? Math.round(
          employeeScores.reduce((sum, e) => sum + e.score, 0) / total,
        )
      : 100;

  const departmentScores = getDepartmentScores(
    empRows.map((row) => ({ id: row.employeeId, department: row.department })),
    eventRows,
    templateName,
  );

  return {
    campaign: {
      id: campaign.id,
      name: campaign.name,
      status: campaign.status,
    },
    templateName,
    compromiseRate,
    templateSuccessRate: compromiseRate,
    orgAvgScore,
    employees: employeeScores,
    entries: employeeScores,
    departments: departmentScores,
    departmentScores,
  };
}
