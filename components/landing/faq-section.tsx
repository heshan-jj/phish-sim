"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ChevronDown, HelpCircle } from "lucide-react";
import { easeOut, springSnappy, staggerFast, fadeUp } from "./motion-config";
import { landingContainer, landingSectionY } from "./landing-layout";
import type { LandingAuthProps } from "./types";

const faqs = [
  {
    q: "Is this real phishing?",
    a: "No. PhishSim runs controlled simulations inside your organization only. Emails are sent from your campaign settings, clicks are tracked for training metrics, and no real credentials are harvested or stored.",
  },
  {
    q: "Do you ever store employee passwords?",
    a: "Never. If someone enters credentials on a simulated landing page, that input is discarded immediately. We only record that a submission occurred so you can trigger follow-up training.",
  },
  {
    q: "How do we add employees?",
    a: "Import a CSV in minutes or add people manually from the employee dashboard. Tag by department, role, or risk level so your next campaign targets the right groups without extra spreadsheets.",
  },
  {
    q: "How fast can we launch a campaign?",
    a: "Most teams go from signup to a live simulation in under ten minutes: pick a template, choose recipients, review the landing page, and send. Analytics update in real time as results come in.",
  },
  {
    q: "Can we run simulations for specific teams only?",
    a: "Yes. Filter by department, seniority, or custom tags and run focused campaigns—for example, finance-only credential tests or new-hire onboarding drills—without emailing the whole company.",
  },
  {
    q: "What do we see in analytics?",
    a: "Track opens, clicks, and reported rates per campaign and per department. Spot repeat clickers, compare quarters, and use the data to prioritize who needs coaching next.",
  },
  {
    q: "Is there a free way to try it?",
    a: "Yes. Sign up free, import your roster, and run your first campaign with full access to templates, the campaign wizard, and live dashboards—no credit card required to get started.",
  },
] as const;

function FAQItem({
  q,
  a,
  index,
  isOpen,
  onToggle,
}: {
  q: string;
  a: string;
  index: number;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const prefersReduced = useReducedMotion();

  return (
    <motion.div
      variants={fadeUp}
      transition={{ duration: 0.5, ease: easeOut }}
      layout
      className={`rounded-[12px] border transition-colors duration-200 ${
        isOpen
          ? "border-[#5645d4]/30 bg-[#e6e0f5]/40 shadow-sm"
          : "border-transparent bg-transparent hover:bg-[#f6f5f4]/80"
      }`}
    >
      <button
        type="button"
        id={`faq-${index}`}
        onClick={onToggle}
        className="flex w-full items-start justify-between gap-4 px-4 py-4 text-left min-h-[44px] cursor-pointer sm:px-5 sm:py-5"
        aria-expanded={isOpen}
        aria-controls={`faq-panel-${index}`}
      >
        <span
          className={`font-semibold break-words text-[15px] leading-snug sm:text-base transition-colors ${
            isOpen ? "text-[#4534b3]" : "text-[#1a1a1a]"
          }`}
        >
          {q}
        </span>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={prefersReduced ? { duration: 0 } : springSnappy}
          className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] transition-colors ${
            isOpen ? "bg-[#5645d4] text-white" : "bg-[#f6f5f4] text-[#787671]"
          }`}
        >
          <ChevronDown className="h-4 w-4" aria-hidden />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            id={`faq-panel-${index}`}
            role="region"
            aria-labelledby={`faq-${index}`}
            initial={prefersReduced ? false : { height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={prefersReduced ? undefined : { height: 0, opacity: 0 }}
            transition={{ duration: 0.32, ease: easeOut }}
            className="overflow-hidden"
          >
            <p
              className="px-4 pb-4 text-sm text-[#5d5b54] sm:px-5 sm:pb-5"
              style={{ lineHeight: 1.75 }}
            >
              {a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function FAQSection({ isAuthenticated }: LandingAuthProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const prefersReduced = useReducedMotion();

  const handleToggle = (index: number) => {
    setOpenIndex((current) => (current === index ? null : index));
  };

  return (
    <section
      id="faq"
      className={`${landingSectionY} scroll-mt-24 overflow-x-clip bg-[var(--ds-landing-surface)]`}
    >
      <motion.div className={landingContainer}>
        <motion.div
          initial={prefersReduced ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: easeOut }}
          className="mx-auto mb-10 max-w-[720px] text-center"
        >
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#d7d4cf] bg-white px-3 py-1 text-xs font-semibold text-[#5d5b54]">
            <HelpCircle className="h-3.5 w-3.5 text-[#5645d4]" aria-hidden />
            FAQ
          </span>
          <h2
            className="mt-4 font-semibold text-[#1a1a1a]"
            style={{ fontSize: "clamp(28px, 4vw, 40px)", letterSpacing: "-0.6px", lineHeight: 1.2 }}
          >
            Answers before you launch
          </h2>
          <p className="mx-auto mt-3 max-w-[52ch] text-sm text-[#787671] sm:text-base">
            Everything security and IT leads ask when rolling out phishing simulations—setup, safety,
            targeting, and what your team actually sees.
          </p>
        </motion.div>

        <motion.div
          variants={staggerFast}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-60px" }}
          className="mx-auto max-w-[720px] space-y-2 rounded-[16px] border border-[#e5e3df] bg-white p-2 shadow-[0_4px_24px_rgba(10,21,48,0.04)] sm:p-3"
        >
          {faqs.map((faq, i) => (
            <FAQItem
              key={faq.q}
              q={faq.q}
              a={faq.a}
              index={i}
              isOpen={openIndex === i}
              onToggle={() => handleToggle(i)}
            />
          ))}
        </motion.div>

        <motion.p
          initial={prefersReduced ? false : { opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: easeOut, delay: 0.2 }}
          className="mx-auto mt-8 max-w-[48ch] text-center text-sm text-[#787671]"
        >
          Still have questions?{" "}
          <a
            href={isAuthenticated ? "/dashboard" : "/signup"}
            className="font-medium text-[#5645d4] underline-offset-2 hover:underline"
          >
            {isAuthenticated ? "Go to dashboard" : "Start free"}
          </a>{" "}
          and explore the dashboard, or jump to{" "}
          <a
            href="#pricing"
            className="font-medium text-[#5645d4] underline-offset-2 hover:underline"
            onClick={(e) => {
              e.preventDefault();
              document.querySelector("#pricing")?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            pricing
          </a>
          .
        </motion.p>
      </motion.div>
    </section>
  );
}
