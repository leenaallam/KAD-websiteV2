"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { StepNav } from "../StepNav";
import { STEPS, usePortalStore } from "@/lib/stores/portalStore";
import { ease } from "@/lib/animations/easings";

/**
 * Cinematic summary screen. Every prior decision becomes one editorial
 * card. Each card has a quiet "Revise" affordance that jumps the user
 * back to the relevant step — necessary because the only thing more
 * insulting than a bad form is a form that won't let you correct a typo.
 *
 * The Submit CTA on this step hands off to the parent via the StepNav
 * `onNext` prop, which fires a POST to /api/leads, marks the submission
 * flag in the store, and lets Step 11 take it from there.
 */
export function Step10Review() {
  const state = usePortalStore();
  const jumpTo = usePortalStore((s) => s.jumpTo);
  const markSubmitting = usePortalStore((s) => s.markSubmitting);
  const next = usePortalStore((s) => s.next);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setSubmitError(null);
    markSubmitting(true);
    // Move forward immediately — Step 11 shows the cinematic processing
    // sequence and watches the `submitted` flag on the store.
    next();

    try {
      const body = {
        category: state.category,
        projectType: state.projectType,
        size: state.size,
        budget: state.budget,
        // Files travel as metadata only at this stage — bytes are sent
        // direct-to-Storage in Phase 3 backend wire-up.
        files: state.files.map((f) => ({
          name: f.name,
          size: f.size,
          type: f.type,
        })),
        contact: state.contact,
      };
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Request failed (${res.status})`);
      }
      // Flip submitting → false so Step 11's polling loop knows the
      // server has responded. It still holds on the cinematic floor
      // (2.6s minimum) before swapping to the Success phase.
      // `markSubmitted` is fired by Step 11 itself once both the
      // server response and that animation floor have landed.
      markSubmitting(false);
    } catch (err) {
      markSubmitting(false);
      setSubmitError(
        err instanceof Error ? err.message : "Something quiet broke."
      );
      // Jump back to review so the user sees the error inline
      jumpTo(STEPS.indexOf("review"));
    }
  };

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: ease.luxe, delay: 0.1 }}
      >
        <p className="eyebrow gold-glow-text">Step 07 — Review</p>
        <h1 className="mt-6 max-w-3xl font-[var(--font-fraunces)] text-[clamp(2.4rem,6vw,5.4rem)] leading-[1] tracking-[-0.02em] text-[var(--bone)]">
          A first reading of your{" "}
          <span className="italic text-[var(--gold-soft)] gold-glow-text">
            brief
          </span>
          .
        </h1>
        <p className="mt-6 max-w-md text-base leading-relaxed text-[var(--mist)]">
          Revise anything that doesn't ring true. When everything reads
          right, send it through and the studio takes it from here.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-2 lg:gap-8"
      >
        <ReviewCard
          number="01"
          label="Project"
          value={formatProject(state.category, state.projectType)}
          onEdit={() => jumpTo(STEPS.indexOf("category"))}
          delay={0.3}
        />
        <ReviewCard
          number="02"
          label="Scale"
          value={formatSize(state.size)}
          onEdit={() => jumpTo(STEPS.indexOf("size"))}
          delay={0.36}
        />
        <ReviewCard
          number="03"
          label="Register"
          value={formatBudget(state.budget)}
          onEdit={() => jumpTo(STEPS.indexOf("budget"))}
          delay={0.42}
        />
        <ReviewCard
          number="04"
          label="References"
          value={
            state.files.length === 0
              ? "None attached"
              : `${state.files.length} file${state.files.length === 1 ? "" : "s"}`
          }
          onEdit={() => jumpTo(STEPS.indexOf("files"))}
          delay={0.48}
        />
        <ReviewCard
          number="05"
          label="Contact"
          value={state.contact.fullName || "—"}
          subValue={state.contact.email}
          onEdit={() => jumpTo(STEPS.indexOf("contact"))}
          delay={0.54}
          span="full"
        />
      </motion.div>

      {submitError && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-10 text-xs uppercase tracking-[0.28em] text-[#c97f3b]"
        >
          {submitError}
        </motion.p>
      )}

      <div className="mt-14">
        <StepNav nextLabel="Submit vision" onNext={handleSubmit} />
      </div>
    </div>
  );
}

/* ============================================================================
 * ReviewCard — one editorial spec line per decision
 * ========================================================================== */

function ReviewCard({
  number,
  label,
  value,
  subValue,
  chips,
  onEdit,
  delay,
  span = "half",
}: {
  number: string;
  label: string;
  value: string;
  subValue?: string;
  chips?: string[];
  onEdit: () => void;
  delay: number;
  span?: "half" | "full";
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: ease.luxe, delay }}
      className={
        "group relative overflow-hidden rounded-2xl border border-[rgba(234,227,210,0.08)] bg-[rgba(11,11,13,0.55)] p-7 transition-colors duration-500 hover:border-[rgba(201,163,59,0.4)] lg:p-9 " +
        (span === "full" ? "md:col-span-2" : "")
      }
    >
      {/* Number watermark */}
      <p className="font-[var(--font-fraunces)] text-4xl text-[var(--gold-soft)] opacity-30 transition-opacity duration-500 group-hover:opacity-60">
        {number}
      </p>

      <div className="mt-6 flex items-start justify-between gap-6">
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-[0.32em] text-[var(--mist)]">
            {label}
          </p>
          <p className="mt-3 font-[var(--font-fraunces)] text-xl leading-[1.15] text-[var(--bone)] lg:text-2xl">
            {value}
          </p>
          {subValue && (
            <p className="mt-2 text-xs text-[var(--mist)]">{subValue}</p>
          )}

          {chips && chips.length > 1 && (
            <div className="mt-5 flex flex-wrap gap-2">
              {chips.map((c) => (
                <span
                  key={c}
                  className="rounded-full border border-[rgba(201,163,59,0.32)] bg-[rgba(201,163,59,0.06)] px-3 py-1 text-[10px] uppercase tracking-[0.24em] text-[var(--gold-soft)]"
                >
                  {c}
                </span>
              ))}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={onEdit}
          data-cursor="link"
          className="flex shrink-0 items-center gap-2 text-[10px] uppercase tracking-[0.32em] text-[var(--whisper)] transition-colors hover:text-[var(--gold-soft)]"
        >
          <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden>
            <path
              d="M1 8.5V11h2.5L11 3.5 8.5 1 1 8.5Z"
              stroke="currentColor"
              strokeWidth="0.8"
              strokeLinejoin="round"
            />
          </svg>
          <span>Revise</span>
        </button>
      </div>
    </motion.div>
  );
}

/* ---------- formatters ---------- */
function formatProject(
  cat: string | null,
  type: string | null
): string {
  if (!cat) return "—";
  const c = cat.charAt(0).toUpperCase() + cat.slice(1);
  if (!type) return c;
  const t = type.charAt(0).toUpperCase() + type.slice(1);
  return `${c} · ${t}`;
}
function formatSize(s: string | null): string {
  if (!s) return "—";
  return (
    {
      "lt-150": "Less than 150 sqm",
      "150-200": "150 – 200 sqm",
      "200-300": "200 – 300 sqm",
      "gt-300": "300+ sqm",
    } as Record<string, string>
  )[s] ?? s;
}
function formatBudget(b: string | null): string {
  if (!b) return "—";
  return (
    {
      standard: "Standard",
      premium: "Premium",
      luxury: "Luxury",
      "ultra-luxury": "Ultra Luxury",
    } as Record<string, string>
  )[b] ?? b;
}
