import { categoryByName, type CategoryArt } from '@/data/categories';
import type { Market } from '@/domain/types';
import { cn } from '@/lib/cn';
import { SceneArt } from './SceneArt';

/** A few markets read better with a scene from another family. */
const OVERRIDES: Record<string, CategoryArt> = {
  'arctic-2027': 'global',
  'peace-talks-2027': 'global',
  'eu-reform-2027': 'politics',
  'oil-2027': 'economy',
};

export function marketArt(market: Pick<Market, 'id' | 'category'>): CategoryArt {
  return OVERRIDES[market.id] ?? categoryByName(market.category).art;
}

export function MarketThumb({ market, className, sizes = '160px' }: { market: Pick<Market, 'id' | 'category'>; className?: string; sizes?: string }) {
  return (
    <div className={cn('thumb relative shrink-0 overflow-hidden rounded-xl bg-surface-2', className)}>
      <SceneArt art={marketArt(market)} seed={market.id} sizes={sizes} />
    </div>
  );
}
