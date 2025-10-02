import { NextRequest, NextResponse } from 'next/server';
import { MarketDatabase } from '@/lib/market-data/database/MarketDatabase';

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
  const db = new MarketDatabase();

  try {
    await db.initialize();

    const searchParams = request.nextUrl.searchParams;
    const source = searchParams.get('source') || 'popular'; // 'popular' or 'all'
    const search = searchParams.get('search')?.toUpperCase();

    // Get symbols from local database
    let symbols: string[];
    if (source === 'all') {
      // Get all available symbols from database
      symbols = db.getSymbols();
    } else {
      // Filter popular tickers to only those in database
      symbols = POPULAR_TICKERS.filter(ticker => db.hasSymbol(ticker));
    }

    // Get latest price for each symbol
    let stocks = symbols.map(symbol => {
      const latestPrice = db.getLatestPrice(symbol);

      if (!latestPrice) return null;

      // Get previous day price for change calculation
      const prices = db.getPrices(symbol);
      const previousPrice = prices.length > 1 ? prices[prices.length - 2] : null;

      const currentPrice = latestPrice.close;
      const previousClose = previousPrice?.close || latestPrice.open;
      const change = currentPrice - previousClose;
      const changePercent = previousClose > 0 ? (change / previousClose) * 100 : 0;

      return {
        symbol: symbol,
        name: symbol, // We don't have company names yet
        sector: 'Unknown', // Would need separate metadata
        price: currentPrice,
        change: change,
        changePercent: changePercent,
        volume: latestPrice.volume,
        marketCap: 0, // Not available in price data
        pe: 0, // Would need fundamental data
        weekHigh52: 0, // Would need to calculate from historical data
        weekLow52: 0, // Would need to calculate from historical data
        avgVolume: 0, // Would need to calculate
        rsi: 0, // Would need to calculate from historical data
        movingAvg50: 0, // Would need to calculate from historical data
        movingAvg200: 0, // Would need to calculate from historical data
        signal: null
      };
    }).filter((stock): stock is NonNullable<typeof stock> => stock !== null);

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

    const response = NextResponse.json({
      success: true,
      data: paginatedStocks,
      total: totalCount,
      source,
      provider: 'Local Database',
      timestamp: new Date().toISOString()
    });

    // Add CORS headers for local development
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type');

    return response;

  } catch (error) {
    console.error('[screener-clean] API error:', error);

    // Return empty data on error
    const errorResponse = NextResponse.json({
      success: false,
      data: [],
      error: error instanceof Error ? error.message : 'Failed to fetch market data',
      provider: 'Local Database',
      timestamp: new Date().toISOString()
    }, { status: 500 });

    // Add CORS headers for local development
    errorResponse.headers.set('Access-Control-Allow-Origin', '*');
    errorResponse.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
    errorResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type');

    return errorResponse;
  } finally {
    db.close();
  }
}

// Handle CORS preflight requests
export async function OPTIONS(request: NextRequest) {
  const response = new NextResponse(null, { status: 200 });
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
  return response;
}