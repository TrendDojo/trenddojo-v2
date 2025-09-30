/**
 * Vercel Cron Job: Daily Market Close
 * Runs at 5:00 PM EST every weekday
 * @business-critical: Fetches and stores complete daily OHLCV data
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Verify this is a legitimate cron request from Vercel
function verifyCron(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return false;
  }
  return true;
}

export async function GET(request: NextRequest) {
  // In production, verify the request is from Vercel
  if (process.env.NODE_ENV === 'production' && !verifyCron(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const startTime = Date.now();
  const results = {
    success: true,
    symbolsProcessed: 0,
    recordsInserted: 0,
    errors: [] as string[],
    duration: 0,
    date: new Date().toISOString().split('T')[0]
  };

  try {
    // Get all active symbols
    const symbols = await getAllActiveSymbols();

    // Fetch daily bars from data provider (Polygon preferred for historical)
    const dailyData = await fetchDailyBars(symbols, results.date);

    // Store in market.price_data table
    let recordsInserted = 0;
    for (const bar of dailyData) {
      try {
        await prisma.$executeRaw`
          INSERT INTO market.price_data
            (symbol, date, open, high, low, close, volume, vwap, data_source)
          VALUES
            (${bar.symbol}, ${bar.date}, ${bar.open}, ${bar.high},
             ${bar.low}, ${bar.close}, ${bar.volume}, ${bar.vwap}, 'polygon')
          ON CONFLICT (symbol, date)
          DO UPDATE SET
            open = EXCLUDED.open,
            high = EXCLUDED.high,
            low = EXCLUDED.low,
            close = EXCLUDED.close,
            volume = EXCLUDED.volume,
            vwap = EXCLUDED.vwap,
            updated_at = CURRENT_TIMESTAMP
        `;
        recordsInserted++;
      } catch (error) {
        console.error(`Failed to insert data for ${bar.symbol}:`, error);
        results.errors.push(`${bar.symbol}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    results.symbolsProcessed = symbols.length;
    results.recordsInserted = recordsInserted;

    // Track sync state
    await prisma.$executeRaw`
      INSERT INTO market.sync_state
        (sync_type, last_sync_date, records_synced, status, environment)
      VALUES
        ('daily', ${results.date}, ${recordsInserted}, 'success', 'production')
    `;

    // Clean up old intraday data (optional, keeps last 30 days)
    await cleanupOldIntradayData();

  } catch (error) {
    console.error('Daily close cron error:', error);
    results.success = false;
    results.errors.push(error instanceof Error ? error.message : 'Unknown error');

    // Log failure
    await prisma.$executeRaw`
      INSERT INTO market.sync_state
        (sync_type, last_sync_date, status, error_message, environment)
      VALUES
        ('daily', ${results.date}, 'failed',
         ${error instanceof Error ? error.message : 'Unknown error'}, 'production')
    `;
  }

  results.duration = Date.now() - startTime;
  return NextResponse.json(results);
}

async function getAllActiveSymbols(): Promise<string[]> {
  // Query market.symbols table for all active symbols
  // For initial implementation, use a core set
  const coreSymbols = [
    // Top tech
    'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META', 'NVDA', 'TSLA',
    // Financials
    'JPM', 'BAC', 'WFC', 'GS', 'MS', 'V', 'MA',
    // Healthcare
    'JNJ', 'UNH', 'PFE', 'CVS', 'ABBV',
    // Industrials
    'BA', 'CAT', 'GE', 'MMM', 'HON',
    // Consumer
    'WMT', 'HD', 'PG', 'KO', 'PEP', 'MCD', 'NKE',
    // Energy
    'XOM', 'CVX', 'COP',
    // ETFs
    'SPY', 'QQQ', 'DIA', 'IWM', 'VTI',
    // Add more as needed up to 100 for initial launch
  ];

  try {
    // In production, query the database
    const dbSymbols = await prisma.$queryRaw<{symbol: string}[]>`
      SELECT symbol FROM market.symbols
      WHERE is_active = true
      ORDER BY tier, symbol
    `;

    if (dbSymbols && dbSymbols.length > 0) {
      return dbSymbols.map(s => s.symbol);
    }
  } catch (error) {
    console.error('Failed to query symbols from database:', error);
  }

  return coreSymbols;
}

async function fetchDailyBars(symbols: string[], date: string): Promise<any[]> {
  // Import the Polygon provider
  const { PolygonProvider } = await import('@/lib/market-data/providers/PolygonProvider');
  const provider = new PolygonProvider();

  const dailyBars: any[] = [];
  const batchSize = 10; // Process in batches to avoid overwhelming the API

  for (let i = 0; i < symbols.length; i += batchSize) {
    const batch = symbols.slice(i, i + batchSize);

    // Fetch daily bars in parallel for this batch
    const batchPromises = batch.map(async (symbol) => {
      try {
        // Get the daily bar for this symbol
        const bars = await provider.getDailyBars(symbol, date, date);
        if (bars && bars.length > 0) {
          return bars[0]; // Return the single day's data
        }
      } catch (error) {
        console.error(`Failed to fetch data for ${symbol}:`, error);
      }
      return null;
    });

    const batchResults = await Promise.all(batchPromises);
    dailyBars.push(...batchResults.filter(bar => bar !== null));

    // Small delay between batches to be respectful to the API
    if (i + batchSize < symbols.length) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  return dailyBars;
}

async function cleanupOldIntradayData(): Promise<void> {
  // Keep only last 30 days of minute data to save space
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - 30);

  try {
    await prisma.$executeRaw`
      DELETE FROM market.latest_quotes
      WHERE timestamp < ${cutoffDate}
    `;
  } catch (error) {
    console.error('Failed to cleanup old data:', error);
  }
}