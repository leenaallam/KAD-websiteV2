"use client";

import { useEffect } from "react";
import { useLenisInit } from "@/hooks/useLenis";

/**
 * Top-level provider that mounts a single Lenis instance for the marketing
 * tree. Pages and sections under (marketing) inherit smooth scroll without
 * having to wire it up themselves.
 *
 * Lenis is intentionally NOT mounted in /portal or /admin — those routes
 * benefit from native scroll behavior for forms and lists.
 */
export function SmoothScrollProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useLenisInit({
    duration: 1.15,
    lerp: 0.09,
    smoothWheel: true,
    touchMultiplier: 1.4,
  });

  // Native anchor jumps need a hand-off to Lenis so they animate smoothly.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest('a[href^="#"]') as HTMLAnchorElement | null;
      if (!anchor) return;
      const id = anchor.getAttribute("href")?.slice(1);
      if (!id) return;
      const el = document.getElementById(id);
      if (!el) return;
      e.preventDefault();
      import("@/hooks/useLenis").then(({ getLenis }) => {
        getLenis()?.scrollTo(el, { offset: -64, duration: 1.4 });
      });
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return <>{children}</>;
}
