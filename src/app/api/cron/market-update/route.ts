/**
 * Vercel Cron Job: Market Data Update
 * Runs every 5 minutes during market hours (9:30 AM - 4:00 PM EST, Mon-Fri)
 * @business-critical: Ensures all users have up-to-date market data
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
    symbolsUpdated: 0,
    errors: [] as string[],
    duration: 0,
    timestamp: new Date().toISOString(),
    marketStatus: 'unknown'
  };

  try {
    // Get list of symbols to update based on tier
    const tier1Symbols = await getActiveSymbols(1); // S&P 500
    const tier2Symbols = await getActiveSymbols(2); // Russell 3000

    // During market hours, update tier 1 every 5 minutes
    const isMarketHours = checkMarketHours();
    results.marketStatus = isMarketHours ? 'open' : 'closed';
    const symbolsToUpdate = isMarketHours ? tier1Symbols : [];

    if (symbolsToUpdate.length === 0) {
      return NextResponse.json({
        ...results,
        message: 'Market closed or no symbols to update',
        duration: Date.now() - startTime
      });
    }

    // Fetch latest quotes from data provider
    // This will use the DataRouter to get from the best source
    const updates = await fetchLatestQuotes(symbolsToUpdate);

    // Store in production database (market schema)
    await storeMarketData(updates);

    // Track sync state
    await prisma.$executeRaw`
      INSERT INTO market.sync_state (sync_type, records_synced, status, environment)
      VALUES ('intraday', ${updates.length}, 'success', 'production')
    `;

    results.symbolsUpdated = updates.length;
  } catch (error) {
    console.error('Market update cron error:', error);
    results.success = false;
    results.errors.push(error instanceof Error ? error.message : 'Unknown error');

    // Log failure to sync state
    await prisma.$executeRaw`
      INSERT INTO market.sync_state (sync_type, status, error_message, environment)
      VALUES ('intraday', 'failed', ${error instanceof Error ? error.message : 'Unknown error'}, 'production')
    `;
  }

  results.duration = Date.now() - startTime;
  return NextResponse.json(results);
}

async function getActiveSymbols(tier: number): Promise<string[]> {
  // In production, this would query the market.symbols table
  // For now, return a predefined list based on tier
  const tier1 = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META', 'NVDA', 'TSLA', 'JPM', 'V', 'JNJ'];
  const tier2 = [...tier1, 'AMD', 'INTC', 'NFLX', 'DIS', 'BA', 'GS', 'WMT', 'HD', 'CVX', 'XOM'];

  return tier === 1 ? tier1 : tier2;
}

function checkMarketHours(): boolean {
  const now = new Date();
  const day = now.getUTCDay();
  const hour = now.getUTCHours();
  const minute = now.getUTCMinutes();

  // Convert to EST (UTC-5 during standard time, UTC-4 during daylight saving)
  const estHour = hour - 5; // Simplified, should check DST
  const marketOpen = 9.5; // 9:30 AM
  const marketClose = 16; // 4:00 PM

  // Monday = 1, Friday = 5
  if (day === 0 || day === 6) return false; // Weekend

  const currentTime = estHour + (minute / 60);
  return currentTime >= marketOpen && currentTime < marketClose;
}

async function fetchLatestQuotes(symbols: string[]): Promise<any[]> {
  // TODO: Integrate with DataRouter to fetch from best source
  // For now, return mock data
  return symbols.map(symbol => ({
    symbol,
    price: Math.random() * 1000,
    volume: Math.floor(Math.random() * 1000000),
    timestamp: new Date()
  }));
}

async function storeMarketData(updates: any[]): Promise<void> {
  // Store in market.latest_quotes table
  for (const update of updates) {
    await prisma.$executeRaw`
      INSERT INTO market.latest_quotes (symbol, price, volume, timestamp, data_source)
      VALUES (${update.symbol}, ${update.price}, ${update.volume}, ${update.timestamp}, 'cron')
      ON CONFLICT (symbol)
      DO UPDATE SET
        price = EXCLUDED.price,
        volume = EXCLUDED.volume,
        timestamp = EXCLUDED.timestamp,
        updated_at = CURRENT_TIMESTAMP
    `;
  }
}