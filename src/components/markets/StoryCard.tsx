import { Link } from 'react-router';
import { ChevronRight } from 'lucide-react';
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
    <div className={cn('grid gap-2.5', className)}>
      <p className="flex items-baseline justify-between gap-3 text-[14px]">
        <span className="min-w-0 truncate text-muted">
          <span className="font-display mr-1 text-[24px] leading-none tracking-[-0.03em] text-ink tabular">{lead.probabilityCents}</span>
          in 100 {multi ? <>back <span className="font-medium text-ink">{lead.label}</span></> : <>say <span className="font-medium text-yes">yes</span></>}
        </span>
        <PpDelta value={changePp(market, lead.id)} className="shrink-0" />
      </p>
      <OddsBar yes={lead.probabilityCents} tone={multi ? 'text-series-1' : 'text-yes-fill'} className="h-1" />
    </div>
  );
}

/** Product-style tile: picture, eyebrow, question, odds line. */
export function StoryCard({ market, size = 'md', className }: { market: Market; size?: 'md' | 'lg'; className?: string }) {
  const category = categoryByName(market.category);
  const lg = size === 'lg';
  return (
    <article
      className={cn(
        'card group relative overflow-hidden transition-transform duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] hover:scale-[1.012]',
        lg ? 'flex flex-col' : 'grid grid-cols-[88px_1fr] gap-x-4 p-4 sm:flex sm:flex-col sm:p-0',
        className,
      )}
      aria-label={market.question}
    >
      <div
        className={cn('relative overflow-hidden', lg ? 'aspect-[16/10] lg:aspect-auto lg:min-h-[320px] lg:flex-1' : 'row-span-2 aspect-square rounded-2xl sm:aspect-[16/10] sm:rounded-none')}
        data-theme="dark"
      >
        <MarketThumb market={market} className="absolute inset-0 h-full w-full rounded-none" sizes={lg ? '(min-width: 1024px) 60vw, 100vw' : '(min-width: 1024px) 30vw, (min-width: 640px) 50vw, 88px'} />
        <SaveButton
          marketId={market.id}
          label={market.title}
          className={cn('material absolute right-3 top-3 z-10 rounded-full text-ink', !lg && 'max-sm:hidden')}
        />
      </div>
      <div className={cn(lg ? 'p-6 sm:p-7' : 'min-w-0 sm:p-5')}>
        <p className="eyebrow">{category.shortName}</p>
        <h3 className={cn('font-display mt-1 text-ink', lg ? 'text-[26px] leading-[1.12] sm:text-[30px]' : 'text-[17px] leading-snug sm:text-[19px]')}>
          <Link to={`/markets/${market.id}`} className="after:absolute after:inset-0 after:rounded-[inherit]">
            {market.question}
          </Link>
        </h3>
        <OddsLine market={market} className={cn('mt-4', !lg && 'max-sm:hidden')} />
        {lg && (
          <span className="mt-4 inline-flex items-center gap-0.5 text-[15px] text-accent">
            See the market <ChevronRight className="h-4 w-4" aria-hidden />
          </span>
        )}
      </div>
      {!lg && <OddsLine market={market} className="col-span-2 mt-3 sm:hidden" />}
    </article>
  );
}
