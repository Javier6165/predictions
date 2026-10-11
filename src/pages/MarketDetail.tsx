import { useEffect, useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router';
import { ArrowRight, CalendarClock, ChevronRight, Flame, Gavel, Newspaper, ShieldCheck, Sparkles, Trophy } from 'lucide-react';
import { useMarket, DEMO_NOW } from '@/lib/hooks';
import { categoryByName } from '@/data/categories';
import { catalog } from '@/data/fixtures';
import { proposition } from '@/domain/copy';
import { quoteFor, tradeBlock, TRADE_BLOCK_COPY } from '@/domain/quotes';
import { changePp, positionView } from '@/domain/selectors';
import type { Market, Side } from '@/domain/types';
import { useStore } from '@/state/store';
import { SceneArt } from '@/components/art/SceneArt';
import { marketArt } from '@/components/art/MarketArt';
import { PpDelta, SaveButton, StatusBadge } from '@/components/markets/bits';
import { ProbabilityChart, SERIES_COLORS, type ChartRange } from '@/components/markets/ProbabilityChart';
import { TradePanel } from '@/components/trading/TradePanel';
import { TradeFlowDialog } from '@/components/trading/TradeFlowDialog';
import type { TicketState, TradeDraft } from '@/components/trading/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sheet, SheetContent, SheetDescription, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Chip } from '@/components/ui/misc';
import { cn } from '@/lib/cn';
import { ago, formatCompactMoney, formatDate, formatMoney, formatPrice, formatReturn, formatSignedMoney, timeLeft } from '@/lib/format';
import { NotFound } from './NotFound';

const TABS = ['overview', 'news', 'data', 'rules'] as const;
type Tab = (typeof TABS)[number];

function resolutionText(m: Market): string | null {
  if (m.status !== 'RESOLVED') return null;
  if (m.type === 'MULTI_OUTCOME') return `${m.outcomes.find((o) => o.id === m.winningOutcomeId)?.label ?? 'Unknown'} won`;
  return m.winningOutcomeId ? 'Resolved YES' : 'Resolved NO';
}

function OutcomeCards({ market, ticket, select }: { market: Market; ticket: TicketState; select: (outcomeId: string, side: Side) => void }) {
  const tradable = !tradeBlock(market);
  if (market.type !== 'MULTI_OUTCOME') {
    const o = market.outcomes[0];
    return (
      <div className="grid grid-cols-2 gap-3">
        {(['YES', 'NO'] as const).map((side) => {
          const prob = side === 'YES' ? o.probabilityCents : 100 - o.probabilityCents;
          const delta = changePp(market, o.id, side);
          const selected = ticket.side === side;
          const q = quoteFor(o, side);
          return (
            <button
              key={side}
              type="button"
              onClick={() => select(o.id, side)}
              aria-pressed={tradable ? selected : undefined}
              disabled={!tradable}
              className={cn(
                'card group p-4 text-left transition sm:p-5',
                tradable && 'hover:border-line-strong',
                tradable && selected && (side === 'YES' ? 'border-yes/60 ring-1 ring-yes/40' : 'border-no/60 ring-1 ring-no/40'),
              )}
            >
              <div className="flex items-center justify-between">
                <span className={cn('text-sm font-semibold', side === 'YES' ? 'text-yes' : 'text-no')}>{side === 'YES' ? 'Yes' : 'No'}</span>
                <PpDelta value={delta} />
              </div>
              <p className="mt-1 text-4xl font-semibold tracking-tight tabular">{prob}%</p>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/8">
                <div className={cn('h-full rounded-full', side === 'YES' ? 'bg-yes' : 'bg-no')} style={{ width: `${prob}%` }} />
              </div>
              <p className="mt-3 line-clamp-2 text-xs text-muted">{proposition(market, o.id, side)}</p>
              {q && <p className="mt-2 text-xs text-ink-2">Buy at {formatPrice(q.askCents)}</p>}
            </button>
          );
        })}
      </div>
    );
  }
  return (
    <ul className="card divide-y divide-line p-1.5">
      {market.outcomes.map((o, i) => {
        const yes = quoteFor(o, 'YES');
        const no = quoteFor(o, 'NO');
        const selected = ticket.outcomeId === o.id;
        const winner = market.status === 'RESOLVED' && market.winningOutcomeId === o.id;
        return (
          <li key={o.id} className={cn('flex flex-wrap items-center gap-3 rounded-xl px-3 py-3 sm:flex-nowrap', selected && tradable && 'bg-white/[0.04]')}>
            <span className="h-3 w-3 shrink-0 rounded-full" style={{ background: SERIES_COLORS[i % SERIES_COLORS.length] }} aria-hidden />
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-2 font-medium">
                {o.label} {winner && <Trophy className="h-4 w-4 text-warn" aria-label="Winner" />}
              </p>
              <div className="mt-1.5 h-1.5 max-w-xs overflow-hidden rounded-full bg-white/8">
                <div className="h-full rounded-full" style={{ width: `${o.probabilityCents}%`, background: SERIES_COLORS[i % SERIES_COLORS.length] }} />
              </div>
            </div>
            <div className="w-20 text-right">
              <p className="text-xl font-semibold tabular">{o.probabilityCents}%</p>
              <PpDelta value={changePp(market, o.id)} />
            </div>
            {tradable && yes && no && (
              <div className="flex w-full gap-2 sm:w-auto">
                <button
                  type="button"
                  onClick={() => select(o.id, 'YES')}
                  aria-pressed={selected && ticket.side === 'YES'}
                  aria-label={`Buy Yes on ${o.label} at ${yes.askCents} cents`}
                  className={cn(
                    'flex-1 rounded-lg border px-3 py-2 text-sm font-semibold tabular transition sm:w-24 sm:flex-none',
                    selected && ticket.side === 'YES' ? 'border-yes bg-yes text-bg' : 'border-yes/40 bg-yes-soft text-yes hover:border-yes',
                  )}
                >
                  Yes {formatPrice(yes.askCents)}
                </button>
                <button
                  type="button"
                  onClick={() => select(o.id, 'NO')}
                  aria-pressed={selected && ticket.side === 'NO'}
                  aria-label={`Buy No on ${o.label} at ${no.askCents} cents`}
                  className={cn(
                    'flex-1 rounded-lg border px-3 py-2 text-sm font-semibold tabular transition sm:w-24 sm:flex-none',
                    selected && ticket.side === 'NO' ? 'border-no bg-no text-bg' : 'border-no/40 bg-no-soft text-no hover:border-no',
                  )}
                >
                  No {formatPrice(no.askCents)}
                </button>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}

function ChartCard({ market, ticket }: { market: Market; ticket: TicketState }) {
  const [range, setRange] = useState<ChartRange>('3M');
  const multi = market.type === 'MULTI_OUTCOME';
  const side: Side = multi ? 'YES' : ticket.side;
  return (
    <section className="card p-4 sm:p-5" aria-label="Probability history">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1" role="group" aria-label="Chart range">
          {(['1M', '3M', 'ALL'] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRange(r)}
              aria-pressed={range === r}
              className={cn('rounded-full border px-3 py-1 text-xs font-medium', range === r ? 'border-accent bg-accent-soft text-ink' : 'border-line-strong text-muted hover:text-ink')}
            >
              {r === 'ALL' ? 'All' : r}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-3 text-xs text-ink-2">
          {multi ? (
            market.outcomes.map((o, i) => (
              <span key={o.id} className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full" style={{ background: SERIES_COLORS[i % SERIES_COLORS.length] }} aria-hidden />
                {o.label}
              </span>
            ))
          ) : (
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full" style={{ background: side === 'YES' ? SERIES_COLORS[0] : SERIES_COLORS[1] }} aria-hidden />
              Chance of {side === 'YES' ? 'Yes' : 'No'}
            </span>
          )}
        </div>
      </div>
      <div className="mt-4">
        <ProbabilityChart
          market={market}
          outcomeIds={market.outcomes.map((o) => o.id)}
          side={side}
          range={range}
          height={300}
          nowIso={DEMO_NOW}
          highlightOutcomeId={multi ? ticket.outcomeId : undefined}
        />
      </div>
      <p className="mt-2 text-[11px] text-subtle">Weekly demo snapshots, indicative probability. Not live data.</p>
    </section>
  );
}

function YourPositions({ market, onSell }: { market: Market; onSell: (positionId: string) => void }) {
  const user = useStore((s) => s.user);
  const views = user.positions.filter((p) => p.marketId === market.id).map((p) => positionView(user, catalog, p)!);
  const orders = user.orders.filter((o) => o.marketId === market.id && o.status === 'OPEN');
  if (views.length === 0 && orders.length === 0) return null;
  return (
    <section className="card border-accent/30 p-4 sm:p-5" aria-label="Your positions in this market">
      <h2 className="text-sm font-semibold">Your predictions here</h2>
      <ul className="mt-3 grid gap-2">
        {views.map((v) => (
          <li key={v.position.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-line bg-white/[0.02] p-3">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">{proposition(market, v.position.outcomeId, v.position.side)}</p>
              <p className="mt-0.5 text-xs text-muted">
                {v.position.quantity} contracts · invested {formatMoney(v.position.costBasisCents)} · value {formatMoney(v.markedValueCents)}{' '}
                <span className={v.unrealizedPnLCents >= 0 ? 'text-yes' : 'text-no'}>
                  ({formatSignedMoney(v.unrealizedPnLCents)}, {formatReturn(v.unrealizedPnLCents, v.position.costBasisCents)})
                </span>
              </p>
            </div>
            <Button size="sm" variant="secondary" onClick={() => onSell(v.position.id)} disabled={v.bidCents === null}>
              Sell
            </Button>
          </li>
        ))}
        {orders.map((o) => (
          <li key={o.id} className="flex items-center gap-3 rounded-xl border border-dashed border-line-strong p-3 text-sm">
            <span className="rounded-full bg-accent-soft px-2 py-0.5 text-[11px] font-semibold text-accent">Pending</span>
            <span className="min-w-0 flex-1 text-ink-2">
              Limit buy · {o.requestedQuantity} {o.side === 'YES' ? 'Yes' : 'No'} at {formatPrice(o.limitPriceCents)}
            </span>
            <Link to="/portfolio?tab=pending" className="text-xs text-accent hover:underline">
              Manage
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function MarketDetailPage() {
  const { id } = useParams();
  const market = useMarket(id);
  const [params, setParams] = useSearchParams();
  const tabParam = params.get('tab');
  const tab: Tab = (TABS as readonly string[]).includes(tabParam ?? '') ? (tabParam as Tab) : 'overview';
  const paramSide = params.get('side') === 'NO' ? 'NO' : 'YES';
  const paramOutcome = params.get('outcome');

  const initialTicket = (m: Market | undefined): TicketState => ({
    mode: 'buy',
    outcomeId: m?.outcomes.some((o) => o.id === paramOutcome) ? paramOutcome! : (m?.outcomes[0].id ?? ''),
    side: paramSide,
    amountText: '',
    advancedOpen: false,
    limitPriceText: '',
    limitQtyText: '',
    sellPositionId: null,
    sellQtyText: '',
  });
  const [ticket, setTicket] = useState<TicketState>(() => initialTicket(market));
  const [draft, setDraft] = useState<TradeDraft | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  // New market id → fresh ticket (keeps state while staying on the same market).
  useEffect(() => {
    setTicket(initialTicket(market));
    setDraft(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const update = (patch: Partial<TicketState>) => setTicket((t) => ({ ...t, ...patch }));
  const select = (outcomeId: string, side: Side) => {
    update({ outcomeId, side, mode: 'buy' });
    if (window.matchMedia('(max-width: 1023px)').matches) setSheetOpen(true);
  };
  const openReview = (d: TradeDraft) => {
    setSheetOpen(false);
    setDraft(d);
  };
  const sellFromCard = (positionId: string) => {
    update({ mode: 'sell', sellPositionId: positionId, sellQtyText: '' });
    if (window.matchMedia('(max-width: 1023px)').matches) setSheetOpen(true);
  };

  const category = market ? categoryByName(market.category) : null;
  const updates = useMemo(() => (market ? [...market.updates].sort((a, b) => Date.parse(b.at) - Date.parse(a.at)) : []), [market]);

  if (!market || !category)
    return <NotFound title="Market not found" body="This market isn’t part of the demo snapshot. It may have been mistyped — browse the catalog instead." />;

  const block = tradeBlock(market);
  const resolved = resolutionText(market);
  const panel = <TradePanel market={market} ticket={ticket} update={update} onReview={openReview} />;
  const setTab = (t: string) => {
    const next = new URLSearchParams(params);
    if (t === 'overview') next.delete('tab');
    else next.set('tab', t);
    setParams(next, { replace: true });
  };

  return (
    <div className="pb-24 lg:pb-0">
      {/* Hero */}
      <section className="relative isolate overflow-hidden" aria-labelledby="market-title">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-y-0 right-0 w-full [mask-image:linear-gradient(90deg,transparent,black_40%)] sm:w-[min(62%,820px)]">
            <SceneArt art={marketArt(market)} seed={market.id} />
          </div>
          <div className="absolute inset-0 bg-[linear-gradient(90deg,#050912_25%,rgb(5_9_18/0.75)_55%,rgb(5_9_18/0.2))] max-sm:bg-[linear-gradient(180deg,rgb(5_9_18/0.6),#050912)]" />
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-bg to-transparent" />
        </div>
        <div className="mx-auto max-w-[1320px] px-4 pb-8 pt-6 sm:px-6 sm:pt-8 lg:px-8">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-xs text-muted">
            <Link to="/explore" className="hover:text-ink">
              Explore
            </Link>
            <ChevronRight className="h-3 w-3" aria-hidden />
            <Link to={`/explore?category=${category.slug}`} className="hover:text-ink">
              {category.name}
            </Link>
          </nav>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Chip className="border-white/15 bg-black/30">
              <span className="h-4 w-4 overflow-hidden rounded" aria-hidden>
                <SceneArt art={category.art} seed={category.slug} />
              </span>
              {category.name}
            </Chip>
            <StatusBadge status={market.status} />
            {market.tags.filter((t) => t !== 'Featured').map((t) => (
              <Chip key={t} className="border-white/10 bg-black/20 text-[11px]">
                {t}
              </Chip>
            ))}
          </div>
          <div className="mt-4 flex items-start gap-4">
            <h1 id="market-title" className="max-w-3xl text-3xl font-semibold leading-[1.1] tracking-[-0.025em] sm:text-[44px]">
              {market.question}
            </h1>
            <SaveButton marketId={market.id} label={market.title} variant="pill" className="hidden shrink-0 sm:inline-flex" />
          </div>
          <p className="mt-3 max-w-2xl text-ink-2">{market.resolutionSummary}</p>
          <div className="mt-5 flex flex-wrap items-center gap-2">
            <Chip className="border-white/15 bg-black/30 px-3 py-1.5 text-[13px]">
              <CalendarClock className="h-4 w-4" aria-hidden />
              {market.status === 'RESOLVED' ? `Resolved ${formatDate(market.resolvedAt ?? market.closeAt)}` : `Closes ${formatDate(market.closeAt)} · ${timeLeft(market.closeAt, DEMO_NOW)}`}
            </Chip>
            <Chip className="border-white/15 bg-black/30 px-3 py-1.5 text-[13px]">{formatCompactMoney(market.activity.volume24hCents)} demo volume (24h)</Chip>
            {market.activity.trendingScore >= 80 && (
              <Chip className="border-white/15 bg-black/30 px-3 py-1.5 text-[13px]">
                <Flame className="h-4 w-4 text-no" aria-hidden /> Trending
              </Chip>
            )}
            <SaveButton marketId={market.id} label={market.title} className="sm:hidden" />
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-[1320px] gap-6 px-4 sm:px-6 lg:grid-cols-[minmax(0,1fr)_380px] lg:px-8">
        <div className="min-w-0">
          {resolved && (
            <div className="card mb-5 flex items-center gap-3 border-accent/40 p-4">
              <Gavel className="h-6 w-6 text-accent" aria-hidden />
              <div>
                <p className="font-semibold">{resolved}</p>
                <p className="text-sm text-muted">
                  Settled {formatDate(market.resolvedAt ?? market.closeAt)} by the demo resolver. Winning contracts paid $1.00, others $0. Trading is closed.
                </p>
              </div>
            </div>
          )}
          {!resolved && block && (
            <div className="card mb-5 border-warn/40 p-4 text-sm text-ink-2" role="status">
              {TRADE_BLOCK_COPY[block]}
            </div>
          )}

          <Tabs value={tab} onValueChange={setTab}>
            <TabsList aria-label="Market sections">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="news">News</TabsTrigger>
              <TabsTrigger value="data">Market data</TabsTrigger>
              <TabsTrigger value="rules">Rules</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-5 grid gap-5 outline-none">
              <YourPositions market={market} onSell={sellFromCard} />
              <OutcomeCards market={market} ticket={ticket} select={select} />
              <ChartCard market={market} ticket={ticket} />
              <div className="grid gap-5 md:grid-cols-2">
                <section className="card p-5" aria-labelledby="why-title">
                  <h2 id="why-title" className="flex items-center gap-2 font-semibold">
                    <ShieldCheck className="h-4 w-4 text-accent" aria-hidden /> How this market resolves
                  </h2>
                  <p className="mt-3 text-sm text-ink-2">
                    <span className="font-semibold text-yes">YES</span> — {market.resolutionRule.yesCondition}
                  </p>
                  <p className="mt-2 text-sm text-ink-2">
                    <span className="font-semibold text-no">NO</span> — {market.resolutionRule.noCondition}
                  </p>
                  <button type="button" onClick={() => setTab('rules')} className="mt-3 inline-flex items-center gap-1 text-sm text-accent hover:underline">
                    Full rules <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                  </button>
                </section>
                <section className="card p-5" aria-labelledby="notes-title">
                  <h2 id="notes-title" className="flex items-center gap-2 font-semibold">
                    <Newspaper className="h-4 w-4 text-accent" aria-hidden /> Latest demo notes
                  </h2>
                  {updates.length === 0 ? (
                    <p className="mt-3 text-sm text-muted">No notes for this market yet.</p>
                  ) : (
                    <ul className="mt-3 grid gap-3">
                      {updates.slice(0, 2).map((u) => (
                        <li key={u.id}>
                          <p className="text-sm font-medium">{u.title}</p>
                          <p className="text-xs text-muted">NOVA Demo · {ago(u.at, DEMO_NOW)}</p>
                        </li>
                      ))}
                    </ul>
                  )}
                  <button type="button" onClick={() => setTab('news')} className="mt-3 inline-flex items-center gap-1 text-sm text-accent hover:underline">
                    All notes <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                  </button>
                </section>
              </div>
            </TabsContent>

            <TabsContent value="news" className="mt-5 outline-none">
              <p className="mb-4 flex items-center gap-2 text-xs text-muted">
                <Sparkles className="h-3.5 w-3.5" aria-hidden /> Fictional storyline notes written for this demo by NOVA Demo. Not real reporting.
              </p>
              {updates.length === 0 ? (
                <p className="card p-6 text-sm text-muted">No notes for this market yet.</p>
              ) : (
                <ol className="grid gap-3">
                  {updates.map((u) => (
                    <li key={u.id} className="card p-5">
                      <p className="flex items-center gap-2 text-xs text-muted">
                        <span className="rounded bg-white/8 px-1.5 py-0.5 font-semibold text-ink-2">NOVA DEMO</span>
                        <span>{formatDate(u.at)}</span>
                        <span aria-hidden>·</span>
                        <span>{ago(u.at, DEMO_NOW)}</span>
                        <span className="ml-auto rounded-full border border-line-strong px-2 py-0.5 text-[10px] uppercase tracking-wide">Simulated</span>
                      </p>
                      <h3 className="mt-2 text-lg font-semibold">{u.title}</h3>
                      <p className="mt-1.5 text-sm leading-relaxed text-ink-2">{u.body}</p>
                    </li>
                  ))}
                </ol>
              )}
            </TabsContent>

            <TabsContent value="data" className="mt-5 grid gap-5 outline-none">
              <section className="card relative overflow-x-auto p-1" tabIndex={0} aria-label="Demo quotes table, scrolls horizontally on small screens">
                <table className="w-full min-w-[520px] text-sm">
                  <caption className="px-4 pb-1 pt-4 text-left text-sm font-semibold text-ink">Demo quotes per contract</caption>
                  <thead>
                    <tr className="text-left text-xs text-muted">
                      <th className="px-4 py-2 font-medium">Outcome</th>
                      <th className="px-3 py-2 text-right font-medium">Probability</th>
                      <th className="px-3 py-2 text-right font-medium">Yes buy / sell</th>
                      <th className="px-3 py-2 text-right font-medium">No buy / sell</th>
                      <th className="px-4 py-2 text-right font-medium">7d</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {market.outcomes.map((o) => {
                      const y = quoteFor(o, 'YES');
                      const n = quoteFor(o, 'NO');
                      return (
                        <tr key={o.id}>
                          <td className="px-4 py-3 font-medium">{market.type === 'MULTI_OUTCOME' ? o.label : market.title}</td>
                          <td className="px-3 py-3 text-right tabular">{o.probabilityCents}%</td>
                          <td className="px-3 py-3 text-right tabular">{y ? `${formatPrice(y.askCents)} / ${formatPrice(y.bidCents)}` : '—'}</td>
                          <td className="px-3 py-3 text-right tabular">{n ? `${formatPrice(n.askCents)} / ${formatPrice(n.bidCents)}` : '—'}</td>
                          <td className="px-4 py-3 text-right">
                            <PpDelta value={changePp(market, o.id)} />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </section>
              <section className="card p-5">
                <h2 className="font-semibold">Market facts</h2>
                <dl className="mt-3 grid gap-x-8 gap-y-2 text-sm sm:grid-cols-2">
                  {[
                    ['Status', market.status === 'OPEN' ? 'Open for demo trading' : resolved ?? market.status.replace('_', ' ').toLowerCase()],
                    ['Demo volume (24h)', formatMoney(market.activity.volume24hCents)],
                    ['Immediate fill limit', market.liquidity.maxBuy > 0 ? `${market.liquidity.maxBuy.toLocaleString('en-US')} contracts per order` : 'Trading closed'],
                    ['Payout per winning contract', '$1.00 (losing: $0)'],
                    ['Price increment', '1¢'],
                    ['Demo fees', '$0.00'],
                    ['Closes', formatDate(market.closeAt)],
                    ['Evaluated', formatDate(market.resolutionRule.evaluatedAt)],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between gap-4 border-b border-line py-2">
                      <dt className="text-muted">{k}</dt>
                      <dd className="text-right tabular">{v}</dd>
                    </div>
                  ))}
                </dl>
                <p className="mt-4 text-xs text-muted">
                  Buy prices (ask) and sell prices (bid) differ from the displayed probability. Portfolio values use the probability; selling uses the bid.
                </p>
              </section>
            </TabsContent>

            <TabsContent value="rules" className="mt-5 outline-none">
              <section className="card p-5 sm:p-6">
                <h2 className="text-lg font-semibold">Resolution rules</h2>
                <p className="mt-1 text-xs text-muted">Demo terms for a fictional market. {market.resolutionRule.sourceLabel}.</p>
                <dl className="mt-5 grid gap-4 text-sm">
                  {[
                    ['Resolves YES if', market.resolutionRule.yesCondition],
                    ['Resolves NO if', market.resolutionRule.noCondition],
                    ['Void policy', market.resolutionRule.voidCondition],
                    ['Trading closes', `${formatDate(market.closeAt)}`],
                    ['Evaluated on', formatDate(market.resolutionRule.evaluatedAt)],
                    ['Settlement', 'Each winning contract pays $1.00; each losing contract pays $0. Settlement happens once.'],
                    ['Source', market.resolutionSource],
                  ].map(([k, v]) => (
                    <div key={k} className="grid gap-1 sm:grid-cols-[180px_1fr]">
                      <dt className="font-medium text-ink">{k}</dt>
                      <dd className="text-ink-2">{v}</dd>
                    </div>
                  ))}
                </dl>
                {market.type === 'MULTI_OUTCOME' && (
                  <p className="mt-5 rounded-xl border border-line bg-white/[0.03] p-3.5 text-sm text-ink-2">
                    Each outcome is its own Yes/No contract. Buying <strong>No</strong> on one outcome only means that outcome won’t win — it never says which
                    other outcome will.
                  </p>
                )}
              </section>
            </TabsContent>
          </Tabs>
        </div>

        <aside className="hidden lg:block" aria-label="Trade">
          <div className="card sticky top-[84px] max-h-[calc(100dvh-100px)] overflow-y-auto p-5">{panel}</div>
        </aside>
      </div>

      {/* Mobile: ticket in a bottom sheet */}
      <div className="fixed inset-x-0 bottom-[60px] z-30 border-t border-line bg-bg/90 px-4 py-3 backdrop-blur-xl lg:hidden">
        <Button size="lg" className="w-full" onClick={() => setSheetOpen(true)}>
          {block ? 'View trading status' : 'Make a prediction'}
        </Button>
      </div>
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="bottom" className="px-4 pb-6 pt-3">
          <SheetTitle className="mb-3 pr-10 text-base font-semibold">{market.title}</SheetTitle>
          <SheetDescription className="sr-only">Choose your prediction and amount, then review.</SheetDescription>
          {panel}
        </SheetContent>
      </Sheet>

      <TradeFlowDialog draft={draft} onClose={() => setDraft(null)} />
    </div>
  );
}
