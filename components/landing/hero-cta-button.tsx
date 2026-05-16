"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { springSnappy } from "./motion-config";
import { cn } from "@/lib/utils";

type HeroCtaButtonProps = {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary";
  className?: string;
  id?: string;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
};

export function HeroCtaButton({
  href,
  children,
  variant = "primary",
  className,
  id,
  onClick,
}: HeroCtaButtonProps) {
  const prefersReduced = useReducedMotion();
  const isPrimary = variant === "primary";

  return (
    <Link
      href={href}
      id={id}
      onClick={onClick}
      className={cn("inline-block w-full sm:w-auto group/hero-cta", className)}
    >
      <motion.div style={{ perspective: 900 }}>
        <motion.div
          className="relative"
          initial="rest"
          whileHover={prefersReduced ? "rest" : "hover"}
          whileTap={prefersReduced ? "rest" : "tap"}
          variants={{
            rest: { y: 0, scale: 1, rotateX: 0 },
            hover: { y: -5, scale: 1.03, rotateX: isPrimary ? -4 : -2 },
            tap: { y: 1, scale: 0.98, rotateX: 3 },
          }}
          transition={springSnappy}
          style={{ transformStyle: "preserve-3d" }}
        >
          <motion.span
            className="absolute -inset-[3px] rounded-[10px] pointer-events-none"
            variants={{
              rest: { opacity: 0, scale: 0.92 },
              hover: { opacity: 1, scale: 1 },
              tap: { opacity: 0.5, scale: 0.98 },
            }}
            transition={{ duration: 0.25 }}
            style={{
              background: isPrimary
                ? "color-mix(in srgb, var(--ds-primary) 55%, transparent)"
                : "color-mix(in srgb, var(--ds-brand-teal) 38%, transparent)",
              filter: "blur(10px)",
            }}
            aria-hidden
          />

          <motion.span
            className={cn(
              "relative flex w-full items-center justify-center gap-1.5 overflow-hidden rounded-[8px] px-5 py-3 text-sm font-medium min-h-[44px]",
              isPrimary ? "hero-cta-primary text-white" : "hero-cta-secondary text-white/90",
            )}
            variants={{
              rest: {
                boxShadow: isPrimary
                  ? "0 1px 0 rgba(255,255,255,0.08) inset, 0 8px 28px rgba(0,0,0,0.28)"
                  : "0 1px 0 rgba(255,255,255,0.06) inset, 0 4px 20px rgba(0,0,0,0.2)",
              },
              hover: {
                boxShadow: isPrimary
                  ? "0 1px 0 rgba(255,255,255,0.14) inset, 0 12px 40px color-mix(in srgb, var(--ds-primary) 50%, transparent), 0 0 0 1px color-mix(in srgb, var(--ds-brand-purple) 40%, transparent)"
                  : "0 1px 0 rgba(255,255,255,0.12) inset, 0 10px 32px color-mix(in srgb, var(--ds-brand-teal) 35%, transparent), 0 0 0 1px color-mix(in srgb, var(--ds-brand-teal) 30%, var(--ds-glass-border))",
              },
              tap: {
                boxShadow: "0 2px 12px rgba(0,0,0,0.25)",
              },
            }}
            transition={{ duration: 0.22 }}
          >
            <motion.span
              className="absolute inset-0 pointer-events-none"
              variants={{
                rest: { opacity: 0 },
                hover: { opacity: 1 },
                tap: { opacity: 0.85 },
              }}
              transition={{ duration: 0.2 }}
              style={{
                background: isPrimary
                  ? "color-mix(in srgb, var(--ds-primary) 42%, transparent)"
                  : "color-mix(in srgb, var(--ds-brand-teal) 22%, transparent)",
              }}
              aria-hidden
            />

            {isPrimary && (
              <motion.span
                className="absolute inset-0 skew-x-12 bg-white/30 pointer-events-none"
                variants={{
                  rest: { x: "-120%" },
                  hover: { x: "220%" },
                  tap: { x: "220%" },
                }}
                transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
                aria-hidden
              />
            )}

            {!isPrimary && (
              <motion.span
                className="absolute bottom-0 left-1/2 h-[2px] w-0 -translate-x-1/2 rounded-full pointer-events-none"
                variants={{
                  rest: { width: 0, opacity: 0 },
                  hover: { width: "70%", opacity: 1 },
                }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                style={{
                  backgroundColor: "var(--ds-primary)",
                }}
                aria-hidden
              />
            )}

            <span className="relative z-[1] flex items-center justify-center gap-1.5">
              {children}
              {!isPrimary && (
                <motion.span
                  className="inline-block text-white/80"
                  variants={{
                    rest: { x: 0, opacity: 0.85 },
                    hover: { x: 5, opacity: 1 },
                    tap: { x: 2 },
                  }}
                  transition={springSnappy}
                  aria-hidden
                >
                  →
                </motion.span>
              )}
            </span>
          </motion.span>
        </motion.div>
      </motion.div>
    </Link>
  );
}
