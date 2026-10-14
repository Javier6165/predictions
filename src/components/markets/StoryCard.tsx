import { Link } from 'react-router';
import { categoryByName } from '@/data/categories';
import { changePp, leadOutcome } from '@/domain/selectors';
import type { Market } from '@/domain/types';
import { MarketThumb } from '@/components/art/MarketArt';
import { cn } from '@/lib/cn';
import { OddsBar } from './Odds';
import { PpDelta, SaveButton } from './bits';

/** One-line reading of the odds: "48 in 100 say yes" or "Real Madrid leads · 58 in 100". */
export function OddsLine({ market, className }: { market: Market; className?: string }) {
  const lead = leadOutcome(market);
  const multi = market.type === 'MULTI_OUTCOME';
  return (
    <div className={cn('grid gap-2', className)}>
      <OddsBar yes={lead.probabilityCents} tone={multi ? 'text-series-1' : 'text-yes-fill'} />
      <p className="flex items-baseline justify-between gap-3 text-sm">
        <span className="min-w-0 truncate text-ink-2">
          {multi ? (
            <>
              <span className="font-semibold text-ink">{lead.label}</span> leads
            </>
          ) : (
            <>
              <span className="font-display text-[22px] leading-none text-ink">{lead.probabilityCents}</span>
              <span className="text-muted"> in 100 say </span>
              <span className="font-semibold text-yes">yes</span>
            </>
          )}
        </span>
        {multi && (
          <span className="shrink-0 text-ink-2">
            <span className="font-display text-[22px] leading-none text-ink">{lead.probabilityCents}</span>
            <span className="text-muted"> in 100</span>
          </span>
        )}
        <PpDelta value={changePp(market, lead.id)} className="shrink-0" />
      </p>
    </div>
  );
}

/** Editorial question card: picture, kicker, question in the display face, odds line. */
export function StoryCard({ market, size = 'md', className }: { market: Market; size?: 'md' | 'lg'; className?: string }) {
  const category = categoryByName(market.category);
  const lg = size === 'lg';
  return (
    <article
      className={cn('group relative', lg ? 'flex flex-col' : 'grid grid-cols-[96px_1fr] gap-x-4 sm:flex sm:flex-col', className)}
      aria-label={market.question}
    >
      <div
        className={cn('relative overflow-hidden', lg ? 'aspect-[16/10] rounded-3xl' : 'row-span-2 aspect-square rounded-2xl sm:aspect-[4/3] sm:rounded-3xl')}
        data-theme="dark"
      >
        <MarketThumb market={market} className="h-full w-full rounded-none" sizes={lg ? '(min-width: 1024px) 50vw, 100vw' : '(min-width: 1024px) 30vw, (min-width: 640px) 50vw, 96px'} />
        <SaveButton
          marketId={market.id}
          label={market.title}
          className={cn('absolute right-3 top-3 z-10 bg-bg/70 text-ink backdrop-blur hover:bg-bg/90', !lg && 'max-sm:hidden')}
        />
      </div>
      <p className={cn('text-[11px] font-semibold uppercase tracking-[0.16em] text-muted', lg ? 'mt-4' : 'sm:mt-4')}>{category.shortName}</p>
      <h3 className={cn('font-display mt-1.5 text-ink', lg ? 'text-[30px] leading-[1.05] sm:text-[34px]' : 'text-[20px] leading-[1.1] sm:text-[26px]')}>
        <Link to={`/markets/${market.id}`} className="decoration-1 underline-offset-4 after:absolute after:inset-0 group-hover:underline">
          {market.question}
        </Link>
      </h3>
      <OddsLine market={market} className={cn('mt-4', !lg && 'col-span-2 max-sm:mt-3')} />
    </article>
  );
}
