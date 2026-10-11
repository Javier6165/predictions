/** Derived values. Never persisted; always recomputed from the single user state. */
import type { Catalog } from '@/data/fixtures';
import { PAYOUT_CENTS, findOutcome, marketFor, markCents, quoteFor } from './quotes';
import type { LimitOrder, Market, Position, Side, UserState } from './types';

export function reservedCents(state: Pick<UserState, 'orders'>): number {
  return state.orders.reduce((sum, o) => (o.status === 'OPEN' ? sum + o.reservedCashCents : sum), 0);
}

export function availableCents(state: Pick<UserState, 'orders' | 'cashTotalCents'>): number {
  return state.cashTotalCents - reservedCents(state);
}

export interface PositionView {
  position: Position;
  market: Market;
  markCents: number;
  /** qty × mark: estimated value, not what a sale would return. */
  markedValueCents: number;
  /** qty × bid: what selling everything now would return (null when not tradable). */
  liquidationValueCents: number | null;
  bidCents: number | null;
  askCents: number | null;
  unrealizedPnLCents: number;
  /** Exact average entry (may be fractional cents). */
  averagePriceCents: number;
  payoutIfRightCents: number;
  profitIfRightCents: number;
}

export function positionView(state: UserState, catalog: Catalog, position: Position): PositionView | null {
  const base = catalog.byId.get(position.marketId);
  if (!base) return null;
  const market = marketFor(state, base);
  const mark = markCents(market, position.outcomeId, position.side);
  const outcome = findOutcome(market, position.outcomeId);
  const quote = outcome ? quoteFor(outcome, position.side) : null;
  const tradable = market.status === 'OPEN' && quote !== null;
  const markedValueCents = position.quantity * mark;
  const payoutIfRightCents = position.quantity * PAYOUT_CENTS;
  return {
    position,
    market,
    markCents: mark,
    markedValueCents,
    liquidationValueCents: tradable && quote ? position.quantity * quote.bidCents : null,
    bidCents: tradable && quote ? quote.bidCents : null,
    askCents: tradable && quote ? quote.askCents : null,
    unrealizedPnLCents: markedValueCents - position.costBasisCents,
    averagePriceCents: position.costBasisCents / position.quantity,
    payoutIfRightCents,
    profitIfRightCents: payoutIfRightCents - position.costBasisCents,
  };
}

export function positionViews(state: UserState, catalog: Catalog): PositionView[] {
  return state.positions
    .map((p) => positionView(state, catalog, p))
    .filter((v): v is PositionView => v !== null)
    .sort((a, b) => b.markedValueCents - a.markedValueCents);
}

export interface PortfolioSummary {
  cashTotalCents: number;
  reservedCents: number;
  availableCents: number;
  positionsMarkedCents: number;
  positionsCostCents: number;
  portfolioValueCents: number;
  unrealizedPnLCents: number;
  realizedPnLCents: number;
  totalPnLCents: number;
  depositsCents: number;
  openPositions: number;
  openOrders: number;
}

export function portfolioSummary(state: UserState, catalog: Catalog): PortfolioSummary {
  const views = positionViews(state, catalog);
  const positionsMarkedCents = views.reduce((s, v) => s + v.markedValueCents, 0);
  const positionsCostCents = views.reduce((s, v) => s + v.position.costBasisCents, 0);
  const unrealizedPnLCents = positionsMarkedCents - positionsCostCents;
  const reserved = reservedCents(state);
  return {
    cashTotalCents: state.cashTotalCents,
    reservedCents: reserved,
    availableCents: state.cashTotalCents - reserved,
    positionsMarkedCents,
    positionsCostCents,
    portfolioValueCents: state.cashTotalCents + positionsMarkedCents,
    unrealizedPnLCents,
    realizedPnLCents: state.realizedPnLCents,
    totalPnLCents: state.realizedPnLCents + unrealizedPnLCents,
    depositsCents: state.depositsCents,
    openPositions: views.length,
    openOrders: state.orders.filter((o) => o.status === 'OPEN').length,
  };
}

export function openOrders(state: UserState): LimitOrder[] {
  return state.orders.filter((o) => o.status === 'OPEN').sort((a, b) => b.seq - a.seq);
}

export function positionFor(state: UserState, marketId: string, outcomeId: string, side: Side): Position | undefined {
  return state.positions.find((p) => p.marketId === marketId && p.outcomeId === outcomeId && p.side === side);
}

export function unreadCount(state: UserState): number {
  return state.notifications.filter((n) => !n.readAt).length;
}

/** YES probability series for an outcome (NO is the complement point by point). */
export function chartSeries(market: Market, outcomeId: string, side: Side = 'YES') {
  return market.chartPoints.map((p) => {
    const yes = p.probabilityCentsByOutcome[outcomeId] ?? 0;
    return { at: p.at, value: side === 'YES' ? yes : PAYOUT_CENTS - yes };
  });
}

/** Change in percentage points between the last two snapshots (≈ 7 days in the fixture). */
export function changePp(market: Market, outcomeId: string, side: Side = 'YES'): number {
  const s = chartSeries(market, outcomeId, side);
  if (s.length < 2) return 0;
  // The live (possibly re-quoted) probability is the true endpoint.
  const outcome = findOutcome(market, outcomeId);
  const last = outcome ? (side === 'YES' ? outcome.probabilityCents : PAYOUT_CENTS - outcome.probabilityCents) : s[s.length - 1].value;
  return last - s[s.length - 2].value;
}

/** Headline outcome for list views: the binary YES, or the leading multi-outcome option. */
export function leadOutcome(market: Market) {
  return [...market.outcomes].sort((a, b) => b.probabilityCents - a.probabilityCents)[0];
}

export function biggestMove(market: Market): number {
  return Math.max(...market.outcomes.map((o) => Math.abs(changePp(market, o.id))));
}
