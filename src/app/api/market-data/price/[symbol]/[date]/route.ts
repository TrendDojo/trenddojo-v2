/**
 * API Route: Get price on specific date
 * GET /api/market-data/price/:symbol/:date
 */

import { NextRequest, NextResponse } from 'next/server';
import { MarketDatabase } from '@/lib/market-data/database/MarketDatabase';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ symbol: string; date: string }> }
) {
  const { symbol, date } = await params;

  if (!symbol || !date) {
    return NextResponse.json({ error: 'Symbol and date required' }, { status: 400 });
  }

  // Validate date format (YYYY-MM-DD)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: 'Invalid date format. Use YYYY-MM-DD' }, { status: 400 });
  }

  const db = new MarketDatabase();
  await db.initialize();

  try {
    const price = db.getPriceOnDate(symbol.toUpperCase(), date);

    if (!price) {
      // Try to get the nearest available price
      const nearestPrice = db.getNearestPrice(symbol.toUpperCase(), date);

      if (!nearestPrice) {
        return NextResponse.json({ error: 'No price data available' }, { status: 404 });
      }

      return NextResponse.json({
        symbol: symbol.toUpperCase(),
        requestedDate: date,
        actualDate: nearestPrice.date,
        price: nearestPrice.close,
        note: 'Using nearest available date'
      });
    }

    return NextResponse.json({
      symbol: symbol.toUpperCase(),
      date: price.date,
      price: price.close,
      open: price.open,
      high: price.high,
      low: price.low,
      volume: price.volume
    });
  } catch (error) {
    console.error('Error fetching price on date:', error);
    return NextResponse.json(
      { error: 'Failed to fetch price' },
      { status: 500 }
    );
  } finally {
    db.close();
  }
}