import type { GenerationInput } from "@/lib/ai";
import type { CampaignTemplate } from "@/lib/campaign-templates";
import { orgContextToCompanyContext, toAiDifficulty } from "@/lib/org-context";
import type { OrgContext } from "@/app/onboarding/_actions";

export interface EmployeeForGeneration {
  name: string;
  role: string | null;
  department: string | null;
  seniority: string | null;
}

export interface BuildGenerationInputParams {
  employee: EmployeeForGeneration;
  orgContext: OrgContext | null | undefined;
  template: CampaignTemplate;
  campaignDifficulty: string;
  locale?: string;
}

export function buildGenerationInput(
  params: BuildGenerationInputParams,
): GenerationInput {
  const { employee, orgContext, template, campaignDifficulty, locale } = params;
  return {
    employeeName: employee.name,
    employeeRole: employee.role?.trim() || "Employee",
    employeeDepartment: employee.department?.trim() || "General",
    seniority: employee.seniority?.trim() || "Individual contributor",
    companyContext: orgContextToCompanyContext(orgContext),
    templateCategory: template.category,
    difficulty: toAiDifficulty(campaignDifficulty),
    locale,
  };
}
