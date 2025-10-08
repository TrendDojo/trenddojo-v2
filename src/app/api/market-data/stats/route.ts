/**
 * Market Data Statistics Endpoint
 *
 * Provides real-time statistics about market data in the database.
 * Useful for monitoring data freshness and coverage.
 *
 * GET /api/market-data/stats
 */

import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

export async function GET() {
  const prisma = new PrismaClient();

  try {
    // Query stats sequentially to avoid connection pooling issues
    const totalRecords = await prisma.daily_prices.count();

    const dateRange = await prisma.daily_prices.aggregate({
      _min: { date: true },
      _max: { date: true }
    });

    // Get unique symbol count
    const symbols = await prisma.daily_prices.findMany({
      distinct: ['symbol'],
      select: { symbol: true }
    });

    // Get latest sync status (most recent record)
    const latestRecord = await prisma.daily_prices.findFirst({
      orderBy: { createdAt: 'desc' },
      select: { createdAt: true }
    });

    await prisma.$disconnect();

    return NextResponse.json({
      success: true,
      stats: {
        totalSymbols: symbols.length,
        totalRecords,
        dateRange: {
          earliest: dateRange._min.date,
          latest: dateRange._max.date
        },
        lastSync: latestRecord?.createdAt || null,
        status: 'healthy'
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    await prisma.$disconnect();

    console.error('Failed to fetch market data stats:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
