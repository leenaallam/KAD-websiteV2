"use client";

import { motion } from "framer-motion";
import { StepNav } from "../StepNav";
import { usePortalStore, type SizeBand } from "@/lib/stores/portalStore";
import { ease } from "@/lib/animations/easings";
import { cn } from "@/lib/utils/cn";

type Size = {
  key: SizeBand;
  label: string;
  unit: string;
  caption: string;
  /** Relative scale 0..1 — drives the plan-diagram size. */
  weight: number;
};

const SIZES: Size[] = [
  {
    key: "lt-150",
    label: "< 150",
    unit: "sqm",
    caption: "Compact, considered — the room as a single object.",
    weight: 0.32,
  },
  {
    key: "150-200",
    label: "150 — 200",
    unit: "sqm",
    caption: "The mid-rise apartment standard.",
    weight: 0.52,
  },
  {
    key: "200-300",
    label: "200 — 300",
    unit: "sqm",
    caption: "A full home with social and private quarters.",
    weight: 0.74,
  },
  {
    key: "gt-300",
    label: "300+",
    unit: "sqm",
    caption: "Estate-scale — expansive plan, multiple wings.",
    weight: 1,
  },
];

/**
 * Each card carries a small architectural plan diagram whose footprint grows
 * with the size band. The plan is an abstract pavilion arrangement — central
 * hall, two flanking rooms — so it reads as "more space" without committing
 * to any specific layout.
 */
export function Step3Size() {
  const size = usePortalStore((s) => s.size);
  const setSize = usePortalStore((s) => s.setSize);
  const next = usePortalStore((s) => s.next);

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: ease.luxe, delay: 0.1 }}
      >
        <p className="eyebrow gold-glow-text">Step 03 — Scale</p>
        <h1 className="mt-6 max-w-3xl font-[var(--font-fraunces)] text-[clamp(2.4rem,6vw,5.4rem)] leading-[1] tracking-[-0.02em] text-[var(--bone)]">
          How much{" "}
          <span className="italic text-[var(--gold-soft)] gold-glow-text">
            ground
          </span>{" "}
          are we composing?
        </h1>
        <p className="mt-6 max-w-md text-base leading-relaxed text-[var(--mist)]">
          Approximate floor area, before subtraction for terraces, gardens, or
          back-of-house. We'll refine the brief in the first meeting.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-7"
      >
        {SIZES.map((s, i) => (
          <motion.div
            key={s.key}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.9,
              ease: ease.luxe,
              delay: 0.35 + i * 0.08,
            }}
          >
            <SizeCard
              size={s}
              selected={size === s.key}
              onSelect={() => {
                setSize(s.key);
                // Auto-advance — single-select step. Same 520ms grace
                // as the other selection steps for visual continuity.
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

function SizeCard({
  size,
  selected,
  onSelect,
}: {
  size: Size;
  selected: boolean;
  onSelect: () => void;
}) {
  // Plan diagram dimensions interpolate from a small pavilion at the
  // smallest band to a full three-wing arrangement at the largest. The
  // hover state expands by an extra 6% to give the architectural metaphor
  // an audible "yes, more space" gesture.
  const planScale = 0.55 + size.weight * 0.4;

  return (
    <button
      type="button"
      onClick={onSelect}
      data-cursor="link"
      aria-pressed={selected}
      className={cn(
        "group relative isolate flex aspect-[4/5] w-full flex-col overflow-hidden rounded-2xl border text-left",
        "transition-[border-color,background-color,box-shadow] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
        selected
          ? "border-[var(--gold)] bg-[rgba(201,163,59,0.06)] shadow-[0_30px_80px_-20px_rgba(201,163,59,0.35)]"
          : "border-[rgba(234,227,210,0.1)] bg-[rgba(11,11,13,0.5)] hover:border-[rgba(201,163,59,0.45)]"
      )}
    >
      {/* Background grid — quietens on hover so the plan reads cleaner */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-30 transition-opacity duration-700 group-hover:opacity-15"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(234,227,210,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(234,227,210,0.06) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      {/* Selected bloom */}
      {selected && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(201,163,59,0.16), transparent 70%)",
          }}
        />
      )}

      {/* Plan diagram — the size-responsive architectural sketch */}
      <div className="absolute inset-x-0 top-[14%] flex items-center justify-center">
        <PlanDiagram scale={planScale} active={selected} />
      </div>

      {/* Foot — label, unit, caption */}
      <div className="relative z-10 mt-auto p-6 lg:p-7">
        <div className="flex items-baseline gap-2">
          <p className="font-[var(--font-fraunces)] text-3xl text-[var(--bone)] lg:text-4xl">
            {size.label}
          </p>
          <span className="text-[10px] uppercase tracking-[0.32em] text-[var(--gold-soft)]">
            {size.unit}
          </span>
        </div>
        <p className="mt-3 text-xs leading-relaxed text-[var(--mist)]">
          {size.caption}
        </p>
      </div>
    </button>
  );
}

/**
 * Abstract pavilion plan — three blocks (central + two flanking), a hairline
 * connector. The whole figure scales by the `scale` prop and quietly breathes
 * when `active` is set.
 */
function PlanDiagram({ scale, active }: { scale: number; active: boolean }) {
  // Compose the inline width so the SVG itself is fixed but its container
  // scales with the size band. Animating width directly keeps the gold
  // stroke from getting visually thicker at larger sizes.
  const w = 60 + scale * 100;
  return (
    <motion.svg
      width={w}
      height={w * 0.65}
      viewBox="0 0 160 104"
      fill="none"
      aria-hidden
      animate={{
        scale: active ? [1, 1.04, 1] : 1,
      }}
      transition={{
        duration: 3.2,
        repeat: active ? Infinity : 0,
        ease: "easeInOut",
      }}
      style={{
        transition: "width 0.7s cubic-bezier(0.22,1,0.36,1)",
      }}
    >
      {/* Central hall */}
      <rect
        x="58"
        y="26"
        width="44"
        height="52"
        stroke={active ? "var(--gold-soft)" : "var(--mist)"}
        strokeWidth="0.8"
        opacity="0.85"
      />
      {/* Left wing */}
      <rect
        x="10"
        y="38"
        width="38"
        height="34"
        stroke={active ? "var(--gold-soft)" : "var(--mist)"}
        strokeWidth="0.8"
        opacity="0.7"
      />
      {/* Right wing */}
      <rect
        x="112"
        y="38"
        width="38"
        height="34"
        stroke={active ? "var(--gold-soft)" : "var(--mist)"}
        strokeWidth="0.8"
        opacity="0.7"
      />
      {/* Hairline connectors */}
      <path
        d="M48 55h10M102 55h10"
        stroke={active ? "var(--gold)" : "var(--whisper)"}
        strokeWidth="0.7"
      />
      {/* Front terrace */}
      <path
        d="M64 78v18h32V78"
        stroke={active ? "var(--gold-soft)" : "var(--mist)"}
        strokeWidth="0.6"
        opacity="0.55"
      />
    </motion.svg>
  );
}
