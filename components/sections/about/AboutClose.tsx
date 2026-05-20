"use client";

import { motion } from "framer-motion";
import { LinkButton } from "@/components/ui/Button";
import { ease } from "@/lib/animations/easings";

/**
 * Cinematic close. After six chapters of typography and visual essay,
 * the page resolves with a quiet invitation. Two CTAs — one to the
 * project portal, one to the contact channels — surfaced over a
 * concentrated gold bloom.
 */
export function AboutClose() {
  return (
    <section className="relative isolate flex min-h-[80dvh] items-center overflow-hidden px-6 py-32 lg:px-12">
      {/* Center bloom — the warm finish */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-[1]"
        style={{
          background:
            "radial-gradient(ellipse at 50% 60%, rgba(201,163,59,0.18), transparent 60%)",
        }}
      />

      <div className="mx-auto w-full max-w-[1600px]">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-15% 0%" }}
          transition={{ duration: 1.2, ease: ease.luxe }}
        >
          <p className="eyebrow gold-glow-text">Begin</p>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 28, filter: "blur(10px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true, margin: "-15% 0%" }}
          transition={{ duration: 1.5, ease: ease.luxe, delay: 0.15 }}
          className="mt-10 max-w-5xl font-[var(--font-fraunces)] text-[clamp(2.6rem,7vw,6.4rem)] leading-[1.02] tracking-[-0.02em] text-[var(--bone)]"
        >
          Tell us about a room you'd like to live{" "}
          <span className="italic text-[var(--gold-soft)] gold-glow-text">
            differently
          </span>{" "}
          in.
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-15% 0%" }}
          transition={{ duration: 1.2, ease: ease.luxe, delay: 0.4 }}
          className="mt-10 max-w-md text-lg leading-relaxed text-[var(--mist)]"
        >
          We respond within one working day with a considered reading of
          your brief and the first conversation.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-15% 0%" }}
          transition={{ duration: 1.2, ease: ease.luxe, delay: 0.6 }}
          className="mt-16 flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6"
        >
          <LinkButton href="/portal" size="lg">
            Begin a project
          </LinkButton>
          <LinkButton href="/contact" size="lg" variant="ghost">
            Other channels
          </LinkButton>
        </motion.div>
      </div>
    </section>
  );
}
