import { Bookmark, BookmarkCheck, TrendingDown, TrendingUp } from 'lucide-react';
import { useStore } from '@/state/store';
import { useUi } from '@/state/ui';
import { useIsSaved } from '@/lib/hooks';
import { cn } from '@/lib/cn';
import { formatPp } from '@/lib/format';
import type { MarketStatus } from '@/domain/types';

/** Probability movement in percentage points. Direction is shown by icon and sign, not color alone. */
export function PpDelta({ value, className, suffix }: { value: number; className?: string; suffix?: string }) {
  if (value === 0) return <span className={cn('text-xs font-medium text-muted tabular', className)}>0 pp</span>;
  const up = value > 0;
  const Icon = up ? TrendingUp : TrendingDown;
  return (
    <span className={cn('inline-flex items-center gap-1 text-xs font-semibold tabular', up ? 'text-yes' : 'text-no', className)}>
      <Icon className="h-3.5 w-3.5" aria-hidden />
      <span>{formatPp(value)}</span>
      {suffix && <span className="font-normal text-muted">{suffix}</span>}
      <span className="sr-only">{up ? 'increase' : 'decrease'} in implied probability</span>
    </span>
  );
}

export function SaveButton({
  marketId,
  className,
  label,
  variant = 'icon',
}: {
  marketId: string;
  className?: string;
  label?: string;
  variant?: 'icon' | 'pill';
}) {
  const saved = useIsSaved(marketId);
  const toggle = useStore((s) => s.toggleSaved);
  const toast = useUi((s) => s.toast);
  const Icon = saved ? BookmarkCheck : Bookmark;
  const onClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggle(marketId);
    toast({ title: saved ? 'Removed from Saved' : 'Saved to your list', description: saved ? undefined : 'Find it in Portfolio → Saved.' });
  };
  const aria = `${saved ? 'Remove' : 'Save'} ${label ?? 'market'}`;
  if (variant === 'pill')
    return (
      <button
        type="button"
        onClick={onClick}
        aria-pressed={saved}
        aria-label={aria}
        className={cn(
          'inline-flex h-12 w-12 items-center justify-center rounded-full border transition',
          saved ? 'border-accent/60 bg-accent-soft text-accent' : 'border-white/25 bg-white/5 text-ink hover:bg-white/10',
          className,
        )}
      >
        <Icon className="h-5 w-5" />
      </button>
    );
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={saved}
      aria-label={aria}
      className={cn(
        'inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition hover:bg-white/8',
        saved ? 'text-accent' : 'text-muted hover:text-ink',
        className,
      )}
    >
      <Icon className={cn('h-[18px] w-[18px]', saved && 'fill-accent/25')} />
    </button>
  );
}

const STATUS_COPY: Record<MarketStatus, { label: string; cls: string }> = {
  OPEN: { label: 'Open', cls: 'border-yes/30 bg-yes-soft text-yes' },
  UPCOMING: { label: 'Upcoming', cls: 'border-line-strong bg-white/5 text-ink-2' },
  SUSPENDED: { label: 'Paused', cls: 'border-warn/40 bg-warn-soft text-warn' },
  CLOSED: { label: 'Closed', cls: 'border-line-strong bg-white/5 text-ink-2' },
  PENDING_RESOLUTION: { label: 'Awaiting result', cls: 'border-warn/40 bg-warn-soft text-warn' },
  RESOLVED: { label: 'Resolved', cls: 'border-accent/40 bg-accent-soft text-[#9cc0ff]' },
  VOIDED: { label: 'Voided', cls: 'border-line-strong bg-white/5 text-ink-2' },
};

export function StatusBadge({ status, className }: { status: MarketStatus; className?: string }) {
  const s = STATUS_COPY[status];
  return (
    <span className={cn('inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide', s.cls, className)}>
      {s.label}
    </span>
  );
}

export const statusLabel = (s: MarketStatus) => STATUS_COPY[s].label;
