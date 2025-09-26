/**
 * API Route: Validate symbol exists
 * GET /api/market-data/validate/:symbol
 */

import { NextRequest, NextResponse } from 'next/server';
import { MarketDatabase } from '@/lib/market-data/database/MarketDatabase';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ symbol: string }> }
) {
  const { symbol } = await params;

  if (!symbol) {
    return NextResponse.json({ valid: false }, { status: 400 });
  }

  const db = new MarketDatabase();
  await db.initialize();

  try {
    const exists = db.hasSymbol(symbol.toUpperCase());

    if (exists) {
      return NextResponse.json({ valid: true, symbol: symbol.toUpperCase() });
    } else {
      return NextResponse.json({ valid: false }, { status: 404 });
    }
  } catch (error) {
    console.error('Error validating symbol:', error);
    return NextResponse.json({ valid: false }, { status: 500 });
  } finally {
    db.close();
  }
}