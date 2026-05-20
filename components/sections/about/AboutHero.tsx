"use client";

import { motion } from "framer-motion";
import { CdnImage } from "@/components/shared/CdnImage";
import { ease } from "@/lib/animations/easings";
import type { AssetEntry } from "@/types/assets";

type Props = {
  /** Optional behind-the-scenes cover image. When supplied, it replaces
   *  the bare R3F atmosphere with a full-bleed photograph + editorial
   *  darkening gradient — matching the Editorial Cover archetype used on
   *  the home hero. */
  asset?: AssetEntry | null;
};

/**
 * Cinematic opener. When `asset` is supplied, a full-bleed photograph
 * sits behind the typography; otherwise the R3F atelier scene plays
 * solo. Typography arrives in three choreographed waves regardless:
 *   1) Eyebrow whisper-fades up
 *   2) The three headline words ("Composed in silence.") each rise from
 *      below with blur clearing — staggered 250ms apart
 *   3) A single editorial paragraph fades up at the end
 *
 * The hero claims a full 100dvh of attention before the user can scroll
 * past it. Bottom HUD coordinates anchor the scene geographically.
 */
export function AboutHero({ asset }: Props) {
  // Note: the R3F atelier scene (`AboutScene` — floating blueprint sheets
  // + particle dust) is no longer activated here. The About page now sits
  // over the shared `AmbientBackdrop` (warm gold + cool counter-drift +
  // dust motes + hairline grid), unifying the atmospheric language with
  // the portal and contact pages. The AmbientBackdrop's `clearScene` prop
  // sets the scene store to null on mount, so the WebGL canvas stays
  // quiet across every chapter of this page.

  return (
    <section className="relative isolate flex min-h-[100dvh] flex-col justify-center overflow-hidden px-6 lg:px-12">
      {/* Cinematic image cover — when supplied, this becomes the primary
          visual; otherwise the R3F atelier scene shows through. */}
      {asset && (
        <div aria-hidden className="absolute inset-0 -z-[2]">
          <CdnImage
            asset={asset}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          {/* Slow Ken-Burns drift — the room "breathes" over the 14s after load */}
          <motion.div
            initial={{ scale: 1.08 }}
            animate={{ scale: 1.0 }}
            transition={{ duration: 14, ease: ease.luxe }}
            className="absolute inset-0"
          />
        </div>
      )}

      {/* Base flat tint — only when there's an image. Uniformly darkens the
          whole frame a half-step so the photograph reads as a cinematic
          shot, not a brightly-lit reference. Stacks below the directional
          gradient so the two compound without fighting each other. */}
      {asset && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-[1]"
          style={{ background: "rgba(5,5,5,0.32)" }}
        />
      )}

      {/* Editorial darkening — heavy top for header legibility, gentle in the
          middle where the headline lives, then a long smooth ramp from ~55%
          downward that blends the lower frame into near-black. The bottom
          HUD (coordinates, scroll cue) reads cleanly against this final dark. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-[1]"
        style={{
          background: asset
            ? "linear-gradient(180deg, rgba(5,5,5,0.72) 0%, rgba(5,5,5,0.30) 18%, rgba(5,5,5,0.16) 42%, rgba(5,5,5,0.32) 58%, rgba(5,5,5,0.62) 74%, rgba(5,5,5,0.88) 88%, rgba(5,5,5,0.98) 100%)"
            : "radial-gradient(ellipse at 50% 45%, transparent 30%, rgba(5,5,5,0.55) 80%)",
        }}
      />

      {/* Architectural hairline grid mask — only when the image is present,
          to add a quiet "blueprint over photograph" overlay. */}
      {asset && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-[1] opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(234,227,210,0.5) 1px, transparent 1px), linear-gradient(to bottom, rgba(234,227,210,0.5) 1px, transparent 1px)",
            backgroundSize: "140px 140px",
            maskImage:
              "radial-gradient(ellipse at center, black 25%, transparent 75%)",
            WebkitMaskImage:
              "radial-gradient(ellipse at center, black 25%, transparent 75%)",
          }}
        />
      )}

      <div className="mx-auto w-full max-w-[1600px]">
        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.0, ease: ease.luxe, delay: 0.4 }}
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
          <span className="eyebrow gold-glow-text">
            Atelier · Cairo · Est. 2019
          </span>
        </motion.div>

        {/* Headline — three-word split reveal */}
        <h1 className="mt-12 max-w-[14ch] text-[clamp(3.4rem,11vw,11rem)] leading-[0.92] tracking-[-0.025em] text-[var(--bone)] lg:mt-16">
          <HeroWord delay={0.7}>Composed</HeroWord>
          <HeroWord delay={0.95} italic accent>
            in
          </HeroWord>
          <HeroWord delay={1.2}>silence.</HeroWord>
        </h1>

        {/* Editorial paragraph */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.4, ease: ease.luxe, delay: 1.8 }}
          className="mt-14 max-w-md text-lg leading-relaxed text-[var(--mist)] lg:mt-20"
        >
          KAD is an atelier of interiors — a practice of patience, restraint,
          and the long quiet hand of architecture.
        </motion.p>
      </div>

      {/* Bottom HUD — atelier coordinates + scroll cue */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.6, ease: ease.luxe, delay: 2.2 }}
        className="absolute inset-x-6 bottom-10 mx-auto flex max-w-[1600px] items-end justify-between text-[10px] uppercase tracking-[0.32em] text-[var(--whisper)] lg:inset-x-12"
      >
        <div className="flex flex-col gap-2">
          <span>30°02ʹN · 31°14ʹE — Cairo</span>
          <span className="text-[var(--gold-soft)]">06 Chapters</span>
        </div>
        <ScrollCue />
      </motion.div>

      <style>{`
        @keyframes kadPulse {
          0%, 100% { transform: scale(1);   opacity: 1; }
          50%      { transform: scale(1.6); opacity: 0.55; }
        }
      `}</style>
    </section>
  );
}

/**
 * One word of the cinematic headline. Combines y-translate, opacity, and a
 * clearing blur — the "filmic title card" gesture. Each word lives inside
 * a clipping span so the up-motion reads as theatrical, not just transform.
 */
function HeroWord({
  children,
  delay,
  italic,
  accent,
}: {
  children: React.ReactNode;
  delay: number;
  italic?: boolean;
  accent?: boolean;
}) {
  return (
    <span className="inline-block overflow-hidden align-baseline">
      <motion.span
        initial={{ y: "100%", opacity: 0, filter: "blur(14px)" }}
        animate={{ y: "0%", opacity: 1, filter: "blur(0px)" }}
        transition={{
          duration: 1.6,
          ease: ease.luxe,
          delay,
        }}
        className={`inline-block ${italic ? "italic" : ""} ${
          accent ? "text-[var(--gold-soft)] gold-glow-text" : ""
        }`}
        style={{
          fontFamily: "var(--font-fraunces), Georgia, serif",
        }}
      >
        {children}
        {/* The trailing space lives outside the clip so words breathe apart */}
      </motion.span>
      <span aria-hidden>&nbsp;</span>
    </span>
  );
}

function ScrollCue() {
  return (
    <div className="flex flex-col items-end gap-3">
      <span>Scroll</span>
      <span
        aria-hidden
        className="block h-10 w-px"
        style={{
          background:
            "linear-gradient(to bottom, transparent, var(--gold-soft), transparent)",
          animation: "kadScrollHint 2.8s ease-in-out infinite",
        }}
      />
      <style>{`
        @keyframes kadScrollHint {
          0%, 100% { transform: translateY(-6px); opacity: 0.4; }
          50%      { transform: translateY(6px);  opacity: 1; }
        }
      `}</style>
    </div>
  );
}
