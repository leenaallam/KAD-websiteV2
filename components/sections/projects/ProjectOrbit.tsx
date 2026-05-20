"use client";

import { motion, useMotionValue, useScroll, useSpring, useTransform } from "framer-motion";
import Link from "next/link";
import { useRef } from "react";
import { CdnImage } from "@/components/shared/CdnImage";
import type { ProjectManifest } from "@/types/assets";
import { ease } from "@/lib/animations/easings";

type Props = {
  project: ProjectManifest;
  index: number;
};

/**
 * A single project, rendered as a floating editorial destination rather
 * than a card. Three interaction layers stack to sell the "moment in
 * space" feeling:
 *
 *   1) Scroll parallax — the image translates faster than the page so
 *      it appears to drift past the camera
 *   2) Cursor tilt — pointer position drives subtle X/Y rotation on
 *      the image plate (spring-smoothed, ~6° max)
 *   3) Index-based asymmetric layout — odd projects sit right, even
 *      sit left, so the eye snakes down the page instead of marching
 *
 * The "Enter" link uses the same magnetic gesture as the global
 * Button (via a hover-scale cue rather than the actual hook to keep
 * this component self-contained).
 *
 * Every text element reveals once via Framer Motion's whileInView,
 * so coming back up-scroll doesn't re-fire and feel twitchy.
 */
export function ProjectOrbit({ project, index }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  // Scroll parallax — image drifts +/- 14% across the section's window
  const { scrollYProgress } = useScroll({
    target: wrapRef,
    offset: ["start end", "end start"],
  });
  const parallaxY = useTransform(scrollYProgress, [0, 1], ["12%", "-12%"]);

  // Cursor tilt — pointer position relative to the image element
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const rotateX = useSpring(useTransform(py, [-1, 1], [4, -4]), {
    stiffness: 140,
    damping: 22,
  });
  const rotateY = useSpring(useTransform(px, [-1, 1], [-6, 6]), {
    stiffness: 140,
    damping: 22,
  });

  const handleMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = imageRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    px.set(((e.clientX - r.left) / r.width) * 2 - 1);
    py.set(((e.clientY - r.top) / r.height) * 2 - 1);
  };
  const handleLeave = () => {
    px.set(0);
    py.set(0);
  };

  const flip = index % 2 === 1;
  const hero = project.images[0];
  if (!hero) return null;

  // Mini orbit-style index ring at the top of the text column. The angle
  // is decorative — based on index — so each project has a unique mark.
  const orbitAngle = (index * 37) % 360;

  return (
    <article
      ref={wrapRef}
      // Mobile: 68dvh keeps each project a "moment" without forcing the
      // visitor through 990dvh of total scroll on a phone. Desktop holds
      // the full 90dvh so each becomes a true cinematic destination.
      className="relative isolate flex min-h-[68dvh] items-center px-6 py-12 lg:min-h-[90dvh] lg:px-12 lg:py-32"
    >
      <div className="mx-auto grid w-full max-w-[1600px] grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-16">
        {/* Image plate — claims roughly two-thirds of the row */}
        <motion.div
          ref={imageRef}
          onPointerMove={handleMove}
          onPointerLeave={handleLeave}
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-15% 0%" }}
          transition={{ duration: 1.4, ease: ease.luxe }}
          style={{ rotateX, rotateY, transformPerspective: 1400 }}
          className={`relative isolate aspect-[4/5] w-full overflow-hidden rounded-md bg-[var(--coal)] will-change-transform lg:col-span-7 lg:aspect-[16/11] ${
            flip ? "lg:col-start-6" : ""
          }`}
        >
          <motion.div style={{ y: parallaxY }} className="absolute inset-[-12%]">
            <CdnImage
              asset={hero}
              alt={`${project.title} — ${project.discipline}`}
              fill
              className="object-cover"
              sizes="(min-width: 1024px) 60vw, 100vw"
            />
          </motion.div>

          {/* Bottom legibility ramp */}
          <div
            aria-hidden
            className="absolute inset-x-0 bottom-0 h-1/3"
            style={{
              background:
                "linear-gradient(180deg, transparent 0%, rgba(5,5,5,0.55) 100%)",
            }}
          />

          {/* Hairline frame — sits inside the rounded corners */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-3 rounded-sm border border-[rgba(234,227,210,0.06)]"
          />

          {/* Orbit mark — top-right HUD */}
          <div className="absolute right-5 top-5 flex items-center gap-3 text-[10px] uppercase tracking-[0.32em] text-[var(--gold-soft)]">
            <span className="font-[var(--font-fraunces)]">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span
              aria-hidden
              className="relative inline-block h-7 w-7 rounded-full border border-[rgba(201,163,59,0.45)]"
            >
              <span
                aria-hidden
                className="absolute h-1 w-1 rounded-full bg-[var(--gold-soft)]"
                style={{
                  top: "50%",
                  left: "50%",
                  transform: `rotate(${orbitAngle}deg) translate(10px) translate(-50%, -50%)`,
                  boxShadow: "0 0 6px rgba(201,163,59,0.8)",
                }}
              />
            </span>
          </div>
        </motion.div>

        {/* Text column */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-15% 0%" }}
          transition={{ duration: 1.1, ease: ease.luxe, delay: 0.1 }}
          className={`flex flex-col justify-center lg:col-span-4 ${
            flip ? "lg:col-start-2 lg:row-start-1" : "lg:col-start-9"
          }`}
        >
          <p className="text-[10px] uppercase tracking-[0.32em] text-[var(--gold-soft)] gold-glow-text">
            {project.discipline}
          </p>
          <h2 className="mt-5 font-[var(--font-fraunces)] text-[clamp(2rem,4.5vw,3.8rem)] leading-[1.02] tracking-[-0.01em] text-[var(--bone)]">
            {project.title}
          </h2>
          <p className="mt-6 max-w-md text-base leading-relaxed text-[var(--mist)]">
            {project.blurb}
          </p>

          <div className="mt-8 flex items-center gap-4 text-xs uppercase tracking-[0.28em] text-[var(--whisper)]">
            <span>{project.location}</span>
            <span aria-hidden className="inline-block h-px w-8 bg-[var(--whisper)]" />
            <span>{project.year}</span>
          </div>

          <Link
            href={`/projects/${project.slug}`}
            data-cursor="link"
            className="group/cta mt-12 inline-flex w-max items-center gap-4 text-xs uppercase tracking-[0.28em] text-[var(--bone)] transition-colors hover:text-[var(--gold-soft)]"
          >
            <span className="relative">
              Enter project
              <span
                aria-hidden
                className="absolute -bottom-1 left-0 h-px w-full origin-left scale-x-0 bg-[var(--gold-soft)] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/cta:scale-x-100"
              />
            </span>
            <svg
              width="40"
              height="10"
              viewBox="0 0 40 10"
              fill="none"
              aria-hidden
              className="transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/cta:translate-x-2"
            >
              <path
                d="M0 5h38M34 1l4 4-4 4"
                stroke="currentColor"
                strokeWidth="0.8"
              />
            </svg>
          </Link>
        </motion.div>
      </div>
    </article>
  );
}
