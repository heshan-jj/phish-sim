"use client";

import { motion } from "framer-motion";

const STICKY_NOTES = [
  { color: "#f5d75e", icon: "✉", top: "14%", left: "4%", rotate: -6, delay: 0 },
  { color: "#ff64c8", icon: "🛡", top: "28%", left: "10%", rotate: 4, delay: 0.6 },
  { color: "#2a9d99", icon: "📊", top: "62%", left: "3%", rotate: -3, delay: 1.2 },
  { color: "#e6e0f5", icon: "✉", top: "16%", right: "5%", rotate: 5, delay: 0.3 },
  { color: "#d9f3e1", icon: "✓", top: "42%", right: "8%", rotate: -4, delay: 0.9 },
  { color: "#f9e79f", icon: "📊", top: "72%", right: "4%", rotate: 3, delay: 1.5 },
] as const;

function StickyNote({
  color,
  icon,
  style,
  rotate,
  delay,
  prefersReduced,
}: {
  color: string;
  icon: string;
  style: React.CSSProperties;
  rotate: number;
  delay: number;
  prefersReduced: boolean | null;
}) {
  return (
    <motion.div
      className="absolute pointer-events-none hidden lg:flex items-center justify-center w-9 h-9 rounded-[4px]"
      style={{
        backgroundColor: color,
        transform: `rotate(${rotate}deg)`,
        opacity: 0.15,
        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
        ...style,
      }}
      animate={prefersReduced ? undefined : { y: [0, -5, 0] }}
      transition={
        prefersReduced
          ? undefined
          : { duration: 7, repeat: Infinity, ease: "easeInOut", delay }
      }
    >
      <span className="text-sm leading-none" aria-hidden>
        {icon}
      </span>
    </motion.div>
  );
}

export function HeroStickyNotes({ prefersReduced }: { prefersReduced: boolean | null }) {
  return (
    <div className="absolute inset-0 z-[1] pointer-events-none" aria-hidden>
      {STICKY_NOTES.map((note, i) => {
        const { color, icon, rotate, delay, ...pos } = note;
        return (
          <StickyNote
            key={i}
            color={color}
            icon={icon}
            rotate={rotate}
            delay={delay}
            prefersReduced={prefersReduced}
            style={pos as React.CSSProperties}
          />
        );
      })}
    </div>
  );
}
