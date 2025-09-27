/**
 * Market Data Backfill API
 * Used to fill gaps in historical data
 * @business-critical: Ensures data completeness
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hasMarketDataWriteAccess } from '@/lib/market-data/database/config';

interface BackfillRequest {
  symbols?: string[];
  startDate: string;
  endDate: string;
  overwrite?: boolean;
}

export async function POST(request: NextRequest) {
  // Only allow in production or development
  if (!hasMarketDataWriteAccess() && process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { error: 'Backfill only allowed in production or development' },
      { status: 403 }
    );
  }

  try {
    const body: BackfillRequest = await request.json();
    const { symbols, startDate, endDate, overwrite = false } = body;

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: 'startDate and endDate are required' },
        { status: 400 }
      );
    }

    // Get symbols to backfill
    const symbolList = symbols || await getSymbolsWithGaps(startDate, endDate);

    if (symbolList.length === 0) {
      return NextResponse.json({
        message: 'No symbols to backfill',
        startDate,
        endDate
      });
    }

    const results = {
      success: true,
      symbolsProcessed: 0,
      recordsInserted: 0,
      recordsSkipped: 0,
      errors: [] as string[],
      startDate,
      endDate
    };

    // Process each symbol
    for (const symbol of symbolList) {
      try {
        const records = await backfillSymbol(
          symbol,
          startDate,
          endDate,
          overwrite
        );

        results.symbolsProcessed++;
        results.recordsInserted += records.inserted;
        results.recordsSkipped += records.skipped;
      } catch (error) {
        const errorMsg = `${symbol}: ${error instanceof Error ? error.message : 'Unknown error'}`;
        results.errors.push(errorMsg);
        console.error('Backfill error for', symbol, error);
      }
    }

    // Log to sync_state
    await prisma.$executeRaw`
      INSERT INTO market.sync_state
        (sync_type, last_sync_date, records_synced, status, environment)
      VALUES
        ('backfill', ${endDate}, ${results.recordsInserted},
         ${results.errors.length > 0 ? 'partial' : 'success'},
         ${process.env.NODE_ENV})
    `;

    return NextResponse.json(results);
  } catch (error) {
    console.error('Backfill API error:', error);
    return NextResponse.json(
      { error: 'Backfill failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * Find symbols with missing data in the date range
 */
async function getSymbolsWithGaps(startDate: string, endDate: string): Promise<string[]> {
  try {
    // Find symbols that don't have complete data for the date range
    const result = await prisma.$queryRaw<{symbol: string}[]>`
      SELECT DISTINCT s.symbol
      FROM market.symbols s
      WHERE s.is_active = true
      AND NOT EXISTS (
        SELECT 1
        FROM market.price_data pd
        WHERE pd.symbol = s.symbol
        AND pd.date BETWEEN ${startDate}::date AND ${endDate}::date
        GROUP BY pd.symbol
        HAVING COUNT(DISTINCT pd.date) >=
          (${endDate}::date - ${startDate}::date + 1)
      )
      ORDER BY s.symbol
    `;

    return result.map(r => r.symbol);
  } catch (error) {
    console.error('Failed to find symbols with gaps:', error);
    // Fallback to core symbols
    return ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META'];
  }
}

/**
 * Backfill data for a single symbol
 */
async function backfillSymbol(
  symbol: string,
  startDate: string,
  endDate: string,
  overwrite: boolean
): Promise<{ inserted: number; skipped: number }> {
  let inserted = 0;
  let skipped = 0;

  // Check existing data if not overwriting
  if (!overwrite) {
    const existing = await prisma.$queryRaw<{count: number}[]>`
      SELECT COUNT(*) as count
      FROM market.price_data
      WHERE symbol = ${symbol}
      AND date BETWEEN ${startDate}::date AND ${endDate}::date
    `;

    if (existing[0]?.count > 0) {
      skipped = existing[0].count;

      // Calculate missing dates
      const expectedDays = getBusinessDays(new Date(startDate), new Date(endDate));
      const missingDays = expectedDays - existing[0].count;

      if (missingDays <= 0) {
        return { inserted: 0, skipped };
      }
    }
  }

  // Fetch historical data from provider
  // TODO: Integrate with Polygon or other providers
  const historicalData = await fetchHistoricalData(symbol, startDate, endDate);

  // Insert data
  for (const bar of historicalData) {
    try {
      if (overwrite) {
        await prisma.$executeRaw`
          INSERT INTO market.price_data
            (symbol, date, open, high, low, close, volume, data_source)
          VALUES
            (${symbol}, ${bar.date}, ${bar.open}, ${bar.high},
             ${bar.low}, ${bar.close}, ${bar.volume}, 'backfill')
          ON CONFLICT (symbol, date)
          DO UPDATE SET
            open = EXCLUDED.open,
            high = EXCLUDED.high,
            low = EXCLUDED.low,
            close = EXCLUDED.close,
            volume = EXCLUDED.volume,
            updated_at = CURRENT_TIMESTAMP
        `;
      } else {
        await prisma.$executeRaw`
          INSERT INTO market.price_data
            (symbol, date, open, high, low, close, volume, data_source)
          VALUES
            (${symbol}, ${bar.date}, ${bar.open}, ${bar.high},
             ${bar.low}, ${bar.close}, ${bar.volume}, 'backfill')
          ON CONFLICT (symbol, date) DO NOTHING
        `;
      }
      inserted++;
    } catch (error) {
      console.error(`Failed to insert ${symbol} data for ${bar.date}:`, error);
    }
  }

  return { inserted, skipped };
}

/**
 * Fetch historical data from provider
 */
async function fetchHistoricalData(
  symbol: string,
  startDate: string,
  endDate: string
): Promise<any[]> {
  // TODO: Integrate with Polygon API
  // For now, return mock data for testing
  const bars = [];
  const start = new Date(startDate);
  const end = new Date(endDate);

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    // Skip weekends
    if (d.getDay() === 0 || d.getDay() === 6) continue;

    bars.push({
      date: d.toISOString().split('T')[0],
      open: 100 + Math.random() * 50,
      high: 150 + Math.random() * 50,
      low: 90 + Math.random() * 30,
      close: 100 + Math.random() * 50,
      volume: Math.floor(Math.random() * 10000000)
    });
  }

  return bars;
}

/**
 * Calculate business days between two dates
 */
function getBusinessDays(startDate: Date, endDate: Date): number {
  let count = 0;
  const current = new Date(startDate);

  while (current <= endDate) {
    const day = current.getDay();
    if (day !== 0 && day !== 6) {
      count++;
    }
    current.setDate(current.getDate() + 1);
  }

  return count;
}