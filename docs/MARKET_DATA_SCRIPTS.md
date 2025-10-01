# Market Data Scripts

*Created: 2025-01-31*
*Last Updated: 2025-01-31*

## Available Scripts

### Data Download Scripts
These scripts interact with the Polygon API to download market data:

- `npm run polygon-download` - Downloads market data from Polygon API (see `scripts/polygon-download.ts`)
- `npm run polygon-2h` - Downloads 2-hour aggregated data (see `scripts/polygon-download-2h.ts`)

### Data Management Scripts
These scripts manage local SQLite database:

- `npm run market-backup` - Creates backup of market data database
- `npm run market-vacuum` - Optimizes SQLite database (reduces file size)
- `npm run cache:updater` - Updates market data cache

### Production Sync Script
- `./scripts/sync-production-data.sh` - Syncs data from production to local development
  - Options: `--full` for complete sync vs incremental (last 90 days)
  - Methods: Production API or Vercel CLI authentication

## Implementation Details

### Polygon Download Scripts
Located in `/scripts/`:
- `polygon-download.ts` - Main download script for daily market data
- `import-market-data.ts` - Imports data and manages backups
- `sync-production-data.sh` - Shell script for production sync

### Database Location
- Primary: `/data/market/trenddojo.db`
- Historical (legacy): `/data/market/historical_prices.db`
- Backups: `/data/market/backups/`

## Usage Examples

```bash
# Download S&P 500 data from Polygon
npm run polygon-download sp500

# Download specific daily data
npm run polygon-download daily-sp500

# Backup current database
npm run market-backup

# Sync from production (last 90 days)
./scripts/sync-production-data.sh

# Full sync from production
./scripts/sync-production-data.sh --full
```

## Related Documentation
- [Symbol Coverage Strategy](./SYMBOL_COVERAGE_STRATEGY.md) - Universal symbol support plan
- [Active Work Blocks](./docs/_work/ACTIVE_WORK_BLOCKS.md) - Current implementation tasks