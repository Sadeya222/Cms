import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { SITE } from './src/config/site';

// https://astro.build/config
export default defineConfig({
  // Canonical site origin. Override with the PUBLIC_SITE_URL env var at build time
  // (e.g. on Cloudflare Pages / Vercel) so canonicals + sitemaps are correct.
  site: process.env.PUBLIC_SITE_URL || SITE.url,

  // Static Site Generation — zero runtime server, ships pre-rendered HTML only.
  output: 'static',

  // Clean, trailing-slash-free URLs to keep canonical tags unambiguous.
  trailingSlash: 'never',
  build: {
    // 'directory' emits /watch/slug/index.html, served at the clean URL
    // /watch/slug on Cloudflare Pages & Vercel — no ".html" in canonicals.
    format: 'directory',
    // Inline tiny stylesheets so the critical CSS ships in the first byte.
    inlineStylesheets: 'auto',
  },

  // Ship ZERO JavaScript by default. Interactivity is opt-in per component.
  integrations: [
    sitemap({
      // The page sitemap. The custom VideoObject sitemap is emitted separately
      // to public/sitemap-video.xml by scripts/build-video-sitemap.mjs.
      filter: (page) =>
        !page.includes('/admin') &&
        !page.includes('/search') &&
        // Exclude the bare /category/[name] redirect stubs (noindex); their
        // paginated /1 counterparts are the canonical entry points.
        !/\/category\/[^/]+$/.test(page.replace(/\/$/, '')),
      changefreq: 'daily',
      priority: 0.7,
    }),
  ],

  compressHTML: true,

  vite: {
    build: {
      cssMinify: true,
    },
  },
});
