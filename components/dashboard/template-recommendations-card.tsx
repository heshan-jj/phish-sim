"use client";

import {
  getCachedTemplateRecommendationsAction,
  refreshTemplateRecommendationsAction,
} from "@/app/dashboard/_actions/recommendations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { TemplateRecommendation } from "@/lib/ai-extended";
import { buildRecommendationWizardHref } from "@/lib/campaign-wizard-params";
import { getTemplateById } from "@/lib/campaign-templates";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

export function TemplateRecommendationsCard() {
  const [recommendations, setRecommendations] = useState<TemplateRecommendation[]>(
    [],
  );
  const [generatedAt, setGeneratedAt] = useState<string | null>(null);
  const [loadingCache, setLoadingCache] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCache = useCallback(async () => {
    setLoadingCache(true);
    setError(null);
    try {
      const cached = await getCachedTemplateRecommendationsAction();
      setRecommendations(cached.recommendations);
      setGeneratedAt(cached.generatedAt);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load recommendations");
    } finally {
      setLoadingCache(false);
    }
  }, []);

  useEffect(() => {
    void loadCache();
  }, [loadCache]);

  async function handleRefresh() {
    setRefreshing(true);
    setError(null);
    try {
      const result = await refreshTemplateRecommendationsAction();
      setRecommendations(result.recommendations);
      setGeneratedAt(result.generatedAt);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to refresh recommendations");
    } finally {
      setRefreshing(false);
    }
  }

  const busy = loadingCache || refreshing;

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
        <div>
          <CardTitle className="text-[16px]">Recommended next campaigns</CardTitle>
          {generatedAt && !loadingCache && (
            <p className="text-[12px] mt-0.5" style={{ color: "var(--ds-steel)" }}>
              Updated {new Date(generatedAt).toLocaleString()}
            </p>
          )}
        </div>
        <Button
          type="button"
          variant="dsOutline"
          size="sm"
          onClick={() => void handleRefresh()}
          disabled={busy}
        >
          {refreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : "Refresh"}
        </Button>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {loadingCache ? (
          <p className="text-[13px]" style={{ color: "var(--ds-steel)" }}>
            Loading recommendations…
          </p>
        ) : recommendations.length === 0 ? (
          <p className="text-[13px]" style={{ color: "var(--ds-steel)" }}>
            No recommendations yet. Click Refresh to generate AI suggestions for your
            next campaigns.
          </p>
        ) : (
          recommendations.map((rec) => {
            const template = getTemplateById(rec.templateId);
            return (
              <div
                key={rec.templateId}
                className="rounded-lg border p-3"
                style={{ borderColor: "var(--ds-hairline)" }}
              >
                <p className="text-[14px] font-[600]" style={{ color: "var(--ds-ink)" }}>
                  {template?.title ?? rec.templateId}
                </p>
                <p className="text-[13px] mt-1" style={{ color: "var(--ds-steel)" }}>
                  {rec.reason}
                </p>
                <p className="text-[12px] mt-1" style={{ color: "var(--ds-stone)" }}>
                  Suggested difficulty: {rec.suggestedDifficulty}
                </p>
                <Link
                  href={buildRecommendationWizardHref({
                    templateId: rec.templateId,
                    suggestedDifficulty: rec.suggestedDifficulty,
                  })}
                  className="text-[13px] font-[600] mt-2 inline-block"
                  style={{ color: "var(--ds-link)" }}
                >
                  Start campaign →
                </Link>
              </div>
            );
          })
        )}
        {error && (
          <p className="text-[13px]" style={{ color: "var(--ds-error)" }}>
            {error}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
