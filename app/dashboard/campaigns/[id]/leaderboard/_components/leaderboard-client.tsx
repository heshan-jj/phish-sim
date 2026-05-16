"use client";

import { useMemo, useState } from "react";
import type { LeaderboardEntry } from "@/lib/db/queries/leaderboard";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Shield, AlertTriangle, Skull } from "lucide-react";
import { cn } from "@/lib/utils";

type SortMode = "score" | "department" | "time";

interface Props {
  entries: LeaderboardEntry[];
  templateName: string;
  templateSuccessRate: number;
}

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
    .slice(0, 3);
}

const TIER_STYLES = {
  champion: {
    border: "#1aae39",
    bg: "#f0faf3",
    icon: Shield,
    iconColor: "#1aae39",
  },
  "at-risk": {
    border: "#dd5b00",
    bg: "#fff8f0",
    icon: AlertTriangle,
    iconColor: "#dd5b00",
  },
  compromised: {
    border: "#e03131",
    bg: "#fef5f7",
    icon: Skull,
    iconColor: "#e03131",
  },
} as const;

function formatTimeToAction(minutes: number | null): string {
  if (minutes === null) return "No action yet";
  if (minutes < 60) return `${minutes}m to first action`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m to first action` : `${h}h to first action`;
}

function SortButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-[8px] px-3 py-1.5 text-[13px] font-[500] transition-colors",
        active
          ? "text-[var(--ds-ink)]"
          : "text-[var(--ds-steel)] hover:text-[var(--ds-ink)]",
      )}
      style={
        active
          ? {
              backgroundColor: "var(--ds-canvas)",
              border: "1px solid var(--ds-hairline-strong)",
            }
          : undefined
      }
    >
      {children}
    </button>
  );
}

export function LeaderboardClient({
  entries,
  templateName,
  templateSuccessRate,
}: Props) {
  const [sortMode, setSortMode] = useState<SortMode>("score");
  const [anonymous, setAnonymous] = useState(false);

  const sorted = useMemo(() => {
    const rows = [...entries];

    switch (sortMode) {
      case "score":
        rows.sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));
        break;
      case "department":
        rows.sort((a, b) => {
          const deptCmp = (a.department ?? "Unknown").localeCompare(
            b.department ?? "Unknown",
          );
          if (deptCmp !== 0) return deptCmp;
          return b.score - a.score;
        });
        break;
      case "time":
        rows.sort((a, b) => {
          const aTime = a.timeToActionMinutes ?? Number.POSITIVE_INFINITY;
          const bTime = b.timeToActionMinutes ?? Number.POSITIVE_INFINITY;
          return aTime - bTime || b.score - a.score;
        });
        break;
    }

    return rows;
  }, [entries, sortMode]);

  return (
    <div className="flex flex-col gap-8">
      <Card
        className="px-6 py-5"
        style={{
          borderColor: "var(--ds-hairline)",
          background:
            "linear-gradient(135deg, var(--ds-canvas) 0%, var(--ds-surface) 100%)",
        }}
      >
        <p className="text-[14px] leading-relaxed" style={{ color: "var(--ds-charcoal)" }}>
          <span className="font-[600]" style={{ color: "var(--ds-ink)" }}>
            Most dangerous template:
          </span>{" "}
          {templateName} —{" "}
          <span className="font-[600]" style={{ color: "#e03131" }}>
            {templateSuccessRate}%
          </span>{" "}
          success rate
        </p>
        <p className="text-[12px] mt-1" style={{ color: "var(--ds-steel)" }}>
          Share of recipients who submitted credentials during this campaign.
        </p>
      </Card>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div
          className="inline-flex items-center gap-1 rounded-[10px] p-1"
          style={{ backgroundColor: "var(--ds-surface)" }}
        >
          <SortButton active={sortMode === "score"} onClick={() => setSortMode("score")}>
            By score
          </SortButton>
          <SortButton
            active={sortMode === "department"}
            onClick={() => setSortMode("department")}
          >
            By department
          </SortButton>
          <SortButton active={sortMode === "time"} onClick={() => setSortMode("time")}>
            By time-to-action
          </SortButton>
        </div>

        <div className="flex items-center gap-2.5">
          <Switch
            id="anonymous-mode"
            checked={anonymous}
            onCheckedChange={setAnonymous}
          />
          <Label
            htmlFor="anonymous-mode"
            className="text-[13px] font-[500] cursor-pointer"
            style={{ color: "var(--ds-charcoal)" }}
          >
            Anonymous mode
          </Label>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sorted.map((entry) => {
          const styles = TIER_STYLES[entry.tier];
          const Icon = styles.icon;
          const displayName = anonymous ? getInitials(entry.name) : entry.name;

          return (
            <Card
              key={entry.employeeId}
              className="relative overflow-hidden p-5 transition-shadow hover:shadow-md"
              style={{
                borderWidth: 2,
                borderColor: styles.border,
                backgroundColor: styles.bg,
              }}
            >
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="min-w-0 flex-1">
                  <p
                    className="text-[15px] font-[600] truncate"
                    style={{ color: "var(--ds-ink)" }}
                  >
                    {displayName}
                  </p>
                  {!anonymous && (
                    <p
                      className="text-[12px] truncate mt-0.5"
                      style={{ color: "var(--ds-steel)" }}
                    >
                      {entry.email}
                    </p>
                  )}
                  {entry.department && (
                    <p
                      className="text-[11px] mt-1 font-[500] uppercase tracking-wide"
                      style={{ color: "var(--ds-stone)" }}
                    >
                      {entry.department}
                    </p>
                  )}
                </div>
                <Icon
                  className="size-6 shrink-0"
                  style={{ color: styles.iconColor }}
                  aria-hidden
                />
              </div>

              <div className="flex items-end justify-between gap-2">
                <div>
                  <p
                    className="text-[32px] font-[700] leading-none tabular-nums"
                    style={{ color: styles.iconColor }}
                  >
                    {entry.score}
                  </p>
                  <p className="text-[11px] mt-1" style={{ color: "var(--ds-steel)" }}>
                    risk score
                  </p>
                </div>
                <span
                  className="rounded-[6px] px-2 py-1 text-[11px] font-[600] text-right"
                  style={{
                    backgroundColor: "rgba(255,255,255,0.7)",
                    color: styles.iconColor,
                  }}
                >
                  {entry.tierLabel}
                </span>
              </div>

              <p
                className="text-[11px] mt-3 pt-3 border-t"
                style={{
                  color: "var(--ds-steel)",
                  borderColor: "rgba(0,0,0,0.06)",
                }}
              >
                {formatTimeToAction(entry.timeToActionMinutes)}
              </p>
            </Card>
          );
        })}
      </div>

      {sorted.length === 0 && (
        <Card className="p-12 text-center">
          <p className="text-[14px]" style={{ color: "var(--ds-steel)" }}>
            No employee results yet. Launch the campaign to populate the
            leaderboard.
          </p>
        </Card>
      )}
    </div>
  );
}