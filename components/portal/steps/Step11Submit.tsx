"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useMemo } from "react";
import { usePortalStore } from "@/lib/stores/portalStore";
import { ease } from "@/lib/animations/easings";

/**
 * Submission choreography. Two phases:
 *
 *   1) Processing — concentric rings + radial particle burst + status copy
 *      that ticks through "Indexing references → Composing brief → Notifying
 *      the studio." Plays for at least 2.6s even on a fast network so the
 *      user feels the considered handoff.
 *
 *   2) Success — animated checkmark draws inside a gold ring, headline
 *      lifts in, and footer affordances surface for next moves.
 *
 * The store's `isSubmitting` flag drives the phase swap. Step10 fires the
 * fetch and flips the flag; this component does the show.
 */
export function Step11Submit() {
  const isSubmitting = usePortalStore((s) => s.isSubmitting);
  const submitted = usePortalStore((s) => s.submitted);
  const markSubmitted = usePortalStore((s) => s.markSubmitted);

  // Floor the processing animation at 2.6s — even if the API responds
  // instantly, we hold the loader so the cinematic moment lands. After
  // both conditions (server done + floor elapsed) we flip submitted.
  useEffect(() => {
    if (submitted) return;
    let cancelled = false;
    const floor = new Promise<void>((resolve) =>
      setTimeout(resolve, 2600)
    );
    const waitServer = new Promise<void>((resolve) => {
      // Poll the store via a quick listener; the simpler approach below
      // relies on the same store but uses a microtask check.
      const tick = () => {
        if (cancelled) return;
        if (!usePortalStore.getState().isSubmitting) resolve();
        else setTimeout(tick, 80);
      };
      tick();
    });
    Promise.all([floor, waitServer]).then(() => {
      if (!cancelled) markSubmitted();
    });
    return () => {
      cancelled = true;
    };
  }, [submitted, markSubmitted]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <AnimatePresence mode="wait">
        {!submitted ? (
          <Processing key="processing" active={isSubmitting} />
        ) : (
          <Success key="success" />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ============================================================================
 * Processing phase
 * ========================================================================== */

const STAGES = [
  "Indexing references",
  "Composing brief",
  "Notifying the studio",
] as const;

function Processing({ active }: { active: boolean }) {
  // Stages cycle every ~800ms, so all three breathe past during the
  // 2.6s minimum hold. Once active flips false the last stage holds
  // while Success takes over.
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
      className="flex flex-col items-center text-center"
    >
      <Aurora />
      <StatusTicker stages={STAGES} active={active} />

      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.8, ease: ease.luxe }}
        className="mt-12 max-w-md text-sm leading-relaxed text-[var(--mist)]"
      >
        A considered handoff — your brief is being prepared for the studio.
      </motion.p>
    </motion.div>
  );
}

/** Concentric rings + slow particle burst — the "AI is reading" gesture. */
function Aurora() {
  // Deterministic radial particle positions (24 spokes)
  const particles = useMemo(
    () =>
      Array.from({ length: 24 }, (_, i) => {
        const angle = (i / 24) * Math.PI * 2;
        return {
          angle,
          distance: 60 + (i % 3) * 14,
          delay: (i % 8) * 0.08,
        };
      }),
    []
  );

  return (
    <div className="relative h-44 w-44">
      {/* Outermost slow rotating ring */}
      <motion.span
        aria-hidden
        className="absolute inset-0 rounded-full border border-[rgba(216,184,104,0.25)]"
        animate={{ rotate: 360 }}
        transition={{ duration: 18, ease: "linear", repeat: Infinity }}
        style={{
          boxShadow: "0 0 60px -10px rgba(201,163,59,0.45)",
        }}
      />
      {/* Mid ring counter-rotates */}
      <motion.span
        aria-hidden
        className="absolute inset-5 rounded-full border border-[rgba(216,184,104,0.4)] border-dashed"
        animate={{ rotate: -360 }}
        transition={{ duration: 12, ease: "linear", repeat: Infinity }}
      />
      {/* Inner ring */}
      <motion.span
        aria-hidden
        className="absolute inset-10 rounded-full border border-[rgba(201,163,59,0.5)]"
        animate={{ scale: [1, 1.06, 1], opacity: [0.4, 0.9, 0.4] }}
        transition={{ duration: 2.4, ease: "easeInOut", repeat: Infinity }}
      />

      {/* Center dot */}
      <span
        aria-hidden
        className="absolute inset-0 m-auto h-2 w-2 rounded-full bg-[var(--gold-soft)]"
        style={{ boxShadow: "0 0 24px 4px rgba(201,163,59,0.8)" }}
      />

      {/* Radial particles emerging from center */}
      {particles.map((p, i) => (
        <motion.span
          key={i}
          aria-hidden
          className="absolute left-1/2 top-1/2 h-1 w-1 rounded-full bg-[var(--gold-soft)]"
          initial={{ x: 0, y: 0, opacity: 0 }}
          animate={{
            x: Math.cos(p.angle) * p.distance,
            y: Math.sin(p.angle) * p.distance,
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 2.4,
            ease: "easeOut",
            repeat: Infinity,
            delay: p.delay,
          }}
        />
      ))}
    </div>
  );
}

function StatusTicker({
  stages,
  active,
}: {
  stages: readonly string[];
  active: boolean;
}) {
  // The active prop only controls the final stage label — we always cycle
  // through the same 3 lines so the moment feels consistent even on
  // ultra-fast networks.
  return (
    <div className="mt-12 h-6 overflow-hidden">
      <motion.div
        animate={{ y: [0, -24, -48] }}
        transition={{
          duration: 2.4,
          ease: "easeInOut",
          times: [0, 0.45, 1],
        }}
        className="flex flex-col gap-2"
      >
        {stages.map((s, i) => (
          <p
            key={i}
            className="h-6 text-xs uppercase leading-6 tracking-[0.32em] text-[var(--gold-soft)] gold-glow-text"
          >
            {i === stages.length - 1 && !active ? "Indexed" : s}
          </p>
        ))}
      </motion.div>
    </div>
  );
}

/* ============================================================================
 * Success phase
 * ========================================================================== */

function Success() {
  const reset = usePortalStore((s) => s.reset);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="flex flex-col items-center text-center"
    >
      <Checkmark />

      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.9, ease: ease.luxe }}
        className="mt-12 text-[10px] uppercase tracking-[0.4em] text-[var(--gold-soft)] gold-glow-text"
      >
        Vision received
      </motion.p>

      <motion.h2
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.85, duration: 1, ease: ease.luxe }}
        className="mt-6 max-w-3xl font-[var(--font-fraunces)] text-[clamp(2.4rem,6vw,4.8rem)] leading-[1.05] tracking-[-0.02em] text-[var(--bone)]"
      >
        Your vision has been{" "}
        <span className="italic text-[var(--gold-soft)] gold-glow-text">
          received
        </span>
        .
      </motion.h2>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.05, duration: 1 }}
        className="mt-8 max-w-md text-base leading-relaxed text-[var(--mist)]"
      >
        KAD will write back within one working day with a first reading of
        your brief and a personalised quotation.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.3, duration: 0.9, ease: ease.luxe }}
        className="mt-14 flex flex-col items-center gap-4 sm:flex-row sm:gap-6"
      >
        <Link
          href="/"
          data-cursor="link"
          className="inline-flex h-14 items-center justify-center gap-3 rounded-full border border-[var(--gold)] bg-[rgba(201,163,59,0.08)] px-9 text-xs uppercase tracking-[0.28em] text-[var(--bone)] transition-colors hover:bg-[rgba(201,163,59,0.16)] hover:text-[var(--gold-soft)]"
        >
          Return to atelier
          <svg width="34" height="10" viewBox="0 0 34 10" fill="none" aria-hidden>
            <path
              d="M0 5h32M28 1l4 4-4 4"
              stroke="currentColor"
              strokeWidth="0.8"
            />
          </svg>
        </Link>
        <button
          type="button"
          onClick={reset}
          data-cursor="link"
          className="text-[10px] uppercase tracking-[0.32em] text-[var(--mist)] underline-offset-4 transition-colors hover:text-[var(--gold-soft)] hover:underline"
        >
          Begin another
        </button>
      </motion.div>
    </motion.div>
  );
}

function Checkmark() {
  return (
    <div className="relative h-32 w-32">
      {/* Outer glow ring */}
      <motion.span
        aria-hidden
        className="absolute inset-0 rounded-full border border-[var(--gold)]"
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.05, duration: 0.7, ease: ease.luxe }}
        style={{ boxShadow: "0 0 80px -10px rgba(201,163,59,0.7)" }}
      />
      {/* Inner ring expanding outward */}
      <motion.span
        aria-hidden
        className="absolute inset-0 rounded-full border border-[rgba(216,184,104,0.5)]"
        initial={{ scale: 1, opacity: 1 }}
        animate={{ scale: 1.5, opacity: 0 }}
        transition={{ delay: 0.5, duration: 1.2, ease: ease.luxe }}
      />
      {/* Center fill */}
      <span
        aria-hidden
        className="absolute inset-3 rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(201,163,59,0.22), transparent 70%)",
        }}
      />

      {/* The checkmark path itself — drawn from 0 → 1 */}
      <svg
        className="absolute inset-0 m-auto"
        width="56"
        height="56"
        viewBox="0 0 56 56"
        fill="none"
        aria-hidden
      >
        <motion.path
          d="M14 29l9 9 19-21"
          stroke="var(--gold-soft)"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{
            pathLength: { delay: 0.35, duration: 0.9, ease: ease.luxe },
            opacity: { delay: 0.35, duration: 0.2 },
          }}
          style={{
            filter: "drop-shadow(0 0 8px rgba(216,184,104,0.6))",
          }}
        />
      </svg>
    </div>
  );
}
