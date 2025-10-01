/**
 * Market Data Sync Cron Job
 * @business-critical: Hourly sync of market data from Polygon
 *
 * Vercel Cron Configuration (vercel.json):
 * {
 *   "crons": [{
 *     "path": "/api/cron/market-data-sync",
 *     "schedule": "0 * * * *"
 *   }]
 * }
 *
 * Runs every hour: 0 * * * * (at minute 0 of every hour)
 */

import { NextRequest, NextResponse } from 'next/server';
import { SymbolUniverseManager } from '@/lib/market-data/services/SymbolUniverseManager';
import { PriceDownloader } from '@/lib/market-data/services/PriceDownloader';

// Verify this is a legitimate cron request
function verifyCronRequest(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    console.warn('⚠️  CRON_SECRET not configured - allowing request');
    return true; // In development, allow without secret
  }

  return authHeader === `Bearer ${cronSecret}`;
}

export async function GET(request: NextRequest) {
  const startTime = Date.now();

  // Security: Verify this is a legitimate cron request
  if (!verifyCronRequest(request)) {
    console.error('❌ Unauthorized cron request');
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  console.log('🕐 Starting hourly market data sync...');

  try {
    // Get all symbols to sync
    const symbolManager = new SymbolUniverseManager();
    const symbols = await symbolManager.getAllSymbols();

    console.log(`📊 Syncing ${symbols.length} symbols...`);

    // Download latest prices
    const downloader = new PriceDownloader();
    const result = await downloader.downloadLatest(symbols);

    const duration = Date.now() - startTime;

    console.log('✅ Sync complete!');
    console.log(`   Duration: ${(duration / 1000).toFixed(2)}s`);
    console.log(`   Success: ${result.success}`);
    console.log(`   Failed: ${result.failed}`);
    console.log(`   Records: ${result.totalRecords}`);

    return NextResponse.json({
      success: true,
      duration,
      symbols: {
        total: symbols.length,
        success: result.success,
        failed: result.failed
      },
      records: result.totalRecords,
      errors: result.errors.slice(0, 10) // Return first 10 errors
    });

  } catch (error) {
    console.error('❌ Sync failed:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Also support POST for manual triggers
export async function POST(request: NextRequest) {
  return GET(request);
}
