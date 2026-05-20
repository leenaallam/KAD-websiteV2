"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { PortalBackdrop } from "./PortalBackdrop";
import { StepIndicator } from "./StepIndicator";
import { STEPS, usePortalStore } from "@/lib/stores/portalStore";
import { ease } from "@/lib/animations/easings";

type Props = {
  /** Map of stepId → rendered content. */
  steps: Partial<Record<(typeof STEPS)[number], ReactNode>>;
};

/**
 * Cinematic shell wrapping every onboarding step.
 *
 * Three layers compose the experience:
 *   1) PortalBackdrop — ambient drifting gradients + dust motes
 *   2) Chrome — logo mark, step indicator, exit hatch
 *   3) Step viewport — the step content slides in via AnimatePresence,
 *      direction-aware (forward = +X, back = -X) so users feel motion
 *      that matches their intent
 *
 * The entry animation (gateLifted) plays exactly once on first mount —
 * the page fades from black, the chrome rises, then content arrives.
 * It runs on the client only to avoid the hydrated-flash problem.
 */
export function PortalShell({ steps }: Props) {
  const stepIndex = usePortalStore((s) => s.stepIndex);
  const direction = usePortalStore((s) => s.direction);
  const stepId = STEPS[stepIndex];

  // Defer the heavy entry to a mounted state so SSR HTML is plain dark
  // and the animation cannot flash before hydration completes.
  const [gateLifted, setGateLifted] = useState(false);
  useEffect(() => {
    const t = requestAnimationFrame(() => setGateLifted(true));
    return () => cancelAnimationFrame(t);
  }, []);

  return (
    <div className="relative isolate min-h-[100dvh] overflow-hidden">
      <PortalBackdrop />

      {/* Entry curtain — a full-bleed black sheet that lifts on first mount,
          carrying the visual continuity from whatever page sent the user here */}
      <motion.div
        aria-hidden
        initial={{ opacity: 1 }}
        animate={{ opacity: gateLifted ? 0 : 1 }}
        transition={{ duration: 1.2, ease: ease.luxe }}
        className="pointer-events-none fixed inset-0 z-50 bg-[var(--ink)]"
        style={{
          pointerEvents: gateLifted ? "none" : "auto",
        }}
      />

      {/* Top chrome — logo + step indicator + exit */}
      <motion.header
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: gateLifted ? 1 : 0, y: gateLifted ? 0 : -12 }}
        transition={{ duration: 1.1, ease: ease.luxe, delay: 0.7 }}
        className="relative z-20 px-6 pt-8 lg:px-12 lg:pt-10"
      >
        <div className="mx-auto flex max-w-[1400px] items-center gap-6">
          <Link
            href="/"
            data-cursor="link"
            className="font-[var(--font-fraunces)] text-xl tracking-[-0.02em] text-[var(--bone)] transition-colors hover:text-[var(--gold-soft)]"
          >
            KAD
          </Link>
          <span aria-hidden className="h-px w-10 bg-[rgba(234,227,210,0.18)]" />
          <p className="hidden text-[10px] uppercase tracking-[0.32em] text-[var(--mist)] sm:block">
            Begin a project
          </p>

          <div className="ml-auto hidden flex-1 max-w-2xl md:block">
            <StepIndicator />
          </div>

          <ExitHatch />
        </div>
        {/* Mobile indicator — full-width below the header row */}
        <div className="mt-8 md:hidden">
          <StepIndicator />
        </div>
      </motion.header>

      {/* Step viewport */}
      <main className="relative z-10 px-6 pb-16 pt-12 lg:px-12 lg:pb-24 lg:pt-20">
        <div className="mx-auto w-full max-w-[1400px]">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={stepId}
              custom={direction}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.75, ease: ease.luxe }}
              className="min-h-[60vh]"
            >
              {steps[stepId] ?? <StubStep id={stepId} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

const stepVariants = {
  enter: (direction: 1 | -1) => ({
    opacity: 0,
    x: direction * 60,
    filter: "blur(12px)",
  }),
  center: { opacity: 1, x: 0, filter: "blur(0px)" },
  exit: (direction: 1 | -1) => ({
    opacity: 0,
    x: direction * -60,
    filter: "blur(12px)",
  }),
};

function ExitHatch() {
  return (
    <Link
      href="/"
      data-cursor="link"
      aria-label="Exit onboarding"
      className="group relative flex h-10 w-10 items-center justify-center rounded-full border border-[rgba(234,227,210,0.14)] transition-colors hover:border-[rgba(201,163,59,0.5)]"
    >
      <span
        aria-hidden
        className="absolute inset-0 rounded-full opacity-0 transition-opacity group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(circle, rgba(201,163,59,0.18), transparent 70%)",
        }}
      />
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
        <path
          d="M1 1L11 11M11 1L1 11"
          stroke="currentColor"
          strokeWidth="0.9"
          strokeLinecap="round"
          className="text-[var(--mist)] transition-colors group-hover:text-[var(--gold-soft)]"
        />
      </svg>
    </Link>
  );
}

function StubStep({ id }: { id: string }) {
  return (
    <div className="flex min-h-[50vh] flex-col items-start justify-center">
      <p className="eyebrow gold-glow-text">In production</p>
      <h2 className="mt-6 font-[var(--font-fraunces)] text-[clamp(2rem,5vw,3.6rem)] leading-[1.05] text-[var(--bone)]">
        Step{" "}
        <span className="italic text-[var(--gold-soft)] gold-glow-text">
          {id}
        </span>{" "}
        — coming next.
      </h2>
      <p className="mt-6 max-w-md text-base leading-relaxed text-[var(--mist)]">
        The shell and the first interactions are live. The remaining steps land
        in the next iteration with the same level of polish as the ones already
        in front of you.
      </p>
    </div>
  );
}
