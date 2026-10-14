import { useId, useMemo } from 'react';
import { Area, AreaChart, CartesianGrid, Line, LineChart, ReferenceDot, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { ChartAnnotation } from '@/domain/selectors';
import { useMotionOK } from '@/components/motion/useMotionOK';
import type { Market, Side } from '@/domain/types';
import { formatDate, formatShortDate } from '@/lib/format';

/** Theme-aware series colours (CSS variables, so they follow light/dark). */
export const SERIES_COLORS = [
  'var(--color-series-1)',
  'var(--color-series-2)',
  'var(--color-series-3)',
  'var(--color-series-4)',
  'var(--color-series-5)',
];
const INK = 'var(--color-ink)';
const MUTED = 'var(--color-muted)';
const LINE = 'var(--color-line)';

export type ChartRange = '1M' | '3M' | 'ALL';

export function rangeStart(range: ChartRange, nowIso: string): string | undefined {
  if (range === 'ALL') return undefined;
  return new Date(Date.parse(nowIso) - (range === '1M' ? 31 : 92) * 86_400_000).toISOString();
}

function sliceByRange<T extends { at: string }>(points: T[], range: ChartRange, nowIso: string): T[] {
  if (range === 'ALL') return points;
  const days = range === '1M' ? 31 : 92;
  const from = Date.parse(nowIso) - days * 86_400_000;
  const out = points.filter((p) => Date.parse(p.at) >= from);
  return out.length >= 2 ? out : points.slice(-2);
}

interface Props {
  market: Market;
  /** Outcomes to draw; binary markets pass their single outcome. */
  outcomeIds: string[];
  side?: Side;
  range?: ChartRange;
  height?: number;
  compact?: boolean;
  nowIso: string;
  highlightOutcomeId?: string;
  /** Numbered note markers pinned to chart points. */
  annotations?: ChartAnnotation[];
  activeAnnotation?: number | null;
  onAnnotationHover?: (n: number | null) => void;
}

/**
 * Probability history from fixture `chartPoints`. The endpoint uses the current
 * outcome probability so a scenario re-quote is reflected. NO = 100 − YES.
 */
export function ProbabilityChart({
  market,
  outcomeIds,
  side = 'YES',
  range = 'ALL',
  height = 280,
  compact = false,
  nowIso,
  highlightOutcomeId,
  annotations = [],
  activeAnnotation = null,
  onAnnotationHover,
}: Props) {
  const gid = useId().replace(/:/g, '');
  // Lines draw in on first view and morph between ranges; static with reduced motion.
  const animateLines = useMotionOK();
  const data = useMemo(() => {
    const pts = market.chartPoints.map((p, i, arr) => {
      const row: Record<string, number | string> = { at: p.at };
      for (const id of outcomeIds) {
        const isLast = i === arr.length - 1;
        const current = market.outcomes.find((o) => o.id === id)?.probabilityCents;
        const yes = isLast && current !== undefined ? current : (p.probabilityCentsByOutcome[id] ?? 0);
        row[id] = side === 'YES' ? yes : 100 - yes;
      }
      return row as { at: string } & Record<string, number>;
    });
    return sliceByRange(pts, range, nowIso);
  }, [market, outcomeIds, side, range, nowIso]);

  const labels = Object.fromEntries(market.outcomes.map((o) => [o.id, market.type === 'MULTI_OUTCOME' ? o.label : side === 'YES' ? 'Yes' : 'No']));
  const first = data[0];
  const last = data[data.length - 1];
  const summary = outcomeIds
    .map((id) => `${labels[id]} ${first[id]}% on ${formatDate(first.at)} to ${last[id]}% on ${formatDate(last.at)}`)
    .join('; ');

  const single = outcomeIds.length === 1;
  const color = single ? (side === 'YES' ? SERIES_COLORS[0] : SERIES_COLORS[1]) : undefined;

  const visibleAt = new Set(data.map((d) => d.at));
  const markers = annotations
    .filter((a) => visibleAt.has(a.pointAt))
    // One marker per point; later notes on the same week share it.
    .filter((a, i, arr) => arr.findIndex((b) => b.pointAt === a.pointAt) === i)
    .map((a) => (
      <ReferenceDot
        key={a.n}
        x={a.pointAt}
        y={a.value}
        ifOverflow="visible"
        shape={(props: { cx?: number; cy?: number }) => {
          const { cx = 0, cy = 0 } = props;
          const sameWeek = annotations.filter((b) => b.pointAt === a.pointAt).map((b) => b.n);
          const active = activeAnnotation !== null && sameWeek.includes(activeAnnotation);
          return (
            <g
              onMouseEnter={() => onAnnotationHover?.(a.n)}
              onMouseLeave={() => onAnnotationHover?.(null)}
              style={{ cursor: 'default' }}
            >
              <line x1={cx} x2={cx} y1={cy - 30} y2={cy - 6} stroke={MUTED} strokeOpacity={0.6} strokeDasharray="2 3" />
              <circle cx={cx} cy={cy} r={active ? 6 : 4.5} fill="var(--color-surface)" stroke={INK} strokeWidth={2} />
              <circle cx={cx} cy={cy - 40} r={active ? 11 : 9.5} fill={active ? 'var(--color-highlight)' : 'var(--color-cta)'} />
              <text x={cx} y={cy - 36.5} textAnchor="middle" fontSize={10.5} fontWeight={700} fill={active ? 'var(--color-on-highlight)' : 'var(--color-on-cta)'}>
                {sameWeek.join('·')}
              </text>
            </g>
          );
        }}
      />
    ));

  const common = {
    data,
    margin: compact ? { top: 4, right: 4, bottom: 0, left: 4 } : { top: annotations.length ? 46 : 10, right: 12, bottom: 0, left: 0 },
  };

  const axes = !compact && (
    <>
      <CartesianGrid stroke={LINE} vertical={false} />
      <XAxis
        dataKey="at"
        tickFormatter={(v: string) => formatShortDate(v)}
        stroke={MUTED}
        tick={{ fontSize: 11, fill: MUTED }}
        tickLine={false}
        axisLine={false}
        minTickGap={28}
      />
      <YAxis
        domain={[0, 100]}
        ticks={[0, 25, 50, 75, 100]}
        tickFormatter={(v: number) => `${v}%`}
        tick={{ fontSize: 11, fill: MUTED }}
        tickLine={false}
        axisLine={false}
        width={44}
      />
      <Tooltip
        cursor={{ stroke: MUTED, strokeOpacity: 0.5 }}
        contentStyle={{ background: 'var(--color-surface)', border: '1px solid var(--color-line-strong)', borderRadius: 12, fontSize: 12, color: INK }}
        labelStyle={{ color: MUTED, marginBottom: 4 }}
        labelFormatter={(v) => `${formatDate(String(v))}`}
        formatter={(v, name) => [`${v}%`, labels[String(name)] ?? String(name)]}
      />
    </>
  );

  return (
    <figure className="m-0" style={{ height }}>
      <figcaption className="sr-only">Implied probability: {summary}.</figcaption>
      <div aria-hidden className="h-full w-full">
        <ResponsiveContainer width="100%" height="100%">
          {single ? (
            <AreaChart {...common} accessibilityLayer={false}>
              <defs>
                <linearGradient id={`${gid}-fill`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor={color} stopOpacity={0.18} />
                  <stop offset="1" stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
              {axes}
              {compact && <YAxis hide domain={['dataMin - 6', 'dataMax + 4']} />}
              <Area
                type="monotone"
                dataKey={outcomeIds[0]}
                stroke={color}
                strokeWidth={compact ? 2 : 2.5}
                fill={`url(#${gid}-fill)`}
                dot={false}
                activeDot={{ r: 4 }}
                isAnimationActive={animateLines}
                animationDuration={900}
                animationEasing="ease-out"
              />
              {!compact && markers}
            </AreaChart>
          ) : (
            <LineChart {...common} accessibilityLayer={false}>
              {axes}
              {outcomeIds.map((id) => {
                const idx = market.outcomes.findIndex((o) => o.id === id);
                const dim = highlightOutcomeId && highlightOutcomeId !== id;
                return (
                  <Line
                    key={id}
                    type="monotone"
                    dataKey={id}
                    stroke={SERIES_COLORS[idx % SERIES_COLORS.length]}
                    strokeWidth={highlightOutcomeId === id ? 3 : 2}
                    strokeOpacity={dim ? 0.35 : 1}
                    dot={false}
                    activeDot={{ r: 4 }}
                    isAnimationActive={animateLines}
                animationDuration={900}
                animationEasing="ease-out"
                  />
                );
              })}
              {!compact && markers}
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
    </figure>
  );
}
