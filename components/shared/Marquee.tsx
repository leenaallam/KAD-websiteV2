"use client";

import { useEffect, useRef } from "react";

type Props = {
  items: string[];
  /** Pixels per second */
  speed?: number;
  className?: string;
};

/**
 * Cinematic ticker — duplicates its children so the loop is seamless.
 * Pure transform-based, no layout work per frame.
 */
export function Marquee({ items, speed = 40, className = "" }: Props) {
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let raf = 0;
    let last = performance.now();
    let x = 0;

    const tick = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      x -= speed * dt;
      const half = track.scrollWidth / 2;
      if (-x >= half) x += half;
      track.style.transform = `translate3d(${x.toFixed(2)}px, 0, 0)`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [speed]);

  return (
    <div className={`overflow-hidden ${className}`}>
      <div ref={trackRef} className="flex w-max gap-16 will-change-transform">
        {[...items, ...items].map((item, i) => (
          <span
            key={i}
            className="flex shrink-0 items-center gap-16 font-[var(--font-fraunces)] text-[clamp(3rem,8vw,8rem)] leading-none text-[var(--bone)]"
          >
            {item}
            <span
              aria-hidden
              className="inline-block h-2 w-2 rounded-full bg-[var(--gold)]"
            />
          </span>
        ))}
      </div>
    </div>
  );
}
