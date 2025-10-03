# Immediate Action Plan - Data Architecture Cleanup

## 🚨 Critical Issue Found
**The 20MB SQLite database is committed to the repository!** This needs immediate attention.

## Immediate Actions (Do Now)

### Step 1: Remove database from Git tracking
```bash
# Remove from git but keep the file locally
git rm --cached data/market/historical_prices.db

# Commit this change
git commit -m "fix: Remove market database from version control

Database should not be in repo:
- Contains 20MB of market data
- Binary files don't belong in Git
- Each developer should sync their own copy"
```

### Step 2: Update .gitignore (✅ Already done)
Added to .gitignore:
- `data/market/`
- `*.db`
- `*.sqlite`
- `*.sqlite3`

### Step 3: Create sync script
Create `scripts/sync-market-data.ts` that:
1. Downloads latest symbols from production
2. Populates local SQLite
3. Shows progress to developer

### Step 4: Add data source indicator
In the app footer or header, show:
```typescript
{process.env.NODE_ENV === 'development' && (
  <div className="text-xs text-gray-500">
    Data: Local SQLite (100 symbols, updated {lastSyncDate})
  </div>
)}
```

## This Week's Tasks

1. **Monday**: Remove database from git
2. **Tuesday**: Create sync script
3. **Wednesday**: Remove MockProvider entirely
4. **Thursday**: Add clear error messages for missing symbols
5. **Friday**: Document available symbols

## Quick Wins (Can do immediately)

1. **Better error message** in `/api/market-data/history/[symbol]/route.ts`:
```typescript
if (!prices || prices.length === 0) {
  // Check if symbol exists at all
  const availableSymbols = db.getAvailableSymbols();

  return NextResponse.json({
    error: `Symbol ${symbol} not found in local database`,
    message: 'Local development has 100 major symbols. Try: AAPL, MSFT, GOOGL, AMZN, TSLA',
    availableSymbols: availableSymbols.slice(0, 10), // Show first 10
    totalAvailable: availableSymbols.length
  }, { status: 404 });
}
```

2. **Add helper script** in `package.json`:
```json
{
  "scripts": {
    "data:list": "tsx scripts/list-available-symbols.ts",
    "data:sync": "tsx scripts/sync-market-data.ts",
    "data:check": "tsx scripts/check-data-freshness.ts"
  }
}
```

## The Path Forward

### Phase 1: Clean up confusion (THIS WEEK)
- ✅ Added .gitignore entries
- ⏳ Remove DB from git
- ⏳ Remove MockProvider
- ⏳ Clear error messages

### Phase 2: Better dev experience (NEXT WEEK)
- Symbol autocomplete
- Data freshness indicator
- Sync reminders
- Available symbols list in UI

### Phase 3: Production readiness (LATER)
- Complete Polygon integration
- Implement cron jobs properly
- Add monitoring/alerts
- Document deployment process

## Remember

**The goal**: Developers should never wonder "is this real data?" - it should always be real historical data, clearly marked as such.

**The principle**: Production uses live Polygon API. Development uses historical snapshot. Simple, clear, no confusion.