# Production Market Data Setup Guide

## Overview
This guide walks through setting up the production market data infrastructure where a single PostgreSQL database serves market data to all environments (production, staging, development).

## Architecture
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

## Step 1: Create Production Database Schema

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

## Step 2: Configure Read-Only Access

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

## Step 3: Environment Variables

### Production (.env.production)
```env
# Main database (read/write to both schemas)
DATABASE_URL="postgresql://postgres:xxx@db.xxx.supabase.co:5432/postgres"

# Cron job secret
CRON_SECRET="generate-random-secret-here"

# Market data providers
POLYGON_API_KEY="your-polygon-key"
ALPHA_VANTAGE_API_KEY="your-alpha-vantage-key"
```

### Staging (.env.staging)
```env
# Main database (staging user data)
DATABASE_URL="postgresql://postgres:xxx@db.staging.supabase.co:5432/postgres"

# Read-only access to production market data
MARKET_DATABASE_URL="postgresql://market_reader:xxx@db.production.supabase.co:5432/postgres?schema=market"
```

### Development (.env.local)
```env
# Local database
DATABASE_URL="postgresql://localhost:5432/trenddojo_dev"

# Optional: Read-only access to production market data
# MARKET_DATABASE_URL="postgresql://market_reader:xxx@db.production.supabase.co:5432/postgres?schema=market"
```

## Step 4: Deploy to Vercel

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

## Step 5: Initial Data Load

1. Load symbol metadata:
```sql
-- Insert core symbols
INSERT INTO market.symbols (symbol, name, exchange, type, tier)
VALUES
  ('AAPL', 'Apple Inc.', 'NASDAQ', 'stock', 1),
  ('MSFT', 'Microsoft Corporation', 'NASDAQ', 'stock', 1),
  ('SPY', 'SPDR S&P 500 ETF', 'NYSE', 'etf', 1),
  -- Add more symbols
;
```

2. Backfill historical data (run locally):
```bash
npm run market-data:backfill -- --days=365
```

## Step 6: Monitoring

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

## Step 7: Scaling Considerations

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

### Cron Jobs Not Running
1. Check Vercel dashboard for errors
2. Verify `CRON_SECRET` is set correctly
3. Check function logs in Vercel

### Data Not Updating
1. Check sync_state table for errors
2. Verify API keys are valid
3. Check rate limits on data providers

### Performance Issues
1. Check database query performance
2. Add indexes if needed
3. Consider upgrading database tier

## Security Notes

1. **Never expose write credentials** to staging/dev
2. **Use environment-specific API keys** for data providers
3. **Rotate CRON_SECRET** periodically
4. **Monitor for suspicious queries** in database logs
5. **Set up alerts** for failed syncs

## Next Steps

After setup:
1. Monitor first few cron runs
2. Verify data quality
3. Set up error alerts
4. Document any custom configurations
5. Create runbook for common issues