/**
 * API Route: Get price history for a symbol
 * GET /api/market-data/history/:symbol?from=2024-01-01&to=2024-12-31
 */

import { NextRequest, NextResponse } from 'next/server';
import { MarketDatabase } from '@/lib/market-data/database/MarketDatabase';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ symbol: string }> }
) {
  const { symbol } = await params;
  const searchParams = request.nextUrl.searchParams;
  const from = searchParams.get('from');
  const to = searchParams.get('to');
  const limit = searchParams.get('limit');

  if (!symbol) {
    return NextResponse.json({ error: 'Symbol required' }, { status: 400 });
  }

  const db = new MarketDatabase();
  await db.initialize();

  try {
    let prices;

    if (from && to) {
      // Get prices within date range
      prices = db.getPrices(symbol.toUpperCase(), from, to);
    } else if (limit) {
      // Get most recent N prices
      prices = db.getPriceHistory(symbol.toUpperCase(), parseInt(limit));
    } else {
      // Default to last 365 days
      prices = db.getPriceHistory(symbol.toUpperCase(), 365);
    }

    if (!prices || prices.length === 0) {
      return NextResponse.json({ error: 'No data available for symbol' }, { status: 404 });
    }

    // Transform for chart (add timestamp for Lightweight Charts)
    const chartData = prices.map(price => ({
      time: price.date, // YYYY-MM-DD format
      open: price.open,
      high: price.high,
      low: price.low,
      close: price.close,
      value: price.close, // For line chart
      volume: price.volume
    }));

    return NextResponse.json({
      symbol: symbol.toUpperCase(),
      data: chartData,
      count: chartData.length,
      from: prices[0]?.date,
      to: prices[prices.length - 1]?.date,
      // Source tracking for multi-provider architecture
      _meta: {
        source: 'sqlite_cache', // TODO: Update when DataRouter is integrated
        timestamp: new Date().toISOString(),
        cached: true
      }
    });
  } catch (error) {
    console.error('Error fetching price history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch price history' },
      { status: 500 }
    );
  } finally {
    db.close();
  }
}