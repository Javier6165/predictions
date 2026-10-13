/**
 * Placeholder photography (Pexels License: free to use, no attribution required —
 * credited anyway in docs/PHOTO_CREDITS.md). Temporary until the bespoke art pass.
 * Every image was checked by eye: no recognisable people, logos, readable text or
 * identifiable institutions, so nothing implies a real event behind a demo market.
 */
import { CATEGORIES, type CategoryArt } from './categories';

export interface Photo {
  /** ~1400px wide, for heroes and large cards. */
  src: string;
  /** ~480px wide, for thumbnails and rows. */
  srcSm: string;
  /** Focal point for object-position (CSS), e.g. '50% 40%'. */
  position: string;
}

const files = import.meta.glob<string>('../assets/photos/*.webp', { eager: true, query: '?url', import: 'default' });

const byKey = new Map<string, Partial<Photo>>();
for (const [path, url] of Object.entries(files)) {
  const name = path.split('/').pop()!.replace(/\.webp$/, '');
  const small = name.endsWith('-sm');
  const key = small ? name.slice(0, -3) : name;
  const entry = byKey.get(key) ?? {};
  if (small) entry.srcSm = url;
  else entry.src = url;
  byKey.set(key, entry);
}

/** Per-photo focal points where the subject is off-centre. */
const POSITION: Record<string, string> = {};

/** Scene seeds that should borrow another photo. */
const ALIASES: Record<string, string> = {};

const CATEGORY_SLUGS = new Set(CATEGORIES.map((c) => c.slug));

function get(key: string): Photo | undefined {
  const e = byKey.get(key);
  if (!e?.src) return undefined;
  return { src: e.src, srcSm: e.srcSm ?? e.src, position: POSITION[key] ?? '50% 50%' };
}

/** Photo for a scene seed (market id, category slug or named slot), if one exists. */
export function photoFor(seed: string, art: CategoryArt): Photo | undefined {
  const key = ALIASES[seed] ?? seed;
  return get(key) ?? (CATEGORY_SLUGS.has(seed) ? get(`cat-${art}`) : undefined);
}
