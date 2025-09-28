# Market Data System

*Last updated: 2025-09-28*

## Core Principle: Market Data as Universal Truth

Market data is deterministic and environment-agnostic. AAPL closing at $234.56 is the same fact whether you're in dev, staging, or production. This insight drives our architecture.

## Overview

The market data system provides high-performance local access to years of stock data without API dependencies for development, while enabling real-time production updates through a shared PostgreSQL database and multi-source data provider architecture.

## Multi-Source Strategy

We support multiple data sources and brokers per user from day one:
- **Primary**: User's connected broker (Alpaca, IBKR, etc.)
- **Historical**: Polygon for deep historical data
- **Fallback**: Yahoo Finance for free backup
- **Future**: Crypto (Coinbase), Forex (OANDA)

## Hybrid Architecture: Embedded Service with Logical Separation

### Structure
```
trenddojo-v2/
├── src/
│   ├── app/                      # Next.js app
│   └── lib/market-data/          # Logically separate service
│       ├── providers/            # Data provider implementations
│       ├── database/             # Database layer
│       ├── client/               # Client service layer
│       └── import/               # Data import utilities
├── data/
│   └── market/
│       └── historical_prices.db  # SQLite (development)
├── scripts/
│   └── market-data/
│       ├── backfill.ts          # Historical data loader
│       ├── sync.ts              # Manual sync trigger
│       └── validate.ts          # Data integrity checks
└── prisma/
    └── schema.prisma            # Shared schema
```

### Why This Works

1. **Logical Separation**: Market data code is isolated in its own module
2. **Physical Simplicity**: Still one deployment, one database
3. **Future-Ready**: Can extract to microservice later if needed
4. **Dev-Friendly**: Everything runs locally with one command

## Architecture by Environment

### Development Architecture (Local SQLite)
```
/data/market/
  historical_prices.db    # SQLite database (2-3GB when populated)

/src/lib/market-data/
  database/              # Database layer
    MarketDatabase.ts    # Core database service
    schema.sql          # SQLite schema
    types.ts           # TypeScript types
  import/              # Import utilities
    BulkImporter.ts    # CSV/JSON import handler
```

### Production Architecture (Shared PostgreSQL)
```
Production PostgreSQL (Supabase)
├── public schema (user data - isolated per environment)
└── market schema (market data - shared across environments)
    ├── price_data (historical daily bars)
    ├── latest_quotes (real-time quotes)
    ├── symbols (symbol metadata)
    └── sync_state (tracking table)

Production (write) → market schema
     ↓
Staging (read-only) → market schema
     ↓
Development (read-only) → market schema
```

## Provider Architecture

### Data Provider Interface

All providers MUST implement the `IMarketDataProvider` interface:

```typescript
interface IMarketDataProvider {
  // Provider identification
  readonly name: string;
  readonly config: ProviderConfig;

  // Lifecycle methods
  initialize(): Promise<void>;
  shutdown(): Promise<void>;

  // Core data methods
  getCurrentPrice(symbol: string): Promise<PriceData>;
  getBulkPrices(symbols: string[]): Promise<BulkPriceResponse>;
  getHistoricalData(options: HistoricalDataOptions): Promise<Candle[]>;
  getTechnicalIndicators(symbol: string): Promise<TechnicalData>;

  // Optional streaming
  subscribeToPrice?(
    symbol: string,
    callback: (price: PriceData) => void
  ): PriceSubscription | null;

  // Provider health
  getStatus(): Promise<ProviderStatus>;
  getCapabilities(): ProviderCapabilities;

  // Validation
  isSymbolValid(symbol: string): Promise<boolean>;
  normalizeSymbol(symbol: string): string;
}
```

### Provider Implementations

```
IMarketDataProvider (interface)
    ↓
├── YahooFinanceProvider (free tier)
├── PolygonProvider (pro tier - future)
├── AlphaVantageProvider (backup - future)
├── MockProvider (development/testing)
└── [CustomProvider] (new implementations)
    ↓
MarketDataService (orchestrator)
    ↓
PostgreSQL/SQLite Cache (persistence)
```

### Smart Data Router

```typescript
class DataRouter {
  private providers: Map<string, IMarketDataProvider>;

  async getDataForUser(
    userId: string,
    symbol: string,
    dataType: 'quote' | 'chart' | 'fundamentals'
  ): Promise<MarketData> {
    // Get user's preferences
    const preferences = await this.getUserPreferences(userId, dataType);
    const availableSources = await this.getAvailableSources(userId);

    // Try sources in preference order
    for (const sourceName of preferences.orderedSources) {
      if (!availableSources.has(sourceName)) continue;

      try {
        const provider = this.providers.get(sourceName);
        const data = await provider.getQuote(symbol);

        return {
          ...data,
          source: sourceName,
          timestamp: new Date()
        };
      } catch (error) {
        console.log(`${sourceName} failed, trying next...`);
        continue;
      }
    }

    // Fallback to cached data
    return this.getCachedData(symbol);
  }
}
```

## Database Design

### SQLite Schema (Development)
```sql
-- Append-only market data
CREATE TABLE market_data_ticks (
  symbol VARCHAR(10),
  timestamp TIMESTAMPTZ,
  price DECIMAL(15,6),
  volume BIGINT,
  fetched_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (symbol, timestamp)
);

-- Latest values cache (for fast queries)
CREATE MATERIALIZED VIEW market_data_latest AS
SELECT DISTINCT ON (symbol)
  symbol, price, volume, timestamp
FROM market_data_ticks
ORDER BY symbol, timestamp DESC;
```

### PostgreSQL Schema (Production)
```sql
-- Enhanced broker connections
ALTER TABLE broker_connections ADD COLUMN IF NOT EXISTS
  data_tier VARCHAR(50),         -- 'iex_free', 'sip_paid', etc.
  is_primary BOOLEAN DEFAULT false,
  capabilities JSONB;             -- {hasRealtime: true, hasOptions: false}

-- User data preferences
CREATE TABLE user_data_preferences (
  user_id UUID REFERENCES users(id),
  preference_type VARCHAR(50),   -- 'charts', 'quotes', 'fundamentals'
  primary_source VARCHAR(50),
  fallback_sources TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, preference_type)
);

-- Track available data sources
CREATE TABLE user_data_sources (
  user_id UUID REFERENCES users(id),
  source VARCHAR(50),            -- 'alpaca', 'polygon', 'yahoo'
  credentials JSONB,              -- Encrypted
  tier VARCHAR(50),               -- 'free', 'basic', 'premium'
  expires_at TIMESTAMPTZ,
  PRIMARY KEY (user_id, source)
);

-- Sync tracking per environment
CREATE TABLE market_data_sync (
  environment VARCHAR(20),
  last_sync TIMESTAMPTZ,
  next_sync TIMESTAMPTZ,
  status VARCHAR(20),
  PRIMARY KEY (environment)
);
```

## Development Setup

### 1. Database Initialization
The SQLite database will be automatically created on first use at `/data/market/historical_prices.db`.

### 2. Data Import Process

#### Import CSV Data
```bash
# Import a single CSV file
npm run import-data data/stocks_2024.csv

# Import with options
npm run import-data data/stocks_2024.csv --skip-duplicates --batch-size 5000
```

Expected CSV format:
```csv
symbol,date,open,high,low,close,volume,adjusted_close
AAPL,2024-01-02,184.25,185.88,183.89,185.64,50271400,185.64
AAPL,2024-01-03,184.22,185.00,183.43,184.25,58414500,184.25
```

#### Import JSON Data
```bash
npm run import-data data/stocks_2024.json
```

Supported JSON formats:
```json
// Format 1: Array of prices
[
  {
    "symbol": "AAPL",
    "date": "2024-01-02",
    "open": 184.25,
    "high": 185.88,
    "low": 183.89,
    "close": 185.64,
    "volume": 50271400,
    "adjusted_close": 185.64
  }
]

// Format 2: Object with prices array
{
  "prices": [...],
  "metadata": {...}
}
```

### 3. Database Management

#### Check Database Statistics
```bash
npm run market-stats
```

Output:
```
📊 Market Database Statistics
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📈 Overview:
   Total Symbols: 8,234
   Total Records: 10,345,678
   Date Range: 2019-01-02 to 2024-01-26
   Database Size: 2,456.78 MB
   Last Updated: 2025-01-26T10:30:00
```

### 4. Development Workflow
```bash
# Start everything
npm run dev

# In another terminal, run market data sync
npm run market-data:sync

# Backfill historical data
npm run market-data:backfill --days=30
```

## Production Setup

### Step 1: Create Production Database Schema

1. Connect to your production PostgreSQL (Supabase):
```bash
psql $PRODUCTION_DATABASE_URL
```

2. Run the market schema migration:
```sql
-- Execute the contents of prisma/migrations/market_data_schema.sql
```

3. Verify the schema was created:
```sql
\dn market
\dt market.*
```

### Step 2: Configure Read-Only Access

1. Create read-only connection string for staging/dev:
```sql
-- Create read-only user (if not already done in migration)
CREATE ROLE market_reader WITH LOGIN PASSWORD 'secure_password_here';
GRANT CONNECT ON DATABASE postgres TO market_reader;
GRANT USAGE ON SCHEMA market TO market_reader;
GRANT SELECT ON ALL TABLES IN SCHEMA market TO market_reader;
```

### Step 3: Environment Variables

#### Production (.env.production)
```env
# Main database (read/write to both schemas)
DATABASE_URL="postgresql://postgres:xxx@db.xxx.supabase.co:5432/postgres"

# Cron job secret
CRON_SECRET="generate-random-secret-here"

# Market data providers
POLYGON_API_KEY="your-polygon-key"
ALPHA_VANTAGE_API_KEY="your-alpha-vantage-key"
```

#### Staging (.env.staging)
```env
# Main database (staging user data)
DATABASE_URL="postgresql://postgres:xxx@db.staging.supabase.co:5432/postgres"

# Read-only access to production market data
MARKET_DATABASE_URL="postgresql://market_reader:xxx@db.production.supabase.co:5432/postgres?schema=market"
```

### Step 4: Deploy to Vercel

1. Add environment variables in Vercel dashboard
2. Deploy the application
3. Verify cron jobs are registered
4. Load initial data

## Provider Implementation

### Implementation Checklist

#### 1. Create Provider Class
```typescript
import { IMarketDataProvider } from './IMarketDataProvider';

export class YourProvider implements IMarketDataProvider {
  readonly name = 'Your Provider Name';
  readonly config: ProviderConfig;

  constructor(config?: Partial<ProviderConfig>) {
    this.config = {
      type: 'your-provider',
      tier: config?.tier || 'free',
      rateLimit: config?.rateLimit || 1000,
      timeout: config?.timeout || 5000,
      retryAttempts: config?.retryAttempts || 3,
      apiKey: config?.apiKey,
    };
  }

  // Implement all required methods...
}
```

#### 2. Handle Rate Limiting
```typescript
private requestCount = 0;
private requestResetTime = Date.now() + 3600000;

private async checkRateLimit(): Promise<void> {
  if (Date.now() > this.requestResetTime) {
    this.requestCount = 0;
    this.requestResetTime = Date.now() + 3600000;
  }

  if (this.requestCount >= this.config.rateLimit) {
    throw new MarketDataError(
      'Rate limit exceeded',
      MarketDataErrorCode.RATE_LIMIT,
      this.name
    );
  }
}
```

#### 3. Implement Retry Logic
```typescript
private async fetchWithRetry<T>(url: string): Promise<T> {
  let lastError: any;

  for (let attempt = 0; attempt < this.config.retryAttempts; attempt++) {
    try {
      const response = await fetch(url, {
        signal: AbortSignal.timeout(this.config.timeout),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      lastError = error;

      if (attempt < this.config.retryAttempts - 1) {
        // Exponential backoff
        await new Promise(resolve =>
          setTimeout(resolve, Math.pow(2, attempt) * 1000)
        );
      }
    }
  }

  throw new MarketDataError(
    'Failed after retries',
    MarketDataErrorCode.NETWORK_ERROR,
    this.name,
    lastError
  );
}
```

#### 4. Normalize Data Format
```typescript
// Price data
interface PriceData {
  symbol: string;
  price: number;
  timestamp: Date;
  volume?: number;
  change?: number;
  changePercent?: number;
  bid?: number;
  ask?: number;
  marketCap?: number;
}

// Candle data
interface Candle {
  timestamp: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}
```

### Provider-Specific Considerations

#### Yahoo Finance
- **No API key required** for basic data
- **Rate limit**: ~2000 req/hour (undocumented)
- **Limitations**: No real-time streaming, 15-min delay
- **Best for**: Free tier users

#### Polygon.io (Future)
- **API key required**
- **Rate limits**: Varies by plan
- **Features**: WebSocket streaming, real-time data
- **Best for**: Pro tier users

#### Alpha Vantage (Future)
- **API key required** (free tier available)
- **Rate limit**: 5 req/min (free), 500 req/day
- **Features**: Technical indicators, fundamentals
- **Best for**: Backup provider

## Background Jobs & Cross-Environment Sync

### Background Jobs
```typescript
// Using Vercel Cron or Inngest
export async function marketDataCron() {
  // Runs every minute during market hours
  if (!isMarketOpen()) return;

  const ingester = new PolygonIngester();
  await ingester.fetchAndStore();

  // Refresh materialized view
  await db.refreshMaterializedView('market_data_latest');
}
```

### Cross-Environment Sync
```typescript
// Each environment tracks its own sync state
export async function syncMarketData(env: string) {
  const lastSync = await getLastSync(env);
  const latestData = await getDataSince(lastSync);

  if (latestData.length > 0) {
    await bulkInsert(latestData);
    await updateSyncState(env, new Date());
  }

  return {
    synced: latestData.length,
    currentLag: Date.now() - lastSync,
  };
}
```

## Symbol Universe Expansion: 100 → 8000+ Symbols

### Tiered Symbol Universe
```typescript
class SymbolUniverseManager {
  private tiers = {
    user_watchlist: {      // User-specific symbols
      symbols: [],         // Dynamic based on user portfolios
      updateFreq: 60,      // 1 minute
      priority: 1
    },
    core: {               // Most liquid/traded
      symbols: ['AAPL', 'MSFT', 'GOOGL', ...], // ~100 symbols
      updateFreq: 60,      // 1 minute
      priority: 2
    },
    sp500: {              // S&P 500 components
      symbols: [...],      // ~500 symbols
      updateFreq: 300,     // 5 minutes
      priority: 3
    },
    russell3000: {        // Broader market
      symbols: [...],      // ~3000 symbols
      updateFreq: 900,     // 15 minutes
      priority: 4
    },
    full_universe: {      // All tradeable US equities
      symbols: [...],      // ~8000 symbols
      updateFreq: 3600,    // 1 hour
      priority: 5
    }
  };
}
```

### Progressive Expansion Triggers
```typescript
const expansionPlan: ExpansionTrigger[] = [
  {
    condition: "10 paying users",
    action: "Enable S&P 500 universe",
    tier: "sp500"
  },
  {
    condition: "$1000 MRR",
    action: "Enable Russell 3000",
    tier: "russell3000"
  },
  {
    condition: "$10000 MRR",
    action: "Enable full universe",
    tier: "full_universe"
  }
];
```

## Data Sources & Cost Optimization

### Recommended Providers for Bulk Download

1. **Polygon.io** ($29/month)
   - Unlimited API calls during subscription
   - 5 years historical data
   - Best for initial bulk download

2. **FirstRate Data** (One-time purchase)
   - Direct CSV downloads
   - No API needed
   - Good for historical backfill

3. **EOD Historical Data**
   - Bulk CSV exports
   - Reasonable pricing
   - Includes delisted stocks

4. **Free Options**
   - Kaggle datasets (historical snapshots)
   - Yahoo Finance (unreliable but free)

### Tiered Pricing Model

| Tier | Symbols | Update Freq | API Calls/Day | Monthly Cost |
|------|---------|-------------|---------------|-------------|
| MVP | 100 | 1 min | 39,000 | $29 |
| Growth | 500 | 5 min | 39,000 | $29 |
| Scale | 3000 | 15 min | 48,000 | $199 |
| Enterprise | 8000 | Mixed | 120,000 | $799 |

### Storage Projections
```
100 symbols × 365 days × 5 years = 182,500 records = ~20MB
500 symbols × 365 days × 5 years = 912,500 records = ~100MB
3000 symbols × 365 days × 5 years = 5,475,000 records = ~600MB
8000 symbols × 365 days × 5 years = 14,600,000 records = ~1.6GB
```

## Usage in Application

### Basic Usage
```typescript
import { MarketDatabase } from '@/lib/market-data/database/MarketDatabase';

const db = new MarketDatabase();
await db.initialize();

// Get price data
const prices = db.getPrices('AAPL', '2024-01-01', '2024-01-31');

// Get latest price
const latest = db.getLatestPrice('AAPL');

// Get all symbols
const symbols = db.getSymbols();

db.close();
```

## Testing Requirements

### 1. Unit Tests
Create comprehensive unit tests covering:
- ✅ All interface methods
- ✅ Error handling scenarios
- ✅ Rate limiting behavior
- ✅ Retry logic
- ✅ Data normalization
- ✅ Symbol validation

### 2. Mock External APIs
```typescript
// Mock fetch for testing
global.fetch = vi.fn();

beforeEach(() => {
  (global.fetch as any).mockResolvedValue({
    ok: true,
    json: async () => mockApiResponse,
  });
});
```

## Monitoring & Maintenance

### Check Cron Job Status
```sql
-- Recent sync status
SELECT * FROM market.sync_state
ORDER BY created_at DESC
LIMIT 10;

-- Check for failures
SELECT * FROM market.sync_state
WHERE status = 'failed'
ORDER BY created_at DESC;
```

### Monitor Data Freshness
```sql
-- Latest quotes age
SELECT
  symbol,
  timestamp,
  NOW() - timestamp as age
FROM market.latest_quotes
ORDER BY timestamp DESC
LIMIT 10;
```

## Performance Expectations

- **Import Speed**: ~10,000 records/second
- **Query Speed**: <10ms for date range queries
- **Database Size**: ~2-3GB for 5 years × 8,000 stocks
- **Memory Usage**: ~100MB with cache

## Scaling Considerations

### When to Scale
- **100+ active users**: Move to 5-minute updates for all S&P 500
- **1000+ active users**: Add Russell 3000, implement tiered updates
- **10,000+ active users**: Consider dedicated market data infrastructure

### Optimization Options
1. **Partitioning**: Partition price_data by month when >1M rows
2. **Materialized Views**: Pre-compute common queries
3. **Connection Pooling**: Use PgBouncer for read replicas
4. **Caching Layer**: Add Redis for hot data

## Troubleshooting

### Development Issues
- **"File not found"**: Check file path is correct
- **"Invalid date"**: Ensure dates are in YYYY-MM-DD format
- **"Duplicate key"**: Use `--skip-duplicates` flag

### Production Issues
- **Cron Jobs Not Running**: Check Vercel dashboard for errors, verify `CRON_SECRET`
- **Data Not Updating**: Check sync_state table for errors, verify API keys
- **Performance Issues**: Check database query performance, add indexes if needed

### Performance Optimization
- Run `npm run market-vacuum` to optimize database
- Increase batch size for imports: `--batch-size 10000`
- Ensure database is on SSD, not HDD

## Security Notes

1. **Never expose write credentials** to staging/dev
2. **Use environment-specific API keys** for data providers
3. **Rotate CRON_SECRET** periodically
4. **Monitor for suspicious queries** in database logs
5. **Set up alerts** for failed syncs

## Key Benefits

1. **Real Data Everywhere**: Dev/staging/prod all use actual market data
2. **Minimal Lag**: All environments within 1-2 minutes of real-time
3. **Single Source of Truth**: One ingestion pipeline, no duplicate API calls
4. **Resilient**: Can catch up after outages automatically
5. **Scalable**: Can handle 8000+ symbols with tiered updates
6. **Multi-Source Ready**: Support for user's preferred data sources

## Migration Path

If we need to extract to separate service later:

1. Copy `src/lib/market-data/` to new repo
2. Add REST/gRPC API layer
3. Update app to call API instead of direct DB
4. Deploy as separate service
5. Update ingestion to write to new service DB

## Implementation Workflow

### Development Phase
1. **Get Data**: Purchase/download bulk historical data
2. **Import**: Use import scripts to populate local SQLite database
3. **Verify**: Run `npm run market-stats` to confirm import
4. **Integrate**: Update app to use local data instead of API calls

### Production Phase
1. **Setup Schema**: Create production PostgreSQL schema
2. **Configure Access**: Set up read-only credentials for lower environments
3. **Deploy**: Configure Vercel with proper environment variables
4. **Load Data**: Import initial dataset and verify cron jobs
5. **Monitor**: Set up alerts and monitor data freshness

---

*The key insight: Market data is **logically separate** but **physically embedded** until scale demands otherwise.*