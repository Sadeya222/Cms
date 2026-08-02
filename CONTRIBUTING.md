# Contributing to StreamVault

Thanks for helping make StreamVault better! Every contribution counts — code,
content, docs, or a well-written bug report.

## Getting started

1. Fork the repository and clone your fork.
2. Install dependencies: `npm install` (requires Node >= 20.19).
3. Seed sample content: `npm run seed` (optional, but makes local development nicer).
4. Start the dev server: `npm run dev` → http://localhost:4321

## Before submitting a PR

- Run `npm run check` (Astro type + content checks) and fix any errors.
- Run `npm run build` locally and confirm it completes all three stages
  (Astro SSG → Pagefind index → video sitemap).
- Keep the zero-JS-by-default philosophy: interactivity must be progressive
  enhancement (small `is:inline` scripts), never a requirement for the page
  to render or be usable.
- All content in `src/content/videos/*.json` must validate against the Zod
  schema in `src/content.config.ts` — the build fails otherwise, on purpose.
- Update the README if you change architecture, scripts, or deployment steps.

## Content contributions

- Add a video by dropping a new `.json` file into `src/content/videos/`, or
  use the Decap CMS editor at `/admin`.
- Supported embed providers: **StreamA2Z** (`streama2z.com`) and **LuluStream**
  (`lulustream.com`). Set `provider` to `streama2z`, `lulustream`, or `auto`.

## Commit conventions

We follow conventional commits: `feat:`, `fix:`, `docs:`, `chore:`, `perf:`,
`style:`, `refactor:`, `test:`.

## Code of conduct

Be respectful and constructive. Harassment of any kind is not tolerated.
