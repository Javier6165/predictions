import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { Command } from 'cmdk';
import { Dialog as D } from 'radix-ui';
import { ArrowRight, Clock, Search, TrendingUp, X } from 'lucide-react';
import { useMarkets } from '@/lib/hooks';
import { searchMarkets } from '@/lib/search';
import { changePp, leadOutcome } from '@/domain/selectors';
import { categoryByName } from '@/data/categories';
import { useStore } from '@/state/store';
import { useUi } from '@/state/ui';
import { MarketThumb } from '@/components/art/MarketArt';
import { PpDelta } from '@/components/markets/bits';
import type { Market } from '@/domain/types';

function ResultItem({ market, onSelect }: { market: Market; onSelect: () => void }) {
  const lead = leadOutcome(market);
  return (
    <Command.Item
      value={market.id}
      onSelect={onSelect}
      className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 outline-none data-[selected=true]:bg-ink/[0.06]"
    >
      <MarketThumb market={market} className="h-10 w-10 rounded-lg" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-ink">{market.question}</p>
        <p className="mt-0.5 text-xs text-muted">
          {categoryByName(market.category).shortName}
          {market.type === 'MULTI_OUTCOME' ? ` · ${lead.label} leads` : ''}
        </p>
      </div>
      <div className="text-right">
        <p className="text-sm font-semibold tabular">{lead.probabilityCents}%</p>
        <PpDelta value={changePp(market, lead.id)} />
      </div>
    </Command.Item>
  );
}

export function SearchDialog() {
  const open = useUi((s) => s.overlay === 'search');
  const setOverlay = useUi((s) => s.setOverlay);
  const markets = useMarkets();
  const recent = useStore((s) => s.recentSearches);
  const addRecent = useStore((s) => s.addRecentSearch);
  const clearRecent = useStore((s) => s.clearRecentSearches);
  const navigate = useNavigate();
  const [q, setQ] = useState('');

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOverlay(useUi.getState().overlay === 'search' ? null : 'search');
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [setOverlay]);

  const results = useMemo(() => searchMarkets(markets, q).slice(0, 6), [markets, q]);
  const trending = useMemo(
    () => [...markets].filter((m) => m.status === 'OPEN').sort((a, b) => b.activity.trendingScore - a.activity.trendingScore).slice(0, 4),
    [markets],
  );

  const close = () => setOverlay(null);
  const go = (path: string, query?: string) => {
    if (query) addRecent(query);
    close();
    setQ('');
    navigate(path);
  };
  const seeAll = () => go(`/explore?q=${encodeURIComponent(q.trim())}`, q);

  return (
    <D.Root
      open={open}
      onOpenChange={(o) => {
        setOverlay(o ? 'search' : null);
        if (!o) setQ('');
      }}
    >
      <D.Portal>
        <D.Overlay className="fixed inset-0 z-50 bg-[#0f0e0c]/70 backdrop-blur-sm data-[state=open]:animate-fade-in" />
        <D.Content
          className="fixed inset-x-0 top-0 z-50 mx-auto flex max-h-[100dvh] w-full flex-col overflow-hidden border-line-strong bg-bg-elev outline-none data-[state=open]:animate-pop-in sm:top-[10vh] sm:max-h-[75vh] sm:max-w-2xl sm:rounded-3xl sm:border"
          style={{ boxShadow: 'var(--shadow-pop)' }}
          aria-describedby={undefined}
        >
          <D.Title className="sr-only">Search markets</D.Title>
          <Command shouldFilter={false} loop className="flex min-h-0 flex-1 flex-col">
            <div className="flex items-center gap-3 border-b border-line px-4 py-3.5">
              <Search className="h-5 w-5 text-muted" aria-hidden />
              <Command.Input
                value={q}
                onValueChange={setQ}
                placeholder="Search predictions, topics or outcomes…"
                aria-label="Search markets"
                className="h-8 flex-1 bg-transparent text-[16px] text-ink outline-none placeholder:text-subtle"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && q.trim() && results.length === 0) {
                    e.preventDefault();
                    seeAll();
                  }
                }}
              />
              {q && (
                <button type="button" onClick={() => setQ('')} className="rounded-full p-1 text-muted hover:text-ink" aria-label="Clear search">
                  <X className="h-4 w-4" />
                </button>
              )}
              <D.Close className="rounded-lg border border-line-strong px-2 py-1 text-xs text-muted hover:text-ink">Esc</D.Close>
            </div>
            <Command.List className="min-h-0 flex-1 overflow-y-auto p-2">
              {q.trim() ? (
                <>
                  <Command.Empty className="px-4 py-10 text-center">
                    <p className="text-sm text-ink">No predictions match “{q}”.</p>
                    <p className="mt-1 text-xs text-muted">Try a topic like “election”, “bitcoin” or “Mars”.</p>
                  </Command.Empty>
                  {results.length > 0 && (
                    <Command.Group heading="Top results" className="[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted">
                      {results.map((m) => (
                        <ResultItem key={m.id} market={m} onSelect={() => go(`/markets/${m.id}`, q)} />
                      ))}
                    </Command.Group>
                  )}
                  <Command.Item
                    value="__see-all"
                    onSelect={seeAll}
                    className="mt-1 flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-line-strong px-3 py-3 text-sm font-medium text-ink-2 outline-none data-[selected=true]:bg-ink/[0.06] data-[selected=true]:text-ink"
                  >
                    See all results for “{q.trim()}” <ArrowRight className="h-4 w-4" />
                  </Command.Item>
                </>
              ) : (
                <>
                  {recent.length > 0 && (
                    <Command.Group
                      heading={
                        <span className="flex items-center justify-between">
                          Recent searches
                          <button type="button" onClick={clearRecent} className="text-xs text-muted hover:text-ink">
                            Clear
                          </button>
                        </span>
                      }
                      className="[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted"
                    >
                      {recent.map((r) => (
                        <Command.Item
                          key={r}
                          value={`recent:${r}`}
                          onSelect={() => setQ(r)}
                          className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-ink-2 outline-none data-[selected=true]:bg-ink/[0.06] data-[selected=true]:text-ink"
                        >
                          <Clock className="h-4 w-4 text-muted" aria-hidden /> {r}
                        </Command.Item>
                      ))}
                    </Command.Group>
                  )}
                  <Command.Group
                    heading={
                      <span className="inline-flex items-center gap-1.5">
                        <TrendingUp className="h-3.5 w-3.5" aria-hidden /> Trending
                      </span>
                    }
                    className="[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted"
                  >
                    {trending.map((m) => (
                      <ResultItem key={m.id} market={m} onSelect={() => go(`/markets/${m.id}`)} />
                    ))}
                  </Command.Group>
                </>
              )}
            </Command.List>
            <div className="hidden items-center gap-4 border-t border-line px-4 py-2.5 text-[11px] text-subtle sm:flex">
              <span>↑↓ to navigate</span>
              <span>↵ to open</span>
              <span>Esc to close</span>
            </div>
          </Command>
        </D.Content>
      </D.Portal>
    </D.Root>
  );
}
