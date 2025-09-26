/**
 * API Route: Get full quote for a symbol
 * GET /api/market-data/quote/:symbol
 */

import { NextRequest, NextResponse } from 'next/server';
import { MarketDatabase } from '@/lib/market-data/database/MarketDatabase';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ symbol: string }> }
) {
  const { symbol } = await params;

  if (!symbol) {
    return NextResponse.json({ error: 'Symbol required' }, { status: 400 });
  }

  const db = new MarketDatabase();
  await db.initialize();

  try {
    const latest = db.getLatestPrice(symbol.toUpperCase());

    if (!latest) {
      return NextResponse.json({ error: 'Symbol not found' }, { status: 404 });
    }

    // Get previous day's close for change calculation
    const history = db.getPriceHistory(symbol.toUpperCase(), 2);
    const previousClose = history.length > 1 ? history[history.length - 2].close : latest.close;

    const change = latest.close - previousClose;
    const changePercent = (change / previousClose) * 100;

    return NextResponse.json({
      symbol: symbol.toUpperCase(),
      price: latest.close,
      change: change,
      changePercent: changePercent,
      date: latest.date,
      previousClose: previousClose,
      dayRange: { low: latest.low, high: latest.high },
      volume: latest.volume,
      open: latest.open
    });
  } catch (error) {
    console.error('Error fetching quote:', error);
    return NextResponse.json(
      { error: 'Failed to fetch quote' },
      { status: 500 }
    );
  } finally {
    db.close();
  }
}