import { NextRequest, NextResponse } from 'next/server';

const POLYGON_API_KEY = process.env.POLYGON_API_KEY;

// Curated list of popular stocks for the "Popular" tab
// These are high-volume, widely-traded stocks
const POPULAR_TICKERS = [
  'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META', 'NVDA', 'TSLA',
  'BRK.B', 'JPM', 'V', 'JNJ', 'WMT', 'UNH', 'MA', 'PG',
  'HD', 'DIS', 'BAC', 'XOM', 'CVX', 'ABBV', 'PFE', 'KO',
  'PEP', 'TMO', 'COST', 'MRK', 'AVGO', 'NKE', 'ACN', 'MCD',
  'ADBE', 'NFLX', 'CRM', 'LLY', 'WFC', 'AMD', 'TXN', 'MDT',
  'NEE', 'UPS', 'PM', 'BMY', 'ORCL', 'QCOM', 'RTX', 'LOW',
  'INTC', 'HON', 'INTU', 'CVS', 'MS', 'GS', 'BLK', 'T',
  'CAT', 'SPGI', 'SYK', 'AMGN', 'SBUX', 'DE', 'BA', 'GE',
  'IBM', 'GILD', 'MMC', 'NOW'
];

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const source = searchParams.get('source') || 'popular'; // 'popular' or 'all'
    const search = searchParams.get('search')?.toUpperCase();
    const sector = searchParams.get('sector');

    if (!POLYGON_API_KEY) {
      return NextResponse.json({
        success: false,
        error: 'Market data service not configured',
        data: []
      }, { status: 503 });
    }

    // For "all" stocks, use Polygon's grouped/daily endpoint to get ALL traded stocks
    // For "popular", fetch just our curated list
    let stocksData: any[] = [];

    if (source === 'all') {
      // Get ALL stocks from previous trading day
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      // Skip weekends
      if (yesterday.getDay() === 0) yesterday.setDate(yesterday.getDate() - 2);
      if (yesterday.getDay() === 6) yesterday.setDate(yesterday.getDate() - 1);

      const dateStr = yesterday.toISOString().split('T')[0];

      const response = await fetch(
        `https://api.polygon.io/v2/aggs/grouped/locale/us/market/stocks/${dateStr}?adjusted=true&apiKey=${POLYGON_API_KEY}`
      );

      if (!response.ok) {
        throw new Error(`Polygon API error: ${response.status}`);
      }

      const data = await response.json();
      stocksData = data.results || [];
    } else {
      // For popular stocks, fetch individual snapshots for better data
      const snapshots = await Promise.all(
        POPULAR_TICKERS.map(async (ticker) => {
          try {
            const response = await fetch(
              `https://api.polygon.io/v2/snapshot/locale/us/markets/stocks/tickers/${ticker}?apiKey=${POLYGON_API_KEY}`
            );
            if (response.ok) {
              const data = await response.json();
              return data.ticker;
            }
            return null;
          } catch {
            return null;
          }
        })
      );

      stocksData = snapshots.filter(s => s !== null);
    }

    // Transform Polygon data to our format
    let stocks = stocksData.map(item => {
      const ticker = item.T || item.ticker;
      const dayData = item.day || item;
      const prevDayData = item.prevDay || {};

      // Calculate change
      const currentPrice = dayData.c || dayData.close || 0;
      const previousClose = prevDayData.c || prevDayData.close || dayData.o || 0;
      const change = currentPrice - previousClose;
      const changePercent = previousClose > 0 ? (change / previousClose) * 100 : 0;

      return {
        symbol: ticker,
        name: ticker, // We don't have company names from this endpoint
        sector: 'Unknown', // Would need a separate mapping
        price: currentPrice,
        change: change,
        changePercent: changePercent,
        volume: dayData.v || dayData.volume || 0,
        marketCap: 0, // Not available from grouped endpoint
        pe: 0, // Would need fundamental data endpoint
        weekHigh52: 0, // Would need separate API call
        weekLow52: 0, // Would need separate API call
        avgVolume: 0, // Would need to calculate
        rsi: 0, // Would need to calculate from historical data
        movingAvg50: 0, // Would need to calculate from historical data
        movingAvg200: 0, // Would need to calculate from historical data
        signal: null
      };
    }).filter(stock => stock.price > 0); // Filter out stocks with no price

    // Apply search filter
    if (search) {
      stocks = stocks.filter(s => s.symbol.includes(search));
    }

    // Apply basic filters from query params
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const minVolume = searchParams.get('minVolume');
    const minChange = searchParams.get('minChange');
    const maxChange = searchParams.get('maxChange');

    if (minPrice) stocks = stocks.filter(s => s.price >= parseFloat(minPrice));
    if (maxPrice) stocks = stocks.filter(s => s.price <= parseFloat(maxPrice));
    if (minVolume) stocks = stocks.filter(s => s.volume >= parseFloat(minVolume));
    if (minChange) stocks = stocks.filter(s => s.changePercent >= parseFloat(minChange));
    if (maxChange) stocks = stocks.filter(s => s.changePercent <= parseFloat(maxChange));

    // Sort by market cap (volume as proxy) for "all", by our curated order for "popular"
    if (source === 'all') {
      stocks.sort((a, b) => b.volume - a.volume);
    }

    // Store total count BEFORE pagination
    const totalCount = stocks.length;

    // Apply pagination
    const limit = parseInt(searchParams.get('limit') || '500');
    const offset = parseInt(searchParams.get('offset') || '0');
    const paginatedStocks = stocks.slice(offset, offset + limit);

    return NextResponse.json({
      success: true,
      data: paginatedStocks,
      total: totalCount,  // Return the actual total count, not the paginated count
      source,
      provider: 'Polygon',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('[screener-clean] API error:', error);

    // Return empty data on error - NO MOCK DATA
    return NextResponse.json({
      success: false,
      data: [],
      error: error instanceof Error ? error.message : 'Failed to fetch market data',
      provider: 'Polygon',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}