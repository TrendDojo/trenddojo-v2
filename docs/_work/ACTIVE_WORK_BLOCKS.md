# Active Work Blocks - TrendDojo

## WB-2025-01-31-001: Implement Universal Symbol Support
**State**: confirmed
**Timeframe**: NOW
**Created**: 2025-01-31 00:00
**Dependencies**: None
**Tags**: #market-data #api #core-feature

### Goal
Remove artificial symbol limitations. Support ANY valid US stock ticker that trades on NYSE/NASDAQ. If it trades, we support it.

### Problem
- Currently limited to 100 pre-loaded S&P 500 symbols
- User searches "BQ" → Gets "Symbol Not Found"
- This is wrong - BQ is a valid ticker (Boqii Holding Limited)
- We're artificially limiting what users can trade

### Solution

#### Phase 1: Fix Symbol Validation (IMMEDIATE)
- [ ] Update `/api/market-data/validate/[symbol]` to check Polygon API
- [ ] Remove dependency on local database for validation
- [ ] Return company info even without historical data

#### Phase 2: On-Demand Data Fetching (TODAY)
- [ ] Implement Polygon data fetching when symbol not in cache
- [ ] Add to `/api/market-data/history/[symbol]` endpoint
- [ ] Cache fetched data in SQLite for future use
- [ ] Show loading state while fetching

#### Phase 3: Symbol Search (THIS WEEK)
- [ ] Create `/api/market-data/search` endpoint
- [ ] Search ALL available symbols via Polygon
- [ ] Add autocomplete component to UI
- [ ] Show which symbols have cached data

### Technical Implementation

```typescript
// New validation approach
async function validateSymbol(symbol: string) {
  // First check cache
  const cached = await db.hasSymbol(symbol);
  if (cached) return { valid: true, source: 'cache' };

  // Not cached? Check Polygon
  try {
    const details = await polygon.reference.tickerDetails(symbol);
    return {
      valid: true,
      source: 'polygon',
      details
    };
  } catch {
    return { valid: false };
  }
}
```

### Success Criteria
- [ ] ANY valid ticker works (test with BQ, NVDA, random symbols)
- [ ] No "Symbol Not Found" for valid tickers
- [ ] Data fetches on-demand from Polygon
- [ ] Cached data loads instantly
- [ ] Search returns all available symbols

### Notes
- Keep the 100 S&P 500 symbols as pre-cached "hot" data
- Everything else fetches on demand
- This aligns with our mission: no artificial limitations

---

## WB-2025-01-30-001: Implement Dev Data Sync System
**State**: confirmed
**Timeframe**: NEXT
**Created**: 2025-01-30 15:45
**Dependencies**: None
**Tags**: #data #infrastructure #dev-environment

### Goal
Create a simple, automated data sync system that keeps development SQLite database current with production data, with clear visual indicators of data freshness.

### Requirements

#### Core Features
1. **Auto-sync on `npm run dev` start** (if data >24 hours old)
   - Check last sync timestamp
   - If stale, prompt user: "Data is X days old. Sync now? (Y/n)"
   - Default to Yes after 5 seconds

2. **Visual indicator in header** (dev environment only)
   - Shows data age with color coding:
     - 🟢 Green: <24 hours old
     - 🟡 Yellow: 24-48 hours old
     - 🔴 Red: >48 hours old
   - Format: "📊 Data: 2 hours ago"
   - One-click [Sync Now] button when yellow/red

3. **Read-only enforcement** for dev database
   - Prevent any writes to local SQLite
   - Throw clear error if write attempted

4. **Remove database from Git**
   - Remove `/data/market/historical_prices.db` from repo
   - Update `.gitignore` ✅ (already done)

### Implementation Plan

#### Step 1: Remove DB from Git
```bash
git rm --cached data/market/historical_prices.db
git commit -m "fix: Remove market database from version control"
```

#### Step 2: Create sync infrastructure
- `scripts/sync-market-data.ts` - Main sync script
- `scripts/check-data-freshness.ts` - Check if sync needed
- `lib/market-data/sync-metadata.ts` - Track sync state

#### Step 3: Add to package.json
```json
{
  "scripts": {
    "dev": "npm run data:check && next dev",
    "data:check": "tsx scripts/check-data-freshness.ts",
    "data:sync": "tsx scripts/sync-market-data.ts"
  }
}
```

#### Step 4: Create DataSyncStatus component
```tsx
// components/layout/DataSyncStatus.tsx
// - Shows data age
// - Color coding
// - Sync button
// - Only renders in development
```

#### Step 5: Add to AppLayout header
- Place next to GlobalRefreshIndicator
- Only show when NODE_ENV === 'development'

### Technical Details

#### Metadata Storage
Store sync metadata in SQLite:
```sql
CREATE TABLE IF NOT EXISTS sync_metadata (
  id INTEGER PRIMARY KEY,
  last_sync_at TIMESTAMP,
  data_through_date DATE,
  symbols_count INTEGER,
  records_count INTEGER,
  source TEXT DEFAULT 'production'
);
```

#### Sync Process
1. Connect to production PostgreSQL (read-only)
2. Get max date from local SQLite
3. Fetch all records after that date
4. Insert into local SQLite
5. Update metadata table
6. Show success notification

#### Read-Only Enforcement
```typescript
// In MarketDatabase constructor
if (process.env.NODE_ENV === 'development') {
  this.readonly = true;
  // Override all write methods
  this.insert = () => {
    throw new Error('Cannot write to development database - sync from production instead');
  };
}
```

### Success Criteria
- [ ] Database removed from Git
- [ ] Sync runs automatically when data >24 hours old
- [ ] Visual indicator shows correct data age
- [ ] Manual sync works via button click
- [ ] Dev database is read-only
- [ ] Clear error messages for write attempts

### Notes
- Keep it simple - no complex scheduling
- Focus on the 24-hour check at startup
- Don't over-engineer - we just need fresh-enough data for development
- Production always remains the source of truth