"use server";

import type { CampaignDifficulty } from "@/lib/campaign-templates";
import {
  getTemplateById,
  pickTemplateVariation,
} from "@/lib/campaign-templates";
import type { CampaignSettings, ContentMode } from "@/lib/campaign-settings";
import { db } from "@/lib/db";
import {
  getEmployeesByOrg,
  listEmployeesByOrg,
} from "@/lib/db/queries/employees";
import { campaigns } from "@/lib/db/schema";
import { getOrgForUser } from "@/lib/org";
import type { CampaignStatus } from "@/types";
import { parseOrgContext } from "@/lib/org-context";
import { resolvePhishingEmailContent } from "@/lib/ai-launch";
import { reviewContentSafety } from "@/lib/ai-content";
import type { PhishingEmail } from "@/lib/ai";

import type { TargetingOptions } from "./types";

export interface CreateCampaignInput {
  name: string;
  templateCategory: string;
  difficulty: CampaignDifficulty;
  status: CampaignStatus;
  schedule: Date | null;
  settings: CampaignSettings;
}

export async function getTargetingOptions(): Promise<TargetingOptions | null> {
  const org = await getOrgForUser();
  if (!org) return null;

  const employeesList = await getEmployeesByOrg(org.id);
  const departments = [
    ...new Set(
      employeesList
        .map((employee) => employee.department?.trim())
        .filter((department): department is string => Boolean(department)),
    ),
  ].sort((a, b) => a.localeCompare(b));

  return { departments, employees: employeesList };
}

export async function createCampaign(
  input: CreateCampaignInput,
): Promise<{ id: string }> {
  const org = await getOrgForUser();
  if (!org) {
    throw new Error("Unauthenticated");
  }

  const [campaign] = await db
    .insert(campaigns)
    .values({
      orgId: org.id,
      name: input.name,
      templateCategory: input.templateCategory,
      difficulty: input.difficulty,
      status: input.status,
      schedule: input.schedule,
      settings: input.settings,
    })
    .returning({ id: campaigns.id });

  if (!campaign) {
    throw new Error("Failed to create campaign");
  }

  return { id: campaign.id };
}

export async function previewCampaignEmail(input: {
  templateId: string;
  employeeId?: string;
  difficulty: CampaignDifficulty;
  contentMode: ContentMode;
}): Promise<PhishingEmail> {
  const org = await getOrgForUser();
  if (!org) throw new Error("Unauthenticated");

  const template = getTemplateById(input.templateId);
  if (!template) throw new Error("Template not found");

  const employees = await listEmployeesByOrg(org.id);
  const employee =
    (input.employeeId
      ? employees.find((e) => e.id === input.employeeId)
      : employees[0]) ?? null;

  if (!employee) {
    throw new Error("Add at least one employee to preview AI content");
  }

  const nameParts = employee.name.trim().split(/\s+/).filter(Boolean);
  const variation = pickTemplateVariation(template);
  const resolved = await resolvePhishingEmailContent({
    contentMode: input.contentMode,
    template,
    employee: {
      name: employee.name,
      role: employee.role,
      department: employee.department,
      seniority: employee.seniority,
    },
    orgContext: parseOrgContext(org.context),
    campaignDifficulty: input.difficulty,
    placeholders: {
      firstName: nameParts[0] ?? "there",
      lastName: nameParts.slice(1).join(" "),
      department: employee.department ?? "General",
      employeeId: employee.id,
      employeeEmail: employee.email,
      companyName: org.name,
      variation,
    },
    actionUrl: "https://training.example/verify",
    variation,
  });

  return {
    subject: resolved.subject,
    body: resolved.body,
    senderName: resolved.senderName,
    senderEmail: resolved.senderEmail,
  };
}

export async function suggestScenarioDraftAction(description: string) {
  const { CAMPAIGN_TEMPLATES } = await import("@/lib/campaign-templates");
  const { suggestScenarioDraft } = await import("@/lib/ai-extended");
  return suggestScenarioDraft(
    description,
    CAMPAIGN_TEMPLATES.map((t) => t.id),
  );
}

export async function runCampaignSafetyReview(input: {
  templateId: string;
  difficulty: CampaignDifficulty;
  contentMode: ContentMode;
}) {
  const email = await previewCampaignEmail(input);
  return reviewContentSafety(email);
}
