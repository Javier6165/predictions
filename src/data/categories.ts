export type CategoryArt =
  | 'politics'
  | 'sports'
  | 'crypto'
  | 'tech'
  | 'economy'
  | 'entertainment'
  | 'global'
  | 'science';

export interface CategoryMeta {
  /** Exact category name used in the fixture. */
  name: string;
  slug: string;
  shortName: string;
  description: string;
  art: CategoryArt;
}

/** Display order follows the approved Home/Explore references. */
export const CATEGORIES: CategoryMeta[] = [
  { name: 'Politics', slug: 'politics', shortName: 'Politics', description: 'Elections, governments, policy and public affairs.', art: 'politics' },
  { name: 'Sports', slug: 'sports', shortName: 'Sports', description: 'Leagues, teams, athletes and major tournaments.', art: 'sports' },
  { name: 'Crypto', slug: 'crypto', shortName: 'Crypto', description: 'Digital assets, price thresholds and regulation.', art: 'crypto' },
  { name: 'Tech & AI', slug: 'tech-ai', shortName: 'Tech & AI', description: 'Products, AI models and the future of technology.', art: 'tech' },
  { name: 'Economy & Finance', slug: 'economy', shortName: 'Economy', description: 'Rates, inflation, commodities and macro signals.', art: 'economy' },
  { name: 'Entertainment', slug: 'entertainment', shortName: 'Entertainment', description: 'Music, film, festivals and culture.', art: 'entertainment' },
  { name: 'Global Events', slug: 'global', shortName: 'Global Events', description: 'Summits, diplomacy and world affairs.', art: 'global' },
  { name: 'Science & Climate', slug: 'science', shortName: 'Science', description: 'Space, discovery and the climate.', art: 'science' },
];

export const categoryBySlug = (slug: string | null | undefined) => CATEGORIES.find((c) => c.slug === slug);
export const categoryByName = (name: string) => CATEGORIES.find((c) => c.name === name) ?? CATEGORIES[0];
