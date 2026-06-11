# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Star Sonic is a Next.js 14 (App Router) front-end for an AI music-creation platform. It is a working web app rebuilt from a single-file HTML prototype (`starsonic-prototipo-v6 (2).html` at the repo root) — that file is the design source of truth for visuals and copy; the React app reproduces it page by page. UI text is in Brazilian Portuguese.

The app currently runs in **"dados públicos / demo" mode**: there is no login. Auth is stubbed out (`src/middleware.ts` returns `NextResponse.next()` with an empty matcher), and all Supabase tables expose public read-only RLS policies. `getProfile()` just returns the first/oldest profile row as the demo user.

## Commands

```bash
npm run dev      # next dev — local development
npm run build    # next build — production build (use to type-check the whole app)
npm run start    # next start — serve the production build
npm run lint     # next lint
```

There is no test framework configured. `npm run build` is the closest thing to a full check (TypeScript is `strict`).

Requires `.env` with `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` (see `.env.example`). Both are public anon values since access is read-only.

## Supabase setup

`supabase/schema.sql` is a single idempotent (re-runnable) script: paste the whole file into the Supabase SQL Editor and run it. It drops + recreates all tables, sets the public-read RLS policies, and seeds the data that replaces the prototype's hardcoded mock content. After changing table shapes here, keep `src/lib/types.ts` in sync — those types are hand-written mirrors of the schema, not generated.

## Architecture

**Data flow.** Server Components fetch data directly via `src/lib/data.ts` helpers (`getProfile`, `getCreations`, `getCatalogSongs`, `getPlans`, `getDsps`, `getPresets`, `getNotifications`). Each helper creates a server Supabase client (`src/lib/supabase/server.ts`) and returns typed rows. Pages call these in parallel with `Promise.all` and pass plain data down as props. There is no global state manager and no client-side data fetching — client components receive everything via props.

**Server vs. client split.**
- Pages (`src/app/(app)/*/page.tsx`) and `src/app/(app)/layout.tsx` are **async Server Components** — they own all DB reads.
- Only three components are client components (`"use client"`): `Sidebar`, `Header`, `ContextualPanel`. They use `usePathname()` for active-route highlighting and the contextual side panel, so they receive already-fetched data (e.g. `presets`, `profile`) as props from the server layout.

**Supabase clients** — pick by context:
- `src/lib/supabase/server.ts` → `createClient()` for Server Components / server code (cookie-aware, async).
- `src/lib/supabase/client.ts` → `createClient()` for browser/client components.

**Routing & the contextual panel.** The app shell lives in the `(app)` route group; its layout renders `MusicalBg`, `Sidebar`, `ContextualPanel`, `Header`, and `<main>`. `src/lib/nav.ts` is the central route-metadata map: `PAGE_META` maps each route segment → which contextual panel to show, the breadcrumb string, and which sidebar icon is active. `metaForPath(pathname)` resolves the first path segment (falling back to `dashboard`). When adding a route, add it to `PAGE_META`; several distinct routes (the `SONIC_LAB_PAGES`) intentionally share the single `sonic-lab` panel and the `compositor` sidebar icon.

**Styling.** Tailwind is configured but most styling is done with global CSS classes and CSS custom properties (`--cyan-1`, `--purple`, `--text-3`, `--bg-card-2`, etc.) defined in `src/app/globals.css`, plus heavy use of inline `style={{}}` objects — this mirrors the prototype's design tokens. Fonts (Orbitron, Sora, JetBrains Mono) are loaded via `<link>` in the root layout. When matching the prototype, prefer the existing CSS variables and global classes (`card`, `card-glow`, `btn-primary`, `badge`, `grad-text`) over new Tailwind utilities.

**Formatting helpers** live in `src/lib/format.ts` (`formatPlays`, `timeAgo`, `kindLabel`).

## Conventions

- Path alias `@/*` → `./src/*`.
- Code comments and all user-facing copy are in Portuguese; keep new strings consistent with that.
- When a page needs new data, add a typed helper to `src/lib/data.ts` rather than calling Supabase inline, and add the matching type to `src/lib/types.ts`.

**Supabase tabelas**
- Creations
    - profile_id
    - title
    - kind
    - genre
    - duration
    - status
    - progress
    - plays 
    - words 
    - resolution
    - is_favorite 
    - is_public
    - has_video
    - badge_label
    - emoji
    - gradient_from
    - gradient_to
    - audio_url