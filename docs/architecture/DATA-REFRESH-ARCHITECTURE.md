# Data Refresh Architecture

## Overview
TrendDojo uses a **1-minute bulk update strategy** that fetches all market data in a single API call, enabling near real-time stop loss monitoring while maintaining simplicity.

## Core Strategy: Fetch Everything, Every Minute

### The Key Insight
```typescript
// Both of these cost 1 API call to Polygon:
fetchOneSymbol('AAPL');     // 1 call, 1 symbol
fetchAllSymbols();          // 1 call, 8000+ symbols

// So we ALWAYS fetch all
```

### Architecture Components

```
┌─────────────────────────────────────────────────┐
│                  Polygon.io API                  │
│                 (1 call/minute)                  │
└────────────────────┬────────────────────────────┘
                     │
                     ▼ Bulk Snapshot
┌─────────────────────────────────────────────────┐
│              MarketDataCache Service             │
│            (Runs every 60 seconds)               │
└─────────┬──────────┬──────────┬─────────────────┘
          │          │          │
          ▼          ▼          ▼
    ┌─────────┐ ┌─────────┐ ┌─────────┐
    │  Cache  │ │  Stop   │ │Historical│
    │  Update │ │  Loss   │ │  Queue  │
    │         │ │  Check  │ │         │
    └─────────┘ └─────────┘ └─────────┘
          │          │          │
          ▼          ▼          ▼
    PostgreSQL  Notifications  SQLite
```

## Implementation Details

### 1. Bulk Update Service
**File**: `src/lib/market-data/cache/MarketDataCache.ts`

- Fetches ALL tickers every minute during market hours
- Single API call returns 8000+ symbols
- Updates PostgreSQL cache with 2-minute TTL
- Enables 1-minute stop loss monitoring

### 2. Cache Schema
**File**: `src/lib/market-data/cache/CacheSchema.sql`

```sql
market_data_cache: Stores current snapshot data
historical_write_queue: Queues data for SQLite storage
stop_loss_checks: Tracks active stop losses
bulk_update_log: Monitoring and debugging
```

### 3. Data Flow

**Real-time Path** (User viewing page):
1. Check PostgreSQL cache (max 1 minute old)
2. Return immediately (no API call)
3. Track access for analytics

**Historical Path** (End of day):
1. Process historical_write_queue
2. Consolidate intraday to daily bars
3. Store permanently in SQLite

### 4. Stop Loss Monitoring
With 1-minute updates, stop losses are checked every 60 seconds:
- Maximum delay: 60 seconds
- Suitable for swing traders
- Not suitable for day traders
- Clear disclaimers required

## Performance Characteristics

### API Usage
```
Market hours: 9:30 AM - 4:00 PM = 390 minutes
API calls: 390 calls/day
Polygon Basic limit: 100 calls/minute
Usage: < 0.5% of limit
```

### Response Times
```
Cache hit: ~10ms (PostgreSQL)
Cache miss: Impossible during market hours
Bulk update: ~700ms for 8000 symbols
Stop loss check: ~50ms for 100 positions
```

### Storage
```
Cache size: ~4MB for 8000 symbols
Daily growth: ~50MB in historical queue
Long-term: ~240KB per symbol (10 years)
```

## Configuration

### Environment Variables
```env
POLYGON_API_KEY=your_key_here
POLYGON_TIER=basic  # basic|pro|enterprise
UPDATE_INTERVAL=60000  # milliseconds
CACHE_TTL=120  # seconds
```

### Market Hours Detection
The system automatically detects market hours and only updates during:
- Monday-Friday
- 9:30 AM - 4:00 PM ET
- Adjusts for holidays (when implemented)

## Monitoring

### Key Metrics
- Cache hit rate (target: >99%)
- Update duration (target: <1 second)
- Stop losses checked per minute
- Queue backlog size

### Health Checks
```typescript
GET /api/market-data/cache-status

{
  "lastUpdate": "2024-01-26T14:30:00Z",
  "nextUpdate": "2024-01-26T14:31:00Z",
  "cachedSymbols": 8234,
  "stopLossesActive": 42,
  "queueBacklog": 0
}
```

## Advantages of This Approach

1. **Simplicity**: One cron job, no complex caching logic
2. **Reliability**: Everything always fresh (max 1 minute old)
3. **Stop Losses**: 1-minute monitoring becomes viable
4. **Cost Effective**: 390 API calls/day well under limits
5. **Scalable**: Same cost for 1 user or 1000 users

## Trade-offs

1. **Bandwidth**: ~4MB every minute (negligible)
2. **Storage writes**: 8000 updates/minute (PostgreSQL handles easily)
3. **Overkill**: Fetching unused symbols (but same API cost)

## Future Enhancements

1. **Adaptive frequency**: Increase to 30-second updates for volatile markets
2. **Smart filtering**: Only store symbols with >100K volume
3. **WebSocket push**: Real-time updates for watched symbols
4. **Tiered monitoring**: More frequent checks for positions near stops

## Summary

This architecture prioritizes **simplicity and reliability** over optimization. By fetching everything every minute, we eliminate cache complexity, enable stop loss monitoring, and provide consistent sub-minute data freshness - all for the cost of Polygon Basic ($29/month).