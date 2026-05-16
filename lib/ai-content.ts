import type { CampaignTemplate } from "@/lib/campaign-templates";
import type { GenerationInput, PhishingEmail } from "@/lib/ai";
import { generatePhishingEmail } from "@/lib/ai";
import {
  generateHybridPhishingEmail,
  generateRedFlags,
  generateCoachingTip,
  generateCampaignSummary,
  reviewContentSafety,
  generateSmishingMessage,
  generateReportFeedback,
  suggestOrgContext,
  suggestScenarioDraft,
  suggestEmployeeFieldMappings,
  recommendTemplates,
} from "@/lib/ai-extended";

export async function generateEmailForRecipient(
  input: GenerationInput,
): Promise<PhishingEmail> {
  return generatePhishingEmail(input);
}

export async function generateHybridEmailForRecipient(
  input: GenerationInput,
  template: CampaignTemplate,
  actionUrl: string,
): Promise<PhishingEmail> {
  return generateHybridPhishingEmail(input, template, actionUrl);
}

export {
  generateRedFlags,
  generateCoachingTip,
  generateCampaignSummary,
  reviewContentSafety,
  generateSmishingMessage,
  generateReportFeedback,
  suggestOrgContext,
  suggestScenarioDraft,
  suggestEmployeeFieldMappings,
  recommendTemplates,
};

export type {
  SmishingMessage,
  SafetyReviewResult,
  ScenarioDraftResult,
  TemplateRecommendation,
  SuggestedOrgContext,
  CampaignSummaryStats,
} from "@/lib/ai-extended";
