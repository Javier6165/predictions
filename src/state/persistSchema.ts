import { z } from 'zod';

const int = z.number().int();
const side = z.enum(['YES', 'NO']);
const quote = z.object({ indicativeCents: int, askCents: int, bidCents: int });
const status = z.enum(['OPEN', 'UPCOMING', 'SUSPENDED', 'CLOSED', 'PENDING_RESOLUTION', 'RESOLVED', 'VOIDED']);

/** Shape of the user state stored in sessionStorage. Anything else is discarded. */
export const userStateSchema = z.object({
  schemaVersion: int,
  scenario: z.enum(['showcase', 'fresh']),
  cashTotalCents: int,
  depositsCents: int,
  realizedPnLCents: int,
  positions: z.array(
    z.object({
      id: z.string(),
      marketId: z.string(),
      outcomeId: z.string(),
      side,
      quantity: int.positive(),
      costBasisCents: int.nonnegative(),
      openedSeq: int,
    }),
  ),
  orders: z.array(
    z.object({
      id: z.string(),
      marketId: z.string(),
      outcomeId: z.string(),
      side,
      action: z.literal('BUY'),
      type: z.literal('LIMIT'),
      limitPriceCents: int,
      requestedQuantity: int,
      filledQuantity: int,
      status: z.enum(['OPEN', 'CANCELLED', 'FILLED']),
      reservedCashCents: int.nonnegative(),
      createdAt: z.string(),
      seq: int,
    }),
  ),
  ledger: z.array(
    z.object({
      id: z.string(),
      kind: z.enum(['BUY', 'SELL', 'LIMIT_PLACED', 'LIMIT_CANCELLED', 'DEPOSIT', 'SETTLEMENT']),
      cashDeltaCents: int,
      marketId: z.string().optional(),
      outcomeId: z.string().optional(),
      side: side.optional(),
      quantity: int.optional(),
      priceCents: int.optional(),
      realizedPnLCents: int.optional(),
      orderId: z.string().optional(),
      intentId: z.string().optional(),
      won: z.boolean().optional(),
      createdAt: z.string(),
      seq: int,
    }),
  ),
  savedMarketIds: z.array(z.string()),
  notifications: z.array(
    z.object({
      id: z.string(),
      kind: z.enum([
        'MARKET_MOVE',
        'ORDER_FILLED',
        'POSITION_SOLD',
        'LIMIT_PLACED',
        'LIMIT_CANCELLED',
        'FUNDS_ADDED',
        'MARKET_RESOLVED',
        'MARKET_STATUS',
        'QUOTE_CHANGED',
      ]),
      title: z.string(),
      text: z.string(),
      targetPath: z.string(),
      createdAt: z.string(),
      seq: int,
      readAt: z.string().nullable(),
    }),
  ),
  processedIntents: z.record(z.string(), z.string()),
  marketOverrides: z.record(
    z.string(),
    z.object({
      status: status.optional(),
      removeQuotes: z.boolean().optional(),
      quotes: z
        .record(z.string(), z.object({ yesQuote: quote.nullable(), noQuote: quote.nullable(), probabilityCents: int }))
        .optional(),
      liquidity: z.object({ maxBuy: int, maxSell: int }).optional(),
      resolution: z.object({ yesOutcomeIds: z.array(z.string()), resolvedAt: z.string() }).optional(),
    }),
  ),
  armedQuoteChanges: z.array(
    z.object({ marketId: z.string(), outcomeId: z.string(), yesQuote: quote, noQuote: quote }),
  ),
  activeScenarios: z.array(z.string()),
  seq: int,
});

export const persistedSchema = z.object({
  user: userStateSchema,
  recentSearches: z.array(z.string()).max(8),
  preferences: z.object({ motion: z.enum(['system', 'reduce', 'full']) }),
});
