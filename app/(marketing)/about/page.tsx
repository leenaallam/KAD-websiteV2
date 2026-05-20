import type { Metadata } from "next";
import { AboutHero } from "@/components/sections/about/AboutHero";
import { AboutManifesto } from "@/components/sections/about/AboutManifesto";
import { AboutValues } from "@/components/sections/about/AboutValues";
import { AboutVisualEssay } from "@/components/sections/about/AboutVisualEssay";
import { AboutStatement } from "@/components/sections/about/AboutStatement";
import { AboutClose } from "@/components/sections/about/AboutClose";
import { AmbientBackdrop } from "@/components/shared/AmbientBackdrop";
import { getHero, listProjects } from "@/lib/projects";

export const metadata: Metadata = {
  title: "About",
  description:
    "KAD is an atelier of interiors — a quiet practice of patience, restraint, and the long architectural hand. Composed in Cairo, working across MENA.",
};

/**
 * The About page is composed as six "chapters" of cinematic scroll:
 *
 *   01 — Hero (Composed in silence)
 *   02 — Manifesto (pinned scroll, swapping headline word)
 *   03 — Principles (4 editorial value cards)
 *   04 — Studio notes (3-plate photography essay)
 *   05 — Studio voice (founder pull-quote)
 *   06 — Begin (cinematic close)
 *
 * All six sections sit over the global R3F Canvas, which the Hero
 * activates by pushing `"about"` into the scene store on mount. The
 * AboutScene renders floating blueprint sheets and a dust field
 * behind every chapter.
 *
 * Three projects from the manifest provide the photographic plates
 * for the visual essay. Selecting projects by `order` keeps the
 * essay stable as the manifest grows.
 */
export default async function AboutPage() {
  const [all, heroAsset] = await Promise.all([
    listProjects(),
    // Loads `_source/hero/about.{jpg,png,…}` once it's been run through
    // `npm run process:hero`. Returns null if the asset isn't in the
    // manifest yet — AboutHero handles that gracefully by falling back
    // to the bare R3F atmosphere.
    getHero("about"),
  ]);
  const essayProjects = all.slice(0, 3);

  return (
    <div className="relative isolate">
      {/* Ambient warm/cool drift + dust motes + hairline grid — same
          atmospheric mood as the portal and the contact page. `clearScene`
          silences any R3F scene a previous route left active so this
          backdrop reads uninterrupted across every chapter. */}
      <AmbientBackdrop clearScene />

      <AboutHero asset={heroAsset} />
      <AboutManifesto />
      <AboutValues />
      <AboutVisualEssay projects={essayProjects} />
      <AboutStatement />
      <AboutClose />
    </div>
  );
}
