# Deployment guide

KAD targets **Vercel**. Until the production domain is wired up, ship to a preview URL on `kad-*.vercel.app`.

## Prerequisites

- Node 20.9+ locally (Node 24 LTS used in development)
- A Vercel account with the `vercel` CLI installed *or* the GitHub integration connected to your repo
- (Phase 3+) A Supabase project — region **eu-central-1** (Frankfurt) recommended for MENA latency
- (Phase 3+) A Resend account for transactional email

## Phase 1 — initial preview deploy

The build is fully static at this phase, so no env vars are required.

```bash
# from F:\Website
npm install
npm run build         # sanity-check locally
npx vercel            # link the project and deploy preview
npx vercel --prod     # promote when you're ready
```

Vercel auto-detects Next.js. No additional configuration is needed. The build settings:

| Setting | Value |
|---|---|
| Framework | Next.js |
| Build command | `next build` (default) |
| Output | `.next` (default) |
| Install | `npm install` (default) |
| Node version | `20.x` or `22.x` (Vercel default) |

## Environment variables (introduced in later phases)

Add these to **Project Settings → Environment Variables** in Vercel. Use one set for `Preview` and one for `Production`.

```bash
# Phase 3 — Supabase
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...      # server-only, NEVER prefixed with NEXT_PUBLIC_

# Phase 3 — Resend
RESEND_API_KEY=...
LEAD_NOTIFY_EMAIL=info@karimallam.com  # where new-lead notifications are sent

# Phase 4 — Admin
ADMIN_ALLOWLIST=info@karimallam.com    # comma-separated, used in proxy.ts auth gate

# Phase 5 — observability
SENTRY_DSN=...
NEXT_PUBLIC_SENTRY_DSN=...
```

When Supabase is provisioned, also update `next.config.ts` `images.remotePatterns` with the actual hostname (e.g. `<project-ref>.supabase.co`).

## Custom domain

Once you provide the domain:

1. Vercel → Project → Domains → Add the domain.
2. In your DNS, add the records Vercel shows (typically a `CNAME` pointing at `cname.vercel-dns.com`).
3. SSL provisions automatically.
4. Update `metadataBase` in `app/layout.tsx` from `https://kad.studio` to the real domain so OG/Twitter cards resolve correctly.

## Performance budgets

We keep the marketing routes lean despite the cinematic stack:

| Route | LCP target | JS budget |
|---|---|---|
| `/` (Home) | ≤ 2.5s on 4G | ≤ 180 KB gzip |
| `/projects` | ≤ 2.8s | ≤ 200 KB gzip |
| `/portal` | ≤ 1.8s (no R3F/Lenis) | ≤ 140 KB gzip |
| `/admin` | n/a (private) | n/a |

Run `npm run build` and inspect the route table after Phase 5 lands the bundle analyzer.

## Asset pipeline (Phase 2)

Source media lives in `F:\Website\_source\` (gitignored). The build process is:

```bash
# 1. Optimise — emits AVIF/WebP at 5 widths + LQIP base64 thumbs into _dist/
npm run process:assets

# 2. Upload — pushes _dist/ to Supabase Storage buckets (projects/, before-after/, hero/)
npm run upload:assets

# 3. (One-time, before launch) — pair the 42 WhatsApp before/after files
npm run pair:ba
```

Manifest is written to `content/manifest.json` and consumed by `lib/cdn.ts` at runtime.

## Reverting / rolling back

Vercel keeps every deployment immutable. To roll back:

1. Vercel → Project → Deployments
2. Find a known-good build → ⋮ → **Promote to Production**

This is a soft restore — no rebuild needed.

## Smoke checklist (per deploy)

After every preview deploy:

- [ ] `/` hero shader renders (or static fallback on low-capability devices)
- [ ] Custom cursor follows the pointer; expands on `<a>` / `<button>`
- [ ] Grain overlay is visible but subtle (~5% opacity, mix-blend overlay)
- [ ] Smooth scroll is butter; no juddering when moving between sections
- [ ] All nav links return 200
- [ ] Lighthouse mobile ≥ 85 Performance, ≥ 95 A11y, 100 SEO
- [ ] Mobile (iOS Safari) — fallback gradient, no errors, no broken cursor
- [ ] (Phase 3+) Submit a test lead → row in Supabase + email received

## Anonymous Next.js telemetry

Disabled is fine — we don't need it. If you want to opt out:

```bash
npx next telemetry disable
```
