/**
 * Core domain model. All money and prices are integer cents; quantities are
 * integer contracts. A winning contract pays 100¢, a losing one 0¢.
 */

export type Cents = number;
export type Side = 'YES' | 'NO';

export type MarketStatus =
  | 'OPEN'
  | 'UPCOMING'
  | 'SUSPENDED'
  | 'CLOSED'
  | 'PENDING_RESOLUTION'
  | 'RESOLVED'
  | 'VOIDED';

export type MarketType = 'BINARY' | 'THRESHOLD' | 'MULTI_OUTCOME';

export interface Quote {
  /** Indicative probability / mark price. Display and portfolio marking only. */
  indicativeCents: Cents;
  /** Price paid when buying now. */
  askCents: Cents;
  /** Price received when selling now. */
  bidCents: Cents;
}

export interface Outcome {
  id: string;
  label: string;
  probabilityCents: Cents;
  yesQuote: Quote | null;
  noQuote: Quote | null;
}

export interface DemoUpdate {
  id: string;
  at: string;
  title: string;
  body: string;
  publisher: 'NOVA DEMO';
  isSimulated: true;
}

export interface ChartPoint {
  at: string;
  probabilityCentsByOutcome: Record<string, Cents>;
}

export interface Market {
  id: string;
  category: string;
  type: MarketType;
  question: string;
  title: string;
  closeAt: string;
  status: MarketStatus;
  outcomes: Outcome[];
  tags: string[];
  resolutionSummary: string;
  resolutionSource: string;
  isFeatured: boolean;
  resolvedAt?: string;
  winningOutcomeId?: string;
  resolutionRule: {
    yesCondition: string;
    noCondition: string;
    evaluatedAt: string;
    sourceLabel: string;
    voidCondition: string;
  };
  liquidity: { maxBuy: number; maxSell: number };
  activity: { volume24hCents: Cents; trendingScore: number };
  updates: DemoUpdate[];
  chartPoints: ChartPoint[];
}

export interface Position {
  id: string;
  marketId: string;
  outcomeId: string;
  side: Side;
  quantity: number;
  /** Exact cents paid for the contracts still held (allocated basis removed on sale). */
  costBasisCents: Cents;
  openedSeq: number;
}

export type OrderStatus = 'OPEN' | 'CANCELLED' | 'FILLED';

export interface LimitOrder {
  id: string;
  marketId: string;
  outcomeId: string;
  side: Side;
  action: 'BUY';
  type: 'LIMIT';
  limitPriceCents: Cents;
  requestedQuantity: number;
  filledQuantity: number;
  status: OrderStatus;
  /** Cash held while OPEN. Zero once cancelled or filled. */
  reservedCashCents: Cents;
  createdAt: string;
  seq: number;
}

export type LedgerKind =
  | 'BUY'
  | 'SELL'
  | 'LIMIT_PLACED'
  | 'LIMIT_CANCELLED'
  | 'LIMIT_FILLED'
  | 'DEPOSIT'
  | 'SETTLEMENT';

export interface LedgerEntry {
  id: string;
  kind: LedgerKind;
  /** Signed cash movement (negative = cash out). Reservations move 0 cash. */
  cashDeltaCents: Cents;
  marketId?: string;
  outcomeId?: string;
  side?: Side;
  quantity?: number;
  priceCents?: Cents;
  realizedPnLCents?: Cents;
  orderId?: string;
  intentId?: string;
  /** For SETTLEMENT: whether the held proposition was correct. */
  won?: boolean;
  createdAt: string;
  seq: number;
}

export type NotificationKind =
  | 'MARKET_MOVE'
  | 'ORDER_FILLED'
  | 'POSITION_SOLD'
  | 'LIMIT_PLACED'
  | 'LIMIT_CANCELLED'
  | 'FUNDS_ADDED'
  | 'MARKET_RESOLVED'
  | 'MARKET_STATUS'
  | 'QUOTE_CHANGED';

export interface AppNotification {
  id: string;
  kind: NotificationKind;
  title: string;
  text: string;
  /** In-app path the notification opens. */
  targetPath: string;
  createdAt: string;
  seq: number;
  readAt: string | null;
}

/** Deterministic overrides applied on top of the fixture by explicit demo scenarios. */
export interface MarketOverride {
  status?: MarketStatus;
  removeQuotes?: boolean;
  quotes?: Record<string, { yesQuote: Quote | null; noQuote: Quote | null; probabilityCents: Cents }>;
  liquidity?: { maxBuy: number; maxSell: number };
  /** Outcome ids whose YES contract pays out. Binary NO result = []. */
  resolution?: { yesOutcomeIds: string[]; resolvedAt: string };
}

/** A price change armed by a scenario; it fires on the next confirm for that market. */
export interface ArmedQuoteChange {
  marketId: string;
  outcomeId: string;
  yesQuote: Quote;
  noQuote: Quote;
}

export interface UserState {
  schemaVersion: number;
  scenario: 'showcase' | 'fresh';
  cashTotalCents: Cents;
  /** Virtual funds put in (initial + top-ups). Never counted as profit. */
  depositsCents: Cents;
  realizedPnLCents: Cents;
  positions: Position[];
  orders: LimitOrder[];
  ledger: LedgerEntry[];
  savedMarketIds: string[];
  notifications: AppNotification[];
  processedIntents: Record<string, string>;
  marketOverrides: Record<string, MarketOverride>;
  armedQuoteChanges: ArmedQuoteChange[];
  activeScenarios: string[];
  /** Monotonic sequence used for ids and ordering under a frozen demo clock. */
  seq: number;
}
