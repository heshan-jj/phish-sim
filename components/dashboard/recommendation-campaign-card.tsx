import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { TemplateRecommendation } from "@/lib/ai-extended";
import { getTemplateById } from "@/lib/campaign-templates";
import { buildRecommendationWizardHref } from "@/lib/campaign-wizard-params";
import { cn } from "@/lib/utils";
import {
  DIFFICULTY_BADGE_CLASS,
  getTemplateCategoryAccent,
  RECOMMENDATION_RANK_STYLES,
} from "@/lib/ui/campaign-template-styles";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

interface Props {
  rank: 1 | 2 | 3;
  recommendation: TemplateRecommendation;
  className?: string;
}

export function RecommendationCampaignCard({
  rank,
  recommendation,
  className,
}: Props) {
  const template = getTemplateById(recommendation.templateId);
  const accent = getTemplateCategoryAccent(template?.category);
  const rankStyle = RECOMMENDATION_RANK_STYLES[rank];
  const Icon = accent.icon;
  const wizardHref = buildRecommendationWizardHref({
    templateId: recommendation.templateId,
    suggestedDifficulty: recommendation.suggestedDifficulty,
  });

  return (
    <article
      className={cn(
        "group flex min-w-[min(100%,320px)] shrink-0 snap-start flex-col overflow-hidden rounded-[12px] border-2 border-transparent bg-[var(--ds-canvas)] transition-[box-shadow,border-color] duration-200 motion-reduce:transition-none sm:min-w-0",
        "hover:border-[var(--ds-hairline-strong)] hover:shadow-[0_4px_12px_rgba(15,15,15,0.08)]",
        "focus-within:border-[var(--ds-primary)] focus-within:ring-2 focus-within:ring-[var(--ds-primary)]",
        className,
      )}
      style={{ boxShadow: "0 1px 2px rgba(15, 15, 15, 0.04)" }}
    >
      <div
        className="h-1 w-full shrink-0"
        style={{ background: accent.gradient }}
        aria-hidden
      />
      <div className="flex flex-1 flex-col gap-4 p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            <div
              className="flex size-10 shrink-0 items-center justify-center rounded-[10px]"
              style={{ backgroundColor: accent.tintBg, color: accent.tintText }}
            >
              <Icon className="size-5" aria-hidden />
            </div>
            <div className="min-w-0">
              <span
                className="mb-1 inline-flex rounded-full px-2 py-0.5 text-[10px] font-[700] uppercase tracking-wide"
                style={{ backgroundColor: rankStyle.bg, color: rankStyle.color }}
              >
                Pick {rankStyle.label}
              </span>
              <h3
                className="text-balance text-[16px] font-[600] leading-[1.3] sm:text-[17px]"
                style={{ color: "var(--ds-ink)" }}
              >
                {template?.title ?? recommendation.templateId}
              </h3>
              <p
                className="mt-0.5 text-[11px] font-[500] capitalize"
                style={{ color: "var(--ds-stone)" }}
              >
                {accent.label}
              </p>
            </div>
          </div>
          <Badge
            className={cn(
              "shrink-0 rounded-full border-0 text-[11px] font-semibold",
              DIFFICULTY_BADGE_CLASS[recommendation.suggestedDifficulty],
            )}
          >
            {recommendation.suggestedDifficulty}
          </Badge>
        </div>

        {template && (
          <div
            className="rounded-[8px] border p-3"
            style={{
              borderColor: "var(--ds-hairline)",
              backgroundColor: "var(--ds-surface)",
            }}
          >
            <p
              className="line-clamp-2 text-[13px] font-[500] leading-[1.45]"
              style={{ color: "var(--ds-ink)" }}
            >
              {template.subject}
            </p>
            <p
              className="mt-1 line-clamp-2 text-[12px] leading-[1.45]"
              style={{ color: "var(--ds-steel)" }}
            >
              {template.preheader}
            </p>
          </div>
        )}

        <p
          className="line-clamp-3 flex-1 text-[13px] leading-[1.5]"
          style={{ color: "var(--ds-steel)" }}
        >
          {recommendation.reason}
        </p>

        <Button
          variant="ds"
          size="app"
          className="h-10 w-full"
          nativeButton={false}
          render={<Link href={wizardHref} />}
        >
          Start campaign
          <ArrowRight className="size-4" />
        </Button>
      </div>
    </article>
  );
}
