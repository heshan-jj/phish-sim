export const easeOut = [0.22, 1, 0.36, 1] as const;
export const springSnappy = { type: "spring", stiffness: 400, damping: 30 } as const;
export const springSoft = { type: "spring", stiffness: 120, damping: 20 } as const;
export const springNav = { type: "spring", stiffness: 300, damping: 28 } as const;

export const fadeUp = {
  initial: { opacity: 0, y: 40 },
  animate: { opacity: 1, y: 0 },
};

export const ctaPop = {
  initial: { opacity: 0, y: 20, scale: 0.94 },
  animate: { opacity: 1, y: 0, scale: 1 },
};

export const staggerContainer = {
  initial: {},
  animate: { transition: { staggerChildren: 0.12 } },
};

export const staggerFast = {
  initial: {},
  animate: { transition: { staggerChildren: 0.08 } },
};

export const springNavIsland = { type: "spring", stiffness: 280, damping: 26 } as const;

export const navStagger = {
  initial: {},
  animate: {
    transition: { staggerChildren: 0.06, delayChildren: 0.1 },
  },
};

export const navItem = {
  initial: { opacity: 0, y: -8 },
  animate: { opacity: 1, y: 0 },
};

export const navSheetItem = {
  initial: { opacity: 0, x: 24 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 16 },
};

export const navSheetStagger = {
  initial: {},
  animate: {
    transition: { staggerChildren: 0.07, delayChildren: 0.08 },
  },
};
