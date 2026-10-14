import { cn } from '@/lib/cn';

/** Product identity. Rename here; nothing else hardcodes the name. */
export const BRAND = {
  name: 'Likely',
  tagline: 'Say what you think will happen.',
  newsroom: 'Likely Notes',
  resolver: 'Likely resolution desk',
} as const;

/**
 * The mark: nine dots, six of them filled — a probability you can count, at glyph size.
 * Uses currentColor so it follows the theme; the empty dots are the same ink at low opacity.
 */
const GRID: [number, number][] = [];
for (let y = 0; y < 3; y++) for (let x = 0; x < 3; x++) GRID.push([6 + x * 10, 6 + y * 10]);
// Filled column by column, like the odds grid: 6 of 9.
const FILLED = new Set([0, 3, 6, 1, 4, 7]);

export function BrandMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn('h-6 w-6', className)} aria-hidden>
      {GRID.map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r={3.6} fill="currentColor" fillOpacity={FILLED.has(i) ? 1 : 0.22} />
      ))}
    </svg>
  );
}

export function Wordmark({ className }: { className?: string }) {
  return <span className={cn('text-[21px] font-semibold leading-none tracking-[-0.025em] text-ink', className)}>{BRAND.name}</span>;
}
