"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { easeOut } from "./motion-config";
import { landingContainer, landingSectionY } from "./landing-layout";

export function FinalCTA() {
  const prefersReduced = useReducedMotion();

  return (
    <section className={`${landingSectionY} bg-[var(--ds-landing-surface)]`}>
      <div className={landingContainer}>
        <motion.div
          initial={prefersReduced ? false : { opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: easeOut }}
          className="relative bg-white rounded-[16px] border border-[var(--ds-hairline)] p-6 sm:p-10 md:p-16 text-center overflow-hidden"
          style={{ boxShadow: "rgba(15,15,15,0.04) 0px 4px 12px" }}
        >
          <div
            className="absolute bottom-0 right-0 w-[140px] h-[120px] opacity-40 pointer-events-none hidden sm:block"
            aria-hidden
          >
            <Image
              src="/landing/final-cta.svg"
              alt=""
              width={120}
              height={100}
              className="w-full h-auto"
            />
          </div>

          <h2
            className="font-semibold text-[#1a1a1a] mb-3 relative z-10"
            style={{ fontSize: "clamp(28px, 4vw, 40px)", letterSpacing: "-1px", lineHeight: 1.15 }}
          >
            Ready to test your team?
          </h2>
          <p
            className="text-base text-[#787671] mb-8 max-w-[45ch] mx-auto relative z-10"
            style={{ lineHeight: 1.6 }}
          >
            Join security teams who run monthly simulations and watch click rates drop every quarter.
          </p>

          <div className="flex flex-col w-full max-w-xs mx-auto gap-3 sm:flex-row sm:max-w-none sm:justify-center relative z-10">
            <Link
              href="/signup"
              id="final-cta-primary"
              className="inline-flex w-full sm:w-auto items-center justify-center px-6 py-3 text-sm font-medium rounded-[8px] bg-[#5645d4] text-white hover:bg-[#4534b3] transition-colors min-h-[44px]"
            >
              Start free
            </Link>
            <Link
              href="/login"
              id="final-cta-login"
              className="inline-flex w-full sm:w-auto items-center justify-center px-6 py-3 text-sm font-medium rounded-[8px] border border-[var(--ds-hairline-strong)] text-[#5d5b54] hover:bg-[var(--ds-surface)] transition-colors min-h-[44px]"
            >
              Log in
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
