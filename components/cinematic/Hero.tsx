"use client";

import { motion } from "framer-motion";
import { LinkButton } from "@/components/ui/Button";
import { CdnImage } from "@/components/shared/CdnImage";
import { ease } from "@/lib/animations/easings";
import type { AssetEntry } from "@/types/assets";

type Props = {
  /** Optional cinematic background image. When supplied, replaces the
   *  abstract shader behind the hero. */
  asset?: AssetEntry | null;
};

/**
 * Cinematic hero. When `asset` is provided, the image is the canvas —
 * full-bleed, darkened with a top-and-bottom gradient that follows the
 * Editorial Cover archetype from the KAD design system. Without an asset,
 * the typography sits over the global R3F canvas alone.
 */
export function Hero({ asset }: Props) {
  return (
    <section className="relative isolate flex min-h-[100dvh] items-center overflow-hidden">
      {/* Cinematic image layer */}
      {asset && (
        <div aria-hidden className="absolute inset-0 z-0">
          <CdnImage
            asset={asset}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          {/* Slow Ken-Burns drift on the image */}
          <motion.div
            initial={{ scale: 1.06 }}
            animate={{ scale: 1.0 }}
            transition={{ duration: 12, ease: ease.luxe }}
            className="absolute inset-0"
          />
        </div>
      )}

      {/* Base tint — lifts the overall image darkness a uniform half-step
           so the scene reads as intentionally cinematic rather than blown-out */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{ background: "rgba(5,5,5,0.30)" }}
      />

      {/* Editorial-cover gradient — heavy top for header legibility,
           strong bottom pull so text content floats clearly above the image.
           The 55%→100% ramp is deliberately steep so the floor reads as
           pure dark without a hard edge. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{
          background:
            "linear-gradient(180deg, rgba(5,5,5,0.72) 0%, rgba(5,5,5,0.22) 18%, rgba(5,5,5,0.08) 42%, rgba(5,5,5,0.38) 62%, rgba(5,5,5,0.82) 80%, rgba(5,5,5,0.97) 100%)",
        }}
      />

      {/* Architectural hairline grid — quietens out toward the center */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[1] opacity-[0.06]"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(234,227,210,0.5) 1px, transparent 1px), linear-gradient(to bottom, rgba(234,227,210,0.5) 1px, transparent 1px)",
          backgroundSize: "120px 120px",
          maskImage:
            "radial-gradient(ellipse at center, black 25%, transparent 70%)",
          WebkitMaskImage:
            "radial-gradient(ellipse at center, black 25%, transparent 70%)",
        }}
      />

      <div className="relative z-10 mx-auto w-full max-w-[1600px] px-6 lg:px-12">
        {/* HUD eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: ease.luxe, delay: 0.2 }}
          className="flex items-center gap-3"
        >
          <span
            aria-hidden
            className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--gold)]"
            style={{
              boxShadow: "0 0 18px 4px rgba(201,163,59,0.7)",
              animation: "kadPulse 2.6s ease-in-out infinite",
            }}
          />
          <span className="eyebrow gold-glow-text">KAD · Atelier of Interiors</span>
        </motion.div>

        {/* Headline — staggered line reveal with mask */}
        <h1 className="mt-10 max-w-[18ch] text-[clamp(3rem,9vw,9.5rem)] leading-[0.95] tracking-[-0.02em] text-[var(--bone)]">
          <HeroLine delay={0.45}>Minimalism</HeroLine>
          <HeroLine delay={0.6}>
            <span className="italic text-[var(--gold-soft)] gold-glow-text">meets</span>{" "}
            <span>emotion.</span>
          </HeroLine>
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: ease.luxe, delay: 1.0 }}
          className="mt-10 max-w-md text-base leading-relaxed text-[var(--bone)]/85"
        >
          Luxury interior experiences beyond space — a studio composing
          architecture, light, and material into rooms that feel inevitable.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: ease.luxe, delay: 1.18 }}
          className="mt-14 flex flex-col gap-4 sm:flex-row"
        >
          <LinkButton href="/projects" size="lg">
            View Projects
          </LinkButton>
          <LinkButton href="/portal" size="lg" variant="ghost">
            Start Your Project
          </LinkButton>
        </motion.div>

        {/* Bottom HUD — coordinates / scroll cue */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.4, ease: ease.luxe, delay: 1.6 }}
          className="absolute inset-x-6 bottom-10 flex items-end justify-between text-[10px] uppercase tracking-[0.3em] text-[var(--whisper)] lg:inset-x-12"
        >
          <span>30°02ʹN · 31°14ʹE — Cairo</span>
          <a
            href="#stories"
            data-cursor="link"
            className="group flex items-center gap-3 text-[var(--mist)] transition-colors hover:text-[var(--gold-soft)]"
          >
            <span>Scroll</span>
            <svg
              width="40"
              height="10"
              viewBox="0 0 40 10"
              fill="none"
              aria-hidden
              className="transition-transform group-hover:translate-x-1"
            >
              <path
                d="M0 5h38M34 1l4 4-4 4"
                stroke="currentColor"
                strokeWidth="0.8"
              />
            </svg>
          </a>
        </motion.div>
      </div>

      <style>{`
        @keyframes kadPulse {
          0%, 100% { transform: scale(1);   opacity: 1; }
          50%      { transform: scale(1.6); opacity: 0.55; }
        }
      `}</style>
      {/* kadGoldGlow is declared in globals.css so it's available globally;
          kadPulse stays here because it's scoped to this component only. */}
    </section>
  );
}

function HeroLine({
  children,
  delay,
}: {
  children: React.ReactNode;
  delay: number;
}) {
  return (
    <span className="block overflow-hidden">
      <motion.span
        initial={{ y: "110%", opacity: 0 }}
        animate={{ y: "0%", opacity: 1 }}
        transition={{ duration: 1.4, ease: ease.luxe, delay }}
        className="block"
        style={{ fontFamily: "var(--font-fraunces, Georgia, serif)" }}
      >
        {children}
      </motion.span>
    </span>
  );
}
