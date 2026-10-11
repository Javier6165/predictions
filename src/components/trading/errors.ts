import type { EngineError } from '@/domain/engine';
import { TRADE_BLOCK_COPY } from '@/domain/quotes';
import { formatMoney, formatPrice } from '@/lib/format';

/** Specific, human copy for every engine rejection. */
export function errorCopy(e: EngineError): string {
  switch (e.code) {
    case 'UNKNOWN_MARKET':
      return 'This market isn’t part of the demo snapshot.';
    case 'UNKNOWN_OUTCOME':
      return 'Choose an outcome first.';
    case 'MARKET_NOT_TRADABLE':
      return TRADE_BLOCK_COPY[e.block];
    case 'INVALID_QUANTITY':
      return 'Enter a whole number of contracts greater than zero.';
    case 'BUDGET_BELOW_PRICE':
      return `Your amount is below the price of one contract (${formatPrice(e.askCents)}).`;
    case 'INSUFFICIENT_FUNDS':
      return `You need ${formatMoney(e.requiredCents)} but have ${formatMoney(e.availableCents)} of demo cash available.`;
    case 'INSUFFICIENT_LIQUIDITY':
      return `Not enough demo liquidity at this price: at most ${e.maxQuantity.toLocaleString('en-US')} contracts fill immediately. Reduce the amount or use a limit order.`;
    case 'INSUFFICIENT_POSITION':
      return `You only hold ${e.heldQuantity} contracts.`;
    case 'UNKNOWN_POSITION':
      return 'This position no longer exists — it may have been sold or settled.';
    case 'QUOTE_CHANGED':
      return `The demo price moved from ${formatPrice(e.previousCents)} to ${formatPrice(e.currentCents)}. Nothing was executed.`;
    case 'INVALID_LIMIT_PRICE':
      return `A limit buy must be below the current price of ${formatPrice(e.askCents)} — at that price, buy now instead.`;
    case 'UNKNOWN_ORDER':
      return 'This order no longer exists.';
    case 'ORDER_NOT_OPEN':
      return 'This order is no longer open.';
    case 'INVALID_AMOUNT':
      return 'Choose a valid amount.';
    case 'ALREADY_RESOLVED':
      return 'This market is already resolved.';
  }
}
