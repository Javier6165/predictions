import { useMemo, useRef } from 'react';
import { BRAND } from '@/brand';
import { motion, useScroll, useTransform } from 'motion/react';
import { useMotionOK } from '@/components/motion/useMotionOK';
import { AnimatedNumber } from '@/components/motion/AnimatedNumber';
import { Link } from 'react-router';
import { ArrowRight, CalendarClock, ChevronLeft, ChevronRight, Flame, Lightbulb, TrendingUp } from 'lucide-react';
import { useMarkets, DEMO_NOW } from '@/lib/hooks';
import { CATEGORIES, categoryByName } from '@/data/categories';
import { HERO, INSIGHT_UPDATE_IDS } from '@/data/editorial';
import { biggestMove, changePp, leadOutcome } from '@/domain/selectors';
import { quoteFor } from '@/domain/quotes';
import type { Market, Outcome } from '@/domain/types';
import { SceneArt } from '@/components/art/SceneArt';
import { MarketThumb } from '@/components/art/MarketArt';
import { PpDelta, SaveButton } from '@/components/markets/bits';
import { ProbabilityChart } from '@/components/markets/ProbabilityChart';
import { Button } from '@/components/ui/button';
import { BlurReveal } from '@/components/motion/BlurReveal';
import { BorderBeam } from '@/components/motion/BorderBeam';
import { Spotlight as SpotlightGlow } from '@/components/motion/Spotlight';
import { Chip, SectionHeader } from '@/components/ui/misc';
import { ago, formatDate, formatPrice, timeLeft } from '@/lib/format';
import { cn } from '@/lib/cn';

function Hero({ market }: { market: Market }) {
  const ok = useMotionOK();
  const { scrollY } = useScroll();
  // Cinematic depth: the scene drifts slower than the content as you scroll.
  const artY = useTransform(scrollY, [0, 700], [0, 140]);
  const artScale = useTransform(scrollY, [0, 700], [1, 1.06]);
  const o = market.outcomes[0];
  const yes = quoteFor(o, 'YES');
  const no = quoteFor(o, 'NO');
  const delta = changePp(market, o.id);
  return (
    <section aria-labelledby="hero-title" className="relative isolate overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <motion.div className="absolute inset-0" style={ok ? { y: artY, scale: artScale } : undefined}>
          <SceneArt art="science" seed="hero" hero animated={ok} className="h-full w-full" />
        </motion.div>
        <div className="absolute inset-0 bg-[linear-gradient(90deg,#0f0e0c_0%,rgb(15_14_12/0.85)_35%,rgb(15_14_12/0.15)_70%,rgb(15_14_12/0.35)_100%)] max-lg:bg-[linear-gradient(180deg,rgb(15_14_12/0.55),rgb(15_14_12/0.8)_60%,#0f0e0c)]" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-bg to-transparent" />
        <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-bg/70 to-transparent" />
      </div>
      <div className="mx-auto grid max-w-[1320px] gap-10 px-4 pb-16 pt-28 sm:px-6 sm:pt-32 lg:grid-cols-[1.25fr_0.75fr] lg:items-center lg:px-8 lg:pb-24 lg:pt-40">
        <div className="max-w-xl">
          <div className="flex flex-wrap items-center gap-2">
            <Chip className="border-ink/20 bg-black/30 text-[11px] uppercase tracking-[0.12em] text-ink">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden /> Featured market
            </Chip>
          </div>
          <h1 id="hero-title" className="mt-5 text-[40px] font-semibold leading-[1.04] tracking-[-0.035em] text-ink sm:text-6xl lg:text-[68px]">
            <BlurReveal text={HERO.headlineLead} /> <BlurReveal text={HERO.headlineAccent} wordClassName="text-gradient" delay={0.3} />
          </h1>
          <p className="mt-5 max-w-lg text-[17px] leading-relaxed text-ink-2">{HERO.dek}</p>
          <div className="mt-8 flex items-center gap-3">
            <Button asChild variant="white" size="lg" className="rounded-full px-6">
              <Link to={`/markets/${market.id}`}>
                Explore market <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <SaveButton marketId={market.id} label={market.title} variant="pill" />
          </div>
          <p className="mt-6 text-xs text-muted">
            Closes {formatDate(market.closeAt)} · {timeLeft(market.closeAt, DEMO_NOW)}
          </p>
        </div>

        <div className="glass relative w-full max-w-md justify-self-end rounded-3xl p-5 sm:p-6">
          <BorderBeam />
          <div className="flex items-start justify-between">
            <div>
              <AnimatedNumber
                value={o.probabilityCents}
                from={0}
                duration={1.4}
                format={(v) => `${v}%`}
                className="block text-5xl font-semibold tracking-tight tabular"
              />
              <p className="mt-1 text-sm text-ink-2">chance of Yes · indicative</p>
            </div>
            <PpDelta value={delta} suffix="7d" className="mt-2 text-sm" />
          </div>
          <div className="mt-4 h-28">
            <ProbabilityChart market={market} outcomeIds={[o.id]} compact height={112} nowIso={DEMO_NOW} />
          </div>
          {yes && no ? (
            <div className="mt-4 grid grid-cols-2 gap-2.5">
              <Link
                to={`/markets/${market.id}?side=YES`}
                className="group flex items-center justify-between rounded-2xl border border-yes/30 bg-yes-soft px-4 py-3 transition hover:border-yes/60"
              >
                <span>
                  <span className="block text-xs text-ink-2">Yes</span>
                  <span className="text-lg font-semibold text-yes tabular">{formatPrice(yes.askCents)}</span>
                </span>
                <span className="rounded-full bg-yes px-3 py-1.5 text-xs font-semibold text-bg">Predict</span>
              </Link>
              <Link
                to={`/markets/${market.id}?side=NO`}
                className="group flex items-center justify-between rounded-2xl border border-no/30 bg-no-soft px-4 py-3 transition hover:border-no/60"
              >
                <span>
                  <span className="block text-xs text-ink-2">No</span>
                  <span className="text-lg font-semibold text-no tabular">{formatPrice(no.askCents)}</span>
                </span>
                <span className="rounded-full bg-no px-3 py-1.5 text-xs font-semibold text-bg">Predict</span>
              </Link>
            </div>
          ) : (
            <p className="mt-4 rounded-xl border border-warn/30 bg-warn-soft p-3 text-sm text-warn">Trading is paused on this market.</p>
          )}
          <p className="mt-3 text-[11px] text-subtle">Prices per contract. You’ll review everything before anything is bought.</p>
        </div>
      </div>
    </section>
  );
}

function Spotlight({ markets }: { markets: Market[] }) {
  const ref = useRef<HTMLUListElement>(null);
  const scroll = (dir: number) => ref.current?.scrollBy({ left: dir * 300, behavior: 'smooth' });
  return (
    <section aria-labelledby="spotlight-title" className="relative z-10 mx-auto -mt-6 max-w-[1320px] px-4 sm:px-6 lg:px-8">
      <div className="card flex items-stretch gap-0 overflow-hidden p-0">
        <div className="hidden w-40 shrink-0 flex-col justify-between border-r border-line p-4 sm:flex">
          <h2 id="spotlight-title" className="text-sm font-medium leading-snug text-ink-2">
            Other markets in the spotlight
          </h2>
          <div className="flex gap-2">
            <button type="button" onClick={() => scroll(-1)} className="rounded-full border border-line-strong p-1.5 text-ink-2 hover:bg-ink/5" aria-label="Scroll spotlight left">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button type="button" onClick={() => scroll(1)} className="rounded-full border border-line-strong p-1.5 text-ink-2 hover:bg-ink/5" aria-label="Scroll spotlight right">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
        <ul ref={ref} className="scrollbar-none flex flex-1 snap-x gap-0 overflow-x-auto">
          {markets.map((m) => {
            const lead = leadOutcome(m);
            return (
              <li key={m.id} className="group relative flex min-w-[260px] flex-1 snap-start items-center gap-3 border-r border-line p-4 transition-colors last:border-r-0 hover:bg-ink/[0.03]">
                <MarketThumb market={m} className="h-14 w-14" />
                <div className="min-w-0">
                  <Link to={`/markets/${m.id}`} className="line-clamp-2 text-[13px] font-medium leading-snug text-ink after:absolute after:inset-0">
                    {m.question}
                  </Link>
                  <p className="mt-1 flex items-center gap-2">
                    <span className="text-lg font-semibold tabular">{lead.probabilityCents}%</span>
                    {m.type === 'MULTI_OUTCOME' && <span className="truncate text-xs text-muted">{lead.label}</span>}
                    <PpDelta value={changePp(m, lead.id)} />
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

function Categories({ markets }: { markets: Market[] }) {
  return (
    <section aria-labelledby="cat-title" className="mx-auto mt-14 max-w-[1320px] px-4 sm:px-6 lg:px-8">
      <SectionHeader
        title={<span id="cat-title">Explore by category</span>}
        action={
          <Link to="/explore" className="inline-flex items-center gap-1.5 text-sm text-ink-2 hover:text-ink">
            All markets <ArrowRight className="h-4 w-4" />
          </Link>
        }
      />
      <ul className="stagger scrollbar-none mt-5 -mx-4 flex gap-3 overflow-x-auto px-4 sm:mx-0 sm:grid sm:grid-cols-4 sm:px-0 lg:grid-cols-8">
        {CATEGORIES.map((c) => {
          const count = markets.filter((m) => m.category === c.name).length;
          return (
            <li key={c.slug} className="w-36 shrink-0 sm:w-auto">
              <SpotlightGlow className="rounded-2xl" color="rgba(255,255,255,0.12)">
              <Link
                to={`/explore?category=${c.slug}`}
                className="group relative block aspect-[3/4] overflow-hidden rounded-2xl ring-1 ring-ink/10 transition hover:ring-ink/30"
              >
                <SceneArt art={c.art} seed={c.slug} sizes="(min-width: 1024px) 160px, 144px" className="transition duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-3">
                  <div>
                    <p className="text-sm font-semibold text-white">{c.shortName}</p>
                    <p className="text-xs text-white/70">
                      {count} market{count === 1 ? '' : 's'}
                    </p>
                  </div>
                  <span className="flex h-7 w-7 items-center justify-center rounded-full border border-ink/30 text-white transition group-hover:bg-white group-hover:text-slate-900">
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                  </span>
                </div>
              </Link>
              </SpotlightGlow>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function RankedList({ title, subtitle, icon, markets, pick, href }: { title: string; subtitle: string; icon: React.ReactNode; markets: Market[]; pick: (m: Market) => Outcome; href: string }) {
  return (
    <section className="card p-4 sm:p-6" aria-label={title}>
      <SectionHeader
        as="h2"
        title={title}
        subtitle={subtitle}
        icon={icon}
        action={
          <Link to={href} className="inline-flex shrink-0 items-center gap-1 text-xs text-ink-2 hover:text-ink">
            View all <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        }
      />
      <ol className="stagger mt-4 divide-y divide-line">
        {markets.map((m, i) => {
          const o = pick(m);
          return (
            <li key={m.id} className="group relative flex items-center gap-3 rounded-xl py-3 transition-colors hover:bg-ink/[0.025]">
              <span className="hidden w-4 text-center text-sm text-subtle tabular sm:block">{i + 1}</span>
              <MarketThumb market={m} className="hidden h-12 w-12 sm:block" />
              <Link to={`/markets/${m.id}`} className="line-clamp-2 min-w-0 flex-1 text-sm font-medium leading-snug text-ink after:absolute after:inset-0">
                {m.question}
              </Link>
              <div className="w-[76px] shrink-0 text-right sm:w-[88px]">
                {m.type === 'MULTI_OUTCOME' && <p className="truncate text-[11px] font-medium text-accent">{o.label}</p>}
                <p className="text-lg font-semibold tabular">{o.probabilityCents}%</p>
                <PpDelta value={changePp(m, o.id)} />
              </div>
              <SaveButton marketId={m.id} label={m.title} className="relative z-10" />
            </li>
          );
        })}
      </ol>
    </section>
  );
}

function Insights({ markets }: { markets: Market[] }) {
  const notes = INSIGHT_UPDATE_IDS.map((id) => {
    const m = markets.find((x) => x.updates.some((u) => u.id === id));
    const u = m?.updates.find((x) => x.id === id);
    return m && u ? { m, u } : null;
  }).filter((x): x is NonNullable<typeof x> => x !== null);
  const lead = notes[0];
  return (
    <section aria-labelledby="insights-title" className="mx-auto mt-14 max-w-[1320px] px-4 sm:px-6 lg:px-8">
      <div className="relative isolate overflow-hidden rounded-3xl border border-line">
        <div className="absolute inset-0 -z-10 opacity-70">
          <SceneArt art="science" seed="insights-dunes" />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,#0f0e0c_10%,rgb(15_14_12/0.85)_50%,rgb(15_14_12/0.55))]" />
        </div>
        <div className="grid gap-8 p-6 sm:p-10 lg:grid-cols-[1fr_1.1fr] lg:items-center">
          <div>
            <Chip className="border-ink/15 bg-black/30 text-[11px] uppercase tracking-[0.12em]">
              <Lightbulb className="h-3 w-3 text-warn" aria-hidden /> Insights
            </Chip>
            <h2 id="insights-title" className="mt-4 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
              Understand what moves the odds.
            </h2>
            <p className="mt-3 max-w-md text-ink-2">
              Short notes on the story behind each market — what changed, and why the odds moved.
            </p>
            {lead && (
              <Button asChild variant="white" size="lg" className="mt-6 rounded-full">
                <Link to={`/markets/${lead.m.id}?tab=news`}>
                  Read the latest note <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            )}
          </div>
          <ul className="grid gap-3">
            {notes.map(({ m, u }) => (
              <li key={u.id} className="lift group relative flex gap-3 rounded-2xl border border-ink/10 bg-black/35 p-3 backdrop-blur-md hover:border-ink/25">
                <MarketThumb market={m} className="h-16 w-20" />
                <div className="min-w-0">
                  <Link to={`/markets/${m.id}?tab=news`} className="line-clamp-2 text-sm font-medium text-ink after:absolute after:inset-0">
                    {u.title}
                  </Link>
                  <p className="mt-1 text-xs text-muted">
                    {BRAND.newsroom} · {ago(u.at, DEMO_NOW)} · {categoryByName(m.category).shortName}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function ClosingSoon({ markets }: { markets: Market[] }) {
  return (
    <section aria-labelledby="closing-title" className="mx-auto mt-14 max-w-[1320px] px-4 sm:px-6 lg:px-8">
      <SectionHeader
        title={<span id="closing-title">Closing soon</span>}
        subtitle="Open markets with the nearest deadlines."
        icon={<CalendarClock className="mt-1 h-6 w-6 text-ink-2" aria-hidden />}
        action={
          <Link to="/explore?sort=ending" className="inline-flex shrink-0 items-center gap-1.5 text-sm text-ink-2 hover:text-ink">
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        }
      />
      <ul className="stagger mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {markets.map((m) => {
          const d = new Date(m.closeAt);
          return (
            <li key={m.id} className="card lift group relative flex items-center gap-3 p-3.5">
              <div className="w-11 shrink-0 text-center">
                <p className="text-[11px] font-semibold uppercase text-muted">{d.toLocaleString('en-US', { month: 'short', timeZone: 'UTC' })}</p>
                <p className="text-xl font-semibold tabular">{d.getUTCDate()}</p>
              </div>
              <MarketThumb market={m} className="h-12 w-12" />
              <div className="min-w-0">
                <Link to={`/markets/${m.id}`} className="line-clamp-2 text-[13px] font-medium leading-snug after:absolute after:inset-0">
                  {m.title}
                </Link>
                <p className="mt-1 text-xs text-muted">{timeLeft(m.closeAt, DEMO_NOW)}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export function HomePage() {
  const markets = useMarkets();
  const featured = markets.find((m) => m.id === HERO.marketId) ?? markets[0];
  const open = useMemo(() => markets.filter((m) => m.status === 'OPEN' || m.status === 'SUSPENDED'), [markets]);
  const trending = useMemo(() => [...open].sort((a, b) => b.activity.trendingScore - a.activity.trendingScore).slice(0, 5), [open]);
  const movers = useMemo(() => [...open].sort((a, b) => biggestMove(b) - biggestMove(a)).slice(0, 5), [open]);
  const spotlight = useMemo(
    () => [...open].filter((m) => m.id !== featured.id).sort((a, b) => b.activity.volume24hCents - a.activity.volume24hCents).slice(0, 6),
    [open, featured.id],
  );
  const closing = useMemo(
    () => [...markets].filter((m) => m.status === 'OPEN').sort((a, b) => Date.parse(a.closeAt) - Date.parse(b.closeAt)).slice(0, 4),
    [markets],
  );
  const biggestMover = (m: Market) => [...m.outcomes].sort((a, b) => Math.abs(changePp(m, b.id)) - Math.abs(changePp(m, a.id)))[0];

  return (
    <div>
      <Hero market={featured} />
      <Spotlight markets={spotlight} />
      <Categories markets={markets} />
      <div className="mx-auto mt-14 grid max-w-[1320px] gap-5 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
        <RankedList
          title="Trending now"
          subtitle="Where the action is right now."
          icon={<Flame className="mt-1 h-6 w-6 text-no" aria-hidden />}
          markets={trending}
          pick={leadOutcome}
          href="/explore?sort=trending"
        />
        <RankedList
          title="Biggest movers"
          subtitle="Largest probability changes over the last 7 days, in percentage points."
          icon={<TrendingUp className={cn('mt-1 h-6 w-6 text-accent')} aria-hidden />}
          markets={movers}
          pick={biggestMover}
          href="/explore?sort=movers"
        />
      </div>
      <Insights markets={markets} />
      <ClosingSoon markets={closing} />
    </div>
  );
}
