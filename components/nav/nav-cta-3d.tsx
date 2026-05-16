"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { springSnappy } from "@/components/landing/motion-config";
import { cn } from "@/lib/utils";

type NavCta3DProps = {
  href: string;
  children: React.ReactNode;
  className?: string;
  compact?: boolean;
  variant?: "solid" | "glass";
  onClick?: () => void;
};

export function NavCta3D({
  href,
  children,
  className,
  compact = false,
  variant = "solid",
  onClick,
}: NavCta3DProps) {
  const prefersReduced = useReducedMotion();

  if (variant === "glass") {
    return (
      <Link
        href={href}
        onClick={onClick}
        className={cn(
          "inline-flex items-center justify-center font-medium text-white rounded-[8px] landing-glass-primary transition-all duration-200 hover:brightness-110",
          compact ? "px-3 py-1.5 text-sm" : "px-4 py-2 text-sm",
          className,
        )}
      >
        {children}
      </Link>
    );
  }

  return (
    <Link href={href} onClick={onClick} className={cn("inline-block group", className)}>
      <motion.div style={{ perspective: 600 }}>
        <motion.div
          className="relative"
          initial="rest"
          whileHover={prefersReduced ? "rest" : "hover"}
          whileTap={prefersReduced ? "rest" : "tap"}
          variants={{
            rest: { y: 0, rotateX: 0 },
            hover: { y: -3, rotateX: -4 },
            tap: { y: 2, rotateX: 6 },
          }}
          transition={springSnappy}
          style={{ transformStyle: "preserve-3d" }}
        >
          <span
            className={cn(
              "absolute inset-0 rounded-[8px] translate-y-[3px]",
              "bg-[var(--ds-primary-deep)]",
            )}
            aria-hidden
          />
          <span
            className={cn(
              "relative flex items-center justify-center font-medium text-white rounded-[8px]",
              "bg-[var(--ds-primary)] overflow-hidden",
              compact ? "px-3 py-1.5 text-sm" : "px-4 py-2 text-sm",
            )}
          >
            <motion.span
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent skew-x-12 pointer-events-none"
              variants={{
                rest: { x: "-100%" },
                hover: { x: "200%" },
                tap: { x: "200%" },
              }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              aria-hidden
            />
            <span className="relative z-[1]">{children}</span>
          </span>
        </motion.div>
      </motion.div>
    </Link>
  );
}

type NavLoginLinkProps = {
  href: string;
  children: React.ReactNode;
  variant: "hero" | "scrolled" | "sheet";
  className?: string;
  onClick?: () => void;
};

export function NavLoginLink({
  href,
  children,
  variant,
  className,
  onClick,
}: NavLoginLinkProps) {
  const prefersReduced = useReducedMotion();

  const colorClass =
    variant === "hero"
      ? "text-white/70 hover:text-white"
      : variant === "sheet"
        ? "text-[#5d5b54] border border-[#c8c4be] hover:bg-[#f6f5f4]"
        : "text-[#5d5b54] hover:text-[#1a1a1a]";

  return (
    <motion.div
      whileHover={prefersReduced ? undefined : { y: -2 }}
      whileTap={prefersReduced ? undefined : { y: 0 }}
      transition={springSnappy}
      className="inline-block"
    >
      <Link
        href={href}
        onClick={onClick}
        className={cn(
          "px-4 py-2 text-sm font-medium rounded-[8px] transition-colors",
          variant === "sheet" && "flex w-full items-center justify-center min-h-[44px]",
          colorClass,
          className,
        )}
      >
        {children}
      </Link>
    </motion.div>
  );
}
