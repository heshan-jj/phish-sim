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
  SaaS: "bg-[var(--ds-tint-lavender)] text-[#391c57]",
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
                <CardTitle className="text-[18px]">{template.title}</CardTitle>
                <Badge
                  className={cn(
                    "shrink-0 rounded-full border-0 text-[11px] font-semibold",
                    DIFFICULTY_STYLES[template.difficulty],
                  )}
                >
                  {template.difficulty}
                </Badge>
              </div>
              <CardDescription className="text-[14px]">
                {template.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-1.5 pt-0">
              {template.tags.map((tag) => (
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
