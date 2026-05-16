import { CAMPAIGN_TEMPLATES } from "@/lib/campaign-templates";
import { recommendTemplates, type TemplateRecommendation } from "@/lib/ai-extended";
import type { DepartmentScore } from "@/lib/scoring";

export async function getTemplateRecommendations(params: {
  departmentScores: DepartmentScore[];
  pastTemplateIds: string[];
}): Promise<TemplateRecommendation[]> {
  const sorted = [...params.departmentScores].sort(
    (a, b) => b.compromisedCount - a.compromisedCount,
  );
  const vulnerableDepartment =
    sorted.find((d) => d.compromisedCount > 0)?.department ??
    sorted[0]?.department ??
    "General";

  const templateOptions = CAMPAIGN_TEMPLATES.map((t) => ({
    id: t.id,
    title: t.title,
    category: t.category,
  }));

  try {
    return await recommendTemplates({
      templateOptions,
      vulnerableDepartment,
      pastTemplateIds: params.pastTemplateIds,
    });
  } catch {
    const fallback = CAMPAIGN_TEMPLATES.filter(
      (t) => !params.pastTemplateIds.includes(t.id),
    ).slice(0, 3);
    return fallback.map((t) => ({
      templateId: t.id,
      reason: `Recommended for ${vulnerableDepartment} based on category: ${t.category}`,
      suggestedDifficulty: t.difficulty,
    }));
  }
}
