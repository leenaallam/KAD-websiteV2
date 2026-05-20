"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { CdnImage } from "@/components/shared/CdnImage";
import type { ProjectManifest } from "@/types/assets";
import { ease } from "@/lib/animations/easings";

/**
 * Three project images arranged asymmetrically across two columns, each
 * with its own scroll-driven parallax velocity. A short caption sits next
 * to each, written as a quiet observation rather than a project label —
 * the section reads as photography essay, not portfolio strip.
 *
 * Falls back gracefully if fewer than 3 projects are provided.
 */
export function AboutVisualEssay({ projects }: { projects: ProjectManifest[] }) {
  if (projects.length === 0) return null;

  return (
    <section className="relative isolate overflow-hidden py-32 lg:py-48">
      <div className="mx-auto max-w-[1600px] px-6 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-20% 0%" }}
          transition={{ duration: 1.1, ease: ease.luxe }}
        >
          <p className="eyebrow gold-glow-text">Notes from the studio</p>
          <h2 className="mt-8 max-w-4xl font-[var(--font-fraunces)] text-[clamp(2.4rem,6vw,5rem)] leading-[1.0] tracking-[-0.02em]">
            A discipline written{" "}
            <span className="italic text-[var(--gold-soft)] gold-glow-text">
              one room at a time
            </span>
            .
          </h2>
        </motion.div>

        <div className="mt-24 grid grid-cols-12 gap-8 lg:mt-36 lg:gap-12">
          {/* Left column — tall image with caption beneath */}
          {projects[0] && (
            <EssayPlate
              project={projects[0]}
              caption="The room as a single act of authorship — light measured before furniture, before colour."
              className="col-span-12 md:col-span-7 md:row-span-2"
              aspect="aspect-[5/7]"
              parallax={-0.05}
              delay={0}
            />
          )}

          {/* Right column — two stacked shorter plates */}
          {projects[1] && (
            <EssayPlate
              project={projects[1]}
              caption="Patience as a finish. The studio works at the pace of architecture, not deadlines."
              className="col-span-12 md:col-span-5"
              aspect="aspect-[4/3]"
              parallax={0.08}
              delay={0.1}
            />
          )}
          {projects[2] && (
            <EssayPlate
              project={projects[2]}
              caption="Material restraint over decoration — every surface allowed to behave honestly."
              className="col-span-12 md:col-span-5"
              aspect="aspect-[4/3]"
              parallax={-0.06}
              delay={0.2}
            />
          )}
        </div>
      </div>
    </section>
  );
}

function EssayPlate({
  project,
  caption,
  className,
  aspect,
  parallax,
  delay,
}: {
  project: ProjectManifest;
  caption: string;
  className?: string;
  aspect: string;
  /** Strength of the scroll-driven y parallax for this plate (signed). */
  parallax: number;
  delay: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [
    `${parallax * 100}%`,
    `${-parallax * 100}%`,
  ]);

  const hero = project.images[0];
  if (!hero) return null;

  return (
    <motion.figure
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-15% 0%" }}
      transition={{ duration: 1.1, ease: ease.luxe, delay }}
      className={className}
    >
      <div
        className={`relative isolate overflow-hidden rounded-md bg-[var(--coal)] ${aspect}`}
      >
        <motion.div style={{ y }} className="absolute inset-[-10%]">
          <CdnImage
            asset={hero}
            alt={`${project.title} — studio note`}
            fill
            className="object-cover"
            sizes="(min-width: 1024px) 55vw, 100vw"
          />
        </motion.div>
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"
        />
        {/* Subtle hairline frame */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-3 border border-[rgba(234,227,210,0.06)]"
        />
      </div>
      <figcaption className="mt-6 max-w-md text-base leading-relaxed text-[var(--mist)]">
        <span aria-hidden className="mr-3 inline-block h-px w-6 align-middle bg-[var(--gold-soft)]" />
        {caption}
      </figcaption>
    </motion.figure>
  );
}
