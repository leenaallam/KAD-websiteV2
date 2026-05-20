import "server-only";
import fs from "node:fs/promises";
import path from "node:path";
import type {
  AssetEntry,
  AssetManifest,
  ProjectManifest,
} from "@/types/assets";

const CONTENT_DIR = path.join(process.cwd(), "content");

let cached: AssetManifest | null = null;

async function loadManifest(): Promise<AssetManifest> {
  if (cached) return cached;
  try {
    const raw = await fs.readFile(
      path.join(CONTENT_DIR, "manifest.json"),
      "utf8"
    );
    cached = JSON.parse(raw) as AssetManifest;
  } catch {
    cached = { generatedAt: new Date(0).toISOString(), projects: {} };
  }
  return cached;
}

/** All projects ordered by their `order` field (low → high). */
export async function listProjects(): Promise<ProjectManifest[]> {
  const m = await loadManifest();
  return Object.values(m.projects).sort((a, b) => a.order - b.order);
}

export async function getProject(
  slug: string
): Promise<ProjectManifest | null> {
  const m = await loadManifest();
  return m.projects[slug] ?? null;
}

export async function listProjectSlugs(): Promise<string[]> {
  const m = await loadManifest();
  return Object.keys(m.projects);
}

/** Returns the named hero entry (default: "intro") if processed, else null. */
export async function getHero(
  id: string = "intro"
): Promise<AssetEntry | null> {
  const m = await loadManifest();
  return m.hero?.find((h) => h.id === id) ?? null;
}
