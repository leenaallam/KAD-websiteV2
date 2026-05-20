"use client";

import { motion } from "framer-motion";
import { STEPS, usePortalStore } from "@/lib/stores/portalStore";
import { ease } from "@/lib/animations/easings";

/** Editorial step indicator — segmented hairline + active-step caption. */
export function StepIndicator() {
  const stepIndex = usePortalStore((s) => s.stepIndex);
  const jumpTo = usePortalStore((s) => s.jumpTo);

  const total = STEPS.length;
  const current = stepIndex + 1;

  return (
    <div className="flex w-full items-center gap-6">
      {/* Index / total */}
      <div className="font-[var(--font-fraunces)] text-sm text-[var(--mist)]">
        <span className="text-[var(--gold-soft)]">
          {String(current).padStart(2, "0")}
        </span>
        <span className="mx-2 opacity-50">/</span>
        <span>{String(total).padStart(2, "0")}</span>
      </div>

      {/* Segments */}
      <div className="flex flex-1 items-center gap-1">
        {STEPS.map((_, i) => {
          const isActive = i <= stepIndex;
          const isCurrent = i === stepIndex;
          return (
            <button
              key={i}
              type="button"
              aria-label={`Jump to step ${i + 1}`}
              // Allow jumping back to any visited step (sub-step navigation),
              // but block jumping forward past unvalidated work.
              disabled={i > stepIndex}
              onClick={() => jumpTo(i)}
              data-cursor="link"
              className="group relative h-3 flex-1 cursor-pointer disabled:cursor-not-allowed"
            >
              <span className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-[rgba(234,227,210,0.12)]" />
              <motion.span
                className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 origin-left"
                style={{
                  background:
                    "linear-gradient(to right, var(--gold-deep), var(--gold-soft))",
                  boxShadow: isCurrent
                    ? "0 0 12px rgba(201,163,59,0.55)"
                    : "none",
                }}
                animate={{ scaleX: isActive ? 1 : 0 }}
                transition={{ duration: 0.7, ease: ease.luxe }}
              />
            </button>
          );
        })}
      </div>

      {/* Current step label */}
      <span className="hidden text-[10px] uppercase tracking-[0.32em] text-[var(--mist)] md:inline">
        {labelFor(STEPS[stepIndex])}
      </span>
    </div>
  );
}

function labelFor(step: (typeof STEPS)[number]): string {
  return {
    category: "Category",
    type: "Project type",
    size: "Size",
    budget: "Budget",
    files: "References",
    contact: "Contact",
    review: "Review",
    submit: "Submission",
  }[step];
}
