import { NextRequest, NextResponse } from 'next/server';

export interface ScreenerFilters {
  search?: string;
  sector?: string;
  minPrice?: number;
  maxPrice?: number;
  minVolume?: number;
  maxVolume?: number;
  minMarketCap?: number;
  maxMarketCap?: number;
  minChange?: number;
  maxChange?: number;
  minPE?: number;
  maxPE?: number;
  signal?: 'all' | 'bullish' | 'bearish' | 'overbought' | 'oversold';
  above50MA?: boolean;
  above200MA?: boolean;
  volumeAboveAvg?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface ScreenerStock {
  symbol: string;
  name: string;
  sector: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number;
  pe: number;
  weekHigh52: number;
  weekLow52: number;
  avgVolume: number;
  rsi: number;
  movingAvg50: number;
  movingAvg200: number;
  signal?: string;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Parse filters from query params
    const filters: ScreenerFilters = {
      search: searchParams.get('search') || undefined,
      sector: searchParams.get('sector') || undefined,
      minPrice: searchParams.get('minPrice') ? parseFloat(searchParams.get('minPrice')!) : undefined,
      maxPrice: searchParams.get('maxPrice') ? parseFloat(searchParams.get('maxPrice')!) : undefined,
      minVolume: searchParams.get('minVolume') ? parseFloat(searchParams.get('minVolume')!) : undefined,
      maxVolume: searchParams.get('maxVolume') ? parseFloat(searchParams.get('maxVolume')!) : undefined,
      minMarketCap: searchParams.get('minMarketCap') ? parseFloat(searchParams.get('minMarketCap')!) : undefined,
      maxMarketCap: searchParams.get('maxMarketCap') ? parseFloat(searchParams.get('maxMarketCap')!) : undefined,
      minChange: searchParams.get('minChange') ? parseFloat(searchParams.get('minChange')!) : undefined,
      maxChange: searchParams.get('maxChange') ? parseFloat(searchParams.get('maxChange')!) : undefined,
      minPE: searchParams.get('minPE') ? parseFloat(searchParams.get('minPE')!) : undefined,
      maxPE: searchParams.get('maxPE') ? parseFloat(searchParams.get('maxPE')!) : undefined,
      signal: searchParams.get('signal') as any || 'all',
      above50MA: searchParams.get('above50MA') === 'true',
      above200MA: searchParams.get('above200MA') === 'true',
      volumeAboveAvg: searchParams.get('volumeAboveAvg') === 'true',
      sortBy: searchParams.get('sortBy') || 'changePercent',
      sortOrder: searchParams.get('sortOrder') as any || 'desc',
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 100,
      offset: searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0,
    };

    // Use local market-data/screener endpoint instead of production
    // This endpoint has MarketDataService with Yahoo Finance provider
    let stocks: ScreenerStock[] = [];
    let source = 'local';

    try {
      // Build URL for internal market-data endpoint
      const baseUrl = request.nextUrl.origin;
      const marketDataUrl = `${baseUrl}/api/market-data/screener`;
      const marketDataParams = new URLSearchParams();

      // Pass sector filter if provided
      if (filters.sector && filters.sector !== 'all') {
        marketDataParams.set('sector', filters.sector);
      }

      const fullUrl = `${marketDataUrl}${marketDataParams.toString() ? '?' + marketDataParams.toString() : ''}`;

      const response = await fetch(fullUrl, {
        headers: {
          'Accept': 'application/json',
        },
        // Use a reasonable timeout
        signal: AbortSignal.timeout(5000),
      });

      if (response.ok) {
        const data = await response.json();

        // Transform market-data format to screener format
        stocks = (data.stocks || []).map((stock: any) => ({
          ...stock,
          marketCap: stock.marketCap || stock.price * 1000000000, // Mock if not provided
        }));

        source = data.provider || 'market-data';

        // Apply search filter
        if (filters.search) {
          const searchLower = filters.search.toLowerCase();
          stocks = stocks.filter(stock =>
            stock.symbol.toLowerCase().includes(searchLower) ||
            stock.name.toLowerCase().includes(searchLower)
          );
        }

        // Apply sector filter
        if (filters.sector && filters.sector !== 'all') {
          stocks = stocks.filter(stock => stock.sector === filters.sector);
        }

        // Apply price filters
        if (filters.minPrice) stocks = stocks.filter(stock => stock.price >= filters.minPrice!);
        if (filters.maxPrice) stocks = stocks.filter(stock => stock.price <= filters.maxPrice!);

        // Apply volume filters
        if (filters.minVolume) stocks = stocks.filter(stock => stock.volume >= filters.minVolume!);
        if (filters.maxVolume) stocks = stocks.filter(stock => stock.volume <= filters.maxVolume!);

        // Apply market cap filters
        if (filters.minMarketCap) {
          stocks = stocks.filter(stock => stock.marketCap >= filters.minMarketCap! * 1000000000);
        }
        if (filters.maxMarketCap) {
          stocks = stocks.filter(stock => stock.marketCap <= filters.maxMarketCap! * 1000000000);
        }

        // Apply change percentage filters
        if (filters.minChange) stocks = stocks.filter(stock => stock.changePercent >= filters.minChange!);
        if (filters.maxChange) stocks = stocks.filter(stock => stock.changePercent <= filters.maxChange!);

        // Apply P/E filters
        if (filters.minPE) stocks = stocks.filter(stock => stock.pe >= filters.minPE!);
        if (filters.maxPE) stocks = stocks.filter(stock => stock.pe <= filters.maxPE!);

        // Apply technical signal filters
        if (filters.signal !== 'all') {
          switch (filters.signal) {
            case 'bullish':
              stocks = stocks.filter(stock => stock.price > stock.movingAvg50);
              break;
            case 'bearish':
              stocks = stocks.filter(stock => stock.price < stock.movingAvg50);
              break;
            case 'overbought':
              stocks = stocks.filter(stock => stock.rsi > 70);
              break;
            case 'oversold':
              stocks = stocks.filter(stock => stock.rsi < 30);
              break;
          }
        }

        // Apply moving average filters
        if (filters.above50MA) {
          stocks = stocks.filter(stock => stock.price > stock.movingAvg50);
        }
        if (filters.above200MA) {
          stocks = stocks.filter(stock => stock.price > stock.movingAvg200);
        }
        if (filters.volumeAboveAvg) {
          stocks = stocks.filter(stock => stock.volume > stock.avgVolume);
        }

        // Sort the results
        stocks.sort((a, b) => {
          const aVal = a[filters.sortBy as keyof ScreenerStock] as number;
          const bVal = b[filters.sortBy as keyof ScreenerStock] as number;
          return filters.sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
        });

        // Apply pagination
        const offset = filters.offset || 0;
        const limit = filters.limit || 100;
        const paginatedStocks = stocks.slice(offset, offset + limit);

        return NextResponse.json({
          success: true,
          data: paginatedStocks,
          total: stocks.length,
          filters: filters,
          source: 'production',
        });
      }
    } catch (error) {
      console.error('Failed to fetch from production:', error);
    }

    // Fallback: Return mock data for development
    const mockStocks: ScreenerStock[] = [
      {
        symbol: 'AAPL',
        name: 'Apple Inc.',
        sector: 'Technology',
        price: 175.50,
        change: 2.50,
        changePercent: 1.45,
        volume: 52000000,
        marketCap: 2800000000000,
        pe: 29.5,
        weekHigh52: 198.23,
        weekLow52: 164.08,
        avgVolume: 58000000,
        rsi: 55,
        movingAvg50: 172.30,
        movingAvg200: 168.45,
        signal: 'Buy',
      },
      {
        symbol: 'MSFT',
        name: 'Microsoft Corporation',
        sector: 'Technology',
        price: 420.25,
        change: -1.25,
        changePercent: -0.30,
        volume: 22000000,
        marketCap: 3100000000000,
        pe: 35.2,
        weekHigh52: 430.52,
        weekLow52: 355.60,
        avgVolume: 25000000,
        rsi: 48,
        movingAvg50: 418.60,
        movingAvg200: 395.30,
        signal: 'Hold',
      },
      {
        symbol: 'GOOGL',
        name: 'Alphabet Inc.',
        sector: 'Technology',
        price: 155.75,
        change: 3.25,
        changePercent: 2.13,
        volume: 28000000,
        marketCap: 2000000000000,
        pe: 26.8,
        weekHigh52: 162.35,
        weekLow52: 120.50,
        avgVolume: 30000000,
        rsi: 62,
        movingAvg50: 151.20,
        movingAvg200: 145.80,
        signal: 'Buy',
      },
      {
        symbol: 'JPM',
        name: 'JPMorgan Chase & Co.',
        sector: 'Financial',
        price: 185.30,
        change: -0.75,
        changePercent: -0.40,
        volume: 12000000,
        marketCap: 540000000000,
        pe: 11.2,
        weekHigh52: 195.50,
        weekLow52: 155.25,
        avgVolume: 14000000,
        rsi: 45,
        movingAvg50: 183.40,
        movingAvg200: 175.20,
        signal: 'Hold',
      },
      {
        symbol: 'TSLA',
        name: 'Tesla Inc.',
        sector: 'Consumer',
        price: 245.80,
        change: 8.50,
        changePercent: 3.58,
        volume: 95000000,
        marketCap: 780000000000,
        pe: 65.3,
        weekHigh52: 299.29,
        weekLow52: 152.37,
        avgVolume: 110000000,
        rsi: 68,
        movingAvg50: 235.60,
        movingAvg200: 210.45,
        signal: 'Buy',
      },
    ];

    // Apply filters to mock data
    let filteredMocks = [...mockStocks];

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filteredMocks = filteredMocks.filter(stock =>
        stock.symbol.toLowerCase().includes(searchLower) ||
        stock.name.toLowerCase().includes(searchLower)
      );
    }

    if (filters.sector && filters.sector !== 'all') {
      filteredMocks = filteredMocks.filter(stock => stock.sector === filters.sector);
    }

    // Sort mock data
    filteredMocks.sort((a, b) => {
      const aVal = a[filters.sortBy as keyof ScreenerStock] as number;
      const bVal = b[filters.sortBy as keyof ScreenerStock] as number;
      return filters.sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
    });

    // Apply pagination
    const mockOffset = filters.offset || 0;
    const mockLimit = filters.limit || 100;
    const paginatedMocks = filteredMocks.slice(mockOffset, mockOffset + mockLimit);

    return NextResponse.json({
      success: true,
      data: paginatedMocks,
      total: filteredMocks.length,
      filters: filters,
      source: 'mock',
    });
  } catch (error) {
    console.error('Screener API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch screener data'
      },
      { status: 500 }
    );
  }
}