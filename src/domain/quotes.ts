import type { Market, MarketOverride, Outcome, Quote, Side, UserState } from './types';

export const PAYOUT_CENTS = 100;
export const FEES_CENTS = 0;

/** Market as the user currently sees it: fixture + deterministic scenario overrides. */
export function effectiveMarket(base: Market, ov: MarketOverride | undefined): Market {
  if (!ov) return base;
  let outcomes: Outcome[] = base.outcomes;
  if (ov.quotes) {
    outcomes = outcomes.map((o) => {
      const q = ov.quotes?.[o.id];
      return q ? { ...o, yesQuote: q.yesQuote, noQuote: q.noQuote, probabilityCents: q.probabilityCents } : o;
    });
  }
  if (ov.removeQuotes || ov.resolution) {
    outcomes = outcomes.map((o) => ({ ...o, yesQuote: null, noQuote: null }));
  }
  const m: Market = { ...base, outcomes };
  if (ov.status) m.status = ov.status;
  if (ov.liquidity) m.liquidity = ov.liquidity;
  if (ov.resolution) {
    m.status = 'RESOLVED';
    m.resolvedAt = ov.resolution.resolvedAt;
    m.winningOutcomeId = ov.resolution.yesOutcomeIds[0];
    m.liquidity = { maxBuy: 0, maxSell: 0 };
  }
  return m;
}

export function marketFor(state: Pick<UserState, 'marketOverrides'>, base: Market): Market {
  return effectiveMarket(base, state.marketOverrides[base.id]);
}

export function findOutcome(market: Market, outcomeId: string): Outcome | undefined {
  return market.outcomes.find((o) => o.id === outcomeId);
}

export function quoteFor(outcome: Outcome, side: Side): Quote | null {
  return side === 'YES' ? outcome.yesQuote : outcome.noQuote;
}

/** Indicative probability (0..100) for a proposition. Used for display and marking only. */
export function probabilityFor(outcome: Outcome, side: Side): number {
  const q = quoteFor(outcome, side);
  if (q) return q.indicativeCents;
  return side === 'YES' ? outcome.probabilityCents : PAYOUT_CENTS - outcome.probabilityCents;
}

/** Mark price used to value a held position. Never ask or bid. */
export function markCents(market: Market, outcomeId: string, side: Side): number {
  const o = findOutcome(market, outcomeId);
  if (!o) return 0;
  return probabilityFor(o, side);
}

export type TradeBlock =
  | 'NOT_OPEN'
  | 'SUSPENDED'
  | 'CLOSED'
  | 'PENDING_RESOLUTION'
  | 'RESOLVED'
  | 'VOIDED'
  | 'UPCOMING'
  | 'NO_QUOTE';

/** Why a market cannot be traded right now, or null when it can. */
export function tradeBlock(market: Market): TradeBlock | null {
  switch (market.status) {
    case 'OPEN':
      return market.outcomes.every((o) => o.yesQuote && o.noQuote) ? null : 'NO_QUOTE';
    case 'SUSPENDED':
    case 'CLOSED':
    case 'PENDING_RESOLUTION':
    case 'RESOLVED':
    case 'VOIDED':
    case 'UPCOMING':
      return market.status;
    default:
      return 'NOT_OPEN';
  }
}

export const TRADE_BLOCK_COPY: Record<TradeBlock, string> = {
  NOT_OPEN: 'This market is not open for trading.',
  SUSPENDED: 'Trading is paused on this market in the demo scenario. Your holdings are kept.',
  CLOSED: 'This market has closed. Trading has ended while it awaits resolution.',
  PENDING_RESOLUTION: 'This market has closed and is awaiting its demo resolution. Trading has ended.',
  RESOLVED: 'This market is resolved. Contracts have been settled and can no longer be traded.',
  VOIDED: 'This market was voided. No new trades are possible.',
  UPCOMING: 'This market has not opened yet.',
  NO_QUOTE: 'No executable demo price is available right now.',
};
