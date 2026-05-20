"use client";

import { motion } from "framer-motion";
import { LinkButton } from "@/components/ui/Button";
import { ease } from "@/lib/animations/easings";

/**
 * The galaxy resolves. After eleven destinations, a quiet end-card
 * invites the visitor to begin their own commission. Two CTAs and an
 * atelier coordinate signoff — same vocabulary as the About close.
 */
export function ProjectsClose() {
  return (
    <section className="relative isolate flex min-h-[90dvh] items-center overflow-hidden px-6 py-32 lg:px-12">
      {/* Concentrated bloom at center-bottom — the warm "destination" feel */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-[1]"
        style={{
          background:
            "radial-gradient(ellipse at 50% 70%, rgba(201,163,59,0.16), transparent 60%)",
        }}
      />

      <div className="mx-auto w-full max-w-[1600px] text-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-15% 0%" }}
          transition={{ duration: 1.1, ease: ease.luxe }}
        >
          <p className="eyebrow gold-glow-text">End of atlas · Begin yours</p>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 28, filter: "blur(10px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true, margin: "-15% 0%" }}
          transition={{ duration: 1.5, ease: ease.luxe, delay: 0.15 }}
          className="mx-auto mt-10 max-w-5xl font-[var(--font-fraunces)] text-[clamp(2.4rem,6vw,5.6rem)] leading-[1.02] tracking-[-0.02em] text-[var(--bone)]"
        >
          The twelfth room is{" "}
          <span className="italic text-[var(--gold-soft)] gold-glow-text">
            yours
          </span>
          .
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-15% 0%" }}
          transition={{ duration: 1.2, ease: ease.luxe, delay: 0.4 }}
          className="mx-auto mt-10 max-w-md text-lg leading-relaxed text-[var(--mist)]"
        >
          Eleven rooms behind us — and a space somewhere that's waiting for
          the studio's hand. Tell us about it.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-15% 0%" }}
          transition={{ duration: 1.2, ease: ease.luxe, delay: 0.6 }}
          className="mt-16 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6"
        >
          <LinkButton href="/portal" size="lg">
            Begin your project
          </LinkButton>
          <LinkButton href="/contact" size="lg" variant="ghost">
            Other channels
          </LinkButton>
        </motion.div>

        {/* Coordinate signoff */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-15% 0%" }}
          transition={{ duration: 1.2, ease: ease.luxe, delay: 0.9 }}
          className="mt-20 text-[10px] uppercase tracking-[0.4em] text-[var(--whisper)]"
        >
          KAD · 30°02ʹN · 31°14ʹE · Cairo
        </motion.p>
      </div>
    </section>
  );
}
