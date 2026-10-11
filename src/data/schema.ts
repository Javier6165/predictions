import { z } from 'zod';

/** Integer cents. Money and prices are never floats. */
const cents = z.number().int();
const isoDate = z.string().refine((v) => !Number.isNaN(Date.parse(v)), 'Invalid ISO date');

export const quoteSchema = z
  .object({
    indicativeCents: cents.min(1).max(99),
    askCents: cents.min(1).max(99),
    bidCents: cents.min(1).max(99),
  })
  .refine((q) => q.bidCents <= q.indicativeCents && q.indicativeCents <= q.askCents, 'bid <= mark <= ask');

export const outcomeSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  probabilityCents: cents.min(0).max(100),
  yesQuote: quoteSchema.nullable(),
  noQuote: quoteSchema.nullable(),
});

export const marketStatusSchema = z.enum([
  'OPEN',
  'UPCOMING',
  'SUSPENDED',
  'CLOSED',
  'PENDING_RESOLUTION',
  'RESOLVED',
  'VOIDED',
]);

export const marketTypeSchema = z.enum(['BINARY', 'THRESHOLD', 'MULTI_OUTCOME']);

export const demoUpdateSchema = z.object({
  id: z.string(),
  at: isoDate,
  title: z.string(),
  body: z.string(),
  publisher: z.literal('NOVA DEMO'),
  isSimulated: z.literal(true),
});

export const marketSchema = z.object({
  id: z.string().min(1),
  category: z.string().min(1),
  type: marketTypeSchema,
  question: z.string().min(1),
  title: z.string().min(1),
  closeAt: isoDate,
  status: marketStatusSchema,
  outcomes: z.array(outcomeSchema).min(1),
  tags: z.array(z.string()),
  resolutionSummary: z.string(),
  resolutionSource: z.string(),
  isFeatured: z.boolean(),
  storylineIsFictional: z.literal(true),
  pricePathKey: z.string(),
  resolvedAt: isoDate.optional(),
  winningOutcomeId: z.string().optional(),
  resolutionRule: z.object({
    yesCondition: z.string(),
    noCondition: z.string(),
    evaluatedAt: isoDate,
    sourceLabel: z.string(),
    isSimulated: z.literal(true),
    voidCondition: z.string(),
    settlementCentsPerWinningContract: z.literal(100),
    settlementCentsPerLosingContract: z.literal(0),
  }),
  demoLiquidity: z.object({
    maxImmediateBuyContractsPerOutcome: cents.min(0),
    maxImmediateSellContractsPerOutcome: cents.min(0),
  }),
  demoActivity: z.object({
    volume24hCents: cents.min(0),
    trendingScore: z.number(),
    simulated: z.literal(true),
  }),
  demoUpdates: z.array(demoUpdateSchema),
  chartPoints: z
    .array(
      z.object({
        at: isoDate,
        probabilityCentsByOutcome: z.record(z.string(), cents.min(0).max(100)),
      }),
    )
    .min(2),
});

const sideSchema = z.enum(['YES', 'NO']);

export const fixtureSchema = z.object({
  schemaVersion: z.literal(2),
  scenarioId: z.string(),
  displayAsOf: isoDate,
  isSimulation: z.literal(true),
  sourceDisclaimer: z.string(),
  currency: z.literal('USD'),
  contractPayoutIfCorrectCents: z.literal(100),
  feesCents: z.literal(0),
  marketData: z.array(marketSchema).min(1),
  initialState: z.object({
    initialDepositCents: cents,
    cashTotalCents: cents,
    reservedCashCents: cents,
    availableCashCents: cents,
    portfolioValueCents: cents,
    unrealizedPnLCents: cents,
    realizedPnLCents: cents,
    positions: z.array(
      z.object({
        id: z.string(),
        marketId: z.string(),
        outcomeId: z.string(),
        side: sideSchema,
        quantity: cents.min(1),
        averageBuyPriceCents: cents,
        costBasisCents: cents,
        currentMarkCents: cents,
        currentMarkedValueCents: cents,
        unrealizedPnLCents: cents,
      }),
    ),
    orders: z.array(
      z.object({
        id: z.string(),
        marketId: z.string(),
        outcomeId: z.string(),
        side: sideSchema,
        action: z.literal('BUY'),
        type: z.literal('LIMIT'),
        limitPriceCents: cents,
        requestedQuantity: cents.min(1),
        filledQuantity: cents.min(0),
        status: z.literal('OPEN'),
        reservedCashCents: cents,
        createdAt: isoDate,
      }),
    ),
    savedMarketIds: z.array(z.string()),
    notifications: z.array(
      z.object({
        id: z.string(),
        kind: z.string(),
        targetMarketId: z.string(),
        text: z.string(),
        readAt: z.string().nullable(),
      }),
    ),
    history: z.array(
      z.object({
        id: z.string(),
        action: z.literal('BUY'),
        positionId: z.string(),
        amountCents: cents,
        quantity: cents,
        priceCents: cents,
        createdAt: isoDate,
      }),
    ),
  }),
  scenarioDefinitions: z.record(z.string(), z.record(z.string(), z.unknown())),
});

export type Fixture = z.infer<typeof fixtureSchema>;
export type FixtureMarket = z.infer<typeof marketSchema>;
