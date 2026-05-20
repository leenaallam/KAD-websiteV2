"use client";

import { motion } from "framer-motion";
import { ease } from "@/lib/animations/easings";

/**
 * Editorial transition between two project moments. A vertical hairline
 * with a single gold pulse at its center — the "in-between" beat that
 * gives the eye a rest before the next destination.
 *
 * The hairline draws itself from top to bottom on entry; the pulse dot
 * breathes in the middle. Together they read as a quiet ellipsis.
 */
export function OrbitDivider({ label }: { label: string }) {
  return (
    <div className="relative isolate flex flex-col items-center py-6 lg:py-24">
      <motion.span
        aria-hidden
        initial={{ scaleY: 0, opacity: 0 }}
        whileInView={{ scaleY: 1, opacity: 1 }}
        viewport={{ once: true, margin: "-10% 0%" }}
        transition={{ duration: 1.2, ease: ease.luxe }}
        // Hairlines shrink hard on mobile so the divider is a quick beat
        // rather than a long pause — same gesture, ⅓ the vertical cost.
        className="block h-8 w-px origin-top lg:h-20"
        style={{
          background:
            "linear-gradient(to bottom, transparent, rgba(201,163,59,0.55), transparent)",
        }}
      />
      <motion.span
        aria-hidden
        initial={{ scale: 0, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        viewport={{ once: true, margin: "-10% 0%" }}
        transition={{ duration: 0.8, ease: ease.luxe, delay: 0.6 }}
        className="my-3 inline-block h-1.5 w-1.5 rounded-full bg-[var(--gold-soft)] lg:my-4"
        style={{
          boxShadow: "0 0 14px 3px rgba(201,163,59,0.55)",
        }}
      />
      {/* Mobile hides the coordinate label — saves another 20px of vertical
          on a small screen, and the gold dot is enough of a beat by itself */}
      <motion.p
        initial={{ opacity: 0, y: 8 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-10% 0%" }}
        transition={{ duration: 1, ease: ease.luxe, delay: 0.8 }}
        className="mt-2 hidden text-[10px] uppercase tracking-[0.4em] text-[var(--whisper)] lg:block"
      >
        {label}
      </motion.p>
      <motion.span
        aria-hidden
        initial={{ scaleY: 0, opacity: 0 }}
        whileInView={{ scaleY: 1, opacity: 1 }}
        viewport={{ once: true, margin: "-10% 0%" }}
        transition={{ duration: 1.2, ease: ease.luxe, delay: 0.4 }}
        className="mt-3 block h-8 w-px origin-top lg:mt-4 lg:h-20"
        style={{
          background:
            "linear-gradient(to bottom, transparent, rgba(201,163,59,0.35), transparent)",
        }}
      />
    </div>
  );
}
