import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getProject, listProjectSlugs, listProjects } from "@/lib/projects";
import { CdnImage } from "@/components/shared/CdnImage";
import { RevealOnScroll } from "@/components/shared/RevealOnScroll";

export async function generateStaticParams() {
  const slugs = await listProjectSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata(
  props: PageProps<"/projects/[slug]">
): Promise<Metadata> {
  const { slug } = await props.params;
  const project = await getProject(slug);
  if (!project) return { title: "Project not found" };
  return {
    title: project.title,
    description: project.blurb,
  };
}

export default async function ProjectDetailPage(
  props: PageProps<"/projects/[slug]">
) {
  const { slug } = await props.params;
  const project = await getProject(slug);
  if (!project) notFound();

  const all = await listProjects();
  const idx = all.findIndex((p) => p.slug === slug);
  const next = all[(idx + 1) % all.length];
  const prev = all[(idx - 1 + all.length) % all.length];

  const hero = project.images[0];
  const rest = project.images.slice(1);

  return (
    <article className="relative isolate">
      {/* Hero */}
      <section className="relative h-[100dvh] overflow-hidden">
        {hero && (
          <CdnImage
            asset={hero}
            alt={`${project.title} — hero`}
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
        )}
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/10 to-black"
        />
        <div className="absolute inset-x-0 bottom-0 mx-auto max-w-[1600px] px-6 pb-16 lg:px-12 lg:pb-24">
          <RevealOnScroll variant="fade-up">
            <p className="eyebrow">{project.discipline}</p>
          </RevealOnScroll>
          <RevealOnScroll variant="mask" delay={0.1}>
            <h1 className="mt-5 font-[var(--font-fraunces)] text-[clamp(3rem,9vw,9rem)] leading-[0.95] tracking-[-0.02em]">
              {project.title}
            </h1>
          </RevealOnScroll>
          <RevealOnScroll variant="fade-up" delay={0.25}>
            <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-3 text-xs uppercase tracking-[0.28em] text-[var(--mist)]">
              <span>{project.location}</span>
              <span aria-hidden className="hidden h-px w-12 bg-[var(--whisper)] md:inline-block" />
              <span>{project.year}</span>
            </div>
          </RevealOnScroll>
        </div>
      </section>

      {/* Atmosphere blurb */}
      <section className="mx-auto max-w-[1600px] px-6 py-32 lg:px-12 lg:py-44">
        <div className="mx-auto max-w-3xl">
          <RevealOnScroll variant="fade-up">
            <p className="eyebrow">Atmosphere</p>
          </RevealOnScroll>
          <RevealOnScroll variant="fade-up" delay={0.15}>
            <p className="mt-8 text-[clamp(1.5rem,3vw,2.4rem)] leading-[1.25] text-balance text-[var(--bone)]">
              {project.blurb}
            </p>
          </RevealOnScroll>
        </div>
      </section>

      {/* Image stream — alternating offsets for editorial rhythm */}
      <section className="mx-auto max-w-[1600px] space-y-24 px-6 pb-32 lg:px-12 lg:space-y-36 lg:pb-44">
        {rest.map((asset, i) => {
          const isFull = i % 3 === 0;
          const align = i % 2 === 0 ? "lg:ml-0 lg:mr-auto" : "lg:ml-auto lg:mr-0";
          const width = isFull ? "max-w-[1400px] mx-auto" : `max-w-[820px] ${align}`;
          return (
            <RevealOnScroll key={asset.id} variant="fade-up" amount={0.2}>
              <figure className={width}>
                <div className="relative overflow-hidden rounded-md bg-[var(--coal)]">
                  <CdnImage
                    asset={asset}
                    alt={`${project.title} — view ${i + 1}`}
                    sizes="(min-width: 1280px) 1280px, 100vw"
                    className="h-auto w-full object-cover"
                  />
                </div>
              </figure>
            </RevealOnScroll>
          );
        })}
      </section>

      {/* Navigation */}
      <section className="border-t border-[rgba(234,227,210,0.08)] bg-[var(--obsidian)]/60 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1600px] flex-col gap-8 px-6 py-16 lg:flex-row lg:items-center lg:justify-between lg:px-12">
          <Link
            href={`/projects/${prev.slug}`}
            data-cursor="link"
            className="group"
          >
            <span className="eyebrow">Previous</span>
            <span className="mt-3 block font-[var(--font-fraunces)] text-3xl text-[var(--bone)] transition-colors group-hover:text-[var(--gold-soft)]">
              ← {prev.title}
            </span>
          </Link>
          <Link
            href="/projects"
            data-cursor="link"
            className="text-xs uppercase tracking-[0.32em] text-[var(--mist)] hover:text-[var(--gold-soft)]"
          >
            All projects
          </Link>
          <Link
            href={`/projects/${next.slug}`}
            data-cursor="link"
            className="group text-right"
          >
            <span className="eyebrow">Next</span>
            <span className="mt-3 block font-[var(--font-fraunces)] text-3xl text-[var(--bone)] transition-colors group-hover:text-[var(--gold-soft)]">
              {next.title} →
            </span>
          </Link>
        </div>
      </section>
    </article>
  );
}
