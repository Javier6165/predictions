import { useId, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import {
  ArrowDownLeft,
  ArrowRight,
  ArrowUpRight,
  Ban,
  Bookmark,
  CircleDollarSign,
  Clock,
  Gavel,
  Info,
  LineChart,
  ShieldCheck,
  Timer,
  Trophy,
  Wallet,
} from 'lucide-react';
import { catalog } from '@/data/fixtures';
import { categoryByName } from '@/data/categories';
import { proposition, contractLabel } from '@/domain/copy';
import { portfolioSummary, positionViews, openOrders, type PositionView } from '@/domain/selectors';
import type { LedgerEntry, LimitOrder } from '@/domain/types';
import { marketFor, quoteFor, findOutcome } from '@/domain/quotes';
import { useStore } from '@/state/store';
import { AnimatedNumber } from '@/components/motion/AnimatedNumber';
import { Spotlight } from '@/components/motion/Spotlight';
import { ActivePill } from '@/components/motion/ActivePill';
import { useUi } from '@/state/ui';
import { useMarkets, DEMO_NOW } from '@/lib/hooks';
import { MarketThumb } from '@/components/art/MarketArt';
import { SceneArt } from '@/components/art/SceneArt';
import { marketArt } from '@/components/art/MarketArt';
import { MarketRow } from '@/components/markets/MarketRow';
import { StatusBadge } from '@/components/markets/bits';
import { TradeFlowDialog } from '@/components/trading/TradeFlowDialog';
import type { TradeDraft } from '@/components/trading/types';
import { errorCopy } from '@/components/trading/errors';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetDescription, SheetTitle } from '@/components/ui/sheet';
import { Chip } from '@/components/ui/misc';
import { cn } from '@/lib/cn';
import { formatDate, formatMoney, formatPrice, formatReturn, formatSignedMoney, timeLeft } from '@/lib/format';

const TABS = ['active', 'pending', 'history', 'saved'] as const;
type Tab = (typeof TABS)[number];

const pnlClass = (v: number) => (v > 0 ? 'text-yes' : v < 0 ? 'text-no' : 'text-ink-2');

function Summary() {
  const user = useStore((s) => s.user);
  const setDialog = useUi((s) => s.setDialog);
  const s = portfolioSummary(user, catalog);
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-[1fr_1fr_1.35fr]">
      <section className="card flex items-start gap-4 p-5" aria-label="Portfolio value">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-yes-soft text-yes">
          <LineChart className="h-5 w-5" aria-hidden />
        </span>
        <div>
          <p className="text-sm text-muted">Portfolio value</p>
          <AnimatedNumber flash value={s.portfolioValueCents} format={formatMoney} className="mt-0.5 block text-3xl font-semibold tracking-tight tabular" data-testid="portfolio-value" />
          <p className={cn('mt-1 text-sm font-medium tabular', pnlClass(s.totalPnLCents))}>
            {formatSignedMoney(s.totalPnLCents)} ({formatReturn(s.totalPnLCents, s.depositsCents)}) all-time P&amp;L
          </p>
          <p className="mt-1 text-xs text-subtle">Cash + predictions at current probability</p>
        </div>
      </section>
      <section className="card flex items-start gap-4 p-5" aria-label="Cash available">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-accent-soft text-accent">
          <Wallet className="h-5 w-5" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm text-muted">Cash available</p>
          <AnimatedNumber flash value={s.availableCents} format={formatMoney} className="mt-0.5 block text-3xl font-semibold tracking-tight tabular" data-testid="cash-available" />
          {s.reservedCents > 0 ? (
            <p className="mt-1 text-xs text-muted">
              + {formatMoney(s.reservedCents)} held for pending orders · {formatMoney(s.cashTotalCents)} total cash
            </p>
          ) : (
            <p className="mt-1 text-xs text-muted">Nothing held for pending orders</p>
          )}
          <Button size="sm" className="mt-3 w-full sm:w-auto" onClick={() => setDialog('funds')}>
            Add demo funds
          </Button>
        </div>
      </section>
      <section className="card grid gap-4 p-5 sm:grid-cols-[auto_1fr] md:col-span-2 xl:col-span-1" aria-label="Profit and loss">
        <div className="flex items-start gap-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/6 text-ink-2">
            <CircleDollarSign className="h-5 w-5" aria-hidden />
          </span>
          <div>
            <p className="text-sm text-muted">Total profit / loss</p>
            <AnimatedNumber flash value={s.totalPnLCents} format={formatSignedMoney} className={cn('mt-0.5 block text-3xl font-semibold tracking-tight tabular', pnlClass(s.totalPnLCents))} data-testid="total-pnl" />
          </div>
        </div>
        <dl className="grid gap-1 text-sm sm:border-l sm:border-line sm:pl-5">
          {[
            ['Invested in open predictions', formatMoney(s.positionsCostCents), ''],
            ['Their current value', formatMoney(s.positionsMarkedCents), ''],
            ['Unrealized P&L', formatSignedMoney(s.unrealizedPnLCents), pnlClass(s.unrealizedPnLCents)],
            ['Realized P&L', formatSignedMoney(s.realizedPnLCents), pnlClass(s.realizedPnLCents)],
            ['Demo funds added', formatMoney(s.depositsCents), ''],
          ].map(([k, v, c]) => (
            <div key={k} className="flex justify-between gap-3">
              <dt className="text-muted">{k}</dt>
              <dd className={cn('tabular font-medium', c || 'text-ink')} data-testid={`sum-${k.toLowerCase().replace(/[^a-z]+/g, '-')}`}>
                {v}
              </dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}

function SideChip({ side, label }: { side: 'YES' | 'NO'; label: string }) {
  return (
    <span className={cn('rounded-full px-2 py-0.5 text-[11px] font-semibold', side === 'YES' ? 'bg-yes-soft text-yes' : 'bg-no-soft text-no')}>
      {label}
    </span>
  );
}

function PredictionCard({ v, selected, onManage }: { v: PositionView; selected: boolean; onManage: () => void }) {
  const m = v.market;
  return (
    <Spotlight
      as="article"
      className={cn('card lift group flex flex-col gap-4 p-4 sm:flex-row sm:items-center', selected ? 'border-accent/60 ring-1 ring-accent/40' : '')}
      aria-label={proposition(m, v.position.outcomeId, v.position.side)}
    >
      <div className="flex min-w-0 flex-1 gap-4">
        <MarketThumb market={m} className="h-20 w-24 sm:h-24 sm:w-32" />
        <div className="min-w-0">
          <div className="flex flex-wrap gap-1.5">
            <Chip className="py-0.5 text-[11px]">{categoryByName(m.category).shortName}</Chip>
            <SideChip side={v.position.side} label={contractLabel(m, v.position.outcomeId, v.position.side)} />
            {m.status !== 'OPEN' && <StatusBadge status={m.status} />}
          </div>
          <h3 className="mt-1.5 text-[15px] font-semibold leading-snug sm:text-base">{proposition(m, v.position.outcomeId, v.position.side)}</h3>
          <p className="mt-1 flex items-center gap-1.5 text-xs text-muted">
            <Clock className="h-3.5 w-3.5" aria-hidden /> Closes {formatDate(m.closeAt)} · {timeLeft(m.closeAt, DEMO_NOW)}
          </p>
        </div>
      </div>
      <div className="flex items-end justify-between gap-4 sm:w-[340px] sm:shrink-0 sm:flex-col sm:items-stretch">
        <dl className="grid grid-cols-3 gap-3 text-sm">
          <div>
            <dt className="text-xs text-muted">Invested</dt>
            <dd className="font-medium tabular">{formatMoney(v.position.costBasisCents)}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted">Current value</dt>
            <dd className={cn('font-medium tabular', pnlClass(v.unrealizedPnLCents))}>{formatMoney(v.markedValueCents)}</dd>
          </div>
          <div className="text-right">
            <dt className="sr-only">Profit or loss</dt>
            <dd className={cn('font-semibold tabular', pnlClass(v.unrealizedPnLCents))}>{formatSignedMoney(v.unrealizedPnLCents)}</dd>
            <dd className={cn('text-xs tabular', pnlClass(v.unrealizedPnLCents))}>{formatReturn(v.unrealizedPnLCents, v.position.costBasisCents)}</dd>
          </div>
        </dl>
        <div className="flex shrink-0 gap-2 sm:grid sm:grid-cols-2">
          <Button asChild variant="secondary" size="sm" className="hidden sm:inline-flex">
            <Link to={`/markets/${m.id}`}>View prediction</Link>
          </Button>
          <Button size="sm" onClick={onManage} aria-pressed={selected}>
            Manage
          </Button>
        </div>
      </div>
    </Spotlight>
  );
}

function PositionPanel({ v, onSell }: { v: PositionView; onSell: () => void }) {
  const [tab, setTab] = useState<'position' | 'market'>('position');
  const m = v.market;
  const p = v.position;
  const outcome = findOutcome(m, p.outcomeId);
  return (
    <div>
      <div className="relative h-36 overflow-hidden rounded-2xl">
        <SceneArt art={marketArt(m)} seed={m.id} />
        <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent" />
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        <Chip className="py-0.5 text-[11px]">{categoryByName(m.category).shortName}</Chip>
        <SideChip side={p.side} label={contractLabel(m, p.outcomeId, p.side)} />
      </div>
      <p className="mt-2 text-xs font-medium uppercase tracking-wide text-muted">You’re backing</p>
      <h2 className="mt-0.5 text-lg font-semibold leading-snug">{proposition(m, p.outcomeId, p.side)}</h2>
      <p className="mt-1 text-xs text-muted">
        Closes {formatDate(m.closeAt)} · {timeLeft(m.closeAt, DEMO_NOW)}
      </p>

      <div className="mt-4 grid grid-cols-2 border-b border-line" role="tablist" aria-label="Position details">
        {(['position', 'market'] as const).map((t) => (
          <button
            key={t}
            type="button"
            role="tab"
            aria-selected={tab === t}
            onClick={() => setTab(t)}
            className={cn('-mb-px border-b-2 py-2.5 text-sm font-medium', tab === t ? 'border-accent text-ink' : 'border-transparent text-muted hover:text-ink')}
          >
            {t === 'position' ? 'Your position' : 'Market info'}
          </button>
        ))}
      </div>

      {tab === 'position' ? (
        <>
          <dl className="mt-3 grid gap-1 text-sm">
            {[
              ['Position', `${p.quantity} contracts (${p.side === 'YES' ? 'Yes' : 'No'})`, ''],
              ['Average price paid', formatPrice(v.averagePriceCents), ''],
              ['Current probability', `${v.markCents}%`, ''],
              ['Invested', formatMoney(p.costBasisCents), ''],
              ['Current value', formatMoney(v.markedValueCents), ''],
              ['Unrealized P&L', `${formatSignedMoney(v.unrealizedPnLCents)} (${formatReturn(v.unrealizedPnLCents, p.costBasisCents)})`, pnlClass(v.unrealizedPnLCents)],
            ].map(([k, val, c]) => (
              <div key={k} className="flex justify-between gap-3 py-1">
                <dt className="text-muted">{k}</dt>
                <dd className={cn('text-right font-medium tabular', c)}>{val}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <Button onClick={onSell} disabled={v.bidCents === null}>
              Sell position
            </Button>
            <Button asChild variant="secondary" aria-disabled={v.askCents === null}>
              <Link to={`/markets/${m.id}?outcome=${p.outcomeId}&side=${p.side}`}>Buy more</Link>
            </Button>
          </div>
          <div className="mt-4 flex items-center gap-3 rounded-2xl border border-line bg-white/[0.03] p-3.5">
            <Trophy className="h-6 w-6 shrink-0 text-warn" aria-hidden />
            <dl className="grid flex-1 grid-cols-2 gap-2 text-sm">
              <div>
                <dt className="text-xs text-muted">Payout if right</dt>
                <dd className="font-semibold tabular">{formatMoney(v.payoutIfRightCents)}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted">Potential profit</dt>
                <dd className={cn('font-semibold tabular', pnlClass(v.profitIfRightCents))}>
                  {formatSignedMoney(v.profitIfRightCents)} ({formatReturn(v.profitIfRightCents, p.costBasisCents)})
                </dd>
              </div>
            </dl>
          </div>
          <p className="mt-3 text-xs leading-relaxed text-muted">
            {v.liquidationValueCents !== null && v.bidCents !== null
              ? `Selling everything now would return about ${formatMoney(v.liquidationValueCents)} at the current sell price of ${formatPrice(v.bidCents)} — not the same as the current value, which uses the probability.`
              : 'This market can’t be traded right now, so the position can’t be sold.'}
          </p>
        </>
      ) : (
        <div className="mt-3 grid gap-3 text-sm">
          <p className="font-medium">{m.question}</p>
          <dl className="grid gap-1">
            <div className="flex justify-between py-1">
              <dt className="text-muted">Status</dt>
              <dd>
                <StatusBadge status={m.status} />
              </dd>
            </div>
            <div className="flex justify-between py-1">
              <dt className="text-muted">{m.type === 'MULTI_OUTCOME' ? `${outcome?.label} probability` : 'Chance of Yes'}</dt>
              <dd className="font-medium tabular">{outcome?.probabilityCents}%</dd>
            </div>
            <div className="flex justify-between py-1">
              <dt className="text-muted">Buy / sell now</dt>
              <dd className="tabular">{v.askCents !== null && v.bidCents !== null ? `${formatPrice(v.askCents)} / ${formatPrice(v.bidCents)}` : '—'}</dd>
            </div>
          </dl>
          <p className="text-ink-2">
            <span className="font-semibold text-yes">YES</span> — {m.resolutionRule.yesCondition}
          </p>
        </div>
      )}
      <Link to={`/markets/${m.id}`} className="mt-4 inline-flex items-center gap-1 text-sm text-accent hover:underline">
        View full market <ArrowRight className="h-3.5 w-3.5" aria-hidden />
      </Link>
    </div>
  );
}

function EmptyActive() {
  const markets = useMarkets();
  const ideas = useMemo(() => [...markets].filter((m) => m.status === 'OPEN').sort((a, b) => b.activity.trendingScore - a.activity.trendingScore).slice(0, 3), [markets]);
  return (
    <div className="card p-6 sm:p-8">
      <div className="max-w-lg">
        <h2 className="text-xl font-semibold">You don’t have any predictions yet</h2>
        <p className="mt-2 text-sm text-ink-2">
          Pick a question, choose Yes or No and decide how much demo money to put behind it. You’ll always review the full picture — what you could win and
          what you could lose — before confirming.
        </p>
        <Button asChild size="lg" className="mt-5">
          <Link to="/explore">
            Explore markets <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
      <h3 className="mt-8 text-sm font-semibold text-ink-2">Popular in the demo right now</h3>
      <div className="mt-2 divide-y divide-line">
        {ideas.map((m) => (
          <MarketRow key={m.id} market={m} />
        ))}
      </div>
    </div>
  );
}

const KIND_META: Record<LedgerEntry['kind'], { label: string; icon: typeof Clock; cls: string }> = {
  BUY: { label: 'Bought', icon: ArrowUpRight, cls: 'bg-accent-soft text-accent' },
  SELL: { label: 'Sold', icon: ArrowDownLeft, cls: 'bg-yes-soft text-yes' },
  LIMIT_PLACED: { label: 'Limit order placed', icon: Timer, cls: 'bg-white/6 text-ink-2' },
  LIMIT_CANCELLED: { label: 'Limit order cancelled', icon: Ban, cls: 'bg-white/6 text-ink-2' },
  LIMIT_FILLED: { label: 'Limit order filled', icon: ArrowUpRight, cls: 'bg-accent-soft text-accent' },
  DEPOSIT: { label: 'Demo funds added', icon: Wallet, cls: 'bg-accent-soft text-accent' },
  SETTLEMENT: { label: 'Settled', icon: Gavel, cls: 'bg-warn-soft text-warn' },
};

const isSessionEntry = (e: LedgerEntry) => /^ledger-\d+$/.test(e.id);

const HISTORY_FILTERS: { id: string; label: string; match: (e: LedgerEntry) => boolean }[] = [
  { id: 'all', label: 'All', match: () => true },
  { id: 'trades', label: 'Trades', match: (e) => e.kind === 'BUY' || e.kind === 'SELL' || e.kind === 'LIMIT_FILLED' },
  { id: 'orders', label: 'Orders', match: (e) => e.kind === 'LIMIT_PLACED' || e.kind === 'LIMIT_CANCELLED' },
  { id: 'settled', label: 'Settled', match: (e) => e.kind === 'SETTLEMENT' },
  { id: 'funds', label: 'Funds', match: (e) => e.kind === 'DEPOSIT' },
];

function HistoryRow({ e }: { e: LedgerEntry }) {
  const meta = KIND_META[e.kind];
  const market = e.marketId ? catalog.byId.get(e.marketId) : undefined;
  const statement = market && e.outcomeId && e.side ? proposition(market, e.outcomeId, e.side) : null;
  let detail = '';
  if (e.kind === 'LIMIT_FILLED') detail = `${e.quantity} contracts at your ${formatPrice(e.priceCents ?? 0)} limit`;
  if (e.kind === 'BUY' || e.kind === 'SELL') detail = `${e.quantity} contracts at ${formatPrice(e.priceCents ?? 0)}`;
  if (e.kind === 'LIMIT_PLACED' || e.kind === 'LIMIT_CANCELLED') detail = `${e.quantity} contracts · limit ${formatPrice(e.priceCents ?? 0)} · no cash moved`;
  if (e.kind === 'SETTLEMENT') detail = `${e.quantity} contracts · ${e.won ? 'prediction correct, paid $1.00 each' : 'prediction incorrect, paid $0'}`;
  if (e.kind === 'DEPOSIT') detail = 'Virtual money — not profit';
  const label = meta.label;
  return (
    <li className="flex items-start gap-3 px-3 py-3.5 sm:px-4">
      <span className={cn('mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full', meta.cls)}>
        <meta.icon className="h-4 w-4" aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold">
          {e.kind === 'SETTLEMENT' ? (
            <span className={cn('mr-1 rounded-full px-2 py-0.5 text-[11px] font-semibold', e.won ? 'bg-yes-soft text-yes' : 'bg-white/8 text-ink-2')}>
              {e.won ? 'Won' : 'Lost'}
            </span>
          ) : null}
          {label}
          <span className="ml-2 text-xs font-normal text-subtle">{isSessionEntry(e) ? 'This session' : formatDate(e.createdAt)}</span>
        </p>
        {statement && <p className="mt-0.5 text-sm text-ink-2">{statement}</p>}
        <p className="mt-0.5 text-xs text-muted">{detail}</p>
      </div>
      <div className="shrink-0 text-right">
        <p className={cn('text-sm font-semibold tabular', e.cashDeltaCents > 0 ? 'text-yes' : e.cashDeltaCents < 0 ? 'text-ink' : 'text-muted')}>
          {e.cashDeltaCents === 0 ? '$0.00' : formatSignedMoney(e.cashDeltaCents)}
        </p>
        {e.realizedPnLCents !== undefined && (
          <p className={cn('text-xs tabular', pnlClass(e.realizedPnLCents))}>P&amp;L {formatSignedMoney(e.realizedPnLCents)}</p>
        )}
      </div>
    </li>
  );
}

function PendingRow({ o, onCancel, onSimulateFill }: { o: LimitOrder; onCancel: () => void; onSimulateFill: () => void }) {
  const user = useStore((s) => s.user);
  const market = marketFor(user, catalog.byId.get(o.marketId)!);
  const q = quoteFor(findOutcome(market, o.outcomeId)!, o.side);
  return (
    <li className="card flex flex-col gap-4 p-4 sm:flex-row sm:flex-wrap sm:items-center">
      <div className="flex min-w-0 flex-1 gap-4">
        <MarketThumb market={market} className="h-16 w-20" />
        <div className="min-w-0">
          <div className="flex flex-wrap gap-1.5">
            <Chip className="py-0.5 text-[11px]">{categoryByName(market.category).shortName}</Chip>
            <span className="rounded-full bg-accent-soft px-2 py-0.5 text-[11px] font-semibold text-accent">Open</span>
          </div>
          <p className="mt-1.5 font-medium leading-snug">{proposition(market, o.outcomeId, o.side)}</p>
          <p className="mt-0.5 text-xs text-muted">
            Buy {o.requestedQuantity} {o.side === 'YES' ? 'Yes' : 'No'} contracts · limit {formatPrice(o.limitPriceCents)}
            {q ? ` · current price ${formatPrice(q.askCents)}` : ''} · {o.filledQuantity}/{o.requestedQuantity} filled
          </p>
        </div>
      </div>
      <div className="flex items-center justify-between gap-4 sm:justify-end">
        <div className="text-right">
          <p className="text-xs text-muted">Cash held</p>
          <p className="font-semibold tabular">{formatMoney(o.reservedCashCents)}</p>
        </div>
        <Button variant="secondary" onClick={onCancel}>
          Cancel order
        </Button>
      </div>
      <button
        type="button"
        onClick={onSimulateFill}
        disabled={!q}
        className="self-start text-left text-xs text-muted underline-offset-4 hover:text-ink hover:underline disabled:no-underline disabled:opacity-50 sm:basis-full sm:pl-24"
      >
        Demo: simulate a seller at {formatPrice(o.limitPriceCents)}
      </button>
    </li>
  );
}

export function PortfolioPage() {
  const user = useStore((s) => s.user);
  const cancelOrder = useStore((s) => s.cancelOrder);
  const toast = useUi((s) => s.toast);
  const markets = useMarkets();
  const [params, setParams] = useSearchParams();
  const tab: Tab = (TABS as readonly string[]).includes(params.get('tab') ?? '') ? (params.get('tab') as Tab) : 'active';
  const views = positionViews(user, catalog);
  const orders = openOrders(user);
  const history = [...user.ledger].sort((a, b) => b.seq - a.seq);
  const saved = user.savedMarketIds.map((id) => markets.find((m) => m.id === id)).filter((m): m is NonNullable<typeof m> => !!m);
  const selectedId = params.get('position') ?? views[0]?.position.id;
  const selected = views.find((v) => v.position.id === selectedId) ?? views[0];

  const [sellDraft, setSellDraft] = useState<TradeDraft | null>(null);
  const [cancelId, setCancelId] = useState<string | null>(null);
  const [panelSheet, setPanelSheet] = useState(false);
  const cancelTarget = orders.find((o) => o.id === cancelId);
  const fillOrder = useStore((s) => s.fillOrder);
  const pillId = useId();
  const historyFilter = HISTORY_FILTERS.find((f) => f.id === params.get('filter')) ?? HISTORY_FILTERS[0];
  const filteredHistory = history.filter(historyFilter.match);
  const setHistoryFilter = (id: string) => {
    const next = new URLSearchParams(params);
    next.set('tab', 'history');
    if (id === 'all') next.delete('filter');
    else next.set('filter', id);
    next.delete('position');
    setParams(next, { replace: true });
  };
  const settledThisSession = history.filter((e) => e.kind === 'SETTLEMENT' && isSessionEntry(e));
  const settledPnL = settledThisSession.reduce((sum, e) => sum + (e.realizedPnLCents ?? 0), 0);
  const simulateFill = (orderId: string) => {
    const r = fillOrder(orderId);
    if (r.ok)
      toast({
        title: 'Limit order filled',
        description: `${r.receipt.quantity} contracts at ${formatPrice(r.receipt.priceCents)} — the held ${formatMoney(r.receipt.amountCents)} became their cost.`,
        tone: 'success',
      });
    else toast({ title: errorCopy(r.error), tone: 'warn' });
  };

  const setTab = (t: string) => {
    const next = new URLSearchParams(params);
    next.set('tab', t);
    next.delete('position');
    setParams(next, { replace: true });
  };
  const manage = (id: string) => {
    const next = new URLSearchParams(params);
    next.set('tab', 'active');
    next.set('position', id);
    setParams(next, { replace: true });
    if (window.matchMedia('(max-width: 1023px)').matches) setPanelSheet(true);
  };
  const openSell = (positionId: string) => {
    // Pin the selection so the panel stays on this prediction after a partial sale.
    const next = new URLSearchParams(params);
    next.set('position', positionId);
    setParams(next, { replace: true });
    setPanelSheet(false);
    setSellDraft({ kind: 'sell', positionId, quantity: 0 });
  };
  const confirmCancel = () => {
    if (!cancelTarget) return;
    const r = cancelOrder(cancelTarget.id);
    setCancelId(null);
    if (r.ok) toast({ title: 'Limit order cancelled', description: `${formatMoney(cancelTarget.reservedCashCents)} is available again.`, tone: 'success' });
    else toast({ title: errorCopy(r.error), tone: 'warn' });
  };

  const counts: Record<Tab, number> = { active: views.length, pending: orders.length, history: history.length, saved: saved.length };
  const labels: Record<Tab, string> = { active: 'Active predictions', pending: 'Pending orders', history: 'History', saved: 'Saved markets' };

  return (
    <div className="mx-auto max-w-[1320px] px-4 pt-8 sm:px-6 sm:pt-10 lg:px-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-4xl font-semibold tracking-[-0.03em] sm:text-5xl">Your predictions</h1>
          <p className="mt-2 text-ink-2">Track what you’ve predicted, manage positions and see how they’re doing.</p>
        </div>
        <div className="glass flex max-w-md items-start gap-3 rounded-2xl px-4 py-3">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-accent" aria-hidden />
          <div>
            <p className="text-sm font-semibold">You’re using demo funds</p>
            <p className="text-xs text-muted">Virtual money and simulated markets. No real money is involved.</p>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <Summary />
      </div>

      <Tabs value={tab} onValueChange={setTab} className="mt-8">
        <TabsList aria-label="Portfolio sections" activeValue={tab}>
          {TABS.map((t) => (
            <TabsTrigger key={t} value={t}>
              {labels[t]}
              <span className={cn('rounded-full px-1.5 py-0.5 text-[11px] tabular', tab === t ? 'bg-cta text-white' : 'bg-white/8 text-ink-2')}>{counts[t]}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="active" className="mt-6 outline-none">
          {settledThisSession.length > 0 && (
            <div className="card mb-4 flex flex-wrap items-center gap-3 border-yes/30 p-4">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-yes-soft text-yes">
                <Trophy className="h-5 w-5" aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">
                  {settledThisSession.length} prediction{settledThisSession.length === 1 ? '' : 's'} settled this session ·{' '}
                  {settledThisSession.filter((e) => e.won).length} correct
                </p>
                <p className={cn('text-xs tabular', pnlClass(settledPnL))}>Realized {formatSignedMoney(settledPnL)} from settlements</p>
              </div>
              <Button size="sm" variant="secondary" onClick={() => setHistoryFilter('settled')}>
                View settled
              </Button>
            </div>
          )}
          {views.length === 0 ? (
            <EmptyActive />
          ) : (
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
              <div className="stagger grid content-start gap-3">
                {views.map((v) => (
                  <PredictionCard key={v.position.id} v={v} selected={selected?.position.id === v.position.id} onManage={() => manage(v.position.id)} />
                ))}
                <section className="card mt-3 p-4 sm:p-5" aria-labelledby="recent-title">
                  <div className="flex items-center justify-between">
                    <h2 id="recent-title" className="font-semibold">
                      Recent activity
                    </h2>
                    <button type="button" onClick={() => setTab('history')} className="inline-flex items-center gap-1 text-sm text-ink-2 hover:text-ink">
                      View all <ArrowRight className="h-4 w-4" aria-hidden />
                    </button>
                  </div>
                  <ul className="mt-2 divide-y divide-line">
                    {history.slice(0, 4).map((e) => (
                      <HistoryRow key={e.id} e={e} />
                    ))}
                  </ul>
                </section>
              </div>
              {selected && (
                <aside className="card sticky top-[84px] hidden h-fit p-5 lg:block" aria-label="Selected position">
                  <div key={selected.position.id} className="animate-fade-in">
                    <PositionPanel v={selected} onSell={() => openSell(selected.position.id)} />
                  </div>
                </aside>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="pending" className="mt-6 outline-none">
          {orders.length === 0 ? (
            <div className="card p-8 text-center">
              <Timer className="mx-auto h-7 w-7 text-subtle" aria-hidden />
              <p className="mt-3 font-medium">No pending orders</p>
              <p className="mx-auto mt-1 max-w-md text-sm text-muted">
                Limit orders let you buy only at your price. Open any market, expand “Advanced: limit order” in the ticket and set your price.
              </p>
              <Button asChild variant="secondary" className="mt-5">
                <Link to="/explore">Find a market</Link>
              </Button>
            </div>
          ) : (
            <>
              <p className="mb-3 flex items-center gap-2 text-sm text-muted">
                <Info className="h-4 w-4" aria-hidden /> Pending orders hold cash until they fill or you cancel. In this demo nothing fills on its own — use “simulate a seller” to see a fill.
              </p>
              <ul className="stagger grid gap-3">
                {orders.map((o) => (
                  <PendingRow key={o.id} o={o} onCancel={() => setCancelId(o.id)} onSimulateFill={() => simulateFill(o.id)} />
                ))}
              </ul>
            </>
          )}
        </TabsContent>

        <TabsContent value="history" className="mt-6 outline-none">
          <div className="mb-3 flex flex-wrap gap-2" role="group" aria-label="Filter history">
            {HISTORY_FILTERS.map((f) => {
              const n = history.filter(f.match).length;
              return (
                <button
                  key={f.id}
                  type="button"
                  aria-pressed={historyFilter.id === f.id}
                  onClick={() => setHistoryFilter(f.id)}
                  className={cn(
                    'relative rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
                    historyFilter.id === f.id ? 'border-accent text-ink' : 'border-line-strong text-ink-2 hover:text-ink',
                  )}
                >
                  {historyFilter.id === f.id && <ActivePill layoutId={`${pillId}-history`} className="bg-accent-soft" />}
                  <span className="relative">
                    {f.label} <span className="text-muted tabular">{n}</span>
                  </span>
                </button>
              );
            })}
          </div>
          {filteredHistory.length === 0 ? (
            <p className="card p-8 text-center text-sm text-muted">Nothing here yet.</p>
          ) : (
            <ul className="card divide-y divide-line p-1">
              {filteredHistory.map((e) => (
                <HistoryRow key={e.id} e={e} />
              ))}
            </ul>
          )}
        </TabsContent>

        <TabsContent value="saved" className="mt-6 outline-none">
          {saved.length === 0 ? (
            <div className="card p-8 text-center">
              <Bookmark className="mx-auto h-7 w-7 text-subtle" aria-hidden />
              <p className="mt-3 font-medium">No saved markets</p>
              <p className="mx-auto mt-1 max-w-md text-sm text-muted">Tap the bookmark on any market to keep it here. Saving never places a trade.</p>
              <Button asChild variant="secondary" className="mt-5">
                <Link to="/explore">Browse markets</Link>
              </Button>
            </div>
          ) : (
            <div className="card divide-y divide-line p-2">
              {saved.map((m) => (
                <MarketRow key={m.id} market={m} />
              ))}
            </div>
          )}
          {saved.length > 0 && <p className="mt-3 text-xs text-subtle">Saved markets are bookmarks only — they aren’t positions.</p>}
        </TabsContent>
      </Tabs>

      <Sheet open={panelSheet && !!selected} onOpenChange={setPanelSheet}>
        <SheetContent side="bottom" className="px-4 pb-6 pt-3">
          <SheetTitle className="sr-only">Selected position</SheetTitle>
          <SheetDescription className="sr-only">Details and actions for this prediction</SheetDescription>
          {selected && <PositionPanel v={selected} onSell={() => openSell(selected.position.id)} />}
        </SheetContent>
      </Sheet>

      <Dialog open={!!cancelTarget} onOpenChange={(o) => !o && setCancelId(null)}>
        <DialogContent className="p-6 sm:p-7">
          <DialogTitle>Cancel this limit order?</DialogTitle>
          {cancelTarget && (
            <DialogDescription className="mt-2">
              {formatMoney(cancelTarget.reservedCashCents)} held for {cancelTarget.requestedQuantity} contracts at {formatPrice(cancelTarget.limitPriceCents)} will be
              released to your available cash. No fees, nothing is bought.
            </DialogDescription>
          )}
          <div className="mt-6 flex gap-3">
            <Button variant="secondary" className="flex-1" size="lg" onClick={() => setCancelId(null)}>
              Keep order
            </Button>
            <Button className="flex-1" size="lg" onClick={confirmCancel}>
              Cancel order
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <TradeFlowDialog draft={sellDraft} startAtConfigure onClose={() => setSellDraft(null)} />
    </div>
  );
}
