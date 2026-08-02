#!/usr/bin/env node
/**
 * Generates a realistic set of sample video JSON records so the platform builds
 * and demos out of the box. Safe to re-run (overwrites the sample-* files only).
 *
 * Usage: node scripts/generate-sample-data.mjs [count]
 */
import { writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIR = path.resolve(__dirname, '..', 'src', 'content', 'videos');

const DATA = {
  Technology: {
    subs: ['Web Development', 'AI & ML', 'DevOps', 'Cybersecurity'],
    titles: [
      'Building a Zero-Database Video Platform with Astro',
      'Edge Rendering Explained: CDNs and Core Web Vitals',
      'WebAssembly Search: How Pagefind Hits Sub-10ms',
      'Static Site Generation vs SSR in 2026',
      'Mastering Core Web Vitals: LCP, INP, and CLS',
      'The Facade Pattern for Lightning-Fast Video Embeds',
      'Git-Driven Content Workflows for Developers',
      'Optimizing Images: WebP, AVIF, and Responsive Loading',
    ],
    tags: ['astro', 'ssg', 'performance', 'seo', 'webdev', 'javascript', 'cloudflare', 'edge'],
  },
  Entertainment: {
    subs: ['Film & TV', 'Music', 'Gaming', 'Comedy'],
    titles: [
      'Behind the Scenes: Cinematic Color Grading',
      'The Evolution of Game Soundtracks',
      'Top 10 Practical Movie Effects',
      'Live Session: Acoustic Covers Night',
      'Speedrunning: The Art of Frame-Perfect Play',
      'Stand-Up Special: The Road Stories',
      'How Streaming Changed the Music Industry',
      'Indie Film Spotlight: Shot on a Budget',
    ],
    tags: ['film', 'music', 'gaming', 'live', 'comedy', 'review', 'indie', 'behind-the-scenes'],
  },
  Education: {
    subs: ['Science', 'History', 'Languages', 'Business'],
    titles: [
      'Quantum Computing for Absolute Beginners',
      'The History of the Silk Road in 15 Minutes',
      'Learn Spanish: Everyday Conversations',
      'Personal Finance: Budgeting That Actually Works',
      'How Vaccines Work: An Animated Explainer',
      'Ancient Rome: Engineering Marvels',
      'Public Speaking: Overcoming Stage Fright',
      'Statistics 101: Understanding Probability',
    ],
    tags: ['science', 'history', 'language', 'finance', 'tutorial', 'explainer', 'beginner', 'learning'],
  },
};

function slugify(s) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}
function pick(arr, n) {
  const copy = [...arr];
  const out = [];
  for (let i = 0; i < n && copy.length; i++) out.push(copy.splice(Math.floor(Math.random() * copy.length), 1)[0]);
  return out;
}
function isoDur() {
  const m = 2 + Math.floor(Math.random() * 25);
  const s = Math.floor(Math.random() * 60);
  return `PT${String(m).padStart(2, '0')}M${String(s).padStart(2, '0')}S`;
}

async function main() {
  await mkdir(DIR, { recursive: true });
  let i = 0;
  const now = Date.now();
  for (const [category, cfg] of Object.entries(DATA)) {
    for (const title of cfg.titles) {
      i++;
      const slug = slugify(title);
      const subcategory = cfg.subs[i % cfg.subs.length];
      const daysAgo = Math.floor(Math.random() * 240);
      const record = {
        id: `vid_${String(i).padStart(4, '0')}`,
        title,
        slug,
        description: `${title}. In this video we take a deep, practical look at ${subcategory.toLowerCase()} — clear explanations, real examples, and takeaways you can apply immediately. Part of the ${category} collection on StreamVault.`,
        category,
        subcategory,
        tags: pick(cfg.tags, 3 + Math.floor(Math.random() * 3)),
        duration: isoDur(),
        publishedDate: new Date(now - daysAgo * 86400000).toISOString(),
        // Alternate between the two supported media hosts so both embed
        // providers (StreamA2Z + LuluStream) are exercised in the demo data.
        provider: i % 2 === 0 ? 'streama2z' : 'lulustream',
        streamEmbedUrl:
          i % 2 === 0
            ? `https://streama2z.com/embed/${slug}`
            : `https://lulustream.com/embed/${slug}`,
        thumbnailUrl: `https://picsum.photos/seed/${slug}/640/360`,
        featured: i % 5 === 0,
      };
      await writeFile(path.join(DIR, `${slug}.json`), JSON.stringify(record, null, 2) + '\n', 'utf8');
    }
  }
  console.log(`[seed] Wrote ${i} sample video records to src/content/videos/`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
