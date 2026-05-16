import type { CampaignEvent, Employee } from "@/types";

export type DepartmentScore = {
  department: string;
  avgScore: number;
  compromisedCount: number;
  reportedCount: number;
  safeCount: number;
  mostVulnerableTemplate: string | null;
};

export type RiskTier = "champion" | "at_risk" | "compromised";

const SCORE_START = 100;
const PENALTY_EMAIL_OPENED = 5;
const PENALTY_LINK_CLICKED = 20;
const PENALTY_CREDENTIAL = 50;
const BONUS_REPORTED = 25;
const PENALTY_CALL_AND_CREDENTIAL = 10;

/**
 * Computes a 0–100 security awareness score from campaign events.
 * Higher is better. Reported adds +25 before the final cap at 100.
 */
export function calculateRiskScore(events: CampaignEvent[]): number {
  const actions = new Set(events.map((e) => e.action));

  let score = SCORE_START;

  if (actions.has("email_opened")) score -= PENALTY_EMAIL_OPENED;
  if (actions.has("link_clicked")) score -= PENALTY_LINK_CLICKED;
  if (actions.has("credential_attempted")) score -= PENALTY_CREDENTIAL;
  if (actions.has("reported")) score += BONUS_REPORTED;
  if (actions.has("call_answered") && actions.has("credential_attempted")) {
    score -= PENALTY_CALL_AND_CREDENTIAL;
  }

  return Math.max(0, Math.min(100, score));
}

export function getRiskTier(score: number): RiskTier {
  if (score >= 75) return "champion";
  if (score >= 40) return "at_risk";
  return "compromised";
}

export function getRiskTierLabel(tier: RiskTier): string {
  switch (tier) {
    case "champion":
      return "Security Champion";
    case "at_risk":
      return "At Risk";
    case "compromised":
      return "Compromised";
  }
}

function groupEventsByEmployee(
  events: CampaignEvent[],
): Map<string, CampaignEvent[]> {
  const map = new Map<string, CampaignEvent[]>();
  for (const evt of events) {
    const list = map.get(evt.employeeId) ?? [];
    list.push(evt);
    map.set(evt.employeeId, list);
  }
  return map;
}

function isCompromised(events: CampaignEvent[]): boolean {
  return events.some(
    (e) =>
      e.action === "credential_attempted" ||
      e.action === "credentials_submitted",
  );
}

function isReported(events: CampaignEvent[]): boolean {
  return events.some((e) => e.action === "reported");
}

/**
 * Aggregates per-department risk metrics for leaderboard and analytics views.
 */
export function getDepartmentScores(
  employees: Pick<Employee, "id" | "department">[],
  events: CampaignEvent[],
  templateName: string | null = null,
): DepartmentScore[] {
  const eventsByEmployee = groupEventsByEmployee(events);

  const deptBuckets = new Map<
    string,
    {
      scores: number[];
      compromisedCount: number;
      reportedCount: number;
      safeCount: number;
    }
  >();

  for (const emp of employees) {
    const dept = emp.department?.trim() || "Unknown";
    const empEvents = eventsByEmployee.get(emp.id) ?? [];
    const score = calculateRiskScore(empEvents);
    const compromised = isCompromised(empEvents);
    const reported = isReported(empEvents);

    const bucket = deptBuckets.get(dept) ?? {
      scores: [],
      compromisedCount: 0,
      reportedCount: 0,
      safeCount: 0,
    };

    bucket.scores.push(score);
    if (compromised) bucket.compromisedCount++;
    else if (reported) bucket.reportedCount++;
    else if (score >= 75) bucket.safeCount++;

    deptBuckets.set(dept, bucket);
  }

  const results: DepartmentScore[] = Array.from(deptBuckets.entries()).map(
    ([department, bucket]) => {
      const avgScore =
        bucket.scores.length > 0
          ? Math.round(
              bucket.scores.reduce((sum, s) => sum + s, 0) /
                bucket.scores.length,
            )
          : 100;

      return {
        department,
        avgScore,
        compromisedCount: bucket.compromisedCount,
        reportedCount: bucket.reportedCount,
        safeCount: bucket.safeCount,
        mostVulnerableTemplate:
          bucket.compromisedCount > 0 ? templateName : null,
      };
    },
  );

  return results.sort((a, b) => a.avgScore - b.avgScore);
}
