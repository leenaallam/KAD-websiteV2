"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { ease } from "@/lib/animations/easings";

const VALUES = [
  {
    number: "01",
    title: "Restraint",
    body: "Every surface earns its place. We design what is needed and remove what is decorative.",
  },
  {
    number: "02",
    title: "Material truth",
    body: "Stone reads as stone. Wood as wood. Every finish behaves honestly under light.",
  },
  {
    number: "03",
    title: "Long hand",
    body: "From the first sketch to the final styling, the same studio is in the room.",
  },
  {
    number: "04",
    title: "Quiet luxury",
    body: "Not the loudest room — the most considered one. Comfort is the first ornament.",
  },
] as const;

/**
 * Four core principles. Each renders as a large editorial card with a
 * mask-clip reveal on entry and a small parallax on scroll. The whole
 * section uses a single useScroll progress so the cards drift in
 * unison while their reveals fire individually via useInView.
 */
export function AboutValues() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  // Whole grid drifts upward 4% across the scroll window — too subtle to
  // notice consciously, present enough to feel "alive."
  const drift = useTransform(scrollYProgress, [0, 1], ["3%", "-3%"]);

  return (
    <section
      ref={sectionRef}
      className="relative isolate py-32 lg:py-48"
    >
      <div className="mx-auto max-w-[1600px] px-6 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-20% 0%" }}
          transition={{ duration: 1.1, ease: ease.luxe }}
        >
          <p className="eyebrow gold-glow-text">Principles</p>
          <h2 className="mt-8 max-w-4xl font-[var(--font-fraunces)] text-[clamp(2.4rem,6vw,5.2rem)] leading-[1.0] tracking-[-0.02em]">
            Four habits the{" "}
            <span className="italic text-[var(--gold-soft)] gold-glow-text">
              studio keeps
            </span>
            .
          </h2>
        </motion.div>

        <motion.div
          style={{ y: drift }}
          className="mt-20 grid gap-px overflow-hidden rounded-2xl border border-[rgba(234,227,210,0.08)] bg-[rgba(234,227,210,0.06)] md:grid-cols-2 lg:mt-32"
        >
          {VALUES.map((v, i) => (
            <ValueCard key={v.number} value={v} index={i} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function ValueCard({
  value,
  index,
}: {
  value: (typeof VALUES)[number];
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 36 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-12% 0%" }}
      transition={{
        duration: 1.1,
        ease: ease.luxe,
        delay: index * 0.08,
      }}
      className="group relative isolate overflow-hidden bg-[var(--obsidian)] p-10 transition-colors duration-700 hover:bg-[rgba(201,163,59,0.04)] lg:p-16"
    >
      {/* Watermark numeral — quiet by default, brightens on hover */}
      <p className="font-[var(--font-fraunces)] text-7xl text-[var(--gold-soft)] opacity-25 transition-opacity duration-700 group-hover:opacity-70 lg:text-9xl">
        {value.number}
      </p>

      {/* Hairline that walks out on hover */}
      <span
        aria-hidden
        className="mt-10 block h-px w-12 bg-[var(--gold)] transition-all duration-700 group-hover:w-32"
      />

      <h3 className="mt-10 font-[var(--font-fraunces)] text-3xl leading-[1.1] text-[var(--bone)] lg:text-5xl">
        {value.title}
      </h3>
      <p className="mt-6 max-w-md text-base leading-relaxed text-[var(--mist)] lg:text-lg">
        {value.body}
      </p>
    </motion.div>
  );
}
