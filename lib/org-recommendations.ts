import type { TemplateRecommendation } from "@/lib/ai-extended";
import type { CampaignDifficulty } from "@/lib/campaign-templates";
import { db } from "@/lib/db";
import { organizations } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

const DIFFICULTIES = new Set<CampaignDifficulty>(["Easy", "Medium", "Hard"]);

export interface CachedOrgRecommendations {
  recommendations: TemplateRecommendation[];
  generatedAt: string | null;
}

function isTemplateRecommendation(value: unknown): value is TemplateRecommendation {
  if (!value || typeof value !== "object") return false;
  const row = value as Record<string, unknown>;
  return (
    typeof row.templateId === "string" &&
    typeof row.reason === "string" &&
    DIFFICULTIES.has(row.suggestedDifficulty as CampaignDifficulty)
  );
}

export function parseCachedRecommendations(raw: unknown): TemplateRecommendation[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter(isTemplateRecommendation);
}

export async function getCachedOrgRecommendations(
  orgId: string,
): Promise<CachedOrgRecommendations> {
  const [row] = await db
    .select({
      templateRecommendations: organizations.templateRecommendations,
      templateRecommendationsAt: organizations.templateRecommendationsAt,
    })
    .from(organizations)
    .where(eq(organizations.id, orgId))
    .limit(1);

  return {
    recommendations: parseCachedRecommendations(row?.templateRecommendations),
    generatedAt: row?.templateRecommendationsAt?.toISOString() ?? null,
  };
}

export async function saveOrgRecommendations(
  orgId: string,
  items: TemplateRecommendation[],
): Promise<string> {
  const generatedAt = new Date();
  await db
    .update(organizations)
    .set({
      templateRecommendations: items,
      templateRecommendationsAt: generatedAt,
    })
    .where(eq(organizations.id, orgId));

  return generatedAt.toISOString();
}
