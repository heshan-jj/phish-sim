import { notFound } from "next/navigation";
import { getCampaignAnalytics } from "@/lib/db/queries/analytics";
import { Card } from "@/components/ui/card";
import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";
import { DepartmentChart } from "./department-chart";
import { TimelineChart } from "./timeline-chart";
import { EmployeeTable } from "./employee-table";
import { RealtimeUpdater } from "./realtime-updater";
import { AiSummaryCard } from "./ai-summary-card";
import { db } from "@/lib/db";
import { campaigns } from "@/lib/db/schema";
import type { CampaignSettings } from "@/lib/campaign-settings";
import { eq } from "drizzle-orm";

interface Props {
  campaignId: string;
}

// ---------------------------------------------------------------------------
// Stat card trend helpers
// ---------------------------------------------------------------------------

type Trend = "up-bad" | "up-good" | "down-bad" | "down-good" | "neutral";

function getTrend(metric: string, value: number): Trend {
  switch (metric) {
    case "openRate":
      if (value >= 60) return "up-bad";
      if (value <= 20) return "down-bad";
      return "neutral";
    case "clickRate":
      if (value >= 40) return "up-bad";
      if (value <= 10) return "down-good";
      return "neutral";
    case "compromiseRate":
      if (value >= 30) return "up-bad";
      if (value <= 10) return "down-good";
      return "neutral";
    case "reportRate":
      if (value >= 25) return "up-good";
      if (value <= 5) return "down-bad";
      return "neutral";
    default:
      return "neutral";
  }
}

function TrendArrow({ trend }: { trend: Trend }) {
  if (trend === "neutral")
    return <Minus className="size-4" style={{ color: "var(--ds-stone)" }} />;

  const isUp = trend.startsWith("up");
  const isGood = trend.endsWith("good");
  const color = isGood ? "#1aae39" : "#e03131";

  return isUp ? (
    <ArrowUpRight className="size-4" style={{ color }} />
  ) : (
    <ArrowDownRight className="size-4" style={{ color }} />
  );
}

interface StatCardProps {
  label: string;
  value: string | number;
  subLabel?: string;
  metric?: string;
  numericValue?: number;
}

function StatCard({ label, value, subLabel, metric, numericValue }: StatCardProps) {
  const trend =
    metric && numericValue !== undefined
      ? getTrend(metric, numericValue)
      : "neutral";

  const isGoodTrend = trend.endsWith("good");
  const isBadTrend = trend.endsWith("bad");
  const accentColor = isBadTrend ? "#e03131" : isGoodTrend ? "#1aae39" : undefined;

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-2 mb-3">
        <p
          className="text-[12px] font-[500] uppercase tracking-wide leading-tight"
          style={{ color: "var(--ds-steel)" }}
        >
          {label}
        </p>
        {metric && <TrendArrow trend={trend} />}
      </div>
      <p
        className="text-[30px] font-[600] leading-none tabular-nums"
        style={{ color: accentColor ?? "var(--ds-ink)" }}
      >
        {value}
      </p>
      {subLabel && (
        <p className="text-[12px] mt-1.5" style={{ color: "var(--ds-steel)" }}>
          {subLabel}
        </p>
      )}
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Section wrapper
// ---------------------------------------------------------------------------

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="overflow-hidden">
      <div
        className="px-6 py-5 border-b"
        style={{ borderColor: "var(--ds-hairline)" }}
      >
        <h2 className="text-[16px] font-[600]" style={{ color: "var(--ds-ink)" }}>
          {title}
        </h2>
        {description && (
          <p className="text-[13px] mt-0.5" style={{ color: "var(--ds-steel)" }}>
            {description}
          </p>
        )}
      </div>
      <div className="p-6">{children}</div>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Main analytics content (async server component)
// ---------------------------------------------------------------------------

export async function AnalyticsContent({ campaignId }: Props) {
  const data = await getCampaignAnalytics(campaignId);
  if (!data) notFound();

  const {
    campaign,
    totalSent,
    openRate,
    clickRate,
    compromiseRate,
    reportRate,
    employees,
    departments,
    timeline,
  } = data;

  const [campaignRow] = await db
    .select({ settings: campaigns.settings })
    .from(campaigns)
    .where(eq(campaigns.id, campaignId))
    .limit(1);
  const campaignSettings = campaignRow?.settings as CampaignSettings | null;

  return (
    <div className="flex flex-col gap-8">
      {/* Realtime subscription (client) */}
      <RealtimeUpdater campaignId={campaignId} />

      <AiSummaryCard
        initialSummary={campaignSettings?.lastAiSummary ?? null}
        generatedAt={campaignSettings?.lastAiSummaryAt ?? null}
      />

      {/* Page header */}
      <div>
        <h1
          className="text-[28px] font-[600] leading-[1.25] mb-1"
          style={{ color: "var(--ds-ink)" }}
        >
          {campaign.name}
        </h1>
        <p className="text-[14px]" style={{ color: "var(--ds-steel)" }}>
          Analytics &amp; engagement breakdown
        </p>
      </div>

      {/* Stat cards row */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-5">
        <StatCard label="Total Sent" value={totalSent.toLocaleString()} />
        <StatCard
          label="Open Rate"
          value={`${openRate}%`}
          subLabel={`${Math.round((openRate / 100) * totalSent)} employees`}
          metric="openRate"
          numericValue={openRate}
        />
        <StatCard
          label="Click Rate"
          value={`${clickRate}%`}
          subLabel={`${Math.round((clickRate / 100) * totalSent)} employees`}
          metric="clickRate"
          numericValue={clickRate}
        />
        <StatCard
          label="Compromise Rate"
          value={`${compromiseRate}%`}
          subLabel={`${Math.round((compromiseRate / 100) * totalSent)} compromised`}
          metric="compromiseRate"
          numericValue={compromiseRate}
        />
        <StatCard
          label="Report Rate"
          value={`${reportRate}%`}
          subLabel={`${Math.round((reportRate / 100) * totalSent)} reported`}
          metric="reportRate"
          numericValue={reportRate}
        />
      </div>

      {/* Charts row */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Section
          title="Department vulnerability"
          description="Vulnerability score by department (% compromised)"
        >
          <DepartmentChart data={departments} />
        </Section>

        <Section
          title="Event timeline"
          description="Cumulative engagement since campaign launch"
        >
          <TimelineChart data={timeline} />
        </Section>
      </div>

      {/* Employee table */}
      <Card className="overflow-hidden">
        <div
          className="px-6 py-5 border-b"
          style={{ borderColor: "var(--ds-hairline)" }}
        >
          <h2
            className="text-[16px] font-[600]"
            style={{ color: "var(--ds-ink)" }}
          >
            Per-employee breakdown
          </h2>
          <p className="text-[13px] mt-0.5" style={{ color: "var(--ds-steel)" }}>
            Search, filter, and sort — compromised employees shown first by default.
          </p>
        </div>
        <EmployeeTable employees={employees} />
      </Card>
    </div>
  );
}
