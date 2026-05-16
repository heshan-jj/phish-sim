"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

type LandingGlassButtonProps = {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary";
  className?: string;
  id?: string;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
};

const variantClass = {
  primary: "landing-glass-primary text-white hover:brightness-110",
  secondary:
    "landing-glass text-white/90 hover:bg-white/12 hover:text-white hover:border-white/25",
} as const;

export function LandingGlassButton({
  href,
  children,
  variant = "primary",
  className,
  id,
  onClick,
}: LandingGlassButtonProps) {
  return (
    <Link
      href={href}
      id={id}
      onClick={onClick}
      className={cn(
        "inline-flex w-full sm:w-auto items-center justify-center px-5 py-3 text-sm font-medium rounded-[8px] min-h-[44px] transition-all duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
        variantClass[variant],
        className,
      )}
    >
      {children}
    </Link>
  );
}

/** Glass primary on light sections (final CTA matte band) */
export function LandingGlassButtonLight({
  href,
  children,
  variant = "primary",
  className,
  id,
}: Omit<LandingGlassButtonProps, "onClick">) {
  const lightVariant =
    variant === "primary"
      ? "bg-[var(--ds-primary)] text-white hover:bg-[var(--ds-primary-pressed)] shadow-md border border-transparent"
      : "bg-white/80 backdrop-blur-md border border-[var(--ds-hairline-strong)] text-[var(--ds-slate)] hover:bg-white";

  return (
    <Link
      href={href}
      id={id}
      className={cn(
        "inline-flex w-full sm:w-auto items-center justify-center px-6 py-3 text-sm font-medium rounded-[8px] min-h-[44px] transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ds-primary)] focus-visible:ring-offset-2",
        lightVariant,
        className,
      )}
    >
      {children}
    </Link>
  );
}
