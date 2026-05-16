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
import { ScenarioDraftPanel } from "@/app/dashboard/campaigns/new/scenario-draft-panel";
import type { CampaignSettings } from "@/lib/campaign-settings";
import {
  applyWizardPreset,
  parseCampaignWizardParams,
} from "@/lib/campaign-wizard-params";
import {
  getTemplateById,
  type CampaignDifficulty,
  type CampaignTemplate,
} from "@/lib/campaign-templates";
import { Button } from "@/components/ui/button";
import { FormError } from "@/components/ui/form-error";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export const DEFAULT_SETTINGS: CampaignSettingsFormValues = {
  campaignName: "",
  targetMode: "all",
  departments: [],
  employeeIds: [],
  difficultyOverride: false,
  overrideDifficulty: null,
  sendImmediately: true,
  scheduleAt: "",
  staggerSends: false,
  sharedEmail: false,
  contentMode: "static",
  channel: "email",
  locale: "",
  aiLargeCampaignConfirmed: false,
};

function scrollWizardToTop() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}

export function NewCampaignWizard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [templateId, setTemplateId] = useState<string | null>(null);
  const [settings, setSettings] =
    useState<CampaignSettingsFormValues>(DEFAULT_SETTINGS);
  const [targeting, setTargeting] = useState<TargetingOptions | null>(null);
  const [targetingLoading, setTargetingLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [appliedBanner, setAppliedBanner] = useState<string | null>(null);
  const targetingFetchedRef = useRef(false);
  const paramsAppliedRef = useRef(false);

  const selectedTemplate = templateId ? getTemplateById(templateId) : null;

  const effectiveDifficulty: CampaignDifficulty = useMemo(() => {
    if (settings.difficultyOverride && settings.overrideDifficulty) {
      return settings.overrideDifficulty;
    }
    return selectedTemplate?.difficulty ?? "Medium";
  }, [settings.difficultyOverride, settings.overrideDifficulty, selectedTemplate]);

  const applyPreset = useCallback(
    (preset: {
      templateId: string;
      difficulty?: CampaignDifficulty | null;
      contentMode?: CampaignSettings["contentMode"] | null;
      fromRecommendation?: boolean;
    }) => {
      setSettings((current) => {
        const result = applyWizardPreset(preset, current);
        if (!result) return current;
        setTemplateId(result.templateId);
        setAppliedBanner(result.appliedBanner);
        setError(null);
        scrollWizardToTop();
        return { ...current, ...result.settingsPatch };
      });
    },
    [],
  );

  useEffect(() => {
    if (paramsAppliedRef.current) return;
    paramsAppliedRef.current = true;

    const parsed = parseCampaignWizardParams(searchParams);
    if (!parsed.templateId) return;

    applyPreset({
      templateId: parsed.templateId,
      difficulty: parsed.difficulty,
      contentMode: parsed.contentMode,
      fromRecommendation: parsed.fromRecommendation,
    });

    if (searchParams.toString()) {
      router.replace("/dashboard/campaigns/new", { scroll: false });
    }
  }, [searchParams, router, applyPreset]);

  const loadTargeting = useCallback(async () => {
    if (targetingFetchedRef.current) return;
    targetingFetchedRef.current = true;
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
    setAppliedBanner(null);
    scrollWizardToTop();
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
      sharedEmail: settings.sharedEmail,
      contentMode: settings.contentMode,
      channel: settings.channel,
      locale: settings.locale || undefined,
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
      const res = await fetch(`/api/campaigns/${id}/launch`, { method: "POST" });
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
    <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full">
      <div>
        <h1
          className="text-[28px] font-[600] leading-[1.25] mb-2"
          style={{ color: "var(--ds-ink)" }}
        >
          Create campaign
        </h1>
        <p
          className="text-[14px] leading-[1.50] mb-2"
          style={{ color: "var(--ds-steel)" }}
        >
          Choose a template, configure targeting, and launch your simulation.
        </p>

        <StepIndicator current={step} />
        <StepLabel step={step} />

        {step === 1 && (
          <Link
            href="/dashboard/campaigns"
            className="inline-block text-[13px] font-[500] mb-4 ds-interactive-link"
            style={{ color: "var(--ds-link)" }}
          >
            Cancel
          </Link>
        )}

        {appliedBanner && step === 1 && (
          <p
            className="text-[13px] rounded-[8px] border px-4 py-3 mb-4"
            style={{
              color: "var(--ds-slate)",
              borderColor: "var(--ds-hairline)",
              backgroundColor: "var(--ds-tint-lavender)",
            }}
          >
            {appliedBanner}
          </p>
        )}

        {step === 1 && (
          <div className="flex flex-col gap-6">
            <ScenarioDraftPanel
              onApply={({ templateId: id, difficulty, contentMode }) => {
                applyPreset({ templateId: id, difficulty, contentMode });
              }}
            />
            <TemplateGrid
              selectedId={templateId}
              channel={settings.channel}
              onSelect={handleSelectTemplate}
            />
            <div className="flex flex-col gap-3">
              {error && <FormError>{error}</FormError>}
              <div className="flex justify-end">
                <Button
                  type="button"
                  variant="ds"
                  size="app"
                  onClick={() => setStep(2)}
                  disabled={!templateId}
                  className="w-full sm:w-auto px-8"
                >
                  Continue
                </Button>
              </div>
            </div>
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
