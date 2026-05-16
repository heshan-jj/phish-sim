"use client";

import Link from "next/link";
import { useRef, useState, useEffect, useCallback } from "react";
import { Check } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { easeOut, fadeUp, springSnappy, staggerFast } from "./motion-config";
import { landingContainer, landingSectionY } from "./landing-layout";
import type { LandingAuthProps } from "./types";

type Plan = {
  name: string;
  monthly: number;
  yearly: number;
  description: string;
  cta: string;
  popular?: boolean;
  features: string[];
};

const PLANS: Plan[] = [
  {
    name: "Starter",
    monthly: 29,
    yearly: 24,
    description: "Best for growing teams launching their first simulation program.",
    cta: "Start with Starter",
    features: [
      "Up to 250 employees",
      "Campaign templates and cloning",
      "Click/open analytics",
      "CSV roster import",
    ],
  },
  {
    name: "Pro",
    monthly: 69,
    yearly: 56,
    description: "For security teams that want full automation and deeper insights.",
    cta: "Choose Pro",
    popular: true,
    features: [
      "Up to 2,000 employees",
      "Department risk heatmaps",
      "Automated follow-up campaigns",
      "Priority email support",
    ],
  },
  {
    name: "Enterprise",
    monthly: 169,
    yearly: 139,
    description: "For orgs with strict controls, custom workflows, and scale.",
    cta: "Talk to Sales",
    features: [
      "Unlimited employees",
      "SAML SSO + SCIM",
      "Custom sender domains",
      "Dedicated success manager",
    ],
  },
];

function PlanCard({
  plan,
  yearly,
  prefersReduced,
  enableHover,
  isAuthenticated,
}: {
  plan: Plan;
  yearly: boolean;
  prefersReduced: boolean | null;
  enableHover: boolean;
  isAuthenticated: boolean;
}) {
  const price = yearly ? plan.yearly : plan.monthly;

  return (
    <motion.article
      variants={fadeUp}
      transition={{ duration: 0.55, ease: easeOut }}
      whileHover={
        enableHover && !prefersReduced
          ? { y: -8, boxShadow: "0 18px 40px rgba(10, 21, 48, 0.12)" }
          : undefined
      }
      className={`relative flex h-full flex-col rounded-[14px] border p-6 md:p-7 ${
        plan.popular ? "bg-[#0f1d40] text-white border-[#3a4d82]" : "bg-white text-[#1a1a1a] border-[var(--ds-hairline)]"
      }`}
    >
      {plan.popular && (
        <span className="absolute top-3 right-3 rounded-full bg-[#f5d75e] px-2.5 py-1 text-[11px] font-semibold text-[#1a1a1a]">
          Most popular
        </span>
      )}

      <h3 className="text-xl font-semibold">{plan.name}</h3>
      <p className={`mt-2 text-sm ${plan.popular ? "text-[#cfd8ff]" : "text-[#6a6861]"}`}>
        {plan.description}
      </p>

      <div className="mt-6 flex min-h-[3.25rem] items-end gap-1.5">
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={`${plan.name}-${yearly ? "yearly" : "monthly"}`}
            initial={prefersReduced ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={prefersReduced ? undefined : { opacity: 0, y: -10 }}
            transition={springSnappy}
            className="text-3xl font-semibold tabular-nums sm:text-4xl"
          >
            ${price}
          </motion.span>
        </AnimatePresence>
        <span className={`pb-1 text-sm ${plan.popular ? "text-[#d7ddff]" : "text-[#787671]"}`}>
          per month
        </span>
      </div>

      <Link
        href={isAuthenticated ? "/dashboard" : "/signup"}
        className={`landing-pressable mt-6 inline-flex min-h-[44px] w-full items-center justify-center rounded-[10px] px-4 py-2 text-sm font-medium ${
          plan.popular
            ? "bg-white text-[#0f1d40] hover:bg-[#f4f6ff] hover:brightness-[0.98]"
            : "bg-[#5645d4] text-white hover:bg-[#4534b3]"
        }`}
      >
        {isAuthenticated ? "Go to dashboard" : plan.cta}
      </Link>

      <ul className="mt-6 space-y-3">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2 text-sm">
            <Check className={`mt-0.5 h-4 w-4 shrink-0 ${plan.popular ? "text-[#8df1ad]" : "text-[#1aae39]"}`} />
            <span className={plan.popular ? "text-[#e1e7ff]" : "text-[#4a4843]"}>{feature}</span>
          </li>
        ))}
      </ul>
    </motion.article>
  );
}

function PricingCarousel({
  yearly,
  prefersReduced,
  isAuthenticated,
}: {
  yearly: boolean;
  prefersReduced: boolean | null;
  isAuthenticated: boolean;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const updateActiveIndex = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const cardWidth = el.querySelector("article")?.clientWidth ?? 1;
    const gap = 16;
    const index = Math.round(el.scrollLeft / (cardWidth + gap));
    setActiveIndex(Math.min(Math.max(index, 0), PLANS.length - 1));
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateActiveIndex, { passive: true });
    return () => el.removeEventListener("scroll", updateActiveIndex);
  }, [updateActiveIndex]);

  return (
    <div className="overflow-x-clip md:hidden">
      <div
        ref={scrollRef}
        className="-mx-4 flex gap-4 overflow-x-auto px-4 pb-1 snap-x snap-mandatory overscroll-x-contain scroll-pl-4 hide-scrollbar [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {PLANS.map((plan) => (
          <div key={plan.name} className="snap-center shrink-0 w-[min(88vw,340px)]">
            <PlanCard
              plan={plan}
              yearly={yearly}
              prefersReduced={prefersReduced}
              enableHover={false}
              isAuthenticated={isAuthenticated}
            />
          </div>
        ))}
      </div>
      <div className="mt-4 flex justify-center gap-2" role="tablist" aria-label="Pricing plans">
        {PLANS.map((plan, i) => (
          <motion.button
            key={plan.name}
            type="button"
            role="tab"
            aria-selected={activeIndex === i}
            aria-label={plan.name}
            onClick={() => {
              const el = scrollRef.current;
              const card = el?.querySelectorAll("article")[i];
              card?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
            }}
            className={`h-2 rounded-full transition-all ${
              activeIndex === i
                ? "w-6 bg-[#5645d4]"
                : "w-2 bg-[#d7d4cf] hover:scale-125 hover:bg-[#bbb8b1] motion-reduce:hover:scale-100"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

export function PricingSection({ isAuthenticated }: LandingAuthProps) {
  const [yearly, setYearly] = useState(false);
  const prefersReduced = useReducedMotion();

  return (
    <section
      id="pricing"
      className={`${landingSectionY} scroll-mt-24 overflow-x-clip bg-[var(--ds-landing-surface)]`}
    >
      <div className={landingContainer}>
        <motion.div
          initial={prefersReduced ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: easeOut }}
          className="mb-10 text-center px-1"
        >
          <span className="inline-flex items-center rounded-full border border-[#d7d4cf] bg-white px-3 py-1 text-xs font-semibold text-[#5d5b54]">
            Simple pricing, no gotchas
          </span>
          <h2
            className="mt-4 font-semibold text-[#1a1a1a]"
            style={{ fontSize: "clamp(28px, 4vw, 40px)", letterSpacing: "-0.6px", lineHeight: 1.2 }}
          >
            Security training plans that scale with your team
          </h2>
          <p className="mx-auto mt-3 max-w-[62ch] text-sm sm:text-base text-[#787671]">
            Pick a plan, launch realistic phishing simulations, and turn risk into measurable behavior change.
          </p>

          <motion.div className="mx-auto mt-6 flex w-full max-w-xs rounded-[10px] border border-[#ddd9d3] bg-white p-1">
            <button
              type="button"
              onClick={() => setYearly(false)}
              className={`flex-1 rounded-[8px] px-4 py-2.5 text-sm font-medium min-h-[44px] transition-[background-color,box-shadow,filter] ${
                !yearly
                  ? "bg-[#5645d4] text-white hover:brightness-110"
                  : "landing-pressable text-[#5d5b54] hover:bg-[#f6f5f4] hover:shadow-sm"
              }`}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setYearly(true)}
              className={`flex-1 rounded-[8px] px-4 py-2.5 text-sm font-medium min-h-[44px] transition-[background-color,box-shadow,filter] ${
                yearly
                  ? "bg-[#5645d4] text-white hover:brightness-110"
                  : "landing-pressable text-[#5d5b54] hover:bg-[#f6f5f4] hover:shadow-sm"
              }`}
            >
              Yearly <span className="text-[11px] opacity-80">(save 18%)</span>
            </button>
          </motion.div>
        </motion.div>

        <PricingCarousel
          yearly={yearly}
          prefersReduced={prefersReduced}
          isAuthenticated={isAuthenticated}
        />

        <motion.div
          variants={staggerFast}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-80px" }}
          className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {PLANS.map((plan) => (
            <PlanCard
              key={plan.name}
              plan={plan}
              yearly={yearly}
              prefersReduced={prefersReduced}
              enableHover
              isAuthenticated={isAuthenticated}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
