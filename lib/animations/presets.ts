import type { Variants } from "framer-motion";
import { ease, durations } from "./easings";

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 32 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: durations.long, ease: ease.luxe },
  },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: durations.medium } },
};

export const maskReveal: Variants = {
  hidden: { clipPath: "inset(0 0 100% 0)" },
  visible: {
    clipPath: "inset(0 0 0% 0)",
    transition: { duration: durations.cinematic, ease: ease.luxe },
  },
};

export const stagger = (each = 0.08, delay = 0.1) => ({
  hidden: {},
  visible: { transition: { staggerChildren: each, delayChildren: delay } },
});
