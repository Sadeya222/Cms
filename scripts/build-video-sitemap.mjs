#!/usr/bin/env node
/**
 * Automated Video XML Sitemap generator (spec §7.3).
 *
 * Reads the flat-file video collection and emits a Google Video sitemap to
 * dist/sitemap-video.xml. Run AFTER `astro build` so it lands in the deploy
 * output. Google Search Console can ingest this URL directly.
 *
 * Usage: node scripts/build-video-sitemap.mjs
 */
import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const CONTENT_DIR = path.join(ROOT, 'src', 'content', 'videos');
const OUT_DIR = path.join(ROOT, 'dist');
const OUT_FILE = path.join(OUT_DIR, 'sitemap-video.xml');

const SITE_URL = (process.env.PUBLIC_SITE_URL || 'https://streamvault.pages.dev').replace(/\/$/, '');

function xmlEscape(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

async function loadVideos() {
  if (!existsSync(CONTENT_DIR)) return [];
  const files = (await readdir(CONTENT_DIR)).filter((f) => f.endsWith('.json'));
  const videos = [];
  for (const file of files) {
    try {
      const raw = await readFile(path.join(CONTENT_DIR, file), 'utf8');
      videos.push(JSON.parse(raw));
    } catch (err) {
      console.warn(`[sitemap] Skipping malformed ${file}: ${err.message}`);
    }
  }
  return videos;
}

function toEntry(v) {
  const watchUrl = `${SITE_URL}/watch/${v.slug}`;
  const pub = new Date(v.publishedDate).toISOString();
  return `  <url>
    <loc>${xmlEscape(watchUrl)}</loc>
    <video:video>
      <video:thumbnail_loc>${xmlEscape(v.thumbnailUrl)}</video:thumbnail_loc>
      <video:title>${xmlEscape(v.title)}</video:title>
      <video:description>${xmlEscape((v.description || '').slice(0, 2048))}</video:description>
      <video:player_loc>${xmlEscape(v.streamEmbedUrl)}</video:player_loc>
      <video:duration>${isoDurationToSeconds(v.duration)}</video:duration>
      <video:publication_date>${pub}</video:publication_date>
      <video:family_friendly>yes</video:family_friendly>
      <video:live>no</video:live>
${(v.tags || []).slice(0, 32).map((t) => `      <video:tag>${xmlEscape(t)}</video:tag>`).join('\n')}
      <video:category>${xmlEscape(v.category)}</video:category>
    </video:video>
  </url>`;
}

function isoDurationToSeconds(iso) {
  const m = /^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/.exec(iso || '');
  if (!m) return 0;
  const [, h, min, s] = m.map((x) => (x ? Number(x) : 0));
  return h * 3600 + min * 60 + s;
}

async function main() {
  const videos = await loadVideos();
  const body = videos.map(toEntry).join('\n');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
${body}
</urlset>
`;

  if (!existsSync(OUT_DIR)) await mkdir(OUT_DIR, { recursive: true });
  await writeFile(OUT_FILE, xml, 'utf8');
  console.log(`[sitemap] Wrote ${videos.length} video entries -> ${path.relative(ROOT, OUT_FILE)}`);
}

main().catch((err) => {
  console.error('[sitemap] Failed:', err);
  process.exit(1);
});
