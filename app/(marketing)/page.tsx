import { Hero } from "@/components/cinematic/Hero";
import { Marquee } from "@/components/shared/Marquee";
import { FeaturedProjects } from "@/components/sections/FeaturedProjects";
import { RevealOnScroll } from "@/components/shared/RevealOnScroll";
import { LinkButton } from "@/components/ui/Button";
import { AmbientBackdrop } from "@/components/shared/AmbientBackdrop";
import { getHero, listProjects } from "@/lib/projects";

const DISCIPLINES = [
  { number: "01", label: "Interior" },
  { number: "02", label: "Exterior" },
  { number: "03", label: "Landscape" },
  { number: "04", label: "Contracting" },
];

const MARQUEE_WORDS = [
  "Light",
  "Stone",
  "Brass",
  "Patience",
  "Restraint",
  "Material",
  "Atelier",
];

/**
 * Hand-curated homepage feature reel. Order matters: this is the sequence
 * a visitor scrolls through, so it sets the studio's voice. Edit this list
 * to re-order or swap projects without touching the archive ordering used
 * on /projects.
 */
const FEATURED_SLUGS = [
  "sodic",
  "villa-hamdy",
  "uptown-cairo",
  "palmhills-golf-extension",
] as const;

export default async function HomePage() {
  const [projects, heroAsset] = await Promise.all([
    listProjects(),
    getHero("intro"),
  ]);
  const bySlug = new Map(projects.map((p) => [p.slug, p]));
  const featured = FEATURED_SLUGS.map((slug) => bySlug.get(slug)).filter(
    (p): p is NonNullable<typeof p> => Boolean(p)
  );

  return (
    <>
      {/* Ambient warm/cool drift + dust motes + hairline grid — same
          atmospheric mood applied across the whole marketing surface
          (portal, contact, about, and now home). `clearScene` overrides
          the scene store's default "hero" so the WebGL ParticleField
          stays quiet — the AmbientBackdrop is the only background. */}
      <AmbientBackdrop clearScene />

      <Hero asset={heroAsset} />

      {/* Marquee — kinetic eyebrow strip */}
      <section
        id="stories"
        className="relative isolate overflow-hidden border-y border-[rgba(234,227,210,0.06)] bg-[rgba(11,11,13,0.6)] py-10 backdrop-blur-md"
      >
        <Marquee items={MARQUEE_WORDS} speed={42} />
      </section>

      {/* Approach */}
      <section className="relative isolate py-32 lg:py-44">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              "linear-gradient(180deg, transparent 0%, rgba(11,11,13,0.85) 30%, rgba(22,22,24,0.95) 100%)",
          }}
        />
        <div className="mx-auto grid max-w-[1600px] gap-16 px-6 lg:grid-cols-[5fr_7fr] lg:px-12">
          <RevealOnScroll variant="fade-up">
            <p className="eyebrow">01 — Approach</p>
            <h2 className="mt-6 text-[clamp(2.4rem,5vw,4.4rem)] leading-[1.02] text-balance">
              We design rooms{" "}
              <span className="italic text-[var(--gold-soft)]">
                you remember
              </span>{" "}
              by feel before by name.
            </h2>
          </RevealOnScroll>

          <div className="space-y-10">
            <RevealOnScroll variant="fade-up" delay={0.15}>
              <p className="text-lg leading-relaxed text-[var(--mist)]">
                A studio practice grounded in architectural restraint,
                Mediterranean warmth, and a quiet preoccupation with material.
                Every commission is a long conversation with a single space —
                lit, fitted, and detailed in the same hand.
              </p>
            </RevealOnScroll>
            <RevealOnScroll variant="fade-up" delay={0.3}>
              <div className="grid grid-cols-2 gap-8 border-t border-[rgba(234,227,210,0.1)] pt-10 md:grid-cols-4">
                {[
                  { k: "2019", v: "Since" },
                  { k: "4", v: "Disciplines" },
                  { k: "Worldwide", v: "Reach" },
                  { k: "1:1", v: "Founder access" },
                ].map((item) => (
                  <div key={item.v}>
                    <p className="font-[var(--font-fraunces)] text-3xl text-[var(--gold-soft)]">
                      {item.k}
                    </p>
                    <p className="mt-2 text-xs uppercase tracking-[0.24em] text-[var(--mist)]">
                      {item.v}
                    </p>
                  </div>
                ))}
              </div>
            </RevealOnScroll>
          </div>
        </div>
      </section>

      {/* Featured Projects */}
      <FeaturedProjects projects={featured} />

      {/* Discipline preview */}
      <section className="relative isolate py-32 lg:py-44">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              "linear-gradient(180deg, rgba(11,11,13,0.92) 0%, rgba(5,5,5,0.98) 100%)",
          }}
        />
        <div className="mx-auto max-w-[1600px] px-6 lg:px-12">
          <RevealOnScroll variant="fade-up">
            <div className="flex items-end justify-between">
              <div>
                <p className="eyebrow">03 — Disciplines</p>
                <h2 className="mt-6 max-w-3xl font-[var(--font-fraunces)] text-[clamp(2rem,5vw,4.4rem)] leading-[1.05]">
                  Four practices,{" "}
                  <span className="italic text-[var(--gold-soft)]">
                    one studio
                  </span>
                  .
                </h2>
              </div>
              <LinkButton href="/services" size="md" variant="ghost">
                All disciplines
              </LinkButton>
            </div>
          </RevealOnScroll>

          <div className="mt-16 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-[rgba(234,227,210,0.08)] bg-[rgba(234,227,210,0.06)] lg:mt-24 lg:grid-cols-4">
            {DISCIPLINES.map((d, i) => (
              <RevealOnScroll
                key={d.number}
                variant="fade-up"
                delay={i * 0.06}
                className="bg-[var(--obsidian)]"
              >
                <div className="group flex h-full flex-col justify-between p-8 transition-colors duration-700 hover:bg-[rgba(201,163,59,0.04)] lg:p-12">
                  <p className="font-[var(--font-fraunces)] text-3xl text-[var(--gold-soft)]">
                    {d.number}
                  </p>
                  <p className="mt-16 font-[var(--font-fraunces)] text-2xl text-[var(--bone)] lg:text-3xl">
                    {d.label}
                  </p>
                  <span className="mt-6 inline-block h-px w-10 bg-[var(--gold)] transition-all duration-700 group-hover:w-24" />
                </div>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="relative isolate py-32 lg:py-44">
        <div className="mx-auto max-w-[1600px] px-6 lg:px-12">
          <RevealOnScroll variant="fade-up">
            <div className="glass overflow-hidden rounded-2xl p-12 text-center lg:p-24">
              <p className="eyebrow">Begin</p>
              <h2 className="mx-auto mt-6 max-w-3xl font-[var(--font-fraunces)] text-[clamp(2rem,5vw,4.4rem)] leading-[1.05]">
                Tell us about a room you'd like to live{" "}
                <span className="italic text-[var(--gold-soft)]">
                  differently
                </span>{" "}
                in.
              </h2>
              <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <LinkButton href="/portal" size="lg">
                  Begin Your Project
                </LinkButton>
                <LinkButton
                  href="https://wa.me/201112448272"
                  size="lg"
                  variant="ghost"
                >
                  Message on WhatsApp
                </LinkButton>
              </div>
            </div>
          </RevealOnScroll>
        </div>
      </section>
    </>
  );
}
