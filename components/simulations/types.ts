import type { LandingPageType } from "@/lib/campaign-templates";

export interface SimulationShellProps {
  token: string;
  campaignId: string;
  variant: LandingPageType;
  senderName: string;
  senderEmail: string;
  subject: string;
  redFlags: string[];
  clickRate: number;
  companyName?: string;
}

export interface SimulationVariantProps extends SimulationShellProps {
  onSubmit: (data: { email: string; password: string }) => Promise<void>;
  submitting: boolean;
}

export interface DebriefProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  senderName: string;
  senderEmail: string;
  subject: string;
  redFlags: string[];
  clickRate: number;
  coachingTip?: string | null;
  accentClass?: string;
  buttonClass?: string;
}
