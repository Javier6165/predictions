import { describe, expect, it, beforeEach } from 'vitest';
import { STORAGE_KEY, hasSessionChanges, useStore } from './store';
import { portfolioSummary } from '@/domain/selectors';
import { catalog } from '@/data/fixtures';

const reset = () => useStore.getState().restoreShowcase();

describe('FIN-22 session persistence', () => {
  beforeEach(() => {
    sessionStorage.clear();
    reset();
  });

  it('writes the session to sessionStorage (never localStorage) and rehydrates it without re-executing', async () => {
    const r = useStore.getState().buy({ intentId: 'persist-1', marketId: 'mars-2035', outcomeId: 'yes', side: 'YES', quantity: 10, expectedAskCents: 49 });
    expect(r.ok).toBe(true);
    const raw = sessionStorage.getItem(STORAGE_KEY);
    expect(raw).toBeTruthy();
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
    const cashAfter = useStore.getState().user.cashTotalCents;

    // Simulate a reload: wipe memory to seed, then rehydrate from storage.
    useStore.setState({ user: useStore.getState().user });
    await useStore.persist.rehydrate();
    const u = useStore.getState().user;
    expect(u.cashTotalCents).toBe(cashAfter);
    expect(u.ledger.filter((l) => l.intentId === 'persist-1')).toHaveLength(1);
  });

  it('discards an incompatible stored session and flags recovery', async () => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ state: { user: { cashTotalCents: 'lots' } }, version: 1 }));
    await useStore.persist.rehydrate();
    expect(useStore.getState().sessionRecovered).toBe(true);
    expect(portfolioSummary(useStore.getState().user, catalog).portfolioValueCents).toBe(100480);
  });

  it('reset presets are exact and change detection works', () => {
    const s = useStore.getState();
    expect(hasSessionChanges(s.user)).toBe(false);
    s.toggleSaved('oil-2027');
    expect(hasSessionChanges(useStore.getState().user)).toBe(true);
    useStore.getState().startFresh();
    expect(useStore.getState().user.positions).toHaveLength(0);
    expect(hasSessionChanges(useStore.getState().user)).toBe(false);
    useStore.getState().restoreShowcase();
    expect(portfolioSummary(useStore.getState().user, catalog).portfolioValueCents).toBe(100480);
  });
});
