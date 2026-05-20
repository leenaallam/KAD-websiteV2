"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { CdnImage } from "@/components/shared/CdnImage";
import type { ProjectManifest } from "@/types/assets";
import { ease } from "@/lib/animations/easings";

/**
 * Editorial pinned-feel section: each project is a full-bleed image with
 * scroll-driven parallax and a slow text reveal aligned to its center.
 * Lightweight — no GSAP pin, just Framer's `useScroll` per row.
 */
export function FeaturedProjects({
  projects,
}: {
  projects: ProjectManifest[];
}) {
  return (
    <section className="relative isolate py-24 lg:py-40">
      <div className="mx-auto mb-20 max-w-[1600px] px-6 lg:mb-32 lg:px-12">
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: ease.luxe }}
          className="eyebrow"
        >
          02 — Selected works
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, ease: ease.luxe, delay: 0.05 }}
          className="mt-6 max-w-4xl font-[var(--font-fraunces)] text-[clamp(2.4rem,6vw,5rem)] leading-[1.02]"
        >
          Each room a long,{" "}
          <span className="italic text-[var(--gold-soft)]">deliberate</span>{" "}
          conversation.
        </motion.h2>
      </div>

      <div className="space-y-32 lg:space-y-44">
        {projects.map((p, i) => (
          <FeaturedRow key={p.slug} project={p} index={i} />
        ))}
      </div>

      <div className="mx-auto mt-32 max-w-[1600px] px-6 text-right lg:mt-44 lg:px-12">
        <Link
          href="/projects"
          data-cursor="link"
          className="inline-flex items-center gap-3 text-xs uppercase tracking-[0.32em] text-[var(--mist)] transition-colors hover:text-[var(--gold-soft)]"
        >
          View the full archive
          <svg width="40" height="10" viewBox="0 0 40 10" fill="none" aria-hidden>
            <path
              d="M0 5h38M34 1l4 4-4 4"
              stroke="currentColor"
              strokeWidth="0.8"
            />
          </svg>
        </Link>
      </div>
    </section>
  );
}

function FeaturedRow({
  project,
  index,
}: {
  project: ProjectManifest;
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);
  const flip = index % 2 === 1;
  const hero = project.images[0];
  if (!hero) return null;

  return (
    <div
      ref={ref}
      className="relative mx-auto grid max-w-[1600px] gap-10 px-6 lg:grid-cols-12 lg:gap-12 lg:px-12"
    >
      <div
        className={`relative overflow-hidden rounded-md bg-[var(--coal)] aspect-[4/5] lg:col-span-7 lg:aspect-[16/11] ${
          flip ? "lg:col-start-6" : ""
        }`}
      >
        <motion.div style={{ y }} className="absolute inset-[-8%]">
          <CdnImage
            asset={hero}
            alt={`${project.title} hero`}
            fill
            className="object-cover"
            sizes="(min-width: 1024px) 60vw, 100vw"
          />
        </motion.div>
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"
        />
      </div>

      <div
        className={`flex flex-col justify-end lg:col-span-4 ${
          flip ? "lg:col-start-1 lg:row-start-1" : "lg:col-start-9"
        }`}
      >
        <p
          className="font-[var(--font-fraunces)] text-6xl text-[var(--gold-soft)] gold-glow-text"
          // Negative animation-delay drops each numeral into a different
          // point of the 3.6s glow cycle so the four tiles breathe out of
          // phase — a slow rolling shimmer down the page instead of a
          // synchronized strobe.
          style={{ animationDelay: `${-0.9 * index}s` }}
        >
          {String(index + 1).padStart(2, "0")}
        </p>
        <p className="mt-6 text-[10px] uppercase tracking-[0.32em] text-[var(--mist)]">
          {project.discipline}
        </p>
        <h3 className="mt-3 font-[var(--font-fraunces)] text-[clamp(2rem,4vw,3.4rem)] leading-[1] text-[var(--bone)]">
          {project.title}
        </h3>
        <p className="mt-6 max-w-md text-base leading-relaxed text-[var(--mist)]">
          {project.blurb}
        </p>
        <div className="mt-8 flex items-center gap-4 text-xs text-[var(--whisper)]">
          <span>{project.location}</span>
          <span aria-hidden className="inline-block h-px w-8 bg-[var(--whisper)]" />
          <span>{project.year}</span>
        </div>
        <Link
          href={`/projects/${project.slug}`}
          data-cursor="link"
          className="mt-10 inline-flex w-max items-center gap-3 text-xs uppercase tracking-[0.32em] text-[var(--bone)] transition-colors hover:text-[var(--gold-soft)]"
        >
          Open project
          <svg width="34" height="10" viewBox="0 0 34 10" fill="none" aria-hidden>
            <path d="M0 5h32M28 1l4 4-4 4" stroke="currentColor" strokeWidth="0.8" />
          </svg>
        </Link>
      </div>
    </div>
  );
}
