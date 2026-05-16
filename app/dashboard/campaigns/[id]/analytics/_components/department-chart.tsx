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
  Legend,
  ResponsiveContainer,
} from "recharts";

// Hardcoded hex — CSS vars don't work in SVG fill/stroke attrs
const COLOR = {
  grid: "#e5e3df",
  axis: "#787671",
  cursor: "#f6f5f4",
  click: "#dd5b00",
} as const;

interface Props {
  data: DeptRow[];
}

function scoreColor(score: number): string {
  if (score > 60) return "#e03131";
  if (score > 30) return "#dd5b00";
  return "#1aae39";
}

interface TooltipPayload {
  active?: boolean;
  payload?: Array<{ payload: DeptRow & { clickRate: number } }>;
}

function CustomTooltip({ active, payload }: TooltipPayload) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  const clickedOnly = Math.max(0, d.clicked - d.compromised);
  const safe = Math.max(0, d.total - d.compromised - d.reported - clickedOnly);

  return (
    <div
      className="rounded-[10px] border px-4 py-3 text-[13px] shadow-lg"
      style={{
        backgroundColor: "var(--ds-canvas)",
        borderColor: "var(--ds-hairline-strong)",
        color: "var(--ds-ink)",
        minWidth: 200,
      }}
    >
      <p className="font-[600] mb-2">{d.department}</p>
      <div className="flex flex-col gap-1" style={{ color: "var(--ds-steel)" }}>
        <span>
          <span style={{ color: "#e03131" }}>■</span> Compromised:{" "}
          <strong style={{ color: "var(--ds-ink)" }}>{d.compromised}</strong>
          <span className="ml-1 opacity-60">({d.vulnerabilityScore}%)</span>
        </span>
        <span>
          <span style={{ color: "#dd5b00" }}>■</span> Clicked (not compromised):{" "}
          <strong style={{ color: "var(--ds-ink)" }}>{clickedOnly}</strong>
        </span>
        <span>
          <span style={{ color: "#1aae39" }}>■</span> Reported:{" "}
          <strong style={{ color: "var(--ds-ink)" }}>{d.reported}</strong>
        </span>
        <span>
          <span style={{ color: "#bbb8b1" }}>■</span> Safe:{" "}
          <strong style={{ color: "var(--ds-ink)" }}>{safe}</strong>
        </span>
        <div
          className="mt-1.5 pt-1.5 flex justify-between"
          style={{ borderTop: "1px solid var(--ds-hairline)" }}
        >
          <span>Total sent:</span>
          <strong style={{ color: "var(--ds-ink)" }}>{d.total}</strong>
        </div>
      </div>
    </div>
  );
}

export function DepartmentChart({ data }: Props) {
  if (data.length === 0) {
    return (
      <div
        className="flex items-center justify-center h-48 rounded-[8px] text-[14px]"
        style={{ backgroundColor: "var(--ds-surface)", color: "var(--ds-steel)" }}
      >
        No department data yet
      </div>
    );
  }

  // Add click rate (all who clicked, including those who were compromised)
  const chartData = data.map((d) => ({
    ...d,
    clickRate: d.total > 0 ? Math.round((d.clicked / d.total) * 100) : 0,
  }));

  // Two bars per department — leave enough vertical space per row
  const chartHeight = Math.max(240, data.length * 68 + 60);

  return (
    <div className="w-full" style={{ height: chartHeight }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          layout="vertical"
          data={chartData}
          barCategoryGap="35%"
          barGap={3}
          margin={{ top: 4, right: 24, bottom: 4, left: 0 }}
        >
          <CartesianGrid
            horizontal={false}
            stroke={COLOR.grid}
            strokeDasharray="3 3"
          />
          <XAxis
            type="number"
            domain={[0, 100]}
            tickCount={6}
            tick={{ fontSize: 12, fill: COLOR.axis }}
            tickLine={false}
            axisLine={{ stroke: COLOR.grid }}
            tickFormatter={(v: number) => `${v}%`}
          />
          <YAxis
            type="category"
            dataKey="department"
            width={120}
            tick={{ fontSize: 12, fill: "#37352f" }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ fill: COLOR.cursor }}
          />
          <Legend
            iconType="square"
            iconSize={10}
            wrapperStyle={{ fontSize: 12, color: "#787671", paddingTop: 10 }}
          />

          {/* Click rate bar — amber, shown first (below in grouped layout) */}
          <Bar
            dataKey="clickRate"
            name="Click rate %"
            barSize={12}
            fill={COLOR.click}
            fillOpacity={0.65}
            radius={[0, 4, 4, 0]}
          />

          {/* Compromise rate bar — color-coded per threshold; fill sets the legend swatch */}
          <Bar
            dataKey="vulnerabilityScore"
            name="Compromise rate %"
            barSize={12}
            radius={[0, 4, 4, 0]}
            fill="#e03131"
          >
            {chartData.map((entry, index) => (
              <Cell
                key={index}
                fill={scoreColor(entry.vulnerabilityScore)}
                fillOpacity={0.9}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
