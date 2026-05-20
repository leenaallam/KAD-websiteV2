/**
 * KAD asset pipeline.
 *
 * Walks `_source/projects gallery/` and emits optimized WebP variants +
 * tiny base64 LQIP thumbnails into `public/cdn/projects/<slug>/`. Writes a
 * combined manifest to `content/manifest.json` for the runtime to consume
 * via `lib/cdn.ts`.
 *
 * Usage:
 *   npm run process:assets         # curated subset (3 images per project)
 *   npm run process:assets:full    # all source images
 */

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import type {
  AssetEntry,
  AssetManifest,
  AssetVariant,
  ProjectManifest,
} from "../types/assets";

// --------------------------------------------------------------------------- config

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");
const SOURCE_DIR = path.join(ROOT, "_source", "projects gallery");
const OUT_DIR = path.join(ROOT, "public", "cdn", "projects");
const MANIFEST_PATH = path.join(ROOT, "content", "manifest.json");
const PROJECTS_META_DIR = path.join(ROOT, "content", "projects");

const FULL = process.argv.includes("--full");
const CURATED_PER_PROJECT = 3;
const WIDTHS = [480, 1280, 1920] as const;
const QUALITY = 78;

const IMG_EXT = new Set([".jpg", ".jpeg", ".png", ".webp"]);

// Project metadata — atelier voice. Each entry maps source folder name to
// the slug + display info shown in the masonry / detail pages.
const PROJECT_META: Record<
  string,
  Pick<ProjectManifest, "slug" | "title" | "discipline" | "location" | "year" | "order" | "blurb">
> = {
  "Galleria Moon": {
    slug: "galleria-moon",
    title: "Galleria Moon",
    discipline: "Residential · Apartment",
    location: "Cairo, Egypt",
    year: "2024",
    order: 1,
    blurb:
      "A pied-à-terre composed in chalk, walnut, and brushed brass — daylight is treated as the principal material.",
  },
  "Madenaty": {
    slug: "madenaty",
    title: "Madenaty",
    discipline: "Residential · Two units",
    location: "Madinaty, Egypt",
    year: "2024",
    order: 2,
    blurb:
      "Two units, one architectural family. Restraint is held throughout while material temperature shifts between the public and private rooms.",
  },
  "Palmhills Village gate": {
    slug: "palmhills-1702",
    title: "Palm Hills · 1702",
    discipline: "Residential · Villa",
    location: "Palm Hills, 6th of October",
    year: "2024",
    order: 3,
    blurb:
      "A modern Mediterranean reading of the standard plan — long thresholds, low partitions, the garden allowed to read into the interior.",
  },
  "Palmhills Golfextension": {
    slug: "palmhills-golf-extension",
    title: "Palm Hills · Golf Extension",
    discipline: "Residential · Villa",
    location: "Palm Hills, 6th of October",
    year: "2024",
    order: 4,
    blurb:
      "An extension that performs the original architecture rather than answer it — the new volumes recede so the garden takes the room.",
  },
  "RehabCity": {
    slug: "rehab-city-01",
    title: "Rehab City · 01",
    discipline: "Residential · Apartment",
    location: "Rehab City, Cairo",
    year: "2023",
    order: 5,
    blurb:
      "A compact reception reorganised around a single material gesture in micro-cement and oak.",
  },
  "Ryiadh Villa": {
    slug: "riyadh-villa",
    title: "Riyadh Villa",
    discipline: "Residential · Villa",
    location: "Riyadh, KSA",
    year: "In progress",
    order: 6,
    blurb:
      "A house held together by stone and a single, slow palette of bone, ash, and gold — light is shaped before it is filtered.",
  },
  "Seashell Northcoast": {
    slug: "seashell-north-coast",
    title: "Seashell · North Coast",
    discipline: "Residential · Coastal home",
    location: "North Coast, Egypt",
    year: "2023",
    order: 7,
    blurb:
      "Salt, plaster, and travertine. The plan is opened to the sea and then quieted with shaded interior rooms.",
  },
  "Sodic": {
    slug: "sodic",
    title: "Sodic",
    discipline: "Residential · Townhouse",
    location: "Sodic West, Egypt",
    year: "2023",
    order: 8,
    blurb:
      "A townhouse drawn against the standard finish — micro-cement, brass, and a single oak stair as the spine.",
  },
  "UptownCairo": {
    slug: "uptown-cairo",
    title: "Uptown Cairo",
    discipline: "Residential · Apartment",
    location: "Uptown Cairo",
    year: "2024",
    order: 9,
    blurb:
      "Hill-top views answered with a low, dark-toned palette — the room recedes so the city stays the subject.",
  },
  "Upvill": {
    slug: "upvill",
    title: "Upvill",
    discipline: "Residential · Villa",
    location: "New Cairo, Egypt",
    year: "2024",
    order: 10,
    blurb:
      "The complete arc — reception, bedrooms, kitchen, bathrooms, balconies — drawn as one continuous architectural gesture.",
  },
  // PalmHills — formerly "Villa Hamdy". Slug kept as `villa-hamdy` so the
  // existing URL `/projects/villa-hamdy` and the FEATURED_SLUGS reference
  // on the home page continue to resolve. Display title and source folder
  // both follow the user's renamed brand.
  "PalmHills": {
    slug: "villa-hamdy",
    title: "PalmHills",
    discipline: "Residential · Villa",
    location: "Cairo, Egypt",
    year: "2023",
    order: 11,
    blurb:
      "A family villa held in two materials and one decision — to let every room face the same garden.",
  },
  // Landscape Studies was retired from the portfolio at the user's request.
  // The source folder still exists for archival reasons; the pipeline now
  // explicitly skips it via the absence of a PROJECT_META entry.
};

// --------------------------------------------------------------------------- utils

async function ensureDir(p: string) {
  await fs.mkdir(p, { recursive: true });
}

async function listImages(dir: string): Promise<string[]> {
  // Recursive walk to capture nested unit subfolders (Madenaty has them).
  const out: string[] = [];
  async function walk(d: string) {
    const entries = await fs.readdir(d, { withFileTypes: true });
    for (const e of entries) {
      const full = path.join(d, e.name);
      if (e.isDirectory()) await walk(full);
      else if (IMG_EXT.has(path.extname(e.name).toLowerCase())) out.push(full);
    }
  }
  await walk(dir);
  return out.sort();
}

async function processImage(
  src: string,
  outDir: string,
  baseId: string
): Promise<AssetEntry> {
  const meta = await sharp(src).metadata();
  const w = meta.width ?? 1920;
  const h = meta.height ?? 1080;

  const variants: AssetVariant[] = [];
  for (const targetWidth of WIDTHS) {
    if (targetWidth > w * 1.05) continue; // skip upscales
    const filename = `${baseId}-${targetWidth}.webp`;
    const outPath = path.join(outDir, filename);
    await sharp(src)
      .resize({ width: targetWidth, withoutEnlargement: true })
      .webp({ quality: QUALITY, effort: 4 })
      .toFile(outPath);

    // Path stored in manifest is relative to /cdn/projects/<slug>/
    const rel = path.relative(path.join(ROOT, "public", "cdn"), outPath);
    variants.push({
      width: targetWidth,
      path: rel.split(path.sep).join("/"),
    });
  }

  // LQIP: 24px wide, blurred, base64-encoded webp
  const lqipBuf = await sharp(src)
    .resize({ width: 24 })
    .blur(1.2)
    .webp({ quality: 30 })
    .toBuffer();
  const lqip = `data:image/webp;base64,${lqipBuf.toString("base64")}`;

  return {
    id: baseId,
    originalWidth: w,
    originalHeight: h,
    originalName: path.basename(src),
    variants,
    lqip,
  };
}

// --------------------------------------------------------------------------- main

async function run() {
  console.log(`KAD asset pipeline — ${FULL ? "FULL" : "CURATED"} mode`);

  let exists = true;
  try {
    await fs.access(SOURCE_DIR);
  } catch {
    exists = false;
  }
  if (!exists) {
    console.error(`✗ Source dir not found: ${SOURCE_DIR}`);
    console.error(
      `  Make sure project assets are in _source/projects gallery/ (gitignored)`
    );
    process.exit(1);
  }

  await ensureDir(OUT_DIR);
  await ensureDir(PROJECTS_META_DIR);

  const folders = (
    await fs.readdir(SOURCE_DIR, { withFileTypes: true })
  ).filter((e) => e.isDirectory());

  const manifest: AssetManifest = {
    generatedAt: new Date().toISOString(),
    projects: {},
  };

  let processed = 0;
  let skipped = 0;

  for (const folder of folders) {
    const meta = PROJECT_META[folder.name];
    if (!meta) {
      console.warn(`⚠ Skipping unknown folder: ${folder.name}`);
      skipped += 1;
      continue;
    }

    const folderPath = path.join(SOURCE_DIR, folder.name);
    const allImages = await listImages(folderPath);
    const images = FULL ? allImages : allImages.slice(0, CURATED_PER_PROJECT);

    if (images.length === 0) {
      console.warn(`⚠ No images in ${folder.name}`);
      continue;
    }

    const projectOutDir = path.join(OUT_DIR, meta.slug);
    await ensureDir(projectOutDir);

    const entries: AssetEntry[] = [];
    let i = 0;
    for (const src of images) {
      const id = i === 0 ? "hero" : `img-${String(i).padStart(3, "0")}`;
      try {
        const entry = await processImage(src, projectOutDir, id);
        entries.push(entry);
        processed += 1;
        console.log(`  ✓ ${meta.slug}/${id} (${entry.originalWidth}x${entry.originalHeight})`);
      } catch (err) {
        console.error(`  ✗ Failed ${src}:`, err);
      }
      i += 1;
    }

    const project: ProjectManifest = {
      ...meta,
      images: entries,
    };
    manifest.projects[meta.slug] = project;

    // Per-project metadata file (used by the detail page route)
    await fs.writeFile(
      path.join(PROJECTS_META_DIR, `${meta.slug}.json`),
      JSON.stringify(project, null, 2),
      "utf8"
    );
  }

  await ensureDir(path.dirname(MANIFEST_PATH));
  await fs.writeFile(
    MANIFEST_PATH,
    JSON.stringify(manifest, null, 2),
    "utf8"
  );

  console.log(`\nDone. ${processed} images processed, ${skipped} folders skipped.`);
  console.log(`Manifest: ${path.relative(ROOT, MANIFEST_PATH)}`);
  console.log(`Output:   ${path.relative(ROOT, OUT_DIR)}/`);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
