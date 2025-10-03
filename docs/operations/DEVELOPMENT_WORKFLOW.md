# Development Workflow

*Last updated: 2025-01-30*

## 🚀 Starting the Development Server

**MANDATORY: Always use `starto` to start the development server**

```bash
# Kill any existing Next.js processes and start fresh
starto
```

The `starto` command:
- Automatically finds an available port (typically 3002)
- Kills any conflicting processes
- Ensures clean server startup
- Prevents port conflict issues

**DO NOT use `npm run dev` directly** - Always use `starto` for consistent behavior.

## 📊 Data Architecture

### Local Development
- **Database**: SQLite with read-only enforcement
- **Location**: `data/market/trenddojo.db`
- **Content**: 100 symbols, 5 years of daily historical data
- **Freshness**: Must be synced from production every 24 hours

### Production
- **Database**: PostgreSQL (Supabase)
- **Data Source**: Polygon API
- **Single Source of Truth**: All data originates from production

### Data Sync Process
1. Production fetches from Polygon API
2. Development syncs from production (one-way)
3. Local database is read-only to prevent divergence
4. 24-hour freshness checks ensure data currency

## 🔧 Common Development Tasks

### Running the Application
```bash
# Start the server (always use starto)
starto

# The server will be available at the port shown in terminal output
# Typically http://localhost:3002
```

### Checking Data Freshness
```bash
# Check when database was last synced
sqlite3 data/market/trenddojo.db "SELECT MAX(date) FROM daily_prices;"
```

### Building for Production
```bash
# Run build to verify no TypeScript errors
npm run build

# Run type checking
npx tsc --noEmit
```

## 📁 Project Structure

```
trenddojo-v2/
├── src/
│   ├── app/            # Next.js App Router pages
│   ├── components/     # React components
│   │   ├── charts/     # Chart components (LocalChart, ChartControls)
│   │   ├── ui/         # UI components
│   │   └── layout/     # Layout components
│   └── lib/            # Utilities and helpers
├── data/
│   └── market/         # Market data (gitignored)
│       └── trenddojo.db
├── docs/
│   ├── patterns/       # Design patterns documentation
│   └── _work/          # Work tracking
└── public/             # Static assets
```

## ⚠️ Important Notes

1. **Never commit the database** - It's in `.gitignore` for a reason
2. **Always use starto** - Prevents port conflicts and ensures clean startup
3. **Data is read-only in dev** - Don't attempt to modify market data locally
4. **Check data freshness** - Sync from production if data is >24 hours old
5. **System date issues** - The chart components handle future system dates by capping at max available data

## 🎨 Chart Components

### Timeframe Controls
The chart uses an interval-driven approach:
- **Interval**: The candle/bar width (2h, 4h, 8h, 1D, 1W, 1M)
- **Range**: The time period to display (5D, 10D, 1M, 3M, 6M, 1Y, 2Y, ALL)

Each interval has specific range options that ensure adequate candle count:
- 2 Hour bars: 5D (60 candles), 10D (120 candles), 1M (360 candles)
- 4 Hour bars: 10D (60 candles), 1M (180 candles), 2M (360 candles)
- Daily bars: 1M (22 candles), 3M (66 candles), 6M (132 candles), 1Y (252 candles)

## 🔍 Debugging

### Server Issues
```bash
# If port is already in use
lsof -i :3002  # Check what's using the port
pkill -f "next dev"  # Kill Next.js processes
starto  # Start fresh
```

### Data Issues
```bash
# Check database exists and has data
sqlite3 data/market/trenddojo.db ".tables"
sqlite3 data/market/trenddojo.db "SELECT COUNT(*) FROM daily_prices;"
```

### Chart Issues
- Check browser console for API errors
- Verify dates are within available data range (up to Jan 24, 2025)
- Ensure interval/range combination provides adequate candles