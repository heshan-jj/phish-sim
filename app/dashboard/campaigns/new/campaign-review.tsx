"use client";

import type { CampaignSettingsFormValues } from "@/app/dashboard/campaigns/new/campaign-settings-form";
import type { TargetingOptions } from "@/app/dashboard/campaigns/new/types";
import {
  getTemplateById,
  type CampaignDifficulty,
} from "@/lib/campaign-templates";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Loader2 } from "lucide-react";

function SummarySection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p
        className="text-[11px] font-[600] uppercase tracking-[1px] mb-3"
        style={{ color: "var(--ds-stone)" }}
      >
        {title}
      </p>
      <div className="flex flex-col gap-2">{children}</div>
    </div>
  );
}

function SummaryRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <span
        className="text-[13px] font-[500] shrink-0"
        style={{ color: "var(--ds-charcoal)" }}
      >
        {label}
      </span>
      <span
        className="text-[13px] leading-[1.50] text-right"
        style={{ color: "var(--ds-slate)" }}
      >
        {value}
      </span>
    </div>
  );
}

interface CampaignReviewProps {
  templateId: string;
  settings: CampaignSettingsFormValues;
  difficulty: CampaignDifficulty;
  targeting: TargetingOptions | null;
  error: string | null;
  loading: boolean;
  onBack: () => void;
  onSaveDraft: () => void;
  onLaunch: () => void;
}

function formatTargetSummary(
  settings: CampaignSettingsFormValues,
  targeting: TargetingOptions | null,
): string {
  if (settings.targetMode === "all") return "All employees";
  if (settings.targetMode === "departments") {
    if (settings.departments.length === 0) return "No departments selected";
    return settings.departments.join(", ");
  }
  if (settings.employeeIds.length === 0) return "No employees selected";
  const names = settings.employeeIds
    .map((id) => targeting?.employees.find((e) => e.id === id)?.name)
    .filter(Boolean);
  if (names.length <= 3) return names.join(", ");
  return `${names.length} employees selected`;
}

function formatSchedule(settings: CampaignSettingsFormValues): string {
  if (settings.sendImmediately) return "Send immediately";
  if (!settings.scheduleAt) return "Not scheduled";
  try {
    return new Date(settings.scheduleAt).toLocaleString();
  } catch {
    return settings.scheduleAt;
  }
}

export function CampaignReview({
  templateId,
  settings,
  difficulty,
  targeting,
  error,
  loading,
  onBack,
  onSaveDraft,
  onLaunch,
}: CampaignReviewProps) {
  const template = getTemplateById(templateId);

  return (
    <div className="flex flex-col gap-4">
      <div
        className="rounded-[12px] border p-8"
        style={{
          backgroundColor: "var(--ds-tint-lavender)",
          borderColor: "var(--ds-hairline)",
        }}
      >
        <div className="flex flex-col gap-4">
          <SummarySection title="Template">
            <SummaryRow label="Type" value={template?.title ?? "—"} />
            <SummaryRow
              label="Scenario"
              value={template?.description ?? "—"}
            />
              <SummaryRow
                label="Landing page"
                value={
                  template?.landingPageType.replaceAll("_", " ") ?? "—"
                }
              />
              <SummaryRow
                label="Urgency"
                value={template?.urgencyLevel ?? "—"}
              />
            <SummaryRow label="Difficulty" value={difficulty} />
          </SummarySection>

          <Separator />

          <SummarySection title="Campaign">
            <SummaryRow label="Name" value={settings.campaignName || "—"} />
            <SummaryRow
              label="Targets"
              value={formatTargetSummary(settings, targeting)}
            />
            <SummaryRow label="Schedule" value={formatSchedule(settings)} />
            <SummaryRow
              label="Stagger sends"
              value={settings.staggerSends ? "Yes (template delays)" : "No"}
            />
            <SummaryRow
              label="Shared email"
              value={settings.sharedEmail ? "Yes — generic content" : "No"}
            />
            <SummaryRow
              label="Difficulty override"
              value={settings.difficultyOverride ? "Yes" : "No"}
            />
          </SummarySection>
        </div>
      </div>

      {error && (
        <p
          className="text-[13px] leading-[1.40]"
          style={{ color: "var(--ds-error)" }}
        >
          {error}
        </p>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          type="button"
          variant="dsOutline"
          size="app"
          onClick={onBack}
          disabled={loading}
        >
          Back
        </Button>
        <Button
          type="button"
          variant="dsOutline"
          size="app"
          onClick={onSaveDraft}
          disabled={loading}
          className="flex-1"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Save as Draft"
          )}
        </Button>
        <Button
          type="button"
          variant="ds"
          size="app"
          onClick={onLaunch}
          disabled={loading}
          className="flex-1"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Launching…
            </>
          ) : (
            "Launch Campaign"
          )}
        </Button>
      </div>
    </div>
  );
}
