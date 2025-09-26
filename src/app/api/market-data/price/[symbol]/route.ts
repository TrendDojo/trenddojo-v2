/**
 * API Route: Get latest price for a symbol
 * GET /api/market-data/price/:symbol
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
    const latestPrice = db.getLatestPrice(symbol.toUpperCase());

    if (!latestPrice) {
      return NextResponse.json({ error: 'Symbol not found' }, { status: 404 });
    }

    return NextResponse.json({
      symbol: symbol.toUpperCase(),
      price: latestPrice.close,
      date: latestPrice.date,
      volume: latestPrice.volume
    });
  } catch (error) {
    console.error('Error fetching price:', error);
    return NextResponse.json(
      { error: 'Failed to fetch price' },
      { status: 500 }
    );
  } finally {
    db.close();
  }
}