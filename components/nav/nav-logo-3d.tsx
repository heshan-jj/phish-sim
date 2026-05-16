"use client";

import Link from "next/link";
import type { MouseEvent } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { BrandLogo } from "@/components/brand/brand-logo";
import { springSoft } from "@/components/landing/motion-config";
import { cn } from "@/lib/utils";

type NavLogo3DProps = {
  variant: "marketing" | "app";
  /** When true, marketing nav uses full lockup on a light background */
  marketingScrolled?: boolean;
  href?: string;
  onClick?: (event: MouseEvent<HTMLAnchorElement>) => void;
  wordmarkClassName?: string;
  showWordmark?: boolean;
  /** Render mark only (no wrapping link) for use inside a parent link */
  linkless?: boolean;
};

export function NavLogo3D({
  variant,
  marketingScrolled = false,
  href = "/",
  onClick,
  wordmarkClassName = "",
  showWordmark = true,
  linkless = false,
}: NavLogo3DProps) {
  const prefersReduced = useReducedMotion();
  const isMarketing = variant === "marketing";

  const heroOnDark = isMarketing && !marketingScrolled;

  const floatAnim = prefersReduced
    ? undefined
    : isMarketing
      ? { y: [0, -3, 0], rotateZ: [0, 0.5, 0] }
      : { y: [0, -2, 0] };

  const floatTransition = prefersReduced
    ? undefined
    : { duration: 5, repeat: Infinity, ease: "easeInOut" as const };

  const hoverTilt = prefersReduced
    ? {}
    : isMarketing
      ? { rotateY: 12, rotateX: -6, scale: 1.04, y: -2 }
      : { rotateY: 8, rotateX: -4, scale: 1.03, y: -1 };

  const content = (
    <>
      <motion.div
        animate={floatAnim}
        transition={floatTransition}
        whileHover={linkless ? undefined : hoverTilt}
        style={{ transformStyle: "preserve-3d" }}
      >
        <motion.div
          className="relative shrink-0"
          whileTap={prefersReduced ? undefined : { scale: 0.95 }}
          transition={springSoft}
        >
          <BrandLogo
            variant="lockup"
            priority={isMarketing}
            className={cn(
              "h-11 w-auto max-w-[260px] sm:h-12 sm:max-w-[290px]",
              heroOnDark && "brightness-0 invert",
            )}
          />
        </motion.div>
      </motion.div>
      {showWordmark && (
        <span
          className={`font-semibold text-base tracking-tight transition-colors truncate min-w-0 ${wordmarkClassName}`}
        >
          PhishSim
        </span>
      )}
    </>
  );

  const wrapperClass = "flex items-center gap-2 shrink-0 min-w-0 group";

  if (linkless) {
    return (
      <span className={wrapperClass}>
        <motion.div style={{ perspective: 900 }}>{content}</motion.div>
      </span>
    );
  }

  return (
    <Link href={href} className={wrapperClass} onClick={onClick}>
      <motion.div style={{ perspective: 900 }}>{content}</motion.div>
    </Link>
  );
}
