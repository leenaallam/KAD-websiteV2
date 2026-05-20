"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type Props = {
  selected: boolean;
  onSelect: () => void;
  label: string;
  caption?: string;
  /** Optional decorative content rendered above the label (icon, illustration). */
  visual?: ReactNode;
  /** Multi-select context shows a "Selected" check rather than a single radio. */
  multiSelect?: boolean;
  /** Override card aspect — defaults to portrait. */
  aspect?: "portrait" | "landscape" | "square";
  className?: string;
};

/**
 * The default selectable surface in the portal.
 *
 * Three interaction layers compose the luxe feel:
 *   - 3D tilt: pointer position translates to subtle X/Y rotation via springs
 *   - Lit-corner glow: a soft radial follows the cursor inside the card
 *   - Selection lock: when picked, the gold hairline border holds and a quiet
 *     bloom replaces the cursor-tracking highlight
 *
 * Everything degrades gracefully — on touch devices the tilt + cursor halo
 * simply don't fire, and the selected state still reads clearly.
 */
export function ChoiceCard({
  selected,
  onSelect,
  label,
  caption,
  visual,
  multiSelect,
  aspect = "portrait",
  className,
}: Props) {
  const ref = useRef<HTMLButtonElement>(null);

  // Pointer position relative to the card, normalized -1..1 on each axis.
  const px = useMotionValue(0);
  const py = useMotionValue(0);

  // Springs smooth the tilt so the card never snaps — every motion reads slow.
  const rotateX = useSpring(useTransform(py, [-1, 1], [6, -6]), {
    stiffness: 160,
    damping: 22,
  });
  const rotateY = useSpring(useTransform(px, [-1, 1], [-7, 7]), {
    stiffness: 160,
    damping: 22,
  });

  // Cursor halo coordinates in % for radial-gradient placement.
  // Composed into a single MotionValue<string> via the function-form
  // useTransform — the array-form combiner has frustrating typings.
  const haloX = useTransform(px, [-1, 1], ["10%", "90%"]);
  const haloY = useTransform(py, [-1, 1], ["10%", "90%"]);
  const halo = useTransform(
    () =>
      `radial-gradient(circle 240px at ${haloX.get()} ${haloY.get()}, rgba(201,163,59,0.22), transparent 65%)`
  );

  const handleMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = ((e.clientY - rect.top) / rect.height) * 2 - 1;
    px.set(x);
    py.set(y);
  };

  const handleLeave = () => {
    px.set(0);
    py.set(0);
  };

  const aspectClass =
    aspect === "portrait"
      ? "aspect-[4/5]"
      : aspect === "landscape"
        ? "aspect-[5/3]"
        : "aspect-square";

  return (
    <motion.button
      ref={ref}
      type="button"
      data-cursor="link"
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
      onClick={onSelect}
      aria-pressed={selected}
      style={{ rotateX, rotateY, transformPerspective: 900 }}
      whileTap={{ scale: 0.985 }}
      className={cn(
        "group relative isolate w-full overflow-hidden rounded-2xl border text-left",
        "transition-[border-color,background-color,box-shadow] duration-500",
        "ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform",
        selected
          ? "border-[var(--gold)] bg-[rgba(201,163,59,0.06)] shadow-[0_0_0_1px_rgba(201,163,59,0.2),0_30px_80px_-20px_rgba(201,163,59,0.35)]"
          : "border-[rgba(234,227,210,0.1)] bg-[rgba(11,11,13,0.45)] hover:border-[rgba(201,163,59,0.45)]",
        aspectClass,
        className
      )}
    >
      {/* Cursor halo — soft warm puddle that follows the pointer */}
      <motion.span
        aria-hidden
        className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{ background: halo }}
      />

      {/* Selected-state bloom — replaces the hover halo with a steady glow */}
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

      {/* Hairline frame — animated corner brackets when selected */}
      {selected && (
        <>
          <Corner pos="tl" />
          <Corner pos="tr" />
          <Corner pos="bl" />
          <Corner pos="br" />
        </>
      )}

      {/* Card content */}
      <div className="relative z-10 flex h-full flex-col justify-between p-6 lg:p-8">
        <div className="flex items-start justify-between">
          {visual ? (
            <div className="text-[var(--gold-soft)]">{visual}</div>
          ) : (
            <span aria-hidden className="block h-px w-10 bg-[var(--gold)]" />
          )}
          <SelectionPip selected={selected} multiSelect={multiSelect} />
        </div>

        <div>
          <p className="font-[var(--font-fraunces)] text-2xl leading-[1.1] text-[var(--bone)] lg:text-3xl">
            {label}
          </p>
          {caption && (
            <p className="mt-3 text-xs leading-relaxed text-[var(--mist)]">
              {caption}
            </p>
          )}
        </div>
      </div>
    </motion.button>
  );
}

function Corner({ pos }: { pos: "tl" | "tr" | "bl" | "br" }) {
  const map = {
    tl: "top-3 left-3 border-t border-l",
    tr: "top-3 right-3 border-t border-r",
    bl: "bottom-3 left-3 border-b border-l",
    br: "bottom-3 right-3 border-b border-r",
  } as const;
  return (
    <motion.span
      aria-hidden
      initial={{ opacity: 0, scale: 0.6 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "pointer-events-none absolute h-4 w-4 border-[var(--gold-soft)]",
        map[pos]
      )}
    />
  );
}

function SelectionPip({
  selected,
  multiSelect,
}: {
  selected: boolean;
  multiSelect?: boolean;
}) {
  return (
    <span
      aria-hidden
      className={cn(
        "flex h-6 w-6 items-center justify-center rounded-full border transition-all duration-500",
        selected
          ? "border-[var(--gold)] bg-[rgba(201,163,59,0.18)]"
          : "border-[rgba(234,227,210,0.18)]"
      )}
    >
      {selected &&
        (multiSelect ? (
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path
              d="M1.5 5.2L4 7.5L8.5 2.5"
              stroke="var(--gold-soft)"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ) : (
          <span className="h-2 w-2 rounded-full bg-[var(--gold-soft)]" />
        ))}
    </span>
  );
}
