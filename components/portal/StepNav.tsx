"use client";

import { motion } from "framer-motion";
import { useRef } from "react";
import { STEPS, usePortalStore, isStepValid } from "@/lib/stores/portalStore";
import { useMagnetic } from "@/hooks/useMagnetic";
import { cn } from "@/lib/utils/cn";

type Props = {
  /** Custom label for the forward CTA on the final-content steps. */
  nextLabel?: string;
  /** Optional: override the default validation gate. */
  canAdvance?: boolean;
  /** Hide the back button on the success screen. */
  hideBack?: boolean;
  /** Called after store advances — used for the submission step. */
  onNext?: () => void;
};

/**
 * Persistent footer for the portal. Two affordances:
 *   - "← Back" — quiet, no border, slides the previous step in
 *   - "Continue →" — magnetic, glows when valid, dims when not
 *
 * The forward CTA is the only place the user is told whether the current
 * step satisfies its requirements — we deliberately don't show inline
 * validation errors per-field because every step is a single decision.
 */
export function StepNav({ nextLabel, canAdvance, hideBack, onNext }: Props) {
  const stepIndex = usePortalStore((s) => s.stepIndex);
  const next = usePortalStore((s) => s.next);
  const back = usePortalStore((s) => s.back);
  const valid = usePortalStore((s) => isStepValid(s, STEPS[s.stepIndex]));

  const advance = canAdvance ?? valid;
  const isLastInteractive = STEPS[stepIndex] === "review";

  const nextRef = useRef<HTMLButtonElement>(null);
  useMagnetic(advance ? nextRef : { current: null }, { strength: 18 });

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
      className="flex items-center justify-between gap-6 pt-4"
    >
      {!hideBack && stepIndex > 0 ? (
        <button
          type="button"
          onClick={back}
          data-cursor="link"
          className="group flex items-center gap-3 text-xs uppercase tracking-[0.32em] text-[var(--mist)] transition-colors hover:text-[var(--bone)]"
        >
          <svg width="34" height="10" viewBox="0 0 34 10" fill="none" aria-hidden>
            <path
              d="M34 5H2M6 1L2 5l4 4"
              stroke="currentColor"
              strokeWidth="0.8"
            />
          </svg>
          <span>Back</span>
        </button>
      ) : (
        <span aria-hidden />
      )}

      <button
        ref={nextRef}
        type="button"
        disabled={!advance}
        onClick={() => {
          if (!advance) return;
          if (onNext) onNext();
          else next();
        }}
        data-cursor="link"
        className={cn(
          "group inline-flex h-14 items-center gap-4 rounded-full border px-9 text-xs uppercase tracking-[0.28em]",
          "transition-[color,background-color,box-shadow,border-color,opacity] duration-500",
          "ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform",
          advance
            ? "border-[var(--gold)] bg-[rgba(201,163,59,0.08)] text-[var(--bone)] hover:bg-[rgba(201,163,59,0.16)] hover:text-[var(--gold-soft)] hover:shadow-[0_0_70px_-10px_rgba(201,163,59,0.55)]"
            : "border-[rgba(234,227,210,0.12)] text-[var(--whisper)] opacity-70"
        )}
      >
        <span>
          {nextLabel ?? (isLastInteractive ? "Submit vision" : "Continue")}
        </span>
        <svg width="40" height="10" viewBox="0 0 40 10" fill="none" aria-hidden>
          <path
            d="M0 5h38M34 1l4 4-4 4"
            stroke="currentColor"
            strokeWidth="0.8"
          />
        </svg>
      </button>
    </motion.div>
  );
}
