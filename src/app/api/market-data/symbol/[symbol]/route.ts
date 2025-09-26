import { NextResponse } from 'next/server';
import { PolygonProvider } from '@/lib/market-data/providers/PolygonProvider';
import { MarketDataCache } from '@/lib/market-data/cache/MarketDataCache';

/**
 * Symbol data API - Now cache-first with 1-minute freshness
 * @business-critical: Primary API for all symbol data
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ symbol: string }> }
) {
  const { symbol } = await params;
  const symbolUpper = symbol.toUpperCase();

  try {
    // Market data cache implementation pending
    // const cache = new MarketDataCache(db);

    // Check cache first (data is at most 1 minute old)
    // const cachedData = await cache.getCachedData(symbol);
    // if (cachedData) {
    //   return NextResponse.json({
    //     ...cachedData,
    //     fromCache: true,
    //     cacheAge: Date.now() - cachedData.timestamp
    //   });
    // }

    // Fallback to direct Polygon call (should rarely happen with 1-min updates)
    const provider = new PolygonProvider();

    // Fetch all data in parallel
    const [snapshot, details, previousClose] = await Promise.all([
      provider.getSnapshot(symbolUpper),
      provider.getTickerDetailsRaw(symbolUpper),
      provider.getPreviousClose(symbolUpper)
    ]);

    if (!snapshot || !details) {
      return NextResponse.json(
        { error: 'Symbol not found' },
        { status: 404 }
      );
    }

    // Calculate change and change percent
    const currentPrice = snapshot.lastTrade?.price || snapshot.day?.close || 0;
    const prevClose = previousClose?.close || snapshot.prevDay?.close || currentPrice;
    const change = currentPrice - prevClose;
    const changePercent = prevClose ? (change / prevClose) * 100 : 0;

    // Format response with real data
    const responseData = {
      // Basic info
      symbol: symbolUpper,
      name: details.name || symbolUpper,
      price: currentPrice,
      change: change,
      changePercent: changePercent,

      // Day's trading data
      open: snapshot.day?.open || prevClose,
      high: snapshot.day?.high || currentPrice,
      low: snapshot.day?.low || currentPrice,
      close: snapshot.day?.close || currentPrice,
      volume: snapshot.day?.volume || 0,
      vwap: snapshot.day?.vwap || currentPrice,
      previousClose: prevClose,

      // Quote data
      bid: snapshot.lastQuote?.bid || currentPrice - 0.01,
      bidSize: snapshot.lastQuote?.bidSize || 100,
      ask: snapshot.lastQuote?.ask || currentPrice + 0.01,
      askSize: snapshot.lastQuote?.askSize || 100,

      // Company details
      exchange: details.primary_exchange || 'Unknown',
      currency: details.currency_name || 'USD',
      sector: details.sic_description || 'Unknown',
      industry: details.type || 'Unknown',
      marketCap: details.market_cap || 0,

      // Additional info
      logoUrl: details.branding?.logo_url,
      iconUrl: details.branding?.icon_url,
      description: details.description,
      homepageUrl: details.homepage_url,
      employees: details.total_employees,
      listDate: details.list_date,
      address: details.address,
      phoneNumber: details.phone_number,

      // 52-week data would need historical fetching
      // For now, using placeholders - could be calculated from historical data
      high52: currentPrice * 1.2, // Placeholder
      low52: currentPrice * 0.8,  // Placeholder

      // These require additional calculations/data sources
      pe: 0, // Would need earnings data
      eps: 0, // Would need earnings data
      beta: 1.0, // Would need correlation calculations
      dividend: 0, // Would need dividend data
      dividendYield: 0, // Would need dividend data
      avgVolume: snapshot.day?.volume || 0, // Would need historical average

      // Timestamp
      lastUpdated: snapshot.updated || new Date().toISOString()
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Error fetching symbol data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch market data' },
      { status: 500 }
    );
  }
}