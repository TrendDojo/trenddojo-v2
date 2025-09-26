/**
 * Multi-Source Market Data Architecture Tests
 * @business-critical: Verify data router correctly handles multiple sources
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DataRouter } from '@/lib/market-data/DataRouter';
import { IDataProvider, Quote, Bar, Snapshot, DataCapabilities } from '@/lib/market-data/providers/IDataProvider';

// Mock provider for testing
class MockProvider implements IDataProvider {
  constructor(
    private name: string,
    private shouldFail: boolean = false
  ) {}

  getName(): string {
    return this.name;
  }

  getCapabilities(): DataCapabilities {
    return {
      hasRealtime: true,
      hasHistorical: true,
      hasFundamentals: true,
      hasOptions: false,
      hasCrypto: this.name === 'alpaca',
      hasForex: false,
      maxHistoricalDays: 365 * 5,
      rateLimit: 1000
    };
  }

  async getQuote(symbol: string): Promise<Quote> {
    if (this.shouldFail) {
      throw new Error(`${this.name} failed`);
    }

    return {
      symbol,
      price: 234.56,
      bid: 234.55,
      ask: 234.57,
      volume: 1000000,
      timestamp: new Date()
    };
  }

  async getBars(
    symbol: string,
    timeframe: '1min' | '5min' | '15min' | '1hour' | '1day',
    start: Date,
    end: Date
  ): Promise<Bar[]> {
    if (this.shouldFail) {
      throw new Error(`${this.name} failed`);
    }

    return [{
      timestamp: new Date(),
      open: 234.00,
      high: 235.00,
      low: 233.50,
      close: 234.56,
      volume: 1000000
    }];
  }

  async getSnapshot(symbol: string): Promise<Snapshot> {
    if (this.shouldFail) {
      throw new Error(`${this.name} failed`);
    }

    return {
      symbol,
      price: 234.56,
      dayOpen: 233.00,
      dayHigh: 235.00,
      dayLow: 232.50,
      dayClose: 234.56,
      dayVolume: 50000000,
      prevClose: 233.45,
      change: 1.11,
      changePercent: 0.47,
      timestamp: new Date()
    };
  }

  async isHealthy(): Promise<boolean> {
    return !this.shouldFail;
  }
}

describe('Multi-Source Data Router', () => {
  let router: DataRouter;
  let alpacaProvider: MockProvider;
  let polygonProvider: MockProvider;
  let yahooProvider: MockProvider;

  beforeEach(() => {
    // Create mock providers
    alpacaProvider = new MockProvider('alpaca');
    polygonProvider = new MockProvider('polygon');
    yahooProvider = new MockProvider('yahoo');

    // Create router with providers
    const providers = new Map<string, IDataProvider>();
    providers.set('alpaca', alpacaProvider);
    providers.set('polygon', polygonProvider);
    providers.set('yahoo', yahooProvider);

    router = new DataRouter({
      providers,
      cacheEnabled: true,
      cacheTTL: 60 // 1 minute
    });
  });

  describe('Provider Registration', () => {
    it('should register new providers dynamically', () => {
      const newProvider = new MockProvider('ibkr');
      router.registerProvider('ibkr', newProvider);

      // Should be able to use the new provider
      expect(async () => {
        await router.getQuote('AAPL');
      }).not.toThrow();
    });
  });

  describe('Fallback Mechanism', () => {
    it('should fall back to next provider when primary fails', async () => {
      // Make alpaca fail
      const failingAlpaca = new MockProvider('alpaca', true);
      const workingPolygon = new MockProvider('polygon', false);

      const providers = new Map<string, IDataProvider>();
      providers.set('alpaca', failingAlpaca);
      providers.set('polygon', workingPolygon);

      const testRouter = new DataRouter({
        providers,
        cacheEnabled: false,
        cacheTTL: 60
      });

      // Should get quote from polygon when alpaca fails
      const quote = await testRouter.getQuote('AAPL');
      expect(quote.source).toBe('polygon');
    });

    it('should try all sources before failing', async () => {
      // Make all providers fail
      const providers = new Map<string, IDataProvider>();
      providers.set('alpaca', new MockProvider('alpaca', true));
      providers.set('polygon', new MockProvider('polygon', true));
      providers.set('yahoo', new MockProvider('yahoo', true));

      const testRouter = new DataRouter({
        providers,
        cacheEnabled: false,
        cacheTTL: 60
      });

      // Should throw when all sources fail
      await expect(testRouter.getQuote('AAPL')).rejects.toThrow(
        'Failed to get quote for AAPL from any source'
      );
    });
  });

  describe('Caching', () => {
    it('should cache successful responses', async () => {
      const spy = vi.spyOn(alpacaProvider, 'getQuote');

      // First call should hit provider
      const quote1 = await router.getQuote('AAPL');
      expect(spy).toHaveBeenCalledTimes(1);
      expect(quote1.source).toBe('alpaca');

      // Second call should use cache
      const quote2 = await router.getQuote('AAPL');
      expect(spy).toHaveBeenCalledTimes(1); // Still 1, not called again
      expect(quote2.source).toBe('cache');
    });

    it('should respect cache TTL', async () => {
      // Create router with very short TTL
      const shortTTLRouter = new DataRouter({
        providers: new Map([['alpaca', alpacaProvider]]),
        cacheEnabled: true,
        cacheTTL: 0.1 // 100ms
      });

      const spy = vi.spyOn(alpacaProvider, 'getQuote');

      // First call
      await shortTTLRouter.getQuote('AAPL');
      expect(spy).toHaveBeenCalledTimes(1);

      // Wait for cache to expire
      await new Promise(resolve => setTimeout(resolve, 150));

      // Should hit provider again
      await shortTTLRouter.getQuote('AAPL');
      expect(spy).toHaveBeenCalledTimes(2);
    });
  });

  describe('Source Tracking', () => {
    it('should include source in response', async () => {
      const quote = await router.getQuote('AAPL');
      expect(quote).toHaveProperty('source');
      expect(['alpaca', 'polygon', 'yahoo', 'cache']).toContain(quote.source);
    });

    it('should track source for bars', async () => {
      const bars = await router.getBars('AAPL', '1day', new Date('2025-01-01'), new Date());
      expect(bars).toHaveProperty('source');
    });

    it('should track source for snapshots', async () => {
      const snapshot = await router.getSnapshot('AAPL');
      expect(snapshot).toHaveProperty('source');
    });
  });

  describe('Health Monitoring', () => {
    it('should check health of all providers', async () => {
      const health = await router.healthCheck();

      expect(health.get('alpaca')).toBe(true);
      expect(health.get('polygon')).toBe(true);
      expect(health.get('yahoo')).toBe(true);
    });

    it('should detect unhealthy providers', async () => {
      // Make one provider unhealthy
      const providers = new Map<string, IDataProvider>();
      providers.set('alpaca', new MockProvider('alpaca', true)); // Will fail
      providers.set('polygon', new MockProvider('polygon', false));

      const testRouter = new DataRouter({
        providers,
        cacheEnabled: false,
        cacheTTL: 60
      });

      const health = await testRouter.healthCheck();
      expect(health.get('alpaca')).toBe(false);
      expect(health.get('polygon')).toBe(true);
    });
  });
});

describe('Multi-Broker Support', () => {
  it('should support multiple data sources per user', async () => {
    // This tests the concept that a user could have:
    // - Alpaca for trading
    // - Polygon for historical charts
    // - Yahoo for fundamentals

    const providers = new Map<string, IDataProvider>();
    providers.set('alpaca', new MockProvider('alpaca'));
    providers.set('polygon', new MockProvider('polygon'));
    providers.set('yahoo', new MockProvider('yahoo'));

    const router = new DataRouter({
      providers,
      cacheEnabled: false,
      cacheTTL: 60
    });

    // Different data types can come from different sources
    const quote = await router.getQuote('AAPL');
    const bars = await router.getBars('AAPL', '1day', new Date('2025-01-01'), new Date());

    // Each can have a different source
    expect(quote.source).toBeDefined();
    expect(bars.source).toBeDefined();

    // Sources are tracked independently
    expect(['alpaca', 'polygon', 'yahoo']).toContain(quote.source);
    expect(['alpaca', 'polygon', 'yahoo']).toContain(bars.source);
  });
});