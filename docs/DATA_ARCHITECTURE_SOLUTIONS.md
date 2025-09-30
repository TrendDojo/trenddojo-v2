# Data Architecture Solutions - TrendDojo

## Current State Analysis

### 🔴 The Problem
1. **Multiple data sources** creating confusion:
   - Production: Live Polygon API (real data)
   - Local SQLite: 100 symbols with 5 years of history (real data)
   - MockProvider: Generates random data (fake)
   - No clear switching mechanism between sources

2. **Confusion points**:
   - Charts fail for symbols not in local SQLite (e.g., APLT)
   - Developers don't know when they're using real vs fake data
   - Production cron jobs return mock data (TODO never completed)
   - Mixed use of PolygonProvider, MockProvider, and direct SQLite access

3. **Security concerns**:
   - SQLite database is committed to repo (107MB)
   - Contains real market data that could be considered proprietary
   - No clear separation between dev and production data paths

## Proposed Solutions

### Solution 1: "Pure Production Mirror" ⭐ (Recommended)
**Philosophy**: Local development uses a sanitized copy of production data, updated weekly.

```
Production: Polygon API → PostgreSQL → Live Trading
Development: PostgreSQL Dump → SQLite → Safe Development
```

**Implementation**:
1. **Remove all MockProvider code** - No fake data anywhere
2. **Weekly data sync script**:
   ```bash
   # Run weekly on developer machines
   npm run sync-market-data
   # Downloads last 2 years from production (anonymized if needed)
   # Updates local SQLite with real historical data
   ```
3. **Clear environment flags**:
   ```env
   # .env.local
   MARKET_DATA_SOURCE=sqlite  # sqlite | polygon | yahoo
   MARKET_DATA_READONLY=true  # Prevents accidental API calls
   ```
4. **Automatic fallback chain**:
   ```typescript
   // In API routes
   const dataSource = process.env.MARKET_DATA_SOURCE || 'sqlite';
   if (dataSource === 'sqlite' && !dataExists) {
     return { error: 'Symbol not in local dataset. Run: npm run sync-market-data' }
   }
   ```

**Pros**:
- Zero confusion - all data is real historical data
- Charts always work with consistent data
- No dummy data to maintain
- Production-like development experience

**Cons**:
- Requires periodic sync
- Limited to historical data (no real-time in dev)

---

### Solution 2: "Explicit Mock Mode"
**Philosophy**: Dummy data exists but is explicitly labeled and segregated.

```
Production: Always Polygon API
Development Default: SQLite (real historical)
Development Mock: Explicitly enabled MockProvider
```

**Implementation**:
1. **Rename MockProvider → TestDataProvider**
2. **Visual indicators when using test data**:
   ```typescript
   // In components
   {isTestData && (
     <div className="bg-yellow-500 text-black p-2">
       ⚠️ TEST DATA MODE - Not Real Market Data
     </div>
   )}
   ```
3. **Explicit activation**:
   ```env
   # Only when specifically testing
   MARKET_DATA_SOURCE=test
   SHOW_TEST_DATA_BANNER=true
   ```

**Pros**:
- Clear when using fake data
- Good for testing edge cases
- Can generate data for any symbol

**Cons**:
- Still maintains two data systems
- Risk of confusion remains

---

### Solution 3: "Polygon Sandbox"
**Philosophy**: Use Polygon's delayed/sandbox data for development.

```
Production: Polygon API (real-time)
Development: Polygon API (15-min delayed free tier)
```

**Implementation**:
1. **Remove SQLite entirely**
2. **Use Polygon Basic (free) tier for dev**:
   ```typescript
   const polygonConfig = {
     apiKey: process.env.POLYGON_API_KEY,
     tier: process.env.NODE_ENV === 'production' ? 'premium' : 'basic',
     delay: process.env.NODE_ENV === 'production' ? 0 : 15 * 60 * 1000
   };
   ```
3. **Cache aggressively in development**:
   ```typescript
   // 24-hour cache for dev, 1-minute for prod
   const cacheTTL = isDev ? 86400000 : 60000;
   ```

**Pros**:
- Always using real data
- No sync needed
- Same code path for dev/prod

**Cons**:
- Requires internet for development
- API rate limits affect development
- Costs increase with team size

---

### Solution 4: "Hybrid Smart Cache"
**Philosophy**: Intelligent caching with clear data lineage.

```
Priority 1: Local SQLite (if exists)
Priority 2: Redis Cache (if populated)
Priority 3: Polygon API (if online)
Priority 4: Generated test data (clearly marked)
```

**Implementation**:
1. **Data lineage tracking**:
   ```typescript
   interface MarketData {
     symbol: string;
     prices: Price[];
     metadata: {
       source: 'sqlite' | 'polygon-realtime' | 'polygon-cached' | 'test-generated';
       timestamp: Date;
       isRealData: boolean;
       delay: number; // minutes behind real-time
     }
   }
   ```

2. **Automatic source selection**:
   ```typescript
   async function getMarketData(symbol: string): Promise<MarketData> {
     // Try each source in order
     const sources = [
       () => getFromSQLite(symbol),
       () => getFromRedis(symbol),
       () => getFromPolygon(symbol),
       () => generateTestData(symbol)
     ];

     for (const source of sources) {
       const data = await source();
       if (data) return data;
     }
   }
   ```

**Pros**:
- Never fails to return data
- Clear data providence
- Works offline

**Cons**:
- Complex to implement
- Multiple code paths to maintain

---

## 🎯 My Recommendation: Solution 1 - "Pure Production Mirror"

**Why this is the best approach:**

1. **Eliminates confusion completely** - There's only one type of data: real historical data. No developer will ever wonder "is this real or fake?"

2. **Historical data is perfect for development** - Since you're building trading strategies and analysis tools, having consistent historical data is actually better than live data for development.

3. **Simple mental model** - "Production uses live Polygon, development uses historical snapshot" - that's it.

4. **Safest approach** - No risk of accidental API calls, no risk of mixing test/real trades, no confusion about data sources.

5. **Cost effective** - No API costs during development, no rate limit issues.

**Implementation Plan**:
```bash
# Phase 1: Clean up (THIS WEEK)
- Remove MockProvider completely
- Remove /data/market/ from git, add to .gitignore
- Create sync-market-data.ts script

# Phase 2: Setup clear environments (THIS WEEK)
- Add MARKET_DATA_SOURCE env variable
- Update all API routes to respect this setting
- Add data source indicator to UI footer

# Phase 3: Documentation (NEXT WEEK)
- Document exactly what data is available locally
- Create troubleshooting guide
- Add "symbol not found" helper messages

# Phase 4: Optional enhancements (LATER)
- Add symbol search/autocomplete for available symbols
- Create data quality dashboard
- Add automatic weekly sync reminder
```

## The Anti-Dummy Data Argument

You're right to be skeptical of dummy data. Here's why we should minimize or eliminate it:

1. **False confidence** - Tests pass with dummy data but fail with real data shapes
2. **Maintenance burden** - Dummy data gets out of sync with real data structure
3. **Hidden bugs** - Edge cases in real data aren't represented in dummy data
4. **Context switching** - Developers must remember which mode they're in

The only valid use case for dummy data is:
- **Load testing** - Generating millions of records
- **Edge case testing** - Testing error handling
- **Demo environments** - Where you explicitly want fake data

For TrendDojo, with immutable historical data readily available, dummy data provides no benefit and only adds confusion.

## Next Steps

1. **Immediate**: Add banner to show current data source
2. **This week**: Remove MockProvider, implement Solution 1
3. **Document**: Which symbols are available locally
4. **Long-term**: Consider Polygon Basic tier for extended symbols

The goal: **When a developer runs the app locally, they should never have to think about whether the data is real or fake - it should always be real historical data, clearly labeled as such.**