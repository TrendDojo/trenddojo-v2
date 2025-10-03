# Market Data Strategy

## Current State (As of 2025-09-30)

### 🗄️ Data Storage Architecture

#### Local Development (SQLite)
- **Database**: `/data/market/historical_prices.db`
- **Table**: `daily_prices`
- **Content**: 100 major symbols with 4+ years of historical data (2020-2025)
- **Total Records**: ~107,657 price points
- **Purpose**: Offline development without API dependency

#### Production (PostgreSQL)
- **Database**: Vercel Postgres
- **Table**: `market.price_data`
- **Content**: Currently empty (cron jobs return mock data)
- **Purpose**: Will store real-time and historical market data

### 📊 Data Flow

```
[Polygon API]
     ↓
[API Routes] ──→ [Local SQLite] (dev only)
     ↓
[Vercel Cron] ──→ [PostgreSQL] (production)
     ↓
[Client Apps]
```

### 🔍 Current Issues

1. **Missing Symbols**: Only 100 symbols available locally, causing 404s for others (e.g., APLT)
2. **Production Data**: Cron jobs return mock data, production DB is empty
3. **Data Freshness**: Local data may become stale without updates
4. **API Integration**: Polygon integration incomplete

## Proposed Strategy

### Phase 1: Fix Immediate Issues (NOW)

#### 1.1 Handle Missing Symbols Gracefully
```typescript
// In /api/market-data/history/[symbol]/route.ts
if (!prices || prices.length === 0) {
  // Try to fetch from Polygon API directly
  const liveData = await fetchFromPolygon(symbol, params);
  if (liveData) {
    // Cache for future requests
    await cacheData(liveData);
    return NextResponse.json(liveData);
  }

  // Return informative error
  return NextResponse.json({
    error: 'Symbol not available',
    message: `${symbol} is not in our database. Try major symbols like AAPL, MSFT, GOOGL.`,
    availableSymbols: await getAvailableSymbols()
  }, { status: 404 });
}
```

#### 1.2 Implement Symbol Availability Check
```typescript
// New endpoint: /api/market-data/symbols/available
export async function GET() {
  const symbols = await db.getAvailableSymbols();
  return NextResponse.json({
    symbols,
    count: symbols.length,
    lastUpdated: await db.getLastUpdateTime()
  });
}
```

### Phase 2: Complete Polygon Integration (NEXT)

#### 2.1 Environment Setup
```env
# .env.local
POLYGON_API_KEY=your_key_here
POLYGON_TIER=basic # or developer/advanced
MARKET_DATA_PROVIDER=polygon # or mock for testing
```

#### 2.2 Implement PolygonProvider
```typescript
// /src/lib/market-data/providers/PolygonProvider.ts
class PolygonProvider {
  async getCurrentPrice(symbol: string) {
    // Real-time quote from Polygon
  }

  async getHistoricalData(symbol: string, timeframe: string) {
    // Historical bars from Polygon
  }

  async searchSymbols(query: string) {
    // Symbol search/validation
  }
}
```

#### 2.3 Update Cron Jobs
```typescript
// /api/cron/daily-close/route.ts
async function fetchDailyBars(symbols: string[], date: string) {
  const provider = new PolygonProvider();
  const bars = await provider.getBulkDailyBars(symbols, date);

  // Store in production PostgreSQL
  await db.bulkInsert(bars);

  return bars;
}
```

### Phase 3: Hybrid Data Strategy (LATER)

#### 3.1 Tiered Data Access
```
Priority 1: Memory Cache (1-5 min TTL)
     ↓ miss
Priority 2: Database (SQLite local / PostgreSQL prod)
     ↓ miss
Priority 3: Polygon API (rate limited)
     ↓ success
Cache Result
```

#### 3.2 Smart Symbol Management
- **Core 100**: Pre-loaded, always available
- **Extended 500**: Cached on first request
- **Long Tail**: Fetched on demand from Polygon

#### 3.3 Data Freshness Rules
- **Intraday**: 1-minute cache during market hours
- **After Hours**: 15-minute cache
- **Weekends**: 1-hour cache
- **Historical**: Permanent cache (immutable)

## Implementation Checklist

### Immediate (Fix Current Issues)
- [ ] Add graceful error handling for missing symbols
- [ ] Create symbol availability endpoint
- [ ] Update LocalChart error messages
- [ ] Document available symbols in UI

### Short Term (Polygon Integration)
- [ ] Add Polygon API credentials to env
- [ ] Complete PolygonProvider implementation
- [ ] Update cron jobs to use real data
- [ ] Test with production database

### Long Term (Optimization)
- [ ] Implement tiered caching strategy
- [ ] Add WebSocket support for real-time data
- [ ] Create data quality monitoring
- [ ] Set up automated data validation

## Testing Strategy

### Local Development
```bash
# Test with available symbols
npm run test:chart -- --symbol=AAPL
npm run test:chart -- --symbol=MSFT

# Test missing symbol handling
npm run test:chart -- --symbol=INVALID
```

### Production Verification
```bash
# Verify cron job execution
curl https://www.trenddojo.com/api/cron/daily-close \
  -H "Authorization: Bearer $CRON_SECRET"

# Check data freshness
curl https://www.trenddojo.com/api/market-data/health
```

## Migration Path

1. **Current State**: Local SQLite with 100 symbols
2. **Step 1**: Add Polygon fallback for missing symbols
3. **Step 2**: Populate production PostgreSQL via cron
4. **Step 3**: Unified data layer with smart caching
5. **Final State**: Real-time data with historical archive

## Cost Considerations

### Polygon API Tiers
- **Basic** (Free): 5 API calls/minute, end-of-day data
- **Developer** ($99/mo): 100 calls/minute, 2 years history
- **Advanced** ($299/mo): Unlimited, real-time WebSocket

### Recommended Path
1. Start with Basic tier for development
2. Upgrade to Developer for production launch
3. Move to Advanced when user base justifies cost

## Security Notes

- Never expose API keys in client code
- Rate limit client requests to prevent abuse
- Validate all symbol inputs before API calls
- Log suspicious access patterns
- Use environment-specific credentials