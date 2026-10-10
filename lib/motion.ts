import type { Transition, Variants } from "framer-motion";

export const luxeSpring: Transition = {
  type: "spring",
  stiffness: 240,
  damping: 24,
  mass: 0.8,
};

export const revealItem: Variants = {
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
};

export const revealGroup: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09, delayChildren: 0.04 } },
};

export const drawerSpring: Transition = {
  type: "spring",
  stiffness: 320,
  damping: 32,
};
