"use client";

import { motion, useInView, type Variants } from "framer-motion";
import { useRef } from "react";
import { ease, durations } from "@/lib/animations/easings";

type Variant = "fade-up" | "mask" | "fade";

const variants: Record<Variant, Variants> = {
  "fade-up": {
    hidden: { opacity: 0, y: 28 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: durations.long, ease: ease.luxe },
    },
  },
  mask: {
    hidden: { clipPath: "inset(0 0 100% 0)", y: 24, opacity: 0 },
    show: {
      clipPath: "inset(0 0 0% 0)",
      y: 0,
      opacity: 1,
      transition: { duration: durations.cinematic, ease: ease.luxe },
    },
  },
  fade: {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { duration: durations.medium } },
  },
};

/**
 * Lightweight reveal — uses Framer's `useInView` (cheap, IntersectionObserver-based).
 * Reserve GSAP/ScrollTrigger for pinning, parallax, or timeline choreography.
 */
export function RevealOnScroll({
  children,
  variant = "fade-up",
  delay = 0,
  className,
  once = true,
  amount = 0.4,
}: {
  children: React.ReactNode;
  variant?: Variant;
  delay?: number;
  className?: string;
  once?: boolean;
  amount?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once, amount });

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView ? "show" : "hidden"}
      variants={variants[variant]}
      transition={{ delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
