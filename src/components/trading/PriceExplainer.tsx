import { HelpCircle } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import type { Quote } from '@/domain/types';
import { formatPrice } from '@/lib/format';
import { cn } from '@/lib/cn';

/**
 * One-tap answer to the most common confusion: “it says 48%, why do I pay 49¢?”.
 * All numbers come from the live demo quote.
 */
export function PriceExplainer({ quote, sideLabel, variant = 'link', className }: { quote: Quote; sideLabel: string; variant?: 'link' | 'icon'; className?: string }) {
  const spread = quote.askCents - quote.bidCents;
  return (
    <Popover>
      <PopoverTrigger asChild>
        {variant === 'link' ? (
          <button type="button" className={cn('inline-flex items-center gap-1 text-xs text-muted underline-offset-4 hover:text-ink hover:underline', className)}>
            <HelpCircle className="h-3.5 w-3.5" aria-hidden />
            Why {formatPrice(quote.askCents)} and not {quote.indicativeCents}%?
          </button>
        ) : (
          <button type="button" aria-label="How the price per contract works" className={cn('inline-flex text-muted hover:text-ink', className)}>
            <HelpCircle className="h-3.5 w-3.5" aria-hidden />
          </button>
        )}
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[min(92vw,340px)] p-4 text-sm">
        <p className="font-semibold">Probability vs. price</p>
        <dl className="mt-3 grid gap-2">
          <div className="flex items-baseline justify-between gap-3">
            <dt className="text-muted">Market’s estimate for {sideLabel}</dt>
            <dd className="font-semibold tabular">{quote.indicativeCents}%</dd>
          </div>
          <div className="flex items-baseline justify-between gap-3">
            <dt className="text-muted">You pay to buy now</dt>
            <dd className="font-semibold tabular">{formatPrice(quote.askCents)}</dd>
          </div>
          <div className="flex items-baseline justify-between gap-3">
            <dt className="text-muted">You’d get to sell now</dt>
            <dd className="font-semibold tabular">{formatPrice(quote.bidCents)}</dd>
          </div>
        </dl>
        <p className="mt-3 text-xs leading-relaxed text-ink-2">
          The {spread}¢ gap between buying and selling is the <strong>spread</strong>. Your position’s value is shown at the {quote.indicativeCents}%
          estimate; actually selling returns the sell price. A winning contract always pays $1.00. Fees are $0.
        </p>
      </PopoverContent>
    </Popover>
  );
}
