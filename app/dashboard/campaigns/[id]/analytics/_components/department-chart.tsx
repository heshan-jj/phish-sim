"use client";

import type { DeptRow } from "@/lib/db/queries/analytics";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  ResponsiveContainer,
} from "recharts";

interface Props {
  data: DeptRow[];
}

function scoreColor(score: number): string {
  if (score > 60) return "#e03131";
  if (score > 30) return "#dd5b00";
  return "#1aae39";
}

function scoreBg(score: number): string {
  if (score > 60) return "#fde0ec";
  if (score > 30) return "#ffe8d4";
  return "#d9f3e1";
}

interface TooltipProps {
  active?: boolean;
  payload?: Array<{ payload: DeptRow }>;
}

function CustomTooltip({ active, payload }: TooltipProps) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  const safe = d.total - d.compromised - d.reported - (d.clicked - d.compromised);

  return (
    <div
      className="rounded-[10px] border px-4 py-3 text-[13px] shadow-lg"
      style={{
        backgroundColor: "var(--ds-canvas)",
        borderColor: "var(--ds-hairline-strong)",
        color: "var(--ds-ink)",
      }}
    >
      <p className="font-[600] mb-2">{d.department}</p>
      <div className="flex flex-col gap-1" style={{ color: "var(--ds-steel)" }}>
        <span>
          <span style={{ color: "#e03131" }}>■</span> Compromised:{" "}
          <strong style={{ color: "var(--ds-ink)" }}>{d.compromised}</strong>
        </span>
        <span>
          <span style={{ color: "#1aae39" }}>■</span> Reported:{" "}
          <strong style={{ color: "var(--ds-ink)" }}>{d.reported}</strong>
        </span>
        <span>
          <span style={{ color: "var(--ds-muted)" }}>■</span> Safe:{" "}
          <strong style={{ color: "var(--ds-ink)" }}>{Math.max(0, safe)}</strong>
        </span>
        <span className="mt-1 pt-1" style={{ borderTop: "1px solid var(--ds-hairline)" }}>
          Vulnerability score:{" "}
          <strong style={{ color: scoreColor(d.vulnerabilityScore) }}>
            {d.vulnerabilityScore}%
          </strong>
        </span>
      </div>
    </div>
  );
}

export function DepartmentChart({ data }: Props) {
  if (data.length === 0) {
    return (
      <div
        className="flex items-center justify-center h-48 rounded-[8px] text-[14px]"
        style={{
          backgroundColor: "var(--ds-surface)",
          color: "var(--ds-steel)",
        }}
      >
        No department data yet
      </div>
    );
  }

  const chartHeight = Math.max(200, data.length * 48 + 40);

  return (
    <div className="w-full" style={{ height: chartHeight }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          layout="vertical"
          data={data}
          margin={{ top: 4, right: 24, bottom: 4, left: 0 }}
        >
          <CartesianGrid
            horizontal={false}
            stroke="var(--ds-hairline)"
            strokeDasharray="3 3"
          />
          <XAxis
            type="number"
            domain={[0, 100]}
            tickCount={6}
            tick={{ fontSize: 12, fill: "var(--ds-steel)" }}
            tickLine={false}
            axisLine={{ stroke: "var(--ds-hairline)" }}
            tickFormatter={(v) => `${v}%`}
          />
          <YAxis
            type="category"
            dataKey="department"
            width={120}
            tick={{ fontSize: 12, fill: "var(--ds-charcoal)" }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "var(--ds-surface)" }} />
          <Bar dataKey="vulnerabilityScore" radius={[0, 4, 4, 0]} barSize={20}>
            {data.map((entry, index) => (
              <Cell
                key={index}
                fill={scoreColor(entry.vulnerabilityScore)}
                fillOpacity={0.85}
                stroke={scoreBg(entry.vulnerabilityScore)}
                strokeWidth={0}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
