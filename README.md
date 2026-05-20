# KAD — Atelier of Interiors

A cinematic, production-targeted website for KAD: hero shader, smooth scroll, single global WebGL canvas, custom cursor, grain & vignette overlays, and a luxury dark + gold design system anchored on the studio's logo.

This codebase ships in **five phases**. Phase 1 (foundation + hero) is in this commit. The plan and decisions are documented in `~/.claude/plans/f-website-you-are-claude-agile-stonebraker.md`.

## Stack

- **Next.js 16** (App Router, Turbopack, RSC)
- **React 19**
- **TypeScript** (strict)
- **Tailwind CSS 4** (CSS-first via `@theme inline`)
- **Framer Motion** + **GSAP** + **Lenis** for motion / smooth scroll
- **Three.js** + **React Three Fiber** + **Drei** for the global WebGL canvas
- **Zustand** for the scene store
- (Phase 3+) Supabase for portal + admin, Resend for email, sharp for the asset pipeline

## Quick start

Requires **Node 20.9+** (Node 24 LTS works). Install with `winget install OpenJS.NodeJS.LTS` on Windows.

```bash
npm install
npm run dev    # http://localhost:3000 (or --port 3737 etc.)
```

Production:

```bash
npm run build
npm run start
```

Type check:

```bash
npm run typecheck
```

## Project structure

```
F:\Website
├── app/
│   ├── (marketing)/        # public site (hero, projects, services, about, contact, before-after)
│   │   ├── layout.tsx      # SmoothScrollProvider + CanvasRoot + Cursor + Grain + Vignette + NavBar + Footer
│   │   └── page.tsx        # home — Hero + Phase-1 placeholder sections
│   ├── portal/             # 8-step client onboarding (Phase 3)
│   ├── admin/              # auth-gated leads dashboard (Phase 4)
│   ├── layout.tsx          # root: fonts (Fraunces + Inter), metadata, viewport
│   └── globals.css         # luxury dark + gold tokens via Tailwind 4 @theme
├── components/
│   ├── cinematic/          # Hero, Cursor, GrainOverlay, Vignette
│   ├── three/              # CanvasRoot (single canvas), HeroShader, ParticleField
│   ├── shared/             # Logo, NavBar, Footer, RevealOnScroll, ComingSoon
│   ├── ui/                 # Button (magnetic) — primitives
│   └── providers/          # SmoothScrollProvider (Lenis + GSAP wiring)
├── hooks/                  # useLenis, useScrollTrigger, useReducedMotion, useMediaCapability, useMagnetic
├── lib/
│   ├── animations/         # easings + variants
│   ├── stores/             # sceneStore (zustand)
│   └── utils/              # cn (clsx + tailwind-merge)
├── shaders/                # hero.ts (vertex + fragment as TS-exported strings)
├── public/                 # only logo SVG / favicon / fonts — no project media
├── _source/                # ORIGINALS, gitignored — moved from project root on day 1
└── next.config.ts
```

### Why a single global Canvas?

R3F + Lenis + GSAP can stomp on each other. We mount **one** `<Canvas>` in the marketing layout (fixed, full-viewport, behind everything via `-z-10`) and the `sceneStore` decides what's rendered. This keeps WebGL contexts at 1 (mobile Safari caps at 8) and avoids ScrollTrigger/Lenis desync.

### Why two layouts?

- `(marketing)` gets the full cinematic chrome (smooth scroll, canvas, cursor).
- `portal/` and `admin/` deliberately omit it — forms and tables feel snappier with native scroll, and we save bundle weight.

### Capability gating

`useMediaCapability` reads `prefers-reduced-motion`, `pointer: coarse`, `deviceMemory`, and `hardwareConcurrency`. If a device fails the threshold (≥4 cores, ≥4 GB RAM, no touch, no reduced-motion, working WebGL), `CanvasRoot` falls back to a static gold gradient instead of mounting the shader. The custom cursor disappears on touch screens.

## Brand tokens

All in `app/globals.css`. The CSS variables are also exposed as Tailwind 4 theme colors via `@theme inline`, so `bg-gold`, `text-bone`, etc. work in markup.

| Token | Hex | Use |
|---|---|---|
| `--ink` | `#050505` | deepest base |
| `--obsidian` | `#0b0b0d` | surfaces |
| `--coal` | `#161618` | cards |
| `--bone` | `#eae3d2` | primary text |
| `--mist` | `#8a8579` | muted text |
| `--gold` | `#c9a33b` | primary accent (sampled from logo) |
| `--gold-soft` | `#d8b868` | hover / glow |
| `--gold-deep` | `#8a6f22` | shadow tone |

Type: display = **Fraunces** (variable, optical-size axis), body = **Inter**.

## What ships through Phase 2

### Phase 1 — Foundation
- ✅ Cinematic hero with gold-leaf GLSL shader, particles, kinetic typography, magnetic CTAs, HUD eyebrow + scroll cue
- ✅ Single global R3F canvas with capability-gated static fallback
- ✅ Lenis smooth scroll + GSAP wiring (single source of truth)
- ✅ Custom gold cursor (dot + ring), film-grain overlay, cinematic vignette
- ✅ Luxury dark + gold token system on Tailwind 4
- ✅ NavBar (sticky, blur on scroll, magnetic CTA), Footer (with real contact info)

### Phase 2 — Marketing complete
- ✅ **Asset pipeline** (`scripts/process-assets.ts`) — sharp → WebP at 3 widths + base64 LQIP, writes `content/manifest.json` + per-project metadata
- ✅ **`lib/cdn.ts`** abstraction — local `/cdn/*` paths today, swaps to Supabase Storage URLs in Phase 3 by setting `NEXT_PUBLIC_SUPABASE_URL`
- ✅ **`<CdnImage>`** wrapper around Next/Image with manifest-driven blur-up + responsive `sizes`
- ✅ **`/projects`** — editorial masonry grid (12 projects), magnetic cards with hover scale + reveal band
- ✅ **`/projects/[slug]`** — full-bleed hero, atmosphere blurb, parallax-ready editorial image stream, prev/next nav (12 SSG pages)
- ✅ **`/services`** — 4 discipline cards with 3D tilt + pointer-tracked gold light + glass surface
- ✅ **`/about`** — blueprint backdrop hero, principles grid, scroll-driven gold timeline
- ✅ **`/before-after`** — AI morph component with GLSL noise-warped mask + drag handle + scan band
- ✅ **`/contact`** — glassmorphic form, floating labels, gold focus glows, success state with particle wash. POSTs to `/api/contact` (stub — Resend wires in Phase 3)
- ✅ **Home page** — Hero → kinetic word marquee → approach + stats → featured projects (parallax) → discipline preview → CTA card
- ✅ **Pairing CLI** (`scripts/pair-before-after.ts`) — local web UI on :4848 for the user to pair the 42 WhatsApp before/after files

Routes verified (`npm run build`, 23 static + 1 dynamic):
`/`, `/projects`, `/projects/<slug>` (12 prerendered), `/services`, `/about`, `/before-after`, `/contact`, `/portal`, `/admin`, `/_not-found`, `/api/contact`.

### What lands in later phases

| Phase | Scope |
|---|---|
| **3 — Backend & portal** | Supabase migrations + RLS, 8-step client onboarding, file uploads via signed URLs, Resend email, WhatsApp deeplinks. `/api/contact` switches from console-log to Supabase + Resend. |
| **4 — Admin** | Supabase Auth, leads table, file downloads, status management, CSV export |
| **5 — Polish & launch** | Bundle analysis, accessibility audit, SEO, dynamic OG, sitemap, Sentry, Vercel deploy |

## Asset handling

The 297 MB of source media in `_source/` (logos, project galleries, before/after, reference video) is **gitignored**. The optimised derivatives that the runtime serves are also gitignored (`/public/cdn/`) and rebuildable via the pipeline.

### Pipeline scripts

```bash
npm run process:assets        # curated: 3 images per project (~35 images, ~1 minute)
npm run process:assets:full   # all source images (~200 images, ~10–15 minutes)
npm run pair:ba               # opens http://localhost:4848 to pair before/after files
```

`process-assets.ts`:
- walks `_source/projects gallery/<folder>/`
- maps source folder names → slug + display metadata (the `PROJECT_META` table at the top of the script)
- emits WebP at 480/1280/1920 widths (skipping upscales) + a 24-px base64 LQIP per image
- writes `public/cdn/projects/<slug>/<id>-<width>.webp`
- writes `content/manifest.json` (consumed by `lib/projects.ts`)
- writes `content/projects/<slug>.json` (per-project metadata)

`pair-before-after.ts` spins up a tiny local web UI for the user to click pairs of WhatsApp images, writing `content/before-after.json`. Phase 3 replaces the demo pairs in `/before-after` with these confirmed pairs.

### Switching to Supabase Storage (Phase 3)

`lib/cdn.ts` reads `NEXT_PUBLIC_SUPABASE_URL`. When set, it routes asset paths through `<project>.supabase.co/storage/v1/object/public/...` instead of the local `/cdn/...` directory. The manifest paths don't need to change — only the prefix swaps. A future `scripts/upload-to-supabase.ts` will push the `public/cdn/` tree to Storage in bulk.

Until Phase 2, only the logo SVG (`public/favicon.svg`) and fonts (loaded via `next/font/google`) live under `public/` proper. Generated CDN outputs go under `public/cdn/` which is gitignored.

## Conventions

- Components: PascalCase files, named exports.
- Client components have `"use client"` at the top; everything else is a server component by default.
- Animation easings live in `lib/animations/easings.ts` — use `ease.luxe`, `ease.cinema`, `ease.outExpo` instead of inline arrays.
- Reach for `<RevealOnScroll>` (Framer + IntersectionObserver) for ~90% of reveals; reserve `useScrollTrigger` for pinning, parallax, or timeline-heavy sections.
- The custom cursor expands on any element with `data-cursor="link"`, plus all `<a>` and `<button>`. Add the attribute manually to other interactive surfaces.

## License

Private — © KAD. All rights reserved.
