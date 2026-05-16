/**
 * @file lib/db/queries/leaderboard.ts
 *
 * Server-side data fetching for the campaign leaderboard page.
 * All score computation is delegated to `lib/scoring.ts`; this module
 * is responsible only for fetching and shaping raw DB rows.
 */

import { and, asc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { campaignEmployees, campaignEvents, campaigns, employees } from "@/lib/db/schema";
import {
  buildEmployeeScores,
  getDepartmentScores,
  type DepartmentScore,
  type EmployeeScore,
} from "@/lib/scoring";
import { getTemplateById } from "@/lib/campaign-templates";

// ---------------------------------------------------------------------------
// Public types (safe to pass Server → Client)
// ---------------------------------------------------------------------------

export type { EmployeeScore, DepartmentScore };

export interface LeaderboardData {
  campaign: {
    id: string;
    name: string;
    status: string;
  };
  /**
   * Name of the phishing template used for this campaign.
   * Derived from `campaigns.templateCategory` via the CAMPAIGN_TEMPLATES registry.
   */
  templateName: string;
  /**
   * Percentage of targeted employees who submitted credentials (0–100).
   * Used for "X% success rate" in the summary banner.
   */
  compromiseRate: number;
  /** Organisation-wide average risk score for this campaign (0–100). */
  orgAvgScore: number;
  /** Per-employee scored rows, sorted by score descending (safest first). */
  employees: EmployeeScore[];
  /** Per-department aggregates, sorted by avgScore ascending (most dangerous first). */
  departments: DepartmentScore[];
}

// ---------------------------------------------------------------------------
// Query
// ---------------------------------------------------------------------------

/**
 * Fetches all data needed to render the campaign leaderboard, computes risk
 * scores server-side, and returns fully serialisable props.
 *
 * Returns `null` when the campaign does not exist.
 */
export async function getLeaderboardData(
  campaignId: string,
): Promise<LeaderboardData | null> {
  const [campaignRows, empRows, eventRows] = await Promise.all([
    db.select().from(campaigns).where(eq(campaigns.id, campaignId)).limit(1),

    // Distinct employees who appear in events for this campaign.
    // LEFT JOIN campaign_employees to check compromised status.
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

    // All raw events for the campaign, ordered chronologically.
    db
      .select({
        id: campaignEvents.id,
        campaignId: campaignEvents.campaignId,
        employeeId: campaignEvents.employeeId,
        action: campaignEvents.action,
        metadata: campaignEvents.metadata,
        ip: campaignEvents.ip,
        userAgent: campaignEvents.userAgent,
        createdAt: campaignEvents.createdAt,
      })
      .from(campaignEvents)
      .where(eq(campaignEvents.campaignId, campaignId))
      .orderBy(asc(campaignEvents.createdAt)),
  ]);

  if (!campaignRows[0]) return null;

  const campaign = campaignRows[0];

  // Resolve template name from the CAMPAIGN_TEMPLATES registry.
  const templateName =
    getTemplateById(campaign.templateCategory)?.title ??
    campaign.templateCategory;

  // Shape employees for scoring helpers (only fields needed).
  const employeesForScoring = empRows.map((e) => ({
    id: e.employeeId,
    name: e.name,
    email: e.email,
    department: e.department,
    role: e.role,
  }));

  // Compute per-employee scores (server-side, pure).
  const employeeScores = buildEmployeeScores(employeesForScoring, eventRows);

  // Sort by score descending (safest / highest score first).
  employeeScores.sort((a, b) => b.score - a.score);

  // Compute department aggregates.
  const departmentScores = getDepartmentScores(
    empRows.map((e) => ({ id: e.employeeId, department: e.department })),
    eventRows,
    { [campaignId]: templateName },
  );

  // Organisation-wide average score.
  const orgAvgScore =
    employeeScores.length > 0
      ? Math.round(
          employeeScores.reduce((sum, e) => sum + e.score, 0) /
            employeeScores.length,
        )
      : 100;

  // Compromise rate = % of employees with credential_attempted / credentials_submitted.
  const compromisedCount = employeeScores.filter((e) =>
    e.actions.some(
      (a) => a === "credential_attempted" || a === "credentials_submitted",
    ),
  ).length;

  const compromiseRate =
    employeeScores.length > 0
      ? Math.round((compromisedCount / employeeScores.length) * 100)
      : 0;

  return {
    campaign: {
      id: campaign.id,
      name: campaign.name,
      status: campaign.status,
    },
    templateName,
    compromiseRate,
    orgAvgScore,
    employees: employeeScores,
    departments: departmentScores,
  };
}
