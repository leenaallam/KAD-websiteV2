/**
 * CDN URL resolution.
 *
 * Phase 2: assets are emitted by `scripts/process-assets.ts` to
 * `public/cdn/...` and served directly by Next.js. URLs here are relative
 * paths starting with `/cdn`.
 *
 * Phase 3+: when `NEXT_PUBLIC_SUPABASE_URL` is set, we route asset URLs
 * through Supabase Storage's public CDN instead. The same paths in the
 * manifest work without changes — only this resolver swaps prefixes.
 */
const SUPABASE_BASE = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");

export function cdn(path: string): string {
  const clean = path.startsWith("/") ? path.slice(1) : path;
  if (SUPABASE_BASE) {
    return `${SUPABASE_BASE}/storage/v1/object/public/${clean}`;
  }
  return `/cdn/${clean}`;
}

export function cdnPublic(path: string): string {
  // Convenience for assets we always serve from the local public folder
  // regardless of CDN config (favicons, fonts, etc.).
  return path.startsWith("/") ? path : `/${path}`;
}
