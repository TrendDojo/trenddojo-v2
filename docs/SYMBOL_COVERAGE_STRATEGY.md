# Symbol Coverage Strategy

*Created: 2025-01-31*
*Last Updated: 2025-01-31*

## 🎯 Our Philosophy: Support ALL Valid Symbols

TrendDojo supports **ANY valid US stock ticker** that trades on major exchanges (NYSE, NASDAQ). We don't artificially limit users to S&P 500 or any subset. If it trades, we support it.

## Current Implementation Status

### What We Have Now
- **Database**: 100 S&P 500 symbols with historical data (Sept 2020 - Jan 2025)
- **Limitation**: Only these 100 symbols work, others show "Symbol Not Found"
- **Problem**: Users can't trade what they want to trade

### What We're Building
- **Universal Coverage**: Support ANY valid ticker symbol
- **On-Demand Loading**: Fetch data when users request it
- **Smart Caching**: Store frequently accessed symbols locally
- **Live Fallback**: Show current price even without historical data

## Implementation Strategy

### Phase 1: Universal Symbol Validation (NOW)
```typescript
// Validate ANY symbol against Polygon's ticker database
async function validateSymbol(symbol: string) {
  try {
    const details = await polygon.reference.tickerDetails(symbol);
    return {
      valid: true,
      symbol: details.ticker,
      name: details.name,
      exchange: details.exchange,
      type: details.type
    };
  } catch {
    return { valid: false };
  }
}
```

### Phase 2: On-Demand Data Fetching
```typescript
// When user requests symbol not in local database
async function getSymbolData(symbol: string) {
  // Check local first
  const localData = await db.getHistoricalData(symbol);
  if (localData) return localData;

  // Not local? Fetch from Polygon
  const historicalData = await polygon.stocks.aggregates(
    symbol,
    1,
    'day',
    from,
    to
  );

  // Cache for future use
  await db.saveHistoricalData(symbol, historicalData);

  return historicalData;
}
```

### Phase 3: Symbol Search & Discovery
```typescript
// Search ALL available symbols
async function searchSymbols(query: string) {
  const results = await polygon.reference.tickers({
    search: query,
    active: true,
    market: 'stocks',
    limit: 20
  });

  return results.map(r => ({
    symbol: r.ticker,
    name: r.name,
    exchange: r.exchange,
    hasData: db.hasLocalData(r.ticker)
  }));
}
```

## Data Storage Strategy

### Three-Tier Storage
1. **Hot Cache** (SQLite): Frequently accessed symbols with full history
2. **Warm Cache** (PostgreSQL): Recently accessed symbols
3. **Cold Storage** (Polygon API): Everything else fetched on-demand

### Storage Rules
- **Auto-cache**: Any symbol accessed >3 times in 7 days
- **Keep hot**: Top 500 most accessed symbols
- **Purge cold**: Remove symbols not accessed in 90 days (except user positions)

## User Experience

### When User Searches "BQ" (or any symbol):
1. **Validate**: Check if BQ is a real ticker
2. **Display**: Show company info immediately (Boqii Holding Limited)
3. **Fetch**: Get historical data from Polygon
4. **Cache**: Store for future use
5. **Show**: Display full chart and analytics

### No More "Symbol Not Found"
- If it's a valid ticker, we support it
- If we don't have data, we fetch it
- Users can trade ANY stock they want

## API Changes Required

### 1. Symbol Validation Endpoint
```typescript
// GET /api/market-data/validate/:symbol
// Now checks Polygon, not local database
export async function GET(req) {
  const isValid = await polygon.reference.tickerDetails(symbol);
  return { valid: !!isValid, details: isValid };
}
```

### 2. Dynamic Data Endpoint
```typescript
// GET /api/market-data/history/:symbol
// Fetches from Polygon if not cached
export async function GET(req) {
  let data = await db.query(symbol);
  if (!data) {
    data = await fetchFromPolygon(symbol);
    await db.cache(symbol, data);
  }
  return data;
}
```

### 3. Symbol Search Endpoint
```typescript
// GET /api/market-data/search?q=:query
// Searches ALL available symbols
export async function GET(req) {
  const results = await polygon.reference.tickers({
    search: query,
    active: true
  });
  return results;
}
```

## Migration Path

### Step 1: Update Validation (TODAY)
- Change validation to check Polygon API, not local DB
- Remove "Symbol Not Found" error for valid tickers

### Step 2: Add On-Demand Fetching (THIS WEEK)
- Implement Polygon data fetching
- Add caching layer
- Update chart components

### Step 3: Add Symbol Search (NEXT)
- Build search autocomplete
- Show all available symbols
- Indicate which have cached data

### Step 4: Optimize Performance (LATER)
- Pre-fetch popular symbols
- Implement smart caching
- Add data freshness indicators

## Cost Considerations

### Polygon API Limits
- **Free Tier**: 5 API calls/minute
- **Paid Tier**: Unlimited calls
- **Strategy**: Cache aggressively, fetch smartly

### Cost Optimization
- Batch requests where possible
- Cache everything we fetch
- Use websockets for live data
- Prioritize based on user activity

## Success Metrics

### User Experience
- ✅ ANY valid ticker works
- ✅ No artificial limitations
- ✅ Fast response times (<2s for new symbols)
- ✅ Seamless experience

### Technical Metrics
- Cache hit rate >80% for popular symbols
- API calls within rate limits
- Storage costs under control
- Zero "Symbol Not Found" for valid tickers

## Summary

**Old Way**: Limited to 100 pre-loaded S&P 500 symbols
**New Way**: Support EVERY valid US stock ticker

This aligns with TrendDojo's mission: empower traders to trade what they want, when they want, without artificial limitations. We're the platform that says "YES" to any valid trading opportunity.