/**
 * API Route: Search symbols
 * GET /api/market-data/search?q=query
 */

import { NextRequest, NextResponse } from 'next/server';
import { MarketDatabase } from '@/lib/market-data/database/MarketDatabase';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q');

  if (!query || query.length < 1) {
    return NextResponse.json([]);
  }

  const db = new MarketDatabase();
  await db.initialize();

  try {
    const symbols = db.getSymbols();

    // Simple search - starts with or contains query
    const results = symbols.filter(symbol =>
      symbol.toUpperCase().startsWith(query.toUpperCase()) ||
      symbol.toUpperCase().includes(query.toUpperCase())
    );

    // Sort by relevance - exact matches first, then starts-with, then contains
    results.sort((a, b) => {
      const aUpper = a.toUpperCase();
      const bUpper = b.toUpperCase();
      const queryUpper = query.toUpperCase();

      if (aUpper === queryUpper) return -1;
      if (bUpper === queryUpper) return 1;
      if (aUpper.startsWith(queryUpper) && !bUpper.startsWith(queryUpper)) return -1;
      if (!aUpper.startsWith(queryUpper) && bUpper.startsWith(queryUpper)) return 1;
      return a.localeCompare(b);
    });

    return NextResponse.json(results.slice(0, 10)); // Return top 10 matches
  } catch (error) {
    console.error('Error searching symbols:', error);
    return NextResponse.json([]);
  } finally {
    db.close();
  }
}