/**
 * Client-side Market Data Service
 * Provides React hooks and utilities for accessing market data
 */

import { DailyPrice, StockMetadata } from '../database/types';

export interface PricePoint {
  date: string;
  price: number;
}

export interface StockQuote {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  date: string;
  previousClose: number;
  dayRange: { low: number; high: number };
  volume: number;
}

export class MarketDataService {
  private baseUrl = '/api/market-data';

  /**
   * Get the latest price for a symbol
   */
  async getLatestPrice(symbol: string): Promise<number | null> {
    try {
      const response = await fetch(`${this.baseUrl}/price/${symbol}`);
      if (!response.ok) return null;
      const data = await response.json();
      return data.price;
    } catch (error) {
      console.error(`Failed to fetch price for ${symbol}:`, error);
      return null;
    }
  }

  /**
   * Get full quote data for a symbol
   */
  async getQuote(symbol: string): Promise<StockQuote | null> {
    try {
      const response = await fetch(`${this.baseUrl}/quote/${symbol}`);
      if (!response.ok) return null;
      return await response.json();
    } catch (error) {
      console.error(`Failed to fetch quote for ${symbol}:`, error);
      return null;
    }
  }

  /**
   * Get price history for a symbol
   */
  async getPriceHistory(
    symbol: string,
    from: string,
    to: string
  ): Promise<DailyPrice[]> {
    try {
      const params = new URLSearchParams({ from, to });
      const response = await fetch(`${this.baseUrl}/history/${symbol}?${params}`);
      if (!response.ok) return [];
      return await response.json();
    } catch (error) {
      console.error(`Failed to fetch history for ${symbol}:`, error);
      return [];
    }
  }

  /**
   * Search for symbols
   */
  async searchSymbols(query: string): Promise<string[]> {
    try {
      const params = new URLSearchParams({ q: query });
      const response = await fetch(`${this.baseUrl}/search?${params}`);
      if (!response.ok) return [];
      return await response.json();
    } catch (error) {
      console.error('Failed to search symbols:', error);
      return [];
    }
  }

  /**
   * Validate if a symbol exists in the database
   */
  async validateSymbol(symbol: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/validate/${symbol}`);
      return response.ok;
    } catch (error) {
      console.error(`Failed to validate ${symbol}:`, error);
      return false;
    }
  }

  /**
   * Get prices for a date
   */
  async getPriceOnDate(symbol: string, date: string): Promise<number | null> {
    try {
      const response = await fetch(`${this.baseUrl}/price/${symbol}/${date}`);
      if (!response.ok) return null;
      const data = await response.json();
      return data.price;
    } catch (error) {
      console.error(`Failed to fetch price for ${symbol} on ${date}:`, error);
      return null;
    }
  }

  /**
   * Get multiple quotes at once
   */
  async getMultipleQuotes(symbols: string[]): Promise<Map<string, StockQuote>> {
    try {
      const response = await fetch(`${this.baseUrl}/quotes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbols })
      });
      if (!response.ok) return new Map();
      const data = await response.json();
      return new Map(Object.entries(data));
    } catch (error) {
      console.error('Failed to fetch multiple quotes:', error);
      return new Map();
    }
  }
}

// Singleton instance
export const marketDataService = new MarketDataService();