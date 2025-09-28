import { NextRequest, NextResponse } from 'next/server';
import { MarketDataService } from '@/lib/market-data/MarketDataService';

// Popular stocks for the screener
const DEFAULT_SYMBOLS = [
  // Tech giants
  'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META', 'NVDA', 'TSLA',
  // Finance
  'JPM', 'BAC', 'WFC', 'GS', 'MS', 'BRK-B', 'V', 'MA',
  // Healthcare
  'JNJ', 'UNH', 'PFE', 'ABBV', 'TMO', 'MRK', 'LLY',
  // Energy
  'XOM', 'CVX', 'COP', 'SLB', 'EOG',
  // Consumer
  'WMT', 'HD', 'PG', 'KO', 'PEP', 'NKE', 'MCD', 'SBUX',
  // Industrial
  'BA', 'CAT', 'GE', 'MMM', 'UPS', 'HON',
  // Semiconductors
  'AMD', 'INTC', 'QCOM', 'MU', 'AVGO', 'TXN', 'AMAT', 'LRCX',
  // Software
  'CRM', 'ADBE', 'ORCL', 'NOW', 'INTU', 'UBER', 'SQ', 'SHOP',
  // Entertainment
  'DIS', 'NFLX', 'ROKU', 'SPOT',
  // Other popular
  'PYPL', 'COIN', 'PLTR', 'SOFI', 'RIVN', 'LCID'
];

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const customSymbols = searchParams.get('symbols');
    const sector = searchParams.get('sector');
    
    // Use custom symbols if provided, otherwise use defaults
    const symbols = customSymbols 
      ? customSymbols.split(',').map(s => s.trim().toUpperCase())
      : DEFAULT_SYMBOLS;
    
    // Initialize market data service
    const marketDataService = new MarketDataService();
    await marketDataService.initialize();
    
    // Fetch bulk prices
    const priceData = await marketDataService.getBulkPrices(symbols);
    
    // Transform data for screener
    const stocks = Array.from(priceData.entries()).map(([symbol, data]) => {
      // Calculate technical signals (simplified)
      const rsi = 50 + (Math.random() - 0.5) * 50; // Mock RSI for now
      const isOverbought = rsi > 70;
      const isOversold = rsi < 30;
      
      return {
        symbol: data.symbol,
        name: data.symbol, // Would need a separate lookup for company names
        sector: getSectorForSymbol(data.symbol), // Mock sector assignment
        price: data.price,
        change: data.change || 0,
        changePercent: data.changePercent || 0,
        volume: data.volume || 0,
        marketCap: data.marketCap || 0,
        pe: 15 + Math.random() * 20, // Mock P/E ratio
        weekHigh52: data.price * (1.1 + Math.random() * 0.3), // Mock 52-week high
        weekLow52: data.price * (0.6 + Math.random() * 0.3), // Mock 52-week low
        avgVolume: data.volume || 1000000, // Mock average volume
        rsi,
        movingAvg50: data.price * (0.95 + Math.random() * 0.1), // Mock MA50
        movingAvg200: data.price * (0.9 + Math.random() * 0.2), // Mock MA200
        signal: isOverbought ? 'overbought' : isOversold ? 'oversold' : 'neutral',
      };
    });
    
    // Filter by sector if requested
    const filteredStocks = sector && sector !== 'all'
      ? stocks.filter(s => s.sector === sector)
      : stocks;
    
    // Sort by change percent (biggest movers first)
    filteredStocks.sort((a, b) => Math.abs(b.changePercent) - Math.abs(a.changePercent));
    
    // Get the actual provider being used
    const provider = marketDataService.getActiveProviderName() ||
      (process.env.POLYGON_API_KEY ? 'polygon' : 'yahoo');

    return NextResponse.json({
      stocks: filteredStocks,
      timestamp: new Date().toISOString(),
      provider,
    });
  } catch (error) {
    console.error('Screener API error:', error);
    
    // Return mock data as fallback
    const mockStocks = DEFAULT_SYMBOLS.slice(0, 20).map(symbol => ({
      symbol,
      name: `${symbol} Company`,
      sector: getSectorForSymbol(symbol),
      price: 50 + Math.random() * 450,
      change: (Math.random() - 0.5) * 20,
      changePercent: (Math.random() - 0.5) * 10,
      volume: Math.floor(Math.random() * 100000000),
      marketCap: Math.floor(Math.random() * 1000000000000),
      pe: Math.random() * 50,
      weekHigh52: 100 + Math.random() * 500,
      weekLow52: 10 + Math.random() * 400,
      avgVolume: Math.floor(Math.random() * 50000000),
      rsi: Math.random() * 100,
      movingAvg50: 50 + Math.random() * 450,
      movingAvg200: 50 + Math.random() * 450,
      signal: 'neutral',
    }));
    
    return NextResponse.json({
      stocks: mockStocks,
      timestamp: new Date().toISOString(),
      provider: 'mock',
      error: 'Using mock data due to market data service error',
    });
  }
}

// Helper function to assign sectors (would be better with a proper mapping)
function getSectorForSymbol(symbol: string): string {
  const sectorMap: Record<string, string> = {
    // Tech
    'AAPL': 'Technology', 'MSFT': 'Technology', 'GOOGL': 'Technology', 
    'META': 'Technology', 'NVDA': 'Technology', 'TSLA': 'Technology',
    'AMD': 'Technology', 'INTC': 'Technology', 'CRM': 'Technology',
    'ADBE': 'Technology', 'ORCL': 'Technology', 'NOW': 'Technology',
    'QCOM': 'Technology', 'MU': 'Technology', 'AVGO': 'Technology',
    'PYPL': 'Technology', 'SQ': 'Technology', 'SHOP': 'Technology',
    'COIN': 'Technology', 'PLTR': 'Technology', 'UBER': 'Technology',
    
    // Finance
    'JPM': 'Finance', 'BAC': 'Finance', 'WFC': 'Finance', 
    'GS': 'Finance', 'MS': 'Finance', 'BRK-B': 'Finance',
    'V': 'Finance', 'MA': 'Finance', 'SOFI': 'Finance',
    
    // Healthcare
    'JNJ': 'Healthcare', 'UNH': 'Healthcare', 'PFE': 'Healthcare',
    'ABBV': 'Healthcare', 'TMO': 'Healthcare', 'MRK': 'Healthcare',
    'LLY': 'Healthcare',
    
    // Energy
    'XOM': 'Energy', 'CVX': 'Energy', 'COP': 'Energy',
    'SLB': 'Energy', 'EOG': 'Energy',
    
    // Consumer
    'AMZN': 'Consumer', 'WMT': 'Consumer', 'HD': 'Consumer',
    'PG': 'Consumer', 'KO': 'Consumer', 'PEP': 'Consumer',
    'NKE': 'Consumer', 'MCD': 'Consumer', 'SBUX': 'Consumer',
    'DIS': 'Consumer', 'NFLX': 'Consumer', 'ROKU': 'Consumer',
    'SPOT': 'Consumer',
    
    // Industrial
    'BA': 'Industrial', 'CAT': 'Industrial', 'GE': 'Industrial',
    'MMM': 'Industrial', 'UPS': 'Industrial', 'HON': 'Industrial',
    'RIVN': 'Industrial', 'LCID': 'Industrial',
  };
  
  return sectorMap[symbol] || 'Other';
}