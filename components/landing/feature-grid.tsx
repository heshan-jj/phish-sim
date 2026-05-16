"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { Users, Megaphone, BarChart2 } from "lucide-react";
import { easeOut } from "./motion-config";
import { landingContainer, landingSectionY } from "./landing-layout";

const features = [
  {
    tint: "#d9f3e1",
    icon: Users,
    iconColor: "#1aae39",
    title: "Employee roster",
    body: "Import CSV, organize by departments, assign risk tags. One source of truth for your whole org.",
    illustration: "/landing/feature-roster.svg",
  },
  {
    tint: "#dcecfa",
    icon: Megaphone,
    iconColor: "#0075de",
    title: "Campaign builder",
    body: "Pick a template, tune sender and landing page, launch in three steps. Go from idea to live in minutes.",
    illustration: "/landing/feature-campaign.svg",
  },
  {
    tint: "#e6e0f5",
    icon: BarChart2,
    iconColor: "#5645d4",
    title: "Live analytics",
    body: "Opens, clicks, and reports—updated as simulations run. Spot risky departments instantly.",
    illustration: "/landing/feature-analytics.svg",
  },
];

export function FeatureGrid() {
  const prefersReduced = useReducedMotion();

  return (
    <section
      id="features"
      className={`${landingSectionY} scroll-mt-24 bg-[var(--ds-landing-surface)]`}
    >
      <div className={landingContainer}>
        <motion.div
          initial={prefersReduced ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: easeOut }}
          className="text-center mb-10 md:mb-14"
        >
          <h2
            className="font-semibold text-[#1a1a1a]"
            style={{ fontSize: "clamp(28px, 4vw, 36px)", letterSpacing: "-0.5px", lineHeight: 1.2 }}
          >
            Keep your org resilient 24/7
          </h2>
          <p className="mt-3 text-base text-[#787671] max-w-[50ch] mx-auto">
            Everything your security team needs to run a world-class awareness program.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 min-[480px]:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-4 md:mb-6">
          {features.map((feat, i) => {
            const Icon = feat.icon;
            return (
              <motion.div
                key={feat.title}
                initial={prefersReduced ? false : { opacity: 0, y: 48 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.5, ease: easeOut, delay: i * 0.1 }}
                whileHover={prefersReduced ? undefined : { y: -6 }}
                className="rounded-[12px] p-5 sm:p-6 md:p-8 cursor-default transition-shadow flex flex-col bg-white border border-[var(--ds-hairline)]"
                style={{
                  boxShadow: "rgba(15,15,15,0.04) 0px 4px 12px 0px",
                }}
              >
                <div className="flex items-start justify-between gap-4 mb-5">
                  <div
                    className="w-10 h-10 rounded-[8px] flex items-center justify-center shrink-0"
                    style={{ backgroundColor: feat.tint }}
                  >
                    <Icon className="w-5 h-5" style={{ color: feat.iconColor }} />
                  </div>
                  <Image
                    src={feat.illustration}
                    alt=""
                    width={120}
                    height={100}
                    className="w-[100px] h-auto shrink-0 opacity-90"
                    aria-hidden
                  />
                </div>
                <h3
                  className="font-semibold text-[#37352f] mb-2"
                  style={{ fontSize: "18px", lineHeight: 1.3 }}
                >
                  {feat.title}
                </h3>
                <p className="text-sm text-[#5d5b54] flex-1" style={{ lineHeight: 1.6 }}>
                  {feat.body}
                </p>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={prefersReduced ? false : { opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: easeOut, delay: 0.3 }}
          className="rounded-[12px] p-5 sm:p-6 md:p-10"
          style={{ backgroundColor: "#f9e79f" }}
        >
          <div className="flex flex-col items-center gap-6 lg:flex-row lg:items-center lg:justify-between lg:gap-10">
            <div className="w-full text-center lg:flex-1 lg:min-w-0 lg:text-left">
              <h3
                className="font-semibold text-[#37352f] mb-2"
                style={{ fontSize: "22px", lineHeight: 1.3 }}
              >
                Turn every click into a teachable moment.
              </h3>
              <p className="text-sm text-[#5d5b54] max-w-[55ch] mx-auto lg:mx-0" style={{ lineHeight: 1.6 }}>
                When an employee clicks a simulated link, they&apos;re instantly enrolled in a micro-lesson—so the lesson lands when it matters most.
              </p>
            </div>
            <div className="flex w-full flex-col items-center gap-4 lg:w-auto lg:shrink-0 lg:items-end">
              <Image
                src="/landing/banner-click-lesson.svg"
                alt="Click suspicious link, then complete micro-lesson"
                width={200}
                height={80}
                className="w-full max-w-[min(100%,320px)] h-auto mx-auto lg:mx-0"
              />
              <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[8px] bg-[#37352f] text-white text-sm font-medium min-h-[44px]">
                <span className="text-[#f9e79f]">→</span> Coming soon
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
