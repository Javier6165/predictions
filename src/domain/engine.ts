/**
 * Pure trading engine. Every function takes the current user state and returns
 * a new state (never mutating the input). Components never compute money.
 *
 * Accounting identities (see docs/IMPLEMENTATION_CONTRACT.md §3):
 *   cashTotal      = Σ ledger.cashDelta
 *   reserved       = Σ OPEN limit orders' reservedCashCents
 *   available      = cashTotal − reserved
 *   portfolioValue = cashTotal + Σ qty × mark
 *   portfolioValue − deposits = realized + unrealized
 */
import type { Catalog } from '@/data/fixtures';
import { bare, proposition } from './copy';
import { FEES_CENTS, PAYOUT_CENTS, findOutcome, marketFor, quoteFor, tradeBlock, type TradeBlock } from './quotes';
import type {
  AppNotification,
  LedgerEntry,
  LimitOrder,
  Market,
  NotificationKind,
  Position,
  Quote,
  Side,
  UserState,
} from './types';
import { availableCents } from './selectors';
import { formatMoney, formatPrice } from '@/lib/format';

export type EngineError =
  | { code: 'UNKNOWN_MARKET' }
  | { code: 'UNKNOWN_OUTCOME' }
  | { code: 'MARKET_NOT_TRADABLE'; block: TradeBlock }
  | { code: 'INVALID_QUANTITY' }
  | { code: 'BUDGET_BELOW_PRICE'; askCents: number }
  | { code: 'INSUFFICIENT_FUNDS'; requiredCents: number; availableCents: number }
  | { code: 'INSUFFICIENT_LIQUIDITY'; maxQuantity: number }
  | { code: 'INSUFFICIENT_POSITION'; heldQuantity: number }
  | { code: 'UNKNOWN_POSITION' }
  | { code: 'QUOTE_CHANGED'; previousCents: number; currentCents: number }
  | { code: 'INVALID_LIMIT_PRICE'; askCents: number }
  | { code: 'UNKNOWN_ORDER' }
  | { code: 'ORDER_NOT_OPEN' }
  | { code: 'INVALID_AMOUNT' }
  | { code: 'ALREADY_RESOLVED' };

export type EngineResult<R> =
  | { ok: true; state: UserState; receipt: R; duplicate?: boolean }
  /** `state` is present when the failed attempt still changed visible state (e.g. a re-quote). */
  | { ok: false; error: EngineError; state?: UserState };

export interface BuyIntent {
  intentId: string;
  marketId: string;
  outcomeId: string;
  side: Side;
  quantity: number;
  /** Ask the user reviewed. Confirm fails with QUOTE_CHANGED if it moved. */
  expectedAskCents: number;
}

export interface SellIntent {
  intentId: string;
  positionId: string;
  quantity: number;
  expectedBidCents: number;
}

export interface LimitIntent {
  intentId: string;
  marketId: string;
  outcomeId: string;
  side: Side;
  quantity: number;
  limitPriceCents: number;
}

export interface TradeReceipt {
  ledgerId: string;
  positionId: string | null;
  marketId: string;
  outcomeId: string;
  side: Side;
  quantity: number;
  priceCents: number;
  /** Cash paid (buy) or received (sell), always positive. */
  amountCents: number;
  realizedPnLCents?: number;
  remainingQuantity?: number;
}

const isPositiveInt = (n: number) => Number.isInteger(n) && n > 0;

function nextSeq(state: UserState): [UserState, number] {
  const seq = state.seq + 1;
  return [{ ...state, seq }, seq];
}

function notify(
  state: UserState,
  catalog: Catalog,
  kind: NotificationKind,
  title: string,
  text: string,
  targetPath: string,
): UserState {
  const [s, seq] = nextSeq(state);
  const n: AppNotification = {
    id: `n-${seq}`,
    kind,
    title,
    text,
    targetPath,
    createdAt: catalog.displayAsOf,
    seq,
    readAt: null,
  };
  return { ...s, notifications: [n, ...s.notifications] };
}

function resolveMarket(state: UserState, catalog: Catalog, marketId: string): Market | null {
  const base = catalog.byId.get(marketId);
  return base ? marketFor(state, base) : null;
}

/** Fire any scenario-armed price change for this market (deterministic, explicit). */
function fireArmedQuoteChanges(state: UserState, marketId: string): UserState {
  const armed = state.armedQuoteChanges.filter((a) => a.marketId === marketId);
  if (armed.length === 0) return state;
  const overrides = { ...state.marketOverrides };
  for (const a of armed) {
    const prev = overrides[a.marketId] ?? {};
    overrides[a.marketId] = {
      ...prev,
      quotes: {
        ...prev.quotes,
        [a.outcomeId]: { yesQuote: a.yesQuote, noQuote: a.noQuote, probabilityCents: a.yesQuote.indicativeCents },
      },
    };
  }
  return {
    ...state,
    marketOverrides: overrides,
    armedQuoteChanges: state.armedQuoteChanges.filter((a) => a.marketId !== marketId),
  };
}

function duplicateReceipt(state: UserState, intentId: string): TradeReceipt | null {
  const ledgerId = state.processedIntents[intentId];
  if (!ledgerId) return null;
  const e = state.ledger.find((l) => l.id === ledgerId);
  if (!e || !e.marketId || !e.outcomeId || !e.side) return null;
  const pos = state.positions.find(
    (p) => p.marketId === e.marketId && p.outcomeId === e.outcomeId && p.side === e.side,
  );
  return {
    ledgerId: e.id,
    positionId: pos?.id ?? null,
    marketId: e.marketId,
    outcomeId: e.outcomeId,
    side: e.side,
    quantity: e.quantity ?? 0,
    priceCents: e.priceCents ?? 0,
    amountCents: Math.abs(e.cashDeltaCents),
    realizedPnLCents: e.realizedPnLCents,
    remainingQuantity: pos?.quantity ?? 0,
  };
}

// ───────────────────────────── Buy ─────────────────────────────

export interface BuyQuotePreview {
  quantity: number;
  askCents: number;
  costCents: number;
  unusedCents: number;
  payoutIfRightCents: number;
  profitIfRightCents: number;
  maxLossCents: number;
  feesCents: number;
}

/** Contracts a dollar budget buys at the ask: floor(budget / ask). */
export function quoteBuyByBudget(budgetCents: number, askCents: number): BuyQuotePreview {
  const quantity = askCents > 0 && budgetCents > 0 ? Math.floor(budgetCents / askCents) : 0;
  return buyPreview(quantity, askCents, budgetCents);
}

export function buyPreview(quantity: number, askCents: number, budgetCents = quantity * askCents): BuyQuotePreview {
  const costCents = quantity * askCents + FEES_CENTS;
  const payoutIfRightCents = quantity * PAYOUT_CENTS;
  return {
    quantity,
    askCents,
    costCents,
    unusedCents: Math.max(0, budgetCents - costCents),
    payoutIfRightCents,
    profitIfRightCents: payoutIfRightCents - costCents,
    maxLossCents: costCents,
    feesCents: FEES_CENTS,
  };
}

/** Validate a buy without changing state. Used by the ticket before Review. */
export function validateBuy(
  state: UserState,
  catalog: Catalog,
  marketId: string,
  outcomeId: string,
  side: Side,
  quantity: number,
): { ok: true; quote: Quote } | { ok: false; error: EngineError } {
  const market = resolveMarket(state, catalog, marketId);
  if (!market) return { ok: false, error: { code: 'UNKNOWN_MARKET' } };
  const outcome = findOutcome(market, outcomeId);
  if (!outcome) return { ok: false, error: { code: 'UNKNOWN_OUTCOME' } };
  const block = tradeBlock(market);
  if (block) return { ok: false, error: { code: 'MARKET_NOT_TRADABLE', block } };
  const quote = quoteFor(outcome, side);
  if (!quote) return { ok: false, error: { code: 'MARKET_NOT_TRADABLE', block: 'NO_QUOTE' } };
  if (!isPositiveInt(quantity)) return { ok: false, error: { code: 'INVALID_QUANTITY' } };
  const cost = quantity * quote.askCents + FEES_CENTS;
  const available = availableCents(state);
  // Funds first: it's the more actionable message when both limits are exceeded.
  if (cost > available)
    return { ok: false, error: { code: 'INSUFFICIENT_FUNDS', requiredCents: cost, availableCents: available } };
  if (quantity > market.liquidity.maxBuy)
    return { ok: false, error: { code: 'INSUFFICIENT_LIQUIDITY', maxQuantity: market.liquidity.maxBuy } };
  return { ok: true, quote };
}

export function executeBuy(state0: UserState, catalog: Catalog, intent: BuyIntent): EngineResult<TradeReceipt> {
  const dup = duplicateReceipt(state0, intent.intentId);
  if (dup) return { ok: true, state: state0, receipt: dup, duplicate: true };

  const state = fireArmedQuoteChanges(state0, intent.marketId);
  const requoted = state !== state0;
  const check = validateBuy(state, catalog, intent.marketId, intent.outcomeId, intent.side, intent.quantity);
  if (!check.ok) return { ok: false, error: check.error, state: requoted ? state : undefined };
  const ask = check.quote.askCents;
  if (ask !== intent.expectedAskCents) {
    const market = resolveMarket(state, catalog, intent.marketId)!;
    const s = notify(
      state,
      catalog,
      'QUOTE_CHANGED',
      'Price changed before confirmation',
      `The demo price for “${bare(proposition(market, intent.outcomeId, intent.side))}” moved from ${formatPrice(intent.expectedAskCents)} to ${formatPrice(ask)}. Nothing was bought.`,
      `/markets/${intent.marketId}`,
    );
    return { ok: false, error: { code: 'QUOTE_CHANGED', previousCents: intent.expectedAskCents, currentCents: ask }, state: s };
  }

  const cost = intent.quantity * ask + FEES_CENTS;
  const [next, seq] = nextSeq(state);
  let s = next;
  const existing = s.positions.find(
    (p) => p.marketId === intent.marketId && p.outcomeId === intent.outcomeId && p.side === intent.side,
  );
  let positions: Position[];
  let positionId: string;
  if (existing) {
    positionId = existing.id;
    positions = s.positions.map((p) =>
      p.id === existing.id
        ? { ...p, quantity: p.quantity + intent.quantity, costBasisCents: p.costBasisCents + cost }
        : p,
    );
  } else {
    positionId = `pos-u${seq}`;
    positions = [
      ...s.positions,
      {
        id: positionId,
        marketId: intent.marketId,
        outcomeId: intent.outcomeId,
        side: intent.side,
        quantity: intent.quantity,
        costBasisCents: cost,
        openedSeq: seq,
      },
    ];
  }
  const entry: LedgerEntry = {
    id: `ledger-${seq}`,
    kind: 'BUY',
    cashDeltaCents: -cost,
    marketId: intent.marketId,
    outcomeId: intent.outcomeId,
    side: intent.side,
    quantity: intent.quantity,
    priceCents: ask,
    intentId: intent.intentId,
    createdAt: catalog.displayAsOf,
    seq,
  };
  s = {
    ...s,
    cashTotalCents: s.cashTotalCents - cost,
    positions,
    ledger: [...s.ledger, entry],
    processedIntents: { ...s.processedIntents, [intent.intentId]: entry.id },
  };
  const market = resolveMarket(s, catalog, intent.marketId)!;
  s = notify(
    s,
    catalog,
    'ORDER_FILLED',
    'Your prediction is active',
    `You invested ${formatMoney(cost)} in “${bare(proposition(market, intent.outcomeId, intent.side))}”.`,
    `/portfolio?tab=active&position=${positionId}`,
  );
  return {
    ok: true,
    state: s,
    receipt: {
      ledgerId: entry.id,
      positionId,
      marketId: intent.marketId,
      outcomeId: intent.outcomeId,
      side: intent.side,
      quantity: intent.quantity,
      priceCents: ask,
      amountCents: cost,
      remainingQuantity: positions.find((p) => p.id === positionId)?.quantity,
    },
  };
}

// ───────────────────────────── Sell ─────────────────────────────

/**
 * Cost basis allocated to a partial sale. Floors proportionally; selling the
 * whole remaining position allocates the remaining basis, so no cent is lost.
 */
export function allocateBasis(position: Pick<Position, 'quantity' | 'costBasisCents'>, sellQuantity: number): number {
  if (sellQuantity >= position.quantity) return position.costBasisCents;
  return Math.floor((position.costBasisCents * sellQuantity) / position.quantity);
}

export interface SellPreview {
  quantity: number;
  bidCents: number;
  proceedsCents: number;
  allocatedBasisCents: number;
  realizedPnLCents: number;
  remainingQuantity: number;
  remainingBasisCents: number;
  feesCents: number;
}

export function sellPreview(position: Position, quantity: number, bidCents: number): SellPreview {
  const allocated = allocateBasis(position, quantity);
  const proceeds = quantity * bidCents - FEES_CENTS;
  return {
    quantity,
    bidCents,
    proceedsCents: proceeds,
    allocatedBasisCents: allocated,
    realizedPnLCents: proceeds - allocated,
    remainingQuantity: position.quantity - quantity,
    remainingBasisCents: position.costBasisCents - allocated,
    feesCents: FEES_CENTS,
  };
}

export function validateSell(
  state: UserState,
  catalog: Catalog,
  positionId: string,
  quantity: number,
): { ok: true; position: Position; quote: Quote; market: Market } | { ok: false; error: EngineError } {
  const position = state.positions.find((p) => p.id === positionId);
  if (!position) return { ok: false, error: { code: 'UNKNOWN_POSITION' } };
  const market = resolveMarket(state, catalog, position.marketId);
  if (!market) return { ok: false, error: { code: 'UNKNOWN_MARKET' } };
  const block = tradeBlock(market);
  if (block) return { ok: false, error: { code: 'MARKET_NOT_TRADABLE', block } };
  const outcome = findOutcome(market, position.outcomeId);
  const quote = outcome ? quoteFor(outcome, position.side) : null;
  if (!quote) return { ok: false, error: { code: 'MARKET_NOT_TRADABLE', block: 'NO_QUOTE' } };
  if (!isPositiveInt(quantity)) return { ok: false, error: { code: 'INVALID_QUANTITY' } };
  if (quantity > position.quantity)
    return { ok: false, error: { code: 'INSUFFICIENT_POSITION', heldQuantity: position.quantity } };
  if (quantity > market.liquidity.maxSell)
    return { ok: false, error: { code: 'INSUFFICIENT_LIQUIDITY', maxQuantity: market.liquidity.maxSell } };
  return { ok: true, position, quote, market };
}

export function executeSell(state0: UserState, catalog: Catalog, intent: SellIntent): EngineResult<TradeReceipt> {
  const dup = duplicateReceipt(state0, intent.intentId);
  if (dup) return { ok: true, state: state0, receipt: dup, duplicate: true };

  const pos0 = state0.positions.find((p) => p.id === intent.positionId);
  const state = pos0 ? fireArmedQuoteChanges(state0, pos0.marketId) : state0;
  const requoted = state !== state0;
  const check = validateSell(state, catalog, intent.positionId, intent.quantity);
  if (!check.ok) return { ok: false, error: check.error, state: requoted ? state : undefined };
  const { position, quote, market } = check;
  if (quote.bidCents !== intent.expectedBidCents) {
    return {
      ok: false,
      error: { code: 'QUOTE_CHANGED', previousCents: intent.expectedBidCents, currentCents: quote.bidCents },
      state: requoted ? state : undefined,
    };
  }

  const p = sellPreview(position, intent.quantity, quote.bidCents);
  const [next, seq] = nextSeq(state);
  let s = next;
  const positions =
    p.remainingQuantity === 0
      ? s.positions.filter((x) => x.id !== position.id)
      : s.positions.map((x) =>
          x.id === position.id ? { ...x, quantity: p.remainingQuantity, costBasisCents: p.remainingBasisCents } : x,
        );
  const entry: LedgerEntry = {
    id: `ledger-${seq}`,
    kind: 'SELL',
    cashDeltaCents: p.proceedsCents,
    marketId: position.marketId,
    outcomeId: position.outcomeId,
    side: position.side,
    quantity: intent.quantity,
    priceCents: quote.bidCents,
    realizedPnLCents: p.realizedPnLCents,
    intentId: intent.intentId,
    createdAt: catalog.displayAsOf,
    seq,
  };
  s = {
    ...s,
    cashTotalCents: s.cashTotalCents + p.proceedsCents,
    realizedPnLCents: s.realizedPnLCents + p.realizedPnLCents,
    positions,
    ledger: [...s.ledger, entry],
    processedIntents: { ...s.processedIntents, [intent.intentId]: entry.id },
  };
  const statement = bare(proposition(market, position.outcomeId, position.side));
  s = notify(
    s,
    catalog,
    'POSITION_SOLD',
    p.remainingQuantity === 0 ? 'Position sold' : 'Part of your position sold',
    `You received ${formatMoney(p.proceedsCents)} for ${intent.quantity} contracts backing “${statement}”.`,
    p.remainingQuantity === 0 ? '/portfolio?tab=history' : `/portfolio?tab=active&position=${position.id}`,
  );
  return {
    ok: true,
    state: s,
    receipt: {
      ledgerId: entry.id,
      positionId: p.remainingQuantity === 0 ? null : position.id,
      marketId: position.marketId,
      outcomeId: position.outcomeId,
      side: position.side,
      quantity: intent.quantity,
      priceCents: quote.bidCents,
      amountCents: p.proceedsCents,
      realizedPnLCents: p.realizedPnLCents,
      remainingQuantity: p.remainingQuantity,
    },
  };
}

// ───────────────────────────── Limit orders ─────────────────────────────

export function validateLimit(
  state: UserState,
  catalog: Catalog,
  i: Omit<LimitIntent, 'intentId'>,
): { ok: true; reserveCents: number; askCents: number } | { ok: false; error: EngineError } {
  const market = resolveMarket(state, catalog, i.marketId);
  if (!market) return { ok: false, error: { code: 'UNKNOWN_MARKET' } };
  const outcome = findOutcome(market, i.outcomeId);
  if (!outcome) return { ok: false, error: { code: 'UNKNOWN_OUTCOME' } };
  const block = tradeBlock(market);
  if (block) return { ok: false, error: { code: 'MARKET_NOT_TRADABLE', block } };
  const quote = quoteFor(outcome, i.side);
  if (!quote) return { ok: false, error: { code: 'MARKET_NOT_TRADABLE', block: 'NO_QUOTE' } };
  if (!isPositiveInt(i.quantity)) return { ok: false, error: { code: 'INVALID_QUANTITY' } };
  // A resting BUY must sit below the current ask; at or above it would be an immediate buy.
  if (!Number.isInteger(i.limitPriceCents) || i.limitPriceCents < 1 || i.limitPriceCents >= quote.askCents)
    return { ok: false, error: { code: 'INVALID_LIMIT_PRICE', askCents: quote.askCents } };
  const reserve = i.quantity * i.limitPriceCents;
  const available = availableCents(state);
  if (reserve > available)
    return { ok: false, error: { code: 'INSUFFICIENT_FUNDS', requiredCents: reserve, availableCents: available } };
  return { ok: true, reserveCents: reserve, askCents: quote.askCents };
}

export function placeLimitBuy(state: UserState, catalog: Catalog, intent: LimitIntent): EngineResult<LimitOrder> {
  const known = state.processedIntents[intent.intentId];
  if (known) {
    const order = state.orders.find((o) => o.id === known);
    if (order) return { ok: true, state, receipt: order, duplicate: true };
  }
  const check = validateLimit(state, catalog, intent);
  if (!check.ok) return check;
  const [next, seq] = nextSeq(state);
  let s = next;
  const order: LimitOrder = {
    id: `order-u${seq}`,
    marketId: intent.marketId,
    outcomeId: intent.outcomeId,
    side: intent.side,
    action: 'BUY',
    type: 'LIMIT',
    limitPriceCents: intent.limitPriceCents,
    requestedQuantity: intent.quantity,
    filledQuantity: 0,
    status: 'OPEN',
    reservedCashCents: check.reserveCents,
    createdAt: catalog.displayAsOf,
    seq,
  };
  const entry: LedgerEntry = {
    id: `ledger-${seq}`,
    kind: 'LIMIT_PLACED',
    cashDeltaCents: 0,
    marketId: intent.marketId,
    outcomeId: intent.outcomeId,
    side: intent.side,
    quantity: intent.quantity,
    priceCents: intent.limitPriceCents,
    orderId: order.id,
    intentId: intent.intentId,
    createdAt: catalog.displayAsOf,
    seq,
  };
  s = {
    ...s,
    orders: [...s.orders, order],
    ledger: [...s.ledger, entry],
    processedIntents: { ...s.processedIntents, [intent.intentId]: order.id },
  };
  const market = resolveMarket(s, catalog, intent.marketId)!;
  s = notify(
    s,
    catalog,
    'LIMIT_PLACED',
    'Limit order placed',
    `${formatMoney(check.reserveCents)} is held for ${intent.quantity} contracts at ${formatPrice(intent.limitPriceCents)} backing “${bare(proposition(market, intent.outcomeId, intent.side))}”. It stays open until you cancel it.`,
    '/portfolio?tab=pending',
  );
  return { ok: true, state: s, receipt: order };
}

export function cancelLimit(state: UserState, catalog: Catalog, orderId: string): EngineResult<LimitOrder> {
  const order = state.orders.find((o) => o.id === orderId);
  if (!order) return { ok: false, error: { code: 'UNKNOWN_ORDER' } };
  if (order.status !== 'OPEN') return { ok: false, error: { code: 'ORDER_NOT_OPEN' } };
  const [next, seq] = nextSeq(state);
  let s = next;
  const released = order.reservedCashCents;
  const cancelled: LimitOrder = { ...order, status: 'CANCELLED', reservedCashCents: 0 };
  s = {
    ...s,
    orders: s.orders.map((o) => (o.id === orderId ? cancelled : o)),
    ledger: [
      ...s.ledger,
      {
        id: `ledger-${seq}`,
        kind: 'LIMIT_CANCELLED',
        cashDeltaCents: 0,
        marketId: order.marketId,
        outcomeId: order.outcomeId,
        side: order.side,
        quantity: order.requestedQuantity,
        priceCents: order.limitPriceCents,
        orderId: order.id,
        createdAt: catalog.displayAsOf,
        seq,
      },
    ],
  };
  s = notify(
    s,
    catalog,
    'LIMIT_CANCELLED',
    'Limit order cancelled',
    `${formatMoney(released)} is available again. No contracts were bought and no fees were charged.`,
    '/portfolio?tab=history',
  );
  return { ok: true, state: s, receipt: cancelled };
}

/**
 * Explicit, deterministic demo event: a seller takes a resting limit BUY at its
 * limit price, in full (no partial fills in P0). The reserve becomes the cost,
 * so available cash is unchanged and cash total drops by exactly qty × limit.
 */
export function fillLimitOrder(state: UserState, catalog: Catalog, orderId: string): EngineResult<TradeReceipt> {
  const order = state.orders.find((o) => o.id === orderId);
  if (!order) return { ok: false, error: { code: 'UNKNOWN_ORDER' } };
  if (order.status !== 'OPEN') return { ok: false, error: { code: 'ORDER_NOT_OPEN' } };
  const market = resolveMarket(state, catalog, order.marketId);
  if (!market) return { ok: false, error: { code: 'UNKNOWN_MARKET' } };
  const block = tradeBlock(market);
  if (block) return { ok: false, error: { code: 'MARKET_NOT_TRADABLE', block } };

  const cost = order.requestedQuantity * order.limitPriceCents;
  const [next, seq] = nextSeq(state);
  let s = next;
  const existing = s.positions.find((p) => p.marketId === order.marketId && p.outcomeId === order.outcomeId && p.side === order.side);
  const positionId = existing?.id ?? `pos-u${seq}`;
  const positions: Position[] = existing
    ? s.positions.map((p) =>
        p.id === existing.id ? { ...p, quantity: p.quantity + order.requestedQuantity, costBasisCents: p.costBasisCents + cost } : p,
      )
    : [
        ...s.positions,
        {
          id: positionId,
          marketId: order.marketId,
          outcomeId: order.outcomeId,
          side: order.side,
          quantity: order.requestedQuantity,
          costBasisCents: cost,
          openedSeq: seq,
        },
      ];
  const entry: LedgerEntry = {
    id: `ledger-${seq}`,
    kind: 'LIMIT_FILLED',
    cashDeltaCents: -cost,
    marketId: order.marketId,
    outcomeId: order.outcomeId,
    side: order.side,
    quantity: order.requestedQuantity,
    priceCents: order.limitPriceCents,
    orderId: order.id,
    createdAt: catalog.displayAsOf,
    seq,
  };
  s = {
    ...s,
    cashTotalCents: s.cashTotalCents - cost,
    positions,
    orders: s.orders.map((o) =>
      o.id === order.id ? { ...o, status: 'FILLED' as const, filledQuantity: o.requestedQuantity, reservedCashCents: 0 } : o,
    ),
    ledger: [...s.ledger, entry],
  };
  s = notify(
    s,
    catalog,
    'ORDER_FILLED',
    'Your limit order filled',
    `${order.requestedQuantity} contracts at your ${formatPrice(order.limitPriceCents)} limit — you’re now backing “${bare(proposition(market, order.outcomeId, order.side))}”.`,
    `/portfolio?tab=active&position=${positionId}`,
  );
  return {
    ok: true,
    state: s,
    receipt: {
      ledgerId: entry.id,
      positionId,
      marketId: order.marketId,
      outcomeId: order.outcomeId,
      side: order.side,
      quantity: order.requestedQuantity,
      priceCents: order.limitPriceCents,
      amountCents: cost,
      remainingQuantity: positions.find((p) => p.id === positionId)?.quantity,
    },
  };
}

// ───────────────────────────── Funds ─────────────────────────────

export const DEMO_TOP_UPS_CENTS = [25000, 50000, 100000] as const;

/** Virtual top-up. Increases cash and deposits, never P&L. */
export function addDemoFunds(state: UserState, catalog: Catalog, amountCents: number): EngineResult<LedgerEntry> {
  if (!isPositiveInt(amountCents) || amountCents > 1_000_000) return { ok: false, error: { code: 'INVALID_AMOUNT' } };
  const [next, seq] = nextSeq(state);
  let s = next;
  const entry: LedgerEntry = {
    id: `ledger-${seq}`,
    kind: 'DEPOSIT',
    cashDeltaCents: amountCents,
    createdAt: catalog.displayAsOf,
    seq,
  };
  s = {
    ...s,
    cashTotalCents: s.cashTotalCents + amountCents,
    depositsCents: s.depositsCents + amountCents,
    ledger: [...s.ledger, entry],
  };
  s = notify(
    s,
    catalog,
    'FUNDS_ADDED',
    'Demo funds added',
    `${formatMoney(amountCents)} of virtual money was added. Top-ups are not counted as profit.`,
    '/portfolio',
  );
  return { ok: true, state: s, receipt: entry };
}

// ───────────────────────────── Settlement ─────────────────────────────

export interface SettledPosition {
  positionId: string;
  outcomeId: string;
  side: Side;
  quantity: number;
  costBasisCents: number;
  payoutCents: number;
  realizedPnLCents: number;
  won: boolean;
}

export interface SettlementReceipt {
  marketId: string;
  yesOutcomeIds: string[];
  payoutCents: number;
  realizedPnLCents: number;
  settled: SettledPosition[];
}

/**
 * Settle a market once. A position wins if (YES and its outcome is a winner) or
 * (NO and its outcome is not a winner). Winners receive qty × 100¢, losers 0¢.
 * Open limit orders on the market are cancelled and their reserves released.
 */
export function settleMarket(
  state: UserState,
  catalog: Catalog,
  marketId: string,
  yesOutcomeIds: string[],
): EngineResult<SettlementReceipt> {
  const base = catalog.byId.get(marketId);
  if (!base) return { ok: false, error: { code: 'UNKNOWN_MARKET' } };
  const current = marketFor(state, base);
  if (current.status === 'RESOLVED' || state.marketOverrides[marketId]?.resolution)
    return { ok: false, error: { code: 'ALREADY_RESOLVED' } };
  for (const id of yesOutcomeIds) if (!findOutcome(current, id)) return { ok: false, error: { code: 'UNKNOWN_OUTCOME' } };

  let s = state;
  let totalPayout = 0;
  let totalRealized = 0;
  const settled: SettledPosition[] = [];
  // Release open orders first so reserves are never double counted.
  for (const o of s.orders.filter((x) => x.marketId === marketId && x.status === 'OPEN')) {
    const r = cancelLimit(s, catalog, o.id);
    if (r.ok) s = r.state;
  }
  for (const p of s.positions.filter((x) => x.marketId === marketId)) {
    const wins = p.side === 'YES' ? yesOutcomeIds.includes(p.outcomeId) : !yesOutcomeIds.includes(p.outcomeId);
    const payout = wins ? p.quantity * PAYOUT_CENTS : 0;
    const realized = payout - p.costBasisCents;
    totalPayout += payout;
    totalRealized += realized;
    settled.push({
      positionId: p.id,
      outcomeId: p.outcomeId,
      side: p.side,
      quantity: p.quantity,
      costBasisCents: p.costBasisCents,
      payoutCents: payout,
      realizedPnLCents: realized,
      won: wins,
    });
    let seq: number;
    [s, seq] = nextSeq(s);
    s = {
      ...s,
      cashTotalCents: s.cashTotalCents + payout,
      realizedPnLCents: s.realizedPnLCents + realized,
      positions: s.positions.filter((x) => x.id !== p.id),
      ledger: [
        ...s.ledger,
        {
          id: `ledger-${seq}`,
          kind: 'SETTLEMENT',
          cashDeltaCents: payout,
          marketId,
          outcomeId: p.outcomeId,
          side: p.side,
          quantity: p.quantity,
          priceCents: wins ? PAYOUT_CENTS : 0,
          realizedPnLCents: realized,
          won: wins,
          createdAt: catalog.displayAsOf,
          seq,
        },
      ],
    };
    s = notify(
      s,
      catalog,
      'MARKET_RESOLVED',
      wins ? 'Your prediction was correct' : 'Your prediction did not happen',
      wins
        ? `“${bare(proposition(current, p.outcomeId, p.side))}” resolved in your favour. You received ${formatMoney(payout)}.`
        : `“${bare(proposition(current, p.outcomeId, p.side))}” did not happen. These contracts settled at $0.`,
      '/portfolio?tab=history',
    );
  }
  s = {
    ...s,
    marketOverrides: {
      ...s.marketOverrides,
      [marketId]: {
        ...s.marketOverrides[marketId],
        resolution: { yesOutcomeIds, resolvedAt: catalog.displayAsOf },
      },
    },
  };
  return { ok: true, state: s, receipt: { marketId, yesOutcomeIds, payoutCents: totalPayout, realizedPnLCents: totalRealized, settled } };
}

// ───────────────────────────── Saved & notifications ─────────────────────────────

export function setSaved(state: UserState, marketId: string, saved: boolean): UserState {
  const has = state.savedMarketIds.includes(marketId);
  if (has === saved) return state;
  return {
    ...state,
    savedMarketIds: saved ? [...state.savedMarketIds, marketId] : state.savedMarketIds.filter((id) => id !== marketId),
  };
}

export function markNotificationRead(state: UserState, catalog: Catalog, id: string): UserState {
  return {
    ...state,
    notifications: state.notifications.map((n) => (n.id === id && !n.readAt ? { ...n, readAt: catalog.displayAsOf } : n)),
  };
}

export function markAllNotificationsRead(state: UserState, catalog: Catalog): UserState {
  return {
    ...state,
    notifications: state.notifications.map((n) => (n.readAt ? n : { ...n, readAt: catalog.displayAsOf })),
  };
}
