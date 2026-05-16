/**
 * @file lib/scoring.ts
 *
 * Pure risk-scoring functions for the phishing simulation platform.
 * All computation is side-effect-free and safe to run server-side.
 */

import type { CampaignEvent, Employee } from "@/types";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** How an employee's risk score maps to a display tier. */
export type RiskTier = "champion" | "at-risk" | "compromised";

/**
 * Aggregated security posture for a single department across one or more
 * campaigns. Suitable for leaderboard summary tables.
 */
export interface DepartmentScore {
  department: string;
  /** 0–100 mean risk score across all employees in this department. */
  avgScore: number;
  /** Number of employees who submitted credentials. */
  compromisedCount: number;
  /** Number of employees who reported the phishing attempt. */
  reportedCount: number;
  /**
   * Number of employees who neither got compromised nor reported —
   * they received the email but took no risky or aware action.
   */
  safeCount: number;
  /**
   * The campaign template that produced the highest compromise rate for
   * this department. Populated when `campaignTemplateMap` is provided to
   * `getDepartmentScores`; otherwise "—".
   */
  mostVulnerableTemplate: string;
}

/** Computed score record for a single employee — safe to pass to client components. */
export interface EmployeeScore {
  employeeId: string;
  /** Full name — hidden in anonymous mode, shown as initials instead. */
  name: string;
  /** Pre-computed "A.B." style initials for anonymous mode. */
  initials: string;
  email: string;
  department: string | null;
  role: string | null;
  /** 0–100 risk score. Higher is safer. */
  score: number;
  tier: RiskTier;
  /** Deduplicated list of action types this employee triggered. */
  actions: string[];
  /** ISO string of the first non-"sent" event, or null if none yet. */
  firstActionAt: string | null;
  /** Minutes between the "sent" event and the first action taken. */
  timeToActionMinutes: number | null;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/**
 * Point deltas applied for each action type.
 * Deductions are applied at most once per action type regardless of how many
 * times the same event appears (deduplication via Set).
 */
const SCORE_DELTA: Partial<Record<string, number>> = {
  email_opened: -5,
  link_clicked: -20,
  credential_attempted: -50,
  credentials_submitted: -50, // same severity as credential_attempted
  reported: +25,
};

/** Extra penalty when an employee answered a call AND submitted credentials. */
const CALL_CREDENTIAL_COMBO_PENALTY = -10;

// ---------------------------------------------------------------------------
// calculateRiskScore
// ---------------------------------------------------------------------------

/**
 * Computes a 0–100 risk score for a single employee from their event log.
 *
 * Scoring rules:
 * - Starts at 100 (perfect score).
 * - `email_opened`         → −5
 * - `link_clicked`         → −20
 * - `credential_attempted` → −50  (deduplicated with `credentials_submitted`)
 * - `reported`             → +25  (capped at 100)
 * - `call_answered` + any credential event → additional −10
 * - Result clamped to [0, 100].
 *
 * @param events - All `CampaignEvent` rows for a single employee.
 */
export function calculateRiskScore(events: CampaignEvent[]): number {
  const actions = new Set(events.map((e) => e.action));

  let score = 100;

  for (const [action, delta] of Object.entries(SCORE_DELTA)) {
    // credential_attempted and credentials_submitted share the same -50 bucket;
    // apply the penalty only once even if both events are present.
    if (action === "credentials_submitted" && actions.has("credential_attempted")) {
      continue;
    }
    if (actions.has(action)) score += delta ?? 0;
  }

  // Combo penalty: vishing call answered AND credentials submitted
  const hasCredential =
    actions.has("credential_attempted") || actions.has("credentials_submitted");
  if (actions.has("call_answered") && hasCredential) {
    score += CALL_CREDENTIAL_COMBO_PENALTY;
  }

  return Math.min(100, Math.max(0, score));
}

// ---------------------------------------------------------------------------
// getTier
// ---------------------------------------------------------------------------

/**
 * Maps a numeric risk score to its display tier.
 *
 * | Range  | Tier           | Visual cue              |
 * |--------|----------------|-------------------------|
 * | 75–100 | "champion"     | Green border + shield   |
 * | 40–74  | "at-risk"      | Amber border + warning  |
 * | 0–39   | "compromised"  | Red border + skull      |
 */
export function getTier(score: number): RiskTier {
  if (score >= 75) return "champion";
  if (score >= 40) return "at-risk";
  return "compromised";
}

// ---------------------------------------------------------------------------
// buildInitials
// ---------------------------------------------------------------------------

/** Converts "Alice Bob" → "A.B." */
function buildInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  return parts
    .filter(Boolean)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join(".")
    .concat(".");
}

// ---------------------------------------------------------------------------
// buildEmployeeScores
// ---------------------------------------------------------------------------

/**
 * Converts raw DB rows (employees + their events) into serialisable
 * `EmployeeScore` records ready to pass as Server → Client component props.
 *
 * @param employees - All employees who participated in the campaign.
 * @param events    - All events for the campaign (across all employees).
 */
export function buildEmployeeScores(
  employees: Pick<Employee, "id" | "name" | "email" | "department" | "role">[],
  events: CampaignEvent[],
): EmployeeScore[] {
  // Group events by employeeId
  const eventsByEmployee = new Map<string, CampaignEvent[]>();
  for (const evt of events) {
    const arr = eventsByEmployee.get(evt.employeeId) ?? [];
    arr.push(evt);
    eventsByEmployee.set(evt.employeeId, arr);
  }

  return employees.map((emp) => {
    const empEvents = eventsByEmployee.get(emp.id) ?? [];
    const score = calculateRiskScore(empEvents);

    const sentEvt = empEvents.find((e) => e.action === "sent");
    const firstAction = empEvents.find((e) => e.action !== "sent");

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
      employeeId: emp.id,
      name: emp.name,
      initials: buildInitials(emp.name),
      email: emp.email,
      department: emp.department,
      role: emp.role,
      score,
      tier: getTier(score),
      actions: [...new Set(empEvents.map((e) => e.action))],
      firstActionAt: firstAction?.createdAt.toISOString() ?? null,
      timeToActionMinutes,
    };
  });
}

// ---------------------------------------------------------------------------
// getDepartmentScores
// ---------------------------------------------------------------------------

/**
 * Aggregates per-department risk metrics from employee and event data.
 *
 * @param employees          - All employees who participated (any campaign).
 * @param events             - All events to analyse.
 * @param campaignTemplateMap - Optional map of `campaignId → template name`
 *                             used to populate `mostVulnerableTemplate`.
 *
 * @returns Array sorted ascending by `avgScore` (most dangerous first).
 */
export function getDepartmentScores(
  employees: Pick<Employee, "id" | "department">[],
  events: CampaignEvent[],
  campaignTemplateMap: Record<string, string> = {},
): DepartmentScore[] {
  // Build a lookup from employeeId → department
  const empDeptMap = new Map(employees.map((e) => [e.id, e.department ?? "Unknown"]));

  // Group events by employeeId
  const eventsByEmployee = new Map<string, CampaignEvent[]>();
  for (const evt of events) {
    const arr = eventsByEmployee.get(evt.employeeId) ?? [];
    arr.push(evt);
    eventsByEmployee.set(evt.employeeId, arr);
  }

  type DeptAccum = {
    scores: number[];
    compromisedCount: number;
    reportedCount: number;
    safeCount: number;
    /** campaignId → number of compromised employees from that campaign */
    templateCompromises: Map<string, number>;
    /** campaignId → total employees targeted by that campaign */
    templateTotals: Map<string, number>;
  };

  const deptMap = new Map<string, DeptAccum>();

  for (const [empId, empEvents] of eventsByEmployee.entries()) {
    const dept = empDeptMap.get(empId) ?? "Unknown";
    const score = calculateRiskScore(empEvents);
    const actionSet = new Set(empEvents.map((e) => e.action));

    const isCompromised =
      actionSet.has("credential_attempted") ||
      actionSet.has("credentials_submitted");
    const isReported = actionSet.has("reported");

    const campaignId = empEvents[0]?.campaignId;

    const d = deptMap.get(dept) ?? {
      scores: [],
      compromisedCount: 0,
      reportedCount: 0,
      safeCount: 0,
      templateCompromises: new Map(),
      templateTotals: new Map(),
    };

    d.scores.push(score);
    if (isCompromised) {
      d.compromisedCount++;
      if (campaignId) {
        d.templateCompromises.set(
          campaignId,
          (d.templateCompromises.get(campaignId) ?? 0) + 1,
        );
      }
    } else if (isReported) {
      d.reportedCount++;
    } else {
      d.safeCount++;
    }

    if (campaignId) {
      d.templateTotals.set(
        campaignId,
        (d.templateTotals.get(campaignId) ?? 0) + 1,
      );
    }

    deptMap.set(dept, d);
  }

  return Array.from(deptMap.entries())
    .map(([department, d]) => {
      // Find the campaign template with the highest compromise rate
      let mostVulnerableTemplate = "—";
      let bestRate = 0;
      for (const [cid, count] of d.templateCompromises.entries()) {
        const total = d.templateTotals.get(cid) ?? 1;
        const rate = count / total;
        if (rate > bestRate) {
          bestRate = rate;
          mostVulnerableTemplate = campaignTemplateMap[cid] ?? cid;
        }
      }

      const avgScore =
        d.scores.length > 0
          ? Math.round(d.scores.reduce((a, b) => a + b, 0) / d.scores.length)
          : 100;

      return {
        department,
        avgScore,
        compromisedCount: d.compromisedCount,
        reportedCount: d.reportedCount,
        safeCount: d.safeCount,
        mostVulnerableTemplate,
      } satisfies DepartmentScore;
    })
    .sort((a, b) => a.avgScore - b.avgScore); // most dangerous department first
}
