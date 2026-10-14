import { Link } from 'react-router';
import { Gavel, Trophy } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { catalog } from '@/data/fixtures';
import { proposition } from '@/domain/copy';
import { useUi } from '@/state/ui';
import { cn } from '@/lib/cn';
import { formatMoney, formatSignedMoney } from '@/lib/format';
import { MarketThumb } from '@/components/art/MarketArt';
import { AnimatedCheck } from '@/components/motion/AnimatedCheck';

/** The “you were right” moment: shown once when a market you hold settles. */
export function SettlementDialog() {
  const r = useUi((s) => s.settlement);
  const close = useUi((s) => s.setSettlement);
  const market = r ? catalog.byId.get(r.marketId) : undefined;
  if (!r || !market) return null;
  const winners = market.outcomes.filter((o) => r.yesOutcomeIds.includes(o.id));
  const result =
    market.type === 'MULTI_OUTCOME' ? `${winners.map((o) => o.label).join(', ') || 'No listed outcome'} won` : r.yesOutcomeIds.length ? 'Resolved YES' : 'Resolved NO';
  const anyWon = r.settled.some((p) => p.won);

  return (
    <Dialog open onOpenChange={(o) => !o && close(null)}>
      <DialogContent className="p-6 sm:p-7">
        <div className="text-center">
          {anyWon ? (
            <AnimatedCheck className="mx-auto h-16 w-16" tone="success" icon={<Trophy className="h-7 w-7" aria-hidden />} />
          ) : (
            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-ink/6 text-ink-2">
              <Gavel className="h-7 w-7" aria-hidden />
            </span>
          )}
          <p className="mt-4 eyebrow text-muted">Market settled · {result}</p>
          <DialogTitle className="mt-1 text-2xl">
            {r.settled.length === 0 ? 'This market has settled' : anyWon ? 'You called it.' : 'Not this time.'}
          </DialogTitle>
          <DialogDescription className="mt-1.5 text-ink-2">{market.question}</DialogDescription>
        </div>
        <div className="mt-5 flex items-center gap-3 rounded-2xl border border-line bg-ink/[0.03] p-3">
          <MarketThumb market={market} className="h-12 w-12" />
          <div className="min-w-0">
            <p className="text-sm font-semibold">{market.title}</p>
            <p className="text-xs text-muted">Each winning contract paid $1.00, each losing one $0 — once.</p>
          </div>
        </div>
        {r.settled.length > 0 && (
          <ul className="mt-4 grid gap-2">
            {r.settled.map((p) => (
              <li
                key={p.positionId}
                className={cn('rounded-2xl border p-3.5', p.won ? 'border-yes/30 bg-yes-soft' : 'border-line bg-ink/[0.02]')}
              >
                <p className="text-sm font-medium">{proposition(market, p.outcomeId, p.side)}</p>
                <dl className="mt-2 grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <dt className="text-muted">Result</dt>
                    <dd className={cn('font-semibold', p.won ? 'text-yes' : 'text-ink-2')}>{p.won ? 'Correct' : 'Incorrect'}</dd>
                  </div>
                  <div>
                    <dt className="text-muted">Paid out</dt>
                    <dd className="font-semibold tabular">{formatMoney(p.payoutCents)}</dd>
                  </div>
                  <div>
                    <dt className="text-muted">Profit / loss</dt>
                    <dd className={cn('font-semibold tabular', p.realizedPnLCents >= 0 ? 'text-yes' : 'text-no')}>{formatSignedMoney(p.realizedPnLCents)}</dd>
                  </div>
                </dl>
              </li>
            ))}
          </ul>
        )}
        <div className="mt-6 grid gap-2">
          <Button asChild size="lg">
            <Link to="/portfolio?tab=history&filter=settled" onClick={() => close(null)}>
              See it in your history
            </Link>
          </Button>
          <Button size="lg" variant="ghost" onClick={() => close(null)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
