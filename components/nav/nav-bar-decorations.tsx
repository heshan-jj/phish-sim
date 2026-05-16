"use client";

import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

const DOTS = [
  { color: "var(--ds-brand-pink)", top: "20%", left: "8%", size: 8, delay: 0 },
  { color: "var(--ds-brand-yellow)", top: "55%", left: "4%", size: 6, delay: 0.4 },
  { color: "var(--ds-brand-teal)", top: "30%", right: "10%", size: 7, delay: 0.2 },
  { color: "var(--ds-brand-green)", top: "65%", right: "6%", size: 5, delay: 0.6 },
] as const;

function MiniMesh() {
  return (
    <svg
      className="absolute inset-0 w-full h-full opacity-[0.04] pointer-events-none"
      viewBox="0 0 400 64"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
    >
      <defs>
        <pattern id="nav-mesh" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
          <path
            d="M 40 0 L 0 0 0 40"
            fill="none"
            stroke="white"
            strokeWidth="0.5"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#nav-mesh)" />
    </svg>
  );
}

export function NavBarDecorations({ visible }: { visible: boolean }) {
  const prefersReduced = useReducedMotion();

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
          className="absolute inset-0 overflow-hidden pointer-events-none rounded-[inherit]"
          aria-hidden
        >
          <MiniMesh />
          {DOTS.map((dot, i) => (
            <motion.span
              key={i}
              className="absolute rounded-[3px]"
              style={{
                top: dot.top,
                left: "left" in dot ? dot.left : undefined,
                right: "right" in dot ? dot.right : undefined,
                width: dot.size,
                height: dot.size,
                backgroundColor: dot.color,
                opacity: 0.12,
              }}
              animate={
                prefersReduced
                  ? undefined
                  : { y: [0, -2, 0] }
              }
              transition={
                prefersReduced
                  ? undefined
                  : {
                      duration: 5 + i * 0.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: dot.delay,
                    }
              }
            />
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
