import type { Side } from '@/domain/types';

/** What the user configured in the ticket. Nothing here has executed yet. */
export type TradeDraft =
  | { kind: 'buy'; marketId: string; outcomeId: string; side: Side; budgetCents: number }
  | { kind: 'sell'; positionId: string; quantity: number }
  | { kind: 'limit'; marketId: string; outcomeId: string; side: Side; quantity: number; limitPriceCents: number };

/** Lifted ticket state so Back from Review (or closing a mobile sheet) never loses input. */
export interface TicketState {
  mode: 'buy' | 'sell';
  outcomeId: string;
  side: Side;
  amountText: string;
  advancedOpen: boolean;
  limitPriceText: string;
  limitQtyText: string;
  sellPositionId: string | null;
  sellQtyText: string;
}

export const newIntentId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `i-${Date.now()}-${Math.random().toString(36).slice(2)}`;
