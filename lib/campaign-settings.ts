export type TargetMode = "all" | "departments" | "employees";
export type ContentMode = "static" | "ai" | "hybrid";
export type CampaignChannel = "email" | "vishing" | "smishing";

export interface CampaignSettings {
  targetMode: TargetMode;
  departments?: string[];
  employeeIds?: string[];
  staggerSends: boolean;
  difficultyOverride: boolean;
  sendImmediately: boolean;
  sharedEmail: boolean;
  contentMode?: ContentMode;
  channel?: CampaignChannel;
  locale?: string;
  lastAiSummary?: string;
  lastAiSummaryAt?: string;
}

export const DEFAULT_CAMPAIGN_SETTINGS: Pick<
  CampaignSettings,
  "contentMode" | "channel"
> = {
  contentMode: "static",
  channel: "email",
};

export function normalizeCampaignSettings(
  raw: CampaignSettings | null | undefined,
): CampaignSettings {
  return {
    targetMode: raw?.targetMode ?? "all",
    departments: raw?.departments,
    employeeIds: raw?.employeeIds,
    staggerSends: raw?.staggerSends ?? false,
    difficultyOverride: raw?.difficultyOverride ?? false,
    sendImmediately: raw?.sendImmediately ?? true,
    sharedEmail: raw?.sharedEmail ?? false,
    contentMode: raw?.contentMode ?? "static",
    channel: raw?.channel ?? "email",
    locale: raw?.locale,
    lastAiSummary: raw?.lastAiSummary,
    lastAiSummaryAt: raw?.lastAiSummaryAt,
  };
}

/** Max recipients for AI content without explicit confirmation in the UI */
export const AI_LAUNCH_RECIPIENT_WARN_THRESHOLD = 50;
