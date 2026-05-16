"use client";

import {
  CAMPAIGN_TEMPLATES,
  type CampaignDifficulty,
  type CampaignTemplate,
} from "@/lib/campaign-templates";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

const TAG_STYLES: Record<string, string> = {
  urgency: "bg-[var(--ds-tint-peach)] text-[#793400]",
  authority: "bg-[var(--ds-tint-lavender)] text-[#391c57]",
  financial: "bg-[var(--ds-tint-mint)] text-[#1aae39]",
  routine: "bg-[var(--ds-tint-sky)] text-[#1a2a52]",
  personal: "bg-[var(--ds-tint-rose)] text-[#a02e6d]",
  account: "bg-[var(--ds-tint-lavender)] text-[#391c57]",
  benefits: "bg-[var(--ds-tint-mint)] text-[#1aae39]",
  cloud: "bg-[var(--ds-tint-sky)] text-[#1a2a52]",
  curiosity: "bg-[var(--ds-tint-rose)] text-[#a02e6d]",
  deadline: "bg-[var(--ds-tint-peach)] text-[#793400]",
  delivery: "bg-[var(--ds-tint-sky)] text-[#1a2a52]",
  document: "bg-[var(--ds-tint-lavender)] text-[#391c57]",
  HR: "bg-[var(--ds-tint-mint)] text-[#1aae39]",
  IT: "bg-[var(--ds-tint-sky)] text-[#1a2a52]",
  license: "bg-[var(--ds-tint-peach)] text-[#793400]",
  messages: "bg-[var(--ds-tint-lavender)] text-[#391c57]",
  MFA: "bg-[var(--ds-tint-sky)] text-[#1a2a52]",
  payroll: "bg-[var(--ds-tint-mint)] text-[#1aae39]",
  policy: "bg-[var(--ds-tint-sky)] text-[#1a2a52]",
  quota: "bg-[var(--ds-tint-peach)] text-[#793400]",
  seasonal: "bg-[var(--ds-tint-peach)] text-[#793400]",
  security: "bg-[var(--ds-tint-lavender)] text-[#391c57]",
  signature: "bg-[var(--ds-tint-lavender)] text-[#391c57]",
  social: "bg-[var(--ds-tint-rose)] text-[#a02e6d]",
  software: "bg-[var(--ds-tint-peach)] text-[#793400]",
  ticket: "bg-[var(--ds-tint-sky)] text-[#1a2a52]",
  VPN: "bg-[var(--ds-tint-peach)] text-[#793400]",
  workflow: "bg-[var(--ds-tint-sky)] text-[#1a2a52]",
};

const DIFFICULTY_STYLES: Record<CampaignDifficulty, string> = {
  Easy: "bg-[var(--ds-tint-mint)] text-[#1aae39]",
  Medium: "bg-[var(--ds-tint-peach)] text-[#793400]",
  Hard: "bg-[var(--ds-tint-lavender)] text-[#391c57]",
};

function tagStyle(tag: string) {
  return TAG_STYLES[tag] ?? "bg-muted text-muted-foreground";
}

interface TemplateGridProps {
  selectedId: string | null;
  onSelect: (template: CampaignTemplate) => void;
}

export function TemplateGrid({ selectedId, onSelect }: TemplateGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {CAMPAIGN_TEMPLATES.map((template) => {
        const selected = selectedId === template.id;
        return (
          <Card
            key={template.id}
            className={cn(
              "flex flex-col transition-colors",
              selected && "border-2 border-[var(--ds-primary)]",
            )}
          >
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-balance text-[18px]">
                  {template.title}
                </CardTitle>
                <Badge
                  className={cn(
                    "shrink-0 rounded-full border-0 text-[11px] font-semibold",
                    DIFFICULTY_STYLES[template.difficulty],
                  )}
                >
                  {template.difficulty}
                </Badge>
              </div>
              <CardDescription className="text-pretty text-[14px]">
                {template.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 pt-0">
              <div className="rounded-[8px] border border-[var(--ds-hairline)] bg-[var(--ds-surface)] p-3">
                <p className="line-clamp-2 text-[13px] font-[500] leading-[1.45] text-[var(--ds-ink)]">
                  {template.subject}
                </p>
                <p className="mt-1 line-clamp-2 text-[12px] leading-[1.45] text-[var(--ds-steel)]">
                  {template.preheader}
                </p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                <Badge
                  variant="outline"
                  className="rounded-[4px] border-0 bg-muted text-[11px] font-semibold capitalize text-muted-foreground"
                >
                  {template.urgencyLevel} urgency
                </Badge>
                {template.tags.slice(0, 3).map((tag) => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className={cn(
                      "rounded-[4px] border-0 text-[11px] font-semibold capitalize",
                      tagStyle(tag),
                    )}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
            <CardFooter className="mt-auto pt-2">
              <Button
                type="button"
                variant={selected ? "default" : "outline"}
                className="w-full h-10 rounded-[8px]"
                onClick={() => onSelect(template)}
              >
                {selected ? "Selected" : "Select"}
              </Button>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}
