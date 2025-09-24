/**
 * Yahoo Finance Data Service
 * @business-critical: Market data provider for stock screening and analysis
 */

export interface StockQuote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap?: number;
  dayHigh?: number;
  dayLow?: number;
  fiftyTwoWeekHigh?: number;
  fiftyTwoWeekLow?: number;
  pe?: number;
  eps?: number;
  beta?: number;
  sector?: string;
  industry?: string;
  lastUpdated: Date;
}

export interface MarketSummary {
  indices: IndexData[];
  trending: StockQuote[];
  gainers: StockQuote[];
  losers: StockQuote[];
  mostActive: StockQuote[];
}

export interface IndexData {
  symbol: string;
  name: string;
  value: number;
  change: number;
  changePercent: number;
}

export interface HistoricalData {
  date: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  adjustedClose: number;
  volume: number;
}

export interface ScreenerCriteria {
  minPrice?: number;
  maxPrice?: number;
  minMarketCap?: number;
  maxMarketCap?: number;
  minVolume?: number;
  minChangePercent?: number;
  maxChangePercent?: number;
  sectors?: string[];
  industries?: string[];
  signals?: string[];
}

/**
 * Yahoo Finance API Service
 * Note: Uses unofficial Yahoo Finance API endpoints
 * For production, consider using official data providers
 */
export class YahooFinanceService {
  private static baseUrl = 'https://query2.finance.yahoo.com';
  private static proxyUrl = '/api/market-data/yahoo'; // We'll create an API route to avoid CORS

  /**
   * Get real-time quote for a single stock
   */
  static async getQuote(symbol: string): Promise<StockQuote | null> {
    try {
      const response = await fetch(`${this.proxyUrl}/quote?symbol=${symbol}`);
      if (!response.ok) throw new Error('Failed to fetch quote');

      const data = await response.json();
      return this.parseQuoteData(data);
    } catch (error) {
      console.error(`Error fetching quote for ${symbol}:`, error);
      return null;
    }
  }

  /**
   * Get multiple quotes at once
   */
  static async getQuotes(symbols: string[]): Promise<StockQuote[]> {
    try {
      const symbolsParam = symbols.join(',');
      const response = await fetch(`${this.proxyUrl}/quotes?symbols=${symbolsParam}`);
      if (!response.ok) throw new Error('Failed to fetch quotes');

      const data = await response.json();
      return data.map((item: any) => this.parseQuoteData(item)).filter(Boolean);
    } catch (error) {
      console.error('Error fetching quotes:', error);
      return [];
    }
  }

  /**
   * Get market summary with indices and movers
   */
  static async getMarketSummary(): Promise<MarketSummary> {
    try {
      const response = await fetch(`${this.proxyUrl}/market-summary`);
      if (!response.ok) throw new Error('Failed to fetch market summary');
      
      const data = await response.json();
      return {
        indices: data.indices || [],
        trending: data.trending || [],
        gainers: data.gainers || [],
        losers: data.losers || [],
        mostActive: data.mostActive || [],
      };
    } catch (error) {
      console.error('Error fetching market summary:', error);
      return {
        indices: [],
        trending: [],
        gainers: [],
        losers: [],
        mostActive: [],
      };
    }
  }

  /**
   * Get historical data for a stock
   */
  static async getHistoricalData(
    symbol: string,
    period: '1d' | '5d' | '1mo' | '3mo' | '6mo' | '1y' | '2y' | '5y' = '1mo'
  ): Promise<HistoricalData[]> {
    try {
      const response = await fetch(
        `${this.proxyUrl}/historical?symbol=${symbol}&period=${period}`
      );
      if (!response.ok) throw new Error('Failed to fetch historical data');
      
      const data = await response.json();
      return data.map((item: any) => ({
        date: new Date(item.date),
        open: item.open,
        high: item.high,
        low: item.low,
        close: item.close,
        adjustedClose: item.adjClose,
        volume: item.volume,
      }));
    } catch (error) {
      console.error(`Error fetching historical data for ${symbol}:`, error);
      return [];
    }
  }

  /**
   * Screen stocks based on criteria
   */
  static async screenStocks(criteria: ScreenerCriteria): Promise<StockQuote[]> {
    try {
      const response = await fetch(`${this.proxyUrl}/screener`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(criteria),
      });
      if (!response.ok) throw new Error('Failed to screen stocks');
      
      const data = await response.json();
      return data.map((item: any) => this.parseQuoteData(item)).filter(Boolean);
    } catch (error) {
      console.error('Error screening stocks:', error);
      return [];
    }
  }

  /**
   * Search for stocks by name or symbol
   */
  static async searchStocks(query: string): Promise<Array<{ symbol: string; name: string; type: string }>> {
    try {
      const response = await fetch(`${this.proxyUrl}/search?q=${encodeURIComponent(query)}`);
      if (!response.ok) throw new Error('Failed to search stocks');
      
      const data = await response.json();
      return data.quotes || [];
    } catch (error) {
      console.error('Error searching stocks:', error);
      return [];
    }
  }

  /**
   * Parse raw quote data from Yahoo Finance
   */
  private static parseQuoteData(data: any): StockQuote | null {
    if (!data) return null;

    try {
      return {
        symbol: data.symbol,
        name: data.shortName || data.longName || data.symbol,
        price: data.regularMarketPrice || data.price || 0,
        change: data.regularMarketChange || data.change || 0,
        changePercent: data.regularMarketChangePercent || data.changePercent || 0,
        volume: data.regularMarketVolume || data.volume || 0,
        marketCap: data.marketCap,
        dayHigh: data.regularMarketDayHigh || data.dayHigh,
        dayLow: data.regularMarketDayLow || data.dayLow,
        fiftyTwoWeekHigh: data.fiftyTwoWeekHigh,
        fiftyTwoWeekLow: data.fiftyTwoWeekLow,
        pe: data.trailingPE || data.forwardPE,
        eps: data.epsTrailingTwelveMonths || data.epsForward,
        beta: data.beta,
        sector: data.sector,
        industry: data.industry,
        lastUpdated: new Date(),
      };
    } catch (error) {
      console.error('Error parsing quote data:', error);
      return null;
    }
  }

  /**
   * Get mock data for development
   */
  static getMockQuotes(): StockQuote[] {
    const mockStocks = [
      { symbol: 'AAPL', name: 'Apple Inc.', price: 178.25, change: 2.15, changePercent: 1.22, sector: 'Technology' },
      { symbol: 'MSFT', name: 'Microsoft Corporation', price: 425.75, change: -3.25, changePercent: -0.76, sector: 'Technology' },
      { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 175.50, change: 1.85, changePercent: 1.07, sector: 'Technology' },
      { symbol: 'AMZN', name: 'Amazon.com Inc.', price: 185.75, change: 4.20, changePercent: 2.31, sector: 'Consumer Discretionary' },
      { symbol: 'TSLA', name: 'Tesla Inc.', price: 245.50, change: -5.75, changePercent: -2.29, sector: 'Consumer Discretionary' },
      { symbol: 'META', name: 'Meta Platforms Inc.', price: 505.25, change: 8.90, changePercent: 1.79, sector: 'Technology' },
      { symbol: 'NVDA', name: 'NVIDIA Corporation', price: 875.50, change: 12.30, changePercent: 1.42, sector: 'Technology' },
      { symbol: 'JPM', name: 'JPMorgan Chase & Co.', price: 195.80, change: -1.20, changePercent: -0.61, sector: 'Financials' },
      { symbol: 'JNJ', name: 'Johnson & Johnson', price: 155.25, change: 0.85, changePercent: 0.55, sector: 'Healthcare' },
      { symbol: 'UNH', name: 'UnitedHealth Group', price: 525.60, change: 3.40, changePercent: 0.65, sector: 'Healthcare' },
      { symbol: 'PG', name: 'Procter & Gamble', price: 165.30, change: -0.50, changePercent: -0.30, sector: 'Consumer Staples' },
      { symbol: 'HD', name: 'Home Depot', price: 385.20, change: 2.80, changePercent: 0.73, sector: 'Consumer Discretionary' },
      { symbol: 'V', name: 'Visa Inc.', price: 275.90, change: 1.65, changePercent: 0.60, sector: 'Financials' },
      { symbol: 'MA', name: 'Mastercard Inc.', price: 465.30, change: 2.10, changePercent: 0.45, sector: 'Financials' },
      { symbol: 'DIS', name: 'Walt Disney Co.', price: 95.80, change: -1.90, changePercent: -1.94, sector: 'Communications' },
      { symbol: 'NFLX', name: 'Netflix Inc.', price: 485.60, change: 6.20, changePercent: 1.29, sector: 'Communications' },
      { symbol: 'PFE', name: 'Pfizer Inc.', price: 28.90, change: -0.35, changePercent: -1.20, sector: 'Healthcare' },
      { symbol: 'KO', name: 'Coca-Cola Co.', price: 61.25, change: 0.15, changePercent: 0.25, sector: 'Consumer Staples' },
      { symbol: 'WMT', name: 'Walmart Inc.', price: 175.80, change: 1.20, changePercent: 0.69, sector: 'Consumer Staples' },
      { symbol: 'XOM', name: 'Exxon Mobil', price: 105.60, change: -2.30, changePercent: -2.13, sector: 'Energy' },
    ];

    return mockStocks.map(stock => ({
      ...stock,
      volume: Math.floor(Math.random() * 50000000) + 1000000,
      marketCap: stock.price * Math.floor(Math.random() * 1000000000) + 100000000,
      dayHigh: stock.price * (1 + Math.random() * 0.02),
      dayLow: stock.price * (1 - Math.random() * 0.02),
      lastUpdated: new Date(),
    }));
  }
}