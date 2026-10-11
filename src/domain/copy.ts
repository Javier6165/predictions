import { PROPOSITIONS } from '@/data/propositions';
import type { Market, Side } from './types';

/** Exact natural-language proposition for a contract (market + outcome + side). */
export function proposition(market: Market, outcomeId: string, side: Side): string {
  const entry = PROPOSITIONS[market.id];
  if (entry?.kind === 'binary') return side === 'YES' ? entry.yes : entry.no;
  if (entry?.kind === 'multi') {
    const pair = entry.byOutcome[outcomeId];
    if (pair) return side === 'YES' ? pair.yes : pair.no;
  }
  // Fallback keeps the contract explicit rather than guessing a sentence.
  const outcome = market.outcomes.find((o) => o.id === outcomeId);
  const label = market.type === 'MULTI_OUTCOME' && outcome ? `“${outcome.label}”` : 'YES';
  return side === 'YES'
    ? `${market.question} — resolves ${label}.`
    : `${market.question} — does not resolve ${label}.`;
}

/** Short side label for secondary details, e.g. "Yes · Real Madrid". */
export function contractLabel(market: Market, outcomeId: string, side: Side): string {
  const sideLabel = side === 'YES' ? 'Yes' : 'No';
  if (market.type !== 'MULTI_OUTCOME') return sideLabel;
  const o = market.outcomes.find((x) => x.id === outcomeId);
  return `${sideLabel} · ${o?.label ?? outcomeId}`;
}

/** Strip the trailing period so sentences can be embedded in other copy. */
export function bare(sentence: string): string {
  return sentence.replace(/[.?!]+$/, '');
}
