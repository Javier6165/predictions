import { Link } from 'react-router';
import { categoryByName } from '@/data/categories';
import { changePp, leadOutcome } from '@/domain/selectors';
import type { Market } from '@/domain/types';
import { formatCompactMoney, formatDate } from '@/lib/format';
import { cn } from '@/lib/cn';
import { MarketThumb } from '@/components/art/MarketArt';
import { PpDelta, SaveButton, StatusBadge } from './bits';
import { OddsBar } from './Odds';

/** List row used in Explore groups/results: question first, indicative probability second. */
export function MarketRow({ market, rank, compact = false }: { market: Market; rank?: number; compact?: boolean }) {
  const lead = leadOutcome(market);
  const multi = market.type === 'MULTI_OUTCOME';
  const delta = changePp(market, lead.id);
  const resolved = market.status === 'RESOLVED';
  return (
    <div className="group relative flex items-center gap-4 py-4 sm:gap-5">
      {rank !== undefined && <span className="w-4 shrink-0 text-center text-sm font-medium text-subtle tabular">{rank}</span>}
      <MarketThumb market={market} className={cn('hidden rounded-2xl sm:block', compact ? 'h-12 w-12' : 'h-[72px] w-[72px]')} />
      <div className="min-w-0 flex-1">
        <Link
          to={`/markets/${market.id}`}
          className="font-display line-clamp-3 text-[19px] leading-[1.15] text-ink outline-none decoration-1 underline-offset-4 after:absolute after:inset-0 after:rounded-xl group-hover:underline focus-visible:after:outline-2 focus-visible:after:outline-accent sm:line-clamp-2 sm:text-[22px]"
        >
          {market.question}
        </Link>
        {!compact && (
          <p className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted">
            <span>{categoryByName(market.category).shortName}</span>
            <span aria-hidden>·</span>
            <span>{resolved ? `Resolved ${formatDate(market.resolvedAt ?? market.closeAt)}` : `Closes ${formatDate(market.closeAt)}`}</span>
            <span aria-hidden className="hidden sm:inline">·</span>
            <span className="hidden sm:inline">{formatCompactMoney(market.activity.volume24hCents)} vol.</span>
            {market.status !== 'OPEN' && <StatusBadge status={market.status} />}
          </p>
        )}
      </div>
      <div className="w-[92px] shrink-0 text-right sm:w-[132px]">
        <p className="truncate text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">{multi ? lead.label : 'Yes'}</p>
        <p className="mt-0.5 flex items-baseline justify-end gap-1">
          <span className="font-display text-[30px] leading-none text-ink tabular">{lead.probabilityCents}</span>
          <span className="text-[11px] text-muted">in 100</span>
        </p>
        <OddsBar yes={lead.probabilityCents} tone={multi ? 'text-series-1' : 'text-yes-fill'} className="mt-2 hidden h-1 sm:flex" />
      </div>
      <div className="hidden w-20 shrink-0 sm:block">
        <PpDelta value={delta} suffix="7d" />
      </div>
      <SaveButton marketId={market.id} label={market.title} className="relative z-10" />
    </div>
  );
}
