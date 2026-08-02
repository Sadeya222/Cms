// robots.txt generated at build time so sitemap URLs always match the
// production origin (PUBLIC_SITE_URL), no matter where the site is deployed.
import type { APIRoute } from 'astro';
import { SITE } from '../config/site';

export const GET: APIRoute = ({ site }) => {
  const origin = (site ?? new URL(SITE.url)).toString().replace(/\/$/, '');
  const body = [
    'User-agent: *',
    'Allow: /',
    '',
    '# Keep interior search + admin out of the index',
    'Disallow: /search',
    'Disallow: /admin',
    '',
    `Sitemap: ${origin}/sitemap-index.xml`,
    `Sitemap: ${origin}/sitemap-video.xml`,
    '',
  ].join('\n');

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
