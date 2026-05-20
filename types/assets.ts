/**
 * Manifest emitted by `scripts/process-assets.ts` and consumed at runtime
 * by Project pages, the Hero, and the Before/After section.
 */

export type AssetVariant = {
  /** Output width in pixels */
  width: number;
  /** Path relative to the CDN base (e.g. "projects/sodic/hero-1280.webp") */
  path: string;
};

export type AssetEntry = {
  /** Stable identifier inside its bucket (e.g. "hero", "img-001") */
  id: string;
  /** Original aspect ratio width */
  originalWidth: number;
  /** Original aspect ratio height */
  originalHeight: number;
  /** Original filename, useful for alt text fallback */
  originalName: string;
  /** All generated WebP widths */
  variants: AssetVariant[];
  /** Tiny base64 placeholder (data URL) for blur-up loading */
  lqip: string;
};

export type ProjectManifest = {
  slug: string;
  /** Display title rendered on cards + detail page */
  title: string;
  /** Short discipline label e.g. "Residential · Villa" */
  discipline: string;
  /** Geographic context */
  location: string;
  /** Year of completion (or "In progress") */
  year: string;
  /** Order within the gallery (lower = earlier) */
  order: number;
  /** One-paragraph atmosphere blurb */
  blurb: string;
  /** Asset entries (ordered: hero first, then secondary images) */
  images: AssetEntry[];
  /** Optional video CDN paths */
  videos?: string[];
};

export type AssetManifest = {
  generatedAt: string;
  projects: Record<string, ProjectManifest>;
  /** Standalone hero / misc entries keyed by bucket */
  hero?: AssetEntry[];
};
