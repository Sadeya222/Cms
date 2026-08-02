/**
 * Global site configuration.
 * Centralises brand + SEO constants so nothing is hard-coded across components.
 */
export const SITE = {
  name: 'StreamVault',
  title: 'StreamVault — High-Performance Video Streaming',
  description:
    'Discover and watch curated videos across technology, entertainment, and education. Blazing-fast, privacy-friendly streaming with zero tracking on load.',
  // Default canonical origin (no trailing slash). Overridden by PUBLIC_SITE_URL at build time.
  url: 'https://streamvault.pages.dev',
  author: 'StreamVault',
  locale: 'en_US',
  lang: 'en',
  themeColor: '#070b14',
  // Open Graph fallback image (served from /public).
  ogImage: '/og-default.svg',
  twitter: '@streamvault',
};

/**
 * Category taxonomy. Kept in one place so the CMS select widget, the nav,
 * and the pagination engine all agree on the canonical category set.
 */
export const CATEGORIES = ['Technology', 'Entertainment', 'Education'];

/**
 * Embed providers the platform supports. Content may reference these via the
 * `provider` field in each video record, or leave it `auto` to be derived
 * from the embed URL host. Mirror of EMBED_PROVIDERS in src/utils/content.js —
 * keep in sync when adding a host.
 */
export const EMBED_HOSTS = ['streama2z.com', 'lulustream.com'];

/** Number of videos rendered per paginated category page. */
export const PAGE_SIZE = 12;

/** Number of related videos surfaced on each watch page. */
export const RELATED_LIMIT = 6;
