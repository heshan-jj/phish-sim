"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { springSnappy } from "@/components/landing/motion-config";
import { cn } from "@/lib/utils";

type NavLinkVariant = "hero" | "scrolled" | "app" | "sheet" | "appSheet";

type NavLinkMotionProps = {
  children: React.ReactNode;
  variant: NavLinkVariant;
  active?: boolean;
  href?: string;
  onClick?: () => void;
  className?: string;
  layoutId?: string;
};

const variantStyles: Record<
  NavLinkVariant,
  { base: string; hoverBg: string; activeText?: string }
> = {
  hero: {
    base: "text-white/70",
    hoverBg: "hover:bg-white/10 hover:text-white",
  },
  scrolled: {
    base: "text-[#5d5b54]",
    hoverBg: "hover:text-[#1a1a1a] hover:bg-[#f6f5f4]",
  },
  app: {
    base: "text-[var(--ds-steel)]",
    hoverBg: "hover:text-[var(--ds-ink)] hover:bg-ds-surface/80",
  },
  sheet: {
    base: "text-[#37352f]",
    hoverBg: "hover:bg-[#f6f5f4]",
  },
  appSheet: {
    base: "text-[var(--ds-steel)]",
    hoverBg: "hover:text-[var(--ds-ink)] hover:bg-[var(--ds-surface)]",
  },
};

export function NavLinkMotion({
  children,
  variant,
  active = false,
  href,
  onClick,
  className,
  layoutId = "dashboard-active-pill",
}: NavLinkMotionProps) {
  const prefersReduced = useReducedMotion();
  const styles = variantStyles[variant];
  const isApp = variant === "app";
  const isAppSheet = variant === "appSheet";
  const isSheetLike = variant === "sheet" || isAppSheet;
  const showActivePill = isApp && active;

  const sharedClass = cn(
    "relative inline-flex px-3 py-2 text-sm font-medium rounded-[8px] cursor-pointer transition-colors",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ds-primary)] focus-visible:ring-offset-2",
    styles.base,
    (!isApp || !active) && !isAppSheet && styles.hoverBg,
    isAppSheet && !active && styles.hoverBg,
    active && isApp && "text-[var(--ds-ink)]",
    active &&
      isAppSheet &&
      "font-[600] text-[var(--ds-ink)] bg-[var(--ds-surface)] border-l-[3px] border-[var(--ds-primary)] pl-[calc(0.75rem-3px)]",
    isAppSheet && "w-full text-left min-h-[44px] text-base rounded-[8px]",
    className,
  );

  const motionProps = {
    className: cn(
      sharedClass,
      "group",
      variant === "sheet" && "w-full text-left min-h-[44px] text-base",
    ),
    whileHover: prefersReduced ? undefined : { y: -2 },
    whileTap: prefersReduced ? undefined : { scale: 0.98 },
    transition: springSnappy,
  };

  const inner = (
    <>
      {showActivePill && (
        <motion.span
          layoutId={layoutId}
          className="absolute inset-0 rounded-[8px]"
          style={{ backgroundColor: "var(--ds-surface)" }}
          transition={{ type: "spring", stiffness: 380, damping: 32 }}
        />
      )}
      <span className="relative z-[1]">{children}</span>
      {!isApp && !isAppSheet && !prefersReduced && (
        <span
          className="absolute bottom-1 left-3 right-3 h-[2px] rounded-full origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-200 pointer-events-none"
          style={{ backgroundColor: "var(--ds-primary)" }}
        />
      )}
    </>
  );

  if (href) {
    return (
      <motion.div
        whileHover={prefersReduced || isAppSheet ? undefined : { y: -2 }}
        whileTap={prefersReduced || isAppSheet ? undefined : { scale: 0.98 }}
        transition={springSnappy}
        className={isAppSheet ? "block w-full" : "inline-block"}
      >
        <Link
          href={href}
          className={cn(sharedClass, "group", isAppSheet ? "flex w-full" : "inline-flex")}
          onClick={onClick}
        >
          {inner}
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.button type="button" onClick={onClick} {...motionProps}>
      {inner}
    </motion.button>
  );
}
