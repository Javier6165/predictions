import { cn } from '@/lib/cn';

/**
 * Likely's signature visual: probability as 100 dots — "48 in 100" — instead of a bare
 * percentage. Natural frequencies are easier to read than percentages, and the grid
 * doubles as a split bar (it fills column by column, Yes from the left).
 */

export interface Segment {
  /** Share of 100 (indicative probability in cents). */
  value: number;
  /** Tailwind text-colour class used as the dot fill, e.g. 'text-yes-fill'. */
  tone: string;
  label: string;
}

/** Largest-remainder rounding so dot counts always add up to exactly `total`. */
export function allocate(values: number[], total = 100): number[] {
  const sum = values.reduce((a, b) => a + Math.max(0, b), 0) || 1;
  const raw = values.map((v) => (Math.max(0, v) / sum) * total);
  const out = raw.map(Math.floor);
  let left = total - out.reduce((a, b) => a + b, 0);
  const order = raw.map((r, i) => [r - Math.floor(r), i] as const).sort((a, b) => b[0] - a[0]);
  for (const [, i] of order) {
    if (left <= 0) break;
    out[i]++;
    left--;
  }
  return out;
}

const SIZES = {
  sm: { gap: 4, r: 1.35 },
  md: { gap: 7, r: 2.4 },
  lg: { gap: 10, r: 3.4 },
} as const;

export function DotField({
  segments,
  size = 'md',
  className,
  label,
}: {
  segments: Segment[];
  size?: keyof typeof SIZES;
  className?: string;
  /** Accessible summary; defaults to "48 in 100 Yes, 52 in 100 No". */
  label?: string;
}) {
  const counts = allocate(segments.map((s) => s.value));
  const tones: string[] = [];
  counts.forEach((c, i) => {
    for (let k = 0; k < c; k++) tones.push(segments[i].tone);
  });
  const { gap, r } = SIZES[size];
  const dim = gap * 10;
  const summary = label ?? segments.map((s, i) => `${counts[i]} in 100 ${s.label}`).join(', ');
  return (
    <svg viewBox={`0 0 ${dim} ${dim}`} className={cn('block', className)} role="img" aria-label={summary}>
      {tones.map((tone, i) => {
        // Column-major: fills left to right, so the leading segment reads as a block.
        const col = Math.floor(i / 10);
        const row = i % 10;
        return (
          <circle
            key={i}
            cx={col * gap + gap / 2}
            cy={row * gap + gap / 2}
            r={r}
            fill="currentColor"
            className={cn('dot', tone)}
            style={{ transitionDelay: `${i * 4}ms` }}
          />
        );
      })}
    </svg>
  );
}

/** Binary convenience: Yes vs No dots for a proposition. */
export function YesNoDots({ yes, size, className, yesLabel = 'Yes', noLabel = 'No' }: { yes: number; size?: keyof typeof SIZES; className?: string; yesLabel?: string; noLabel?: string }) {
  return (
    <DotField
      size={size}
      className={className}
      segments={[
        { value: yes, tone: 'text-yes-fill', label: yesLabel },
        { value: 100 - yes, tone: 'text-no-fill/80', label: noLabel },
      ]}
    />
  );
}

/** Compact split bar for rows: Yes from the left, No from the right, a hairline gap between. */
export function OddsBar({ yes, className, tone = 'text-yes-fill' }: { yes: number; className?: string; tone?: string }) {
  const y = Math.max(0, Math.min(100, yes));
  return (
    <div className={cn('flex h-1.5 w-full gap-[3px]', className)} aria-hidden>
      {y > 0 && <span className={cn('bar-seg h-full rounded-full bg-current', tone)} style={{ width: `${y}%` }} />}
      {y < 100 && <span className="bar-seg h-full flex-1 rounded-full bg-no-fill/70" />}
    </div>
  );
}

/** "48 in 100" in the display face. */
export function InHundred({ value, className, unitClassName }: { value: number; className?: string; unitClassName?: string }) {
  return (
    <span className={cn('inline-flex items-baseline gap-1.5 whitespace-nowrap', className)}>
      <span className="font-display tabular leading-none">{Math.round(value)}</span>
      <span className={cn('text-[max(0.2em,11px)] font-semibold uppercase tracking-[0.16em] text-muted', unitClassName)}>in 100</span>
    </span>
  );
}
