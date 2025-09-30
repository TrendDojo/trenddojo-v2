# Active Work Blocks - TrendDojo

## WB-2025-01-30-001: Implement Dev Data Sync System
**State**: confirmed
**Timeframe**: NOW
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

---

## WB-2025-01-30-002: Fix Chart Timeframe Date Handling
**State**: completed
**Timeframe**: NOW
**Created**: 2025-01-30 14:00
**Completed**: 2025-01-30 14:30
**Tags**: #charts #bug-fix

### Goal
Fix hardcoded 2024 dates in LocalChart component causing failures in 2025

### Tasks
- [x] Remove hardcoded '2024-12-31' dates
- [x] Use dynamic current date instead
- [x] Test with multiple symbols
- [x] Deploy fix

### Notes
- Fixed by using `new Date()` instead of hardcoded dates
- Deployed in commit 88bdfbd

---

## WB-2025-01-30-003: Update UI Theme Elements
**State**: completed
**Timeframe**: NOW
**Created**: 2025-01-30 15:00
**Completed**: 2025-01-30 15:30
**Tags**: #ui #theme

### Goal
Update breadcrumb and alert components to match live theme

### Tasks
- [x] Change breadcrumb icon from Home to Gauge
- [x] Make dashboard icon larger and thicker
- [x] Update alert styling to use live theme colors
- [x] Fix breadcrumb links to use /app/ prefix

### Notes
- Breadcrumb now uses same Gauge icon as sidebar
- Alert uses proper red color scheme with dark mode support
- All navigation links properly routed through /app/