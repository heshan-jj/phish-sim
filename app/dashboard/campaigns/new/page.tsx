"use client";

import {
  createCampaign,
  getTargetingOptions,
} from "@/app/dashboard/campaigns/new/_actions";
import type { TargetingOptions } from "@/app/dashboard/campaigns/new/types";
import {
  CampaignSettingsForm,
  type CampaignSettingsFormValues,
} from "@/app/dashboard/campaigns/new/campaign-settings-form";
import { CampaignReview } from "@/app/dashboard/campaigns/new/campaign-review";
import { TemplateGrid } from "@/app/dashboard/campaigns/new/template-grid";
import { StepIndicator, StepLabel } from "@/app/dashboard/campaigns/new/wizard-steps";
import type { CampaignSettings } from "@/lib/campaign-settings";
import {
  getTemplateById,
  type CampaignDifficulty,
  type CampaignTemplate,
} from "@/lib/campaign-templates";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

const DEFAULT_SETTINGS: CampaignSettingsFormValues = {
  campaignName: "",
  targetMode: "all",
  departments: [],
  employeeIds: [],
  difficultyOverride: false,
  overrideDifficulty: null,
  sendImmediately: true,
  scheduleAt: "",
  staggerSends: false,
};

export default function NewCampaignPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [templateId, setTemplateId] = useState<string | null>(null);
  const [settings, setSettings] =
    useState<CampaignSettingsFormValues>(DEFAULT_SETTINGS);
  const [targeting, setTargeting] = useState<TargetingOptions | null>(null);
  const [targetingLoading, setTargetingLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedTemplate = templateId ? getTemplateById(templateId) : null;

  const effectiveDifficulty: CampaignDifficulty = useMemo(() => {
    if (settings.difficultyOverride && settings.overrideDifficulty) {
      return settings.overrideDifficulty;
    }
    return selectedTemplate?.difficulty ?? "Medium";
  }, [settings.difficultyOverride, settings.overrideDifficulty, selectedTemplate]);

  const loadTargeting = useCallback(async () => {
    setTargetingLoading(true);
    try {
      const data = await getTargetingOptions();
      setTargeting(data);
    } finally {
      setTargetingLoading(false);
    }
  }, []);

  useEffect(() => {
    if (step >= 2) {
      void loadTargeting();
    }
  }, [step, loadTargeting]);

  const step2Valid = useMemo(() => {
    if (!settings.campaignName.trim()) return false;
    if (settings.targetMode === "departments" && settings.departments.length === 0) {
      return false;
    }
    if (settings.targetMode === "employees" && settings.employeeIds.length === 0) {
      return false;
    }
    if (!settings.sendImmediately && !settings.scheduleAt) return false;
    if (settings.difficultyOverride && !settings.overrideDifficulty) return false;
    return true;
  }, [settings]);

  function handleSelectTemplate(template: CampaignTemplate) {
    setTemplateId(template.id);
    setError(null);
  }

  function patchSettings(patch: Partial<CampaignSettingsFormValues>) {
    setSettings((prev) => ({ ...prev, ...patch }));
  }

  function buildCampaignSettings(): CampaignSettings {
    return {
      targetMode: settings.targetMode,
      departments:
        settings.targetMode === "departments" ? settings.departments : undefined,
      employeeIds:
        settings.targetMode === "employees" ? settings.employeeIds : undefined,
      staggerSends: settings.staggerSends,
      difficultyOverride: settings.difficultyOverride,
      sendImmediately: settings.sendImmediately,
    };
  }

  function buildSchedule(): Date | null {
    if (settings.sendImmediately) return null;
    if (!settings.scheduleAt) return null;
    return new Date(settings.scheduleAt);
  }

  async function persistCampaign(status: "draft" | "active") {
    if (!templateId || !selectedTemplate) {
      throw new Error("Select a template first");
    }

    return createCampaign({
      name: settings.campaignName.trim(),
      templateCategory: templateId,
      difficulty: effectiveDifficulty,
      status,
      schedule: buildSchedule(),
      settings: buildCampaignSettings(),
    });
  }

  async function handleSaveDraft() {
    setLoading(true);
    setError(null);
    try {
      await persistCampaign("draft");
      router.push("/dashboard/campaigns");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function handleLaunch() {
    setLoading(true);
    setError(null);
    try {
      const { id } = await persistCampaign("active");
      const res = await fetch(`/api/campaigns/${id}/send`, { method: "POST" });
      const body = (await res.json()) as { error?: string };
      if (!res.ok) {
        throw new Error(body.error ?? "Failed to start campaign send");
      }
      router.push("/dashboard/campaigns");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center px-4 py-12"
      style={{ backgroundColor: "var(--ds-surface)" }}
    >
      <div className="w-full max-w-4xl">
        <h1
          className="text-center text-[28px] font-[600] leading-[1.25] mb-2"
          style={{ color: "var(--ds-ink)" }}
        >
          Create campaign
        </h1>
        <p
          className="text-center text-[14px] leading-[1.50] mb-8"
          style={{ color: "var(--ds-steel)" }}
        >
          Choose a template, configure targeting, and launch your simulation.
        </p>

        <StepIndicator current={step} />
        <StepLabel step={step} />

        {step === 1 && (
          <div className="flex flex-col gap-6">
            <TemplateGrid
              selectedId={templateId}
              onSelect={handleSelectTemplate}
            />
            {error && (
              <p className="text-[13px]" style={{ color: "var(--ds-error)" }}>
                {error}
              </p>
            )}
            <Button
              type="button"
              onClick={() => setStep(2)}
              disabled={!templateId}
              className="w-full sm:w-auto sm:ml-auto h-11 rounded-[8px] px-8"
              style={{
                backgroundColor: !templateId
                  ? "var(--ds-hairline)"
                  : "var(--ds-primary)",
                color: !templateId ? "var(--ds-muted)" : "#ffffff",
              }}
            >
              Continue
            </Button>
          </div>
        )}

        {step === 2 && (
          <CampaignSettingsForm
            values={settings}
            onChange={patchSettings}
            targeting={targeting}
            targetingLoading={targetingLoading}
            onBack={() => setStep(1)}
            onContinue={() => {
              if (step2Valid) setStep(3);
            }}
            continueDisabled={!step2Valid}
            loading={false}
          />
        )}

        {step === 3 && templateId && (
          <CampaignReview
            templateId={templateId}
            settings={settings}
            difficulty={effectiveDifficulty}
            targeting={targeting}
            error={error}
            loading={loading}
            onBack={() => setStep(2)}
            onSaveDraft={() => void handleSaveDraft()}
            onLaunch={() => void handleLaunch()}
          />
        )}
      </div>
    </div>
  );
}
