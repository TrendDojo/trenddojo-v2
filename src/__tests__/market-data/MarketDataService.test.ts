/**
 * @business-critical: Market data service orchestrator tests
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { MarketDataService } from '@/lib/market-data/MarketDataService';
import { MockProvider } from '@/lib/market-data/providers/MockProvider';
import { prisma } from '@/lib/prisma';
import { MarketDataError, MarketDataErrorCode } from '@/lib/market-data/types';

// Mock Prisma
vi.mock('@/lib/prisma', () => ({
  prisma: {
    market_data_cache: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      createMany: vi.fn(),
      upsert: vi.fn(),
      deleteMany: vi.fn(),
    },
    stock_technicals: {
      findFirst: vi.fn(),
      upsert: vi.fn(),
    },
  },
}));

describe('MarketDataService', () => {
  let service: MarketDataService;

  beforeEach(async () => {
    vi.clearAllMocks();
    
    // Use mock provider for testing
    service = new MarketDataService({
      defaultProvider: 'mock',
      userTier: 'free',
      cache: {
        currentPriceTTL: 1000, // 1 second for testing
        historicalDataTTL: 2000,
        technicalDataTTL: 3000,
        bulkPriceTTL: 1000,
      },
    });
    
    await service.initialize();
  });

  afterEach(async () => {
    await service.shutdown();
  });

  describe('getCurrentPrice', () => {
    it('should fetch price from provider when cache is empty', async () => {
      (prisma.market_data_cache.findFirst as any).mockResolvedValue(null);

      const price = await service.getCurrentPrice('AAPL');

      expect(price).toBeDefined();
      expect(price.symbol).toBe('AAPL');
      expect(price.price).toBeGreaterThan(0);

      // Should attempt to cache the result
      expect(prisma.market_data_cache.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          symbol: 'AAPL',
          timeframe: 'current',
        }),
      });
    });

    it('should return cached price when available', async () => {
      const cachedPrice = {
        symbol: 'AAPL',
        close: 175.50,
        timestamp: new Date(),
        volume: 50000000,
      };
      
      (prisma.market_data_cache.findFirst as any).mockResolvedValue(cachedPrice);
      
      const price = await service.getCurrentPrice('AAPL');
      
      expect(price.price).toBe(175.50);
      expect(prisma.market_data_cache.findFirst).toHaveBeenCalled();
    });

    it('should use memory cache for subsequent requests', async () => {
      (prisma.market_data_cache.findFirst as any).mockResolvedValue(null);
      
      // First call - fetches from provider
      const price1 = await service.getCurrentPrice('AAPL');
      expect(prisma.market_data_cache.create).toHaveBeenCalledTimes(1);
      
      // Second call - should use memory cache
      const price2 = await service.getCurrentPrice('AAPL');
      expect(price1.symbol).toBe(price2.symbol);
      
      // Create should still only be called once
      expect(prisma.market_data_cache.create).toHaveBeenCalledTimes(1);
    });

    it('should refresh cache after TTL expires', async () => {
      (prisma.market_data_cache.findFirst as any).mockResolvedValue(null);
      
      // First call
      await service.getCurrentPrice('AAPL');
      expect(prisma.market_data_cache.create).toHaveBeenCalledTimes(1);
      
      // Wait for cache to expire
      await new Promise(resolve => setTimeout(resolve, 1100));
      
      // Second call after expiry
      await service.getCurrentPrice('AAPL');
      expect(prisma.market_data_cache.create).toHaveBeenCalledTimes(2);
    });
  });

  describe('getBulkPrices', () => {
    it('should fetch multiple symbols efficiently', async () => {
      (prisma.market_data_cache.findFirst as any).mockResolvedValue(null);
      
      const symbols = ['AAPL', 'GOOGL', 'MSFT'];
      const prices = await service.getBulkPrices(symbols);
      
      expect(prices.size).toBe(3);
      for (const symbol of symbols) {
        expect(prices.get(symbol)).toBeDefined();
        expect(prices.get(symbol)!.symbol).toBe(symbol);
      }
    });

    it('should use cached prices when available', async () => {
      (prisma.market_data_cache.findFirst as any).mockResolvedValue(null);
      
      // Pre-fetch one symbol
      await service.getCurrentPrice('AAPL');
      
      // Bulk fetch including cached symbol
      const prices = await service.getBulkPrices(['AAPL', 'GOOGL']);
      
      expect(prices.size).toBe(2);
      // Should only create cache entry for GOOGL
      expect(prisma.market_data_cache.create).toHaveBeenCalledTimes(2); // 1 for AAPL, 1 for GOOGL
    });
  });

  describe('getHistoricalData', () => {
    it('should fetch historical data from provider', async () => {
      (prisma.market_data_cache.findMany as any).mockResolvedValue([]);
      
      const candles = await service.getHistoricalData({
        symbol: 'AAPL',
        timeframe: '1d',
        limit: 30,
      });
      
      expect(candles).toHaveLength(30);
      expect(candles[0]).toHaveProperty('timestamp');
      expect(candles[0]).toHaveProperty('open');
      expect(candles[0]).toHaveProperty('close');
      
      // Should cache the data
      expect(prisma.market_data_cache.createMany).toHaveBeenCalled();
    });

    it('should return cached historical data when available', async () => {
      const cachedCandles = [
        {
          timestamp: new Date(),
          open: 175,
          high: 176,
          low: 174,
          close: 175.5,
          volume: 50000000,
        },
      ];
      
      (prisma.market_data_cache.findMany as any).mockResolvedValue(cachedCandles);
      
      const candles = await service.getHistoricalData({
        symbol: 'AAPL',
        timeframe: '1d',
        limit: 1,
      });
      
      expect(candles).toHaveLength(1);
      expect(candles[0].close).toBe(175.5);
      expect(prisma.market_data_cache.createMany).not.toHaveBeenCalled();
    });
  });

  describe('getTechnicalIndicators', () => {
    it('should fetch technical indicators', async () => {
      (prisma.stockTechnicals.findFirst as any).mockResolvedValue(null);
      
      const indicators = await service.getTechnicalIndicators('AAPL');
      
      expect(indicators.symbol).toBe('AAPL');
      expect(indicators).toHaveProperty('sma20');
      expect(indicators).toHaveProperty('rsi');
      expect(indicators).toHaveProperty('atr');
      
      // Should cache the indicators
      expect(prisma.stockTechnicals.upsert).toHaveBeenCalled();
    });

    it('should return cached indicators when fresh', async () => {
      const cachedIndicators = {
        symbol: 'AAPL',
        sma_20: 175,
        sma_50: 170,
        rsi: 55,
        atr_20: 3.5,
        updated_at: new Date(),
      };
      
      (prisma.stockTechnicals.findFirst as any).mockResolvedValue(cachedIndicators);
      
      const indicators = await service.getTechnicalIndicators('AAPL');
      
      expect(indicators.sma20).toBe(175);
      expect(indicators.rsi).toBe(55);
      expect(prisma.stockTechnicals.upsert).not.toHaveBeenCalled();
    });
  });

  describe('subscribeToPrice', () => {
    it('should allow subscribing to price updates', async () => {
      const prices: any[] = [];
      
      const subscription = service.subscribeToPrice('AAPL', (price) => {
        prices.push(price);
      });
      
      // Trigger a price update
      await service.getCurrentPrice('AAPL');
      
      expect(prices.length).toBeGreaterThan(0);
      expect(prices[0].symbol).toBe('AAPL');
      
      subscription.unsubscribe();
    });

    it('should support multiple subscribers for same symbol', async () => {
      const prices1: any[] = [];
      const prices2: any[] = [];
      
      const sub1 = service.subscribeToPrice('AAPL', (price) => {
        prices1.push(price);
      });
      
      const sub2 = service.subscribeToPrice('AAPL', (price) => {
        prices2.push(price);
      });
      
      // Trigger a price update
      await service.getCurrentPrice('AAPL');
      
      expect(prices1.length).toBeGreaterThan(0);
      expect(prices2.length).toBeGreaterThan(0);
      
      sub1.unsubscribe();
      sub2.unsubscribe();
    });
  });

  describe('warmupCache', () => {
    it('should pre-fetch data for multiple symbols', async () => {
      (prisma.market_data_cache.findFirst as any).mockResolvedValue(null);
      (prisma.market_data_cache.findMany as any).mockResolvedValue([]);
      
      const symbols = ['AAPL', 'GOOGL', 'MSFT'];
      await service.warmupCache(symbols);
      
      // Should have fetched current prices for all symbols
      expect(prisma.market_data_cache.create).toHaveBeenCalledTimes(3);
      
      // Should have fetched historical data for all symbols
      expect(prisma.market_data_cache.createMany).toHaveBeenCalledTimes(3);
    });
  });

  describe('isSymbolValid', () => {
    it('should validate symbol through provider', async () => {
      const isValid = await service.isSymbolValid('AAPL');
      expect(isValid).toBe(true);
      
      const isInvalid = await service.isSymbolValid('');
      expect(isInvalid).toBe(false);
    });
  });

  describe('getProvidersStatus', () => {
    it('should return status of all providers', async () => {
      const statuses = await service.getProvidersStatus();
      
      expect(statuses).toHaveLength(1); // Only mock provider
      expect(statuses[0].name).toBe('Mock Provider');
      expect(statuses[0].isHealthy).toBe(true);
    });
  });

  describe('error handling', () => {
    it('should handle provider failures gracefully', async () => {
      // Create service with error-prone provider
      const errorService = new MarketDataService({
        defaultProvider: 'mock',
        userTier: 'free',
      });
      
      // Inject a mock provider that always fails
      const errorProvider = new MockProvider({
        simulateErrors: true,
        errorRate: 1, // Always fail
      });
      
      await errorProvider.initialize();
      (errorService as any).primaryProvider = errorProvider;
      (errorService as any).providers.set('mock', errorProvider);
      
      await expect(errorService.getCurrentPrice('AAPL')).rejects.toThrow(MarketDataError);
      
      await errorService.shutdown();
    });
  });

  describe('cache cleanup', () => {
    it('should clean up expired cache entries', async () => {
      // Set very short TTL
      const shortTTLService = new MarketDataService({
        defaultProvider: 'mock',
        cache: {
          currentPriceTTL: 100, // 100ms
          historicalDataTTL: 100,
          technicalDataTTL: 100,
          bulkPriceTTL: 100,
        },
      });
      
      await shortTTLService.initialize();
      
      // Fetch a price
      await shortTTLService.getCurrentPrice('AAPL');
      
      // Wait for cache to expire and cleanup to run
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Cache should be empty now
      const cacheSize = (shortTTLService as any).priceCache.size;
      expect(cacheSize).toBe(0);
      
      await shortTTLService.shutdown();
    });
  });
});