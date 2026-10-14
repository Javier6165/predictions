import { useEffect, useId, useMemo, useState } from 'react';
import { ActivePill } from '@/components/motion/ActivePill';
import { useMotionOK } from '@/components/motion/useMotionOK';
import { Link, useSearchParams } from 'react-router';
import { ArrowRight, ChevronRight, LayoutGrid, List, Search, SlidersHorizontal, X } from 'lucide-react';
import { CATEGORIES, categoryByName, categoryBySlug } from '@/data/categories';
import { useMarkets, DEMO_NOW } from '@/lib/hooks';
import { searchMarkets } from '@/lib/search';
import { biggestMove, changePp, leadOutcome } from '@/domain/selectors';
import type { Market } from '@/domain/types';
import { SceneArt } from '@/components/art/SceneArt';
import { MarketThumb } from '@/components/art/MarketArt';
import { MarketRow } from '@/components/markets/MarketRow';
import { PpDelta, SaveButton, StatusBadge } from '@/components/markets/bits';
import { Button } from '@/components/ui/button';
import { BlurReveal } from '@/components/motion/BlurReveal';
import { Spotlight } from '@/components/motion/Spotlight';
import { Sheet, SheetContent, SheetDescription, SheetTitle } from '@/components/ui/sheet';
import { cn } from '@/lib/cn';
import { formatCompactMoney, formatDate } from '@/lib/format';

const SORTS = [
  { id: 'trending', label: 'Trending' },
  { id: 'movers', label: 'Biggest move (7d)' },
  { id: 'volume', label: 'Highest volume' },
  { id: 'ending', label: 'Ending soon' },
] as const;
const STATUSES = [
  { id: 'all', label: 'All' },
  { id: 'open', label: 'Open' },
  { id: 'closing', label: 'Closing soon' },
  { id: 'pending', label: 'Awaiting result' },
  { id: 'resolved', label: 'Resolved' },
] as const;
const TYPES = [
  { id: 'all', label: 'All' },
  { id: 'binary', label: 'Yes / No' },
  { id: 'multi', label: 'Multiple choice' },
] as const;

type SortId = (typeof SORTS)[number]['id'];
type StatusId = (typeof STATUSES)[number]['id'];
type TypeId = (typeof TYPES)[number]['id'];

const FILTERS_OPEN_KEY = 'nova-explore-filters-open';
const VIEW_KEY = 'nova-explore-view';
const CLOSING_SOON_DAYS = 180;

function readPref(key: string, fallback: string) {
  try {
    return sessionStorage.getItem(key) ?? fallback;
  } catch {
    return fallback;
  }
}
function writePref(key: string, value: string) {
  try {
    sessionStorage.setItem(key, value);
  } catch {
    /* storage unavailable: preference simply isn't remembered */
  }
}

export function applyExploreFilters(
  markets: Market[],
  f: { q: string; category?: string; status: StatusId; type: TypeId; sort: SortId },
): Market[] {
  let list = f.q ? searchMarkets(markets, f.q) : [...markets];
  if (f.category) list = list.filter((m) => m.category === f.category);
  if (f.type === 'binary') list = list.filter((m) => m.type !== 'MULTI_OUTCOME');
  if (f.type === 'multi') list = list.filter((m) => m.type === 'MULTI_OUTCOME');
  const now = Date.parse(DEMO_NOW);
  if (f.status === 'open') list = list.filter((m) => m.status === 'OPEN');
  if (f.status === 'closing')
    list = list.filter((m) => m.status === 'OPEN' && Date.parse(m.closeAt) - now <= CLOSING_SOON_DAYS * 86_400_000);
  if (f.status === 'pending') list = list.filter((m) => m.status === 'PENDING_RESOLUTION' || m.status === 'CLOSED' || m.status === 'SUSPENDED');
  if (f.status === 'resolved') list = list.filter((m) => m.status === 'RESOLVED' || m.status === 'VOIDED');
  const by: Record<SortId, (a: Market, b: Market) => number> = {
    trending: (a, b) => b.activity.trendingScore - a.activity.trendingScore,
    movers: (a, b) => biggestMove(b) - biggestMove(a),
    volume: (a, b) => b.activity.volume24hCents - a.activity.volume24hCents,
    ending: (a, b) => {
      const ao = a.status === 'OPEN' ? 0 : 1;
      const bo = b.status === 'OPEN' ? 0 : 1;
      return ao - bo || Date.parse(a.closeAt) - Date.parse(b.closeAt);
    },
  };
  // A text query keeps relevance order unless the user picked a sort explicitly.
  return f.q && f.sort === 'trending' ? list : list.sort(by[f.sort]);
}

function RadioGroup<T extends string>({ legend, name, options, value, onChange }: { legend: string; name: string; options: readonly { id: T; label: string }[]; value: T; onChange: (v: T) => void }) {
  return (
    <fieldset className="pt-1">
      <legend className="mb-2 text-sm font-semibold text-ink">{legend}</legend>
      <div className="grid gap-1">
        {options.map((o) => (
          <label
            key={o.id}
            className={cn(
              'flex cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2 text-sm transition has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-accent',
              value === o.id ? 'bg-accent-soft text-ink' : 'text-ink-2 hover:bg-ink/[0.04]',
            )}
          >
            <input type="radio" name={name} checked={value === o.id} onChange={() => onChange(o.id)} className="accent-[#3b82f6]" />
            {o.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function FiltersForm({
  q,
  setQ,
  category,
  setCategory,
  status,
  type,
  sort,
  set,
  reset,
  activeCount,
}: {
  q: string;
  setQ: (v: string) => void;
  category: string;
  setCategory: (slug: string) => void;
  status: StatusId;
  type: TypeId;
  sort: SortId;
  set: (key: string, value: string, def: string) => void;
  reset: () => void;
  activeCount: number;
}) {
  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold">Filters</h2>
        <button type="button" onClick={reset} disabled={activeCount === 0} className="text-sm text-accent disabled:text-subtle">
          Reset
        </button>
      </div>
      <div>
        <label htmlFor="explore-q" className="mb-2 block text-sm font-semibold">
          Search
        </label>
        <div className="flex items-center gap-2 rounded-xl border border-line-strong bg-ink/[0.03] px-3 focus-within:border-accent">
          <Search className="h-4 w-4 text-muted" aria-hidden />
          <input
            id="explore-q"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search within markets…"
            className="h-10 w-full bg-transparent text-sm outline-none placeholder:text-subtle"
          />
          {q && (
            <button type="button" onClick={() => setQ('')} aria-label="Clear search text" className="text-muted hover:text-ink">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
      <div>
        <label htmlFor="explore-category" className="mb-2 block text-sm font-semibold">
          Category
        </label>
        <select
          id="explore-category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="h-10 w-full rounded-xl border border-line-strong bg-surface px-3 text-sm text-ink outline-none focus:border-accent"
        >
          <option value="">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
      <RadioGroup legend="Market type" name="type" options={TYPES} value={type} onChange={(v) => set('type', v, 'all')} />
      <RadioGroup legend="Status" name="status" options={STATUSES} value={status} onChange={(v) => set('status', v, 'all')} />
      <RadioGroup legend="Sort by" name="sort" options={SORTS} value={sort} onChange={(v) => set('sort', v, 'trending')} />
    </div>
  );
}

function MarketCard({ market }: { market: Market }) {
  const lead = leadOutcome(market);
  return (
    <Spotlight as="article" className="card lift group relative flex flex-col overflow-hidden">
      <div className="relative h-32 overflow-hidden">
        <MarketThumb market={market} className="h-full w-full rounded-none ring-0" />
        <div className="absolute inset-0 bg-gradient-to-t from-surface to-transparent" />
        <div className="absolute right-2 top-2 z-10 rounded-lg bg-black/40 backdrop-blur">
          <SaveButton marketId={market.id} label={market.title} />
        </div>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <p className="text-xs text-muted">{categoryByName(market.category).shortName}</p>
        <Link to={`/markets/${market.id}`} className="mt-1 line-clamp-2 font-medium leading-snug after:absolute after:inset-0">
          {market.question}
        </Link>
        <div className="mt-auto flex items-end justify-between pt-4">
          <div>
            <p className="text-[11px] font-medium text-accent">{market.type === 'MULTI_OUTCOME' ? lead.label : 'Yes'}</p>
            <p className="text-2xl font-semibold tabular">{lead.probabilityCents}%</p>
          </div>
          <div className="text-right">
            {market.status !== 'OPEN' ? <StatusBadge status={market.status} /> : <PpDelta value={changePp(market, lead.id)} suffix="7d" />}
            <p className="mt-1 text-[11px] text-subtle">{formatCompactMoney(market.activity.volume24hCents)} vol.</p>
          </div>
        </div>
      </div>
    </Spotlight>
  );
}

export function ExplorePage() {
  const markets = useMarkets();
  const [params, setParams] = useSearchParams();
  const q = params.get('q') ?? '';
  const catSlug = params.get('category') ?? '';
  const category = categoryBySlug(catSlug);
  const sort = (SORTS.some((s) => s.id === params.get('sort')) ? params.get('sort') : 'trending') as SortId;
  const status = (STATUSES.some((s) => s.id === params.get('status')) ? params.get('status') : 'all') as StatusId;
  const type = (TYPES.some((s) => s.id === params.get('type')) ? params.get('type') : 'all') as TypeId;

  const [filtersOpen, setFiltersOpen] = useState(() => readPref(FILTERS_OPEN_KEY, 'closed') === 'open');
  const [mobileFilters, setMobileFilters] = useState(false);
  const pillId = useId();
  const motionOK = useMotionOK();
  const [view, setView] = useState<'list' | 'grid'>(() => (readPref(VIEW_KEY, 'list') === 'grid' ? 'grid' : 'list'));
  const [qDraft, setQDraft] = useState(q);
  useEffect(() => setQDraft(q), [q]);

  const set = (key: string, value: string, def = '') => {
    const next = new URLSearchParams(params);
    if (!value || value === def) next.delete(key);
    else next.set(key, value);
    setParams(next, { replace: key === 'q' });
  };
  // Debounce typing into the URL so Back doesn't replay every keystroke.
  useEffect(() => {
    if (qDraft === q) return;
    const t = setTimeout(() => set('q', qDraft.trim()), 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qDraft]);

  const reset = () => {
    setQDraft('');
    setParams(new URLSearchParams());
  };
  const toggleFilters = () => {
    const next = !filtersOpen;
    setFiltersOpen(next);
    writePref(FILTERS_OPEN_KEY, next ? 'open' : 'closed');
  };
  const changeView = (v: 'list' | 'grid') => {
    setView(v);
    writePref(VIEW_KEY, v);
  };

  const activeCount = [q, category, status !== 'all', type !== 'all', sort !== 'trending'].filter(Boolean).length;
  const filtered = activeCount > 0;
  const results = useMemo(
    () => applyExploreFilters(markets, { q, category: category?.name, status, type, sort }),
    [markets, q, category, status, type, sort],
  );

  const chips: { label: string; clear: () => void }[] = [];
  if (q) chips.push({ label: `“${q}”`, clear: () => { setQDraft(''); set('q', ''); } });
  if (category) chips.push({ label: category.name, clear: () => set('category', '') });
  if (type !== 'all') chips.push({ label: TYPES.find((t) => t.id === type)!.label, clear: () => set('type', '', 'all') });
  if (status !== 'all') chips.push({ label: STATUSES.find((t) => t.id === status)!.label, clear: () => set('status', '', 'all') });
  if (sort !== 'trending') chips.push({ label: `Sort: ${SORTS.find((t) => t.id === sort)!.label}`, clear: () => set('sort', '', 'trending') });

  const form = (
    <FiltersForm
      q={qDraft}
      setQ={setQDraft}
      category={catSlug}
      setCategory={(s) => set('category', s)}
      status={status}
      type={type}
      sort={sort}
      set={set}
      reset={reset}
      activeCount={activeCount}
    />
  );

  return (
    <div>
      {/* Hero */}
      <section className="relative isolate overflow-hidden" aria-labelledby="explore-title">
        <div className="absolute inset-0 -z-10">
          <SceneArt art="global" seed="explore-hero" animated={motionOK} />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,#0f0e0c_15%,rgb(15_14_12/0.7)_55%,rgb(15_14_12/0.3))]" />
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-bg to-transparent" />
        </div>
        <div className="mx-auto max-w-[1320px] px-4 pb-8 pt-10 sm:px-6 sm:pt-14 lg:px-8">
          <p className="inline-flex rounded-md bg-ink/10 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-2">Explore markets</p>
          <h1 id="explore-title" className="mt-4 max-w-2xl text-4xl font-semibold leading-[1.05] tracking-[-0.03em] sm:text-5xl">
            <BlurReveal text="Discover what the world" /> <BlurReveal text="is predicting." wordClassName="text-gradient" delay={0.25} />
          </h1>
          <p className="mt-4 max-w-xl text-ink-2">
            From politics to science, browse every market. Compare the odds, save what interests you and dig into the rules.
          </p>

          <ul className="stagger scrollbar-none -mx-4 mt-8 flex gap-3 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0" aria-label="Categories">
            <li className="shrink-0">
              <button
                type="button"
                onClick={() => set('category', '')}
                aria-pressed={!category}
                className={cn(
                  'flex h-[104px] w-32 flex-col justify-between rounded-2xl border p-3 text-left transition',
                  !category ? 'border-accent bg-accent-soft ring-1 ring-accent' : 'border-line-strong bg-surface/70 hover:border-ink/30',
                )}
              >
                <LayoutGrid className="h-6 w-6 text-accent" aria-hidden />
                <span>
                  <span className="block text-sm font-semibold">All markets</span>
                  <span className="text-xs text-muted">{markets.length}</span>
                </span>
              </button>
            </li>
            {CATEGORIES.map((c) => {
              const active = category?.slug === c.slug;
              return (
                <li key={c.slug} className="shrink-0">
                  <button
                    type="button"
                    onClick={() => set('category', active ? '' : c.slug)}
                    aria-pressed={active}
                    className={cn(
                      'group relative h-[104px] w-[104px] overflow-hidden rounded-2xl text-left ring-1 transition sm:w-28',
                      active ? 'ring-2 ring-accent' : 'ring-ink/10 hover:ring-ink/30',
                    )}
                  >
                    <SceneArt art={c.art} seed={c.slug} sizes="120px" />
                    <span className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-black/5" />
                    <span className="absolute inset-x-0 bottom-0 p-2.5">
                      <span className="block text-[13px] font-semibold text-white">{c.shortName}</span>
                      <span className="text-[11px] text-white/70">{markets.filter((m) => m.category === c.name).length}</span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      <div className="mx-auto flex max-w-[1320px] gap-6 px-4 sm:px-6 lg:px-8">
        {filtersOpen && (
          <aside className="card sticky top-[84px] hidden h-fit max-h-[calc(100dvh-100px)] w-64 shrink-0 overflow-y-auto p-5 lg:block" aria-label="Filters">
            {form}
          </aside>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="secondary"
              className="hidden lg:inline-flex"
              onClick={toggleFilters}
              aria-expanded={filtersOpen}
              aria-controls="explore-results"
            >
              <SlidersHorizontal className="h-4 w-4" /> {filtersOpen ? 'Hide filters' : 'Filters'}
              {activeCount > 0 && <span className="rounded-full bg-cta px-1.5 text-xs text-on-cta tabular">{activeCount}</span>}
              {!filtersOpen && <ChevronRight className="h-4 w-4 text-muted" />}
            </Button>
            <Button variant="secondary" className="lg:hidden" onClick={() => setMobileFilters(true)} aria-haspopup="dialog">
              <SlidersHorizontal className="h-4 w-4" /> Filters
              {activeCount > 0 && <span className="rounded-full bg-cta px-1.5 text-xs text-on-cta tabular">{activeCount}</span>}
            </Button>
            <p className="text-sm text-muted" aria-live="polite">
              {filtered ? (
                <>
                  <span className="font-semibold text-ink tabular">{results.length}</span> result{results.length === 1 ? '' : 's'}
                </>
              ) : (
                <>
                  <span className="font-semibold text-ink tabular">{markets.length}</span> markets
                </>
              )}
            </p>
            <div className="ml-auto flex rounded-xl border border-line-strong p-0.5" role="group" aria-label="Result layout">
              {(['list', 'grid'] as const).map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => changeView(v)}
                  aria-pressed={view === v}
                  className={cn('relative flex items-center gap-1.5 rounded-[10px] px-3 py-1.5 text-sm transition-colors', view === v ? 'text-ink' : 'text-muted hover:text-ink')}
                >
                  {view === v && <ActivePill layoutId={`${pillId}-view`} className="bg-ink/10" />}
                  <span className="relative flex items-center gap-1.5">
                    {v === 'list' ? <List className="h-4 w-4" aria-hidden /> : <LayoutGrid className="h-4 w-4" aria-hidden />}
                    {v === 'list' ? 'List' : 'Grid'}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {chips.length > 0 && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {chips.map((c) => (
                <button
                  key={c.label}
                  type="button"
                  onClick={c.clear}
                  className="inline-flex items-center gap-1.5 rounded-full border border-line-strong bg-ink/[0.04] px-3 py-1 text-xs text-ink-2 hover:text-ink"
                  aria-label={`Remove filter ${c.label}`}
                >
                  {c.label} <X className="h-3 w-3" aria-hidden />
                </button>
              ))}
              <button type="button" onClick={reset} className="text-xs text-accent hover:underline">
                Clear filters
              </button>
            </div>
          )}

          <div id="explore-results" className="mt-5">
            {filtered ? (
              results.length === 0 ? (
                <div className="card px-6 py-14 text-center">
                  <Search className="mx-auto h-7 w-7 text-subtle" aria-hidden />
                  <p className="mt-3 font-medium">No markets match these filters.</p>
                  <p className="mt-1 text-sm text-muted">Try a broader search or remove a filter.</p>
                  <Button className="mt-5" variant="secondary" onClick={reset}>
                    Clear filters
                  </Button>
                </div>
              ) : view === 'grid' ? (
                <div className="stagger grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {results.map((m) => (
                    <MarketCard key={m.id} market={m} />
                  ))}
                </div>
              ) : (
                <div className="stagger card divide-y divide-line p-2">
                  {results.map((m) => (
                    <MarketRow key={m.id} market={m} />
                  ))}
                </div>
              )
            ) : (
              <div className="stagger grid gap-5">
                {CATEGORIES.map((c) => {
                  const group = markets
                    .filter((m) => m.category === c.name)
                    .sort((a, b) => b.activity.trendingScore - a.activity.trendingScore);
                  if (group.length === 0) return null;
                  return (
                    <section key={c.slug} className="card overflow-hidden p-2 sm:p-3" aria-labelledby={`group-${c.slug}`}>
                      <header className="flex items-center gap-3 px-2 pb-2 pt-1 sm:px-3">
                        <span className="h-10 w-10 shrink-0 overflow-hidden rounded-xl ring-1 ring-ink/10">
                          <SceneArt art={c.art} seed={c.slug} />
                        </span>
                        <div className="min-w-0 flex-1">
                          <h2 id={`group-${c.slug}`} className="font-semibold">
                            {c.name}
                          </h2>
                          <p className="truncate text-xs text-muted">{c.description}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => set('category', c.slug)}
                          className="inline-flex shrink-0 items-center gap-1 text-sm text-ink-2 hover:text-ink"
                        >
                          View all <ArrowRight className="h-4 w-4" aria-hidden />
                          <span className="sr-only">{c.name} markets</span>
                        </button>
                      </header>
                      {view === 'grid' ? (
                        <div className="grid gap-3 p-2 sm:grid-cols-2 xl:grid-cols-3">
                          {group.map((m) => (
                            <MarketCard key={m.id} market={m} />
                          ))}
                        </div>
                      ) : (
                        <div className="divide-y divide-line">
                          {group.map((m) => (
                            <MarketRow key={m.id} market={m} />
                          ))}
                        </div>
                      )}
                    </section>
                  );
                })}
              </div>
            )}
          </div>
          <p className="mt-6 text-xs text-subtle">
            Probabilities as of {formatDate(DEMO_NOW)}. Changes are shown in percentage points (pp).
          </p>
        </div>
      </div>

      <Sheet open={mobileFilters} onOpenChange={setMobileFilters}>
        <SheetContent side="bottom" className="px-5 pb-6 pt-3">
          <SheetTitle className="sr-only">Filters</SheetTitle>
          <SheetDescription className="sr-only">Filter and sort markets</SheetDescription>
          {form}
          <Button className="mt-5 w-full" size="lg" onClick={() => setMobileFilters(false)}>
            Show {results.length} result{results.length === 1 ? '' : 's'}
          </Button>
        </SheetContent>
      </Sheet>
    </div>
  );
}
