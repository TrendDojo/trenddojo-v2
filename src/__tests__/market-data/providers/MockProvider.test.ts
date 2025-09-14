/**
 * @business-critical: Market data provider tests
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { MockProvider } from '@/lib/market-data/providers/MockProvider';
import { MarketDataError, MarketDataErrorCode } from '@/lib/market-data/types';

describe('MockProvider', () => {
  let provider: MockProvider;

  beforeEach(async () => {
    provider = new MockProvider({
      latencyMs: 0, // No delay for tests
      simulateErrors: false,
    });
    await provider.initialize();
  });

  afterEach(async () => {
    await provider.shutdown();
  });

  describe('getCurrentPrice', () => {
    it('should return price data for known symbols', async () => {
      const price = await provider.getCurrentPrice('AAPL');
      
      expect(price).toBeDefined();
      expect(price.symbol).toBe('AAPL');
      expect(price.price).toBeGreaterThan(0);
      expect(price.timestamp).toBeInstanceOf(Date);
      expect(price.volume).toBeGreaterThan(0);
      expect(price.bid).toBeLessThan(price.price);
      expect(price.ask).toBeGreaterThan(price.price);
    });

    it('should generate consistent prices for unknown symbols', async () => {
      const price1 = await provider.getCurrentPrice('UNKNOWN');
      const price2 = await provider.getCurrentPrice('UNKNOWN');
      
      expect(price1.symbol).toBe('UNKNOWN');
      expect(price2.symbol).toBe('UNKNOWN');
      // Prices should be close (within volatility range)
      expect(Math.abs(price1.price - price2.price)).toBeLessThan(price1.price * 0.1);
    });

    it('should simulate errors when configured', async () => {
      const errorProvider = new MockProvider({
        simulateErrors: true,
        errorRate: 1, // Always throw error
        latencyMs: 0,
      });
      await errorProvider.initialize();

      await expect(errorProvider.getCurrentPrice('AAPL')).rejects.toThrow(MarketDataError);
      
      await errorProvider.shutdown();
    });
  });

  describe('getBulkPrices', () => {
    it('should return prices for multiple symbols', async () => {
      const symbols = ['AAPL', 'GOOGL', 'MSFT'];
      const prices = await provider.getBulkPrices(symbols);
      
      expect(prices.size).toBe(3);
      for (const symbol of symbols) {
        const price = prices.get(symbol);
        expect(price).toBeDefined();
        expect(price!.symbol).toBe(symbol);
        expect(price!.price).toBeGreaterThan(0);
      }
    });

    it('should handle empty array', async () => {
      const prices = await provider.getBulkPrices([]);
      expect(prices.size).toBe(0);
    });
  });

  describe('getHistoricalData', () => {
    it('should return historical candles', async () => {
      const candles = await provider.getHistoricalData({
        symbol: 'AAPL',
        timeframe: '1d',
        limit: 30,
      });
      
      expect(candles).toHaveLength(30);
      
      for (const candle of candles) {
        expect(candle.timestamp).toBeInstanceOf(Date);
        expect(candle.open).toBeGreaterThan(0);
        expect(candle.high).toBeGreaterThanOrEqual(candle.open);
        expect(candle.high).toBeGreaterThanOrEqual(candle.close);
        expect(candle.low).toBeLessThanOrEqual(candle.open);
        expect(candle.low).toBeLessThanOrEqual(candle.close);
        expect(candle.volume).toBeGreaterThan(0);
      }
    });

    it('should respect date range filters', async () => {
      const end = new Date();
      const start = new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000); // 7 days ago
      
      const candles = await provider.getHistoricalData({
        symbol: 'AAPL',
        timeframe: '1d',
        range: { start, end },
      });
      
      for (const candle of candles) {
        expect(candle.timestamp.getTime()).toBeGreaterThanOrEqual(start.getTime());
        expect(candle.timestamp.getTime()).toBeLessThanOrEqual(end.getTime());
      }
    });

    it('should respect limit parameter', async () => {
      const candles = await provider.getHistoricalData({
        symbol: 'AAPL',
        timeframe: '1d',
        limit: 10,
      });
      
      expect(candles).toHaveLength(10);
    });
  });

  describe('getTechnicalIndicators', () => {
    it('should return technical indicators', async () => {
      const indicators = await provider.getTechnicalIndicators('AAPL');
      
      expect(indicators.symbol).toBe('AAPL');
      expect(indicators.timestamp).toBeInstanceOf(Date);
      expect(indicators.sma20).toBeGreaterThan(0);
      expect(indicators.sma50).toBeGreaterThan(0);
      expect(indicators.rsi).toBeGreaterThanOrEqual(0);
      expect(indicators.rsi).toBeLessThanOrEqual(100);
      expect(indicators.atr).toBeGreaterThan(0);
      expect(indicators.bollingerBands).toBeDefined();
      expect(indicators.bollingerBands!.upper).toBeGreaterThan(indicators.bollingerBands!.middle);
      expect(indicators.bollingerBands!.lower).toBeLessThan(indicators.bollingerBands!.middle);
    });
  });

  describe('subscribeToPrice', () => {
    it('should provide price updates via callback', async () => {
      const prices: any[] = [];
      const subscription = provider.subscribeToPrice('AAPL', (price) => {
        prices.push(price);
      });

      // Wait for at least one update
      await new Promise(resolve => setTimeout(resolve, 5500));
      
      expect(prices.length).toBeGreaterThan(0);
      expect(prices[0].symbol).toBe('AAPL');
      
      subscription.unsubscribe();
    }, 10000);

    it('should stop updates after unsubscribe', async () => {
      let updateCount = 0;
      const subscription = provider.subscribeToPrice('AAPL', () => {
        updateCount++;
      });

      await new Promise(resolve => setTimeout(resolve, 5500));
      const countAfterFirstUpdate = updateCount;
      
      subscription.unsubscribe();
      
      await new Promise(resolve => setTimeout(resolve, 5500));
      expect(updateCount).toBe(countAfterFirstUpdate);
    }, 12000);
  });

  describe('getStatus', () => {
    it('should return provider status', async () => {
      const status = await provider.getStatus();
      
      expect(status.name).toBe('Mock Provider');
      expect(status.isHealthy).toBe(true);
      expect(status.lastCheck).toBeInstanceOf(Date);
      expect(status.latency).toBe(0);
    });
  });

  describe('getCapabilities', () => {
    it('should return provider capabilities', () => {
      const capabilities = provider.getCapabilities();
      
      expect(capabilities.realtime).toBe(true);
      expect(capabilities.historical).toBe(true);
      expect(capabilities.technicalIndicators).toBe(true);
      expect(capabilities.streaming).toBe(true);
      expect(capabilities.bulkQuotes).toBe(true);
      expect(capabilities.maxSymbolsPerRequest).toBe(1000);
      expect(capabilities.supportedTimeframes).toContain('1d');
      expect(capabilities.supportedMarkets).toContain('TEST');
    });
  });

  describe('isSymbolValid', () => {
    it('should validate symbol format', async () => {
      expect(await provider.isSymbolValid('AAPL')).toBe(true);
      expect(await provider.isSymbolValid('TEST')).toBe(true);
      expect(await provider.isSymbolValid('')).toBe(false);
      expect(await provider.isSymbolValid('VERYLONGSYMBOL')).toBe(false);
    });
  });

  describe('normalizeSymbol', () => {
    it('should normalize symbol to uppercase', () => {
      expect(provider.normalizeSymbol('aapl')).toBe('AAPL');
      expect(provider.normalizeSymbol('Msft')).toBe('MSFT');
      expect(provider.normalizeSymbol('BTC-USD')).toBe('BTC-USD');
    });
  });

  describe('error simulation', () => {
    it('should simulate various error types', async () => {
      const errorProvider = new MockProvider({
        simulateErrors: true,
        errorRate: 0.5, // 50% error rate
        latencyMs: 0,
      });
      await errorProvider.initialize();

      let errorCount = 0;
      const attempts = 20;
      
      for (let i = 0; i < attempts; i++) {
        try {
          await errorProvider.getCurrentPrice('AAPL');
        } catch (error) {
          errorCount++;
          expect(error).toBeInstanceOf(MarketDataError);
        }
      }
      
      // Should have some errors but not all (statistical test)
      expect(errorCount).toBeGreaterThan(0);
      expect(errorCount).toBeLessThan(attempts);
      
      await errorProvider.shutdown();
    });
  });

  describe('latency simulation', () => {
    it('should simulate network latency', async () => {
      const latencyProvider = new MockProvider({
        latencyMs: 100,
        simulateErrors: false,
      });
      await latencyProvider.initialize();

      const start = Date.now();
      await latencyProvider.getCurrentPrice('AAPL');
      const duration = Date.now() - start;
      
      expect(duration).toBeGreaterThanOrEqual(100);
      
      await latencyProvider.shutdown();
    });
  });
});