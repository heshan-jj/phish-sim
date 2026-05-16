"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { HeroMockup } from "./hero-mockup";
import { HeroStickyNotes } from "./hero-decorations";
import { HeroCtaButton } from "./hero-cta-button";
import { HERO_BACKGROUND_SRC } from "./landing-theme";
import { easeOut, staggerContainer, fadeUp, ctaPop } from "./motion-config";
import { landingContainer } from "./landing-layout";
import type { LandingAuthProps } from "./types";

const DOT_COLORS_DESKTOP = [
  { color: "#ff64c8", size: 14, top: "12%", left: "6%" },
  { color: "#f5d75e", size: 18, top: "20%", left: "14%" },
  { color: "#2a9d99", size: 12, top: "35%", left: "4%" },
  { color: "#1aae39", size: 16, top: "55%", left: "8%" },
  { color: "#dd5b00", size: 10, top: "70%", left: "15%" },
  { color: "#7b3ff2", size: 14, top: "80%", left: "5%" },
  { color: "#ff64c8", size: 10, top: "18%", right: "8%" },
  { color: "#f5d75e", size: 16, top: "30%", right: "5%" },
  { color: "#2a9d99", size: 14, top: "50%", right: "10%" },
  { color: "#1aae39", size: 12, top: "65%", right: "6%" },
  { color: "#dd5b00", size: 18, top: "78%", right: "12%" },
  { color: "#7b3ff2", size: 10, top: "88%", right: "4%" },
];

const DOT_COLORS_MOBILE = [
  { color: "#ff64c8", size: 10, top: "15%", left: "3%" },
  { color: "#f5d75e", size: 12, top: "40%", left: "2%" },
  { color: "#2a9d99", size: 8, top: "65%", left: "4%" },
  { color: "#dd5b00", size: 10, top: "20%", right: "3%" },
  { color: "#1aae39", size: 12, top: "50%", right: "2%" },
];

function FloatingDot({
  color,
  size,
  style,
  delay = 0,
  duration = 6,
  prefersReduced,
}: {
  color: string;
  size: number;
  style: React.CSSProperties;
  delay?: number;
  duration?: number;
  prefersReduced: boolean | null;
}) {
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{
        width: size,
        height: size,
        backgroundColor: color,
        opacity: 0.15,
        ...style,
      }}
      animate={prefersReduced ? undefined : { y: [0, -6, 0] }}
      transition={
        prefersReduced
          ? undefined
          : { duration, repeat: Infinity, ease: "easeInOut", delay }
      }
    />
  );
}

export function HeroSection({ isAuthenticated }: LandingAuthProps) {
  const prefersReduced = useReducedMotion();

  return (
    <section
      className="relative overflow-hidden touch-pan-y pb-16 sm:pb-20 md:pb-24 lg:pb-28 bg-[var(--ds-hero-matte)]"
      style={{
        paddingTop: "calc(64px + 2rem + env(safe-area-inset-top))",
      }}
    >
      {/* Background image */}
      <div className="absolute inset-0 z-0">
        <Image
          src={HERO_BACKGROUND_SRC}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
          aria-hidden
        />
        <motion.div
          className="absolute inset-0 bg-black/60"
          aria-hidden
        />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.25)",
          }}
          aria-hidden
        />
      </div>

      <HeroStickyNotes prefersReduced={prefersReduced} />

      <motion.div className="hidden md:block absolute inset-0 z-[1] pointer-events-none">
        {DOT_COLORS_DESKTOP.map((dot, i) => {
          const { color, size, ...rest } = dot;
          return (
            <FloatingDot
              key={i}
              color={color}
              size={size}
              style={rest as React.CSSProperties}
              delay={(i * 0.9) % 5}
              duration={6 + (i % 3)}
              prefersReduced={prefersReduced}
            />
          );
        })}
      </motion.div>

      <motion.div className="block md:hidden absolute inset-0 z-[1] pointer-events-none">
        {DOT_COLORS_MOBILE.map((dot, i) => {
          const { color, size, ...rest } = dot;
          return (
            <FloatingDot
              key={i}
              color={color}
              size={size}
              style={rest as React.CSSProperties}
              delay={(i * 1.1) % 4}
              duration={7 + (i % 2)}
              prefersReduced={prefersReduced}
            />
          );
        })}
      </motion.div>

      <div className={`relative z-20 ${landingContainer}`}>
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="text-center mb-10 md:mb-14"
        >
          <motion.div
            variants={fadeUp}
            transition={{ duration: 0.7, ease: easeOut }}
            className="landing-glass inline-flex flex-wrap items-center justify-center gap-2 px-3 py-1.5 rounded-full mb-6 max-w-full"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-[#1aae39] animate-pulse shrink-0" />
            <span className="text-[10px] sm:text-[11px] font-semibold text-white/70 uppercase tracking-wide text-center">
              Security Awareness Training
            </span>
          </motion.div>

          <motion.h1
            variants={fadeUp}
            transition={{ duration: 0.7, ease: easeOut }}
            className="font-semibold text-white text-center text-[36px] min-[480px]:text-[48px] md:text-[56px] lg:text-[72px] xl:text-[80px] tracking-[-0.02em] xl:tracking-[-2px] max-w-[900px] mx-auto mb-5"
            style={{ lineHeight: 1.05 }}
          >
            Meet the human firewall.
          </motion.h1>

          <motion.p
            variants={fadeUp}
            transition={{ duration: 0.7, ease: easeOut }}
            className="text-base sm:text-lg px-4 mx-auto text-center mb-8 max-w-[65ch] text-white/65"
            style={{ lineHeight: 1.6 }}
          >
            Run realistic phishing simulations, track who clicks, and turn mistakes into training—in minutes, not months.
          </motion.p>

          <motion.div
            variants={{
              initial: { opacity: 0, y: 28 },
              animate: {
                opacity: 1,
                y: 0,
                transition: { staggerChildren: 0.1, delayChildren: 0.05 },
              },
            }}
            transition={{ duration: 0.6, ease: easeOut }}
            className="flex flex-col w-full max-w-sm mx-auto gap-3 sm:flex-row sm:max-w-none sm:justify-center"
          >
            <motion.div variants={ctaPop} transition={{ duration: 0.5, ease: easeOut }}>
              <HeroCtaButton
                href={isAuthenticated ? "/dashboard" : "/signup"}
                id="hero-cta-primary"
                variant="primary"
              >
                {isAuthenticated ? "Go to dashboard" : "Start simulating free"}
              </HeroCtaButton>
            </motion.div>
            <motion.div variants={ctaPop} transition={{ duration: 0.5, ease: easeOut }}>
              <HeroCtaButton
                href="#how-it-works"
                id="hero-cta-secondary"
                variant="secondary"
                onClick={(e) => {
                  e.preventDefault();
                  document.querySelector("#how-it-works")?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                See how it works
              </HeroCtaButton>
            </motion.div>
          </motion.div>
        </motion.div>

        <div className="relative z-10">
          <HeroMockup />
        </div>
      </div>
    </section>
  );
}
