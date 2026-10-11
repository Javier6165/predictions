import { catalog as baseCatalog, freshState, showcaseState, type Catalog } from '@/data/fixtures';
import type { Market, Quote, UserState } from '@/domain/types';

/** Catalog copy with one outcome's YES/NO quotes replaced (test vectors only). */
export function withQuote(c: Catalog, marketId: string, outcomeId: string, yes: Quote, no?: Quote): Catalog {
  const markets: Market[] = c.markets.map((m) =>
    m.id !== marketId
      ? m
      : {
          ...m,
          outcomes: m.outcomes.map((o) =>
            o.id !== outcomeId
              ? o
              : {
                  ...o,
                  probabilityCents: yes.indicativeCents,
                  yesQuote: yes,
                  noQuote: no ?? {
                    indicativeCents: 100 - yes.indicativeCents,
                    askCents: 100 - yes.bidCents,
                    bidCents: 100 - yes.askCents,
                  },
                },
          ),
        },
  );
  return { ...c, markets, byId: new Map(markets.map((m) => [m.id, m])) };
}

export const catalog = baseCatalog;
export const showcase = (): UserState => showcaseState(baseCatalog);
export const fresh = (): UserState => freshState(baseCatalog);

/** Money in the state must be integers everywhere (FIN-19). */
export function assertIntegerMoney(s: UserState) {
  const nums: number[] = [s.cashTotalCents, s.depositsCents, s.realizedPnLCents];
  s.positions.forEach((p) => nums.push(p.costBasisCents, p.quantity));
  s.orders.forEach((o) => nums.push(o.reservedCashCents, o.limitPriceCents, o.requestedQuantity));
  s.ledger.forEach((l) => nums.push(l.cashDeltaCents, l.priceCents ?? 0, l.quantity ?? 0, l.realizedPnLCents ?? 0));
  for (const n of nums) if (!Number.isInteger(n)) throw new Error(`Non-integer money value: ${n}`);
}
