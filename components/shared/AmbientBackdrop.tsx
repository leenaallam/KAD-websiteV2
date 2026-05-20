"use client";

import { motion } from "framer-motion";
import { useEffect, useMemo } from "react";
import { useSceneStore } from "@/lib/stores/sceneStore";

type Props = {
  /**
   * When true, calls `setActive(null)` on mount — silences any active R3F
   * scene so the WebGL canvas doesn't paint over this backdrop. Use on
   * pages inside the marketing layout (which has the global CanvasRoot)
   * that want the ambient feel instead of a 3D scene.
   *
   * Leave false on pages outside the marketing layout (the portal already
   * has its own layout without R3F).
   */
  clearScene?: boolean;
};

/**
 * Ambient atmospheric backdrop — three GPU-cheap layers:
 *
 *   1) A slow-drifting warm gold radial (the studio's signature heat)
 *   2) A counter-drifting cool radial — atmospheric depth without flatness
 *   3) An architectural hairline grid, mask-faded toward the center
 *   4) ~22 floating dust motes (SVG circles, slow upward drift)
 *   5) A vignette that gathers the eye toward the content
 *
 * No R3F here on purpose. The backdrop must stay responsive on mid-range
 * devices, including phones with thumbs on inputs — a WebGL context would
 * compete with main-thread work.
 *
 * The original home for this composition was the portal flow. It was
 * extracted here once a second page (contact) asked for the same mood.
 * Both `PortalBackdrop` and future ambient surfaces re-export this so the
 * code lives in one place.
 */
export function AmbientBackdrop({ clearScene = false }: Props = {}) {
  const setActive = useSceneStore((s) => s.setActive);

  // Silence any 3D scene the user brought over from a previous route so the
  // global CanvasRoot doesn't render anything that would obscure us.
  useEffect(() => {
    if (clearScene) setActive(null);
    // Intentionally not cleaning up on unmount — the next page is
    // responsible for setting its own scene (or also clearing).
  }, [clearScene, setActive]);

  // Stable seeded particle positions — re-randomizing on every render would
  // cause the dust field to twitch when state changes upstream.
  const motes = useMemo(
    () =>
      Array.from({ length: 22 }, (_, i) => {
        // Deterministic pseudo-random from index so SSR matches client
        const r = (n: number) => {
          const x = Math.sin(n * 9301 + 49297) * 233280;
          return x - Math.floor(x);
        };
        return {
          x: r(i + 1) * 100,
          y: r(i + 99) * 100,
          size: 1 + r(i + 200) * 2.2,
          delay: r(i + 7) * 8,
          duration: 9 + r(i + 13) * 10,
          opacity: 0.18 + r(i + 21) * 0.42,
        };
      }),
    []
  );

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      {/* Deep base — keeps text contrast stable regardless of accents */}
      <div className="absolute inset-0 bg-[var(--ink)]" />

      {/* Drifting gold warmth — the studio's signature heat */}
      <motion.div
        className="absolute inset-[-15%]"
        initial={{ x: "-3%", y: "-2%" }}
        animate={{ x: "3%", y: "2%" }}
        transition={{
          duration: 24,
          ease: "easeInOut",
          repeat: Infinity,
          repeatType: "mirror",
        }}
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 35% 30%, rgba(201,163,59,0.22), transparent 65%)",
          filter: "blur(40px)",
        }}
      />

      {/* Cool counter-drift — pulls the gold so it doesn't read as flat */}
      <motion.div
        className="absolute inset-[-15%]"
        initial={{ x: "2%", y: "3%" }}
        animate={{ x: "-2%", y: "-3%" }}
        transition={{
          duration: 30,
          ease: "easeInOut",
          repeat: Infinity,
          repeatType: "mirror",
        }}
        style={{
          background:
            "radial-gradient(ellipse 55% 45% at 70% 75%, rgba(45,80,120,0.18), transparent 60%)",
          filter: "blur(60px)",
        }}
      />

      {/* Architectural grid — anchors the dreamlike layers with structure */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(234,227,210,0.5) 1px, transparent 1px), linear-gradient(to bottom, rgba(234,227,210,0.5) 1px, transparent 1px)",
          backgroundSize: "140px 140px",
          maskImage:
            "radial-gradient(ellipse at center, black 30%, transparent 75%)",
          WebkitMaskImage:
            "radial-gradient(ellipse at center, black 30%, transparent 75%)",
        }}
      />

      {/* Floating motes — the subliminal "alive" signal */}
      <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
        {motes.map((m, i) => (
          <motion.circle
            key={i}
            cx={`${m.x}%`}
            cy={`${m.y}%`}
            r={m.size}
            fill="rgba(216,184,104,1)"
            initial={{ opacity: 0, cy: `${m.y + 8}%` }}
            animate={{
              opacity: [0, m.opacity, m.opacity, 0],
              cy: [`${m.y + 8}%`, `${m.y}%`, `${m.y - 8}%`, `${m.y - 14}%`],
            }}
            transition={{
              duration: m.duration,
              delay: m.delay,
              ease: "easeInOut",
              repeat: Infinity,
              repeatType: "loop",
            }}
            style={{ filter: "blur(0.4px)" }}
          />
        ))}
      </svg>

      {/* Vignette — gathers the eye toward the center where content lives */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 35%, rgba(5,5,5,0.55) 80%, rgba(5,5,5,0.85) 100%)",
        }}
      />
    </div>
  );
}
