import type { CampaignChannel } from "@/lib/campaign-settings";
import type { CampaignTemplate, TemplateCategory } from "@/lib/campaign-templates";

const VISHING_CATEGORIES: TemplateCategory[] = [
  "security",
  "hr",
  "it",
  "cloud",
];

const SMISHING_CATEGORIES: TemplateCategory[] = [
  "security",
  "delivery",
  "social",
  "software",
];

export function templateSupportsChannel(
  template: CampaignTemplate,
  channel: CampaignChannel,
): boolean {
  if (channel === "email") return true;
  if (channel === "vishing") {
    return VISHING_CATEGORIES.includes(template.category);
  }
  if (channel === "smishing") {
    return SMISHING_CATEGORIES.includes(template.category);
  }
  return true;
}

export function filterTemplatesByChannel(
  templates: CampaignTemplate[],
  channel: CampaignChannel,
): CampaignTemplate[] {
  return templates.filter((t) => templateSupportsChannel(t, channel));
}
