"use client";

import type { TimelinePoint } from "@/lib/db/queries/analytics";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface Props {
  data: TimelinePoint[];
}

const LINES = [
  { key: "opens", label: "Opens", color: "#5645d4" },
  { key: "clicks", label: "Clicks", color: "#dd5b00" },
  { key: "compromises", label: "Compromises", color: "#e03131" },
  { key: "reports", label: "Reports", color: "#1aae39" },
] as const;

interface TooltipProps {
  active?: boolean;
  label?: number;
  payload?: Array<{ name: string; value: number; color: string }>;
}

function CustomTooltip({ active, label, payload }: TooltipProps) {
  if (!active || !payload?.length) return null;

  return (
    <div
      className="rounded-[10px] border px-4 py-3 text-[13px] shadow-lg"
      style={{
        backgroundColor: "var(--ds-canvas)",
        borderColor: "var(--ds-hairline-strong)",
        color: "var(--ds-ink)",
      }}
    >
      <p className="font-[600] mb-2" style={{ color: "var(--ds-steel)" }}>
        {typeof label === "number"
          ? label < 24
            ? `${label}h after launch`
            : `Day ${Math.floor(label / 24)} +${label % 24}h`
          : ""}
      </p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center gap-2">
          <span
            className="inline-block size-2 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span style={{ color: "var(--ds-steel)" }}>{entry.name}:</span>
          <strong style={{ color: "var(--ds-ink)" }}>{entry.value}</strong>
        </div>
      ))}
    </div>
  );
}

export function TimelineChart({ data }: Props) {
  if (data.length === 0) {
    return (
      <div
        className="flex items-center justify-center h-56 rounded-[8px] text-[14px]"
        style={{
          backgroundColor: "var(--ds-surface)",
          color: "var(--ds-steel)",
        }}
      >
        No events tracked yet
      </div>
    );
  }

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 4, right: 16, bottom: 4, left: 0 }}
        >
          <CartesianGrid
            stroke="var(--ds-hairline)"
            strokeDasharray="3 3"
          />
          <XAxis
            dataKey="hourOffset"
            tick={{ fontSize: 12, fill: "var(--ds-steel)" }}
            tickLine={false}
            axisLine={{ stroke: "var(--ds-hairline)" }}
            tickFormatter={(v) => `${v}h`}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fontSize: 12, fill: "var(--ds-steel)" }}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: 12, color: "var(--ds-steel)" }}
          />
          {LINES.map(({ key, label, color }) => (
            <Line
              key={key}
              type="monotone"
              dataKey={key}
              name={label}
              stroke={color}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 0 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
