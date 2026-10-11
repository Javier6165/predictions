import { Link } from 'react-router';
import { categoryByName } from '@/data/categories';
import { changePp, leadOutcome } from '@/domain/selectors';
import type { Market } from '@/domain/types';
import { formatCompactMoney, formatDate } from '@/lib/format';
import { cn } from '@/lib/cn';
import { MarketThumb } from '@/components/art/MarketArt';
import { PpDelta, SaveButton, StatusBadge } from './bits';

/** List row used in Explore groups/results: question first, indicative probability second. */
export function MarketRow({ market, rank, compact = false }: { market: Market; rank?: number; compact?: boolean }) {
  const lead = leadOutcome(market);
  const multi = market.type === 'MULTI_OUTCOME';
  const delta = changePp(market, lead.id);
  const resolved = market.status === 'RESOLVED';
  return (
    <div className="group relative flex items-center gap-3 rounded-xl px-2 py-2.5 transition hover:bg-white/[0.035] sm:gap-4 sm:px-3">
      {rank !== undefined && <span className="w-4 shrink-0 text-center text-sm font-medium text-subtle tabular">{rank}</span>}
      <MarketThumb market={market} className={cn(compact ? 'h-11 w-11' : 'h-12 w-16 sm:h-14 sm:w-24')} />
      <div className="min-w-0 flex-1">
        <Link
          to={`/markets/${market.id}`}
          className="line-clamp-2 text-[14px] font-medium leading-snug text-ink outline-none after:absolute after:inset-0 after:rounded-xl focus-visible:after:outline-2 focus-visible:after:outline-accent sm:text-[15px]"
        >
          {market.question}
        </Link>
        {!compact && (
          <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted">
            <span>{categoryByName(market.category).shortName}</span>
            <span aria-hidden>·</span>
            <span>{resolved ? `Resolved ${formatDate(market.resolvedAt ?? market.closeAt)}` : `Closes ${formatDate(market.closeAt)}`}</span>
            <span aria-hidden className="hidden sm:inline">·</span>
            <span className="hidden sm:inline">{formatCompactMoney(market.activity.volume24hCents)} demo vol.</span>
            {market.status !== 'OPEN' && <StatusBadge status={market.status} />}
          </p>
        )}
      </div>
      <div className="shrink-0 text-right">
        <p className="max-w-24 truncate text-[11px] font-medium text-accent">{multi ? lead.label : 'Yes'}</p>
        <p className="text-lg font-semibold tracking-tight text-ink tabular sm:text-xl">{lead.probabilityCents}%</p>
      </div>
      <div className="hidden w-20 shrink-0 sm:block">
        <PpDelta value={delta} suffix="7d" />
      </div>
      <SaveButton marketId={market.id} label={market.title} className="relative z-10" />
    </div>
  );
}
