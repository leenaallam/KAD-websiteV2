"use client";

import { motion } from "framer-motion";
import { StepNav } from "../StepNav";
import { usePortalStore, type BudgetBand } from "@/lib/stores/portalStore";
import { ease } from "@/lib/animations/easings";
import { cn } from "@/lib/utils/cn";

type Tier = {
  key: BudgetBand;
  label: string;
  /** Roman numeral for editorial display alongside the label. */
  numeral: string;
  blurb: string;
  /** Comma-separated detail line — what the tier implies in practice. */
  signature: string;
  /** 0..3 — how much gilding to render on the card. */
  gild: 0 | 1 | 2 | 3;
};

const TIERS: Tier[] = [
  {
    key: "standard",
    label: "Standard",
    numeral: "I",
    blurb: "Considered, restrained, value-engineered.",
    signature: "Quality finishes · Local materials · Efficient build",
    gild: 0,
  },
  {
    key: "premium",
    label: "Premium",
    numeral: "II",
    blurb: "Specified materials, bespoke joinery, lighting designed.",
    signature: "Italian finishes · Custom millwork · Lighting consultancy",
    gild: 1,
  },
  {
    key: "luxury",
    label: "Luxury",
    numeral: "III",
    blurb: "International palette, custom everything, signature pieces.",
    signature: "International stone · Bespoke furniture · Art curation",
    gild: 2,
  },
  {
    key: "ultra-luxury",
    label: "Ultra Luxury",
    numeral: "IV",
    blurb: "Without compromise — at any scale.",
    signature: "Limitless palette · Commissioned everything · No deadline",
    gild: 3,
  },
];

/**
 * Budget tiers visually escalate. The first tier is austere; the last is
 * fully gilded with animated sheen and ornamental brackets. The progression
 * is the message — "the more you spend, the more the studio composes."
 */
export function Step7Budget() {
  const budget = usePortalStore((s) => s.budget);
  const setBudget = usePortalStore((s) => s.setBudget);
  const next = usePortalStore((s) => s.next);

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: ease.luxe, delay: 0.1 }}
      >
        <p className="eyebrow gold-glow-text">Step 04 — Investment</p>
        <h1 className="mt-6 max-w-3xl font-[var(--font-fraunces)] text-[clamp(2.4rem,6vw,5.4rem)] leading-[1] tracking-[-0.02em] text-[var(--bone)]">
          What is the{" "}
          <span className="italic text-[var(--gold-soft)] gold-glow-text">
            register
          </span>{" "}
          of this commission?
        </h1>
        <p className="mt-6 max-w-md text-base leading-relaxed text-[var(--mist)]">
          A directional answer is enough. The studio quotes once the brief
          and a first reading of the space are in hand — and we work to
          fit your number, not above it.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4 lg:gap-6"
      >
        {TIERS.map((t, i) => (
          <motion.div
            key={t.key}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.9,
              ease: ease.luxe,
              delay: 0.3 + i * 0.1,
            }}
          >
            <TierCard
              tier={t}
              selected={budget === t.key}
              onSelect={() => {
                setBudget(t.key);
                // Auto-advance — single-select. Budget cards carry the
                // most ornament, so the 520ms grace lets the gilded
                // selection state read fully before the transition.
                setTimeout(() => next(), 520);
              }}
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

function TierCard({
  tier,
  selected,
  onSelect,
}: {
  tier: Tier;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <motion.button
      type="button"
      onClick={onSelect}
      data-cursor="link"
      aria-pressed={selected}
      whileTap={{ scale: 0.985 }}
      className={cn(
        "group relative isolate flex aspect-[4/5] w-full flex-col overflow-hidden rounded-2xl border text-left",
        "transition-[border-color,background-color,box-shadow] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
        selected
          ? "border-[var(--gold)] bg-[rgba(201,163,59,0.06)] shadow-[0_0_0_1px_rgba(201,163,59,0.25),0_30px_80px_-20px_rgba(201,163,59,0.4)]"
          : "border-[rgba(234,227,210,0.1)] bg-[rgba(11,11,13,0.55)] hover:border-[rgba(201,163,59,0.5)]"
      )}
    >
      {/* Tier-specific base composition. Gild level controls the depth of
          the gold radial bloom and the animated sheen behind the numeral. */}
      <span
        aria-hidden
        className="absolute inset-0"
        style={{ background: gildBackground(tier.gild) }}
      />

      {/* Animated sheen on higher tiers — for tier 3 (ultra) it travels
          slowly, signaling the "premium continuous" feel */}
      {tier.gild >= 2 && (
        <motion.span
          aria-hidden
          className="absolute inset-y-0 -left-1/2 w-1/2"
          style={{
            background:
              "linear-gradient(115deg, transparent 0%, rgba(216,184,104,0.22) 50%, transparent 100%)",
            filter: "blur(8px)",
          }}
          animate={{ x: ["0%", "400%"] }}
          transition={{
            duration: tier.gild === 3 ? 8 : 12,
            ease: "easeInOut",
            repeat: Infinity,
            repeatDelay: tier.gild === 3 ? 0 : 4,
          }}
        />
      )}

      {/* Ornamental corner brackets — only on luxury tiers */}
      {tier.gild >= 2 && (
        <>
          <Bracket pos="tl" />
          <Bracket pos="tr" />
          <Bracket pos="bl" />
          <Bracket pos="br" />
        </>
      )}

      {/* Selected bloom replaces hover state */}
      {selected && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(201,163,59,0.18), transparent 70%)",
          }}
        />
      )}

      {/* Content */}
      <div className="relative z-10 flex h-full flex-col p-6 lg:p-8">
        <div className="flex items-baseline justify-between">
          <p className="font-[var(--font-fraunces)] text-xs uppercase tracking-[0.4em] text-[var(--gold-soft)]">
            Tier {tier.numeral}
          </p>
          <SelectionPip selected={selected} />
        </div>

        {/* Center — large numeral on premium tiers */}
        <div className="mt-auto">
          <p
            className={cn(
              "font-[var(--font-fraunces)] text-3xl leading-[1] text-[var(--bone)] lg:text-4xl",
              tier.gild === 3 && "text-[var(--gold-soft)]"
            )}
          >
            {tier.label}
          </p>
          <p className="mt-3 text-xs leading-relaxed text-[var(--mist)]">
            {tier.blurb}
          </p>
          <p
            className="mt-5 border-t border-[rgba(234,227,210,0.08)] pt-4 text-[10px] uppercase leading-relaxed tracking-[0.18em]"
            style={{ color: tier.gild >= 2 ? "var(--gold-soft)" : "var(--whisper)" }}
          >
            {tier.signature}
          </p>
        </div>
      </div>
    </motion.button>
  );
}

function Bracket({ pos }: { pos: "tl" | "tr" | "bl" | "br" }) {
  const map = {
    tl: "top-3 left-3 border-t border-l",
    tr: "top-3 right-3 border-t border-r",
    bl: "bottom-3 left-3 border-b border-l",
    br: "bottom-3 right-3 border-b border-r",
  } as const;
  return (
    <span
      aria-hidden
      className={cn(
        "pointer-events-none absolute h-3 w-3 border-[var(--gold-soft)]/60",
        map[pos]
      )}
    />
  );
}

function SelectionPip({ selected }: { selected: boolean }) {
  return (
    <span
      aria-hidden
      className={cn(
        "flex h-6 w-6 items-center justify-center rounded-full border transition-all duration-500",
        selected
          ? "border-[var(--gold)] bg-[rgba(201,163,59,0.2)]"
          : "border-[rgba(234,227,210,0.16)]"
      )}
    >
      {selected && <span className="h-2 w-2 rounded-full bg-[var(--gold-soft)]" />}
    </span>
  );
}

/** Increasing tiers carry more gold in the background composition. */
function gildBackground(gild: 0 | 1 | 2 | 3): string {
  switch (gild) {
    case 0:
      return "linear-gradient(180deg, rgba(22,22,24,0.7), rgba(11,11,13,0.95))";
    case 1:
      return "linear-gradient(180deg, rgba(22,22,24,0.7), rgba(11,11,13,0.95)), radial-gradient(ellipse at 70% 110%, rgba(201,163,59,0.08), transparent 55%)";
    case 2:
      return "linear-gradient(180deg, rgba(22,22,24,0.65), rgba(11,11,13,0.92)), radial-gradient(ellipse at 50% 100%, rgba(201,163,59,0.16), transparent 60%)";
    case 3:
      return "linear-gradient(180deg, rgba(28,22,12,0.75), rgba(15,11,7,0.92)), radial-gradient(ellipse at 50% 90%, rgba(216,184,104,0.28), transparent 55%), radial-gradient(ellipse at 30% 20%, rgba(216,184,104,0.12), transparent 50%)";
  }
}
