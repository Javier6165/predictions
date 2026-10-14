import { useEffect, useId, useMemo, useState } from 'react';
import { ActivePill } from '@/components/motion/ActivePill';
import { useMotionOK } from '@/components/motion/useMotionOK';
import { useSearchParams } from 'react-router';
import { ArrowRight, ChevronRight, LayoutGrid, List, Search, SlidersHorizontal, X } from 'lucide-react';
import { CATEGORIES, categoryBySlug } from '@/data/categories';
import { useMarkets, DEMO_NOW } from '@/lib/hooks';
import { searchMarkets } from '@/lib/search';
import { biggestMove } from '@/domain/selectors';
import type { Market } from '@/domain/types';
import { SceneArt } from '@/components/art/SceneArt';
import { MarketRow } from '@/components/markets/MarketRow';
import { StoryCard } from '@/components/markets/StoryCard';
import { Button } from '@/components/ui/button';
import { BlurReveal } from '@/components/motion/BlurReveal';
import { Sheet, SheetContent, SheetDescription, SheetTitle } from '@/components/ui/sheet';
import { cn } from '@/lib/cn';
import { formatDate } from '@/lib/format';

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
  return <StoryCard market={market} />;
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
      {/* Header */}
      <section className="mx-auto max-w-[1320px] px-4 pb-8 pt-8 sm:px-6 sm:pt-12 lg:px-8" aria-labelledby="explore-title">
        <div className="flex items-center justify-between gap-4 border-b border-ink/80 pb-3">
          <p className="eyebrow text-ink">Explore markets</p>
          <p className="eyebrow text-muted">{markets.length} questions</p>
        </div>
        <div className="grid gap-6 pt-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)] lg:items-end">
          <h1 id="explore-title" className="font-display max-w-3xl text-[48px] leading-[0.98] tracking-[-0.015em] text-ink sm:text-[76px]">
            <BlurReveal text="Discover what the world" /> <BlurReveal text="is predicting." wordClassName="italic" delay={0.25} />
          </h1>
          <div className="relative hidden aspect-[16/9] overflow-hidden rounded-3xl lg:block" data-theme="dark">
            <SceneArt art="global" seed="explore-hero" animated={motionOK} sizes="420px" />
          </div>
        </div>
        <p className="mt-5 max-w-xl text-[16px] leading-relaxed text-ink-2">
          From politics to science, browse every market. Compare the odds, save what interests you and dig into the rules.
        </p>

        <ul className="scrollbar-none -mx-4 mt-8 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0" aria-label="Categories">
          <li className="shrink-0">
            <button
              type="button"
              onClick={() => set('category', '')}
              aria-pressed={!category}
              className={cn(
                'inline-flex h-11 items-center gap-2 rounded-full border px-4 text-sm font-medium transition',
                !category ? 'border-ink bg-ink text-bg' : 'border-line-strong bg-surface text-ink hover:border-ink',
              )}
            >
              All markets <span className={cn('tabular', !category ? 'text-bg/70' : 'text-muted')}>{markets.length}</span>
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
                    'inline-flex h-11 items-center gap-2.5 rounded-full border pl-1 pr-4 text-sm font-medium transition',
                    active ? 'border-ink bg-ink text-bg' : 'border-line-strong bg-surface text-ink hover:border-ink',
                  )}
                >
                  <span className="h-8 w-8 overflow-hidden rounded-full" data-theme="dark" aria-hidden>
                    <SceneArt art={c.art} seed={c.slug} sizes="40px" />
                  </span>
                  {c.shortName}
                  <span className={cn('tabular', active ? 'text-bg/70' : 'text-muted')}>{markets.filter((m) => m.category === c.name).length}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      <div className="mx-auto flex max-w-[1320px] gap-6 px-4 sm:px-6 lg:px-8">
        {filtersOpen && (
          <aside className="card sticky top-[72px] hidden h-fit max-h-[calc(100dvh-100px)] w-64 shrink-0 overflow-y-auto p-5 lg:block" aria-label="Filters">
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
            <div className="ml-auto flex rounded-full border border-line-strong p-0.5" role="group" aria-label="Result layout">
              {(['list', 'grid'] as const).map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => changeView(v)}
                  aria-pressed={view === v}
                  className={cn('relative flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm transition-colors', view === v ? 'text-ink' : 'text-muted hover:text-ink')}
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
                <div className="stagger grid gap-x-8 gap-y-10 sm:grid-cols-2 xl:grid-cols-3">
                  {results.map((m) => (
                    <MarketCard key={m.id} market={m} />
                  ))}
                </div>
              ) : (
                <div className="stagger divide-y divide-line border-y border-line">
                  {results.map((m) => (
                    <MarketRow key={m.id} market={m} />
                  ))}
                </div>
              )
            ) : (
              <div className="stagger grid grid-cols-[minmax(0,1fr)] gap-14">
                {CATEGORIES.map((c) => {
                  const group = markets
                    .filter((m) => m.category === c.name)
                    .sort((a, b) => b.activity.trendingScore - a.activity.trendingScore);
                  if (group.length === 0) return null;
                  return (
                    <section key={c.slug} aria-labelledby={`group-${c.slug}`}>
                      <header className="flex items-end gap-3 border-t border-ink/80 pt-3">
                        <div className="min-w-0 flex-1">
                          <h2 id={`group-${c.slug}`} className="font-display text-[32px] leading-none text-ink sm:text-[38px]">
                            {c.name}
                          </h2>
                          <p className="mt-1.5 truncate text-sm text-muted">{c.description}</p>
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
                        <div className="mt-6 grid gap-x-8 gap-y-10 sm:grid-cols-2 xl:grid-cols-3">
                          {group.map((m) => (
                            <MarketCard key={m.id} market={m} />
                          ))}
                        </div>
                      ) : (
                        <div className="mt-1 divide-y divide-line">
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
