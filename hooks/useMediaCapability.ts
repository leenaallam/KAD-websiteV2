"use client";

import { useEffect, useState } from "react";

export type MediaCapability = {
  /** Best guess at whether this device can comfortably run the heavy WebGL hero. */
  canRunHeavy: boolean;
  /** True for touch / coarse pointer devices — disables the custom cursor. */
  isTouch: boolean;
  /** True if the user's reduced-motion preference is set. */
  reducedMotion: boolean;
  /** Whether WebGL2 is available at all. */
  hasWebGL: boolean;
};

const DEFAULT: MediaCapability = {
  canRunHeavy: true,
  isTouch: false,
  reducedMotion: false,
  hasWebGL: true,
};

/**
 * Probes the visitor's hardware + preferences to decide whether to
 * activate the full cinematic stack or fall back to the static treatment.
 * Conservative thresholds: ≥4 cores AND ≥4GB RAM, no touch screen,
 * no reduced-motion preference, and a working WebGL context.
 */
export function useMediaCapability(): MediaCapability {
  const [cap, setCap] = useState<MediaCapability>(DEFAULT);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const isTouch =
      window.matchMedia("(pointer: coarse)").matches ||
      "ontouchstart" in window;

    const nav = navigator as Navigator & {
      deviceMemory?: number;
      hardwareConcurrency?: number;
    };

    const memory = nav.deviceMemory ?? 8;
    const cores = nav.hardwareConcurrency ?? 8;

    let hasWebGL = false;
    try {
      const canvas = document.createElement("canvas");
      hasWebGL = !!(
        canvas.getContext("webgl2") ||
        canvas.getContext("webgl") ||
        canvas.getContext("experimental-webgl")
      );
    } catch {
      hasWebGL = false;
    }

    const canRunHeavy =
      hasWebGL && memory >= 4 && cores >= 4 && !reducedMotion && !isTouch;

    setCap({ canRunHeavy, isTouch, reducedMotion, hasWebGL });
  }, []);

  return cap;
}
