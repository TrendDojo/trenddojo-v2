/**
 * @business-critical: Yahoo Finance provider tests
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { YahooFinanceProvider } from '@/lib/market-data/providers/YahooFinanceProvider';
import { MarketDataError, MarketDataErrorCode } from '@/lib/market-data/types';

// Mock fetch for testing
global.fetch = vi.fn();

describe('YahooFinanceProvider', () => {
  let provider: YahooFinanceProvider;

  beforeEach(async () => {
    vi.clearAllMocks();
    provider = new YahooFinanceProvider({
      tier: 'free',
      timeout: 5000,
    });
    await provider.initialize();
  });

  afterEach(async () => {
    await provider.shutdown();
  });

  describe('getCurrentPrice', () => {
    it('should fetch and parse price data correctly', async () => {
      const mockResponse = {
        quoteResponse: {
          result: [{
            symbol: 'AAPL',
            regularMarketPrice: 175.50,
            regularMarketTime: 1700000000,
            regularMarketChange: 2.50,
            regularMarketChangePercent: 1.45,
            regularMarketVolume: 50000000,
            bid: 175.49,
            ask: 175.51,
            marketCap: 2750000000000,
          }],
          error: null,
        },
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const price = await provider.getCurrentPrice('AAPL');

      expect(price.symbol).toBe('AAPL');
      expect(price.price).toBe(175.50);
      expect(price.timestamp).toBeInstanceOf(Date);
      expect(price.volume).toBe(50000000);
      expect(price.change).toBe(2.50);
      expect(price.changePercent).toBe(1.45);
      expect(price.bid).toBe(175.49);
      expect(price.ask).toBe(175.51);
    });

    it('should throw error for invalid symbol', async () => {
      const mockResponse = {
        quoteResponse: {
          result: [],
          error: null,
        },
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      await expect(provider.getCurrentPrice('INVALID')).rejects.toThrow(
        new MarketDataError(
          'No data found for symbol: INVALID',
          MarketDataErrorCode.INVALID_SYMBOL,
          'Yahoo Finance'
        )
      );
    });

    it('should retry on network failure', async () => {
      // First two attempts fail, third succeeds
      (global.fetch as any)
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            quoteResponse: {
              result: [{
                symbol: 'AAPL',
                regularMarketPrice: 175.50,
                regularMarketTime: 1700000000,
                regularMarketVolume: 50000000,
              }],
            },
          }),
        });

      const price = await provider.getCurrentPrice('AAPL');
      
      expect(price.price).toBe(175.50);
      expect(global.fetch).toHaveBeenCalledTimes(3);
    });

    it('should throw after max retries', async () => {
      (global.fetch as any).mockRejectedValue(new Error('Network error'));

      await expect(provider.getCurrentPrice('AAPL')).rejects.toThrow(
        new MarketDataError(
          'Failed after retries',
          MarketDataErrorCode.NETWORK_ERROR,
          'Yahoo Finance'
        )
      );
    });
  });

  describe('getBulkPrices', () => {
    it('should fetch multiple symbols in one request', async () => {
      const mockResponse = {
        quoteResponse: {
          result: [
            {
              symbol: 'AAPL',
              regularMarketPrice: 175.50,
              regularMarketTime: 1700000000,
              regularMarketVolume: 50000000,
            },
            {
              symbol: 'GOOGL',
              regularMarketPrice: 140.25,
              regularMarketTime: 1700000000,
              regularMarketVolume: 30000000,
            },
          ],
          error: null,
        },
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const prices = await provider.getBulkPrices(['AAPL', 'GOOGL']);

      expect(prices.size).toBe(2);
      expect(prices.get('AAPL')?.price).toBe(175.50);
      expect(prices.get('GOOGL')?.price).toBe(140.25);
    });

    it('should handle chunking for large symbol lists', async () => {
      // Create 250 symbols (should be split into 2 chunks)
      const symbols = Array.from({ length: 250 }, (_, i) => `SYM${i}`);
      
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({
          quoteResponse: {
            result: [],
            error: null,
          },
        }),
      });

      await provider.getBulkPrices(symbols);

      // Should make 2 requests (200 + 50)
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });
  });

  describe('getHistoricalData', () => {
    it('should fetch and parse historical data', async () => {
      const mockResponse = {
        chart: {
          result: [{
            meta: {
              symbol: 'AAPL',
              regularMarketPrice: 175.50,
              regularMarketTime: 1700000000,
            },
            timestamp: [1699900000, 1700000000, 1700100000],
            indicators: {
              quote: [{
                open: [174.00, 175.00, 175.50],
                high: [175.00, 176.00, 176.50],
                low: [173.50, 174.50, 175.00],
                close: [174.50, 175.50, 176.00],
                volume: [50000000, 55000000, 52000000],
              }],
            },
          }],
          error: null,
        },
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const candles = await provider.getHistoricalData({
        symbol: 'AAPL',
        timeframe: '1d',
        limit: 3,
      });

      expect(candles).toHaveLength(3);
      expect(candles[0].open).toBe(174.00);
      expect(candles[0].high).toBe(175.00);
      expect(candles[0].low).toBe(173.50);
      expect(candles[0].close).toBe(174.50);
      expect(candles[0].volume).toBe(50000000);
    });

    it('should skip invalid data points', async () => {
      const mockResponse = {
        chart: {
          result: [{
            meta: { symbol: 'AAPL' },
            timestamp: [1699900000, 1700000000, 1700100000],
            indicators: {
              quote: [{
                open: [174.00, null, 175.50], // Middle point has null
                high: [175.00, null, 176.50],
                low: [173.50, null, 175.00],
                close: [174.50, null, 176.00],
                volume: [50000000, null, 52000000],
              }],
            },
          }],
        },
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const candles = await provider.getHistoricalData({
        symbol: 'AAPL',
        timeframe: '1d',
      });

      expect(candles).toHaveLength(2); // Should skip the null data point
    });
  });

  describe('getTechnicalIndicators', () => {
    it('should calculate indicators from historical data', async () => {
      // Generate mock data for 200 days
      const timestamps = Array.from({ length: 200 }, (_, i) => 1700000000 + i * 86400);
      const prices = Array.from({ length: 200 }, (_, i) => 150 + Math.sin(i / 10) * 10);
      
      const mockResponse = {
        chart: {
          result: [{
            meta: { symbol: 'AAPL' },
            timestamp: timestamps,
            indicators: {
              quote: [{
                open: prices,
                high: prices.map(p => p + 1),
                low: prices.map(p => p - 1),
                close: prices,
                volume: Array(200).fill(50000000),
              }],
            },
          }],
        },
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const indicators = await provider.getTechnicalIndicators('AAPL');

      expect(indicators.symbol).toBe('AAPL');
      expect(indicators.sma20).toBeGreaterThan(0);
      expect(indicators.sma50).toBeGreaterThan(0);
      expect(indicators.sma200).toBeGreaterThan(0);
      expect(indicators.rsi).toBeGreaterThanOrEqual(0);
      expect(indicators.rsi).toBeLessThanOrEqual(100);
      expect(indicators.atr).toBeGreaterThan(0);
      expect(indicators.bollingerBands).toBeDefined();
    });

    it('should handle insufficient data gracefully', async () => {
      const mockResponse = {
        chart: {
          result: [{
            meta: { symbol: 'AAPL' },
            timestamp: [1700000000],
            indicators: {
              quote: [{
                open: [175.00],
                high: [176.00],
                low: [174.00],
                close: [175.50],
                volume: [50000000],
              }],
            },
          }],
        },
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      await expect(provider.getTechnicalIndicators('AAPL')).rejects.toThrow(
        new MarketDataError(
          'Insufficient data for technical indicators: AAPL',
          MarketDataErrorCode.INVALID_RESPONSE,
          'Yahoo Finance'
        )
      );
    });
  });

  describe('rate limiting', () => {
    it('should track request count', async () => {
      const mockResponse = {
        quoteResponse: {
          result: [{
            symbol: 'AAPL',
            regularMarketPrice: 175.50,
            regularMarketTime: 1700000000,
            regularMarketVolume: 50000000,
          }],
        },
      };

      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      // Make several requests
      for (let i = 0; i < 5; i++) {
        await provider.getCurrentPrice('AAPL');
      }

      const status = await provider.getStatus();
      expect(status.rateLimit?.remaining).toBe(1995); // 2000 - 5
    });
  });

  describe('normalizeSymbol', () => {
    it('should normalize symbols correctly', () => {
      expect(provider.normalizeSymbol('aapl')).toBe('AAPL');
      expect(provider.normalizeSymbol('BTC/USD')).toBe('BTC-USD');
      expect(provider.normalizeSymbol('eth/usd')).toBe('ETH-USD');
    });
  });

  describe('getCapabilities', () => {
    it('should return correct capabilities', () => {
      const capabilities = provider.getCapabilities();
      
      expect(capabilities.realtime).toBe(false);
      expect(capabilities.historical).toBe(true);
      expect(capabilities.technicalIndicators).toBe(true);
      expect(capabilities.streaming).toBe(false);
      expect(capabilities.bulkQuotes).toBe(true);
      expect(capabilities.maxSymbolsPerRequest).toBe(200);
      expect(capabilities.supportedTimeframes).toContain('1d');
      expect(capabilities.supportedMarkets).toContain('US');
    });
  });
});