import { and, asc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  campaignEmployees,
  campaignEvents,
  campaigns,
  employees,
} from "@/lib/db/schema";

// ---------------------------------------------------------------------------
// Serialisable types (safe to pass from Server → Client components)
// ---------------------------------------------------------------------------

export type EmployeeRow = {
  employeeId: string;
  name: string;
  email: string;
  department: string | null;
  role: string | null;
  /** campaign_employees.status */
  status: string;
  hasOpened: boolean;
  hasClicked: boolean;
  /** Minutes from the 'sent' event to the first non-sent action. null if no action yet. */
  timeToActionMinutes: number | null;
  /** Human-readable badge label */
  displayAction: "Compromised" | "Reported" | "Clicked" | "Safe" | "Sent" | "Pending";
};

export type DeptRow = {
  department: string;
  total: number;
  compromised: number;
  reported: number;
  safe: number;
  clicked: number;
  /** 0-100 — percentage of employees who were compromised */
  vulnerabilityScore: number;
};

export type TimelinePoint = {
  /** Integer hours since campaign launch (or first sent event) */
  hourOffset: number;
  opens: number;
  clicks: number;
  compromises: number;
  reports: number;
};

export type CampaignAnalyticsData = {
  campaign: {
    id: string;
    name: string;
    status: string;
    launchTime: string | null; // ISO string
  };
  totalSent: number;
  openRate: number;
  clickRate: number;
  compromiseRate: number;
  reportRate: number;
  employees: EmployeeRow[];
  departments: DeptRow[];
  timeline: TimelinePoint[];
};

// ---------------------------------------------------------------------------
// Query
// ---------------------------------------------------------------------------

/**
 * Fetches all analytics data for a single campaign in two parallel DB round-
 * trips (campaign+employees join, and raw events) then processes everything in
 * memory. This keeps the network surface minimal while still being flexible
 * for the per-employee and timeline breakdowns.
 */
export async function getCampaignAnalytics(
  campaignId: string,
): Promise<CampaignAnalyticsData | null> {
  const [campaignRows, empRows, eventRows] = await Promise.all([
    db.select().from(campaigns).where(eq(campaigns.id, campaignId)).limit(1),

    // Pivot to campaign_events as the source so employees who have events
    // but no campaign_employees record (e.g. clicked but not compromised)
    // are still included. LEFT JOIN campaign_employees for their status.
    db
      .selectDistinct({
        employeeId: employees.id,
        status: campaignEmployees.status,
        name: employees.name,
        email: employees.email,
        department: employees.department,
        role: employees.role,
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
      .select({
        employeeId: campaignEvents.employeeId,
        action: campaignEvents.action,
        createdAt: campaignEvents.createdAt,
      })
      .from(campaignEvents)
      .where(eq(campaignEvents.campaignId, campaignId))
      .orderBy(asc(campaignEvents.createdAt)),
  ]);

  if (!campaignRows[0]) return null;

  const campaign = campaignRows[0];

  // --- Group events by employee -----------------------------------------
  const eventsByEmployee = new Map<
    string,
    Array<{ action: string; createdAt: Date }>
  >();
  for (const evt of eventRows) {
    const arr = eventsByEmployee.get(evt.employeeId) ?? [];
    arr.push({ action: evt.action, createdAt: evt.createdAt });
    eventsByEmployee.set(evt.employeeId, arr);
  }

  // --- Determine campaign launch time ----------------------------------
  const firstSent = eventRows.find((e) => e.action === "sent");
  const launchTime: Date | null =
    campaign.schedule ?? firstSent?.createdAt ?? null;

  // --- Build per-employee rows -----------------------------------------
  let opens = 0;
  let clicks = 0;

  const employeeRows: EmployeeRow[] = empRows.map((emp) => {
    const evts = eventsByEmployee.get(emp.employeeId) ?? [];
    const sentEvt = evts.find((e) => e.action === "sent");
    const firstAction = evts.find((e) => e.action !== "sent");

    const hasOpened = evts.some((e) => e.action === "email_opened");
    const hasClicked = evts.some((e) => e.action === "link_clicked");

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

    // status is null when there is no campaign_employees record yet
    const status = emp.status ?? (sentEvt ? "sent" : "pending");

    let displayAction: EmployeeRow["displayAction"] = "Pending";
    if (status === "compromised") displayAction = "Compromised";
    else if (status === "reported") displayAction = "Reported";
    else if (status === "safe") displayAction = "Safe";
    else if (hasClicked) displayAction = "Clicked";
    else if (sentEvt) displayAction = "Sent";

    if (hasOpened) opens++;
    if (hasClicked) clicks++;

    return {
      employeeId: emp.employeeId,
      name: emp.name,
      email: emp.email,
      department: emp.department,
      role: emp.role,
      status,
      hasOpened,
      hasClicked,
      timeToActionMinutes,
      displayAction,
    };
  });

  const compromises = employeeRows.filter((e) => e.status === "compromised").length;
  const reports = employeeRows.filter((e) => e.status === "reported").length;
  // Deduplicate: count each employee once (selectDistinct handles DB-level dedup,
  // but guard against any edge-case duplicates from the join)
  const uniqueIds = new Set(employeeRows.map((e) => e.employeeId));
  const totalSent = uniqueIds.size;

  const pct = (n: number) =>
    totalSent > 0 ? Math.round((n / totalSent) * 100) : 0;

  // --- Department breakdown --------------------------------------------
  const deptMap = new Map<
    string,
    {
      total: number;
      compromised: number;
      reported: number;
      safe: number;
      clicked: number;
    }
  >();

  for (const emp of employeeRows) {
    const dept = emp.department ?? "Unknown";
    const s = deptMap.get(dept) ?? {
      total: 0,
      compromised: 0,
      reported: 0,
      safe: 0,
      clicked: 0,
    };
    s.total++;
    if (emp.status === "compromised") s.compromised++;
    else if (emp.status === "reported") s.reported++;
    else if (emp.status === "safe") s.safe++;
    if (emp.hasClicked) s.clicked++;
    deptMap.set(dept, s);
  }

  const departments: DeptRow[] = Array.from(deptMap.entries())
    .map(([dept, s]) => ({
      department: dept,
      ...s,
      vulnerabilityScore: s.total > 0 ? Math.round((s.compromised / s.total) * 100) : 0,
    }))
    .sort((a, b) => b.vulnerabilityScore - a.vulnerabilityScore);

  // --- Timeline (cumulative hourly buckets) ----------------------------
  const timeline = buildTimeline(eventRows, launchTime);

  return {
    campaign: {
      id: campaign.id,
      name: campaign.name,
      status: campaign.status,
      launchTime: launchTime?.toISOString() ?? null,
    },
    totalSent,
    openRate: pct(opens),
    clickRate: pct(clicks),
    compromiseRate: pct(compromises),
    reportRate: pct(reports),
    employees: employeeRows,
    departments,
    timeline,
  };
}

// ---------------------------------------------------------------------------
// Timeline builder
// ---------------------------------------------------------------------------

function buildTimeline(
  eventRows: Array<{ employeeId: string; action: string; createdAt: Date }>,
  launchTime: Date | null,
): TimelinePoint[] {
  if (eventRows.length === 0) return [];

  const base = launchTime ?? eventRows[0].createdAt;

  const maxHour = Math.ceil(
    eventRows.reduce((max, e) => {
      const h = (e.createdAt.getTime() - base.getTime()) / 3_600_000;
      return Math.max(max, h);
    }, 0),
  );

  const cappedMax = Math.min(maxHour, 72);
  const points: TimelinePoint[] = [];

  for (let h = 0; h <= cappedMax; h++) {
    const cutoff = new Date(base.getTime() + h * 3_600_000);
    const past = eventRows.filter((e) => e.createdAt <= cutoff);

    const openedSet = new Set<string>();
    const clickedSet = new Set<string>();
    const compromisedSet = new Set<string>();
    const reportedSet = new Set<string>();

    for (const e of past) {
      if (e.action === "email_opened") openedSet.add(e.employeeId);
      if (e.action === "link_clicked") clickedSet.add(e.employeeId);
      if (
        e.action === "credential_attempted" ||
        e.action === "credentials_submitted"
      )
        compromisedSet.add(e.employeeId);
      if (e.action === "reported") reportedSet.add(e.employeeId);
    }

    points.push({
      hourOffset: h,
      opens: openedSet.size,
      clicks: clickedSet.size,
      compromises: compromisedSet.size,
      reports: reportedSet.size,
    });
  }

  return points;
}
