# Market Data Infrastructure

*Last updated: 2025-09-28*

## Overview
The market data system provides high-performance local access to years of stock data without API dependencies for development, while enabling real-time production updates through a shared PostgreSQL database.

## Architecture

### Development Architecture (Local SQLite)
```
/data/market/
  historical_prices.db    # SQLite database (2-3GB when populated)

/src/lib/market-data/
  database/              # Database layer
    MarketDatabase.ts    # Core database service
    schema.sql          # SQLite schema
    types.ts           # TypeScript types
  import/              # Import utilities
    BulkImporter.ts    # CSV/JSON import handler
```

### Production Architecture (Shared PostgreSQL)
```
Production PostgreSQL (Supabase)
├── public schema (user data - isolated per environment)
└── market schema (market data - shared across environments)
    ├── price_data (historical daily bars)
    ├── latest_quotes (real-time quotes)
    ├── symbols (symbol metadata)
    └── sync_state (tracking table)

Production (write) → market schema
     ↓
Staging (read-only) → market schema
     ↓
Development (read-only) → market schema
```

## Development Setup

### 1. Database Initialization
The SQLite database will be automatically created on first use at `/data/market/historical_prices.db`.

### 2. Data Import Process

#### Import CSV Data
```bash
# Import a single CSV file
npm run import-data data/stocks_2024.csv

# Import with options
npm run import-data data/stocks_2024.csv --skip-duplicates --batch-size 5000
```

Expected CSV format:
```csv
symbol,date,open,high,low,close,volume,adjusted_close
AAPL,2024-01-02,184.25,185.88,183.89,185.64,50271400,185.64
AAPL,2024-01-03,184.22,185.00,183.43,184.25,58414500,184.25
```

#### Import JSON Data
```bash
npm run import-data data/stocks_2024.json
```

Supported JSON formats:
```json
// Format 1: Array of prices
[
  {
    "symbol": "AAPL",
    "date": "2024-01-02",
    "open": 184.25,
    "high": 185.88,
    "low": 183.89,
    "close": 185.64,
    "volume": 50271400,
    "adjusted_close": 185.64
  }
]

// Format 2: Object with prices array
{
  "prices": [...],
  "metadata": {...}
}
```

### 3. Database Management

#### Check Database Statistics
```bash
npm run market-stats
```

Output:
```
📊 Market Database Statistics
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📈 Overview:
   Total Symbols: 8,234
   Total Records: 10,345,678
   Date Range: 2019-01-02 to 2024-01-26
   Database Size: 2,456.78 MB
   Last Updated: 2025-01-26T10:30:00
```

#### Create Backup
```bash
npm run market-backup ./backups/market_2025_01_26.db
```

#### Vacuum Database (Reclaim Space)
```bash
npm run market-vacuum
```

## Production Setup

### Step 1: Create Production Database Schema

1. Connect to your production PostgreSQL (Supabase):
```bash
psql $PRODUCTION_DATABASE_URL
```

2. Run the market schema migration:
```sql
-- Execute the contents of prisma/migrations/market_data_schema.sql
```

3. Verify the schema was created:
```sql
\dn market
\dt market.*
```

### Step 2: Configure Read-Only Access

1. Create read-only connection string for staging/dev:
```sql
-- Create read-only user (if not already done in migration)
CREATE ROLE market_reader WITH LOGIN PASSWORD 'secure_password_here';
GRANT CONNECT ON DATABASE postgres TO market_reader;
GRANT USAGE ON SCHEMA market TO market_reader;
GRANT SELECT ON ALL TABLES IN SCHEMA market TO market_reader;
```

2. Get the read-only connection string:
```
postgresql://market_reader:secure_password_here@db.YOUR_PROJECT.supabase.co:5432/postgres?schema=market
```

### Step 3: Environment Variables

#### Production (.env.production)
```env
# Main database (read/write to both schemas)
DATABASE_URL="postgresql://postgres:xxx@db.xxx.supabase.co:5432/postgres"

# Cron job secret
CRON_SECRET="generate-random-secret-here"

# Market data providers
POLYGON_API_KEY="your-polygon-key"
ALPHA_VANTAGE_API_KEY="your-alpha-vantage-key"
```

#### Staging (.env.staging)
```env
# Main database (staging user data)
DATABASE_URL="postgresql://postgres:xxx@db.staging.supabase.co:5432/postgres"

# Read-only access to production market data
MARKET_DATABASE_URL="postgresql://market_reader:xxx@db.production.supabase.co:5432/postgres?schema=market"
```

#### Development (.env.local)
```env
# Local database
DATABASE_URL="postgresql://localhost:5432/trenddojo_dev"

# Optional: Read-only access to production market data
# MARKET_DATABASE_URL="postgresql://market_reader:xxx@db.production.supabase.co:5432/postgres?schema=market"
```

### Step 4: Deploy to Vercel

1. Add environment variables in Vercel dashboard:
   - Go to Settings → Environment Variables
   - Add all production variables
   - Add `CRON_SECRET` (generate secure random string)

2. Deploy the application:
```bash
git push origin main
```

3. Verify cron jobs are registered:
   - Go to Vercel Dashboard → Functions → Crons
   - Should see:
     - `/api/cron/market-update` (every 5 min during market hours)
     - `/api/cron/daily-close` (5 PM EST weekdays)

### Step 5: Initial Data Load

1. Load symbol metadata:
```sql
-- Insert core symbols
INSERT INTO market.symbols (symbol, name, exchange, type, tier)
VALUES
  ('AAPL', 'Apple Inc.', 'NASDAQ', 'stock', 1),
  ('MSFT', 'Microsoft Corporation', 'NASDAQ', 'stock', 1),
  ('SPY', 'SPDR S&P 500 ETF', 'NYSE', 'etf', 1);
  -- Add more symbols
```

2. Backfill historical data (run locally):
```bash
npm run market-data:backfill -- --days=365
```

## Data Sources

### Recommended Providers for Bulk Download

1. **Polygon.io** ($29/month)
   - Unlimited API calls during subscription
   - 5 years historical data
   - Best for initial bulk download

2. **FirstRate Data** (One-time purchase)
   - Direct CSV downloads
   - No API needed
   - Good for historical backfill

3. **EOD Historical Data**
   - Bulk CSV exports
   - Reasonable pricing
   - Includes delisted stocks

4. **Free Options**
   - Kaggle datasets (historical snapshots)
   - Yahoo Finance (unreliable but free)

## Usage in Application

### Basic Usage
```typescript
import { MarketDatabase } from '@/lib/market-data/database/MarketDatabase';

const db = new MarketDatabase();
await db.initialize();

// Get price data
const prices = db.getPrices('AAPL', '2024-01-01', '2024-01-31');

// Get latest price
const latest = db.getLatestPrice('AAPL');

// Get all symbols
const symbols = db.getSymbols();

db.close();
```

## Monitoring & Maintenance

### Check Cron Job Status
```sql
-- Recent sync status
SELECT * FROM market.sync_state
ORDER BY created_at DESC
LIMIT 10;

-- Check for failures
SELECT * FROM market.sync_state
WHERE status = 'failed'
ORDER BY created_at DESC;
```

### Monitor Data Freshness
```sql
-- Latest quotes age
SELECT
  symbol,
  timestamp,
  NOW() - timestamp as age
FROM market.latest_quotes
ORDER BY timestamp DESC
LIMIT 10;

-- Daily data completeness
SELECT
  date,
  COUNT(DISTINCT symbol) as symbols_count
FROM market.price_data
WHERE date >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY date
ORDER BY date DESC;
```

## Performance Expectations

- **Import Speed**: ~10,000 records/second
- **Query Speed**: <10ms for date range queries
- **Database Size**: ~2-3GB for 5 years × 8,000 stocks
- **Memory Usage**: ~100MB with cache

## Scaling Considerations

### When to Scale
- **100+ active users**: Move to 5-minute updates for all S&P 500
- **1000+ active users**: Add Russell 3000, implement tiered updates
- **10,000+ active users**: Consider dedicated market data infrastructure

### Optimization Options
1. **Partitioning**: Partition price_data by month when >1M rows
2. **Materialized Views**: Pre-compute common queries
3. **Connection Pooling**: Use PgBouncer for read replicas
4. **Caching Layer**: Add Redis for hot data

## Troubleshooting

### Development Issues
- **"File not found"**: Check file path is correct
- **"Invalid date"**: Ensure dates are in YYYY-MM-DD format
- **"Duplicate key"**: Use `--skip-duplicates` flag

### Production Issues
- **Cron Jobs Not Running**: Check Vercel dashboard for errors, verify `CRON_SECRET`
- **Data Not Updating**: Check sync_state table for errors, verify API keys
- **Performance Issues**: Check database query performance, add indexes if needed

### Performance Optimization
- Run `npm run market-vacuum` to optimize database
- Increase batch size for imports: `--batch-size 10000`
- Ensure database is on SSD, not HDD

### Data Quality
- Validation is on by default
- Use `--no-validate` to skip validation for trusted sources
- Check for splits/dividends in adjusted_close field

## Security Notes

1. **Never expose write credentials** to staging/dev
2. **Use environment-specific API keys** for data providers
3. **Rotate CRON_SECRET** periodically
4. **Monitor for suspicious queries** in database logs
5. **Set up alerts** for failed syncs

## Implementation Workflow

### Development Phase
1. **Get Data**: Purchase/download bulk historical data
2. **Import**: Use import scripts to populate local SQLite database
3. **Verify**: Run `npm run market-stats` to confirm import
4. **Integrate**: Update app to use local data instead of API calls

### Production Phase
1. **Setup Schema**: Create production PostgreSQL schema
2. **Configure Access**: Set up read-only credentials for lower environments
3. **Deploy**: Configure Vercel with proper environment variables
4. **Load Data**: Import initial dataset and verify cron jobs
5. **Monitor**: Set up alerts and monitor data freshness

## Notes
- SQLite database is read-heavy optimized (immutable historical data)
- Uses WAL mode for concurrent reads
- Indexes optimized for symbol+date queries
- Single file makes backup/distribution easy
- PostgreSQL setup enables real-time updates in production
- Read-only access prevents accidental data corruption from lower environments