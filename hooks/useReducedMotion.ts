"use client";

import { useEffect, useState } from "react";

/**
 * SSR-safe `prefers-reduced-motion` listener. Defaults to `false` on the
 * server / first paint so the visual treatment doesn't flash; flips on the
 * client when the OS setting says so.
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReduced(mql.matches);
    apply();
    mql.addEventListener("change", apply);
    return () => mql.removeEventListener("change", apply);
  }, []);

  return reduced;
}
