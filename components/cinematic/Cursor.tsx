"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Hairline gold cursor — a small dot that follows the pointer 1:1 and a
 * trailing ring that lerps behind it. Expands on hover of any element with
 * `data-cursor="link"` for buttons/links. Hidden on coarse pointers.
 */
export function Cursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const coarse =
      window.matchMedia("(pointer: coarse)").matches ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setEnabled(!coarse);
    if (coarse) return;

    let mx = window.innerWidth / 2;
    let my = window.innerHeight / 2;
    let rx = mx;
    let ry = my;
    let raf = 0;

    const onMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${mx}px, ${my}px, 0) translate(-50%, -50%)`;
      }
    };

    const tick = () => {
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${rx}px, ${ry}px, 0) translate(-50%, -50%)`;
      }
      raf = requestAnimationFrame(tick);
    };

    const onOver = (e: MouseEvent) => {
      const t = e.target as HTMLElement | null;
      const link = t?.closest('[data-cursor="link"], a, button');
      if (link) ringRef.current?.classList.add("is-link");
      else ringRef.current?.classList.remove("is-link");
    };

    window.addEventListener("mousemove", onMove);
    document.addEventListener("mouseover", onOver);
    raf = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseover", onOver);
      cancelAnimationFrame(raf);
    };
  }, []);

  if (!enabled) return null;

  return (
    <>
      <style>{`
        .kad-cursor-dot {
          position: fixed;
          top: 0; left: 0;
          width: 6px; height: 6px;
          border-radius: 999px;
          background: var(--gold);
          pointer-events: none;
          z-index: 100;
          mix-blend-mode: screen;
          will-change: transform;
        }
        .kad-cursor-ring {
          position: fixed;
          top: 0; left: 0;
          width: 36px; height: 36px;
          border: 1px solid rgba(201, 163, 59, 0.55);
          border-radius: 999px;
          pointer-events: none;
          z-index: 99;
          mix-blend-mode: screen;
          transition:
            width 0.4s var(--ease-luxe),
            height 0.4s var(--ease-luxe),
            border-color 0.3s var(--ease-luxe),
            background-color 0.3s var(--ease-luxe);
          will-change: transform;
        }
        .kad-cursor-ring.is-link {
          width: 64px; height: 64px;
          border-color: var(--gold);
          background-color: rgba(201, 163, 59, 0.08);
        }
      `}</style>
      <div ref={ringRef} className="kad-cursor-ring" aria-hidden />
      <div ref={dotRef} className="kad-cursor-dot" aria-hidden />
    </>
  );
}
