"use client";

import { motion } from "framer-motion";
import { useRef, useState } from "react";
import { useScrollTrigger } from "@/hooks/useScrollTrigger";
import { ease } from "@/lib/animations/easings";

const PHASES = [
  { word: "you remember", caption: "rooms that hold a feeling" },
  { word: "by feel", caption: "before by name" },
  { word: "that wait", caption: "without urgency" },
  { word: "that age", caption: "into themselves" },
] as const;

/**
 * Pinned scroll-driven manifesto. The user encounters one sentence with a
 * "missing" final word — and as they scroll, that word cycles through four
 * truths the studio believes. Each swap is a blur-and-rise transition;
 * each phase holds for roughly a viewport of scroll.
 *
 * Implementation:
 *   - The section is pinned for `(PHASES.length + 1) × 100vh` of scroll
 *   - GSAP ScrollTrigger fires a `phase` index based on scroll progress
 *   - React state drives Framer Motion key swaps for the word + caption
 *
 * The pinning is the WOW gesture — the page stops, the eye is held, and
 * the four-line manifesto lands like a film card sequence.
 */
export function AboutManifesto() {
  const ref = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState(0);

  useScrollTrigger(ref, ({ ScrollTrigger, el }) => {
    const total = PHASES.length;
    ScrollTrigger.create({
      trigger: el,
      start: "top top",
      end: `+=${total * 90}%`,
      pin: true,
      pinSpacing: true,
      scrub: false,
      onUpdate: (self) => {
        // self.progress 0..1 over the pinned distance. Map to a 0..total-1
        // discrete phase, with a small bias so phases feel evenly spaced.
        const idx = Math.min(
          total - 1,
          Math.floor(self.progress * total * 0.999)
        );
        setPhase((p) => (p === idx ? p : idx));
      },
    });
  });

  const current = PHASES[phase];

  return (
    <section
      ref={ref}
      className="relative isolate flex min-h-[100dvh] items-center overflow-hidden px-6 lg:px-12"
    >
      {/* Soft side-light — pulls the eye to the center text */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-[1]"
        style={{
          background:
            "radial-gradient(ellipse at 50% 50%, rgba(201,163,59,0.06), transparent 55%)",
        }}
      />

      <div className="mx-auto w-full max-w-[1600px]">
        {/* Eyebrow with phase pip indicator */}
        <div className="flex items-center gap-6">
          <p className="eyebrow gold-glow-text">Manifesto · {String(phase + 1).padStart(2, "0")} / {String(PHASES.length).padStart(2, "0")}</p>
          <div className="flex flex-1 max-w-xs items-center gap-1">
            {PHASES.map((_, i) => (
              <span
                key={i}
                className="block h-px flex-1 transition-all duration-700"
                style={{
                  background:
                    i <= phase
                      ? "linear-gradient(to right, var(--gold-deep), var(--gold-soft))"
                      : "rgba(234,227,210,0.12)",
                  boxShadow:
                    i === phase ? "0 0 12px rgba(201,163,59,0.55)" : "none",
                }}
              />
            ))}
          </div>
        </div>

        {/* Composed sentence */}
        <h2 className="mt-12 max-w-6xl text-[clamp(2.6rem,8vw,8rem)] leading-[0.98] tracking-[-0.02em] text-[var(--bone)] lg:mt-20">
          <span style={{ fontFamily: "var(--font-fraunces), Georgia, serif" }}>
            We design rooms{" "}
          </span>
          {/* Swapping word — gold italic, with blur+rise transition */}
          <SwappingWord word={current.word} />
          <span style={{ fontFamily: "var(--font-fraunces), Georgia, serif" }}>.</span>
        </h2>

        {/* Sub-caption swaps in lockstep */}
        <div className="mt-12 h-7 overflow-hidden lg:mt-16">
          <SwappingCaption text={current.caption} />
        </div>
      </div>

      {/* Phase counter — bottom-right, very quiet */}
      <div className="absolute bottom-10 right-6 text-[10px] uppercase tracking-[0.4em] text-[var(--whisper)] lg:right-12">
        Hold · scroll
      </div>
    </section>
  );
}

function SwappingWord({ word }: { word: string }) {
  return (
    <span className="relative inline-block align-baseline">
      <motion.span
        key={word}
        initial={{ y: "60%", opacity: 0, filter: "blur(20px)" }}
        animate={{ y: "0%", opacity: 1, filter: "blur(0px)" }}
        exit={{ y: "-60%", opacity: 0, filter: "blur(20px)" }}
        transition={{ duration: 0.9, ease: ease.luxe }}
        className="inline-block italic text-[var(--gold-soft)] gold-glow-text"
        style={{ fontFamily: "var(--font-fraunces), Georgia, serif" }}
      >
        {word}
      </motion.span>
    </span>
  );
}

function SwappingCaption({ text }: { text: string }) {
  return (
    <motion.p
      key={text}
      initial={{ y: 16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: ease.luxe, delay: 0.1 }}
      className="text-base uppercase tracking-[0.32em] text-[var(--mist)]"
    >
      — {text}
    </motion.p>
  );
}
