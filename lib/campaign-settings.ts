export type TargetMode = "all" | "departments" | "employees";

export interface CampaignSettings {
  targetMode: TargetMode;
  departments?: string[];
  employeeIds?: string[];
  staggerSends: boolean;
  difficultyOverride: boolean;
  sendImmediately: boolean;
  sharedEmail: boolean;
}
