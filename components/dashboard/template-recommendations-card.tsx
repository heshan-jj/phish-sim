"use client";

import {
  getCachedTemplateRecommendationsAction,
  refreshTemplateRecommendationsAction,
} from "@/app/dashboard/_actions/recommendations";
import { RecommendationCampaignCard } from "@/components/dashboard/recommendation-campaign-card";
import { Button } from "@/components/ui/button";
import { FormError } from "@/components/ui/form-error";
import type { TemplateRecommendation } from "@/lib/ai-extended";
import { cn } from "@/lib/utils";
import { Loader2, Sparkles } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

const CARD_TRACK_CLASS =
  "flex gap-4 overflow-x-auto snap-x snap-mandatory pb-1 -mx-1 px-1 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:snap-none lg:grid-cols-3";

function RecommendationCardSkeleton() {
  return (
    <div
      className="flex min-w-[min(100%,320px)] shrink-0 snap-start flex-col overflow-hidden rounded-[12px] border-2 border-transparent sm:min-w-0 animate-pulse"
      style={{
        backgroundColor: "var(--ds-canvas)",
        boxShadow: "0 1px 2px rgba(15, 15, 15, 0.04)",
      }}
    >
      <div className="h-1 w-full" style={{ backgroundColor: "var(--ds-lavender)" }} />
      <div className="flex flex-col gap-4 p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <div
            className="size-10 shrink-0 rounded-[10px]"
            style={{ backgroundColor: "var(--ds-surface)" }}
          />
          <div className="flex-1 space-y-2">
            <div
              className="h-4 w-12 rounded-full"
              style={{ backgroundColor: "var(--ds-surface)" }}
            />
            <div
              className="h-5 w-3/4 rounded-[6px]"
              style={{ backgroundColor: "var(--ds-surface)" }}
            />
          </div>
        </div>
        <div
          className="h-20 rounded-[8px]"
          style={{ backgroundColor: "var(--ds-surface)" }}
        />
        <div className="space-y-2">
          <div
            className="h-3 w-full rounded-[4px]"
            style={{ backgroundColor: "var(--ds-surface)" }}
          />
          <div
            className="h-3 w-5/6 rounded-[4px]"
            style={{ backgroundColor: "var(--ds-surface)" }}
          />
        </div>
        <div
          className="h-10 w-full rounded-[8px]"
          style={{ backgroundColor: "var(--ds-surface)" }}
        />
      </div>
    </div>
  );
}

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
  const headingId = "recommendations-heading";

  return (
    <section
      aria-labelledby={headingId}
      className="overflow-hidden rounded-[16px] border"
      style={{
        borderColor: "var(--ds-hairline)",
        boxShadow: "0 4px 12px rgba(15, 15, 15, 0.08)",
      }}
    >
      <div
        className="border-b px-4 py-5 sm:px-6"
        style={{
          borderColor: "var(--ds-hairline)",
          background:
            "linear-gradient(135deg, var(--ds-lavender) 0%, var(--ds-canvas) 55%, var(--ds-surface-soft) 100%)",
        }}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div
              className="mb-2 inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-[11px] font-[600] uppercase tracking-wide"
              style={{
                borderColor: "var(--ds-hairline-strong)",
                backgroundColor: "var(--ds-canvas)",
                color: "var(--ds-primary)",
              }}
            >
              <Sparkles className="size-3.5 shrink-0" aria-hidden />
              AI-powered
            </div>
            <h2
              id={headingId}
              className="text-[18px] font-[600] leading-[1.3] sm:text-[20px]"
              style={{ color: "var(--ds-ink)" }}
            >
              AI picks for your next drill
            </h2>
            <p className="mt-1 text-[13px] leading-[1.45]" style={{ color: "var(--ds-steel)" }}>
              Tailored simulation templates based on your org and past campaigns.
            </p>
            {generatedAt && !loadingCache && (
              <p className="mt-1 text-[12px]" style={{ color: "var(--ds-stone)" }}>
                Updated {new Date(generatedAt).toLocaleString()}
              </p>
            )}
          </div>
          <Button
            type="button"
            variant="dsOutline"
            size="sm"
            className="shrink-0 self-start"
            onClick={() => void handleRefresh()}
            disabled={busy}
            aria-busy={refreshing}
          >
            {refreshing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                Refreshing…
              </>
            ) : (
              "Refresh picks"
            )}
          </Button>
        </div>
      </div>

      <div className="px-4 py-5 sm:px-6">
        {loadingCache ? (
          <div className={CARD_TRACK_CLASS}>
            {[1, 2, 3].map((i) => (
              <RecommendationCardSkeleton key={i} />
            ))}
          </div>
        ) : recommendations.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-8 text-center sm:py-10">
            <div
              className="flex size-14 items-center justify-center rounded-full"
              style={{ backgroundColor: "var(--ds-lavender)", color: "var(--ds-primary)" }}
            >
              <Sparkles className="size-7" aria-hidden />
            </div>
            <div className="max-w-sm">
              <p className="text-[15px] font-[600]" style={{ color: "var(--ds-ink)" }}>
                No picks yet
              </p>
              <p className="mt-1 text-[13px] leading-[1.5]" style={{ color: "var(--ds-steel)" }}>
                Generate AI suggestions for your next phishing simulations—matched to your
                team and recent results.
              </p>
            </div>
            <Button
              type="button"
              variant="ds"
              size="app"
              onClick={() => void handleRefresh()}
              disabled={busy}
            >
              {refreshing ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                  Generating…
                </>
              ) : (
                <>
                  <Sparkles className="size-4" aria-hidden />
                  Generate picks
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className={cn(CARD_TRACK_CLASS)}>
            {recommendations.map((rec, index) => (
              <RecommendationCampaignCard
                key={rec.templateId}
                rank={(index + 1) as 1 | 2 | 3}
                recommendation={rec}
              />
            ))}
          </div>
        )}

        {error && <FormError className="mt-4">{error}</FormError>}
      </div>
    </section>
  );
}
