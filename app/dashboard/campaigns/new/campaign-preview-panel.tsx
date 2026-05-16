"use client";

import {
  previewCampaignEmail,
  runCampaignSafetyReview,
} from "@/app/dashboard/campaigns/new/_actions";
import type { CampaignSettingsFormValues } from "@/app/dashboard/campaigns/new/campaign-settings-form";
import type { CampaignDifficulty } from "@/lib/campaign-templates";
import { AI_LAUNCH_RECIPIENT_WARN_THRESHOLD } from "@/lib/campaign-settings";
import { Button } from "@/components/ui/button";
import type { TargetingOptions } from "@/app/dashboard/campaigns/new/types";
import { Loader2 } from "lucide-react";
import { useState } from "react";

interface CampaignPreviewPanelProps {
  templateId: string;
  settings: CampaignSettingsFormValues;
  difficulty: CampaignDifficulty;
  targeting: TargetingOptions | null;
}

export function CampaignPreviewPanel({
  templateId,
  settings,
  difficulty,
  targeting,
}: CampaignPreviewPanelProps) {
  const [preview, setPreview] = useState<{
    subject: string;
    body: string;
    senderName: string;
    senderEmail: string;
  } | null>(null);
  const [safety, setSafety] = useState<{
    severity: string;
    issues: string[];
    approved: boolean;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const recipientCount =
    settings.targetMode === "all"
      ? (targeting?.employees.length ?? 0)
      : settings.targetMode === "departments"
        ? (targeting?.employees.filter((e) =>
            e.department
              ? settings.departments.includes(e.department)
              : false,
          ).length ?? 0)
        : settings.employeeIds.length;

  const needsAiConfirm =
    settings.contentMode !== "static" &&
    recipientCount > AI_LAUNCH_RECIPIENT_WARN_THRESHOLD &&
    !settings.aiLargeCampaignConfirmed;

  async function handlePreview() {
    if (settings.contentMode === "static") return;
    setLoading(true);
    setError(null);
    try {
      const sampleEmployeeId =
        settings.targetMode === "employees" && settings.employeeIds[0]
          ? settings.employeeIds[0]
          : targeting?.employees[0]?.id;
      const email = await previewCampaignEmail({
        templateId,
        employeeId: sampleEmployeeId,
        difficulty,
        contentMode: settings.contentMode,
      });
      setPreview(email);
      const review = await runCampaignSafetyReview({
        templateId,
        difficulty,
        contentMode: settings.contentMode,
      });
      setSafety(review);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Preview failed");
    } finally {
      setLoading(false);
    }
  }

  if (settings.channel !== "email" || settings.contentMode === "static") {
    return null;
  }

  return (
    <div
      className="rounded-[12px] border p-6 flex flex-col gap-4"
      style={{
        backgroundColor: "var(--ds-canvas)",
        borderColor: "var(--ds-hairline)",
      }}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-[14px] font-[600]" style={{ color: "var(--ds-ink)" }}>
          AI content preview
        </p>
        <Button
          type="button"
          variant="dsOutline"
          size="sm"
          onClick={() => void handlePreview()}
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Generate preview"
          )}
        </Button>
      </div>

      {needsAiConfirm && (
        <p className="text-[13px]" style={{ color: "var(--ds-error)" }}>
          This campaign targets {recipientCount} recipients with AI content. Confirm
          in settings before launch.
        </p>
      )}

      {error && (
        <p className="text-[13px]" style={{ color: "var(--ds-error)" }}>
          {error}
        </p>
      )}

      {preview && (
        <div className="text-[13px] space-y-2" style={{ color: "var(--ds-slate)" }}>
          <p>
            <strong>From:</strong> {preview.senderName} &lt;{preview.senderEmail}
            &gt;
          </p>
          <p>
            <strong>Subject:</strong> {preview.subject}
          </p>
          <pre className="whitespace-pre-wrap rounded border p-3 text-[12px] max-h-48 overflow-y-auto">
            {preview.body.replace(/<[^>]+>/g, " ").slice(0, 1500)}
          </pre>
        </div>
      )}

      {safety && (
        <div
          className="text-[13px]"
          style={{
            color:
              safety.severity === "high"
                ? "var(--ds-error)"
                : "var(--ds-slate)",
          }}
        >
          <p>
            <strong>Safety review:</strong> {safety.severity}
            {safety.approved ? " — OK to send" : " — review issues"}
          </p>
          {safety.issues.length > 0 && (
            <ul className="list-disc pl-5 mt-1">
              {safety.issues.map((issue) => (
                <li key={issue}>{issue}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
