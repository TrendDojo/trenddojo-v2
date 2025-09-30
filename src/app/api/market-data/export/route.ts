/**
 * Market Data Export API
 * Provides secure data export from production to local development
 * No credentials needed - data is public market data
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const range = searchParams.get('range') || '90d';

    // Determine date range
    let dateFilter = {};
    const endDate = new Date();

    if (range === 'all') {
      // No date filter - export everything
      dateFilter = {};
    } else if (range === '1y') {
      const startDate = new Date();
      startDate.setFullYear(endDate.getFullYear() - 1);
      dateFilter = {
        date: {
          gte: startDate.toISOString().split('T')[0]
        }
      };
    } else if (range === '90d') {
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - 90);
      dateFilter = {
        date: {
          gte: startDate.toISOString().split('T')[0]
        }
      };
    } else if (range === '30d') {
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - 30);
      dateFilter = {
        date: {
          gte: startDate.toISOString().split('T')[0]
        }
      };
    }

    // For production, query PostgreSQL
    if (process.env.NODE_ENV === 'production') {
      let query = '';
      if (range === 'all') {
        query = `
          SELECT symbol, date, open, high, low, close, volume
          FROM market.price_data
          ORDER BY symbol, date
          LIMIT 100000
        `;
      } else if (range === '1y') {
        query = `
          SELECT symbol, date, open, high, low, close, volume
          FROM market.price_data
          WHERE date >= CURRENT_DATE - INTERVAL '1 year'
          ORDER BY symbol, date
          LIMIT 100000
        `;
      } else if (range === '90d') {
        query = `
          SELECT symbol, date, open, high, low, close, volume
          FROM market.price_data
          WHERE date >= CURRENT_DATE - INTERVAL '90 days'
          ORDER BY symbol, date
          LIMIT 100000
        `;
      } else {
        query = `
          SELECT symbol, date, open, high, low, close, volume
          FROM market.price_data
          WHERE date >= CURRENT_DATE - INTERVAL '30 days'
          ORDER BY symbol, date
          LIMIT 100000
        `;
      }

      const data = await prisma.$queryRawUnsafe(query) as any[];

      // Stream as JSON for efficient transfer
      return NextResponse.json({
        success: true,
        range,
        count: Array.isArray(data) ? data.length : 0,
        data
      });
    }

    // For development, return empty data
    // (In development, use the sync script to populate local database)
    return NextResponse.json({
      success: true,
      range,
      count: 0,
      data: [],
      message: 'This endpoint only returns data in production. Use npm run data:sync for local development.'
    });

  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json(
      {
        error: 'Failed to export data',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Add OPTIONS for CORS if needed
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}