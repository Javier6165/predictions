import { useMemo } from 'react';
import { catalog } from '@/data/fixtures';
import { marketFor } from '@/domain/quotes';
import type { Market } from '@/domain/types';
import { useStore } from '@/state/store';

/** All markets with the user's scenario overrides applied. */
export function useMarkets(): Market[] {
  const overrides = useStore((s) => s.user.marketOverrides);
  return useMemo(() => catalog.markets.map((m) => marketFor({ marketOverrides: overrides }, m)), [overrides]);
}

export function useMarket(id: string | undefined): Market | undefined {
  const overrides = useStore((s) => s.user.marketOverrides);
  return useMemo(() => {
    const base = id ? catalog.byId.get(id) : undefined;
    return base ? marketFor({ marketOverrides: overrides }, base) : undefined;
  }, [id, overrides]);
}

export function useIsSaved(marketId: string): boolean {
  return useStore((s) => s.user.savedMarketIds.includes(marketId));
}

export const DEMO_NOW = catalog.displayAsOf;
