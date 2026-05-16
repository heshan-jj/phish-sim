import type { CampaignDifficulty, TemplateCategory } from "@/lib/campaign-templates";
import type { LucideIcon } from "lucide-react";
import {
  Cloud,
  FileText,
  Package,
  Shield,
  Share2,
  Users,
  Wrench,
  AppWindow,
} from "lucide-react";

export const DIFFICULTY_BADGE_CLASS: Record<CampaignDifficulty, string> = {
  Easy: "bg-[var(--ds-tint-mint)] text-[#1aae39]",
  Medium: "bg-[var(--ds-tint-peach)] text-[#793400]",
  Hard: "bg-[var(--ds-tint-lavender)] text-[#391c57]",
};

export const RECOMMENDATION_RANK_STYLES: Record<
  1 | 2 | 3,
  { label: string; bg: string; color: string }
> = {
  1: { label: "#1", bg: "var(--ds-tint-yellow)", color: "#793400" },
  2: { label: "#2", bg: "var(--ds-tint-lavender)", color: "var(--ds-primary-deep)" },
  3: { label: "#3", bg: "var(--ds-tint-sky)", color: "#1a2a52" },
};

export interface TemplateCategoryAccent {
  icon: LucideIcon;
  tintBg: string;
  tintText: string;
  gradient: string;
  label: string;
}

const CATEGORY_ACCENTS: Record<TemplateCategory, TemplateCategoryAccent> = {
  security: {
    icon: Shield,
    tintBg: "var(--ds-tint-lavender)",
    tintText: "var(--ds-primary-deep)",
    gradient: "linear-gradient(180deg, var(--ds-tint-lavender) 0%, transparent 100%)",
    label: "Security",
  },
  document: {
    icon: FileText,
    tintBg: "var(--ds-tint-lavender)",
    tintText: "#391c57",
    gradient: "linear-gradient(180deg, var(--ds-tint-lavender) 0%, transparent 100%)",
    label: "Document",
  },
  hr: {
    icon: Users,
    tintBg: "var(--ds-tint-mint)",
    tintText: "var(--ds-success)",
    gradient: "linear-gradient(180deg, var(--ds-tint-mint) 0%, transparent 100%)",
    label: "HR",
  },
  it: {
    icon: Wrench,
    tintBg: "var(--ds-tint-sky)",
    tintText: "var(--ds-brand-navy-mid)",
    gradient: "linear-gradient(180deg, var(--ds-tint-sky) 0%, transparent 100%)",
    label: "IT",
  },
  social: {
    icon: Share2,
    tintBg: "var(--ds-tint-rose)",
    tintText: "#a02e6d",
    gradient: "linear-gradient(180deg, var(--ds-tint-rose) 0%, transparent 100%)",
    label: "Social",
  },
  cloud: {
    icon: Cloud,
    tintBg: "var(--ds-tint-sky)",
    tintText: "var(--ds-brand-navy-mid)",
    gradient: "linear-gradient(180deg, var(--ds-tint-sky) 0%, transparent 100%)",
    label: "Cloud",
  },
  delivery: {
    icon: Package,
    tintBg: "var(--ds-tint-peach)",
    tintText: "#793400",
    gradient: "linear-gradient(180deg, var(--ds-tint-peach) 0%, transparent 100%)",
    label: "Delivery",
  },
  software: {
    icon: AppWindow,
    tintBg: "var(--ds-tint-peach)",
    tintText: "#793400",
    gradient: "linear-gradient(180deg, var(--ds-tint-peach) 0%, transparent 100%)",
    label: "Software",
  },
};

const DEFAULT_ACCENT: TemplateCategoryAccent = {
  icon: Shield,
  tintBg: "var(--ds-surface)",
  tintText: "var(--ds-charcoal)",
  gradient: "linear-gradient(180deg, var(--ds-surface) 0%, transparent 100%)",
  label: "Campaign",
};

export function getTemplateCategoryAccent(
  category: TemplateCategory | undefined,
): TemplateCategoryAccent {
  if (!category) return DEFAULT_ACCENT;
  return CATEGORY_ACCENTS[category] ?? DEFAULT_ACCENT;
}
