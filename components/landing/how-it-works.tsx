"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { easeOut } from "./motion-config";
import { landingContainer, landingSectionY } from "./landing-layout";

const steps = [
  {
    number: "1",
    label: "Template",
    description: "Choose a realistic phishing email from our library of proven templates.",
    color: "#5645d4",
    bg: "#e6e0f5",
    image: "/landing/step-template.png",
  },
  {
    number: "2",
    label: "Settings",
    description: "Configure audience, schedule, sender name and branding in minutes.",
    color: "#0075de",
    bg: "#dcecfa",
    image: "/landing/step-settings.png",
  },
  {
    number: "3",
    label: "Review & launch",
    description: "Confirm recipients and campaign details, then hit launch.",
    color: "#1aae39",
    bg: "#d9f3e1",
    image: "/landing/step-launch.png",
  },
];

export function HowItWorks() {
  const prefersReduced = useReducedMotion();

  return (
    <section id="how-it-works" className={`${landingSectionY} bg-white scroll-mt-24`}>
      <div className={landingContainer}>
        <motion.div
          initial={prefersReduced ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: easeOut }}
          className="text-center mb-12 md:mb-16"
        >
          <h2
            className="font-semibold text-[#1a1a1a]"
            style={{ fontSize: "clamp(28px, 4vw, 36px)", letterSpacing: "-0.5px", lineHeight: 1.2 }}
          >
            Launch a campaign in three steps
          </h2>
          <p className="mt-3 text-base text-[#787671]">
            From zero to first simulation in under 10 minutes.
          </p>
        </motion.div>

        <div className="relative">
          <div className="hidden md:block absolute top-[28px] left-0 right-0 px-[calc(16.6%+24px)] h-2">
            <svg viewBox="0 0 100 8" preserveAspectRatio="none" className="w-full h-full">
              <motion.path
                d="M0 4 Q25 0 50 4 T100 4"
                fill="none"
                stroke="#e5e3df"
                strokeWidth="2"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                whileInView={{ pathLength: 1 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 1.2, ease: easeOut, delay: 0.3 }}
              />
            </svg>
          </div>

          <div className="flex flex-col md:flex-row md:items-start gap-8 md:gap-0">
            {steps.map((step, i) => (
              <div
                key={step.label}
                className="flex flex-col items-center gap-4 md:flex-col md:flex-1 md:items-center relative"
              >
                {i < steps.length - 1 && (
                  <div
                    className="md:hidden absolute left-1/2 -translate-x-1/2 top-[56px] w-0.5 bottom-[-32px] bg-[#e5e3df]"
                    aria-hidden
                  />
                )}

                <motion.div
                  initial={prefersReduced ? false : { opacity: 0, scale: 0.7 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ type: "spring", stiffness: 260, damping: 22, delay: i * 0.15 }}
                  className="shrink-0 w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold z-10"
                  style={{ backgroundColor: step.bg, color: step.color, border: `2px solid ${step.color}20` }}
                >
                  {step.number}
                </motion.div>

                <motion.div
                  initial={prefersReduced ? false : { opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.5, ease: easeOut, delay: i * 0.15 + 0.1 }}
                  className="w-full md:text-center pb-8 md:pb-0 md:flex-1 md:max-w-[280px]"
                >
                  <div
                    className="relative w-full max-w-[280px] mx-auto mb-4 aspect-[10/7] rounded-[10px] border border-[#e5e3df] overflow-hidden shadow-sm bg-[#fafaf9]"
                    aria-hidden
                  >
                    <Image
                      src={step.image}
                      alt=""
                      fill
                      sizes="(max-width: 768px) 90vw, 280px"
                      className="object-cover object-center"
                    />
                  </div>
                  <div
                    className="font-semibold text-[#1a1a1a] mb-1 text-center"
                    style={{ fontSize: "17px" }}
                  >
                    {step.label}
                  </div>
                  <p
                    className="text-sm text-[#787671] text-center md:mx-auto"
                    style={{ lineHeight: 1.6 }}
                  >
                    {step.description}
                  </p>
                </motion.div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
