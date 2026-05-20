"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { ease } from "@/lib/animations/easings";

type Props = {
  index: number;
  number: string;
  title: string;
  blurb: string;
  details: string[];
};

/**
 * Glassmorphic discipline card with subtle 3D tilt on hover, an animated
 * gold accent line, and a slow per-axis lighting sweep that follows the
 * pointer.
 */
export function ServiceCard({ index, number, title, blurb, details }: Props) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0, lx: 50, ly: 50 });

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = cardRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    setTilt({
      rx: (0.5 - y) * 5,
      ry: (x - 0.5) * 6,
      lx: x * 100,
      ly: y * 100,
    });
  };
  const onLeave = () =>
    setTilt({ rx: 0, ry: 0, lx: 50, ly: 50 });

  return (
    <motion.div
      initial={{ opacity: 0, y: 36 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      transition={{ duration: 1, ease: ease.luxe, delay: index * 0.08 }}
      style={{ perspective: "1200px" }}
      className="group h-full"
    >
      <div
        ref={cardRef}
        onPointerMove={onMove}
        onPointerLeave={onLeave}
        data-cursor="link"
        className="glass relative h-full overflow-hidden rounded-2xl p-8 transition-shadow duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:shadow-[0_60px_120px_-30px_rgba(201,163,59,0.25)] lg:p-12"
        style={{
          transform: `rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
          transition:
            "transform 700ms cubic-bezier(0.22,1,0.36,1), box-shadow 700ms cubic-bezier(0.22,1,0.36,1)",
          transformStyle: "preserve-3d",
        }}
      >
        {/* Pointer-tracked lighting */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-700 group-hover:opacity-100"
          style={{
            background: `radial-gradient(420px circle at ${tilt.lx}% ${tilt.ly}%, rgba(201,163,59,0.18), transparent 60%)`,
          }}
        />

        {/* Hairline number */}
        <div className="flex items-center justify-between">
          <p className="font-[var(--font-fraunces)] text-2xl text-[var(--gold-soft)]">
            {number}
          </p>
          <span className="inline-block h-px w-12 bg-[var(--gold)] transition-all duration-700 group-hover:w-24" />
        </div>

        <h3 className="mt-12 font-[var(--font-fraunces)] text-[clamp(2rem,3.4vw,3rem)] leading-[1.05] text-[var(--bone)]">
          {title}
        </h3>
        <p className="mt-6 max-w-md text-base leading-relaxed text-[var(--mist)]">
          {blurb}
        </p>

        <ul className="mt-10 space-y-3">
          {details.map((d) => (
            <li
              key={d}
              className="flex items-start gap-3 text-sm text-[var(--bone)]"
            >
              <span
                aria-hidden
                className="mt-[10px] inline-block h-px w-3 shrink-0 bg-[var(--gold)]"
              />
              <span>{d}</span>
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
}
