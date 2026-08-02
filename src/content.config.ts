import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * Flat-file "database".
 *
 * Every video is a single JSON document in src/content/videos/[slug].json.
 * There is NO runtime database — Astro validates each record against this Zod
 * schema at build time, so malformed content fails the CI build instead of
 * shipping broken pages. Query latency at runtime is 0ms because everything is
 * pre-compiled into static HTML.
 */
const videoCollection = defineCollection({
  // Astro 5 content layer: load every JSON file in the videos folder.
  loader: glob({ pattern: '**/*.json', base: './src/content/videos' }),
  schema: z.object({
    id: z.string(),
    title: z.string().min(1),
    slug: z
      .string()
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase, hyphen-separated (kebab-case).'),
    description: z.string().min(1),
    category: z.string(),
    subcategory: z.string(),
    tags: z.array(z.string()).default([]),
    // ISO 8601 duration, e.g. "PT08M15S".
    duration: z
      .string()
      .regex(/^PT(?:\d+H)?(?:\d+M)?(?:\d+S)?$/, 'Duration must be ISO 8601, e.g. PT08M15S.'),
    // Accepts any date-ish string; normalised to a full ISO timestamp.
    publishedDate: z.coerce.date().transform((d) => d.toISOString()),
    // Media host that serves the embeddable player.
    // 'auto' (default) derives the provider from the embed URL host at build time.
    provider: z.enum(['auto', 'streama2z', 'lulustream']).default('auto'),
    streamEmbedUrl: z.url(),
    thumbnailUrl: z.url(),
    // Optional: some players expose a poster distinct from the thumbnail.
    posterUrl: z.url().optional(),
    featured: z.boolean().default(false),
  }),
});

export const collections = {
  videos: videoCollection,
};
