import { useId, useMemo } from 'react';
import { ChevronDown, CircleAlert, Info, Lock, Sparkles } from 'lucide-react';
import { catalog } from '@/data/fixtures';
import { buyPreview, quoteBuyByBudget, sellPreview, validateBuy, validateLimit, validateSell } from '@/domain/engine';
import { bare, proposition } from '@/domain/copy';
import { TRADE_BLOCK_COPY, quoteFor, tradeBlock } from '@/domain/quotes';
import { availableCents, positionView } from '@/domain/selectors';
import type { Market, Side } from '@/domain/types';
import { useStore } from '@/state/store';
import { useUi } from '@/state/ui';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/cn';
import { formatContracts, formatMoney, formatPrice, formatReturn, formatSignedMoney, parseDollarsToCents } from '@/lib/format';
import { errorCopy } from './errors';
import { ActivePill } from '@/components/motion/ActivePill';
import { AnimatedNumber } from '@/components/motion/AnimatedNumber';
import { PriceExplainer } from './PriceExplainer';
import type { TicketState, TradeDraft } from './types';

const PRESETS = [1000, 2500, 5000, 10000];

export function DemoLabel({ className }: { className?: string }) {
  return (
    <p className={cn('flex items-center justify-center gap-1.5 text-[11px] text-subtle', className)}>
      <Sparkles className="h-3 w-3" aria-hidden /> No fees · You’ll review before anything is bought
    </p>
  );
}

function SideOption({
  market,
  outcomeId,
  side,
  selected,
  onSelect,
  name,
  describedBy,
}: {
  market: Market;
  outcomeId: string;
  side: Side;
  selected: boolean;
  onSelect: () => void;
  name: string;
  /** Id of the sentence that spells out the selected proposition. */
  describedBy?: string;
}) {
  const outcome = market.outcomes.find((o) => o.id === outcomeId)!;
  const q = quoteFor(outcome, side);
  const yes = side === 'YES';
  return (
    <label
      className={cn(
        'relative flex cursor-pointer items-center justify-between gap-2 rounded-2xl border-2 px-4 py-3 transition has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-accent has-[:focus-visible]:ring-offset-2 has-[:focus-visible]:ring-offset-surface',
        selected ? (yes ? 'border-yes-fill bg-yes-soft' : 'border-no-fill bg-no-soft') : 'border-transparent bg-ink/[0.04] hover:bg-ink/[0.07]',
      )}
    >
      <input type="radio" name={name} className="sr-only" checked={selected} onChange={onSelect} aria-describedby={describedBy} />
      <span className={cn('text-[22px] font-semibold leading-none tracking-[-0.02em]', selected ? (yes ? 'text-yes' : 'text-no') : 'text-ink')}>
        <span className="sr-only">Buy {yes ? 'Yes' : 'No'}</span>
        <span aria-hidden>{yes ? 'Yes' : 'No'}</span>
      </span>
      <span className="text-right">
        <span className="block text-sm font-semibold tabular text-ink">{q ? formatPrice(q.askCents) : '—'}</span>
        <span className="text-[10px] text-muted">per contract</span>
      </span>
    </label>
  );
}

/** Small-caps connective that turns the ticket into one readable sentence. */
function Lead({ children, htmlFor, id }: { children: React.ReactNode; htmlFor?: string; id?: string }) {
  const cls = 'mb-2 block eyebrow text-muted';
  return htmlFor ? (
    <label htmlFor={htmlFor} id={id} className={cls}>
      {children}
    </label>
  ) : (
    <p id={id} className={cls}>
      {children}
    </p>
  );
}

/** Stake vs. profit as one bar: what you put in, and what comes back on top. */
function PayoutBar({ stakeCents, payoutCents, side }: { stakeCents: number; payoutCents: number; side: Side }) {
  const stakePct = payoutCents > 0 ? Math.max(4, Math.min(100, (stakeCents / payoutCents) * 100)) : 100;
  return (
    <div className="mt-3" aria-hidden>
      <div className="flex h-2.5 w-full gap-[3px]">
        <span className="bar-seg h-full rounded-full bg-rest" style={{ width: `${stakePct}%` }} />
        <span className={cn('bar-seg h-full flex-1 rounded-full', side === 'YES' ? 'bg-yes-fill' : 'bg-no-fill')} />
      </div>
      <div className="mt-1.5 flex justify-between text-[11px] text-muted">
        <span>Your money back</span>
        <span>Profit</span>
      </div>
    </div>
  );
}

function BuyForm({ market, ticket, update, onReview }: PanelProps) {
  const uid = useId();
  const user = useStore((s) => s.user);
  const setDialog = useUi((s) => s.setDialog);
  const outcome = market.outcomes.find((o) => o.id === ticket.outcomeId) ?? market.outcomes[0];
  const quote = quoteFor(outcome, ticket.side);
  const budget = parseDollarsToCents(ticket.amountText);
  const available = availableCents(user);

  const preview = quote && budget ? quoteBuyByBudget(budget, quote.askCents) : null;
  const check = preview && preview.quantity > 0 ? validateBuy(user, catalog, market.id, outcome.id, ticket.side, preview.quantity) : null;
  let error: string | null = null;
  let fundsError = false;
  if (ticket.amountText && budget === null) error = 'Enter an amount in dollars, e.g. 50 or 12.50.';
  else if (quote && budget !== null && budget > 0 && preview && preview.quantity === 0)
    error = `Your amount is below the price of one contract (${formatPrice(quote.askCents)}).`;
  else if (check && !check.ok) {
    error = errorCopy(check.error);
    fundsError = check.error.code === 'INSUFFICIENT_FUNDS';
  }
  const canReview = !!(preview && preview.quantity > 0 && check?.ok);
  const yes = ticket.side === 'YES';

  return (
    <div className="grid gap-5">
      {market.type === 'MULTI_OUTCOME' && (
        <div>
          <Lead htmlFor={`${uid}-outcome`}>
            <span className="sr-only">Outcome — </span>On this outcome
          </Lead>
          <div className="relative">
            <select
              id={`${uid}-outcome`}
              aria-label="Outcome"
              value={ticket.outcomeId}
              onChange={(e) => update({ outcomeId: e.target.value })}
              className="h-12 w-full appearance-none rounded-2xl border border-line-strong bg-surface px-4 pr-10 text-[15px] font-medium text-ink outline-none focus:border-ink"
            >
              {market.outcomes.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.label} · {o.probabilityCents} in 100
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3.5 top-4 h-4 w-4 text-muted" aria-hidden />
          </div>
        </div>
      )}

      <fieldset>
        <legend className="mb-2 block eyebrow text-muted">I believe</legend>
        <div className="grid grid-cols-2 gap-2">
          {(['YES', 'NO'] as const).map((s) => (
            <SideOption
              key={s}
              market={market}
              outcomeId={outcome.id}
              side={s}
              selected={ticket.side === s}
              onSelect={() => update({ side: s })}
              name={`${uid}-side`}
              describedBy={ticket.side === s ? `${uid}-sentence` : undefined}
            />
          ))}
        </div>
        <p id={`${uid}-sentence`} className="mt-3 text-[19px] font-semibold leading-snug tracking-[-0.015em] text-ink">
          {proposition(market, outcome.id, ticket.side)}
        </p>
        {quote && <PriceExplainer quote={quote} sideLabel={yes ? 'Yes' : 'No'} className="mt-2" />}
      </fieldset>

      <div>
        <Lead htmlFor={`${uid}-amount`}>
          <span className="sr-only">Amount to invest — </span>And I’m putting in
        </Lead>
        <div className="flex items-baseline border-b border-line-strong pb-1 transition-colors focus-within:border-cta">
          <span className="font-display text-[40px] leading-none text-subtle" aria-hidden>
            $
          </span>
          <input
            id={`${uid}-amount`}
            aria-label="Amount to invest"
            inputMode="decimal"
            autoComplete="off"
            value={ticket.amountText}
            onChange={(e) => update({ amountText: e.target.value })}
            placeholder="0"
            aria-describedby={`${uid}-estimate`}
            aria-invalid={!!error}
            className="font-display h-14 w-full bg-transparent px-1 text-[48px] leading-none tracking-[-0.03em] text-ink outline-none tabular placeholder:text-ink/20"
          />
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => update({ amountText: String(p / 100) })}
              aria-pressed={budget === p}
              className={cn(
                'rounded-full border px-3.5 py-1.5 text-sm font-medium transition',
                budget === p ? 'border-ink bg-ink text-bg' : 'border-line-strong text-ink-2 hover:border-ink/40 hover:text-ink',
              )}
            >
              ${p / 100}
            </button>
          ))}
        </div>
        <p className="mt-2 text-xs text-muted">Available cash: {formatMoney(available)}</p>
      </div>

      <div id={`${uid}-estimate`} aria-live="polite">
        {error ? (
          <p className="flex gap-2 rounded-2xl border border-no/30 bg-no-soft px-4 py-3 text-sm text-no" role="alert">
            <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            <span>
              {error}{' '}
              {fundsError && (
                <button type="button" onClick={() => setDialog('funds')} className="font-semibold underline underline-offset-2">
                  Add funds
                </button>
              )}
            </span>
          </p>
        ) : preview && preview.quantity > 0 && quote ? (
          <div className="rounded-2xl bg-ink/[0.04] p-5">
            <p className="eyebrow text-muted">If I’m right, I get</p>
            <p className="font-display mt-1 text-[44px] leading-none tracking-[-0.03em] text-ink tabular">
              <AnimatedNumber value={preview.payoutIfRightCents} format={formatMoney} duration={0.35} />
            </p>
            <p className="mt-1 text-sm text-ink-2">
              <span className={cn('font-semibold', yes ? 'text-yes' : 'text-no')}>
                <AnimatedNumber value={preview.profitIfRightCents} format={formatSignedMoney} duration={0.35} /> profit
              </span>{' '}
              · if not, I lose <AnimatedNumber value={preview.maxLossCents} format={formatMoney} duration={0.35} />
            </p>
            <PayoutBar stakeCents={preview.costCents} payoutCents={preview.payoutIfRightCents} side={ticket.side} />
            <p className="mt-3 flex gap-1.5 border-t border-line pt-3 text-xs text-muted">
              <Info className="mt-px h-3.5 w-3.5 shrink-0" aria-hidden />
              <span>
                Buys{' '}
                <strong className="font-semibold text-ink-2">
                  <AnimatedNumber value={preview.quantity} format={formatContracts} duration={0.35} /> at {formatPrice(quote.askCents)}
                </strong>{' '}
                for <AnimatedNumber value={preview.costCents} format={formatMoney} duration={0.35} />.
                {preview.unusedCents > 0 && <> {formatMoney(preview.unusedCents)} stays in your cash.</>}
              </span>
            </p>
          </div>
        ) : (
          <p className="text-xs text-muted">Each contract pays $1.00 if your prediction is right and $0 if it isn’t.</p>
        )}
      </div>

      <Button
        size="xl"
        className="w-full"
        disabled={!canReview}
        onClick={() => budget && onReview({ kind: 'buy', marketId: market.id, outcomeId: outcome.id, side: ticket.side, budgetCents: budget })}
      >
        Review prediction
      </Button>

      <LimitSection market={market} ticket={ticket} update={update} onReview={onReview} />
    </div>
  );
}

function LimitSection({ market, ticket, update, onReview }: PanelProps) {
  const uid = useId();
  const user = useStore((s) => s.user);
  const outcome = market.outcomes.find((o) => o.id === ticket.outcomeId) ?? market.outcomes[0];
  const quote = quoteFor(outcome, ticket.side);
  const price = /^\d{1,2}$/.test(ticket.limitPriceText) ? Number(ticket.limitPriceText) : null;
  const qty = /^\d{1,6}$/.test(ticket.limitQtyText) ? Number(ticket.limitQtyText) : null;
  const check =
    price !== null && qty !== null
      ? validateLimit(user, catalog, { marketId: market.id, outcomeId: outcome.id, side: ticket.side, quantity: qty, limitPriceCents: price })
      : null;
  const error = check && !check.ok ? errorCopy(check.error) : null;

  return (
    <div className="rounded-2xl border border-line">
      <button
        type="button"
        onClick={() => update({ advancedOpen: !ticket.advancedOpen })}
        aria-expanded={ticket.advancedOpen}
        aria-controls={`${uid}-limit`}
        className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium text-ink-2 hover:text-ink"
      >
        <span>
          Advanced: limit order <span className="font-normal text-subtle">— buy only at your price</span>
        </span>
        <ChevronDown className={cn('h-4 w-4 transition', ticket.advancedOpen && 'rotate-180')} aria-hidden />
      </button>
      {ticket.advancedOpen && (
        <div id={`${uid}-limit`} className="grid gap-3 border-t border-line px-4 pb-4 pt-3">
          <p className="text-xs leading-relaxed text-muted">
            Places a resting BUY for <span className="text-ink-2">“{bare(proposition(market, outcome.id, ticket.side))}”</span>. The cash is held
            until you cancel. In this demo, limit orders never fill on their own.
          </p>
          <div className="grid grid-cols-2 gap-2">
            <label className="text-xs text-muted">
              Limit price (¢)
              <input
                inputMode="numeric"
                value={ticket.limitPriceText}
                onChange={(e) => update({ limitPriceText: e.target.value.replace(/\D/g, '').slice(0, 2) })}
                placeholder={quote ? String(Math.max(1, quote.askCents - 5)) : ''}
                className="mt-1 h-10 w-full rounded-xl border border-line-strong bg-ink/[0.03] px-3 text-sm text-ink outline-none tabular focus:border-accent"
              />
            </label>
            <label className="text-xs text-muted">
              Contracts
              <input
                inputMode="numeric"
                value={ticket.limitQtyText}
                onChange={(e) => update({ limitQtyText: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                placeholder="20"
                className="mt-1 h-10 w-full rounded-xl border border-line-strong bg-ink/[0.03] px-3 text-sm text-ink outline-none tabular focus:border-accent"
              />
            </label>
          </div>
          {quote && <p className="text-xs text-muted">Current price: {formatPrice(quote.askCents)} · must be lower to rest.</p>}
          {error && (
            <p className="text-xs text-no" role="alert">
              {error}
            </p>
          )}
          {check?.ok && (
            <p className="text-xs text-ink-2">
              Holds <strong className="tabular">{formatMoney(check.reserveCents)}</strong> of your available cash while open.
            </p>
          )}
          <Button
            variant="secondary"
            disabled={!check?.ok}
            onClick={() =>
              price !== null &&
              qty !== null &&
              onReview({ kind: 'limit', marketId: market.id, outcomeId: outcome.id, side: ticket.side, quantity: qty, limitPriceCents: price })
            }
          >
            Review limit order
          </Button>
        </div>
      )}
    </div>
  );
}

export function SellForm({
  positionId,
  qtyText,
  setQtyText,
  onReview,
  positions,
  onPosition,
}: {
  positionId: string;
  qtyText: string;
  setQtyText: (v: string) => void;
  onReview: (d: TradeDraft) => void;
  positions?: { id: string; label: string }[];
  onPosition?: (id: string) => void;
}) {
  const uid = useId();
  const user = useStore((s) => s.user);
  const position = user.positions.find((p) => p.id === positionId);
  const view = position ? positionView(user, catalog, position) : null;
  if (!position || !view) return <p className="text-sm text-muted">This position is no longer open.</p>;
  const qty = /^\d{1,7}$/.test(qtyText) ? Number(qtyText) : null;
  const check = qty !== null ? validateSell(user, catalog, position.id, qty) : null;
  const preview = check?.ok && qty ? sellPreview(position, qty, check.quote.bidCents) : null;
  const error = check && !check.ok ? errorCopy(check.error) : null;
  const block = tradeBlock(view.market);
  const pick = (fraction: number) => setQtyText(String(Math.max(1, Math.floor(position.quantity * fraction))));

  return (
    <div className="grid gap-4">
      {positions && positions.length > 1 && onPosition && (
        <label className="text-sm font-medium text-ink-2">
          Position
          <select
            value={positionId}
            onChange={(e) => onPosition(e.target.value)}
            className="mt-1.5 h-11 w-full rounded-xl border border-line-strong bg-surface px-3.5 text-sm text-ink outline-none focus:border-accent"
          >
            {positions.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
        </label>
      )}
      <div className="rounded-2xl border border-line bg-ink/[0.03] p-3.5">
        <p className="eyebrow text-muted">You’re backing</p>
        <p className="mt-0.5 font-medium leading-snug">{proposition(view.market, position.outcomeId, position.side)}</p>
        <dl className="mt-3 grid grid-cols-3 gap-2 text-xs">
          <div>
            <dt className="text-muted">Contracts</dt>
            <dd className="font-semibold text-ink tabular">{position.quantity}</dd>
          </div>
          <div>
            <dt className="text-muted">Avg. paid</dt>
            <dd className="font-semibold text-ink tabular">{formatPrice(view.averagePriceCents)}</dd>
          </div>
          <div>
            <dt className="text-muted">Sell price now</dt>
            <dd className="font-semibold text-ink tabular">{view.bidCents !== null ? formatPrice(view.bidCents) : '—'}</dd>
          </div>
        </dl>
      </div>
      {block ? (
        <p className="flex gap-2 rounded-xl border border-warn/30 bg-warn-soft px-3.5 py-3 text-sm text-warn">
          <Lock className="mt-0.5 h-4 w-4 shrink-0" aria-hidden /> {TRADE_BLOCK_COPY[block]}
        </p>
      ) : (
        <>
          <div>
            <label htmlFor={`${uid}-sell-qty`} className="mb-1.5 block text-sm font-medium text-ink-2">
              Contracts to sell
            </label>
            <input
              id={`${uid}-sell-qty`}
              inputMode="numeric"
              value={qtyText}
              onChange={(e) => setQtyText(e.target.value.replace(/\D/g, '').slice(0, 7))}
              placeholder={String(position.quantity)}
              className="h-12 w-full rounded-xl border border-line-strong bg-ink/[0.03] px-3.5 text-xl font-semibold text-ink outline-none tabular focus:border-accent"
            />
            <div className="mt-2 grid grid-cols-3 gap-2">
              {[
                ['25%', 0.25],
                ['50%', 0.5],
                ['All', 1],
              ].map(([label, f]) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => pick(f as number)}
                  className="rounded-lg border border-line-strong py-1.5 text-sm font-medium text-ink-2 hover:bg-ink/5"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div aria-live="polite">
            {error ? (
              <p className="flex gap-2 rounded-xl border border-no/30 bg-no-soft px-3.5 py-3 text-sm text-no" role="alert">
                <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden /> {error}
              </p>
            ) : preview ? (
              <dl className="grid gap-1.5 rounded-xl border border-line bg-ink/[0.03] px-3.5 py-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted">Estimated amount you’ll receive</dt>
                  <dd className="font-semibold tabular">{formatMoney(preview.proceedsCents)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted">You paid for these</dt>
                  <dd className="tabular">{formatMoney(preview.allocatedBasisCents)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted">Realized profit / loss</dt>
                  <dd className={cn('font-semibold tabular', preview.realizedPnLCents >= 0 ? 'text-yes' : 'text-no')}>
                    {formatSignedMoney(preview.realizedPnLCents)} ({formatReturn(preview.realizedPnLCents, preview.allocatedBasisCents)})
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted">Contracts left</dt>
                  <dd className="tabular">{preview.remainingQuantity}</dd>
                </div>
              </dl>
            ) : (
              <p className="text-xs text-muted">Selling now uses the current sell price (bid), which can differ from the displayed probability.</p>
            )}
          </div>
          <Button size="lg" className="w-full" disabled={!preview} onClick={() => qty && onReview({ kind: 'sell', positionId: position.id, quantity: qty })}>
            Review sale
          </Button>
        </>
      )}
    </div>
  );
}

interface PanelProps {
  market: Market;
  ticket: TicketState;
  update: (patch: Partial<TicketState>) => void;
  onReview: (d: TradeDraft) => void;
}

export function TradePanel({ market, ticket, update, onReview }: PanelProps) {
  const pillId = useId();
  const user = useStore((s) => s.user);
  const positions = useMemo(() => user.positions.filter((p) => p.marketId === market.id), [user.positions, market.id]);
  const block = tradeBlock(market);
  const sellId = ticket.sellPositionId && positions.some((p) => p.id === ticket.sellPositionId) ? ticket.sellPositionId : positions[0]?.id;
  const mode = ticket.mode === 'sell' && positions.length > 0 ? 'sell' : 'buy';

  const resolvedLabel =
    market.status === 'RESOLVED'
      ? market.type === 'MULTI_OUTCOME'
        ? `${market.outcomes.find((o) => o.id === market.winningOutcomeId)?.label ?? 'Unknown'} won`
        : market.winningOutcomeId
          ? 'Resolved YES'
          : 'Resolved NO'
      : null;

  return (
    <div className="grid gap-4">
      <div className="grid grid-cols-2 rounded-full bg-ink/[0.05] p-1" role="tablist" aria-label="Trade type">
        {(['buy', 'sell'] as const).map((m) => {
          const disabled = m === 'sell' && positions.length === 0;
          return (
            <button
              key={m}
              type="button"
              role="tab"
              aria-selected={mode === m}
              aria-disabled={disabled}
              onClick={() => !disabled && update({ mode: m })}
              title={disabled ? 'You don’t hold a position in this market yet' : undefined}
              className={cn(
                'relative rounded-full py-2 text-sm font-semibold transition-colors',
                mode === m ? 'text-on-cta' : 'text-ink-2 hover:text-ink',
                disabled && 'cursor-not-allowed opacity-45 hover:text-ink-2',
              )}
            >
              {mode === m && <ActivePill layoutId={`${pillId}-mode`} className="bg-cta" />}
              <span className="relative">{m === 'buy' ? 'Buy' : `Sell${positions.length ? ` (${positions.length})` : ''}`}</span>
            </button>
          );
        })}
      </div>

      {mode === 'sell' && sellId ? (
        <SellForm
          positionId={sellId}
          qtyText={ticket.sellQtyText}
          setQtyText={(v) => update({ sellQtyText: v })}
          onReview={onReview}
          positions={positions.map((p) => ({ id: p.id, label: `${p.side === 'YES' ? 'Yes' : 'No'} · ${market.outcomes.find((o) => o.id === p.outcomeId)?.label ?? ''} · ${p.quantity} contracts` }))}
          onPosition={(id) => update({ sellPositionId: id, sellQtyText: '' })}
        />
      ) : block ? (
        <div className="rounded-2xl border border-warn/30 bg-warn-soft p-4" role="status">
          <p className="flex items-center gap-2 font-semibold text-warn">
            <Lock className="h-4 w-4" aria-hidden /> {resolvedLabel ?? 'Trading unavailable'}
          </p>
          <p className="mt-1 text-sm text-ink-2">{TRADE_BLOCK_COPY[block]}</p>
        </div>
      ) : (
        <BuyForm market={market} ticket={ticket} update={update} onReview={onReview} />
      )}
      <DemoLabel />
    </div>
  );
}

/** Shared preview for a reviewed buy (used by the Review step). */
export function reviewBuy(budgetCents: number, askCents: number) {
  const p = quoteBuyByBudget(budgetCents, askCents);
  return { ...p, ...buyPreview(p.quantity, askCents, budgetCents) };
}
