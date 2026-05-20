"use client";

import { motion } from "framer-motion";
import { useEffect } from "react";
import { useSceneStore } from "@/lib/stores/sceneStore";
import { ease } from "@/lib/animations/easings";

/**
 * Opening fanfare for the portfolio constellation. Activates the
 * `projects` R3F scene the moment the page mounts so the galaxy is
 * already drifting when the user lands.
 *
 * Three typography waves:
 *   1) Eyebrow whisper
 *   2) Three headline words ("A galaxy of rooms.") each rising with
 *      blur clearing — same gesture as the About hero so the brand
 *      voice carries between pages
 *   3) Editorial paragraph
 *
 * The bottom HUD shows project count + scroll cue.
 */
export function ProjectsHero({ count }: { count: number }) {
  const setActive = useSceneStore((s) => s.setActive);
  useEffect(() => {
    setActive("projects");
  }, [setActive]);

  return (
    <section className="relative isolate flex min-h-[100dvh] flex-col justify-center overflow-hidden px-6 lg:px-12">
      {/* Soft center vignette — pulls the eye to the headline */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-[1]"
        style={{
          background:
            "radial-gradient(ellipse at 50% 50%, transparent 35%, rgba(5,5,5,0.6) 85%)",
        }}
      />

      <div className="mx-auto w-full max-w-[1600px]">
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
            Portfolio · {String(count).padStart(2, "0")} Realised
          </span>
        </motion.div>

        <h1 className="mt-12 max-w-[16ch] text-[clamp(3rem,10vw,10rem)] leading-[0.92] tracking-[-0.025em] text-[var(--bone)] lg:mt-16">
          <HeroWord delay={0.7}>A</HeroWord>
          <HeroWord delay={0.95} italic accent>
            galaxy
          </HeroWord>
          <HeroWord delay={1.2}>of</HeroWord>
          <HeroWord delay={1.45}>rooms.</HeroWord>
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.4, ease: ease.luxe, delay: 2.0 }}
          className="mt-14 max-w-md text-lg leading-relaxed text-[var(--mist)] lg:mt-20"
        >
          Eleven commissions composed across MENA. Each is a long, deliberate
          conversation with a single space — fly through to read the
          architecture in detail.
        </motion.p>
      </div>

      {/* Bottom HUD — same vocabulary as the About hero */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.6, ease: ease.luxe, delay: 2.4 }}
        className="absolute inset-x-6 bottom-10 mx-auto flex max-w-[1600px] items-end justify-between text-[10px] uppercase tracking-[0.32em] text-[var(--whisper)] lg:inset-x-12"
      >
        <div className="flex flex-col gap-2">
          <span>Atlas · MENA</span>
          <span className="text-[var(--gold-soft)]">
            {String(count).padStart(2, "0")} Destinations
          </span>
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
        transition={{ duration: 1.6, ease: ease.luxe, delay }}
        className={`inline-block ${italic ? "italic" : ""} ${
          accent ? "text-[var(--gold-soft)] gold-glow-text" : ""
        }`}
        style={{
          fontFamily: "var(--font-fraunces), Georgia, serif",
        }}
      >
        {children}
      </motion.span>
      <span aria-hidden>&nbsp;</span>
    </span>
  );
}

function ScrollCue() {
  return (
    <div className="flex flex-col items-end gap-3">
      <span>Engage</span>
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
