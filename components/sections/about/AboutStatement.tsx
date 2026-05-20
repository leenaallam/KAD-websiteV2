"use client";

import { motion } from "framer-motion";
import { ease } from "@/lib/animations/easings";

/**
 * Intimate studio voice. A pull-quote on a near-empty canvas — minimal
 * motion, mostly typography breathing. After the manifesto and the
 * visual essay, this is the quiet middle of the page where the user
 * exhales.
 */
export function AboutStatement() {
  return (
    <section className="relative isolate flex min-h-[90dvh] items-center overflow-hidden px-6 py-32 lg:px-12">
      {/* Soft warmth at center */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-[1]"
        style={{
          background:
            "radial-gradient(ellipse at 50% 50%, rgba(201,163,59,0.05), transparent 65%)",
        }}
      />

      <div className="mx-auto w-full max-w-5xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-20% 0%" }}
          transition={{ duration: 1.1, ease: ease.luxe }}
        >
          <p className="eyebrow gold-glow-text">Studio voice</p>
        </motion.div>

        {/* Decorative quote ornament — a hairline that draws itself */}
        <motion.span
          aria-hidden
          initial={{ scaleX: 0, opacity: 0 }}
          whileInView={{ scaleX: 1, opacity: 1 }}
          viewport={{ once: true, margin: "-20% 0%" }}
          transition={{ duration: 1.4, ease: ease.luxe, delay: 0.2 }}
          className="mx-auto mt-12 block h-px w-24 origin-center bg-[var(--gold-soft)]"
        />

        <motion.blockquote
          initial={{ opacity: 0, y: 28, filter: "blur(8px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true, margin: "-20% 0%" }}
          transition={{ duration: 1.6, ease: ease.luxe, delay: 0.3 }}
          className="mt-12 font-[var(--font-fraunces)] text-[clamp(1.8rem,4.2vw,3.6rem)] leading-[1.15] text-[var(--bone)]"
        >
          <span>"We believe a room can be a </span>
          <span className="italic text-[var(--gold-soft)] gold-glow-text">
            quiet act
          </span>
          <span> of authorship — and that the finest interiors are the ones the eye returns to without knowing why."</span>
        </motion.blockquote>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-20% 0%" }}
          transition={{ duration: 1.2, ease: ease.luxe, delay: 0.7 }}
          className="mt-12 text-xs uppercase tracking-[0.32em] text-[var(--mist)]"
        >
          — Karim Allam · Founder, KAD
        </motion.p>
      </div>
    </section>
  );
}
