/**
 * Photography: the key images are generated for the project with Higgsfield Soul 2.0
 * (fictional people and events); the rest are Pexels placeholders (Pexels License).
 * Sources per key in docs/PHOTO_CREDITS.md.
 * Every image was checked by eye (no real politicians or celebrities).
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
const POSITION: Record<string, string> = {
  'hero-space': '80% 62%',
  'mars-2035': '58% 60%',
  'marlowe-election-2028': '28% 30%',
  'music-tour-2027': '50% 40%',
  'cat-entertainment': '55% 40%',
  'film-award-2027': '45% 25%',
  'peace-talks-2027': '68% 55%',
  'cat-global': '50% 72%',
  'cat-politics': '50% 45%',
  'nba-2027': '40% 30%',
  'midterm-turnout-2026': '55% 40%',
  'apple-foldable-2027': '35% 40%',
  'world-cup-2027': '50% 40%',
  'exoplanet-2027': '35% 60%',
};

/** Scene seeds that should borrow another photo. */
const ALIASES: Record<string, string> = {
  hero: 'hero-space',
  'insights-dunes': 'exoplanet-2027',
};

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
