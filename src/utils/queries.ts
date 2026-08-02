/**
 * Central data-access layer over the flat-file content collection.
 * Every page imports from here so sorting/normalisation logic lives in one place.
 */
import { getCollection, type CollectionEntry } from 'astro:content';
import { categorySlug } from './content.js';

/** A fully validated video record (Zod schema in src/content.config.ts). */
export type Video = CollectionEntry<'videos'>['data'];

/**
 * Return all videos flattened to their data payload, sorted newest-first.
 * Cached within a single build via module scope.
 */
let _cache: Video[] | null = null;
export async function getAllVideos(): Promise<Video[]> {
  if (_cache) return _cache;
  const entries = await getCollection('videos');
  _cache = entries
    .map((entry) => ({ ...entry.data }))
    .sort((a, b) => new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime());
  return _cache;
}

/** Distinct category names, preserving first-seen order. */
export async function getCategories(): Promise<string[]> {
  const videos = await getAllVideos();
  return [...new Set(videos.map((v) => v.category))];
}

export interface CategoryIndexEntry {
  name: string;
  slug: string;
  count: number;
}

/** Map of categorySlug -> { name, count }. */
export async function getCategoryIndex(): Promise<CategoryIndexEntry[]> {
  const videos = await getAllVideos();
  const map = new Map<string, CategoryIndexEntry>();
  for (const v of videos) {
    const slug = categorySlug(v.category);
    const existing = map.get(slug) || { name: v.category, slug, count: 0 };
    existing.count += 1;
    map.set(slug, existing);
  }
  return [...map.values()].sort((a, b) => a.name.localeCompare(b.name));
}

/** Featured videos for the homepage hero rail (falls back to newest). */
export async function getFeatured(limit = 6): Promise<Video[]> {
  const videos = await getAllVideos();
  const featured = videos.filter((v) => v.featured);
  return (featured.length ? featured : videos).slice(0, limit);
}
