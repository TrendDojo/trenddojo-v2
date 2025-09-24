/**
 * Yahoo Finance API Proxy Route
 * Handles requests to Yahoo Finance to avoid CORS issues
 */

import { NextRequest, NextResponse } from 'next/server';

// Yahoo Finance base URLs
const YAHOO_API_BASE = 'https://query1.finance.yahoo.com/v8/finance';
const YAHOO_QUERY_BASE = 'https://query2.finance.yahoo.com/v7/finance';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  try {
    // Handle different operations based on query parameters
    if (searchParams.has('symbols')) {
      // Multiple quotes request
      const symbols = searchParams.get('symbols')?.split(',') || [];
      if (symbols.length === 0) {
        return NextResponse.json({ error: 'Symbols required' }, { status: 400 });
      }

      try {
        // Fetch real data for multiple symbols
        const symbolsString = symbols.join(',');
        const url = `${YAHOO_QUERY_BASE}/quote?symbols=${symbolsString}`;
        const response = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });

        if (!response.ok) {
          throw new Error(`Yahoo Finance API error: ${response.status}`);
        }

        const data = await response.json();
        const quotes = data.quoteResponse.result;

        return NextResponse.json(quotes.map((quote: any) => ({
          symbol: quote.symbol,
          shortName: quote.longName || quote.shortName || quote.symbol,
          regularMarketPrice: quote.regularMarketPrice,
          regularMarketChange: quote.regularMarketChange,
          regularMarketChangePercent: quote.regularMarketChangePercent,
          regularMarketVolume: quote.regularMarketVolume,
          marketCap: quote.marketCap,
          sector: quote.sector || 'Unknown',
          previousClose: quote.regularMarketPreviousClose,
          fiftyTwoWeekHigh: quote.fiftyTwoWeekHigh,
          fiftyTwoWeekLow: quote.fiftyTwoWeekLow,
          pe: quote.trailingPE,
          eps: quote.epsTrailingTwelveMonths,
        })));
      } catch (error) {
        console.warn('Failed to fetch real data, using mock:', error);
        const mockData = symbols.map(symbol => getMockQuote(symbol));
        return NextResponse.json(mockData);
      }
    } else if (searchParams.has('symbol')) {
      // Single quote request
      const symbol = searchParams.get('symbol');
      if (!symbol) {
        return NextResponse.json({ error: 'Symbol required' }, { status: 400 });
      }

      try {
        // Fetch real data from Yahoo Finance
        const url = `${YAHOO_API_BASE}/chart/${symbol}`;
        const response = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });

        if (!response.ok) {
          throw new Error(`Yahoo Finance API error: ${response.status}`);
        }

        const data = await response.json();
        const quote = data.chart.result[0];
        const meta = quote.meta;

        return NextResponse.json({
          symbol: meta.symbol,
          shortName: meta.longName || meta.shortName || symbol,
          regularMarketPrice: meta.regularMarketPrice,
          regularMarketChange: meta.regularMarketPrice - meta.previousClose,
          regularMarketChangePercent: ((meta.regularMarketPrice - meta.previousClose) / meta.previousClose) * 100,
          regularMarketVolume: meta.regularMarketVolume,
          marketCap: meta.marketCap,
          sector: meta.sector || 'Unknown',
          previousClose: meta.previousClose,
          fiftyTwoWeekHigh: meta.fiftyTwoWeekHigh,
          fiftyTwoWeekLow: meta.fiftyTwoWeekLow,
        });
      } catch (error) {
        console.warn('Failed to fetch real data, using mock:', error);
        const mockData = getMockQuote(symbol);
        return NextResponse.json(mockData);
      }
    } else if (searchParams.has('type') && searchParams.get('type') === 'market-summary') {
      const mockSummary = {
        indices: [
          { symbol: '^DJI', name: 'Dow Jones', value: 38654.42, change: 125.08, changePercent: 0.32 },
          { symbol: '^GSPC', name: 'S&P 500', value: 5104.76, change: 26.41, changePercent: 0.52 },
          { symbol: '^IXIC', name: 'NASDAQ', value: 16164.85, change: 68.22, changePercent: 0.42 },
          { symbol: '^RUT', name: 'Russell 2000', value: 2124.55, change: -8.44, changePercent: -0.40 },
        ],
        trending: getMockTrendingStocks(),
        gainers: getMockGainers(),
        losers: getMockLosers(),
        mostActive: getMockMostActive(),
      };
      return NextResponse.json(mockSummary);
    } else if (searchParams.has('q')) {
      // Search request
      const query = searchParams.get('q');
      if (!query) {
        return NextResponse.json({ error: 'Query required' }, { status: 400 });
      }

      const mockResults = getMockSearchResults(query);
      return NextResponse.json({ quotes: mockResults });
    } else if (searchParams.has('type') && searchParams.get('type') === 'historical') {
      // Historical data request
      const symbol = searchParams.get('symbol');
      const period = searchParams.get('period') || '1mo';

      if (!symbol) {
        return NextResponse.json({ error: 'Symbol required for historical data' }, { status: 400 });
      }

      const mockData = getMockHistoricalData(symbol, period);
      return NextResponse.json(mockData);
    } else {
      return NextResponse.json({ error: 'Invalid request parameters' }, { status: 400 });
    }
  } catch (error) {
    console.error('Yahoo Finance API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch data' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const criteria = await request.json();
    const mockResults = getMockScreenerResults(criteria);
    return NextResponse.json(mockResults);
  } catch (error) {
    console.error('Yahoo Finance API error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}

// Mock data functions
function getMockQuote(symbol: string) {
  const stocks: Record<string, any> = {
    AAPL: { symbol: 'AAPL', shortName: 'Apple Inc.', regularMarketPrice: 178.25, regularMarketChange: 2.15, regularMarketChangePercent: 1.22, regularMarketVolume: 52847300, marketCap: 2780000000000, sector: 'Technology' },
    MSFT: { symbol: 'MSFT', shortName: 'Microsoft Corporation', regularMarketPrice: 425.75, regularMarketChange: -3.25, regularMarketChangePercent: -0.76, regularMarketVolume: 22154800, marketCap: 3170000000000, sector: 'Technology' },
    GOOGL: { symbol: 'GOOGL', shortName: 'Alphabet Inc.', regularMarketPrice: 175.50, regularMarketChange: 1.85, regularMarketChangePercent: 1.07, regularMarketVolume: 28956200, marketCap: 2180000000000, sector: 'Technology' },
    AMZN: { symbol: 'AMZN', shortName: 'Amazon.com Inc.', regularMarketPrice: 185.75, regularMarketChange: 4.20, regularMarketChangePercent: 2.31, regularMarketVolume: 48652100, marketCap: 1920000000000, sector: 'Consumer Discretionary' },
    TSLA: { symbol: 'TSLA', shortName: 'Tesla Inc.', regularMarketPrice: 245.50, regularMarketChange: -5.75, regularMarketChangePercent: -2.29, regularMarketVolume: 118526400, marketCap: 780000000000, sector: 'Consumer Discretionary' },
  };

  return stocks[symbol] || {
    symbol,
    shortName: `${symbol} Corp.`,
    regularMarketPrice: 100 + Math.random() * 400,
    regularMarketChange: (Math.random() - 0.5) * 10,
    regularMarketChangePercent: (Math.random() - 0.5) * 5,
    regularMarketVolume: Math.floor(Math.random() * 50000000),
    marketCap: Math.floor(Math.random() * 1000000000000),
    sector: 'Unknown',
  };
}

function getMockTrendingStocks() {
  return [
    getMockQuote('NVDA'),
    getMockQuote('TSLA'),
    getMockQuote('AMD'),
    getMockQuote('PLTR'),
    getMockQuote('COIN'),
  ];
}

function getMockGainers() {
  return [
    { ...getMockQuote('NVDA'), regularMarketChangePercent: 8.5 },
    { ...getMockQuote('AMD'), regularMarketChangePercent: 6.2 },
    { ...getMockQuote('COIN'), regularMarketChangePercent: 5.8 },
    { ...getMockQuote('ROKU'), regularMarketChangePercent: 4.9 },
    { ...getMockQuote('SQ'), regularMarketChangePercent: 4.2 },
  ];
}

function getMockLosers() {
  return [
    { ...getMockQuote('RIVN'), regularMarketChangePercent: -7.2 },
    { ...getMockQuote('LCID'), regularMarketChangePercent: -5.8 },
    { ...getMockQuote('HOOD'), regularMarketChangePercent: -4.5 },
    { ...getMockQuote('SNAP'), regularMarketChangePercent: -3.9 },
    { ...getMockQuote('PINS'), regularMarketChangePercent: -3.2 },
  ];
}

function getMockMostActive() {
  return [
    { ...getMockQuote('TSLA'), regularMarketVolume: 118526400 },
    { ...getMockQuote('AAPL'), regularMarketVolume: 98652300 },
    { ...getMockQuote('AMD'), regularMarketVolume: 85632100 },
    { ...getMockQuote('NVDA'), regularMarketVolume: 78956200 },
    { ...getMockQuote('SPY'), regularMarketVolume: 72541800 },
  ];
}

function getMockHistoricalData(symbol: string, period: string) {
  const days = period === '1d' ? 1 : period === '5d' ? 5 : period === '1mo' ? 30 : 90;
  const data = [];
  const basePrice = 100 + Math.random() * 400;
  
  for (let i = days; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const variation = (Math.random() - 0.5) * 10;
    
    data.push({
      date: date.toISOString(),
      open: basePrice + variation,
      high: basePrice + variation + Math.random() * 5,
      low: basePrice + variation - Math.random() * 5,
      close: basePrice + variation + (Math.random() - 0.5) * 3,
      adjClose: basePrice + variation + (Math.random() - 0.5) * 3,
      volume: Math.floor(Math.random() * 50000000) + 10000000,
    });
  }
  
  return data;
}

function getMockSearchResults(query: string) {
  const allStocks = [
    { symbol: 'AAPL', name: 'Apple Inc.', type: 'EQUITY' },
    { symbol: 'MSFT', name: 'Microsoft Corporation', type: 'EQUITY' },
    { symbol: 'GOOGL', name: 'Alphabet Inc.', type: 'EQUITY' },
    { symbol: 'AMZN', name: 'Amazon.com Inc.', type: 'EQUITY' },
    { symbol: 'TSLA', name: 'Tesla Inc.', type: 'EQUITY' },
    { symbol: 'META', name: 'Meta Platforms Inc.', type: 'EQUITY' },
    { symbol: 'NVDA', name: 'NVIDIA Corporation', type: 'EQUITY' },
  ];
  
  return allStocks.filter(stock => 
    stock.symbol.toLowerCase().includes(query.toLowerCase()) ||
    stock.name.toLowerCase().includes(query.toLowerCase())
  );
}

function getMockScreenerResults(criteria: any) {
  // Return filtered mock stocks based on criteria
  const allStocks = [
    getMockQuote('AAPL'),
    getMockQuote('MSFT'),
    getMockQuote('GOOGL'),
    getMockQuote('AMZN'),
    getMockQuote('TSLA'),
    getMockQuote('META'),
    getMockQuote('NVDA'),
    getMockQuote('JPM'),
    getMockQuote('JNJ'),
    getMockQuote('UNH'),
  ];
  
  return allStocks.filter(stock => {
    if (criteria.minPrice && stock.regularMarketPrice < criteria.minPrice) return false;
    if (criteria.maxPrice && stock.regularMarketPrice > criteria.maxPrice) return false;
    if (criteria.minChangePercent && stock.regularMarketChangePercent < criteria.minChangePercent) return false;
    if (criteria.maxChangePercent && stock.regularMarketChangePercent > criteria.maxChangePercent) return false;
    if (criteria.sectors?.length && !criteria.sectors.includes(stock.sector)) return false;
    return true;
  });
}