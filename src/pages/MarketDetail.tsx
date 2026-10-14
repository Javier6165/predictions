import { useEffect, useId, useMemo, useState } from 'react';
import { BRAND } from '@/brand';
import { ActivePill } from '@/components/motion/ActivePill';
import { DotField, InHundred, YesNoDots } from '@/components/markets/Odds';
import { useMotionOK } from '@/components/motion/useMotionOK';
import { Link, useParams, useSearchParams } from 'react-router';
import { ArrowRight, CalendarClock, ChevronRight, Flame, Gavel, Newspaper, ShieldCheck, Trophy } from 'lucide-react';
import { useMarket, DEMO_NOW } from '@/lib/hooks';
import { categoryByName } from '@/data/categories';
import { catalog } from '@/data/fixtures';
import { proposition } from '@/domain/copy';
import { quoteFor, tradeBlock, TRADE_BLOCK_COPY } from '@/domain/quotes';
import { chartAnnotations, changePp, positionView } from '@/domain/selectors';
import type { Market, Side } from '@/domain/types';
import { useStore } from '@/state/store';
import { SceneArt } from '@/components/art/SceneArt';
import { marketArt } from '@/components/art/MarketArt';
import { PpDelta, SaveButton, StatusBadge } from '@/components/markets/bits';
import { ProbabilityChart, SERIES_COLORS, rangeStart, type ChartRange } from '@/components/markets/ProbabilityChart';
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

const SERIES_TONES = ['text-series-1', 'text-series-2', 'text-series-3', 'text-series-4', 'text-series-5'];

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
    const yes = o.probabilityCents;
    return (
      <section className="card grid gap-6 p-5 sm:grid-cols-[auto_1fr] sm:items-center sm:gap-10 sm:p-8" aria-label="Current odds">
        <YesNoDots yes={yes} size="lg" className="mx-auto w-[min(100%,220px)] sm:mx-0" />
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">The crowd says</p>
          <p className="mt-2 flex flex-wrap items-baseline gap-x-3">
            <InHundred value={yes} className="text-[88px] leading-[0.85] text-yes sm:text-[112px]" />
          </p>
          <p className="font-display mt-2 text-xl leading-snug text-ink-2">
            {proposition(market, o.id, 'YES')}
          </p>
          <p className="mt-3 flex items-center gap-3 text-xs text-muted">
            <PpDelta value={changePp(market, o.id, 'YES')} suffix="this week" />
          </p>
          <div className="mt-5 grid grid-cols-2 gap-2.5">
            {(['YES', 'NO'] as const).map((side) => {
              const q = quoteFor(o, side);
              const selected = ticket.side === side;
              const isYes = side === 'YES';
              return (
                <button
                  key={side}
                  type="button"
                  onClick={() => select(o.id, side)}
                  aria-pressed={tradable ? selected : undefined}
                  disabled={!tradable}
                  className={cn(
                    'group flex items-center justify-between rounded-2xl border-2 px-4 py-3 text-left transition disabled:opacity-50',
                    selected && tradable
                      ? isYes
                        ? 'border-yes bg-yes text-on-side'
                        : 'border-no bg-no text-on-side'
                      : isYes
                        ? 'border-yes/40 text-yes hover:border-yes'
                        : 'border-no/40 text-no hover:border-no',
                  )}
                >
                  <span className="font-display text-2xl leading-none">{isYes ? 'Yes' : 'No'}</span>
                  <span className="text-sm font-semibold tabular">{q ? formatPrice(q.askCents) : '—'}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>
    );
  }
  const segments = market.outcomes.map((o, i) => ({ value: o.probabilityCents, tone: SERIES_TONES[i % SERIES_TONES.length], label: o.label }));
  return (
    <section className="card p-5 sm:p-8" aria-label="Current odds">
      <div className="grid gap-6 sm:grid-cols-[auto_1fr] sm:items-start sm:gap-10">
        <DotField segments={segments} size="lg" className="mx-auto w-[min(100%,220px)] sm:mx-0" />
        <ul className="grid gap-1">
          {market.outcomes.map((o, i) => {
            const yes = quoteFor(o, 'YES');
            const no = quoteFor(o, 'NO');
            const selected = ticket.outcomeId === o.id;
            const winner = market.status === 'RESOLVED' && market.winningOutcomeId === o.id;
            return (
              <li key={o.id} className={cn('flex flex-wrap items-center gap-3 rounded-2xl px-3 py-2.5 sm:flex-nowrap', selected && tradable && 'bg-ink/[0.05]')}>
                <span className={cn('h-3 w-3 shrink-0 rounded-full bg-current', SERIES_TONES[i % SERIES_TONES.length])} aria-hidden />
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-2 font-medium">
                    {o.label} {winner && <Trophy className="h-4 w-4 text-warn" aria-label="Winner" />}
                  </p>
                  <PpDelta value={changePp(market, o.id)} />
                </div>
                <InHundred value={o.probabilityCents} className="w-[92px] justify-end text-[34px] text-ink" />
                {tradable && yes && no && (
                  <div className="flex w-full gap-2 sm:w-auto">
                    <button
                      type="button"
                      onClick={() => select(o.id, 'YES')}
                      aria-pressed={selected && ticket.side === 'YES'}
                      aria-label={`Buy Yes on ${o.label} at ${yes.askCents} cents`}
                      className={cn(
                        'flex-1 rounded-full border px-3 py-1.5 text-sm font-semibold tabular transition sm:w-[88px] sm:flex-none',
                        selected && ticket.side === 'YES' ? 'border-yes bg-yes text-on-side' : 'border-yes/40 text-yes hover:border-yes',
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
                        'flex-1 rounded-full border px-3 py-1.5 text-sm font-semibold tabular transition sm:w-[88px] sm:flex-none',
                        selected && ticket.side === 'NO' ? 'border-no bg-no text-on-side' : 'border-no/40 text-no hover:border-no',
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
      </div>
    </section>
  );
}

function ChartCard({ market, ticket, onOpenNote }: { market: Market; ticket: TicketState; onOpenNote: (noteId: string) => void }) {
  const [range, setRange] = useState<ChartRange>('3M');
  const pillId = useId();
  const [active, setActive] = useState<number | null>(null);
  const multi = market.type === 'MULTI_OUTCOME';
  const side: Side = multi ? 'YES' : ticket.side;
  const annotatedOutcome = multi ? ticket.outcomeId : market.outcomes[0].id;
  const annotatedLabel = multi
    ? market.outcomes.find((o) => o.id === annotatedOutcome)?.label ?? ''
    : side === 'YES'
      ? 'Yes'
      : 'No';
  const notes = useMemo(
    () => chartAnnotations(market, annotatedOutcome, side, rangeStart(range, DEMO_NOW)),
    [market, annotatedOutcome, side, range],
  );
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
              className={cn(
                'relative rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                range === r ? 'border-accent text-ink' : 'border-line-strong text-muted hover:text-ink',
              )}
            >
              {range === r && <ActivePill layoutId={`${pillId}-range`} className="bg-accent-soft" />}
              <span className="relative">{r === 'ALL' ? 'All' : r}</span>
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
          annotations={notes}
          activeAnnotation={active}
          onAnnotationHover={setActive}
        />
      </div>
      <p className="mt-2 text-[11px] text-subtle">Weekly snapshots · indicative probability.</p>
      {notes.length > 0 && (
        <div className="mt-4 border-t border-line pt-4">
          <h3 className="text-sm font-semibold">
            What moved it <span className="font-normal text-muted">· {annotatedLabel}</span>
          </h3>
          <ol className="mt-2 grid grid-cols-1 gap-1">
            {notes.map((a) => (
              <li key={a.noteId}>
                <button
                  type="button"
                  onClick={() => onOpenNote(a.noteId)}
                  onMouseEnter={() => setActive(a.n)}
                  onMouseLeave={() => setActive(null)}
                  onFocus={() => setActive(a.n)}
                  onBlur={() => setActive(null)}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left transition',
                    active === a.n ? 'bg-ink/[0.06]' : 'hover:bg-ink/[0.04]',
                  )}
                >
                  <span
                    className={cn(
                      'flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[11px] font-bold tabular',
                      active === a.n ? 'border-cta bg-cta text-on-cta' : 'border-line-strong bg-surface-3 text-ink',
                    )}
                    aria-hidden
                  >
                    {a.n}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">{a.title}</span>
                    <span className="text-xs text-muted">{BRAND.newsroom} · {formatDate(a.noteAt)}</span>
                  </span>
                  <span className="shrink-0 text-right">
                    {a.deltaPp === null ? (
                      <span className="text-xs text-muted">Start of chart</span>
                    ) : (
                      <>
                        <PpDelta value={a.deltaPp} />
                        <span className="block text-[11px] text-subtle">that week · {a.value}%</span>
                      </>
                    )}
                  </span>
                </button>
              </li>
            ))}
          </ol>
          <p className="mt-2 text-[11px] text-subtle">
            Notes are pinned to the nearest weekly snapshot — context, not proof they caused the move.
          </p>
        </div>
      )}
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
          <li key={v.position.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-line bg-ink/[0.02] p-3">
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
  const motionOK = useMotionOK();
  // Focus a chart note once the News tab has actually rendered it.
  const [pendingNote, setPendingNote] = useState<string | null>(null);
  useEffect(() => {
    if (!pendingNote || tab !== 'news') return;
    let frame = 0;
    let tries = 0;
    // Radix mounts the tab panel a frame later, so wait for the note to exist.
    const tryFocus = () => {
      const el = document.getElementById(`note-${pendingNote}`);
      if (el) {
        el.scrollIntoView({ block: 'center' });
        el.focus();
        setPendingNote(null);
      } else if (tries++ < 20) frame = requestAnimationFrame(tryFocus);
    };
    frame = requestAnimationFrame(tryFocus);
    return () => cancelAnimationFrame(frame);
  }, [pendingNote, tab]);

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
  const openNote = (noteId: string) => {
    setPendingNote(noteId);
    setTab('news');
  };
  const setTab = (t: string) => {
    const next = new URLSearchParams(params);
    if (t === 'overview') next.delete('tab');
    else next.set('tab', t);
    setParams(next, { replace: true });
  };

  return (
    <div className="pb-24 lg:pb-0">
      {/* Header: editorial question with a framed photo */}
      <section className="mx-auto max-w-[1320px] px-4 pb-8 pt-6 sm:px-6 sm:pt-10 lg:px-8" aria-labelledby="market-title">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-6">
          <div className="min-w-0">
            <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-xs text-muted">
              <Link to="/explore" className="hover:text-ink">
                Explore
              </Link>
              <ChevronRight className="h-3 w-3" aria-hidden />
              <Link to={`/explore?category=${category.slug}`} className="hover:text-ink">
                {category.name}
              </Link>
            </nav>
            <div className="mt-5 flex flex-wrap items-center gap-2">
              <StatusBadge status={market.status} />
              {market.tags.filter((t) => t !== 'Featured').map((t) => (
                <Chip key={t} className="text-[11px]">
                  {t}
                </Chip>
              ))}
              {market.activity.trendingScore >= 80 && (
                <Chip className="text-[11px]">
                  <Flame className="h-3.5 w-3.5 text-no" aria-hidden /> Trending
                </Chip>
              )}
            </div>
            <div className="mt-4 flex items-start gap-4">
              <h1 id="market-title" className="font-display max-w-3xl text-[40px] leading-[1.02] text-ink sm:text-[60px]">
                {market.question}
              </h1>
              <SaveButton marketId={market.id} label={market.title} variant="pill" className="hidden shrink-0 sm:inline-flex" />
            </div>
            <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-ink-2">{market.resolutionSummary}</p>
            <p className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-muted">
              <span className="inline-flex items-center gap-1.5">
                <CalendarClock className="h-4 w-4" aria-hidden />
                {market.status === 'RESOLVED' ? `Resolved ${formatDate(market.resolvedAt ?? market.closeAt)}` : `Closes ${formatDate(market.closeAt)} · ${timeLeft(market.closeAt, DEMO_NOW)}`}
              </span>
              <span>{formatCompactMoney(market.activity.volume24hCents)} volume (24h)</span>
              <SaveButton marketId={market.id} label={market.title} className="sm:hidden" />
            </p>
          </div>
          <div className="relative aspect-[2/1] overflow-hidden rounded-3xl bg-surface-2 sm:aspect-[16/9] lg:aspect-auto lg:min-h-[260px]" data-theme="dark">
            <SceneArt art={marketArt(market)} seed={market.id} animated={motionOK} sizes="(min-width: 1024px) 380px, 100vw" />
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
                  Settled {formatDate(market.resolvedAt ?? market.closeAt)} by the resolver. Winning contracts paid $1.00, others $0. Trading is closed.
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
            <TabsList aria-label="Market sections" activeValue={tab}>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="news">News</TabsTrigger>
              <TabsTrigger value="data">Market data</TabsTrigger>
              <TabsTrigger value="rules">Rules</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-5 grid gap-5 outline-none">
              <YourPositions market={market} onSell={sellFromCard} />
              <OutcomeCards market={market} ticket={ticket} select={select} />
              <ChartCard market={market} ticket={ticket} onOpenNote={openNote} />
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
                    <Newspaper className="h-4 w-4 text-accent" aria-hidden /> Latest notes
                  </h2>
                  {updates.length === 0 ? (
                    <p className="mt-3 text-sm text-muted">No notes for this market yet.</p>
                  ) : (
                    <ul className="mt-3 grid gap-3">
                      {updates.slice(0, 2).map((u) => (
                        <li key={u.id}>
                          <p className="text-sm font-medium">{u.title}</p>
                          <p className="text-xs text-muted">{BRAND.newsroom} · {ago(u.at, DEMO_NOW)}</p>
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
              {updates.length === 0 ? (
                <p className="card p-6 text-sm text-muted">No notes for this market yet.</p>
              ) : (
                <ol className="grid gap-3">
                  {updates.map((u) => (
                    <li key={u.id} id={`note-${u.id}`} tabIndex={-1} className="card scroll-mt-24 p-5 outline-none focus-visible:ring-2 focus-visible:ring-accent">
                      <p className="flex items-center gap-2 text-xs text-muted">
                        <span className="rounded bg-ink/8 px-1.5 py-0.5 font-semibold text-ink-2">{BRAND.newsroom}</span>
                        <span>{formatDate(u.at)}</span>
                        <span aria-hidden>·</span>
                        <span>{ago(u.at, DEMO_NOW)}</span>
                      </p>
                      <h3 className="mt-2 text-lg font-semibold">{u.title}</h3>
                      <p className="mt-1.5 text-sm leading-relaxed text-ink-2">{u.body}</p>
                    </li>
                  ))}
                </ol>
              )}
            </TabsContent>

            <TabsContent value="data" className="mt-5 grid gap-5 outline-none">
              <section className="card relative overflow-x-auto p-1" tabIndex={0} aria-label="Quotes table, scrolls horizontally on small screens">
                <table className="w-full min-w-[520px] text-sm">
                  <caption className="px-4 pb-1 pt-4 text-left text-sm font-semibold text-ink">Quotes per contract</caption>
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
                    ['Status', market.status === 'OPEN' ? 'Open for trading' : resolved ?? market.status.replace('_', ' ').toLowerCase()],
                    ['Volume (24h)', formatMoney(market.activity.volume24hCents)],
                    ['Immediate fill limit', market.liquidity.maxBuy > 0 ? `${market.liquidity.maxBuy.toLocaleString('en-US')} contracts per order` : 'Trading closed'],
                    ['Payout per winning contract', '$1.00 (losing: $0)'],
                    ['Price increment', '1¢'],
                    ['Fees', '$0.00'],
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
                <p className="mt-1 text-xs text-muted">{market.resolutionRule.sourceLabel}.</p>
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
                  <p className="mt-5 rounded-xl border border-line bg-ink/[0.03] p-3.5 text-sm text-ink-2">
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
          <SheetTitle className="font-display mb-3 pr-10 text-[24px] font-normal leading-tight">{market.title}</SheetTitle>
          <SheetDescription className="sr-only">Choose your prediction and amount, then review.</SheetDescription>
          {panel}
        </SheetContent>
      </Sheet>

      <TradeFlowDialog draft={draft} onClose={() => setDraft(null)} />
    </div>
  );
}
