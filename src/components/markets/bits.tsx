import { Bookmark, BookmarkCheck, TrendingDown, TrendingUp } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useMotionOK } from '@/components/motion/useMotionOK';
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
    <span className={cn('relative inline-flex items-center gap-1 text-xs font-semibold tabular', up ? 'text-yes' : 'text-no', className)}>
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
  const ok = useMotionOK();
  // Pop on toggle, with a soft ring when something gets saved.
  const icon = (size: string) => (
    <span className="relative inline-flex">
      <motion.span
        key={saved ? 'on' : 'off'}
        className="inline-flex"
        initial={ok ? { scale: 0.55, rotate: saved ? -12 : 0 } : false}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 520, damping: 14 }}
      >
        <Icon className={cn(size, saved && 'fill-accent/25')} />
      </motion.span>
      <AnimatePresence>
        {ok && saved && (
          <motion.span
            key="ring"
            className="pointer-events-none absolute inset-[-6px] rounded-full border border-accent/70"
            initial={{ scale: 0.4, opacity: 0.9 }}
            animate={{ scale: 1.5, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.55, ease: 'easeOut' }}
          />
        )}
      </AnimatePresence>
    </span>
  );
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
          saved ? 'border-accent/60 bg-accent-soft text-accent' : 'border-ink/25 bg-ink/5 text-ink hover:bg-ink/10',
          className,
        )}
      >
        {icon('h-5 w-5')}
      </button>
    );
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={saved}
      aria-label={aria}
      className={cn(
        'inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition hover:bg-ink/8',
        saved ? 'text-accent' : 'text-muted hover:text-ink',
        className,
      )}
    >
      {icon('h-[18px] w-[18px]')}
    </button>
  );
}

const STATUS_COPY: Record<MarketStatus, { label: string; cls: string }> = {
  OPEN: { label: 'Open', cls: 'border-yes/30 bg-yes-soft text-yes' },
  UPCOMING: { label: 'Upcoming', cls: 'border-line-strong bg-ink/5 text-ink-2' },
  SUSPENDED: { label: 'Paused', cls: 'border-warn/40 bg-warn-soft text-warn' },
  CLOSED: { label: 'Closed', cls: 'border-line-strong bg-ink/5 text-ink-2' },
  PENDING_RESOLUTION: { label: 'Awaiting result', cls: 'border-warn/40 bg-warn-soft text-warn' },
  RESOLVED: { label: 'Resolved', cls: 'border-accent/40 bg-accent-soft text-accent' },
  VOIDED: { label: 'Voided', cls: 'border-line-strong bg-ink/5 text-ink-2' },
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
