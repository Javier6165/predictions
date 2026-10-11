import { describe, expect, it } from 'vitest';
import {
  addDemoFunds,
  allocateBasis,
  buyPreview,
  cancelLimit,
  executeBuy,
  executeSell,
  placeLimitBuy,
  quoteBuyByBudget,
  sellPreview,
  setSaved,
  settleMarket,
  validateBuy,
} from './engine';
import { applyScenario } from './scenarios';
import { availableCents, changePp, chartSeries, portfolioSummary, positionView, reservedCents } from './selectors';
import { proposition } from './copy';
import { marketFor } from './quotes';
import { assertIntegerMoney, catalog, fresh, showcase, withQuote } from '@/test/helpers';
import { buildCatalog } from '@/data/fixtures';
import raw from '@data/demo-fixtures.v1.7.json';
import type { UserState } from './types';

const ledgerSum = (s: UserState) => s.ledger.reduce((sum, l) => sum + l.cashDeltaCents, 0);

function reconcile(s: UserState, c = catalog) {
  const sum = portfolioSummary(s, c);
  expect(sum.cashTotalCents).toBe(ledgerSum(s));
  expect(sum.availableCents).toBe(sum.cashTotalCents - sum.reservedCents);
  expect(sum.portfolioValueCents).toBe(sum.cashTotalCents + sum.positionsMarkedCents);
  expect(sum.portfolioValueCents - sum.depositsCents).toBe(sum.realizedPnLCents + sum.unrealizedPnLCents);
  expect(sum.availableCents).toBeGreaterThanOrEqual(0);
  assertIntegerMoney(s);
  return sum;
}

describe('fixture', () => {
  it('parses with Zod and has 24 markets in 8 categories', () => {
    const c = buildCatalog(raw);
    expect(c.markets).toHaveLength(24);
    expect(new Set(c.markets.map((m) => m.category)).size).toBe(8);
  });

  it('rejects a malformed fixture', () => {
    const broken = structuredClone(raw) as { marketData: { outcomes: { yesQuote: unknown }[] }[] };
    broken.marketData[0].outcomes[0].yesQuote = { indicativeCents: 0.5, askCents: 1, bidCents: 1 };
    expect(() => buildCatalog(broken)).toThrow();
  });

  it('has a proposition for every market, outcome and side', () => {
    for (const m of catalog.markets)
      for (const o of m.outcomes)
        for (const side of ['YES', 'NO'] as const) expect(proposition(m, o.id, side)).not.toMatch(/resolves/);
  });
});

describe('FIN-01 seed baseline', () => {
  it('matches the reconciled showcase snapshot exactly', () => {
    const s = showcase();
    const sum = reconcile(s);
    expect(sum.depositsCents).toBe(100000);
    expect(sum.cashTotalCents).toBe(87640);
    expect(sum.reservedCents).toBe(440);
    expect(sum.availableCents).toBe(87200);
    expect(sum.positionsMarkedCents).toBe(12840);
    expect(sum.portfolioValueCents).toBe(100480);
    expect(sum.unrealizedPnLCents).toBe(480);
    expect(sum.realizedPnLCents).toBe(0);
    expect(s.savedMarketIds).toHaveLength(3);
  });
});

describe('FIN-02 / FIN-03 buy math', () => {
  it('125 YES at 40¢ costs $50, pays $125, profit $75, max loss $50', () => {
    const p = buyPreview(125, 40);
    expect(p).toMatchObject({ costCents: 5000, payoutIfRightCents: 12500, profitIfRightCents: 7500, maxLossCents: 5000, feesCents: 0 });
  });

  it('executes a 125 YES buy at 40¢ and moves cash by exactly 5000¢', () => {
    const c = withQuote(catalog, 'mars-2035', 'yes', { indicativeCents: 39, askCents: 40, bidCents: 38 });
    const s0 = fresh();
    const r = executeBuy(s0, c, { intentId: 'i1', marketId: 'mars-2035', outcomeId: 'yes', side: 'YES', quantity: 125, expectedAskCents: 40 });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.state.cashTotalCents).toBe(s0.cashTotalCents - 5000);
    expect(r.state.positions[0]).toMatchObject({ quantity: 125, costBasisCents: 5000 });
    reconcile(r.state, c);
  });

  it('budget $51 at 40¢ buys floor(5100/40)=127 contracts for $50.80, $0.20 unused', () => {
    const p = quoteBuyByBudget(5100, 40);
    expect(p.quantity).toBe(127);
    expect(p.costCents).toBe(5080);
    expect(p.unusedCents).toBe(20);
  });

  it('a budget below the ask buys nothing', () => {
    expect(quoteBuyByBudget(30, 40).quantity).toBe(0);
  });
});

describe('FIN-04 partial sell', () => {
  it('sell 50 of 125 @ base 40¢ at bid 62¢: +$31 proceeds, +$11 realized, 75 left with $30 base', () => {
    const c = withQuote(catalog, 'mars-2035', 'yes', { indicativeCents: 63, askCents: 64, bidCents: 62 });
    let s = fresh();
    s = { ...s, cashTotalCents: s.cashTotalCents - 5000, ledger: [...s.ledger, { id: 'x', kind: 'BUY', cashDeltaCents: -5000, createdAt: catalog.displayAsOf, seq: 2 }], seq: 2,
      positions: [{ id: 'p', marketId: 'mars-2035', outcomeId: 'yes', side: 'YES', quantity: 125, costBasisCents: 5000, openedSeq: 2 }] };
    const r = executeSell(s, c, { intentId: 's1', positionId: 'p', quantity: 50, expectedBidCents: 62 });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.receipt.amountCents).toBe(3100);
    expect(r.receipt.realizedPnLCents).toBe(1100);
    expect(r.state.positions[0]).toMatchObject({ quantity: 75, costBasisCents: 3000 });
    expect(r.state.cashTotalCents).toBe(s.cashTotalCents + 3100);
    expect(r.state.realizedPnLCents).toBe(1100);
    reconcile(r.state, c);
  });

  it('allocates basis deterministically without losing cents', () => {
    const pos = { quantity: 3, costBasisCents: 100 };
    const a = allocateBasis(pos, 1); // 33
    const b = allocateBasis({ quantity: 2, costBasisCents: 100 - a }, 1); // 33
    const rest = allocateBasis({ quantity: 1, costBasisCents: 100 - a - b }, 1); // 34
    expect(a + b + rest).toBe(100);
  });

  it('sell all closes the position and history records the sale', () => {
    const s = showcase();
    const pos = s.positions.find((p) => p.id === 'pos-1')!;
    const bid = marketFor(s, catalog.byId.get('mars-2035')!).outcomes[0].yesQuote!.bidCents;
    const r = executeSell(s, catalog, { intentId: 'sell-all', positionId: 'pos-1', quantity: pos.quantity, expectedBidCents: bid });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.state.positions.find((p) => p.id === 'pos-1')).toBeUndefined();
    expect(r.receipt.realizedPnLCents).toBe(100 * bid - 4000);
    expect(r.state.ledger.at(-1)).toMatchObject({ kind: 'SELL', quantity: 100 });
    reconcile(r.state);
  });
});

describe('FIN-05 / FIN-06 semantics', () => {
  it('seed Bitcoin position is a NO on outcome yes, marked at 46¢', () => {
    const s = showcase();
    const pos = s.positions.find((p) => p.marketId === 'bitcoin-150k-2027')!;
    expect(pos).toMatchObject({ outcomeId: 'yes', side: 'NO' });
    expect(positionView(s, catalog, pos)!.markCents).toBe(46);
    expect(proposition(catalog.byId.get('bitcoin-150k-2027')!, 'yes', 'NO')).toBe('Bitcoin will not reach $150,000 before 2028.');
  });

  it('NO on Real Madrid says Real Madrid will not win — never that a rival wins', () => {
    const m = catalog.byId.get('ucl-2027')!;
    const text = proposition(m, 'real-madrid', 'NO');
    expect(text).toBe('Real Madrid will not win the 2027 UEFA Champions League.');
    expect(text).not.toMatch(/Barcelona|Bayern/);
  });
});

describe('FIN-07 / FIN-08 limit orders', () => {
  it('reserving 20 @ 22¢ lowers available by 440¢, leaves cash total and positions unchanged', () => {
    const s0 = fresh();
    const r = placeLimitBuy(s0, catalog, { intentId: 'l1', marketId: 'apple-foldable-2027', outcomeId: 'yes', side: 'YES', quantity: 20, limitPriceCents: 22 });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(availableCents(r.state)).toBe(availableCents(s0) - 440);
    expect(r.state.cashTotalCents).toBe(s0.cashTotalCents);
    expect(r.state.positions).toEqual(s0.positions);
    expect(portfolioSummary(r.state, catalog).portfolioValueCents).toBe(portfolioSummary(s0, catalog).portfolioValueCents);
    reconcile(r.state);
  });

  it('cancel releases the reserve with no fee and no fill', () => {
    const s0 = showcase();
    const r = cancelLimit(s0, catalog, 'order-001');
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(reservedCents(r.state)).toBe(0);
    expect(availableCents(r.state)).toBe(availableCents(s0) + 440);
    expect(r.state.cashTotalCents).toBe(s0.cashTotalCents);
    expect(r.state.positions).toEqual(s0.positions);
    expect(r.state.orders[0].status).toBe('CANCELLED');
    expect(cancelLimit(r.state, catalog, 'order-001').ok).toBe(false);
    reconcile(r.state);
  });

  it('rejects a limit at or above the ask (that would be an immediate buy)', () => {
    const r = placeLimitBuy(fresh(), catalog, { intentId: 'l2', marketId: 'mars-2035', outcomeId: 'yes', side: 'YES', quantity: 1, limitPriceCents: 49 });
    expect(r.ok).toBe(false);
  });
});

describe('FIN-09 .. FIN-11 rejections leave the store untouched', () => {
  it('FIN-09 insufficient available cash', () => {
    const s0 = fresh();
    const r = executeBuy(s0, catalog, { intentId: 'big', marketId: 'mars-2035', outcomeId: 'yes', side: 'YES', quantity: 999, expectedAskCents: 49 }); // 999*49 = $489.51 OK
    expect(r.ok).toBe(true);
    const poor = { ...s0, cashTotalCents: 100, ledger: [{ id: 'd', kind: 'DEPOSIT' as const, cashDeltaCents: 100, createdAt: '', seq: 1 }] };
    const r2 = executeBuy(poor, catalog, { intentId: 'p', marketId: 'mars-2035', outcomeId: 'yes', side: 'YES', quantity: 3, expectedAskCents: 49 });
    expect(r2.ok).toBe(false);
    if (!r2.ok) {
      expect(r2.error.code).toBe('INSUFFICIENT_FUNDS');
      expect(r2.state).toBeUndefined();
    }
  });

  it('FIN-09 reserved cash is not spendable', () => {
    const s = { ...showcase() };
    const tight = { ...s, cashTotalCents: 440 + 49 };
    expect(validateBuy(tight, catalog, 'mars-2035', 'yes', 'YES', 2).ok).toBe(false);
    expect(validateBuy(tight, catalog, 'mars-2035', 'yes', 'YES', 1).ok).toBe(true);
  });

  it('FIN-10 liquidity below quantity rejects in full', () => {
    const s0 = fresh();
    const r = executeBuy(s0, catalog, { intentId: 'liq', marketId: 'mars-2035', outcomeId: 'yes', side: 'YES', quantity: 1001, expectedAskCents: 49 });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe('INSUFFICIENT_LIQUIDITY');
    const sc = applyScenario(s0, catalog, 'limited-liquidity');
    expect(sc.ok).toBe(true);
    if (!sc.ok) return;
    const r2 = executeBuy(sc.state, catalog, { intentId: 'liq2', marketId: 'mars-2035', outcomeId: 'yes', side: 'YES', quantity: 6, expectedAskCents: 49 });
    expect(r2.ok).toBe(false);
    if (!r2.ok) expect(r2.error).toEqual({ code: 'INSUFFICIENT_LIQUIDITY', maxQuantity: 5 });
  });

  it('FIN-11 cannot sell more than held', () => {
    const s = showcase();
    const r = executeSell(s, catalog, { intentId: 'x', positionId: 'pos-1', quantity: 101, expectedBidCents: 47 });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe('INSUFFICIENT_POSITION');
  });
});

describe('FIN-12 / FIN-13 confirmation safety', () => {
  it('FIN-12 a re-quote between Review and Confirm blocks execution and exposes the new price', () => {
    const sc = applyScenario(showcase(), catalog, 'price-change-before-confirm');
    expect(sc.ok).toBe(true);
    if (!sc.ok) return;
    const before = sc.state;
    const r = executeBuy(before, catalog, { intentId: 'q1', marketId: 'mars-2035', outcomeId: 'yes', side: 'YES', quantity: 10, expectedAskCents: 49 });
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.error).toEqual({ code: 'QUOTE_CHANGED', previousCents: 49, currentCents: 52 });
    const moved = r.state!;
    expect(moved.cashTotalCents).toBe(before.cashTotalCents);
    expect(moved.positions).toEqual(before.positions);
    // New consent at the new price succeeds once.
    const r2 = executeBuy(moved, catalog, { intentId: 'q2', marketId: 'mars-2035', outcomeId: 'yes', side: 'YES', quantity: 10, expectedAskCents: 52 });
    expect(r2.ok).toBe(true);
    if (r2.ok) {
      expect(r2.state.cashTotalCents).toBe(before.cashTotalCents - 520);
      reconcile(r2.state);
    }
  });

  it('FIN-13 confirming the same intent twice executes once', () => {
    const s0 = fresh();
    const intent = { intentId: 'dup', marketId: 'mars-2035', outcomeId: 'yes', side: 'YES' as const, quantity: 10, expectedAskCents: 49 };
    const r1 = executeBuy(s0, catalog, intent);
    expect(r1.ok).toBe(true);
    if (!r1.ok) return;
    const r2 = executeBuy(r1.state, catalog, intent);
    expect(r2.ok && r2.duplicate).toBe(true);
    if (!r2.ok) return;
    expect(r2.state).toBe(r1.state);
    expect(r2.state.ledger.filter((l) => l.kind === 'BUY')).toHaveLength(1);
    expect(r2.receipt.ledgerId).toBe(r1.receipt.ledgerId);
  });
});

describe('FIN-14 non-tradable markets', () => {
  it.each(['global-event-pending', 'global-event-resolved'])('%s blocks buy', (id) => {
    const r = validateBuy(fresh(), catalog, id, 'yes', 'YES', 1);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe('MARKET_NOT_TRADABLE');
  });

  it('a suspended market blocks buy and sell but keeps holdings', () => {
    const sc = applyScenario(showcase(), catalog, 'market-suspended');
    expect(sc.ok).toBe(true);
    if (!sc.ok) return;
    expect(validateBuy(sc.state, catalog, 'mars-2035', 'yes', 'YES', 1).ok).toBe(false);
    const sell = executeSell(sc.state, catalog, { intentId: 's', positionId: 'pos-1', quantity: 1, expectedBidCents: 47 });
    expect(sell.ok).toBe(false);
    expect(sc.state.positions.find((p) => p.id === 'pos-1')).toBeDefined();
    reconcile(sc.state);
  });
});

describe('FIN-15 settlement', () => {
  it('pays qty×100¢ to winners, 0 to losers, once, and cancels reserves', () => {
    let s = showcase();
    // Add a NO on Real Madrid and a limit order on the same market.
    const b = executeBuy(s, catalog, { intentId: 'no-rm', marketId: 'ucl-2027', outcomeId: 'real-madrid', side: 'NO', quantity: 10, expectedAskCents: 43 });
    if (!b.ok) throw new Error('setup');
    const l = placeLimitBuy(b.state, catalog, { intentId: 'lim', marketId: 'ucl-2027', outcomeId: 'barcelona', side: 'YES', quantity: 10, limitPriceCents: 10 });
    if (!l.ok) throw new Error('setup');
    s = l.state;
    const before = s.cashTotalCents;
    const r = settleMarket(s, catalog, 'ucl-2027', ['real-madrid']);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    // YES Real Madrid 40 contracts win $40; NO Real Madrid 10 contracts lose.
    expect(r.state.cashTotalCents).toBe(before + 4000);
    expect(r.state.positions.filter((p) => p.marketId === 'ucl-2027')).toHaveLength(0);
    expect(r.state.orders.filter((o) => o.marketId === 'ucl-2027' && o.status === 'OPEN')).toHaveLength(0);
    expect(r.receipt.realizedPnLCents).toBe(4000 - 2400 + (0 - 430));
    reconcile(r.state);
    expect(settleMarket(r.state, catalog, 'ucl-2027', ['real-madrid']).ok).toBe(false);
    expect(validateBuy(r.state, catalog, 'ucl-2027', 'barcelona', 'YES', 1).ok).toBe(false);
  });

  it('binary NO result pays NO holders', () => {
    const s = showcase();
    const r = settleMarket(s, catalog, 'bitcoin-150k-2027', []);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.receipt.payoutCents).toBe(80 * 100);
  });
});

describe('FIN-16 / FIN-17 reset and funds', () => {
  it('fresh start has $1,000 cash and nothing else', () => {
    const s = fresh();
    const sum = reconcile(s);
    expect(sum.cashTotalCents).toBe(100000);
    expect(s.positions).toHaveLength(0);
    expect(s.orders).toHaveLength(0);
    expect(s.savedMarketIds).toHaveLength(0);
    expect(s.notifications).toHaveLength(0);
  });

  it('showcase restore is deterministic', () => {
    expect(showcase()).toEqual(showcase());
  });

  it('demo funds increase cash, portfolio and deposits but not P&L', () => {
    const s0 = showcase();
    const before = portfolioSummary(s0, catalog);
    const r = addDemoFunds(s0, catalog, 50000);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    const after = reconcile(r.state);
    expect(after.cashTotalCents).toBe(before.cashTotalCents + 50000);
    expect(after.portfolioValueCents).toBe(before.portfolioValueCents + 50000);
    expect(after.depositsCents).toBe(before.depositsCents + 50000);
    expect(after.totalPnLCents).toBe(before.totalPnLCents);
  });
});

describe('FIN-18 mark vs liquidation', () => {
  it('current value uses mark; sale preview uses bid', () => {
    const s = showcase();
    const v = positionView(s, catalog, s.positions.find((p) => p.id === 'pos-1')!)!;
    expect(v.markedValueCents).toBe(100 * 48);
    expect(v.liquidationValueCents).toBe(100 * 47);
    expect(sellPreview(v.position, 100, v.bidCents!).proceedsCents).toBe(4700);
  });
});

describe('FIN-20 charts', () => {
  it('series end at fixture probability, NO is the complement, multi sums to 100', () => {
    for (const m of catalog.markets) {
      for (const o of m.outcomes) {
        const yes = chartSeries(m, o.id, 'YES');
        const no = chartSeries(m, o.id, 'NO');
        expect(yes.at(-1)!.value).toBe(o.probabilityCents);
        yes.forEach((p, i) => expect(p.value + no[i].value).toBe(100));
        expect(Date.parse(yes.at(-1)!.at)).toBeLessThanOrEqual(Date.parse(m.closeAt));
      }
      if (m.type === 'MULTI_OUTCOME')
        for (const p of m.chartPoints) expect(Object.values(p.probabilityCentsByOutcome).reduce((a, b) => a + b, 0)).toBe(100);
    }
  });

  it('probability changes are integer percentage points', () => {
    const m = catalog.byId.get('mars-2035')!;
    expect(Number.isInteger(changePp(m, 'yes'))).toBe(true);
  });
});

describe('FIN-21 reconciliation after a long sequence', () => {
  it('stays consistent to the cent', () => {
    let s = showcase();
    const steps: ((x: UserState) => UserState)[] = [
      (x) => { const r = executeBuy(x, catalog, { intentId: 'a', marketId: 'oil-2027', outcomeId: 'yes', side: 'NO', quantity: 33, expectedAskCents: 70 }); if (!r.ok) throw new Error(JSON.stringify(r.error)); return r.state; },
      (x) => { const r = placeLimitBuy(x, catalog, { intentId: 'b', marketId: 'nba-2027', outcomeId: 'yes', side: 'YES', quantity: 17, limitPriceCents: 41 }); if (!r.ok) throw new Error('b'); return r.state; },
      (x) => { const r = addDemoFunds(x, catalog, 25000); if (!r.ok) throw new Error('c'); return r.state; },
      (x) => { const r = executeSell(x, catalog, { intentId: 'd', positionId: 'pos-2', quantity: 33, expectedBidCents: 45 }); if (!r.ok) throw new Error(JSON.stringify(r.error)); return r.state; },
      (x) => { const r = cancelLimit(x, catalog, 'order-001'); if (!r.ok) throw new Error('e'); return r.state; },
      (x) => { const r = executeSell(x, catalog, { intentId: 'f', positionId: 'pos-2', quantity: 47, expectedBidCents: 45 }); if (!r.ok) throw new Error('f'); return r.state; },
    ];
    for (const step of steps) {
      s = step(s);
      reconcile(s);
    }
    expect(s.positions.find((p) => p.id === 'pos-2')).toBeUndefined();
    // pos-2: 80 NO @ 52 = 4160 basis; sold 80 at 45 = 3600 → realized −560
    expect(s.realizedPnLCents).toBe(-560);
  });
});

describe('saved markets', () => {
  it('toggle is idempotent', () => {
    const s = fresh();
    const a = setSaved(s, 'mars-2035', true);
    expect(setSaved(a, 'mars-2035', true)).toBe(a);
    expect(setSaved(a, 'mars-2035', false).savedMarketIds).toEqual([]);
  });
});

describe('Limit fill (explicit demo event)', () => {
  it('fills the seeded 20 @ 22¢ in full: reserve becomes cost, available unchanged', async () => {
    const { fillLimitOrder } = await import('./engine');
    const s0 = showcase();
    const before = portfolioSummary(s0, catalog);
    const r = fillLimitOrder(s0, catalog, 'order-001');
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    const after = reconcile(r.state);
    expect(after.cashTotalCents).toBe(before.cashTotalCents - 440);
    expect(after.availableCents).toBe(before.availableCents);
    expect(after.reservedCents).toBe(0);
    const pos = r.state.positions.find((p) => p.marketId === 'apple-foldable-2027')!;
    expect(pos).toMatchObject({ quantity: 20, costBasisCents: 440, side: 'YES' });
    expect(r.state.orders[0]).toMatchObject({ status: 'FILLED', filledQuantity: 20, reservedCashCents: 0 });
    expect(r.state.ledger.at(-1)).toMatchObject({ kind: 'LIMIT_FILLED', cashDeltaCents: -440 });
    // Marked at 26¢ vs paid 22¢ → +80¢ unrealized added.
    expect(after.unrealizedPnLCents).toBe(before.unrealizedPnLCents + 80);
    expect(fillLimitOrder(r.state, catalog, 'order-001').ok).toBe(false);
  });

  it('scenario fills every open order and is repeatable; refuses when none', () => {
    const r = applyScenario(showcase(), catalog, 'fill-limit-orders');
    expect(r.ok && r.filledOrders).toBe(1);
    if (!r.ok) return;
    reconcile(r.state);
    const again = applyScenario(r.state, catalog, 'fill-limit-orders');
    expect(again.ok).toBe(false);
  });

  it('settlement receipt lists each position with won/lost', () => {
    const r = applyScenario(showcase(), catalog, 'settle-ucl-real-madrid');
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.settlement?.settled).toEqual([
      expect.objectContaining({ outcomeId: 'real-madrid', side: 'YES', quantity: 40, payoutCents: 4000, realizedPnLCents: 1600, won: true }),
    ]);
  });
});
