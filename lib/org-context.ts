import type { CompanyContext } from "@/lib/ai";
import type { OrgContext } from "@/app/onboarding/_actions";
import type { CampaignDifficulty } from "@/lib/campaign-templates";

export function orgContextToCompanyContext(
  ctx: OrgContext | null | undefined,
): CompanyContext {
  const vendors = ctx?.vendors?.trim() ?? "";
  return {
    vendors,
    tools: vendors,
    internalTerms: ctx?.terminology?.trim() ?? "",
    recentEvents: ctx?.events?.trim() ?? "",
    orgStructure: ctx?.orgStructure?.trim() ?? "",
  };
}

export function toAiDifficulty(
  campaignDifficulty: CampaignDifficulty | string,
): "easy" | "medium" | "hard" {
  const normalized = campaignDifficulty.toLowerCase();
  if (normalized === "easy") return "easy";
  if (normalized === "hard") return "hard";
  return "medium";
}

export function parseOrgContext(raw: unknown): OrgContext | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const o = raw as Record<string, unknown>;
  return {
    vendors: typeof o.vendors === "string" ? o.vendors : "",
    terminology: typeof o.terminology === "string" ? o.terminology : "",
    events: typeof o.events === "string" ? o.events : "",
    orgStructure: typeof o.orgStructure === "string" ? o.orgStructure : "",
  };
}
