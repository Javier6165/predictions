import raw from '@data/demo-fixtures.v1.7.json';
import { fixtureSchema, type Fixture, type FixtureMarket } from './schema';
import type { LedgerEntry, Market, UserState } from '@/domain/types';

export const SESSION_SCHEMA_VERSION = 1;

function toMarket(m: FixtureMarket): Market {
  return {
    id: m.id,
    category: m.category,
    type: m.type,
    question: m.question,
    title: m.title,
    closeAt: m.closeAt,
    status: m.status,
    outcomes: m.outcomes,
    tags: m.tags,
    resolutionSummary: m.resolutionSummary,
    resolutionSource: m.resolutionSource,
    isFeatured: m.isFeatured,
    resolvedAt: m.resolvedAt,
    winningOutcomeId: m.winningOutcomeId,
    resolutionRule: {
      yesCondition: m.resolutionRule.yesCondition,
      noCondition: m.resolutionRule.noCondition,
      evaluatedAt: m.resolutionRule.evaluatedAt,
      sourceLabel: m.resolutionRule.sourceLabel,
      voidCondition: m.resolutionRule.voidCondition,
    },
    liquidity: {
      maxBuy: m.demoLiquidity.maxImmediateBuyContractsPerOutcome,
      maxSell: m.demoLiquidity.maxImmediateSellContractsPerOutcome,
    },
    activity: { volume24hCents: m.demoActivity.volume24hCents, trendingScore: m.demoActivity.trendingScore },
    updates: m.demoUpdates,
    chartPoints: m.chartPoints,
  };
}

export interface Catalog {
  displayAsOf: string;
  disclaimer: string;
  markets: Market[];
  byId: Map<string, Market>;
  fixture: Fixture;
}

export function buildCatalog(input: unknown): Catalog {
  const fixture = fixtureSchema.parse(input);
  const markets = fixture.marketData.map(toMarket);
  return {
    displayAsOf: fixture.displayAsOf,
    disclaimer: fixture.sourceDisclaimer,
    markets,
    byId: new Map(markets.map((m) => [m.id, m])),
    fixture,
  };
}

/** Validated once at module load; a malformed fixture fails loudly in dev and tests. */
export const catalog: Catalog = buildCatalog(raw);

const SEED_DEPOSIT_AT = '2026-10-09T10:00:00+02:00';

/** The exact showcase account from the fixture (FIN-01 baseline). */
export function showcaseState(c: Catalog = catalog): UserState {
  const s = c.fixture.initialState;
  let seq = 0;
  const next = () => ++seq;

  const ledger: LedgerEntry[] = [
    {
      id: 'ledger-seed-deposit',
      kind: 'DEPOSIT',
      cashDeltaCents: s.initialDepositCents,
      createdAt: SEED_DEPOSIT_AT,
      seq: next(),
    },
  ];
  const positions = s.positions.map((p) => ({
    id: p.id,
    marketId: p.marketId,
    outcomeId: p.outcomeId,
    side: p.side,
    quantity: p.quantity,
    costBasisCents: p.costBasisCents,
    openedSeq: 0,
  }));
  for (const h of s.history) {
    const pos = s.positions.find((p) => p.id === h.positionId);
    if (!pos) throw new Error(`Seed history ${h.id} references unknown position`);
    const entrySeq = next();
    const position = positions.find((p) => p.id === pos.id);
    if (position) position.openedSeq = entrySeq;
    ledger.push({
      id: h.id,
      kind: 'BUY',
      cashDeltaCents: -h.amountCents,
      marketId: pos.marketId,
      outcomeId: pos.outcomeId,
      side: pos.side,
      quantity: h.quantity,
      priceCents: h.priceCents,
      createdAt: h.createdAt,
      seq: entrySeq,
    });
  }
  const orders = s.orders.map((o) => {
    const orderSeq = next();
    ledger.push({
      id: `ledger-${o.id}`,
      kind: 'LIMIT_PLACED',
      cashDeltaCents: 0,
      marketId: o.marketId,
      outcomeId: o.outcomeId,
      side: o.side,
      quantity: o.requestedQuantity,
      priceCents: o.limitPriceCents,
      orderId: o.id,
      createdAt: o.createdAt,
      seq: orderSeq,
    });
    return { ...o, seq: orderSeq };
  });

  return {
    schemaVersion: SESSION_SCHEMA_VERSION,
    scenario: 'showcase',
    cashTotalCents: s.cashTotalCents,
    depositsCents: s.initialDepositCents,
    realizedPnLCents: s.realizedPnLCents,
    positions,
    orders,
    ledger,
    savedMarketIds: [...s.savedMarketIds],
    notifications: s.notifications.map((n) => ({
      id: n.id,
      kind: 'MARKET_MOVE' as const,
      title: 'Your prediction moved',
      text: n.text,
      targetPath: `/markets/${n.targetMarketId}`,
      createdAt: c.displayAsOf,
      seq: next(),
      readAt: n.readAt,
    })),
    processedIntents: {},
    marketOverrides: {},
    armedQuoteChanges: [],
    activeScenarios: [],
    seq,
  };
}

/** `Start fresh`: $1,000 virtual cash, nothing else (fixture `fresh-start`). */
export function freshState(c: Catalog = catalog): UserState {
  const def = c.fixture.scenarioDefinitions['fresh-start'] as { cashTotalCents?: number } | undefined;
  const cash = typeof def?.cashTotalCents === 'number' ? def.cashTotalCents : 100000;
  return {
    schemaVersion: SESSION_SCHEMA_VERSION,
    scenario: 'fresh',
    cashTotalCents: cash,
    depositsCents: cash,
    realizedPnLCents: 0,
    positions: [],
    orders: [],
    ledger: [
      { id: 'ledger-fresh-deposit', kind: 'DEPOSIT', cashDeltaCents: cash, createdAt: c.displayAsOf, seq: 1 },
    ],
    savedMarketIds: [],
    notifications: [],
    processedIntents: {},
    marketOverrides: {},
    armedQuoteChanges: [],
    activeScenarios: [],
    seq: 1,
  };
}
