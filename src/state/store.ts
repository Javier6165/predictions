import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { catalog, freshState, SESSION_SCHEMA_VERSION, showcaseState } from '@/data/fixtures';
import {
  addDemoFunds,
  cancelLimit,
  executeBuy,
  executeSell,
  fillLimitOrder,
  markAllNotificationsRead,
  markNotificationRead,
  placeLimitBuy,
  setSaved,
  type BuyIntent,
  type EngineResult,
  type LimitIntent,
  type SellIntent,
  type TradeReceipt,
} from '@/domain/engine';
import { applyScenario, type ScenarioId, type ScenarioResult } from '@/domain/scenarios';
import type { LedgerEntry, LimitOrder, UserState } from '@/domain/types';
import { persistedSchema } from './persistSchema';

export const STORAGE_KEY = 'nova-demo-session';

export type MotionPreference = 'system' | 'reduce' | 'full';
export type ThemePreference = 'light' | 'dark' | 'system';

export interface AppStore {
  user: UserState;
  recentSearches: string[];
  preferences: { motion: MotionPreference; theme: ThemePreference };
  /** Set when a stale or incompatible session was discarded on load. */
  sessionRecovered: boolean;

  buy: (intent: BuyIntent) => EngineResult<TradeReceipt>;
  sell: (intent: SellIntent) => EngineResult<TradeReceipt>;
  placeLimit: (intent: LimitIntent) => EngineResult<LimitOrder>;
  cancelOrder: (orderId: string) => EngineResult<LimitOrder>;
  /** Explicit demo event: a seller takes this resting order at its limit. */
  fillOrder: (orderId: string) => EngineResult<TradeReceipt>;
  addFunds: (amountCents: number) => EngineResult<LedgerEntry>;
  setSaved: (marketId: string, saved: boolean) => void;
  toggleSaved: (marketId: string) => void;
  markRead: (notificationId: string) => void;
  markAllRead: () => void;
  runScenario: (id: ScenarioId) => ScenarioResult;
  restoreShowcase: () => void;
  startFresh: () => void;
  addRecentSearch: (q: string) => void;
  clearRecentSearches: () => void;
  setMotion: (m: MotionPreference) => void;
  setTheme: (t: ThemePreference) => void;
  dismissRecovered: () => void;
}

/** Commit engine results that changed state (successes and visible re-quotes). */
function commit<R>(set: (p: Partial<AppStore>) => void, r: EngineResult<R>): EngineResult<R> {
  if (r.ok) set({ user: r.state });
  else if (r.state) set({ user: r.state });
  return r;
}

export const useStore = create<AppStore>()(
  persist(
    (set, get) => ({
      user: showcaseState(catalog),
      recentSearches: [],
      preferences: { motion: 'system', theme: 'light' },
      sessionRecovered: false,

      buy: (intent) => commit(set, executeBuy(get().user, catalog, intent)),
      sell: (intent) => commit(set, executeSell(get().user, catalog, intent)),
      placeLimit: (intent) => commit(set, placeLimitBuy(get().user, catalog, intent)),
      cancelOrder: (id) => commit(set, cancelLimit(get().user, catalog, id)),
      fillOrder: (id) => commit(set, fillLimitOrder(get().user, catalog, id)),
      addFunds: (amount) => commit(set, addDemoFunds(get().user, catalog, amount)),
      setSaved: (id, saved) => set({ user: setSaved(get().user, id, saved) }),
      toggleSaved: (id) => {
        const u = get().user;
        set({ user: setSaved(u, id, !u.savedMarketIds.includes(id)) });
      },
      markRead: (id) => set({ user: markNotificationRead(get().user, catalog, id) }),
      markAllRead: () => set({ user: markAllNotificationsRead(get().user, catalog) }),
      runScenario: (id) => {
        const r = applyScenario(get().user, catalog, id);
        if (r.ok) set({ user: r.state });
        return r;
      },
      restoreShowcase: () => set({ user: showcaseState(catalog) }),
      startFresh: () => set({ user: freshState(catalog) }),
      addRecentSearch: (q) => {
        const t = q.trim();
        if (!t) return;
        const list = [t, ...get().recentSearches.filter((x) => x.toLowerCase() !== t.toLowerCase())].slice(0, 5);
        set({ recentSearches: list });
      },
      clearRecentSearches: () => set({ recentSearches: [] }),
      setMotion: (motion) => set({ preferences: { ...get().preferences, motion } }),
      setTheme: (theme) => set({ preferences: { ...get().preferences, theme } }),
      dismissRecovered: () => set({ sessionRecovered: false }),
    }),
    {
      name: STORAGE_KEY,
      version: SESSION_SCHEMA_VERSION,
      // Per-tab session only. Operations are never written to localStorage.
      storage: createJSONStorage(() => sessionStorage),
      partialize: (s) => ({ user: s.user, recentSearches: s.recentSearches, preferences: s.preferences }),
      migrate: (persisted) => persisted as never,
      merge: (persisted, current) => {
        if (persisted === undefined || persisted === null) return current;
        const parsed = persistedSchema.safeParse(persisted);
        if (!parsed.success || parsed.data.user.schemaVersion !== SESSION_SCHEMA_VERSION) {
          return { ...current, sessionRecovered: true };
        }
        return { ...current, ...parsed.data };
      },
    },
  ),
);

/** True when the account differs from the preset it started from (reset needs confirmation). */
export function hasSessionChanges(user: UserState): boolean {
  const seed = user.scenario === 'fresh' ? freshState(catalog) : showcaseState(catalog);
  return JSON.stringify(seed) !== JSON.stringify(user);
}
