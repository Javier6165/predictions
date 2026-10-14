import { useMemo } from 'react';
import { Link } from 'react-router';
import { ChevronRight } from 'lucide-react';
import { BRAND } from '@/brand';
import { useMarkets, DEMO_NOW } from '@/lib/hooks';
import { CATEGORIES, categoryByName } from '@/data/categories';
import { HERO, INSIGHT_UPDATE_IDS } from '@/data/editorial';
import { biggestMove, changePp } from '@/domain/selectors';
import { quoteFor } from '@/domain/quotes';
import type { Market } from '@/domain/types';
import { SceneArt } from '@/components/art/SceneArt';
import { MarketThumb } from '@/components/art/MarketArt';
import { useMotionOK } from '@/components/motion/useMotionOK';
import { BlurReveal } from '@/components/motion/BlurReveal';
import { PpDelta, SaveButton } from '@/components/markets/bits';
import { InHundred, YesNoDots } from '@/components/markets/Odds';
import { StoryCard } from '@/components/markets/StoryCard';
import { ago, formatDate, formatPrice, timeLeft } from '@/lib/format';

/** Apple-style two-tone section title: the statement, then a quieter line. */
function SectionTitle({ id, title, line, action }: { id: string; title: string; line: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-3">
      <h2 id={id} className="font-display max-w-3xl text-[30px] leading-[1.1] text-ink sm:text-[40px]">
        {title} <span className="text-muted">{line}</span>
      </h2>
      {action}
    </div>
  );
}

function More({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link to={to} className="inline-flex shrink-0 items-center gap-0.5 text-[15px] text-accent hover:underline">
      {children} <ChevronRight className="h-4 w-4" aria-hidden />
    </Link>
  );
}

/** Product-page hero: one question, asked big, then the picture with the odds on it. */
function Hero({ market }: { market: Market }) {
  const ok = useMotionOK();
  const o = market.outcomes[0];
  const yes = quoteFor(o, 'YES');
  const no = quoteFor(o, 'NO');
  return (
    <section aria-labelledby="hero-title" className="mx-auto max-w-[1240px] px-4 pt-12 sm:px-6 sm:pt-20 lg:px-8">
      <div className="mx-auto max-w-4xl text-center">
        <p className="text-[15px] font-semibold text-no sm:text-[17px]">Question of the week</p>
        <h1 id="hero-title" className="font-display mt-3 text-[44px] leading-[1.04] tracking-[-0.035em] text-ink sm:text-[72px] lg:text-[84px]">
          <BlurReveal text={HERO.headlineLead} /> <BlurReveal text={HERO.headlineAccent} wordClassName="text-muted" delay={0.3} />
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-[19px] leading-relaxed text-ink-2 sm:text-[21px]">{HERO.dek}</p>
        {yes && no ? (
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              to={`/markets/${market.id}?side=YES`}
              className="inline-flex h-12 items-center gap-2 rounded-full bg-cta px-6 text-[17px] font-medium text-on-cta transition hover:bg-cta-hover"
            >
              I think yes <span className="tabular">{formatPrice(yes.askCents)}</span>
            </Link>
            <Link
              to={`/markets/${market.id}?side=NO`}
              className="inline-flex h-12 items-center gap-2 rounded-full bg-ink/[0.07] px-6 text-[17px] font-medium text-ink transition hover:bg-ink/10"
            >
              I think no <span className="tabular text-muted">{formatPrice(no.askCents)}</span>
            </Link>
          </div>
        ) : (
          <p className="mt-8 text-sm text-warn">Trading is paused on this market.</p>
        )}
        <p className="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[14px] text-muted">
          <span>
            Closes {formatDate(market.closeAt)} · {timeLeft(market.closeAt, DEMO_NOW)}
          </span>
          <More to={`/markets/${market.id}`}>Explore market</More>
          <SaveButton marketId={market.id} label={market.title} />
        </p>
      </div>

      <figure className="relative m-0 mt-12 overflow-hidden rounded-[32px] sm:mt-16" data-theme="dark">
        <div className="relative aspect-[4/5] sm:aspect-[16/9] lg:aspect-[21/9]">
          <SceneArt art="science" seed="hero" hero animated={ok} sizes="(min-width: 1280px) 1200px, 100vw" className="absolute inset-0" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent sm:bg-gradient-to-r sm:from-black/70 sm:via-black/20" />
        </div>
        <figcaption className="absolute inset-x-0 bottom-0 flex flex-col gap-5 p-6 sm:inset-y-0 sm:left-0 sm:right-auto sm:w-[420px] sm:justify-end sm:p-10">
          <YesNoDots yes={o.probabilityCents} size="md" className="w-[120px] sm:w-[148px]" />
          <div>
            <p className="eyebrow">The crowd says</p>
            <p className="mt-1 flex items-baseline gap-3">
              <InHundred value={o.probabilityCents} className="text-[64px] leading-none text-ink sm:text-[80px]" />
            </p>
            <p className="mt-2 flex flex-wrap items-center gap-2 text-[14px] text-ink-2">
              chance a crewed landing happens in time <PpDelta value={changePp(market, o.id)} suffix="this week" />
            </p>
          </div>
        </figcaption>
      </figure>
    </section>
  );
}

function Trending({ markets }: { markets: Market[] }) {
  const [lead, ...rest] = markets;
  return (
    <section aria-labelledby="trending-title" className="mx-auto mt-24 max-w-[1240px] px-4 sm:mt-32 sm:px-6 lg:px-8">
      <SectionTitle id="trending-title" title="Trending." line="What people are weighing right now." action={<More to="/explore?sort=trending">All markets</More>} />
      <div className="stagger mt-8 grid gap-4 sm:gap-5 md:grid-cols-2 lg:grid-cols-3">
        {lead && <StoryCard market={lead} size="lg" className="md:col-span-2 lg:row-span-2" />}
        {rest.map((m, i) => (
          // Lead + 5 fills the 3-column bento exactly; on 2 columns the last tile would sit alone.
          <StoryCard key={m.id} market={m} className={i === rest.length - 1 ? 'md:max-lg:hidden' : undefined} />
        ))}
      </div>
    </section>
  );
}

/** Store-style category strip: picture, label, nothing else. */
function Topics({ markets }: { markets: Market[] }) {
  return (
    <section aria-labelledby="cat-title" className="mx-auto mt-24 max-w-[1240px] px-4 sm:mt-32 sm:px-6 lg:px-8">
      <SectionTitle id="cat-title" title="Explore by category." line="Pick a topic you know." />
      <ul className="scrollbar-none -mx-4 mt-8 flex gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-4 sm:gap-6 sm:px-0 lg:grid-cols-8">
        {CATEGORIES.map((c) => {
          const count = markets.filter((m) => m.category === c.name).length;
          return (
            <li key={c.slug} className="w-[92px] shrink-0 sm:w-auto">
              <Link to={`/explore?category=${c.slug}`} className="group block text-center">
                <span className="relative block aspect-square overflow-hidden rounded-[22px]" data-theme="dark">
                  <SceneArt art={c.art} seed={c.slug} sizes="120px" className="transition-transform duration-500 group-hover:scale-[1.06]" />
                </span>
                <span className="mt-2.5 block text-[14px] font-medium leading-tight text-ink">{c.shortName}</span>
                <span className="text-[12px] text-muted">
                  {count} market{count === 1 ? '' : 's'}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/** Biggest movers as a grouped list: calm rows, the shift stated plainly. */
function Shifts({ markets }: { markets: Market[] }) {
  return (
    <section aria-labelledby="movers-title" className="mx-auto mt-24 max-w-[1240px] px-4 sm:mt-32 sm:px-6 lg:px-8">
      <SectionTitle id="movers-title" title="This week." line="The biggest moves in the last 7 days." action={<More to="/explore?sort=movers">See all movers</More>} />
      <ol className="card mt-8 divide-y divide-line px-5 sm:px-7">
        {markets.map((m) => {
          const o = [...m.outcomes].sort((a, b) => Math.abs(changePp(m, b.id)) - Math.abs(changePp(m, a.id)))[0];
          const d = changePp(m, o.id);
          const before = o.probabilityCents - d;
          return (
            <li key={m.id} className="group relative flex items-center gap-4 py-4 sm:py-5">
              <MarketThumb market={m} className="h-12 w-12 rounded-xl" />
              <div className="min-w-0 flex-1">
                <Link to={`/markets/${m.id}`} className="line-clamp-2 text-[16px] font-medium leading-snug text-ink after:absolute after:inset-0 sm:text-[17px]">
                  {m.question}
                </Link>
                <p className="mt-0.5 text-[13px] text-muted">
                  {categoryByName(m.category).shortName}
                  {m.type === 'MULTI_OUTCOME' && <> · {o.label}</>}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-[15px] text-muted tabular">
                  {before} → <span className="font-semibold text-ink">{o.probabilityCents}</span>
                  <span className="hidden sm:inline"> in 100</span>
                </p>
                <PpDelta value={d} />
              </div>
            </li>
          );
        })}
      </ol>
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
    <section aria-labelledby="insights-title" className="mx-auto mt-24 max-w-[1240px] px-4 sm:mt-32 sm:px-6 lg:px-8">
      <SectionTitle id="insights-title" title={`${BRAND.newsroom}.`} line="Understand what moves the odds." />
      <ul className="mt-8 grid gap-4 sm:gap-5 md:grid-cols-3">
        {notes.map(({ m, u }) => (
          <li key={u.id} className="card group relative flex flex-col p-6 sm:p-7">
            <p className="eyebrow">
              {categoryByName(m.category).shortName} · {ago(u.at, DEMO_NOW)}
            </p>
            <Link to={`/markets/${m.id}?tab=news`} className="font-display mt-2 text-[21px] leading-snug text-ink after:absolute after:inset-0 after:rounded-[inherit]">
              {u.title}
            </Link>
            <p className="mt-2 line-clamp-3 text-[15px] leading-relaxed text-ink-2">{u.body}</p>
            <span className="mt-auto inline-flex items-center gap-0.5 pt-5 text-[15px] text-accent">
              Read the note <ChevronRight className="h-4 w-4" aria-hidden />
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
    <div className="pb-16">
      <Hero market={featured} />
      <Trending markets={trending} />
      <Topics markets={markets} />
      <Shifts markets={movers} />
      <Notes markets={markets} />
    </div>
  );
}
