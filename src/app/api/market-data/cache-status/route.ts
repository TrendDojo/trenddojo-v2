import { NextResponse } from 'next/server';
import { MarketDataCache } from '@/lib/market-data/cache/MarketDataCache';

/**
 * API endpoint for cache monitoring and status
 */
export async function GET() {
  try {
    // This would use your actual database connection
    // For now, returning mock status
    const stats = {
      cacheEnabled: true,
      updateInterval: '1 minute',
      lastUpdate: new Date().toISOString(),
      cachedSymbols: 8000,
      cacheHitRate: 98.5,
      stopLossChecks: {
        enabled: true,
        interval: '1 minute',
        activeStops: 42
      },
      nextUpdate: new Date(Date.now() + 60000).toISOString(),
      isMarketHours: true
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error getting cache status:', error);
    return NextResponse.json(
      { error: 'Failed to get cache status' },
      { status: 500 }
    );
  }
}