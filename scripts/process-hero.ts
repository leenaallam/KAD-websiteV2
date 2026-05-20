/**
 * KAD hero asset pipeline.
 *
 * Processes every file in `_source/hero/` into WebP + AVIF variants at
 * widths suited to a full-bleed cinematic background. Generates a 24-px
 * blurred LQIP and merges entries into `content/manifest.json` under
 * `hero`. Run after dropping a new file:
 *
 *   npm run process:hero
 */

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import type { AssetEntry, AssetManifest, AssetVariant } from "../types/assets";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");
const SOURCE_DIR = path.join(ROOT, "_source", "hero");
const OUT_DIR = path.join(ROOT, "public", "cdn", "hero");
const MANIFEST_PATH = path.join(ROOT, "content", "manifest.json");

// Wider distribution than projects — hero is the LCP image on every page.
const WIDTHS = [768, 1280, 1920, 2560] as const;
const WEBP_QUALITY = 82;
const AVIF_QUALITY = 60;
const IMG_EXT = new Set([".jpg", ".jpeg", ".png", ".webp"]);

async function ensureDir(p: string) {
  await fs.mkdir(p, { recursive: true });
}

async function processOne(src: string): Promise<AssetEntry> {
  const base = path.basename(src, path.extname(src)).toLowerCase();
  const meta = await sharp(src).metadata();
  const w = meta.width ?? 1920;
  const h = meta.height ?? 1080;

  // Build the variant width set: requested widths smaller than source, plus
  // the source width as the canonical "largest". For a hero we never want to
  // be missing a max-resolution copy.
  const wantedWidths = new Set<number>();
  for (const wW of WIDTHS) {
    if (wW <= w) wantedWidths.add(wW);
  }
  wantedWidths.add(w);

  const variants: AssetVariant[] = [];
  for (const targetWidth of [...wantedWidths].sort((a, b) => a - b)) {
    const webpName = `${base}-${targetWidth}.webp`;
    const webpPath = path.join(OUT_DIR, webpName);
    await sharp(src)
      .resize({ width: targetWidth, withoutEnlargement: true })
      .webp({ quality: WEBP_QUALITY, effort: 5 })
      .toFile(webpPath);
    variants.push({
      width: targetWidth,
      path: path
        .relative(path.join(ROOT, "public", "cdn"), webpPath)
        .split(path.sep)
        .join("/"),
    });
    if (targetWidth >= 1280) {
      const avifName = `${base}-${targetWidth}.avif`;
      const avifPath = path.join(OUT_DIR, avifName);
      await sharp(src)
        .resize({ width: targetWidth, withoutEnlargement: true })
        .avif({ quality: AVIF_QUALITY, effort: 5 })
        .toFile(avifPath);
    }
  }

  const lqipBuf = await sharp(src)
    .resize({ width: 24 })
    .blur(1.2)
    .webp({ quality: 30 })
    .toBuffer();
  const lqip = `data:image/webp;base64,${lqipBuf.toString("base64")}`;

  return {
    id: base,
    originalWidth: w,
    originalHeight: h,
    originalName: path.basename(src),
    variants,
    lqip,
  };
}

async function loadManifest(): Promise<AssetManifest> {
  try {
    const raw = await fs.readFile(MANIFEST_PATH, "utf8");
    return JSON.parse(raw) as AssetManifest;
  } catch {
    return { generatedAt: new Date(0).toISOString(), projects: {} };
  }
}

async function run() {
  let exists = true;
  try {
    await fs.access(SOURCE_DIR);
  } catch {
    exists = false;
  }
  if (!exists) {
    console.error(`✗ Source dir missing: ${SOURCE_DIR}`);
    console.error(`  Drop hero source images into _source/hero/ first.`);
    process.exit(1);
  }

  await ensureDir(OUT_DIR);
  const files = (await fs.readdir(SOURCE_DIR, { withFileTypes: true }))
    .filter(
      (e) => e.isFile() && IMG_EXT.has(path.extname(e.name).toLowerCase())
    )
    .map((e) => path.join(SOURCE_DIR, e.name))
    .sort();

  if (files.length === 0) {
    console.error(`✗ No source images in ${SOURCE_DIR}`);
    process.exit(1);
  }

  console.log(`KAD hero pipeline — ${files.length} file(s)`);

  const entries: AssetEntry[] = [];
  for (const f of files) {
    try {
      const e = await processOne(f);
      entries.push(e);
      console.log(`  ✓ ${e.id} (${e.originalWidth}x${e.originalHeight}, ${e.variants.length} WebP variants)`);
    } catch (err) {
      console.error(`  ✗ Failed ${f}:`, err);
    }
  }

  const manifest = await loadManifest();
  manifest.hero = entries;
  manifest.generatedAt = new Date().toISOString();
  await fs.writeFile(
    MANIFEST_PATH,
    JSON.stringify(manifest, null, 2),
    "utf8"
  );

  console.log(`\nDone. Manifest updated: ${path.relative(ROOT, MANIFEST_PATH)}`);
  console.log(`Output:   ${path.relative(ROOT, OUT_DIR)}/`);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
