export type CampaignDifficulty = "Easy" | "Medium" | "Hard";

export interface CampaignTemplate {
  id: string;
  title: string;
  description: string;
  tags: string[];
  difficulty: CampaignDifficulty;
}

export const CAMPAIGN_TEMPLATES: CampaignTemplate[] = [
  {
    id: "it-security",
    title: "IT/Security Alert",
    description: "Urgent: Your account has been flagged",
    tags: ["urgency", "authority"],
    difficulty: "Hard",
  },
  {
    id: "hr-payroll",
    title: "HR/Payroll Update",
    description: "Action required: Update your direct deposit",
    tags: ["financial", "urgency"],
    difficulty: "Medium",
  },
  {
    id: "vendor-invoice",
    title: "Vendor Invoice",
    description: "Invoice #4821 requires your approval",
    tags: ["routine", "financial"],
    difficulty: "Easy",
  },
  {
    id: "executive-request",
    title: "Executive Request",
    description: "Quick favor from the CEO",
    tags: ["authority", "personal"],
    difficulty: "Hard",
  },
  {
    id: "delivery-notification",
    title: "Delivery Notification",
    description: "Your package could not be delivered",
    tags: ["routine"],
    difficulty: "Easy",
  },
  {
    id: "account-verification",
    title: "Account Verification",
    description: "Verify your Slack/Microsoft account",
    tags: ["SaaS", "urgency"],
    difficulty: "Medium",
  },
];

export function getTemplateById(id: string): CampaignTemplate | undefined {
  return CAMPAIGN_TEMPLATES.find((t) => t.id === id);
}
