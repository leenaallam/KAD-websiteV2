"use client";

import { useEffect, useRef, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { getLenis } from "./useLenis";

let registered = false;
function ensureRegistered() {
  if (registered || typeof window === "undefined") return;
  gsap.registerPlugin(ScrollTrigger);
  registered = true;

  // Wire Lenis → ScrollTrigger so GSAP scroll-based animations stay in sync
  // with the smooth scroll engine. This is the canonical fix for the
  // Lenis × ScrollTrigger desync most projects hit.
  const lenis = getLenis();
  if (lenis) {
    lenis.on("scroll", ScrollTrigger.update);
  }
  gsap.ticker.add((time) => {
    getLenis()?.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);
}

/**
 * Run a scoped GSAP context against a target ref. Cleans up automatically
 * on unmount. Pass a callback that receives `gsap` and the resolved element.
 */
export function useScrollTrigger<T extends HTMLElement>(
  ref: RefObject<T | null>,
  setup: (ctx: { gsap: typeof gsap; el: T; ScrollTrigger: typeof ScrollTrigger }) => void,
  deps: React.DependencyList = []
) {
  const setupRef = useRef(setup);
  setupRef.current = setup;

  useEffect(() => {
    ensureRegistered();
    const el = ref.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      setupRef.current({ gsap, el, ScrollTrigger });
    }, el);
    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref, ...deps]);
}
