"use client";

import { useEffect, useRef, type RefObject } from "react";

type MagneticOpts = {
  /** Maximum displacement at the edge of the activation radius, in px. */
  strength?: number;
  /** Distance (px) from the element where magnetism kicks in. */
  radius?: number;
};

/**
 * Apply a magnetic hover effect to the referenced element. The element is
 * translated toward the cursor with a soft easing while the cursor is within
 * the activation radius, and released smoothly on leave.
 *
 * Disabled on coarse pointers / reduced motion.
 */
export function useMagnetic<T extends HTMLElement>(
  ref: RefObject<T | null>,
  { strength = 18, radius = 120 }: MagneticOpts = {}
) {
  const tx = useRef(0);
  const ty = useRef(0);
  const cx = useRef(0);
  const cy = useRef(0);
  const raf = useRef<number | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const coarse =
      window.matchMedia("(pointer: coarse)").matches ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (coarse) return;

    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      const cxx = r.left + r.width / 2;
      const cyy = r.top + r.height / 2;
      const dx = e.clientX - cxx;
      const dy = e.clientY - cyy;
      const dist = Math.hypot(dx, dy);
      if (dist < radius + Math.max(r.width, r.height) / 2) {
        const n = Math.min(1, dist / radius);
        tx.current = (dx / radius) * strength * (1 - n * 0.5);
        ty.current = (dy / radius) * strength * (1 - n * 0.5);
      } else {
        tx.current = 0;
        ty.current = 0;
      }
      ensureLoop();
    };

    const onLeave = () => {
      tx.current = 0;
      ty.current = 0;
      ensureLoop();
    };

    const tick = () => {
      cx.current += (tx.current - cx.current) * 0.18;
      cy.current += (ty.current - cy.current) * 0.18;
      el.style.transform = `translate3d(${cx.current.toFixed(
        2
      )}px, ${cy.current.toFixed(2)}px, 0)`;

      if (
        Math.abs(cx.current - tx.current) < 0.05 &&
        Math.abs(cy.current - ty.current) < 0.05 &&
        tx.current === 0 &&
        ty.current === 0
      ) {
        if (raf.current) cancelAnimationFrame(raf.current);
        raf.current = null;
        el.style.transform = "translate3d(0,0,0)";
        return;
      }
      raf.current = requestAnimationFrame(tick);
    };

    function ensureLoop() {
      if (raf.current == null) raf.current = requestAnimationFrame(tick);
    }

    window.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      window.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
      if (raf.current) cancelAnimationFrame(raf.current);
      el.style.transform = "";
    };
  }, [ref, strength, radius]);
}
