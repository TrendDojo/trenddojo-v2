/**
 * Polygon.io Data Provider
 * @business-critical: Primary source for historical market data
 */

import { DailyPrice, StockMetadata } from '../database/types';

export interface PolygonAggregateBar {
  v: number;  // Volume
  vw: number; // Volume weighted average price
  o: number;  // Open
  c: number;  // Close
  h: number;  // High
  l: number;  // Low
  t: number;  // Timestamp
  n: number;  // Number of transactions
}

export interface PolygonResponse {
  ticker: string;
  status: string;
  queryCount: number;
  resultsCount: number;
  adjusted: boolean;
  results: PolygonAggregateBar[];
  next_url?: string;
}

export class PolygonProvider {
  private apiKey: string;
  private baseUrl = 'https://api.polygon.io';

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.POLYGON_API_KEY || '';
    if (!this.apiKey) {
      throw new Error('Polygon API key not provided');
    }
  }

  /**
   * Get daily bars for a symbol
   */
  async getDailyBars(
    symbol: string,
    from: string,
    to: string,
    adjusted: boolean = true
  ): Promise<DailyPrice[]> {
    const url = `${this.baseUrl}/v2/aggs/ticker/${symbol}/range/1/day/${from}/${to}?adjusted=${adjusted}&sort=asc&limit=50000&apiKey=${this.apiKey}`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Polygon API error: ${response.status}`);
      }

      const data: PolygonResponse = await response.json();

      if (data.status !== 'OK' || !data.results) {
        console.warn(`No data for ${symbol} from ${from} to ${to}`);
        return [];
      }

      return data.results.map(bar => ({
        symbol: symbol,
        date: this.timestampToDate(bar.t),
        open: bar.o,
        high: bar.h,
        low: bar.l,
        close: bar.c,
        volume: bar.v,
        adjustedClose: adjusted ? bar.c : bar.c, // Polygon returns adjusted when requested
        dataSource: 'polygon'
      }));
    } catch (error) {
      console.error(`Failed to fetch ${symbol}:`, error);
      return [];
    }
  }

  /**
   * Get real-time quote for a symbol
   */
  async getQuote(symbol: string): Promise<any> {
    const url = `${this.baseUrl}/v2/last/trade/${symbol}?apiKey=${this.apiKey}`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (data.status !== 'OK') {
        throw new Error(`Failed to get quote: ${data.status}`);
      }

      return {
        symbol: data.results?.T,
        price: data.results?.p,
        size: data.results?.s,
        timestamp: data.results?.t,
        conditions: data.results?.c
      };
    } catch (error) {
      console.error(`Failed to fetch quote for ${symbol}:`, error);
      return null;
    }
  }

  /**
   * Get previous day's data for calculating changes
   */
  async getPreviousClose(symbol: string): Promise<any> {
    const url = `${this.baseUrl}/v2/aggs/ticker/${symbol}/prev?adjusted=true&apiKey=${this.apiKey}`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (data.status !== 'OK' || !data.results?.[0]) {
        return null;
      }

      const prev = data.results[0];
      return {
        symbol: data.ticker,
        date: this.timestampToDate(prev.t),
        open: prev.o,
        high: prev.h,
        low: prev.l,
        close: prev.c,
        volume: prev.v,
        vwap: prev.vw
      };
    } catch (error) {
      console.error(`Failed to fetch previous close for ${symbol}:`, error);
      return null;
    }
  }

  /**
   * Get snapshot with day's OHLC and other data
   */
  async getSnapshot(symbol: string): Promise<any> {
    const url = `${this.baseUrl}/v2/snapshot/locale/us/markets/stocks/tickers/${symbol}?apiKey=${this.apiKey}`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (data.status !== 'OK' || !data.ticker) {
        return null;
      }

      const snapshot = data.ticker;
      return {
        symbol: snapshot.ticker,
        day: {
          open: snapshot.day?.o,
          high: snapshot.day?.h,
          low: snapshot.day?.l,
          close: snapshot.day?.c,
          volume: snapshot.day?.v,
          vwap: snapshot.day?.vw
        },
        prevDay: {
          open: snapshot.prevDay?.o,
          high: snapshot.prevDay?.h,
          low: snapshot.prevDay?.l,
          close: snapshot.prevDay?.c,
          volume: snapshot.prevDay?.v,
          vwap: snapshot.prevDay?.vw
        },
        lastQuote: {
          bid: snapshot.lastQuote?.p,
          bidSize: snapshot.lastQuote?.s,
          ask: snapshot.lastQuote?.P,
          askSize: snapshot.lastQuote?.S,
          timestamp: snapshot.lastQuote?.t
        },
        lastTrade: {
          price: snapshot.lastTrade?.p,
          size: snapshot.lastTrade?.s,
          timestamp: snapshot.lastTrade?.t
        },
        updated: snapshot.updated
      };
    } catch (error) {
      console.error(`Failed to fetch snapshot for ${symbol}:`, error);
      return null;
    }
  }

  /**
   * Get intraday bars (4-hour, 1-hour, etc)
   */
  async getIntradayBars(
    symbol: string,
    multiplier: number,
    timespan: 'minute' | 'hour' | 'day',
    from: string,
    to: string
  ): Promise<any[]> {
    const url = `${this.baseUrl}/v2/aggs/ticker/${symbol}/range/${multiplier}/${timespan}/${from}/${to}?adjusted=true&sort=asc&limit=50000&apiKey=${this.apiKey}`;

    try {
      const response = await fetch(url);
      const data: PolygonResponse = await response.json();

      if (data.status !== 'OK' || !data.results) {
        return [];
      }

      return data.results.map(bar => ({
        symbol: symbol,
        timestamp: bar.t,
        date: this.timestampToDate(bar.t),
        timeframe: `${multiplier}${timespan[0]}`, // e.g., "4h", "1h", "5m"
        open: bar.o,
        high: bar.h,
        low: bar.l,
        close: bar.c,
        volume: bar.v,
        vwap: bar.vw,
        transactions: bar.n
      }));
    } catch (error) {
      console.error(`Failed to fetch intraday for ${symbol}:`, error);
      return [];
    }
  }

  /**
   * Get all tickers
   */
  async getAllTickers(
    market: 'stocks' = 'stocks',
    active: boolean = true
  ): Promise<string[]> {
    const url = `${this.baseUrl}/v3/reference/tickers?market=${market}&active=${active}&limit=1000&apiKey=${this.apiKey}`;

    const allTickers: string[] = [];
    let nextUrl: string | null = url;

    while (nextUrl) {
      try {
        const response = await fetch(nextUrl);
        const data: any = await response.json();

        if (data.status !== 'OK' || !data.results) {
          break;
        }

        const tickers = data.results
          .filter((t: any) => t.type === 'CS') // Common Stock only
          .map((t: any) => t.ticker);

        allTickers.push(...tickers);

        // Check for pagination
        nextUrl = data.next_url ? `${data.next_url}&apiKey=${this.apiKey}` : null;

      } catch (error) {
        console.error('Failed to fetch tickers:', error);
        break;
      }
    }

    return allTickers;
  }

  /**
   * Get raw ticker details from Polygon
   */
  async getTickerDetailsRaw(symbol: string): Promise<any | null> {
    const url = `${this.baseUrl}/v3/reference/tickers/${symbol}?apiKey=${this.apiKey}`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (data.status !== 'OK' || !data.results) {
        return null;
      }

      return data.results;
    } catch (error) {
      console.error(`Failed to fetch details for ${symbol}:`, error);
      return null;
    }
  }

  /**
   * Get ticker details (company info)
   */
  async getTickerDetails(symbol: string): Promise<StockMetadata | null> {
    const url = `${this.baseUrl}/v3/reference/tickers/${symbol}?apiKey=${this.apiKey}`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (data.status !== 'OK' || !data.results) {
        return null;
      }

      const result = data.results;
      return {
        symbol: result.ticker,
        companyName: result.name,
        exchange: result.primary_exchange,
        sector: result.sic_description,
        industry: result.type,
        marketCap: result.market_cap,
        sharesOutstanding: result.share_class_shares_outstanding,
        isActive: result.active
      };
    } catch (error) {
      console.error(`Failed to fetch details for ${symbol}:`, error);
      return null;
    }
  }

  /**
   * Convert timestamp to date string
   */
  private timestampToDate(timestamp: number): string {
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Get S&P 500 symbols (hardcoded list - update periodically)
   */
  static getSP500Symbols(): string[] {
    // Top 100 S&P 500 symbols by market cap (as of 2024)
    return [
      'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'META', 'TSLA', 'BRK.B', 'LLY', 'V',
      'JPM', 'UNH', 'XOM', 'JNJ', 'MA', 'AVGO', 'PG', 'HD', 'MRK', 'CVX',
      'ABBV', 'PEP', 'COST', 'ADBE', 'KO', 'WMT', 'CRM', 'MCD', 'CSCO', 'ACN',
      'BAC', 'NFLX', 'AMD', 'TMO', 'LIN', 'ABT', 'CMCSA', 'PFE', 'NKE', 'ORCL',
      'DIS', 'INTC', 'TXN', 'INTU', 'VZ', 'PM', 'WFC', 'IBM', 'COP', 'AMGN',
      'SPGI', 'NOW', 'UNP', 'QCOM', 'GE', 'CAT', 'BA', 'RTX', 'HON', 'NEE',
      'AMAT', 'BKNG', 'GS', 'ELV', 'LOW', 'BMY', 'ISRG', 'UPS', 'BLK', 'TJX',
      'DE', 'PLD', 'VRTX', 'SBUX', 'SYK', 'MDLZ', 'GILD', 'ADI', 'AXP', 'LMT',
      'MS', 'MMC', 'LRCX', 'PANW', 'CVS', 'REGN', 'C', 'ADP', 'TMUS', 'CI',
      'PGR', 'FI', 'CB', 'SCHW', 'KLAC', 'ZTS', 'SO', 'BSX', 'CME', 'MO'
    ];
  }
}