import { useMemo } from 'react';
import { Link } from 'react-router';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { BRAND } from '@/brand';
import { useMarkets, DEMO_NOW } from '@/lib/hooks';
import { CATEGORIES, categoryByName } from '@/data/categories';
import { HERO, INSIGHT_UPDATE_IDS } from '@/data/editorial';
import { biggestMove, changePp } from '@/domain/selectors';
import { proposition } from '@/domain/copy';
import { quoteFor } from '@/domain/quotes';
import type { Market } from '@/domain/types';
import { SceneArt } from '@/components/art/SceneArt';
import { useMotionOK } from '@/components/motion/useMotionOK';
import { BlurReveal } from '@/components/motion/BlurReveal';
import { SaveButton } from '@/components/markets/bits';
import { InHundred, YesNoDots } from '@/components/markets/Odds';
import { StoryCard } from '@/components/markets/StoryCard';
import { ago, formatDate, formatPp, formatPrice, timeLeft } from '@/lib/format';
import { cn } from '@/lib/cn';

function Kicker({ children, className }: { children: React.ReactNode; className?: string }) {
  return <p className={cn('text-[11px] font-semibold uppercase tracking-[0.18em] text-muted', className)}>{children}</p>;
}

function SectionTitle({ id, kicker, title, action }: { id: string; kicker: string; title: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="flex items-end justify-between gap-6 border-t border-ink/80 pt-4">
      <div>
        <Kicker>{kicker}</Kicker>
        <h2 id={id} className="font-display mt-1 text-[34px] leading-[1.05] text-ink sm:text-[44px]">
          {title}
        </h2>
      </div>
      {action}
    </div>
  );
}

function SeeAll({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link to={to} className="mb-1.5 inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-ink-2 hover:text-ink">
      {children} <ArrowRight className="h-4 w-4" aria-hidden />
    </Link>
  );
}

/** The cover: one question, asked big, with the odds you can count. */
function Cover({ market }: { market: Market }) {
  const ok = useMotionOK();
  const o = market.outcomes[0];
  const yes = quoteFor(o, 'YES');
  const no = quoteFor(o, 'NO');
  const delta = changePp(market, o.id);
  return (
    <section aria-labelledby="hero-title" className="mx-auto max-w-[1320px] px-4 pt-8 sm:px-6 sm:pt-12 lg:px-8">
      <div className="flex items-center justify-between gap-4 border-b border-ink/80 pb-3">
        <Kicker className="text-ink">The question of the week</Kicker>
        <Kicker className="hidden sm:block">{formatDate(DEMO_NOW)}</Kicker>
      </div>
      <div className="grid gap-8 pt-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-14 lg:pt-12">
        <div className="flex flex-col">
          <h1 id="hero-title" className="font-display text-[52px] leading-[0.95] tracking-[-0.02em] text-ink sm:text-[84px] lg:text-[104px]">
            <BlurReveal text={HERO.headlineLead} /> <BlurReveal text={HERO.headlineAccent} wordClassName="italic" delay={0.3} />
          </h1>
          <p className="mt-6 max-w-xl text-[17px] leading-relaxed text-ink-2">{HERO.dek}</p>

          <div className="mt-8 grid gap-6 rounded-3xl border border-line bg-surface p-5 sm:grid-cols-[auto_1fr] sm:items-center sm:p-6">
            <YesNoDots yes={o.probabilityCents} size="md" className="w-[132px]" />
            <div>
              <Kicker>The crowd says</Kicker>
              <p className="mt-1 flex flex-wrap items-baseline gap-x-3">
                <InHundred value={o.probabilityCents} className="text-[64px] leading-none text-yes" />
                <span className="text-sm text-muted">
                  {delta === 0 ? 'unchanged this week' : `${formatPp(delta)} this week`}
                </span>
              </p>
              <p className="mt-1 text-sm text-ink-2">{proposition(market, o.id, 'YES')}</p>
              {yes && no ? (
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <Link
                    to={`/markets/${market.id}?side=YES`}
                    className="inline-flex h-11 items-center gap-2 rounded-full bg-yes px-5 text-sm font-semibold text-on-side transition hover:bg-yes-strong"
                  >
                    I think yes <span className="tabular opacity-80">{formatPrice(yes.askCents)}</span>
                  </Link>
                  <Link
                    to={`/markets/${market.id}?side=NO`}
                    className="inline-flex h-11 items-center gap-2 rounded-full border-2 border-no px-5 text-sm font-semibold text-no transition hover:bg-no hover:text-on-side"
                  >
                    I think no <span className="tabular opacity-80">{formatPrice(no.askCents)}</span>
                  </Link>
                  <SaveButton marketId={market.id} label={market.title} />
                </div>
              ) : (
                <p className="mt-4 text-sm text-warn">Trading is paused on this market.</p>
              )}
            </div>
          </div>
          <p className="mt-4 flex items-center gap-4 text-xs text-muted">
            <span>
              Closes {formatDate(market.closeAt)} · {timeLeft(market.closeAt, DEMO_NOW)}
            </span>
            <Link to={`/markets/${market.id}`} className="inline-flex items-center gap-1 font-medium text-ink-2 hover:text-ink">
              Explore market <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
          </p>
        </div>

        <figure className="relative m-0 min-h-[360px] overflow-hidden rounded-[28px] lg:min-h-0" data-theme="dark">
          <SceneArt art="science" seed="hero" hero animated={ok} sizes="(min-width: 1024px) 45vw, 100vw" className="absolute inset-0" />
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/70 to-transparent" />
          <figcaption className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5 text-white">
            <span className="font-display max-w-[16ch] text-2xl leading-tight">“Test flights slip, timelines firm up.”</span>
            <span className="text-[11px] uppercase tracking-[0.16em] text-white/80">{BRAND.newsroom}</span>
          </figcaption>
        </figure>
      </div>
    </section>
  );
}

function Trending({ markets }: { markets: Market[] }) {
  const [lead, ...rest] = markets;
  return (
    <section aria-labelledby="trending-title" className="mx-auto mt-20 max-w-[1320px] px-4 sm:px-6 lg:px-8">
      <SectionTitle id="trending-title" kicker="Trending" title="What people are weighing" action={<SeeAll to="/explore?sort=trending">All markets</SeeAll>} />
      <div className="stagger mt-8 grid gap-x-8 gap-y-8 sm:gap-y-12 md:grid-cols-2 lg:grid-cols-3">
        {lead && <StoryCard market={lead} size="lg" className="md:col-span-2 lg:row-span-2" />}
        {rest.map((m) => (
          <StoryCard key={m.id} market={m} />
        ))}
      </div>
    </section>
  );
}

/** Biggest movers as a typographic list: the shift itself is the headline. */
function Shifts({ markets }: { markets: Market[] }) {
  return (
    <section aria-labelledby="movers-title" className="mx-auto mt-20 max-w-[1320px] px-4 sm:px-6 lg:px-8">
      <SectionTitle
        id="movers-title"
        kicker="Biggest movers · last 7 days"
        title="This week’s shifts"
        action={<SeeAll to="/explore?sort=movers">See all</SeeAll>}
      />
      <ol className="mt-2">
        {markets.map((m) => {
          const o = [...m.outcomes].sort((a, b) => Math.abs(changePp(m, b.id)) - Math.abs(changePp(m, a.id)))[0];
          const d = changePp(m, o.id);
          const before = o.probabilityCents - d;
          return (
            <li key={m.id} className="group relative grid grid-cols-[88px_1fr] items-center gap-4 border-b border-line py-5 sm:grid-cols-[150px_1fr_auto] sm:gap-8">
              <p className={cn('font-display text-[40px] leading-none tabular sm:text-[56px]', d > 0 ? 'text-yes' : 'text-no')}>
                {d > 0 ? '+' : '−'}
                {Math.abs(d)}
                <span className="ml-1 text-[0.4em] tracking-wide">pp</span>
              </p>
              <div className="min-w-0">
                <Kicker>
                  {categoryByName(m.category).shortName}
                  {m.type === 'MULTI_OUTCOME' && <> · {o.label}</>}
                </Kicker>
                <Link to={`/markets/${m.id}`} className="font-display mt-1 block text-[22px] leading-snug text-ink after:absolute after:inset-0 group-hover:underline sm:text-[26px]">
                  {m.question}
                </Link>
              </div>
              <p className="col-start-2 text-sm text-muted sm:col-start-auto sm:text-right">
                <span className="tabular">{before}</span> → <span className="font-semibold text-ink tabular">{o.probabilityCents}</span> in 100
              </p>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

function Topics({ markets }: { markets: Market[] }) {
  return (
    <section aria-labelledby="cat-title" className="mx-auto mt-20 max-w-[1320px] px-4 sm:px-6 lg:px-8">
      <SectionTitle id="cat-title" kicker="Explore by category" title="Pick a topic" />
      <ul className="mt-6 flex flex-wrap gap-2.5">
        {CATEGORIES.map((c) => {
          const count = markets.filter((m) => m.category === c.name).length;
          return (
            <li key={c.slug}>
              <Link
                to={`/explore?category=${c.slug}`}
                className="group inline-flex h-12 items-center gap-3 rounded-full border border-line-strong bg-surface pl-1.5 pr-5 text-[15px] font-medium text-ink transition hover:border-ink hover:bg-ink hover:text-bg"
              >
                <span className="h-9 w-9 overflow-hidden rounded-full" data-theme="dark" aria-hidden>
                  <SceneArt art={c.art} seed={c.slug} sizes="40px" />
                </span>
                {c.name}
                <span className="text-sm text-muted tabular group-hover:text-bg/70">{count}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function Notes({ markets }: { markets: Market[] }) {
  const notes = INSIGHT_UPDATE_IDS.map((id) => {
    const m = markets.find((x) => x.updates.some((u) => u.id === id));
    const u = m?.updates.find((x) => x.id === id);
    return m && u ? { m, u } : null;
  }).filter((x): x is NonNullable<typeof x> => x !== null);
  return (
    <section aria-labelledby="insights-title" className="mx-auto mt-20 max-w-[1320px] px-4 sm:px-6 lg:px-8">
      <SectionTitle id="insights-title" kicker={BRAND.newsroom} title="Understand what moves the odds." />
      <ul className="mt-8 grid gap-8 md:grid-cols-3">
        {notes.map(({ m, u }, i) => (
          <li key={u.id} className="group relative">
            <p className="font-display text-[56px] leading-none text-ink/15">{String(i + 1).padStart(2, '0')}</p>
            <Kicker className="mt-3">
              {categoryByName(m.category).shortName} · {ago(u.at, DEMO_NOW)}
            </Kicker>
            <Link to={`/markets/${m.id}?tab=news`} className="font-display mt-2 block text-[24px] leading-snug text-ink after:absolute after:inset-0 group-hover:underline">
              {u.title}
            </Link>
            <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-ink-2">{u.body}</p>
            <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-ink">
              Read the note <ArrowUpRight className="h-4 w-4" aria-hidden />
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function HomePage() {
  const markets = useMarkets();
  const featured = markets.find((m) => m.id === HERO.marketId) ?? markets[0];
  const open = useMemo(() => markets.filter((m) => m.status === 'OPEN' || m.status === 'SUSPENDED'), [markets]);
  const trending = useMemo(
    () => [...open].filter((m) => m.id !== featured.id).sort((a, b) => b.activity.trendingScore - a.activity.trendingScore).slice(0, 6),
    [open, featured.id],
  );
  const movers = useMemo(() => [...open].sort((a, b) => biggestMove(b) - biggestMove(a)).slice(0, 5), [open]);

  return (
    <div className="pb-8">
      <Cover market={featured} />
      <Trending markets={trending} />
      <Shifts markets={movers} />
      <Topics markets={markets} />
      <Notes markets={markets} />
    </div>
  );
}
