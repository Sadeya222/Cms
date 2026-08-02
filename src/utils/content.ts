/**
 * Pure, build-time utility functions. No runtime dependencies, no side effects.
 */

/**
 * Embed providers supported by the platform.
 *
 * Media is offloaded to third-party hosts; StreamVault only embeds their
 * players. Each provider entry centralises the display name, host detection
 * rules, and the accent colour used across the UI.
 */
export interface EmbedProvider {
  id: 'streama2z' | 'lulustream' | 'other';
  label: string;
  domain: string;
  color: string;
}

export const EMBED_PROVIDERS: Record<'streama2z' | 'lulustream', EmbedProvider> = {
  streama2z: {
    id: 'streama2z',
    label: 'StreamA2Z',
    domain: 'streama2z.com',
    color: '#5b8cff',
  },
  lulustream: {
    id: 'lulustream',
    label: 'LuluStream',
    domain: 'lulustream.com',
    color: '#35d0a5',
  },
};

/**
 * Resolve the embed provider for a video.
 *
 * An explicit `provider` field wins; otherwise the host of `streamEmbedUrl` is
 * inspected (with `www.` normalised away) so content stays valid even when the
 * provider field is omitted.
 */
export function resolveProvider(provider: string | undefined, embedUrl: string): EmbedProvider {
  const explicit =
    provider && provider !== 'auto'
      ? EMBED_PROVIDERS[provider as keyof typeof EMBED_PROVIDERS]
      : undefined;
  if (explicit) return explicit;

  let host = '';
  try {
    host = new URL(embedUrl).hostname.replace(/^www\./, '').toLowerCase();
  } catch {
    host = '';
  }
  for (const p of Object.values(EMBED_PROVIDERS)) {
    if (host === p.domain || host.endsWith(`.${p.domain}`)) return p;
  }
  // Unknown host — fall back to a neutral presentation.
  return { id: 'other', label: 'External', domain: host || '', color: '#9aa6be' };
}

/**
 * Convert an ISO 8601 duration (e.g. "PT1H08M15S") into a human label
 * ("1:08:15") and a total-seconds count. Used for UI + VideoObject schema.
 */
export function parseISODuration(iso: string): { label: string; seconds: number } {
  const match = /^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/.exec(iso || '');
  if (!match) return { label: '', seconds: 0 };
  const [, h, m, s] = match.map((x) => (x ? Number(x) : 0));
  const seconds = h * 3600 + m * 60 + s;
  const pad = (n: number) => String(n).padStart(2, '0');
  const label = h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
  return { label, seconds };
}

/** URL-safe category slug (Technology -> technology). */
export function categorySlug(category: string): string {
  return String(category)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Format an ISO timestamp for display, locale-stable across build machines. */
export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

/** Minimal structural shape a video must satisfy for relation scoring. */
export interface VideoLike {
  id: string;
  category: string;
  subcategory?: string;
  tags?: string[];
  publishedDate: string;
}

/**
 * Static Graph Relation Matching (Related Videos Engine).
 *
 * Replaces runtime DB joins / vector similarity with a deterministic, build-time
 * relevance score:
 *   +5  same subcategory
 *   +3  same primary category
 *   +2  per shared tag
 * Ties break by most-recent publishedDate for freshness.
 */
export function findRelated<T extends VideoLike>(current: T, all: T[], limit = 6): T[] {
  const currentTags = new Set((current.tags || []).map((t) => t.toLowerCase()));

  return all
    .filter((v) => v.id !== current.id)
    .map((v) => {
      let score = 0;
      if (v.category === current.category) score += 3;
      if (v.subcategory === current.subcategory) score += 5;
      for (const tag of v.tags || []) {
        if (currentTags.has(tag.toLowerCase())) score += 2;
      }
      return { video: v, score };
    })
    .filter((x) => x.score > 0)
    .sort(
      (a, b) =>
        b.score - a.score ||
        new Date(b.video.publishedDate).getTime() - new Date(a.video.publishedDate).getTime()
    )
    .slice(0, limit)
    .map((x) => x.video);
}

/** Truncate text for meta descriptions / cards without breaking words. */
export function truncate(text: string, max = 160): string {
  if (!text || text.length <= max) return text;
  return text.slice(0, text.lastIndexOf(' ', max)).trimEnd() + '…';
}
