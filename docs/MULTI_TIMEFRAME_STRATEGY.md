# Multi-Timeframe Data Strategy

## Current State

You're right - we DO have infrastructure for different timeframes:

### What Exists Now
```
Tables in SQLite:
- daily_prices: 100 symbols, 5 years of daily OHLCV ✅
- intraday_2h_prices: ONLY AAPL, 3 months of 2-hour bars (Jan-Apr 2023) ⚠️
- latest_prices: Current/last known prices
- stock_metadata: Symbol information
```

### Current Limitations
- LocalChart only shows **date ranges** (1M, 3M, 6M, 1Y) not **bar intervals**
- API only fetches daily data
- No UI for switching between timeframes (1min, 5min, 1h, 1d)
- Intraday data is old and incomplete

## The Challenge: Multi-Timeframe Architecture

### Storage Requirements by Timeframe
```
Per Symbol, Per Year:
- 1-minute bars: ~100,000 records (390 bars/day × 252 days)
- 5-minute bars: ~20,000 records
- 15-minute bars: ~6,500 records
- 1-hour bars: ~1,600 records
- Daily bars: ~252 records ✅ (what we have)

For 100 symbols:
- 1-minute: 10 MILLION records/year 😱
- Daily: 25,200 records/year ✅
```

## Proposed Solution: Hybrid Timeframe Strategy

### 1. Smart Data Tiering
```
┌─────────────────────────────────────┐
│         LIVE/RECENT                 │
│  1min, 5min (last 5 days only)      │
│  → Fetched on-demand from Polygon   │
└─────────────────────────────────────┘
                ↓
┌─────────────────────────────────────┐
│       SHORT-TERM CACHE              │
│  15min, 1h (last 30 days)           │
│  → Stored in separate tables        │
└─────────────────────────────────────┘
                ↓
┌─────────────────────────────────────┐
│      LONG-TERM ARCHIVE              │
│  Daily, Weekly (5+ years)           │
│  → Already have this ✅              │
└─────────────────────────────────────┘
```

### 2. Database Schema Updates

```sql
-- For 15-minute bars (reasonable storage)
CREATE TABLE IF NOT EXISTS intraday_15min_prices (
  symbol TEXT NOT NULL,
  timestamp INTEGER NOT NULL,
  open REAL NOT NULL,
  high REAL NOT NULL,
  low REAL NOT NULL,
  close REAL NOT NULL,
  volume INTEGER NOT NULL,
  PRIMARY KEY (symbol, timestamp)
);

-- For 1-hour bars
CREATE TABLE IF NOT EXISTS hourly_prices (
  symbol TEXT NOT NULL,
  timestamp INTEGER NOT NULL,
  open REAL NOT NULL,
  high REAL NOT NULL,
  low REAL NOT NULL,
  close REAL NOT NULL,
  volume INTEGER NOT NULL,
  PRIMARY KEY (symbol, timestamp)
);
```

### 3. Chart Integration Strategy

#### A. Unified API Endpoint
```typescript
// /api/market-data/bars/[symbol]/route.ts
export async function GET(request: NextRequest) {
  const { interval, from, to } = params;

  switch(interval) {
    case '1m':
    case '5m':
      // Fetch from Polygon directly (don't store)
      return await fetchIntradayFromPolygon(symbol, interval);

    case '15m':
    case '1h':
      // Check cache first, then Polygon
      return await getCachedOrFetch(symbol, interval);

    case '1d':
    case '1w':
      // Use existing daily_prices table
      return await getFromDatabase(symbol, interval);
  }
}
```

#### B. Smart Chart Component
```typescript
// Enhanced LocalChart.tsx
const TIMEFRAME_CONFIG = {
  // Intraday (fetch live)
  '1m': { label: '1 Min', type: 'intraday', maxDays: 5 },
  '5m': { label: '5 Min', type: 'intraday', maxDays: 5 },

  // Short-term (cached)
  '15m': { label: '15 Min', type: 'cached', maxDays: 30 },
  '1h': { label: '1 Hour', type: 'cached', maxDays: 90 },

  // Long-term (stored)
  '1d': { label: 'Daily', type: 'stored', maxDays: 1825 },
  '1w': { label: 'Weekly', type: 'stored', maxDays: 3650 }
};

// Visual indicator of data source
<div className="text-xs">
  {timeframe.type === 'intraday' && '🔴 Live Data'}
  {timeframe.type === 'cached' && '🟡 Cached'}
  {timeframe.type === 'stored' && '🟢 Historical'}
</div>
```

### 4. Data Merging for Seamless Experience

```typescript
// When switching timeframes, intelligently merge data
function mergeTimeframeData(dailyData: Bar[], intradayData: Bar[]) {
  // For today's incomplete daily bar
  const today = new Date().toISOString().split('T')[0];
  const todayDaily = dailyData.find(d => d.date === today);

  if (!todayDaily && intradayData.length > 0) {
    // Create synthetic daily bar from intraday
    const syntheticDaily = {
      date: today,
      open: intradayData[0].open,
      high: Math.max(...intradayData.map(d => d.high)),
      low: Math.min(...intradayData.map(d => d.low)),
      close: intradayData[intradayData.length - 1].close,
      volume: intradayData.reduce((sum, d) => sum + d.volume, 0)
    };

    return [...dailyData, syntheticDaily];
  }

  return dailyData;
}
```

### 5. Implementation Phases

#### Phase 1: NOW - Add Timeframe Buttons
```typescript
// Just UI, still using daily data
['1D', '5D', '1M', '3M', '6M', '1Y'] // Date ranges

// Becomes:
['1m', '5m', '15m', '1h', '4h', '1D'] // Bar intervals
```

#### Phase 2: NEXT - Hourly Data
- Add hourly_prices table
- Fetch last 90 days of hourly from Polygon
- Cache locally for development
- Test switching between daily/hourly

#### Phase 3: LATER - Intraday Live
- Connect to Polygon real-time for 1m/5m
- Don't store (too much data)
- Show "Live" indicator
- WebSocket for real-time updates

## Storage Optimization

### What to Store Locally (Dev)
```
✅ Daily: All symbols, 5 years
✅ Hourly: Top 20 symbols, 90 days
⚠️ 15-min: Top 10 symbols, 30 days
❌ 1-min, 5-min: Never store (fetch live)
```

### Production Strategy
```
- Daily: PostgreSQL, permanent
- Hourly: PostgreSQL with 6-month retention
- Intraday: Redis cache, 24-hour TTL
- Real-time: WebSocket, no storage
```

## The Key Insight

**Don't try to store everything!**

- **Long timeframes** (daily/weekly): Store everything
- **Medium timeframes** (1h/4h): Cache recent data
- **Short timeframes** (1m/5m): Fetch on-demand
- **Smart merging**: Combine timeframes seamlessly

This gives traders the multi-timeframe analysis they need without exploding your storage or complexity.

## Next Steps

1. **Add interval selector to chart UI** (visual only first)
2. **Create hourly data endpoint** (test with AAPL)
3. **Implement smart data source routing**
4. **Add visual indicators for data freshness/source**

The goal: Seamless timeframe switching that "just works" without users thinking about where the data comes from.