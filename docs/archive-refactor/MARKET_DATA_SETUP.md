# Market Data Infrastructure Setup

## Overview
The market data system uses SQLite for historical price storage and provides high-performance local access to years of stock data without API dependencies.

## Architecture
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

## Initial Setup

### 1. Database Initialization
The database will be automatically created on first use at `/data/market/historical_prices.db`.

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

## Performance Expectations

- **Import Speed**: ~10,000 records/second
- **Query Speed**: <10ms for date range queries
- **Database Size**: ~2-3GB for 5 years × 8,000 stocks
- **Memory Usage**: ~100MB with cache

## Troubleshooting

### Import Errors
- **"File not found"**: Check file path is correct
- **"Invalid date"**: Ensure dates are in YYYY-MM-DD format
- **"Duplicate key"**: Use `--skip-duplicates` flag

### Performance Issues
- Run `npm run market-vacuum` to optimize database
- Increase batch size for imports: `--batch-size 10000`
- Ensure database is on SSD, not HDD

### Data Quality
- Validation is on by default
- Use `--no-validate` to skip validation for trusted sources
- Check for splits/dividends in adjusted_close field

## Next Steps

1. **Get Data**: Purchase/download bulk historical data
2. **Import**: Use import scripts to populate database
3. **Verify**: Run `npm run market-stats` to confirm import
4. **Integrate**: Update app to use local data instead of API calls
5. **Maintain**: Set up nightly update job for new data

## Notes
- Database is read-heavy optimized (immutable historical data)
- Uses WAL mode for concurrent reads
- Indexes optimized for symbol+date queries
- Single file makes backup/distribution easy