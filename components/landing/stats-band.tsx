"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { easeOut } from "./motion-config";
import { landingContainer, landingSectionY } from "./landing-layout";

function MetricSparkline() {
  return (
    <svg
      className="absolute bottom-3 right-3 w-16 h-8 opacity-30 pointer-events-none"
      viewBox="0 0 64 32"
      fill="none"
      aria-hidden
    >
      <path
        d="M0 28 L16 20 L32 24 L48 8 L64 4"
        stroke="#1aae39"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const metrics = [
  { value: 67, suffix: "%", prefix: "↓", label: "Avg click rate after 3 campaigns", sparkline: true },
  { value: 10, suffix: " min", prefix: "<", label: "Time to first launch", sparkline: false },
  { value: 3, suffix: "", prefix: "", label: "Campaign wizard steps", sparkline: false },
  { value: 100, suffix: "%", prefix: "", label: "Simulated (safe training)", sparkline: false },
];

function CountUp({
  target,
  duration = 1500,
  active,
}: {
  target: number;
  duration?: number;
  active: boolean;
}) {
  const [current, setCurrent] = useState(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (!active) return;
    const start = performance.now();
    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCurrent(Math.round(eased * target));
      if (progress < 1) rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [active, target, duration]);

  return <>{current}</>;
}

export function StatsBand() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const prefersReduced = useReducedMotion();

  return (
    <section
      ref={ref}
      className={`${landingSectionY} bg-[var(--ds-landing-surface)]`}
    >
      <div className={landingContainer}>
        <motion.div
          initial={prefersReduced ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: easeOut }}
          className="text-center mb-10"
        >
          <h2
            className="font-semibold text-[#1a1a1a]"
            style={{ fontSize: "clamp(24px, 3.5vw, 36px)", letterSpacing: "-0.5px" }}
          >
            Security that compounds over time
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 min-[480px]:grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics.map((m, i) => (
            <motion.div
              key={m.label}
              initial={prefersReduced ? false : { opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5, ease: easeOut, delay: i * 0.08 }}
              className="relative bg-white rounded-[12px] p-4 sm:p-6 text-center border border-[var(--ds-hairline)] overflow-hidden"
              style={{ boxShadow: "rgba(15,15,15,0.04) 0px 1px 2px" }}
            >
              {"sparkline" in m && m.sparkline && <MetricSparkline />}
              <div
                className="font-semibold text-[#1a1a1a] tabular-nums text-[28px] sm:text-[32px] md:text-[40px]"
                style={{ lineHeight: 1.1, letterSpacing: "-1px" }}
              >
                {m.prefix}
                {prefersReduced ? m.value : <CountUp target={m.value} active={isInView} />}
                {m.suffix}
              </div>
              <p className="mt-2 text-xs sm:text-sm text-[#787671]" style={{ lineHeight: 1.5 }}>
                {m.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
