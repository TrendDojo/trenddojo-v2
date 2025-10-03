# Data Sync Setup

*Created: 2025-01-30*
*Last Updated: 2025-01-30*

## Overview
This document explains how to set up and manage market data synchronization between production and local development for TrendDojo.

## Database Files
The following database files are used locally but NOT tracked in git:
- `data/market/trenddojo.db` - Primary SQLite database with daily price data
- `data/market/historical_prices.db` - Legacy database (can be removed)
- `data/market_data.db` - Legacy database (can be removed)

## Initial Setup - SECURE Methods

### Method 1: Production API (Recommended - No Credentials)
```bash
# Sync via public API endpoint
npm run data:sync

# The script will prompt you to choose:
# 1) Production API (no credentials needed)
# 2) Vercel CLI (requires login)
```

### Method 2: Vercel CLI (Secure Authentication)
```bash
# One-time setup
npm i -g vercel
vercel login

# Sync using secure credentials (never stored locally)
npm run data:sync
# Choose option 2 when prompted
```

### Verify Data
```bash
# Check database statistics
npm run market-stats
```

### ⚠️ NEVER Store Production Credentials Locally
- **DO NOT** put DATABASE_URL in .env files
- **DO NOT** commit credentials to git
- Use API endpoint or Vercel CLI for secure access

## Database Structure

### Main Table: daily_prices
```sql
CREATE TABLE daily_prices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    symbol TEXT NOT NULL,
    date TEXT NOT NULL,
    open REAL NOT NULL,
    high REAL NOT NULL,
    low REAL NOT NULL,
    close REAL NOT NULL,
    volume INTEGER,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(symbol, date)
);

CREATE INDEX idx_symbol ON daily_prices(symbol);
CREATE INDEX idx_date ON daily_prices(date);
CREATE INDEX idx_symbol_date ON daily_prices(symbol, date);
```

## Data Management Scripts

### Check Database Status
```bash
# Check database size and row count
sqlite3 data/market/trenddojo.db "SELECT COUNT(*) as row_count FROM daily_prices;"
sqlite3 data/market/trenddojo.db "SELECT COUNT(DISTINCT symbol) as symbol_count FROM daily_prices;"
sqlite3 data/market/trenddojo.db "SELECT MIN(date) as earliest, MAX(date) as latest FROM daily_prices;"
```

### Export Data (for backup)
```bash
# Export to CSV
sqlite3 -header -csv data/market/trenddojo.db "SELECT * FROM daily_prices;" > data/exports/daily_prices_backup.csv

# Create SQL dump
sqlite3 data/market/trenddojo.db .dump > data/exports/trenddojo_backup.sql
```

### Import Data
```bash
# From SQL dump
sqlite3 data/market/trenddojo.db < data/exports/trenddojo_backup.sql

# From CSV
sqlite3 data/market/trenddojo.db <<EOF
.mode csv
.import data/exports/daily_prices.csv daily_prices
EOF
```

## Sharing Databases with Team

### Creating a Shareable Archive
```bash
# Compress database for sharing
tar -czf trenddojo_db_$(date +%Y%m%d).tar.gz data/market/trenddojo.db

# Or create a smaller sample
sqlite3 data/market/trenddojo.db <<EOF
ATTACH DATABASE 'data/market/sample.db' AS sample;
CREATE TABLE sample.daily_prices AS
SELECT * FROM main.daily_prices
WHERE symbol IN ('AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA')
AND date >= '2024-01-01';
EOF

tar -czf trenddojo_sample_$(date +%Y%m%d).tar.gz data/market/sample.db
```

### Receiving a Database Archive
```bash
# Extract received archive
tar -xzf trenddojo_db_20250130.tar.gz

# Verify the database
sqlite3 data/market/trenddojo.db "PRAGMA integrity_check;"
```

## Cloud Storage Options

### Using Google Drive / Dropbox
1. Upload compressed database archive
2. Share link with team (view-only)
3. Team members download and extract

### Using AWS S3 (Recommended for teams)
```bash
# Upload
aws s3 cp trenddojo_db_$(date +%Y%m%d).tar.gz s3://your-bucket/databases/

# Download
aws s3 cp s3://your-bucket/databases/trenddojo_db_latest.tar.gz .
```

## Troubleshooting

### Database Locked Error
```bash
# Find and kill processes using the database
lsof | grep trenddojo.db
# Kill the process if needed
```

### Corrupted Database
```bash
# Try to recover
sqlite3 data/market/trenddojo.db "PRAGMA integrity_check;"
sqlite3 data/market/trenddojo.db ".recover" | sqlite3 data/market/trenddojo_recovered.db
```

### Missing Data
If charts show no data:
1. Check database exists: `ls -la data/market/`
2. Check data present: `sqlite3 data/market/trenddojo.db "SELECT COUNT(*) FROM daily_prices;"`
3. Check date ranges match your query
4. Verify database path in environment variables

## Best Practices

1. **Never commit database files to git** - They're in .gitignore
2. **Keep backups** - Export regularly if making changes
3. **Use sample data for testing** - Don't need full production data
4. **Document data sources** - Track where your data came from
5. **Version your schemas** - Track database structure changes

## Environment Variables
Ensure your `.env.local` has:
```
# Database Configuration
DATABASE_PATH=./data/market/trenddojo.db
```

## Daily Synchronization

### Quick Commands
```bash
# Daily incremental sync (last 30 days for existing symbols)
npm run data:sync

# Full sync from Polygon (all S&P 500 symbols, 5 years)
npm run data:sync:full

# Check current database status
npm run market-stats
```

### Automatic Production Sync
Production runs two cron jobs automatically:
1. **Market Update** - Every 5 minutes during market hours (9-4 PM EST, Mon-Fri)
2. **Daily Close** - 5:00 PM EST every weekday - fetches complete daily OHLCV data

These are configured in `vercel.json` and implemented in:
- `/api/cron/market-update/route.ts` - Real-time updates
- `/api/cron/daily-close/route.ts` - End-of-day data

### Manual Sync for Development
To sync your local database from production:

```bash
# Ensure production database access is configured
# in .env.production.local

# Run sync (pulls from production PostgreSQL)
npm run data:sync
```

## Implementation Status

### ✅ Completed
- SQLite database structure for local development
- Data aggregation functions (daily → weekly/monthly)
- Multi-timeframe chart support (1W, 1M, 3M, 1Y, ALL)
- Production cron jobs configured in Vercel
- Sync script pulls from production PostgreSQL (NO sample data)
- Cron job updated to fetch real Polygon data
- npm scripts added for easy access

### 📋 Next Steps
1. Add Polygon API key to Vercel environment variables
2. Configure production DATABASE_URL in .env.production.local for local sync
3. Test full data pipeline: Polygon → Production → Local
4. Add data quality monitoring and alerts