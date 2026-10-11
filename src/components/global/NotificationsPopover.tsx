import { useEffect, useId, useRef, useState } from 'react';
import { motion, useAnimationControls } from 'motion/react';
import { useMotionOK } from '@/components/motion/useMotionOK';
import { ActivePill } from '@/components/motion/ActivePill';
import { useNavigate } from 'react-router';
import { Bell, BellRing, CheckCheck, CircleDollarSign, Gavel, LineChart, ListX, ReceiptText, Timer, TriangleAlert, Wallet } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useStore } from '@/state/store';
import { useUi } from '@/state/ui';
import { unreadCount } from '@/domain/selectors';
import type { AppNotification, NotificationKind } from '@/domain/types';
import { ago } from '@/lib/format';
import { DEMO_NOW } from '@/lib/hooks';
import { cn } from '@/lib/cn';

const ICONS: Record<NotificationKind, { icon: typeof Bell; cls: string }> = {
  MARKET_MOVE: { icon: LineChart, cls: 'bg-yes-soft text-yes' },
  ORDER_FILLED: { icon: ReceiptText, cls: 'bg-accent-soft text-accent' },
  POSITION_SOLD: { icon: CircleDollarSign, cls: 'bg-yes-soft text-yes' },
  LIMIT_PLACED: { icon: Timer, cls: 'bg-accent-soft text-accent' },
  LIMIT_CANCELLED: { icon: ListX, cls: 'bg-white/8 text-ink-2' },
  FUNDS_ADDED: { icon: Wallet, cls: 'bg-accent-soft text-accent' },
  MARKET_RESOLVED: { icon: Gavel, cls: 'bg-warn-soft text-warn' },
  MARKET_STATUS: { icon: TriangleAlert, cls: 'bg-warn-soft text-warn' },
  QUOTE_CHANGED: { icon: TriangleAlert, cls: 'bg-warn-soft text-warn' },
};

function Item({ n, onOpen }: { n: AppNotification; onOpen: (n: AppNotification) => void }) {
  const { icon: Icon, cls } = ICONS[n.kind];
  return (
    <li>
      <button
        type="button"
        onClick={() => onOpen(n)}
        className="flex w-full items-start gap-3 rounded-xl px-3 py-3 text-left transition hover:bg-white/[0.04]"
      >
        <span className={cn('mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full', cls)}>
          <Icon className="h-4 w-4" aria-hidden />
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-start justify-between gap-2">
            <span className={cn('text-sm font-semibold', n.readAt ? 'text-ink-2' : 'text-ink')}>{n.title}</span>
            <span className="flex shrink-0 items-center gap-1.5 text-[11px] text-subtle">
              {ago(n.createdAt, DEMO_NOW) === 'Just now' ? 'This session' : ago(n.createdAt, DEMO_NOW)}
              {!n.readAt && <span className="h-2 w-2 rounded-full bg-accent" aria-label="Unread" />}
            </span>
          </span>
          <span className="mt-0.5 block text-[13px] leading-snug text-muted">{n.text}</span>
        </span>
      </button>
    </li>
  );
}

export function NotificationsPopover() {
  const open = useUi((s) => s.overlay === 'bell');
  const setOverlay = useUi((s) => s.setOverlay);
  const user = useStore((s) => s.user);
  const markRead = useStore((s) => s.markRead);
  const markAllRead = useStore((s) => s.markAllRead);
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const unread = unreadCount(user);
  const pillId = useId();
  const motionOK = useMotionOK();
  const bellControls = useAnimationControls();
  const prevUnread = useRef(unread);
  // A short ring when a new notification arrives (never on first render or when reading).
  useEffect(() => {
    if (unread > prevUnread.current && motionOK) {
      void bellControls.start({ rotate: [0, -16, 14, -10, 6, -3, 0], transition: { duration: 0.8, ease: 'easeInOut' } });
    }
    prevUnread.current = unread;
  }, [unread, motionOK, bellControls]);
  const list = [...user.notifications].sort((a, b) => b.seq - a.seq).filter((n) => (filter === 'unread' ? !n.readAt : true));

  const openItem = (n: AppNotification) => {
    markRead(n.id);
    setOverlay(null);
    navigate(n.targetPath);
  };

  return (
    <Popover open={open} onOpenChange={(o) => setOverlay(o ? 'bell' : null)}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="relative inline-flex h-10 w-10 items-center justify-center rounded-full text-ink-2 transition hover:bg-white/8 hover:text-ink"
          aria-label={unread ? `Notifications, ${unread} unread` : 'Notifications'}
        >
          <motion.span animate={bellControls} className="inline-flex origin-top">
            {unread ? <BellRing className="h-5 w-5" /> : <Bell className="h-5 w-5" />}
          </motion.span>
          {unread > 0 && (
            <motion.span
              key={unread}
              initial={motionOK ? { scale: 0.3 } : false}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 600, damping: 15 }}
              className="absolute right-1 top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-danger px-1 text-[10px] font-bold text-white tabular"
            >
              {unread > 9 ? '9+' : unread}
            </motion.span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[min(92vw,400px)] p-0" aria-label="Notifications">
        <div className="flex items-center justify-between px-4 pb-2 pt-4">
          <h2 className="text-base font-semibold">Notifications</h2>
          <button
            type="button"
            onClick={markAllRead}
            disabled={unread === 0}
            className="inline-flex items-center gap-1 text-xs font-medium text-accent disabled:text-subtle"
          >
            <CheckCheck className="h-3.5 w-3.5" /> Mark all as read
          </button>
        </div>
        <div className="flex gap-1 px-4 pb-2" role="group" aria-label="Filter notifications">
          {(['all', 'unread'] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              aria-pressed={filter === f}
              className={cn(
                'relative rounded-full px-3 py-1 text-xs font-medium transition-colors',
                filter === f ? 'text-ink' : 'text-muted hover:text-ink',
              )}
            >
              {filter === f && <ActivePill layoutId={`${pillId}-bell-filter`} className="bg-white/10" />}
              <span className="relative">{f === 'all' ? 'All' : `Unread${unread ? ` (${unread})` : ''}`}</span>
            </button>
          ))}
        </div>
        <div className="max-h-[min(60vh,440px)] overflow-y-auto px-1.5 pb-2">
          {list.length === 0 ? (
            <div className="px-6 py-10 text-center">
              <Bell className="mx-auto h-6 w-6 text-subtle" aria-hidden />
              <p className="mt-2 text-sm text-ink-2">{filter === 'unread' ? 'You’re all caught up.' : 'No notifications yet.'}</p>
              <p className="mt-1 text-xs text-muted">Trades, orders and demo events will appear here.</p>
            </div>
          ) : (
            <ul>
              {list.map((n) => (
                <Item key={n.id} n={n} onOpen={openItem} />
              ))}
            </ul>
          )}
        </div>
        <p className="border-t border-line px-4 py-2.5 text-[11px] text-subtle">Simulated alerts from your demo session only.</p>
      </PopoverContent>
    </Popover>
  );
}
