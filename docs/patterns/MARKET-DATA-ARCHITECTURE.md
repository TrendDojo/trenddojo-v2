# Market Data Architecture

*Last updated: 2025-01-26*

## Core Principle: Market Data as Universal Truth

Market data is deterministic and environment-agnostic. AAPL closing at $234.56 is the same fact whether you're in dev, staging, or production. This insight drives our architecture.

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
│   └── market-data-service/      # Logically separate service
│       ├── ingestion/            # Polygon data fetcher
│       ├── storage/              # Database layer
│       ├── api/                  # Internal API
│       └── sync/                 # Cross-env sync
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

## Implementation Mechanics

### 1. Data Ingestion Layer

```typescript
// src/market-data-service/ingestion/PolygonIngester.ts
export class PolygonIngester {
  private async fetchAndStore() {
    const symbols = await this.getActiveSymbols();
    const snapshots = await this.polygon.getAllSnapshots(symbols);
    
    // Store with deduplication
    await this.db.marketData.upsert({
      data: snapshots,
      conflictFields: ['symbol', 'timestamp'],
    });
    
    // Track sync state
    await this.updateSyncMetadata();
  }
}
```

### 2. Database Design

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

-- Sync tracking per environment
CREATE TABLE market_data_sync (
  environment VARCHAR(20),
  last_sync TIMESTAMPTZ,
  next_sync TIMESTAMPTZ,
  status VARCHAR(20),
  PRIMARY KEY (environment)
);

-- Latest values cache (for fast queries)
CREATE MATERIALIZED VIEW market_data_latest AS
SELECT DISTINCT ON (symbol) 
  symbol, price, volume, timestamp
FROM market_data_ticks
ORDER BY symbol, timestamp DESC;
```

### 3. Background Jobs

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

### 4. Cross-Environment Sync

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

## Development Workflow

### Local Development
```bash
# Start everything
npm run dev

# In another terminal, run market data sync
npm run market-data:sync

# Backfill historical data
npm run market-data:backfill --days=30
```

### Production Deployment
- Vercel Cron triggers ingestion every minute
- All environments read from same tables
- Each tracks its own sync state

## Key Benefits

1. **Real Data Everywhere**: Dev/staging/prod all use actual market data
2. **Minimal Lag**: All environments within 1-2 minutes of real-time
3. **Single Source of Truth**: One ingestion pipeline, no duplicate API calls
4. **Resilient**: Can catch up after outages automatically
5. **Scalable**: Can handle 8000+ symbols with 1-minute updates

## Migration Path

If we need to extract to separate service later:

1. Copy `src/market-data-service/` to new repo
2. Add REST/gRPC API layer
3. Update app to call API instead of direct DB
4. Deploy as separate service
5. Update ingestion to write to new service DB

## Expansion Strategy: 100 → 8000+ Symbols

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

  getSymbolsToUpdate(tier: string): string[] {
    // Returns symbols that need updating based on tier and last update time
  }
}
```

### Database Scaling Patterns

1. **Partitioning Strategy**
   ```sql
   -- Partition by symbol range for even distribution
   CREATE TABLE market_data_ticks_a_d PARTITION OF market_data_ticks
   FOR VALUES FROM ('A') TO ('E');

   -- Or partition by time for easier archival
   CREATE TABLE market_data_ticks_2025_q1 PARTITION OF market_data_ticks
   FOR VALUES FROM ('2025-01-01') TO ('2025-04-01');
   ```

2. **Indexing for Scale**
   ```sql
   -- BRIN indexes for time-series data (much smaller than B-tree)
   CREATE INDEX idx_market_data_timestamp_brin
   ON market_data_ticks USING BRIN (timestamp);

   -- Covering index for common queries
   CREATE INDEX idx_symbol_timestamp_price
   ON market_data_ticks (symbol, timestamp DESC)
   INCLUDE (price, volume);
   ```

3. **Materialized Views for Performance**
   ```sql
   -- Latest prices (refreshed every minute)
   CREATE MATERIALIZED VIEW market_latest AS
   SELECT DISTINCT ON (symbol) * FROM market_data_ticks
   ORDER BY symbol, timestamp DESC;

   -- Daily aggregates (refreshed after market close)
   CREATE MATERIALIZED VIEW market_daily AS
   SELECT symbol, date_trunc('day', timestamp) as day,
          first(price) as open, max(price) as high,
          min(price) as low, last(price) as close,
          sum(volume) as volume
   FROM market_data_ticks
   GROUP BY symbol, day;
   ```

### Progressive Expansion Triggers

```typescript
interface ExpansionTrigger {
  condition: string;
  action: string;
  tier: string;
}

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

### Symbol Addition Workflow

```typescript
class SymbolExpansionService {
  async addSymbolToUniverse(symbol: string, tier: string) {
    // 1. Validate symbol exists in Polygon
    const isValid = await this.polygon.validateSymbol(symbol);

    // 2. Backfill historical data
    await this.backfillHistoricalData(symbol, DAYS_TO_BACKFILL);

    // 3. Add to update schedule
    await this.scheduleUpdates(symbol, this.tiers[tier].updateFreq);

    // 4. Update indexes if needed
    if (this.shouldReindex(tier)) {
      await this.reindexConcurrently();
    }

    // 5. Notify monitoring
    await this.notifyExpansion(symbol, tier);
  }
}
```

## Cost Optimization

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

**With compression and partitioning, even 8000 symbols remain manageable**

## Multi-Source Implementation

### Database Schema for Multiple Sources

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
```

### Data Provider Interface

```typescript
// All data sources implement this interface
interface IDataProvider {
  getName(): string;
  getCapabilities(): DataCapabilities;

  // Core data methods
  getQuote(symbol: string): Promise<Quote>;
  getBars(symbol: string, timeframe: string, start: Date, end: Date): Promise<Bar[]>;
  getSnapshot(symbol: string): Promise<Snapshot>;

  // Optional methods
  getFundamentals?(symbol: string): Promise<Fundamentals>;
  getOptionsChain?(symbol: string): Promise<OptionsChain>;
  streamQuotes?(symbols: string[]): AsyncIterator<Quote>;
}

// Concrete implementations
class AlpacaProvider implements IDataProvider { ... }
class PolygonProvider implements IDataProvider { ... }
class YahooProvider implements IDataProvider { ... }
class IBKRProvider implements IDataProvider { ... }  // Future
```

### Smart Data Router

```typescript
class DataRouter {
  private providers: Map<string, IDataProvider>;

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

## Decision: Keep It Embedded (For Now)

**Reasoning:**
- Simplicity wins for MVP
- Can extract later if needed
- One less service to monitor
- Faster queries (no network hop)
- Easier local development
- **Expansion-ready architecture from day one**

The key insight: Market data is **logically separate** but **physically embedded** until scale demands otherwise.

## Expansion Readiness Checklist

### Database Design
- ✅ Schema supports partitioning
- ✅ Indexes optimized for time-series
- ✅ Materialized views for common queries
- ✅ Archive strategy defined
- ✅ Multi-source tables designed
- ✅ User preferences schema ready

### Application Architecture
- ✅ Symbol universe abstraction
- ✅ Tiered update frequencies
- ✅ Batch processing capability
- ✅ IDataProvider interface defined
- ✅ DataRouter pattern established
- ✅ Source tracking in all responses

### Multi-Broker Support
- ✅ Database supports multiple brokers per user
- ✅ is_primary flag for preferred broker
- ✅ Capabilities tracking per broker
- ✅ Data tier tracking (free vs paid)

### Business Alignment
- ✅ Costs scale with revenue
- ✅ Performance maintained at scale
- ✅ User experience prioritized
- ✅ Users can bring own data subscriptions
- ✅ Migration path documented

### Implementation Phases
1. **Phase 1 (NOW)**: Alpaca + Polygon hybrid
2. **Phase 2**: Add data source selection UI
3. **Phase 3**: Add IBKR, TD Ameritrade
4. **Phase 4**: Add crypto sources
5. **Phase 5**: Add forex sources