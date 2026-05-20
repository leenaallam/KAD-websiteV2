"use client";

import { motion } from "framer-motion";
import { ChoiceCard } from "../ChoiceCard";
import { StepNav } from "../StepNav";
import { usePortalStore, type Category } from "@/lib/stores/portalStore";
import { ease } from "@/lib/animations/easings";

const CATEGORIES: {
  key: Category;
  label: string;
  caption: string;
  Icon: () => React.ReactNode;
}[] = [
  {
    key: "residential",
    label: "Residential",
    caption:
      "Apartments, villas, duplexes — the rooms a family will return to for decades.",
    Icon: () => (
      <svg width="42" height="42" viewBox="0 0 42 42" fill="none" aria-hidden>
        <path
          d="M6 36V18L21 6l15 12v18H6Z"
          stroke="currentColor"
          strokeWidth="0.8"
        />
        <path d="M17 36V24h8v12" stroke="currentColor" strokeWidth="0.8" />
        <path d="M2 21l19-16 19 16" stroke="currentColor" strokeWidth="0.6" />
      </svg>
    ),
  },
  {
    key: "commercial",
    label: "Commercial",
    caption:
      "Offices, restaurants, retail, hospitality — environments staged for a brand.",
    Icon: () => (
      <svg width="42" height="42" viewBox="0 0 42 42" fill="none" aria-hidden>
        <path d="M6 36V8h14v28" stroke="currentColor" strokeWidth="0.8" />
        <path d="M20 36V16h16v20" stroke="currentColor" strokeWidth="0.8" />
        <path
          d="M10 13h4M10 19h4M10 25h4M24 21h8M24 27h8"
          stroke="currentColor"
          strokeWidth="0.6"
        />
      </svg>
    ),
  },
];

export function Step1Category() {
  const category = usePortalStore((s) => s.category);
  const setCategory = usePortalStore((s) => s.setCategory);
  const next = usePortalStore((s) => s.next);

  return (
    <div>
      <Heading />
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: ease.luxe, delay: 0.3 }}
        className="mt-14 grid gap-6 md:grid-cols-2 lg:gap-10"
      >
        {CATEGORIES.map((c, i) => (
          <motion.div
            key={c.key}
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 1,
              ease: ease.luxe,
              delay: 0.35 + i * 0.12,
            }}
          >
            <ChoiceCard
              selected={category === c.key}
              onSelect={() => {
                setCategory(c.key);
                // Auto-advance ~ when a single-select decision is binary,
                // making the user click "Continue" feels like friction.
                setTimeout(() => next(), 520);
              }}
              label={c.label}
              caption={c.caption}
              visual={<c.Icon />}
              aspect="landscape"
              className="lg:min-h-[300px]"
            />
          </motion.div>
        ))}
      </motion.div>

      <div className="mt-16">
        <StepNav />
      </div>
    </div>
  );
}

function Heading() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, ease: ease.luxe, delay: 0.15 }}
    >
      <p className="eyebrow gold-glow-text">Step 01 — Begin</p>
      <h1 className="mt-6 max-w-3xl font-[var(--font-fraunces)] text-[clamp(2.4rem,6vw,5.4rem)] leading-[1] tracking-[-0.02em] text-[var(--bone)]">
        What kind of space are you{" "}
        <span className="italic text-[var(--gold-soft)] gold-glow-text">
          composing
        </span>
        ?
      </h1>
      <p className="mt-8 max-w-md text-base leading-relaxed text-[var(--mist)]">
        A short conversation in eleven steps. Every answer shapes the
        considered first reading we'll send back to you.
      </p>
    </motion.div>
  );
}
