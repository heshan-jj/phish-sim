"use client";

import { useState, useMemo } from "react";
import {
  Shield,
  AlertTriangle,
  Skull,
  Eye,
  EyeOff,
  ArrowUpDown,
  Building2,
  Clock,
  Zap,
  MailOpen,
  MousePointerClick,
  Phone,
  Flag,
  KeyRound,
  TrendingDown,
} from "lucide-react";
import type { EmployeeScore, DepartmentScore } from "@/lib/db/queries/leaderboard";
import type { RiskTier } from "@/lib/scoring";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type SortMode = "score" | "department" | "time";

interface Props {
  campaign: { id: string; name: string; status: string };
  templateName: string;
  compromiseRate: number;
  orgAvgScore: number;
  employees: EmployeeScore[];
  departments: DepartmentScore[];
}

// ---------------------------------------------------------------------------
// Tier config
// ---------------------------------------------------------------------------

const TIER_CONFIG: Record<
  RiskTier,
  {
    label: string;
    borderColor: string;
    bgColor: string;
    badgeBg: string;
    badgeText: string;
    scoreColor: string;
    Icon: React.ElementType;
  }
> = {
  champion: {
    label: "Security Champion",
    borderColor: "#1aae39",
    bgColor: "#d9f3e1",
    badgeBg: "#d9f3e1",
    badgeText: "#0d6626",
    scoreColor: "#0d6626",
    Icon: Shield,
  },
  "at-risk": {
    label: "At Risk",
    borderColor: "#dd5b00",
    bgColor: "#fff4ec",
    badgeBg: "#ffe8d4",
    badgeText: "#7a2f00",
    scoreColor: "#9e3d00",
    Icon: AlertTriangle,
  },
  compromised: {
    label: "Compromised",
    borderColor: "#e03131",
    bgColor: "#fff5f5",
    badgeBg: "#fde0e0",
    badgeText: "#7a0000",
    scoreColor: "#b91c1c",
    Icon: Skull,
  },
};

// ---------------------------------------------------------------------------
// Action badge config
// ---------------------------------------------------------------------------

const ACTION_BADGES: Record<
  string,
  { label: string; Icon: React.ElementType; color: string }
> = {
  email_opened: { label: "Opened", Icon: MailOpen, color: "#5645d4" },
  link_clicked: { label: "Clicked", Icon: MousePointerClick, color: "#dd5b00" },
  credential_attempted: { label: "Credentials", Icon: KeyRound, color: "#e03131" },
  credentials_submitted: { label: "Credentials", Icon: KeyRound, color: "#e03131" },
  reported: { label: "Reported", Icon: Flag, color: "#1aae39" },
  call_answered: { label: "Call answered", Icon: Phone, color: "#7b3ff2" },
  landing_page_viewed: { label: "Landed", Icon: Eye, color: "#787671" },
  training_viewed: { label: "Trained", Icon: Zap, color: "#0075de" },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatTimeToAction(minutes: number | null): string {
  if (minutes === null) return "—";
  if (minutes < 1) return "< 1 min";
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

function dedupeActions(actions: string[]): string[] {
  // credential_attempted and credentials_submitted are the same intent — show once
  const seen = new Set<string>();
  const result: string[] = [];
  for (const a of actions) {
    const key = a === "credentials_submitted" ? "credential_attempted" : a;
    if (!seen.has(key)) {
      seen.add(key);
      result.push(a);
    }
  }
  return result;
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function ScoreRing({ score, tier }: { score: number; tier: RiskTier }) {
  const cfg = TIER_CONFIG[tier];
  const radius = 22;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - score / 100);

  return (
    <div className="relative size-14 shrink-0">
      <svg className="size-14 -rotate-90" viewBox="0 0 56 56">
        <circle
          cx="28"
          cy="28"
          r={radius}
          fill="none"
          stroke="var(--ds-hairline)"
          strokeWidth="5"
        />
        <circle
          cx="28"
          cy="28"
          r={radius}
          fill="none"
          stroke={cfg.borderColor}
          strokeWidth="5"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
        />
      </svg>
      <span
        className="absolute inset-0 flex items-center justify-center text-[13px] font-[700] tabular-nums"
        style={{ color: cfg.scoreColor }}
      >
        {score}
      </span>
    </div>
  );
}

function ActionBadge({ action }: { action: string }) {
  const cfg = ACTION_BADGES[action];
  if (!cfg) return null;
  const { label, Icon, color } = cfg;

  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-[500]"
      style={{
        backgroundColor: `${color}18`,
        color,
        border: `1px solid ${color}30`,
      }}
    >
      <Icon className="size-2.5" />
      {label}
    </span>
  );
}

function EmployeeCard({
  employee,
  anonymous,
}: {
  employee: EmployeeScore;
  anonymous: boolean;
}) {
  const cfg = TIER_CONFIG[employee.tier];
  const { Icon } = cfg;
  const visibleActions = dedupeActions(
    employee.actions.filter((a) => a !== "sent"),
  );

  return (
    <div
      className="rounded-[12px] border-2 p-4 flex flex-col gap-3 transition-shadow hover:shadow-md"
      style={{
        borderColor: cfg.borderColor,
        backgroundColor: "var(--ds-canvas)",
      }}
    >
      {/* Header row */}
      <div className="flex items-start gap-3">
        <ScoreRing score={employee.score} tier={employee.tier} />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <Icon
              className="size-3.5 shrink-0"
              style={{ color: cfg.borderColor }}
            />
            <span
              className="text-[11px] font-[600] uppercase tracking-wide"
              style={{ color: cfg.badgeText }}
            >
              {cfg.label}
            </span>
          </div>

          <p
            className="text-[15px] font-[600] leading-tight mt-0.5 truncate"
            style={{ color: "var(--ds-ink)" }}
          >
            {anonymous ? employee.initials : employee.name}
          </p>

          {employee.department && (
            <p
              className="text-[12px] mt-0.5 truncate"
              style={{ color: "var(--ds-steel)" }}
            >
              {employee.department}
              {employee.role ? ` · ${employee.role}` : ""}
            </p>
          )}
        </div>
      </div>

      {/* Action badges */}
      {visibleActions.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {visibleActions.map((a) => (
            <ActionBadge key={a} action={a} />
          ))}
        </div>
      )}

      {/* Time to action */}
      <div
        className="flex items-center gap-1.5 text-[12px]"
        style={{ color: "var(--ds-stone)" }}
      >
        <Clock className="size-3" />
        <span>Time to action: {formatTimeToAction(employee.timeToActionMinutes)}</span>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
  color,
}: {
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
}) {
  return (
    <div
      className="rounded-[12px] border p-4 flex flex-col gap-1"
      style={{
        backgroundColor: "var(--ds-canvas)",
        borderColor: "var(--ds-hairline)",
      }}
    >
      <p
        className="text-[11px] font-[500] uppercase tracking-wide"
        style={{ color: "var(--ds-steel)" }}
      >
        {label}
      </p>
      <p
        className="text-[26px] font-[700] leading-none tabular-nums"
        style={{ color: color ?? "var(--ds-ink)" }}
      >
        {value}
      </p>
      {sub && (
        <p className="text-[12px]" style={{ color: "var(--ds-stone)" }}>
          {sub}
        </p>
      )}
    </div>
  );
}

function DepartmentRow({ dept }: { dept: DepartmentScore }) {
  const barWidth = `${dept.avgScore}%`;
  const barColor =
    dept.avgScore >= 75 ? "#1aae39" : dept.avgScore >= 40 ? "#dd5b00" : "#e03131";

  return (
    <div className="flex items-center gap-4">
      <div className="w-32 shrink-0">
        <p className="text-[13px] font-[500] truncate" style={{ color: "var(--ds-ink)" }}>
          {dept.department}
        </p>
        <p className="text-[11px]" style={{ color: "var(--ds-stone)" }}>
          {dept.compromisedCount} compromised · {dept.reportedCount} reported
        </p>
      </div>
      <div className="flex-1">
        <div
          className="h-2 rounded-full overflow-hidden"
          style={{ backgroundColor: "var(--ds-hairline)" }}
        >
          <div
            className="h-full rounded-full transition-all"
            style={{ width: barWidth, backgroundColor: barColor }}
          />
        </div>
      </div>
      <span
        className="w-8 text-right text-[13px] font-[700] tabular-nums shrink-0"
        style={{ color: barColor }}
      >
        {dept.avgScore}
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main client component
// ---------------------------------------------------------------------------

export function LeaderboardClient({
  campaign,
  templateName,
  compromiseRate,
  orgAvgScore,
  employees,
  departments,
}: Props) {
  const [sortBy, setSortBy] = useState<SortMode>("score");
  const [anonymous, setAnonymous] = useState(false);

  const champions = employees.filter((e) => e.tier === "champion").length;
  const atRisk = employees.filter((e) => e.tier === "at-risk").length;
  const compromised = employees.filter((e) => e.tier === "compromised").length;

  const sorted = useMemo(() => {
    const copy = [...employees];
    if (sortBy === "score") {
      copy.sort((a, b) => b.score - a.score);
    } else if (sortBy === "department") {
      copy.sort((a, b) => {
        const deptA = a.department ?? "zzz";
        const deptB = b.department ?? "zzz";
        if (deptA !== deptB) return deptA.localeCompare(deptB);
        return b.score - a.score;
      });
    } else {
      // time-to-action: null (no action) sorts last
      copy.sort((a, b) => {
        if (a.timeToActionMinutes === null && b.timeToActionMinutes === null) return 0;
        if (a.timeToActionMinutes === null) return 1;
        if (b.timeToActionMinutes === null) return -1;
        return a.timeToActionMinutes - b.timeToActionMinutes;
      });
    }
    return copy;
  }, [employees, sortBy]);

  const SORT_OPTIONS: { mode: SortMode; label: string; Icon: React.ElementType }[] = [
    { mode: "score", label: "By score", Icon: ArrowUpDown },
    { mode: "department", label: "By department", Icon: Building2 },
    { mode: "time", label: "By time to action", Icon: Clock },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1
            className="text-[28px] font-[600] leading-[1.25] mb-1"
            style={{ color: "var(--ds-ink)" }}
          >
            Security Awareness Leaderboard
          </h1>
          <p className="text-[14px]" style={{ color: "var(--ds-steel)" }}>
            {campaign.name}
          </p>
        </div>

        {/* Anonymous toggle */}
        <button
          onClick={() => setAnonymous((v) => !v)}
          className="inline-flex items-center gap-2 rounded-[8px] border px-3 py-2 text-[13px] font-[500] transition-colors shrink-0 cursor-pointer"
          style={{
            borderColor: anonymous ? "var(--ds-primary)" : "var(--ds-hairline-strong)",
            color: anonymous ? "var(--ds-primary)" : "var(--ds-ink)",
            backgroundColor: anonymous ? "var(--ds-tint-lavender)" : "var(--ds-canvas)",
          }}
        >
          {anonymous ? (
            <EyeOff className="size-3.5" />
          ) : (
            <Eye className="size-3.5" />
          )}
          {anonymous ? "Showing initials" : "Anonymous mode"}
        </button>
      </div>

      {/* Summary banner */}
      <div
        className="rounded-[12px] border px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-2"
        style={{
          backgroundColor:
            compromiseRate >= 30 ? "var(--ds-tint-rose)" : "var(--ds-tint-mint)",
          borderColor: compromiseRate >= 30 ? "#e0313130" : "#1aae3930",
        }}
      >
        <TrendingDown
          className="size-4 shrink-0"
          style={{ color: compromiseRate >= 30 ? "#e03131" : "#0d6626" }}
        />
        <p
          className="text-[14px] font-[500]"
          style={{ color: compromiseRate >= 30 ? "#7a0000" : "#0d6626" }}
        >
          Most dangerous template:{" "}
          <span className="font-[700]">{templateName}</span>
          {" — "}
          <span className="font-[700]">{compromiseRate}%</span> success rate
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          label="Avg. risk score"
          value={orgAvgScore}
          sub="Organisation average"
          color={
            orgAvgScore >= 75
              ? "#0d6626"
              : orgAvgScore >= 40
                ? "#9e3d00"
                : "#b91c1c"
          }
        />
        <StatCard
          label="Champions"
          value={champions}
          sub="Score ≥ 75"
          color="#0d6626"
        />
        <StatCard
          label="At risk"
          value={atRisk}
          sub="Score 40–74"
          color="#9e3d00"
        />
        <StatCard
          label="Compromised"
          value={compromised}
          sub="Score < 40"
          color="#b91c1c"
        />
      </div>

      {/* Sort controls */}
      <div className="flex items-center gap-2 flex-wrap">
        <span
          className="text-[12px] font-[500] uppercase tracking-wide mr-1"
          style={{ color: "var(--ds-stone)" }}
        >
          Sort:
        </span>
        {SORT_OPTIONS.map(({ mode, label, Icon }) => (
          <button
            key={mode}
            onClick={() => setSortBy(mode)}
            className="inline-flex items-center gap-1.5 rounded-[8px] border px-3 py-1.5 text-[12px] font-[500] transition-colors cursor-pointer"
            style={{
              borderColor:
                sortBy === mode ? "var(--ds-primary)" : "var(--ds-hairline-strong)",
              color: sortBy === mode ? "var(--ds-primary)" : "var(--ds-ink)",
              backgroundColor:
                sortBy === mode ? "var(--ds-tint-lavender)" : "var(--ds-canvas)",
            }}
          >
            <Icon className="size-3" />
            {label}
          </button>
        ))}
      </div>

      {/* Employee cards grid */}
      {sorted.length === 0 ? (
        <div
          className="rounded-[12px] border py-16 text-center"
          style={{
            backgroundColor: "var(--ds-canvas)",
            borderColor: "var(--ds-hairline)",
          }}
        >
          <p className="text-[14px]" style={{ color: "var(--ds-steel)" }}>
            No employee data yet — results appear once emails are sent.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sorted.map((emp) => (
            <EmployeeCard key={emp.employeeId} employee={emp} anonymous={anonymous} />
          ))}
        </div>
      )}

      {/* Department breakdown */}
      {departments.length > 0 && (
        <div
          className="rounded-[12px] border overflow-hidden"
          style={{
            backgroundColor: "var(--ds-canvas)",
            borderColor: "var(--ds-hairline)",
          }}
        >
          <div
            className="px-5 py-4 border-b"
            style={{ borderColor: "var(--ds-hairline)" }}
          >
            <h2
              className="text-[15px] font-[600]"
              style={{ color: "var(--ds-ink)" }}
            >
              Department breakdown
            </h2>
            <p className="text-[12px] mt-0.5" style={{ color: "var(--ds-steel)" }}>
              Average risk score per department — lower is more vulnerable.
            </p>
          </div>
          <div className="px-5 py-4 flex flex-col gap-4">
            {departments.map((dept) => (
              <DepartmentRow key={dept.department} dept={dept} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
