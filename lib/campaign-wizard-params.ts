import type { ContentMode } from "@/lib/campaign-settings";
import {
  getTemplateById,
  type CampaignDifficulty,
} from "@/lib/campaign-templates";
import type { CampaignSettingsFormValues } from "@/app/dashboard/campaigns/new/campaign-settings-form";

const DIFFICULTIES = new Set<CampaignDifficulty>(["Easy", "Medium", "Hard"]);
const CONTENT_MODES = new Set<ContentMode>(["static", "ai", "hybrid"]);

export interface ParsedCampaignWizardParams {
  templateId: string | null;
  difficulty: CampaignDifficulty | null;
  contentMode: ContentMode | null;
  fromRecommendation: boolean;
}

export interface WizardPresetInput {
  templateId: string;
  difficulty?: CampaignDifficulty | null;
  contentMode?: ContentMode | null;
  fromRecommendation?: boolean;
}

export interface WizardPresetApplication {
  templateId: string;
  settingsPatch: Partial<CampaignSettingsFormValues>;
  appliedBanner: string | null;
}

export function parseCampaignWizardParams(
  searchParams: URLSearchParams,
): ParsedCampaignWizardParams {
  const rawTemplate = searchParams.get("template")?.trim() ?? "";
  const templateId = rawTemplate && getTemplateById(rawTemplate) ? rawTemplate : null;

  const rawDifficulty = searchParams.get("difficulty")?.trim() ?? "";
  const difficulty = DIFFICULTIES.has(rawDifficulty as CampaignDifficulty)
    ? (rawDifficulty as CampaignDifficulty)
    : null;

  const rawContentMode = searchParams.get("contentMode")?.trim() ?? "";
  const contentMode = CONTENT_MODES.has(rawContentMode as ContentMode)
    ? (rawContentMode as ContentMode)
    : null;

  return {
    templateId,
    difficulty,
    contentMode,
    fromRecommendation: searchParams.get("from") === "recommendation",
  };
}

export function buildRecommendationWizardHref(rec: {
  templateId: string;
  suggestedDifficulty: CampaignDifficulty;
}): string {
  const params = new URLSearchParams({
    template: rec.templateId,
    difficulty: rec.suggestedDifficulty,
    contentMode: "ai",
    from: "recommendation",
  });
  return `/dashboard/campaigns/new?${params.toString()}`;
}

/** Applies template + settings from URL, scenario draft, or dashboard recommendation. */
export function applyWizardPreset(
  preset: WizardPresetInput,
  currentSettings: CampaignSettingsFormValues,
): WizardPresetApplication | null {
  const template = getTemplateById(preset.templateId);
  if (!template) return null;

  const settingsPatch: Partial<CampaignSettingsFormValues> = {};

  if (preset.difficulty) {
    settingsPatch.difficultyOverride = true;
    settingsPatch.overrideDifficulty = preset.difficulty;
  }

  if (preset.contentMode) {
    settingsPatch.contentMode = preset.contentMode;
  }

  if (!currentSettings.campaignName.trim()) {
    settingsPatch.campaignName = template.title;
  }

  const difficultyLabel = preset.difficulty ?? template.difficulty;
  const appliedBanner = preset.fromRecommendation
    ? `Applied dashboard recommendation: ${template.title} at ${difficultyLabel} difficulty.`
    : null;

  return {
    templateId: preset.templateId,
    settingsPatch,
    appliedBanner,
  };
}
