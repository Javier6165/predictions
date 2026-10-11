import { useId, useMemo } from 'react';
import { Area, AreaChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { Market, Side } from '@/domain/types';
import { formatDate, formatShortDate } from '@/lib/format';

export const SERIES_COLORS = ['#3b82f6', '#fb7185', '#34d399', '#fbbf24', '#b388ff'];

export type ChartRange = '1M' | '3M' | 'ALL';

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
}

/**
 * Probability history from fixture `chartPoints`. The endpoint uses the current
 * outcome probability so a scenario re-quote is reflected. NO = 100 − YES.
 */
export function ProbabilityChart({ market, outcomeIds, side = 'YES', range = 'ALL', height = 280, compact = false, nowIso, highlightOutcomeId }: Props) {
  const gid = useId().replace(/:/g, '');
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

  const common = {
    data,
    margin: compact ? { top: 4, right: 4, bottom: 0, left: 4 } : { top: 10, right: 8, bottom: 0, left: 0 },
  };

  const axes = !compact && (
    <>
      <CartesianGrid stroke="rgba(148,163,184,0.10)" vertical={false} />
      <XAxis
        dataKey="at"
        tickFormatter={(v: string) => formatShortDate(v)}
        stroke="rgba(148,163,184,0.5)"
        tick={{ fontSize: 11, fill: '#8e9ab3' }}
        tickLine={false}
        axisLine={false}
        minTickGap={28}
      />
      <YAxis
        domain={[0, 100]}
        ticks={[0, 25, 50, 75, 100]}
        tickFormatter={(v: number) => `${v}%`}
        tick={{ fontSize: 11, fill: '#8e9ab3' }}
        tickLine={false}
        axisLine={false}
        width={44}
      />
      <Tooltip
        cursor={{ stroke: 'rgba(148,163,184,0.35)' }}
        contentStyle={{ background: '#0c1424', border: '1px solid rgba(148,163,184,0.22)', borderRadius: 12, fontSize: 12 }}
        labelStyle={{ color: '#c5cee0', marginBottom: 4 }}
        labelFormatter={(v) => `${formatDate(String(v))} · demo data`}
        formatter={(v, name) => [`${v}%`, labels[String(name)] ?? String(name)]}
      />
    </>
  );

  return (
    <figure className="m-0" style={{ height }}>
      <figcaption className="sr-only">Implied probability, demo data: {summary}.</figcaption>
      <div aria-hidden className="h-full w-full">
        <ResponsiveContainer width="100%" height="100%">
          {single ? (
            <AreaChart {...common} accessibilityLayer={false}>
              <defs>
                <linearGradient id={`${gid}-fill`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor={color} stopOpacity={0.35} />
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
                isAnimationActive={false}
              />
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
                    isAnimationActive={false}
                  />
                );
              })}
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
    </figure>
  );
}
