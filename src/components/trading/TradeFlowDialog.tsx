import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import { ChevronDown, CircleAlert, RefreshCw, Timer } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { catalog } from '@/data/fixtures';
import { sellPreview, type EngineError, type TradeReceipt } from '@/domain/engine';
import { bare, proposition } from '@/domain/copy';
import { findOutcome, marketFor, quoteFor } from '@/domain/quotes';
import type { LimitOrder, Market } from '@/domain/types';
import { useStore } from '@/state/store';
import { cn } from '@/lib/cn';
import { formatContracts, formatMoney, formatPrice, formatReturn, formatSignedMoney } from '@/lib/format';
import { MarketThumb } from '@/components/art/MarketArt';
import { errorCopy } from './errors';
import { AnimatedCheck } from '@/components/motion/AnimatedCheck';
import { PriceExplainer } from './PriceExplainer';
import { reviewBuy, SellForm, DemoLabel } from './TradePanel';
import { newIntentId, type TradeDraft } from './types';

type Step = 'configure' | 'review' | 'receipt';

interface Snapshot {
  intentId: string;
  priceCents: number;
  quantity: number;
}

function Row({ label, value, strong, className }: { label: React.ReactNode; value: React.ReactNode; strong?: boolean; className?: string }) {
  return (
    <div className={cn('flex items-baseline justify-between gap-4 py-1.5 text-sm', className)}>
      <dt className="text-muted">{label}</dt>
      <dd className={cn('text-right tabular', strong ? 'font-semibold text-ink' : 'text-ink-2')}>{value}</dd>
    </div>
  );
}

function PropositionCard({ market, outcomeId, side, lead }: { market: Market; outcomeId: string; side: 'YES' | 'NO'; lead: string }) {
  return (
    <div className="flex gap-3 rounded-2xl border border-line bg-ink/[0.03] p-3.5">
      <MarketThumb market={market} className="h-14 w-14" />
      <div className="min-w-0">
        <p className="text-xs text-muted">{lead}</p>
        <p className="font-display mt-1 text-[22px] leading-[1.12] text-ink">{proposition(market, outcomeId, side)}</p>
        <p className={cn('mt-1 text-[11px] font-semibold uppercase tracking-wide', side === 'YES' ? 'text-yes' : 'text-no')}>
          {side === 'YES' ? 'Yes' : 'No'} contracts{market.type === 'MULTI_OUTCOME' ? ` · ${findOutcome(market, outcomeId)?.label}` : ''}
        </p>
      </div>
    </div>
  );
}

function RuleDisclosure({ market, side }: { market: Market; side: 'YES' | 'NO' }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl border border-line">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="flex w-full items-center justify-between px-3.5 py-2.5 text-sm text-ink-2 hover:text-ink"
      >
        How this resolves
        <ChevronDown className={cn('h-4 w-4 transition', open && 'rotate-180')} aria-hidden />
      </button>
      {open && (
        <div className="space-y-2 border-t border-line px-3.5 py-3 text-xs leading-relaxed text-muted">
          <p>
            <span className="font-semibold text-yes">YES</span> — {market.resolutionRule.yesCondition}
          </p>
          <p>
            <span className="font-semibold text-no">NO</span> — {market.resolutionRule.noCondition}
          </p>
          <p>
            Each {side === 'YES' ? 'Yes' : 'No'} contract pays $1.00 if your prediction is right and $0 if not. You can sell before resolution at the
            current sell price. Source: {market.resolutionRule.sourceLabel}.
          </p>
        </div>
      )}
    </div>
  );
}

export function TradeFlowDialog({
  draft: initialDraft,
  onClose,
  startAtConfigure = false,
}: {
  draft: TradeDraft | null;
  onClose: () => void;
  /** Portfolio “Sell position”: let the user pick the quantity inside the dialog. */
  startAtConfigure?: boolean;
}) {
  const user = useStore((s) => s.user);
  const buy = useStore((s) => s.buy);
  const sell = useStore((s) => s.sell);
  const placeLimit = useStore((s) => s.placeLimit);

  const [draft, setDraft] = useState<TradeDraft | null>(initialDraft);
  const [step, setStep] = useState<Step>('review');
  const [snap, setSnap] = useState<Snapshot | null>(null);
  const [error, setError] = useState<EngineError | null>(null);
  const [requoted, setRequoted] = useState<{ from: number; to: number } | null>(null);
  const [busy, setBusy] = useState(false);
  // A fast double-click on Confirm must not dismiss the receipt or hit one of its buttons.
  const [receiptSettled, setReceiptSettled] = useState(true);
  const [receipt, setReceipt] = useState<TradeReceipt | LimitOrder | null>(null);
  const [sellQtyText, setSellQtyText] = useState('');
  const confirmRef = useRef<HTMLButtonElement>(null);

  const currentMarket = (marketId: string) => marketFor(useStore.getState().user, catalog.byId.get(marketId)!);

  /** Capture what the user is reviewing: price, quantity and a fresh intent id. */
  const capture = (d: TradeDraft): Snapshot | null => {
    const u = useStore.getState().user;
    if (d.kind === 'buy') {
      const m = currentMarket(d.marketId);
      const q = quoteFor(findOutcome(m, d.outcomeId)!, d.side);
      if (!q) return null;
      return { intentId: newIntentId(), priceCents: q.askCents, quantity: reviewBuy(d.budgetCents, q.askCents).quantity };
    }
    if (d.kind === 'sell') {
      const pos = u.positions.find((p) => p.id === d.positionId);
      if (!pos) return null;
      const q = quoteFor(findOutcome(currentMarket(pos.marketId), pos.outcomeId)!, pos.side);
      if (!q) return null;
      return { intentId: newIntentId(), priceCents: q.bidCents, quantity: d.quantity };
    }
    return { intentId: newIntentId(), priceCents: d.limitPriceCents, quantity: d.quantity };
  };

  useEffect(() => {
    setDraft(initialDraft);
    setError(null);
    setRequoted(null);
    setReceipt(null);
    setBusy(false);
    setSellQtyText('');
    if (initialDraft && startAtConfigure && initialDraft.kind === 'sell') {
      setStep('configure');
      setSnap(null);
    } else {
      setStep('review');
      setSnap(initialDraft ? capture(initialDraft) : null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialDraft, startAtConfigure]);

  if (!draft) return null;

  const toReview = (d: TradeDraft) => {
    setDraft(d);
    setSnap(capture(d));
    setStep('review');
    setError(null);
  };

  const confirm = () => {
    if (!snap || busy) return;
    setBusy(true);
    setError(null);
    // Synchronous engine call; the busy flag plus the intent id make double-clicks harmless.
    const r =
      draft.kind === 'buy'
        ? buy({ intentId: snap.intentId, marketId: draft.marketId, outcomeId: draft.outcomeId, side: draft.side, quantity: snap.quantity, expectedAskCents: snap.priceCents })
        : draft.kind === 'sell'
          ? sell({ intentId: snap.intentId, positionId: draft.positionId, quantity: snap.quantity, expectedBidCents: snap.priceCents })
          : placeLimit({ intentId: snap.intentId, marketId: draft.marketId, outcomeId: draft.outcomeId, side: draft.side, quantity: snap.quantity, limitPriceCents: snap.priceCents });
    setBusy(false);
    if (r.ok) {
      setReceipt(r.receipt);
      setStep('receipt');
      setReceiptSettled(false);
      window.setTimeout(() => setReceiptSettled(true), 500);
      return;
    }
    if (r.error.code === 'QUOTE_CHANGED') {
      // New review at the new price; the old intent can never execute.
      const fresh = capture(draft);
      setRequoted({ from: r.error.previousCents, to: r.error.currentCents });
      setSnap(fresh);
      requestAnimationFrame(() => confirmRef.current?.focus());
      return;
    }
    setError(r.error);
  };

  const close = () => onClose();

  let body: React.ReactNode = null;

  if (step === 'configure' && draft.kind === 'sell') {
    body = (
      <>
        <DialogTitle>Sell position</DialogTitle>
        <DialogDescription className="mt-1">Choose how many contracts to sell. You’ll review before anything happens.</DialogDescription>
        <div className="mt-5">
          <SellForm positionId={draft.positionId} qtyText={sellQtyText} setQtyText={setSellQtyText} onReview={toReview} />
        </div>
      </>
    );
  } else if (step === 'review' && snap) {
    const reqBanner = requoted && (
      <p className="flex gap-2 rounded-xl border border-warn/40 bg-warn-soft px-3.5 py-3 text-sm text-warn" role="alert">
        <RefreshCw className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
        <span>
          The price changed from {formatPrice(requoted.from)} to {formatPrice(requoted.to)} before you confirmed. Nothing was executed — please review the
          updated details.
        </span>
      </p>
    );
    const errBanner = error && (
      <p className="flex gap-2 rounded-xl border border-no/30 bg-no-soft px-3.5 py-3 text-sm text-no" role="alert">
        <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden /> {errorCopy(error)}
      </p>
    );

    if (draft.kind === 'buy') {
      const m = currentMarket(draft.marketId);
      const p = reviewBuy(draft.budgetCents, snap.priceCents);
      const armed = user.armedQuoteChanges.some((a) => a.marketId === m.id);
      body = (
        <>
          <DialogTitle>Review your prediction</DialogTitle>
          <DialogDescription className="sr-only">Check the details before confirming. Nothing has been bought yet.</DialogDescription>
          <div className="mt-4 grid gap-3">
            {reqBanner}
            {errBanner}
            <PropositionCard market={m} outcomeId={draft.outcomeId} side={draft.side} lead="You’re predicting that" />
            {p.quantity === 0 ? (
              <p className="text-sm text-no">At the new price your amount no longer buys a whole contract. Go back and adjust the amount.</p>
            ) : (
              <>
                <dl className="px-1">
                  <Row label="Investment" value={formatMoney(p.costCents)} strong />
                  <Row
                    label={
                      <span className="inline-flex items-center gap-1.5">
                        Price per contract
                        {(() => {
                          const q = quoteFor(findOutcome(m, draft.outcomeId)!, draft.side);
                          return q ? <PriceExplainer quote={q} sideLabel={draft.side === 'YES' ? 'Yes' : 'No'} variant="icon" /> : null;
                        })()}
                      </span>
                    }
                    value={formatPrice(p.askCents)}
                  />
                  <Row label="Contracts you’ll buy" value={p.quantity.toLocaleString('en-US')} />
                  {p.unusedCents > 0 && <Row label="Not invested (stays in cash)" value={formatMoney(p.unusedCents)} />}
                </dl>
                <div className="rounded-2xl border border-yes/25 bg-yes-soft px-4 py-3">
                  <p className="text-sm font-semibold text-yes">If your prediction is right</p>
                  <dl>
                    <Row label="You’ll receive" value={formatMoney(p.payoutIfRightCents)} strong className="py-1" />
                    <Row label="Profit" value={<span className="font-semibold text-yes">{formatSignedMoney(p.profitIfRightCents)} ({formatReturn(p.profitIfRightCents, p.costCents)})</span>} className="py-1" />
                  </dl>
                </div>
                <div className="rounded-2xl border border-no/25 bg-no-soft px-4 py-3">
                  <p className="text-sm font-semibold text-no">If it doesn’t happen</p>
                  <dl>
                    <Row label="You’ll lose" value={<span className="font-semibold text-no">−{formatMoney(p.maxLossCents)} (−100%)</span>} className="py-1" />
                  </dl>
                </div>
                <dl className="px-1">
                  <Row label="Fees" value="$0.00" />
                  <Row label="Total cost" value={formatMoney(p.costCents)} strong />
                </dl>
              </>
            )}
            <RuleDisclosure market={m} side={draft.side} />
            {armed && (
              <p className="rounded-xl border border-accent/30 bg-accent-soft px-3.5 py-2.5 text-xs text-ink-2">
                Demo scenario armed: the price on this market will move when you press Confirm.
              </p>
            )}
          </div>
          <div className="mt-5 grid gap-2">
            <Button ref={confirmRef} size="lg" className="w-full" onClick={confirm} disabled={busy || p.quantity === 0}>
              {requoted ? `Confirm at ${formatPrice(p.askCents)}` : 'Confirm prediction'}
            </Button>
            <Button size="lg" variant="ghost" className="w-full" onClick={close}>
              Back to edit
            </Button>
          </div>
        </>
      );
    } else if (draft.kind === 'sell') {
      const pos = user.positions.find((x) => x.id === draft.positionId);
      if (!pos) {
        body = <p className="text-sm text-muted">This position is no longer open.</p>;
      } else {
        const m = currentMarket(pos.marketId);
        const p = sellPreview(pos, snap.quantity, snap.priceCents);
        const all = p.remainingQuantity === 0;
        body = (
          <>
            <DialogTitle>Review your sale</DialogTitle>
            <DialogDescription className="sr-only">Check the sale before confirming. Nothing has been sold yet.</DialogDescription>
            <div className="mt-4 grid gap-3">
              {reqBanner}
              {errBanner}
              <PropositionCard market={m} outcomeId={pos.outcomeId} side={pos.side} lead={all ? 'You’re selling your prediction that' : 'You’re selling part of your prediction that'} />
              <dl className="px-1">
                <Row label="Contracts to sell" value={`${p.quantity}${all ? ' (all)' : ` of ${pos.quantity}`}`} strong />
                <Row label="Sell price per contract" value={formatPrice(p.bidCents)} />
                <Row label="Amount you’ll receive" value={formatMoney(p.proceedsCents)} strong />
              </dl>
              <div className={cn('rounded-2xl border px-4 py-3', p.realizedPnLCents >= 0 ? 'border-yes/25 bg-yes-soft' : 'border-no/25 bg-no-soft')}>
                <p className={cn('text-sm font-semibold', p.realizedPnLCents >= 0 ? 'text-yes' : 'text-no')}>Compared with what you paid</p>
                <dl>
                  <Row label="Cost of these contracts" value={formatMoney(p.allocatedBasisCents)} className="py-1" />
                  <Row
                    label="Realized profit / loss"
                    value={<span className={cn('font-semibold', p.realizedPnLCents >= 0 ? 'text-yes' : 'text-no')}>{formatSignedMoney(p.realizedPnLCents)} ({formatReturn(p.realizedPnLCents, p.allocatedBasisCents)})</span>}
                    className="py-1"
                  />
                </dl>
              </div>
              <dl className="px-1">
                <Row label="Fees" value="$0.00" />
                {!all && <Row label="Contracts you’ll keep" value={p.remainingQuantity} />}
              </dl>
              <p className="text-xs text-muted">Selling early is different from being paid out: if you held to resolution and were right, these contracts would pay {formatMoney(p.quantity * 100)}.</p>
            </div>
            <div className="mt-5 grid gap-2">
              <Button ref={confirmRef} size="lg" variant="danger" className="w-full" onClick={confirm} disabled={busy}>
                {requoted ? `Confirm sale at ${formatPrice(p.bidCents)}` : 'Confirm sale'}
              </Button>
              <Button size="lg" variant="ghost" className="w-full" onClick={startAtConfigure ? () => setStep('configure') : close}>
                Back to edit
              </Button>
            </div>
          </>
        );
      }
    } else {
      const m = currentMarket(draft.marketId);
      const q = quoteFor(findOutcome(m, draft.outcomeId)!, draft.side);
      const reserve = draft.quantity * draft.limitPriceCents;
      body = (
        <>
          <DialogTitle>Review limit order</DialogTitle>
          <DialogDescription className="sr-only">Check the order before confirming.</DialogDescription>
          <div className="mt-4 grid gap-3">
            {errBanner}
            <PropositionCard market={m} outcomeId={draft.outcomeId} side={draft.side} lead="You’re placing a limit order to back" />
            <dl className="px-1">
              <Row label="Contracts" value={draft.quantity} strong />
              <Row label="Your limit price" value={formatPrice(draft.limitPriceCents)} />
              <Row label="Current price" value={q ? formatPrice(q.askCents) : '—'} />
              <Row label="Cash held while open" value={formatMoney(reserve)} strong />
              <Row label="If it fills and you’re right" value={formatMoney(draft.quantity * 100)} />
              <Row label="Fees" value="$0.00" />
            </dl>
            <p className="flex gap-2 rounded-xl border border-line bg-ink/[0.03] px-3.5 py-3 text-xs leading-relaxed text-muted">
              <Timer className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
              The order rests at your price and appears under Portfolio → Pending. It holds {formatMoney(reserve)} of available cash until you cancel it. In
              this demo, limit orders don’t fill automatically.
            </p>
          </div>
          <div className="mt-5 grid gap-2">
            <Button ref={confirmRef} size="lg" className="w-full" onClick={confirm} disabled={busy}>
              Place limit order
            </Button>
            <Button size="lg" variant="ghost" className="w-full" onClick={close}>
              Back to edit
            </Button>
          </div>
        </>
      );
    }
  } else if (step === 'receipt' && receipt) {
    if ('type' in receipt) {
      const m = currentMarket(receipt.marketId);
      body = (
        <div className="text-center">
          <AnimatedCheck className="mx-auto h-16 w-16" tone="accent" />
          <DialogTitle className="mt-3">Limit order placed</DialogTitle>
          <DialogDescription className="mt-1.5">
            Waiting to buy {formatContracts(receipt.requestedQuantity)} at {formatPrice(receipt.limitPriceCents)} backing “
            {bare(proposition(m, receipt.outcomeId, receipt.side))}”.
          </DialogDescription>
          <dl className="mt-5 rounded-2xl border border-line px-4 py-2 text-left">
            <Row label="Status" value="Open" strong />
            <Row label="Cash held" value={formatMoney(receipt.reservedCashCents)} />
          </dl>
          <div className="mt-5 grid gap-2">
            <Button asChild size="lg" className="w-full">
              <Link to="/portfolio?tab=pending" onClick={close}>
                View pending orders
              </Link>
            </Button>
            <Button size="lg" variant="secondary" className="w-full" onClick={close}>
              Done
            </Button>
          </div>
        </div>
      );
    } else {
      const m = currentMarket(receipt.marketId);
      const isSell = receipt.realizedPnLCents !== undefined;
      body = (
        <div className="text-center">
          <AnimatedCheck className="mx-auto h-16 w-16" />
          <DialogTitle className="mt-3 text-[32px]">{isSell ? 'Sale confirmed' : 'Your prediction is active!'}</DialogTitle>
          <DialogDescription className="mt-1.5 text-[15px] text-ink-2">
            {isSell
              ? `You sold ${formatContracts(receipt.quantity)} backing “${bare(proposition(m, receipt.outcomeId, receipt.side))}”.`
              : `You invested ${formatMoney(receipt.amountCents)} in “${bare(proposition(m, receipt.outcomeId, receipt.side))}”.`}
          </DialogDescription>
          <dl className="mt-5 rounded-2xl border border-line px-4 py-2 text-left">
            {isSell ? (
              <>
                <Row label="Amount received" value={formatMoney(receipt.amountCents)} strong />
                <Row
                  label="Realized profit / loss"
                  value={<span className={cn('font-semibold', receipt.realizedPnLCents! >= 0 ? 'text-yes' : 'text-no')}>{formatSignedMoney(receipt.realizedPnLCents!)}</span>}
                />
                <Row label="Contracts left" value={receipt.remainingQuantity ?? 0} />
              </>
            ) : (
              <>
                <Row label="Contracts purchased" value={receipt.quantity.toLocaleString('en-US')} strong />
                <Row label="Price per contract" value={formatPrice(receipt.priceCents)} />
                <Row label="Total paid" value={formatMoney(receipt.amountCents)} />
                <Row label="Fees" value="$0.00" />
              </>
            )}
          </dl>
          <div className="mt-5 grid gap-2">
            {receipt.positionId ? (
              <Button asChild size="lg" className="w-full">
                <Link to={`/portfolio?tab=active&position=${receipt.positionId}`} onClick={close}>
                  View your position
                </Link>
              </Button>
            ) : (
              <Button asChild size="lg" className="w-full">
                <Link to="/portfolio?tab=history" onClick={close}>
                  View your portfolio
                </Link>
              </Button>
            )}
            <Button asChild size="lg" variant="secondary" className="w-full">
              <Link to="/explore" onClick={close}>
                Explore more markets
              </Link>
            </Button>
          </div>
        </div>
      );
    }
  } else {
    body = (
      <>
        <DialogTitle>Trading unavailable</DialogTitle>
        <DialogDescription className="mt-2">This market no longer has an executable price.</DialogDescription>
        <Button className="mt-5 w-full" variant="secondary" onClick={close}>
          Close
        </Button>
      </>
    );
  }

  return (
    <Dialog open={!!initialDraft} onOpenChange={(o) => !o && close()}>
      <DialogContent
        className="p-5 sm:p-7"
        onOpenAutoFocus={(e) => {
          if (startAtConfigure) return;
          // Focus the primary action rather than the close button.
          e.preventDefault();
          requestAnimationFrame(() => confirmRef.current?.focus());
        }}
        onInteractOutside={(e) => {
          if (!receiptSettled) e.preventDefault();
        }}
      >
        <div key={step} className={cn('animate-fade-in', !receiptSettled && 'pointer-events-none')}>
          {body}
        </div>
        {step !== 'receipt' && <DemoLabel className="mt-4" />}
      </DialogContent>
    </Dialog>
  );
}
