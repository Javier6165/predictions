/**
 * Explicit, deterministic demo scenarios (fixture `scenarioDefinitions` plus one
 * settlement fast-forward). Nothing here runs on a timer; a tester triggers it.
 */
import type { Catalog } from '@/data/fixtures';
import { settleMarket } from './engine';
import type { Quote, UserState } from './types';

export type ScenarioId =
  | 'market-suspended'
  | 'price-change-before-confirm'
  | 'limited-liquidity'
  | 'settle-ucl-real-madrid';

export interface ScenarioInfo {
  id: ScenarioId;
  title: string;
  description: string;
  /** Where to go to see the effect. */
  path: string;
}

export const SCENARIOS: ScenarioInfo[] = [
  {
    id: 'price-change-before-confirm',
    title: 'Price moves before you confirm',
    description:
      'Arms a one-time price change on “Humans land on Mars”. Review a Yes buy, press Confirm, and the demo asks you to review the new price instead of filling at the old one.',
    path: '/markets/mars-2035',
  },
  {
    id: 'limited-liquidity',
    title: 'Limited liquidity',
    description:
      'Caps immediate fills on “Humans land on Mars” at 5 contracts. Larger orders are rejected in full — no partial or phantom fills.',
    path: '/markets/mars-2035',
  },
  {
    id: 'market-suspended',
    title: 'Suspend a market',
    description: 'Pauses trading on “Humans land on Mars”. Your holdings stay, but buying and selling are disabled.',
    path: '/markets/mars-2035',
  },
  {
    id: 'settle-ucl-real-madrid',
    title: 'Fast-forward: settle the Champions League',
    description:
      'Jumps the fictional storyline ahead and settles “Champions League 2027” with Real Madrid as winner. Positions pay $1 or $0 per contract, once.',
    path: '/portfolio?tab=history',
  },
];

function def(catalog: Catalog, id: string): Record<string, unknown> {
  return (catalog.fixture.scenarioDefinitions[id] ?? {}) as Record<string, unknown>;
}

export type ScenarioResult = { ok: true; state: UserState } | { ok: false; message: string };

export function applyScenario(state: UserState, catalog: Catalog, id: ScenarioId): ScenarioResult {
  if (state.activeScenarios.includes(id)) return { ok: false, message: 'This scenario is already active.' };
  const mark = (s: UserState): UserState => ({ ...s, activeScenarios: [...s.activeScenarios, id] });

  switch (id) {
    case 'market-suspended': {
      const d = def(catalog, 'market-suspended');
      const marketId = String(d.marketId ?? 'mars-2035');
      return {
        ok: true,
        state: mark({
          ...state,
          marketOverrides: {
            ...state.marketOverrides,
            [marketId]: { ...state.marketOverrides[marketId], status: 'SUSPENDED', removeQuotes: true },
          },
        }),
      };
    }
    case 'limited-liquidity': {
      const d = def(catalog, 'limited-liquidity');
      const marketId = String(d.marketId ?? 'mars-2035');
      const maxBuy = Number(d.maxImmediateBuyContractsPerOutcome ?? 5);
      const maxSell = Number(d.maxImmediateSellContractsPerOutcome ?? 5);
      return {
        ok: true,
        state: mark({
          ...state,
          marketOverrides: {
            ...state.marketOverrides,
            [marketId]: { ...state.marketOverrides[marketId], liquidity: { maxBuy, maxSell } },
          },
        }),
      };
    }
    case 'price-change-before-confirm': {
      const d = def(catalog, 'price-change-before-confirm');
      return {
        ok: true,
        state: mark({
          ...state,
          armedQuoteChanges: [
            ...state.armedQuoteChanges,
            {
              marketId: String(d.marketId ?? 'mars-2035'),
              outcomeId: String(d.outcomeId ?? 'yes'),
              yesQuote: d.newYesQuote as Quote,
              noQuote: d.newNoQuote as Quote,
            },
          ],
        }),
      };
    }
    case 'settle-ucl-real-madrid': {
      const r = settleMarket(state, catalog, 'ucl-2027', ['real-madrid']);
      if (!r.ok) return { ok: false, message: 'This market is already settled.' };
      return { ok: true, state: mark(r.state) };
    }
  }
}
