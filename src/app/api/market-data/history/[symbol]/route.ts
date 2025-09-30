/**
 * API Route: Get price history for a symbol
 * GET /api/market-data/history/:symbol?from=2024-01-01&to=2024-12-31&interval=1D
 *
 * Supported intervals:
 * - 1D (daily) - raw data
 * - 1W (weekly) - aggregated from daily
 * - 1M (monthly) - aggregated from daily
 * - 1h, 4h - returns daily with warning (intraday not available yet)
 */

import { NextRequest, NextResponse } from 'next/server';
import { MarketDatabase } from '@/lib/market-data/database/MarketDatabase';
import { aggregateByInterval } from '@/lib/market-data/aggregation';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ symbol: string }> }
) {
  const { symbol } = await params;
  const searchParams = request.nextUrl.searchParams;
  const from = searchParams.get('from');
  const to = searchParams.get('to');
  const limit = searchParams.get('limit');
  const interval = searchParams.get('interval') || '1D'; // Default to daily

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

    // Apply aggregation based on interval
    let chartData;
    let warning = null;

    try {
      const aggregatedData = aggregateByInterval(prices, interval);

      // Check if we're falling back to daily for unsupported intervals
      if ((interval === '1h' || interval === '4h') && aggregatedData.length === prices.length) {
        warning = `Intraday interval ${interval} not available. Showing daily data instead.`;
      }

      chartData = aggregatedData.map(bar => ({
        ...bar,
        value: bar.close // For line chart compatibility
      }));
    } catch (error) {
      // If aggregation fails, return daily data
      console.error(`Aggregation error: ${error}`);
      chartData = prices.map(price => ({
        time: price.date, // YYYY-MM-DD format
        open: price.open,
        high: price.high,
        low: price.low,
        close: price.close,
        value: price.close, // For line chart
        volume: price.volume
      }));
      warning = `Error aggregating to ${interval}. Showing daily data instead.`;
    }

    const response: any = {
      symbol: symbol.toUpperCase(),
      interval,
      data: chartData,
      count: chartData.length,
      from: chartData[0]?.time,
      to: chartData[chartData.length - 1]?.time,
      // Source tracking for multi-provider architecture
      _meta: {
        source: 'sqlite_cache', // TODO: Update when DataRouter is integrated
        timestamp: new Date().toISOString(),
        cached: true
      }
    };

    if (warning) {
      response.warning = warning;
    }

    return NextResponse.json(response);
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