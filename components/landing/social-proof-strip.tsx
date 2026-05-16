"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { staggerFast, fadeUp, easeOut } from "./motion-config";
import { landingContainer, landingSectionY } from "./landing-layout";

const LOGOS = [
  { src: "/landing/logos/microsoft.svg", name: "Microsoft", width: 110 },
  { src: "/landing/logos/google.svg", name: "Google", width: 90 },
  { src: "/landing/logos/amazon.svg", name: "Amazon", width: 100 },
  { src: "/landing/logos/cisco.svg", name: "Cisco", width: 80 },
  { src: "/landing/logos/ibm.svg", name: "IBM", width: 70 },
  { src: "/landing/logos/salesforce.svg", name: "Salesforce", width: 120 },
] as const;

function LogoGrid() {
  return (
    <motion.div
      variants={staggerFast}
      initial="initial"
      whileInView="animate"
      viewport={{ once: true, margin: "-60px" }}
      className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6 items-center"
    >
      {LOGOS.map((logo) => (
        <motion.div
          key={logo.name}
          variants={fadeUp}
          transition={{ duration: 0.5, ease: easeOut }}
          className="flex items-center justify-center py-3 px-2 opacity-80"
        >
          <Image
            src={logo.src}
            alt={`${logo.name} logo`}
            width={logo.width}
            height={32}
            className="h-8 w-auto max-w-full"
          />
        </motion.div>
      ))}
    </motion.div>
  );
}

export function SocialProofStrip() {
  const prefersReduced = useReducedMotion();
  const marqueeLogos = [...LOGOS, ...LOGOS];
  const useMarquee = !prefersReduced;

  return (
    <section
      className={`overflow-x-clip touch-pan-y bg-[var(--ds-landing-canvas)] border-b border-[var(--ds-hairline)] ${landingSectionY}`}
    >
      <div className={landingContainer}>
        <motion.p
          initial={prefersReduced ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, ease: easeOut }}
          className="text-sm font-medium text-center mb-8"
          style={{ color: "#a4a097" }}
        >
          Trusted by security teams across industries
        </motion.p>

        <div className="md:hidden">
          <LogoGrid />
        </div>

        <motion.div className="hidden md:block">
          {useMarquee ? (
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.55, ease: easeOut }}
              className="relative overflow-hidden overscroll-x-none"
            >
              <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-14 bg-[var(--ds-landing-canvas)] opacity-90 sm:w-24" />
              <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-14 bg-[var(--ds-landing-canvas)] opacity-90 sm:w-24" />

              <motion.div
                className="flex w-max items-center gap-6 sm:gap-8"
                animate={{ x: ["0%", "-50%"] }}
                transition={{ duration: 26, repeat: Infinity, ease: "linear" }}
              >
                {marqueeLogos.map((logo, index) => (
                  <div
                    key={`${logo.name}-${index}`}
                    className="flex min-h-[48px] min-w-[96px] shrink-0 items-center justify-center rounded-[10px] border border-white/80 bg-white px-3 py-2 opacity-70 transition-opacity hover:opacity-100 sm:min-h-[52px] sm:min-w-[120px] sm:px-4 shadow-sm"
                  >
                    <Image
                      src={logo.src}
                      alt={`${logo.name} logo`}
                      width={logo.width}
                      height={32}
                      className="h-8 w-auto max-w-full"
                    />
                  </div>
                ))}
              </motion.div>
            </motion.div>
          ) : (
            <LogoGrid />
          )}
        </motion.div>
      </div>
    </section>
  );
}
