import { cn } from '@/lib/cn';

/** Product identity. Rename here; nothing else hardcodes the name. */
export const BRAND = {
  name: 'Likely',
  tagline: 'Say what you think will happen.',
  newsroom: 'Likely Notes',
  resolver: 'Likely resolution desk',
} as const;

/**
 * The mark is the product's signature visual in miniature: a disc of dots, most of them
 * "filled in" — a probability you can see. Uses currentColor so it follows the theme.
 */
const DOTS: [number, number][] = [];
for (let y = 0; y < 5; y++) for (let x = 0; x < 5; x++) {
  const cx = 4 + x * 6;
  const cy = 4 + y * 6;
  if ((cx - 16) ** 2 + (cy - 16) ** 2 <= 13.5 ** 2) DOTS.push([cx, cy]);
}

export function BrandMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn('h-7 w-7', className)} aria-hidden>
      {DOTS.map(([cx, cy], i) => {
        const filled = i < Math.round(DOTS.length * 0.62);
        return filled ? (
          <circle key={i} cx={cx} cy={cy} r={2.4} fill="currentColor" />
        ) : (
          <circle key={i} cx={cx} cy={cy} r={1.9} fill="none" stroke="currentColor" strokeOpacity={0.45} strokeWidth={1} />
        );
      })}
    </svg>
  );
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn('font-display text-[27px] leading-none tracking-[-0.02em] text-ink', className)}>
      {BRAND.name}
      <span className="text-yes">.</span>
    </span>
  );
}
