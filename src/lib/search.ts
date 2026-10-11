import { categoryByName } from '@/data/categories';
import { PROPOSITIONS } from '@/data/propositions';
import type { Market } from '@/domain/types';

function haystack(m: Market): string {
  const entry = PROPOSITIONS[m.id];
  const props =
    entry?.kind === 'binary'
      ? [entry.yes]
      : entry?.kind === 'multi'
        ? Object.values(entry.byOutcome).map((p) => p.yes)
        : [];
  return [m.question, m.title, m.category, categoryByName(m.category).shortName, ...m.tags, ...m.outcomes.map((o) => o.label), ...props]
    .join(' ')
    .toLowerCase();
}

/** Simple, deterministic multi-word search over questions, tags, outcomes and propositions. */
export function searchMarkets(markets: Market[], query: string): Market[] {
  const words = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];
  return markets
    .map((m) => {
      const h = haystack(m);
      if (!words.every((w) => h.includes(w))) return null;
      const titleHit = words.filter((w) => m.question.toLowerCase().includes(w)).length;
      return { m, score: titleHit * 100 + m.activity.trendingScore };
    })
    .filter((x): x is { m: Market; score: number } => x !== null)
    .sort((a, b) => b.score - a.score)
    .map((x) => x.m);
}
