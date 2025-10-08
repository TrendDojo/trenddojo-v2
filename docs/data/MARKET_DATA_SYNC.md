# Market Data Sync System

*Last updated: 2025-10-02*

## Overview

Automated hourly sync of ALL US stock prices (~8000 symbols) from Polygon.io with comprehensive error handling, data validation, and monitoring.

## Features

✅ **ALL US Stocks** - 8000+ symbols with $29/month Polygon Starter plan
✅ **Hourly Updates** - Fresh data every hour (15-min delayed from real-time)
✅ **Unlimited API Calls** - No rate limiting concerns
✅ **Smart Retry Logic** - Automatic retry with exponential backoff
✅ **Data Validation** - Sanity checks prevent corrupt data
✅ **Progress Tracking** - Real-time progress reporting
✅ **Error Recovery** - Continues on failures, logs errors

## Architecture

```
┌─────────────────────────────────────────────────┐
│         Vercel Cron (Hourly: 0 * * * *)        │
└─────────────────┬───────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────┐
│      /api/cron/market-data-sync (route.ts)     │
└─────────────────┬───────────────────────────────┘
                  │
        ┌─────────┴──────────┐
        │                    │
        ▼                    ▼
┌──────────────────┐  ┌──────────────────┐
│ SymbolUniverse   │  │ PriceDownloader  │
│    Manager       │  │                  │
└────────┬─────────┘  └────────┬─────────┘
         │                     │
         ▼                     ▼
┌─────────────────────────────────────┐
│      Polygon.io API (Unlimited)     │
└─────────────────┬───────────────────┘
                  │
                  ▼
┌─────────────────────────────────────┐
│   SQLite Database (historical_      │
│      prices.db)                     │
└─────────────────────────────────────┘
```

## Components

### 1. SymbolUniverseManager
**Location**: `/src/lib/market-data/services/SymbolUniverseManager.ts`

**Responsibilities**:
- Fetch all active US stock symbols from Polygon
- Cache symbol metadata (name, exchange, sector)
- Provide symbol search and validation
- Track symbol status (active/inactive)

**Methods**:
- `refreshSymbolUniverse()` - One-time fetch of all symbols
- `getAllSymbols()` - Get cached symbol list
- `isSymbolValid(symbol)` - Validate symbol exists
- `searchSymbols(query)` - Search by ticker or name

### 2. PriceDownloader
**Location**: `/src/lib/market-data/services/PriceDownloader.ts`

**Responsibilities**:
- Download historical price data in bulk
- Handle errors and retry failures
- Validate data before storage
- Track download progress

**Features**:
- Batch processing with configurable sizes
- Exponential backoff on failures
- Data validation (sanity checks)
- Progress callbacks for monitoring

**Key Methods**:
- `downloadHistorical(options)` - Bulk download date range
- `downloadLatest(symbols)` - Sync latest prices (used by cron)

### 3. Cron Job Handler
**Location**: `/src/app/api/cron/market-data-sync/route.ts`

**Runs**: Every hour at minute 0 (`0 * * * *`)

**Process**:
1. Verify cron authorization (CRON_SECRET)
2. Get all symbols from SymbolUniverseManager
3. Download latest prices for all symbols
4. Store in database with validation
5. Return success/error stats

**Security**: Requires `Authorization: Bearer $CRON_SECRET` header

## Usage

### Local Testing

**Test with 5 symbols (AAPL, MSFT, GOOGL, AMZN, TSLA):**
```bash
npm run market:test
```

Expected output:
```
🧪 Testing Small Sync (5 symbols, last 30 days)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚙️  Progress: 100.0% | Current: TSLA | Completed: 5/5
✅ Download Complete!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 Test Results:
   ✅ Success: 5/5
   ❌ Failed: 0
   📈 Total Records: 150
   ⏱️  Duration: 2.34s
✅ ALL TESTS PASSED!
```

**Manual sync trigger (local):**
```bash
npm run market:sync
```

**Check database stats:**
```bash
npm run market-stats
```

### Production Deployment

**1. Set environment variables in Vercel:**
```bash
POLYGON_API_KEY=your_polygon_api_key
CRON_SECRET=generate_random_secret_here
DATABASE_URL=postgresql://...
```

**2. Deploy to Vercel:**
```bash
git push origin main
```

**3. Verify cron is registered:**
- Go to Vercel Dashboard → Project → Settings → Cron Jobs
- Should see: `/api/cron/market-data-sync` running hourly

**4. Manual trigger (production):**
```bash
CRON_SECRET=your_secret npm run market:sync:prod
```

**5. Monitor logs:**
- Vercel Dashboard → Project → Functions → `/api/cron/market-data-sync`
- Check for errors, success rate, duration

## Configuration

### Vercel Cron Schedule
**File**: `vercel.json`

```json
{
  "crons": [{
    "path": "/api/cron/market-data-sync",
    "schedule": "0 * * * *"
  }]
}
```

**Schedule Options**:
- `0 * * * *` - Every hour at minute 0 (current)
- `*/30 * * * *` - Every 30 minutes
- `0 9-16 * * 1-5` - Every hour 9am-4pm, Mon-Fri (market hours)

### Download Options

Configurable in `PriceDownloader`:

```typescript
{
  batchSize: 50,      // Symbols per batch
  delayMs: 100,       // Delay between requests (ms)
  maxRetries: 3       // Retry attempts on failure
}
```

## Data Validation

**@business-critical: All price data is validated before storage**

**Sanity checks**:
- ✅ All prices must be > 0
- ✅ High >= Low
- ✅ High >= Open, Close
- ✅ Low <= Open, Close
- ✅ Volume >= 0
- ✅ Price < $100k (catches corrupt data)

**Invalid data is rejected** and logged as errors.

## Error Handling

**Retry Strategy**:
1. First attempt fails → wait 1 second
2. Second attempt fails → wait 2 seconds
3. Third attempt fails → log error and continue

**Errors are logged but don't stop the sync**:
- Failed symbols are tracked in `result.errors`
- Successful downloads continue
- Final stats show success/failure counts

## Monitoring

### Success Metrics
- Total symbols synced
- Success rate (should be >95%)
- Total records inserted
- Duration (should be <5 minutes for 8000 symbols)

### Failure Indicators
- Success rate <90% (API issues or bad symbols)
- Duration >10 minutes (performance degradation)
- Repeated failures for same symbols (delisted stocks)

### Database Statistics
Check market data stats anytime (useful for monitoring and debugging):

```bash
# Production
curl https://www.trenddojo.com/api/market-data/stats

# Local (with server running)
curl http://localhost:3002/api/market-data/stats
```

**Response:**
```json
{
  "success": true,
  "stats": {
    "totalSymbols": 8234,
    "totalRecords": 4299279,
    "dateRange": {
      "earliest": "2020-01-02",
      "latest": "2025-01-24"
    },
    "lastSync": "2025-01-24T15:30:00.000Z",
    "status": "healthy"
  },
  "timestamp": "2025-01-24T16:00:00.000Z"
}
```

**Endpoint**: `/api/market-data/stats`
- Queries sequentially to avoid connection pooling issues
- Shows total symbols, records, date range, and last sync time
- Useful for verifying cron job is working

## Cost Analysis

**Polygon Starter Plan: $29/month**
- ✅ Unlimited API calls
- ✅ 8000+ symbols supported
- ✅ 5 years historical data
- ✅ 15-minute delayed quotes

**Estimated usage**:
- Hourly sync: 8000 symbols × 24 hours = 192,000 API calls/day
- Monthly: ~5.7 million API calls/month
- **Cost per million calls: ~$0.005** (essentially free)

## Troubleshooting

### "Unauthorized" error
- Check `CRON_SECRET` is set in Vercel
- Verify Authorization header is correct
- For local testing, CRON_SECRET is optional

### "No data returned from API"
- Symbol may be delisted or invalid
- Check Polygon API status
- Verify API key is valid

### Slow sync times
- Increase `batchSize` to 100
- Decrease `delayMs` to 50
- Check database performance

### Duplicate key errors
- Enable `skipDuplicates: true` (already enabled)
- Check for concurrent sync jobs

## Future Enhancements

1. **Smart Tiering** - Update high-liquidity stocks more frequently
2. **User Watchlists** - Prioritize user-specific symbols
3. **Intraday Data** - Add 5-minute bar support
4. **WebSocket Streaming** - Real-time updates for active positions
5. **Multi-Source** - Fallback to Yahoo Finance if Polygon fails

## Security

- ✅ API keys stored in environment variables (never committed)
- ✅ Cron endpoint protected with CRON_SECRET
- ✅ Data validation prevents SQL injection
- ✅ Rate limiting (even though unlimited)
- ✅ Error messages don't expose sensitive data

## Performance

**Current benchmarks** (5 symbols, 30 days):
- Download: ~2-3 seconds
- Storage: <100ms
- Validation: <10ms per symbol

**Projected** (8000 symbols, hourly):
- Download: ~3-5 minutes
- Storage: <5 seconds
- Total: <5 minutes per sync

---

**Questions? Check `/docs/MARKET_DATA_SYSTEM.md` for full architecture details.**
