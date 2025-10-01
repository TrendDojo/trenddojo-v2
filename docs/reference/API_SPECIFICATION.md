# TrendDojo API Specification

*Last updated: 2025-09-28*
*Extracted from: trenddojo-setup-technical-spec.md*

## Overview

TrendDojo uses tRPC for type-safe API routes with end-to-end TypeScript support. All routes include proper authentication, input validation, and subscription tier enforcement.

## Authentication & Authorization

All API routes require authentication via NextAuth.js session. Subscription tier limits are enforced at the route level.

```typescript
// All routes have access to context
interface Context {
  session: {
    user: {
      id: string;
      email: string;
    }
  }
}
```

## Trade Router (`tradeRouter`)

### Position Sizing Calculator

Calculates optimal position size based on risk parameters with comprehensive validation.

```typescript
calculatePosition: procedure
  .input(z.object({
    accountBalance: z.number(),
    riskPercent: z.number(),
    entryPrice: z.number(),
    stopLoss: z.number(),
    targetPrice: z.number().optional(),
    assetType: z.enum(['stock', 'crypto', 'forex']),
    direction: z.enum(['long', 'short'])
  }))
  .mutation(async ({ input, ctx }) => {
    // Returns position size, warnings, and risk metrics
  })
```

**Validation Rules:**
- Stop loss must be below entry for longs, above for shorts
- Stop distance must be > 0.5% of entry price
- Position size respects subscription limits
- Checks for correlation and risk concentration

**Response:**
```typescript
{
  positionSize: number;
  positionValue: number;
  riskAmount: number;
  stopPercent: number;
  riskRewardRatio: number | null;
  warnings: string[];
  stopDistance: number;
  potentialProfit: number | null;
  estimatedCommission: number;
}
```

### Pre-Trade Validation

Validates entry conditions and checks for conflicts with existing positions.

```typescript
validateEntry: procedure
  .input(z.object({
    accountId: z.string(),
    symbol: z.string(),
    proposedRisk: z.number(),
    timeframe: z.string(),
    direction: z.enum(['long', 'short'])
  }))
  .query(async ({ input, ctx }) => {
    // Returns validation result with warnings and errors
  })
```

**Checks:**
- Daily/weekly risk limits
- Existing positions on same symbol
- Correlation with other holdings
- Position count limits
- Account balance sufficiency

**Response:**
```typescript
{
  warnings: string[];
  errors: string[];
  canTrade: boolean;
  existingPositions: Trade[];
}
```

### Create Trade

Creates a new trade record with comprehensive validation.

```typescript
createTrade: procedure
  .input(TradeCreateSchema)
  .mutation(async ({ input, ctx }) => {
    // Creates trade after validation
  })
```

**Requirements:**
- Completed checklist items
- Passed risk validation
- Valid stop loss and target prices
- Account balance sufficient

### Update Position

Updates existing position with stop loss ratcheting validation.

```typescript
updatePosition: procedure
  .input(z.object({
    tradeId: z.string(),
    updates: z.object({
      stopLoss: z.number().optional(),
      targetPrice: z.number().optional(),
      notes: z.string().optional()
    })
  }))
  .mutation(async ({ input }) => {
    // Updates position with validation
  })
```

**Stop Loss Rules:**
- Long positions: stop can only move higher (profit protection)
- Short positions: stop can only move lower (profit protection)
- Prevents "giving back" locked-in profits

### Dashboard Data

Retrieves comprehensive dashboard information with real-time calculations.

```typescript
getDashboard: procedure
  .input(z.object({ accountId: z.string() }))
  .query(async ({ input }) => {
    // Returns dashboard metrics
  })
```

**Response:**
```typescript
{
  activePositions: Array<{
    id: string;
    symbol: string;
    direction: string;
    entryPrice: number;
    currentPrice: number;
    unrealizedPnl: number;
    stopLoss: number;
    targetPrice: number;
    // ... other trade fields
  }>;
  totalRiskAmount: number;
  totalRiskPercent: number;
  dailyRiskUsed: number;
  weeklyRiskUsed: number;
  stats: {
    winRate: number;
    avgRMultiple: number;
    profitFactor: number;
    currentStreak: number;
  };
}
```

## Screener Router (`screenerRouter`)

### Run Screener

Executes stock screening with tier-based limits and filters.

```typescript
runScreener: procedure
  .input(z.object({
    filters: z.object({
      // Price filters
      priceMin: z.number().optional(),
      priceMax: z.number().optional(),
      volumeMin: z.number().optional(),

      // Technical filters
      aboveSMA20: z.boolean().optional(),
      aboveSMA50: z.boolean().optional(),
      aboveSMA200: z.boolean().optional(),
      nearHigh52w: z.number().optional(), // within X%
      nearLow52w: z.number().optional(),
      rsiMin: z.number().optional(),
      rsiMax: z.number().optional(),
      atrMin: z.number().optional(),
      atrMax: z.number().optional(),

      // Fundamental filters (Basic/Pro only)
      marketCapMin: z.number().optional(),
      isProfitable: z.boolean().optional(),
      peMax: z.number().optional(),
      revenueGrowthMin: z.number().optional(),
      sectors: z.array(z.string()).optional(),

      // Risk filters
      maxCorrelation: z.number().optional(),
      excludeExisting: z.boolean().optional(),
      fitRiskBudget: z.boolean().optional()
    }),
    accountId: z.string(),
    limit: z.number().default(50)
  }))
  .query(async ({ input, ctx }) => {
    // Returns filtered results with position sizing
  })
```

**Subscription Limits:**
- **Free**: 5 results, 15-minute refresh
- **Starter**: 25 results, 5-minute refresh
- **Basic**: 50 results, 1-minute refresh, fundamentals
- **Pro**: 200 results, 5-second refresh, all features

**Response:**
```typescript
Array<{
  symbol: string;
  price: number;
  volume_avg_20d: number;
  atr_20d: number;
  rsi_14d: number;
  percent_from_high_52w: number;
  market_cap?: number;
  pe_ratio?: number;
  sector?: string;
  is_profitable?: boolean;
  suggestedStop: number;
  suggestedTarget: number;
  positionSize: number;
  riskRewardRatio: number;
}>
```

### Save Screener Preset

Saves custom screening criteria for reuse.

```typescript
savePreset: procedure
  .input(z.object({
    name: z.string(),
    description: z.string().optional(),
    filters: z.any(), // JSON object
    isPublic: z.boolean().default(false)
  }))
  .mutation(async ({ input, ctx }) => {
    // Saves preset to database
  })
```

### Get Screener Presets

Retrieves user's saved presets plus public ones.

```typescript
getPresets: procedure
  .query(async ({ ctx }) => {
    // Returns user's and public presets
  })
```

## Subscription Router (`subscriptionRouter`)

### Get Subscription Status

Returns current subscription information and limits.

```typescript
getStatus: procedure
  .query(async ({ ctx }) => {
    // Returns subscription details
  })
```

**Response:**
```typescript
{
  tier: 'free' | 'starter' | 'basic' | 'pro';
  status: 'active' | 'cancelled' | 'past_due';
  expiresAt: Date | null;
  limits: {
    max_accounts: number;
    max_positions: number;
    max_screener_results: number;
    screener_refresh_seconds: number;
    has_fundamentals: boolean;
    has_realtime_data: boolean;
    has_api_access: boolean;
    has_broker_integration: boolean;
    monthly_price: number;
  };
}
```

### Create Checkout Session

Creates Airwallex payment session for subscription upgrade.

```typescript
createCheckout: procedure
  .input(z.object({
    tier: z.enum(['starter', 'basic', 'pro']),
    annual: z.boolean().default(false)
  }))
  .mutation(async ({ input, ctx }) => {
    // Returns Airwallex checkout URL
  })
```

**Pricing:**
- **Starter**: $4.99/month, $49.99/year
- **Basic**: $14.99/month, $149.99/year
- **Pro**: $39.99/month, $399.99/year

### Webhook Handler

Processes Airwallex webhook events for payment confirmation.

```typescript
handleWebhook: procedure
  .input(z.any())
  .mutation(async ({ input }) => {
    // Processes payment events
  })
```

**Handled Events:**
- `payment_intent.succeeded` - Activates subscription
- `payment_intent.failed` - Handles payment failures
- `subscription.cancelled` - Deactivates account
- `subscription.past_due` - Flags overdue payment

## Market Data Router (`marketDataRouter`)

### Symbol Coverage Philosophy

**TrendDojo supports ANY valid US stock ticker** that trades on NYSE/NASDAQ. No artificial limitations - if it trades, we support it.

**Implementation Strategy:**
1. **Hot Cache**: 100 S&P 500 symbols pre-loaded with full history
2. **On-Demand**: All other symbols fetched from Polygon when requested
3. **Smart Caching**: Frequently accessed symbols cached locally

### Validate Symbol

Validates any ticker symbol against Polygon's database.

```typescript
validateSymbol: procedure
  .input(z.object({
    symbol: z.string().toUpperCase()
  }))
  .query(async ({ input }) => {
    // Check cache first, then Polygon API
    // Returns validation status and company details
  })
```

**Response:**
```typescript
{
  valid: boolean;
  symbol?: string;
  name?: string;
  exchange?: string;
  type?: string;
  source: 'cache' | 'polygon';
}
```

### Search Symbols

Search ALL available symbols via Polygon API.

```typescript
searchSymbols: procedure
  .input(z.object({
    query: z.string().min(1),
    limit: z.number().default(20)
  }))
  .query(async ({ input }) => {
    // Search Polygon's entire ticker database
  })
```

**Response:**
```typescript
Array<{
  symbol: string;
  name: string;
  exchange: string;
  type: string;
  hasLocalData: boolean;
}>
```

### Get Price History

Retrieves historical price data with on-demand fetching.

```typescript
getPriceHistory: procedure
  .input(z.object({
    symbol: z.string(),
    timeframe: z.enum(['5m', '15m', '1h', '4h', '1d', '1w']),
    limit: z.number().default(100)
  }))
  .query(async ({ input }) => {
    // Returns OHLCV data
  })
```

**Data Strategy:**
1. Check local SQLite cache first
2. If not cached, fetch from Polygon API
3. Store fetched data for future use
4. Return standardized OHLCV format

**Response:**
```typescript
Array<{
  symbol: string;
  timeframe: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  timestamp: Date;
}>
```

### Update Technical Indicators

Background job to refresh technical analysis data.

```typescript
updateTechnicals: procedure
  .mutation(async () => {
    // Updates all technical indicators
  })
```

**Updated Fields:**
- SMA 20, 50, 200
- RSI 14-day
- ATR 20-day
- 52-week high/low percentages
- Volume averages

### Data Management Scripts

**Development Scripts:**
- `npm run polygon-download` - Download market data from Polygon
- `npm run polygon-2h` - Download 2-hour aggregated data
- `npm run market-backup` - Backup SQLite database
- `npm run market-vacuum` - Optimize database file size
- `npm run cache:updater` - Update market data cache

**Production Sync:**
- `./scripts/sync-production-data.sh` - Sync from production to local
- `./scripts/sync-production-data.sh --full` - Full historical sync

## Error Handling

All routes use consistent error handling patterns:

```typescript
// Standard error response
{
  success: false;
  error: string;
  code?: string;
}

// Standard success response
{
  success: true;
  data: T;
}
```

## Rate Limiting

Rate limits are enforced based on subscription tier:

- **Free**: 60 requests/hour
- **Starter**: 300 requests/hour
- **Basic**: 1000 requests/hour
- **Pro**: 5000 requests/hour

Special limits for screener endpoints based on `screener_refresh_seconds`.

## Input Validation

All inputs use Zod schemas for type safety and validation:

```typescript
// Example trade schema
const TradeCreateSchema = z.object({
  accountId: z.string().uuid(),
  symbol: z.string().min(1).max(10),
  entryPrice: z.number().positive(),
  stopLoss: z.number().positive(),
  targetPrice: z.number().positive().optional(),
  quantity: z.number().positive(),
  direction: z.enum(['long', 'short']),
  timeframe: z.enum(['5m', '1h', '4h', '1d', '1w']),
  strategy_type: z.string().optional(),
  setup_quality: z.number().int().min(1).max(5).optional()
});
```

## Business Logic Validation

Critical business rules enforced at API level:

1. **Risk Management**: No trade can exceed daily/weekly risk limits
2. **Position Limits**: Subscription tier limits enforced
3. **Stop Loss Rules**: Must be appropriate for direction
4. **Correlation Limits**: Prevents over-concentration
5. **Balance Checks**: Sufficient funds for position size

---

*See also:*
- [Data Models](./DATA_MODELS.md) - Database schemas used by these APIs
- [Architecture](./ARCHITECTURE.md) - tRPC setup and middleware
- [Broker Integration](../BROKER_INTEGRATION.md) - External API integrations