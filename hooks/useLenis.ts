"use client";

import { useEffect } from "react";
import Lenis from "lenis";

let sharedInstance: Lenis | null = null;

/** Module-scoped accessor so other hooks (GSAP wiring) can read the
 * single Lenis instance without prop-drilling. */
export function getLenis(): Lenis | null {
  return sharedInstance;
}

/**
 * Initializes Lenis once for the marketing tree. Subsequent calls return the
 * existing instance — safe for use inside a top-level provider.
 */
export function useLenisInit(opts?: ConstructorParameters<typeof Lenis>[0]) {
  useEffect(() => {
    if (sharedInstance) return;

    const lenis = new Lenis({
      lerp: 0.09,
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.4,
      ...opts,
    });
    sharedInstance = lenis;
    document.documentElement.classList.add("lenis", "lenis-smooth");

    let rafId = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      sharedInstance = null;
      document.documentElement.classList.remove("lenis", "lenis-smooth");
    };
  }, [opts]);
}
