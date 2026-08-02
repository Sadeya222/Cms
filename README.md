# StreamVault — Zero-Database High-Performance Video Platform

A **production-grade, zero-database video streaming platform** built on modern Static
Site Generation. Content is managed as Git-backed flat JSON files, media streaming is
fully offloaded to **StreamA2Z** and **LuluStream** embeds, and search runs entirely in
the browser via WebAssembly. The result is an edge-delivered site engineered for a
**100/100 Lighthouse score** with **zero JavaScript shipped by default**.

> Implements the *Engineering Architectural Specification: Zero-Database High-Performance
> Video Platform* end to end.

---

## ✨ Highlights

- **0 KB JavaScript on load** — every page is pre-rendered static HTML; interactivity is
  progressive enhancement only (click-to-play facade, mobile menu, share button).
- **Dual embed providers** — videos stream from either **StreamA2Z** or **LuluStream**
  (offloaded transcoding, ABR, storage & thumbnails). Provider is auto-detected from the
  embed URL or set explicitly per video.
- **Modern, fully responsive UI** — dark design system, mobile navigation drawer, hero
  spotlight, editorial sections, 16:9 cards with hover states, related-video rail, and a
  polished watch experience from phone to ultrawide.
- **Zero-database architecture** — content lives in `src/content/videos/*.json`,
  Zod-validated at build time. Malformed content **fails the build** instead of shipping
  a broken page.
- **Client-side WASM search** — Pagefind indexes the built HTML into microscopic chunks;
  sub-10 ms queries with no backend.
- **SEO complete** — self-referential canonicals, `VideoObject` + `BreadcrumbList`
  JSON-LD, `ItemList` for category pages, paginated series with `rel=prev/next`, Google
  Video sitemap, env-driven `robots.txt`.
- **Hardened production headers** — CSP scoped to the two embed hosts, `X-Frame-Options`,
  `Referrer-Policy`, `Permissions-Policy`, immutable asset caching (Cloudflare + Vercel).
- **CI/CD** — GitHub Actions: security audit, `astro check`, full build on every PR;
  one-click Cloudflare Pages deploy on `main`.

---

## Architecture at a glance

| Layer | Technology | Why |
| --- | --- | --- |
| **Core engine** | Astro (SSG, `output: static`) | Pre-compiles every page to static HTML/CSS at build time. Ships **0 KB JS** by default. |
| **Data layer** | Git Content Collections (flat JSON) | No SQL/NoSQL. Metadata lives in `src/content/videos/*.json`, Zod-validated at build. Runtime query latency = 0 ms. |
| **Admin / CMS** | Decap CMS (`git-gateway`) at `/admin` | Visual editor that commits JSON straight to GitHub, triggering the build hook. No backend API exposed. |
| **Media / streaming** | Offloaded embeds — StreamA2Z + LuluStream | Transcoding, ABR, storage & thumbnails handled externally. Our servers deliver static HTML only. |
| **Search** | Pagefind (static WASM index) | Chunked index built post-compile; sub-10 ms client-side queries, <10 KB over the wire. |
| **Edge delivery** | Cloudflare Pages / Vercel Edge | Global CDN, automatic SSL + DDoS mitigation, <50 ms responses. |

### Engineered solutions to zero-database bottlenecks

- **Dynamic Static Pagination Engine** — Astro's `paginate()` compiles clean, crawlable
  routes (`/category/technology/1`, `/2`, …) at build time with self-referential canonicals.
  No runtime `LIMIT`/`OFFSET`.
- **Client-Side Static Search** — Pagefind indexes the built HTML into microscopic WASM
  chunks; titles, tags & categories are searchable instantly with no backend.
- **Static Graph Relation Matching (Related Videos)** — related content is computed at build
  time by scoring shared subcategory / category / tags (`src/utils/content.js → findRelated`)
  and embedded directly into the HTML.
- **Click-to-Play Facade Pattern** — watch pages render only a lightweight poster + button;
  the heavy third-party `<iframe>` is injected **only on explicit user click**, protecting
  LCP and INP/FID. *(Verified: 0 iframes on load → 1 on click.)*

---

## Project structure

```
.
├── astro.config.mjs            # SSG config, clean URLs, sitemap integration
├── src/
│   ├── content.config.ts       # Zod schema for the flat-file "database"
│   ├── config/site.ts          # Brand, SEO constants, taxonomy, page size
│   ├── content/videos/*.json   # The data — one JSON file per video
│   ├── layouts/BaseLayout.astro# <head>, SEO, canonical, OG, JSON-LD, header/footer
│   ├── components/
│   │   ├── Header.astro        # Sticky glass nav + responsive mobile drawer
│   │   ├── Footer.astro        # Multi-column footer with live stats
│   │   ├── VideoCard.astro     # Responsive 16:9 card (grid + compact variants)
│   │   └── VideoFacade.astro   # Click-to-play facade w/ provider badge + spinner
│   ├── pages/
│   │   ├── index.astro                         # Hero, stats, spotlight, categories, grids
│   │   ├── search.astro                        # noindex Pagefind search
│   │   ├── 404.astro
│   │   ├── robots.txt.ts                       # env-driven robots.txt
│   │   ├── watch/[slug].astro                  # watch page: facade + VideoObject + related
│   │   └── category/[category]/
│   │        ├── [page].astro                   # paginated category route
│   │        └── index.astro                    # bare → /1 redirect
│   ├── styles/global.css       # design system (dark theme, responsive, a11y)
│   └── utils/                  # content.js (providers + pure helpers) + queries.js
├── public/
│   ├── admin/                  # Decap CMS (index.html + config.yml)
│   ├── favicon.svg  og-default.svg  _headers
├── scripts/
│   ├── build-video-sitemap.mjs # emits dist/sitemap-video.xml (Google Video sitemap)
│   └── generate-sample-data.mjs# seeds 24 realistic sample videos (alternating providers)
├── .github/workflows/
│   ├── ci.yml                  # audit + type-check + build on every push/PR
│   └── deploy.yml              # Cloudflare Pages deploy on main
├── vercel.json                 # Vercel build + caching/security headers
└── package.json
```

---

## Getting started

> **Requirements:** Node **>= 20.19** (Astro 7). Cloudflare Pages / Vercel already default
> to Node 22. Locally, use `nvm install 22 && nvm use 22`.

```bash
npm install
npm run seed      # optional: generate 24 sample videos to see it populated
npm run dev       # http://localhost:4321
```

### Build (SSG + search index + video sitemap)

```bash
npm run build     # astro build → pagefind index → video sitemap
npm run preview   # serve the production build locally
```

The `build` script runs three stages in order:

1. `astro build` — pre-renders all pages to `dist/`.
2. `pagefind --site dist` — indexes the built HTML into `dist/pagefind/`.
3. `node scripts/build-video-sitemap.mjs` — writes `dist/sitemap-video.xml`.

### Quality gates

```bash
npm run check     # astro check — TypeScript + content schema validation
npm run audit     # npm audit, fails on high/critical advisories
```

---

## Content model

Each video is a single JSON document in `src/content/videos/[slug].json`, validated by the
Zod schema in `src/content.config.ts`. A malformed record **fails the build** instead of
shipping a broken page.

```json
{
  "id": "vid_0001",
  "title": "Building a Zero-Database Video Platform with Astro",
  "slug": "building-a-zero-database-video-platform-with-astro",
  "description": "…",
  "category": "Technology",
  "subcategory": "AI & ML",
  "tags": ["astro", "ssg", "performance"],
  "duration": "PT22M35S",
  "publishedDate": "2026-05-13T10:33:58.271Z",
  "provider": "streama2z",
  "streamEmbedUrl": "https://streama2z.com/embed/building-a-zero-database-video-platform-with-astro",
  "thumbnailUrl": "https://…/640/360",
  "featured": true
}
```

### Embed providers: StreamA2Z & LuluStream

Each video embeds its player from one of two offloaded media hosts:

| Provider | Embed URL shape | `provider` value |
| --- | --- | --- |
| **StreamA2Z** | `https://streama2z.com/embed/<slug>` | `streama2z` |
| **LuluStream** | `https://lulustream.com/embed/<slug>` | `lulustream` |

- Set `provider` to `streama2z`, `lulustream`, or `auto` (default). `auto` derives the
  provider from the `streamEmbedUrl` host at build time, so legacy records without the
  field keep working.
- The watch page, cards, and player facade all show a colour-coded provider badge, and
  the base layout preconnects to **both** hosts so embeds start instantly.
- Both hosts are allowlisted in the Content-Security-Policy header (`frame-src`).

### Editing content

- **Visually:** deploy and visit `/admin` (Decap CMS). It commits JSON to Git → CI rebuilds.
  For local editing run `npx decap-server` (the config has `local_backend: true`).
- **By hand:** drop a new `.json` file into `src/content/videos/`.

---

## SEO & indexation strategy

- **Self-referential canonicals** on every watch page and category route (kills duplicate-content flags).
- **`VideoObject` + `BreadcrumbList` JSON-LD** on watch pages for Google Rich Results; `WebSite`
  + `CollectionPage`/`ItemList` schemas elsewhere.
- **`rel="prev"/"next"`** on paginated series.
- **Interior search is `noindex,follow`** to avoid soft-duplicate penalties.
- **Two sitemaps:** the standard `sitemap-index.xml` (pages) and a dedicated Google Video
  sitemap at `sitemap-video.xml`. Both are referenced in `robots.txt` (generated from
  `PUBLIC_SITE_URL` at build time).

---

## Deployment

Set **`PUBLIC_SITE_URL`** to your production origin (used for canonicals, OG tags,
`robots.txt`, and both sitemaps) in the host's build environment.

### Cloudflare Pages

- Build command: `npm run build` — Output directory: `dist`
- Env var: `PUBLIC_SITE_URL=https://your-domain`
- Caching/security headers are provided in `public/_headers` (includes a CSP scoped to
  the two embed hosts).
- **GitHub Actions:** the `deploy.yml` workflow publishes the `main` branch to a Pages
  project named `streamvault`. Configure two repo secrets:
  - `CLOUDFLARE_API_TOKEN` (Permissions → Pages → Edit)
  - `CLOUDFLARE_ACCOUNT_ID`
  - Add the Pages project: `npx wrangler pages project create streamvault --production-branch=main`

### Vercel

- Auto-detected via `vercel.json` (build, output, clean URLs, security headers).
- Add `PUBLIC_SITE_URL` in Project → Settings → Environment Variables.

### Decap CMS auth

The CMS uses **git-gateway**. Wire up an OAuth provider (e.g. GitHub OAuth app or
Netlify Identity–compatible gateway) so `/admin` can authenticate and commit. Without
auth configured, the admin UI still works for local editing via `npx decap-server`.

---

## Performance & verification notes

- **Zero JS by default:** the built `dist/_astro` contains **0 JS bundles**; the only
  scripts are tiny inline enhancers (facade handler, mobile menu, share button) and the
  JSON-LD blocks.
- **Facade verified:** automated check confirms `0 → 1` iframe transition on click with the
  correct embed URL.
- **Search verified:** client-side Pagefind query returns results from the WASM index with no
  backend.
- **Clean URLs:** canonicals resolve to `/watch/slug` and `/category/name/1` (no `.html`).
- `npm audit` → **0 vulnerabilities**.

---

## License

MIT — see [LICENSE](./LICENSE).
