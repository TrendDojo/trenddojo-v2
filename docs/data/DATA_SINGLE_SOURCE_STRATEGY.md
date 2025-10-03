# Data Single Source Strategy - TrendDojo

## Current Reality Check

### How Data Currently Flows
```
Charts/UI → /api/market-data/history/[symbol] → MarketDatabase → SQLite (local) or PostgreSQL (prod)
                                                                    ↓
                                                            Returns historical data only
```

**Critical Finding**: There is NO merging of live and historical data currently happening. Charts simply request a date range of historical data.

### The Problems
1. **No environment switching** - Same code path for dev/prod, just different DBs
2. **No data freshness** - Local SQLite is static (last updated when?)
3. **No live data integration** - Charts only show historical, no real-time
4. **Uncontrolled versioning** - Dev and prod data can diverge silently

## Proposed Solution: "Single Source of Truth with Controlled Mirroring"

### Core Principles
1. **Production IS the single source of truth** - All data flows FROM production
2. **Development uses read-only mirrors** - Can't corrupt production
3. **Explicit data lineage** - Always know where data came from and when
4. **No parallel versions** - Dev data is always a snapshot of production

### Architecture

```
┌─────────────────────────────────────┐
│         PRODUCTION (LIVE)           │
│                                      │
│  Polygon API → PostgreSQL → API     │
│      ↓              ↓                │
│  Real-time     Historical            │
│                                      │
└──────────────┬──────────────────────┘
               │
               │ Daily Export (Automated)
               ↓
┌─────────────────────────────────────┐
│      DEVELOPMENT MIRROR              │
│                                      │
│  SQLite (Read-Only Copy)            │
│  - Last sync: [timestamp]           │
│  - Data through: [date]             │
│  - Symbols: [count]                 │
│                                      │
└──────────────────────────────────────┘
```

### Implementation Details

#### 1. Environment Configuration
```typescript
// config/dataSource.ts
export const getDataSource = () => {
  const env = process.env.NODE_ENV;
  const dataMode = process.env.DATA_MODE; // 'live' | 'mirror' | 'test'

  if (env === 'production') {
    return {
      type: 'postgresql',
      source: 'polygon-live',
      readonly: false,
      description: 'Live Production Data'
    };
  }

  // Development
  return {
    type: 'sqlite',
    source: 'production-mirror',
    readonly: true, // CRITICAL: Can't write to dev DB
    lastSync: getLastSyncTime(),
    dataThrough: getDataCutoffDate(),
    description: `Historical Mirror (${getDataAge()} old)`
  };
};
```

#### 2. Data Sync Mechanism
```typescript
// scripts/sync-from-production.ts
export async function syncFromProduction() {
  // Step 1: Connect to production (read-only)
  const prodDb = await connectToProduction({ readonly: true });

  // Step 2: Get latest data checkpoint
  const lastLocalDate = await getLastLocalDataDate();
  const cutoffDate = new Date(); // Today

  // Step 3: Export incremental data
  const newData = await prodDb.exportRange(lastLocalDate, cutoffDate);

  // Step 4: Import to local SQLite
  await localDb.importData(newData, {
    mode: 'append',
    validate: true,
    metadata: {
      syncedAt: new Date(),
      fromEnvironment: 'production',
      dataRange: { from: lastLocalDate, to: cutoffDate }
    }
  });

  // Step 5: Verify integrity
  const checksum = await verifyDataIntegrity();

  return { success: true, recordsAdded: newData.length, checksum };
}
```

#### 3. Data Freshness Indicators
```typescript
// components/DataSourceIndicator.tsx
export function DataSourceIndicator() {
  const dataSource = useDataSource();

  if (dataSource.type === 'production') {
    return (
      <div className="bg-green-100 text-green-800 px-2 py-1 text-xs">
        ✓ Live Data
      </div>
    );
  }

  const ageInDays = getDataAge(dataSource.lastSync);
  const alertLevel = ageInDays > 7 ? 'warning' : 'info';

  return (
    <div className={`bg-${alertLevel}-100 text-${alertLevel}-800 px-2 py-1 text-xs`}>
      📊 Historical Data (Last sync: {ageInDays} days ago)
      {ageInDays > 7 && (
        <button onClick={promptForSync}>Sync Now</button>
      )}
    </div>
  );
}
```

#### 4. API Route Protection
```typescript
// app/api/market-data/history/[symbol]/route.ts
export async function GET(request: NextRequest) {
  const dataSource = getDataSource();

  // In development, ensure we're in read-only mode
  if (dataSource.readonly) {
    const db = new MarketDatabase({ readonly: true });

    // Add metadata to response
    const data = await db.getHistory(symbol);

    return NextResponse.json({
      data,
      metadata: {
        source: dataSource.description,
        lastSync: dataSource.lastSync,
        dataThrough: dataSource.dataThrough,
        isLive: false
      }
    });
  }

  // Production path...
}
```

### Preventing Data Corruption

#### 1. Read-Only Enforcement
```typescript
// lib/market-data/database/MarketDatabase.ts
export class MarketDatabase {
  constructor(options: { readonly?: boolean }) {
    if (options.readonly) {
      // Override all write methods
      this.insert = () => { throw new Error('Database is read-only in development'); };
      this.update = () => { throw new Error('Database is read-only in development'); };
      this.delete = () => { throw new Error('Database is read-only in development'); };
    }
  }
}
```

#### 2. Automated Sync Schedule
```json
// package.json
{
  "scripts": {
    "dev": "npm run data:check && next dev",
    "data:check": "tsx scripts/check-data-freshness.ts",
    "data:sync": "tsx scripts/sync-from-production.ts",
    "data:verify": "tsx scripts/verify-data-integrity.ts"
  }
}
```

#### 3. Git Hooks for Data Protection
```bash
# .husky/pre-commit
#!/bin/sh

# Ensure no database files are being committed
if git diff --cached --name-only | grep -E '\.(db|sqlite|sqlite3)$'; then
  echo "❌ ERROR: Database files cannot be committed to Git"
  echo "Remove with: git rm --cached <file>"
  exit 1
fi
```

### Handling Live vs Historical Data

Since charts currently only show historical data, we have two options:

#### Option A: Keep It Simple (Recommended)
- Development shows historical data only (up to last sync)
- Production shows historical + today's live data
- Clear indicator of data freshness

#### Option B: Simulated Live Data
```typescript
// In development only
function addSimulatedLiveData(historicalData: Price[]) {
  const lastPrice = historicalData[historicalData.length - 1];
  const today = new Date();

  // Add simulated "live" candle for today
  if (lastPrice.date < today) {
    historicalData.push({
      date: today,
      open: lastPrice.close,
      high: lastPrice.close * 1.01,
      low: lastPrice.close * 0.99,
      close: lastPrice.close * (1 + (Math.random() - 0.5) * 0.02),
      volume: lastPrice.volume,
      metadata: { simulated: true }
    });
  }

  return historicalData;
}
```

### Migration Path

#### Week 1: Foundation
1. Remove SQLite from Git ✅
2. Add read-only enforcement to dev database
3. Create sync script
4. Add data freshness indicators

#### Week 2: Automation
1. Automate daily sync from production
2. Add integrity checks
3. Create sync monitoring dashboard

#### Week 3: Documentation
1. Document sync process
2. Create troubleshooting guide
3. Train team on new workflow

### Benefits

1. **Zero Risk of Wrong Data**
   - Dev always uses production snapshots
   - Read-only prevents corruption
   - Clear indicators of data age

2. **Simple Mental Model**
   - Production = Live
   - Development = Historical Mirror
   - No confusion about data source

3. **Automatic Freshness**
   - Daily syncs keep dev current
   - Warnings when data is stale
   - One command to update

4. **No Parallel Versions**
   - Single source of truth (production)
   - Dev is always a subset of prod
   - No divergence possible

### The Critical Rules

1. **NEVER write to development database** - It's read-only
2. **ALWAYS sync from production** - Never the other way
3. **ALWAYS show data lineage** - Users must know if data is live or historical
4. **NEVER mix test and real data** - Use separate test database for unit tests

## Summary

**Current Problem**: Uncontrolled parallel data versions with no sync mechanism

**Solution**: Production-to-development one-way sync with read-only enforcement

**Result**: Zero risk of incorrect data, always know data freshness, simple to understand