import type { Metadata } from "next";
import { Fragment } from "react";
import { listProjects } from "@/lib/projects";
import { ProjectsHero } from "@/components/sections/projects/ProjectsHero";
import { ProjectOrbit } from "@/components/sections/projects/ProjectOrbit";
import { OrbitDivider } from "@/components/sections/projects/OrbitDivider";
import { ProjectsClose } from "@/components/sections/projects/ProjectsClose";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "Eleven realised projects across MENA — composed in light, measured in silence, finished in detail. Fly through the KAD galaxy.",
};

/**
 * The portfolio reimagined as a cinematic constellation.
 *
 *   01 — Opening (galaxy reveal, "A galaxy of rooms.")
 *   02..N — One floating editorial moment per project, alternating
 *           left/right, each ~90dvh tall, with a quiet orbit divider
 *           between them
 *   Last  — Closing invitation (twelfth-room CTA)
 *
 * The R3F `ProjectsScene` sits behind everything: three layers of gold
 * particles, a soft nebula, occasional shimmering streaks, and a camera
 * whose Z is bound to the Lenis-smoothed scroll value — so scrolling the
 * portfolio literally "flies the camera" forward through the field.
 *
 * The divider labels (a, b, c…) are decorative atelier annotations,
 * pulled from the project's geographic location to anchor the journey
 * in real places.
 */
export default async function ProjectsPage() {
  const projects = await listProjects();

  return (
    <div className="relative isolate">
      <ProjectsHero count={projects.length} />

      {projects.map((p, i) => (
        <Fragment key={p.slug}>
          <ProjectOrbit project={p} index={i} />
          {i < projects.length - 1 && (
            <OrbitDivider
              label={`Coordinate · ${String(i + 1).padStart(2, "0")} → ${String(
                i + 2
              ).padStart(2, "0")}`}
            />
          )}
        </Fragment>
      ))}

      <ProjectsClose />
    </div>
  );
}
