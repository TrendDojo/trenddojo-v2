/**
 * Market Data Service Orchestrator
 * @business-critical: Central service for all market data operations
 * 
 * This service manages multiple data providers, handles caching,
 * and provides a unified interface for the application.
 */

import { IMarketDataProvider } from './providers/IMarketDataProvider';
import { YahooFinanceProvider } from './providers/YahooFinanceProvider';
import { prisma } from '@/lib/prisma';
import {
  PriceData,
  Candle,
  TechnicalData,
  ProviderStatus,
  PriceSubscription,
  BulkPriceResponse,
  HistoricalDataOptions,
  ProviderConfig,
  MarketDataError,
  MarketDataErrorCode,
  Timeframe,
} from './types';

interface CacheConfig {
  currentPriceTTL: number; // milliseconds
  historicalDataTTL: number;
  technicalDataTTL: number;
  bulkPriceTTL: number;
}

interface ServiceConfig {
  defaultProvider: 'yahoo' | 'polygon' | 'alphavantage' | 'mock';
  fallbackProviders: string[];
  cache: CacheConfig;
  userTier: 'free' | 'basic' | 'pro';
}

export class MarketDataService {
  private providers: Map<string, IMarketDataProvider> = new Map();
  private primaryProvider: IMarketDataProvider | null = null;
  private config: ServiceConfig;
  private priceCache: Map<string, { data: PriceData; expires: number }> = new Map();
  private subscriptions: Map<string, Set<(price: PriceData) => void>> = new Map();
  private cacheCleanupInterval?: NodeJS.Timeout;
  
  constructor(config?: Partial<ServiceConfig>) {
    this.config = {
      defaultProvider: config?.defaultProvider || 'yahoo',
      fallbackProviders: config?.fallbackProviders || [],
      userTier: config?.userTier || 'free',
      cache: {
        currentPriceTTL: config?.cache?.currentPriceTTL || 60000, // 1 minute
        historicalDataTTL: config?.cache?.historicalDataTTL || 300000, // 5 minutes
        technicalDataTTL: config?.cache?.technicalDataTTL || 86400000, // 24 hours
        bulkPriceTTL: config?.cache?.bulkPriceTTL || 60000, // 1 minute
      },
    };
  }
  
  /**
   * Initialize the service with configured providers
   */
  async initialize(): Promise<void> {
    // Initialize primary provider based on user tier
    await this.initializeProviders();
    
    // Start cache cleanup interval
    this.cacheCleanupInterval = setInterval(
      () => this.cleanupCache(),
      60000 // Cleanup every minute
    );
    
    // DEBUG: console.log(`MarketDataService initialized with ${this.providers.size} providers`);
  }
  
  /**
   * Shutdown the service and all providers
   */
  async shutdown(): Promise<void> {
    // Clear cache cleanup interval
    if (this.cacheCleanupInterval) {
      clearInterval(this.cacheCleanupInterval);
      this.cacheCleanupInterval = undefined;
    }
    
    // Shutdown all providers
    for (const provider of this.providers.values()) {
      await provider.shutdown();
    }
    
    // Clear caches
    this.priceCache.clear();
    this.subscriptions.clear();
    this.providers.clear();
    this.primaryProvider = null;
  }
  
  /**
   * Get current price for a symbol
   */
  async getCurrentPrice(symbol: string): Promise<PriceData> {
    // Check memory cache first
    const cached = this.getCachedPrice(symbol);
    if (cached) return cached;
    
    // Check database cache
    const dbCached = await this.getDbCachedPrice(symbol);
    if (dbCached) {
      // Update memory cache
      this.setCachedPrice(symbol, dbCached);
      return dbCached;
    }
    
    // Fetch from provider
    const price = await this.fetchWithFallback(
      async (provider) => provider.getCurrentPrice(symbol)
    );
    
    // Cache the result
    await this.cachePrice(symbol, price);
    
    // Notify subscribers
    this.notifySubscribers(symbol, price);
    
    return price;
  }
  
  /**
   * Get bulk prices for multiple symbols
   */
  async getBulkPrices(symbols: string[]): Promise<BulkPriceResponse> {
    const result = new Map<string, PriceData>();
    const uncachedSymbols: string[] = [];
    
    // Check cache for each symbol
    for (const symbol of symbols) {
      const cached = this.getCachedPrice(symbol);
      if (cached) {
        result.set(symbol, cached);
      } else {
        uncachedSymbols.push(symbol);
      }
    }
    
    // Fetch uncached symbols
    if (uncachedSymbols.length > 0) {
      const freshPrices = await this.fetchWithFallback(
        async (provider) => provider.getBulkPrices(uncachedSymbols)
      );
      
      // Cache and add to result
      for (const [symbol, price] of freshPrices) {
        await this.cachePrice(symbol, price);
        result.set(symbol, price);
        this.notifySubscribers(symbol, price);
      }
    }
    
    return result;
  }
  
  /**
   * Get historical data for a symbol
   */
  async getHistoricalData(options: HistoricalDataOptions): Promise<Candle[]> {
    // Check database cache first
    const cached = await this.getDbCachedHistoricalData(options);
    if (cached && cached.length > 0) {
      return cached;
    }
    
    // Fetch from provider
    const data = await this.fetchWithFallback(
      async (provider) => provider.getHistoricalData(options)
    );
    
    // Cache the result
    await this.cacheHistoricalData(options, data);
    
    return data;
  }
  
  /**
   * Get technical indicators for a symbol
   */
  async getTechnicalIndicators(symbol: string): Promise<TechnicalData> {
    // Check database cache first
    const cached = await this.getDbCachedTechnicalData(symbol);
    if (cached) {
      return cached;
    }
    
    // Fetch from provider
    const data = await this.fetchWithFallback(
      async (provider) => provider.getTechnicalIndicators(symbol)
    );
    
    // Cache the result
    await this.cacheTechnicalData(symbol, data);
    
    return data;
  }
  
  /**
   * Subscribe to real-time price updates
   */
  subscribeToPrice(
    symbol: string,
    callback: (price: PriceData) => void
  ): PriceSubscription {
    // Add to local subscribers
    if (!this.subscriptions.has(symbol)) {
      this.subscriptions.set(symbol, new Set());
    }
    this.subscriptions.get(symbol)!.add(callback);
    
    // If provider supports streaming, subscribe there too
    const provider = this.primaryProvider;
    let providerSub: PriceSubscription | null = null;
    
    if (provider && provider.subscribeToPrice) {
      providerSub = provider.subscribeToPrice(symbol, (price) => {
        // Update cache and notify all subscribers
        this.setCachedPrice(symbol, price);
        this.notifySubscribers(symbol, price);
      });
    }
    
    // Return unsubscribe function
    return {
      symbol,
      unsubscribe: () => {
        const subs = this.subscriptions.get(symbol);
        if (subs) {
          subs.delete(callback);
          if (subs.size === 0) {
            this.subscriptions.delete(symbol);
          }
        }
        if (providerSub) {
          providerSub.unsubscribe();
        }
      },
    };
  }
  
  /**
   * Get status of all providers
   */
  async getProvidersStatus(): Promise<ProviderStatus[]> {
    const statuses: ProviderStatus[] = [];
    
    for (const provider of this.providers.values()) {
      try {
        const status = await provider.getStatus();
        statuses.push(status);
      } catch (error) {
        statuses.push({
          name: provider.name,
          isHealthy: false,
          lastCheck: new Date(),
        });
      }
    }
    
    return statuses;
  }
  
  /**
   * Validate if a symbol exists
   */
  async isSymbolValid(symbol: string): Promise<boolean> {
    return this.fetchWithFallback(
      async (provider) => provider.isSymbolValid(symbol)
    );
  }
  
  /**
   * Warm up cache for active symbols
   */
  async warmupCache(symbols: string[]): Promise<void> {
    // DEBUG: console.log(`Warming up cache for ${symbols.length} symbols...`);
    
    // Fetch prices in bulk
    await this.getBulkPrices(symbols);
    
    // Optionally fetch recent historical data for each
    for (const symbol of symbols) {
      try {
        await this.getHistoricalData({
          symbol,
          timeframe: '1d',
          limit: 30,
        });
      } catch (error) {
        console.error(`Failed to warm up historical data for ${symbol}:`, error);
      }
    }
    
    // DEBUG: console.log('Cache warmup complete');
  }
  
  // Private helper methods
  
  private async initializeProviders(): Promise<void> {
    // Initialize Yahoo provider (always available)
    const yahooProvider = new YahooFinanceProvider({
      tier: this.config.userTier,
    });
    await yahooProvider.initialize();
    this.providers.set('yahoo', yahooProvider);
    
    // Set primary provider based on tier
    switch (this.config.userTier) {
      case 'pro':
        // In future, initialize Polygon provider for pro users
        // For now, fall back to Yahoo
        this.primaryProvider = yahooProvider;
        break;
      case 'basic':
      case 'free':
      default:
        this.primaryProvider = yahooProvider;
        break;
    }
  }
  
  private async fetchWithFallback<T>(
    operation: (provider: IMarketDataProvider) => Promise<T>
  ): Promise<T> {
    // Try primary provider first
    if (this.primaryProvider) {
      try {
        return await operation(this.primaryProvider);
      } catch (error) {
        console.error(`Primary provider failed:`, error);
      }
    }
    
    // Try fallback providers
    for (const providerName of this.config.fallbackProviders) {
      const provider = this.providers.get(providerName);
      if (provider) {
        try {
          return await operation(provider);
        } catch (error) {
          console.error(`Fallback provider ${providerName} failed:`, error);
        }
      }
    }
    
    throw new MarketDataError(
      'All providers failed',
      MarketDataErrorCode.PROVIDER_UNAVAILABLE
    );
  }
  
  // Cache management methods
  
  private getCachedPrice(symbol: string): PriceData | null {
    const cached = this.priceCache.get(symbol);
    if (cached && cached.expires > Date.now()) {
      return cached.data;
    }
    return null;
  }
  
  private setCachedPrice(symbol: string, price: PriceData): void {
    this.priceCache.set(symbol, {
      data: price,
      expires: Date.now() + this.config.cache.currentPriceTTL,
    });
  }
  
  private async getDbCachedPrice(symbol: string): Promise<PriceData | null> {
    try {
      const cached = await prisma.market_data_cache.findFirst({
        where: {
          symbol,
          timeframe: 'current',
          timestamp: {
            gte: new Date(Date.now() - this.config.cache.currentPriceTTL),
          },
        },
        orderBy: { timestamp: 'desc' },
      });
      
      if (cached) {
        return {
          symbol: cached.symbol,
          price: cached.close.toNumber(),
          timestamp: cached.timestamp,
          volume: cached.volume ? Number(cached.volume) : undefined,
        };
      }
    } catch (error) {
      console.error('Failed to get cached price from DB:', error);
    }
    
    return null;
  }
  
  private async cachePrice(symbol: string, price: PriceData): Promise<void> {
    // Update memory cache
    this.setCachedPrice(symbol, price);
    
    // Update database cache
    try {
      await prisma.market_data_cache.create({
        data: {
          symbol,
          timeframe: 'current',
          timestamp: price.timestamp,
          open: price.price,
          high: price.price,
          low: price.price,
          close: price.price,
          volume: price.volume || 0,
        },
      });
    } catch (error) {
      console.error('Failed to cache price in DB:', error);
    }
  }
  
  private async getDbCachedHistoricalData(
    options: HistoricalDataOptions
  ): Promise<Candle[] | null> {
    try {
      const cutoff = new Date(Date.now() - this.config.cache.historicalDataTTL);
      
      const cached = await prisma.market_data_cache.findMany({
        where: {
          symbol: options.symbol,
          timeframe: options.timeframe,
          timestamp: {
            gte: options.range?.start || cutoff,
            lte: options.range?.end || new Date(),
          },
        },
        orderBy: { timestamp: 'asc' },
        take: options.limit,
      });
      
      if (cached.length > 0) {
        return cached.map(c => ({
          timestamp: c.timestamp,
          open: Number(c.open),
          high: Number(c.high),
          low: Number(c.low),
          close: Number(c.close),
          volume: c.volume ? Number(c.volume) : 0,
        }));
      }
    } catch (error) {
      console.error('Failed to get cached historical data from DB:', error);
    }
    
    return null;
  }
  
  private async cacheHistoricalData(
    options: HistoricalDataOptions,
    data: Candle[]
  ): Promise<void> {
    try {
      // Batch insert historical data
      await prisma.market_data_cache.createMany({
        data: data.map(candle => ({
          symbol: options.symbol,
          timeframe: options.timeframe,
          timestamp: candle.timestamp,
          open: candle.open,
          high: candle.high,
          low: candle.low,
          close: candle.close,
          volume: candle.volume,
        })),
        skipDuplicates: true,
      });
    } catch (error) {
      console.error('Failed to cache historical data in DB:', error);
    }
  }
  
  private async getDbCachedTechnicalData(symbol: string): Promise<TechnicalData | null> {
    // Technical indicators feature not implemented
    // Uncomment when table is added
    /*
    try {
      const cached = await prisma.stock_technicals.findFirst({
        where: {
          symbol,
          updated_at: {
            gte: new Date(Date.now() - this.config.cache.technicalDataTTL),
          },
        },
      });

      if (cached) {
        return {
          symbol: cached.symbol,
          timestamp: cached.updated_at,
          sma20: cached.sma_20?.toNumber(),
          sma50: cached.sma_50?.toNumber(),
          sma200: cached.sma_200?.toNumber(),
          rsi: cached.rsi?.toNumber(),
          atr: cached.atr_20?.toNumber(),
        };
      }
    } catch (error) {
      console.error('Failed to get cached technical data from DB:', error);
    }
    */

    return null;
  }
  
  private async cacheTechnicalData(
    symbol: string,
    data: TechnicalData
  ): Promise<void> {
    // Technical indicators feature not implemented
    // Uncomment when table is added
    /*
    try {
      await prisma.stock_technicals.upsert({
        where: { symbol },
        create: {
          symbol,
          sma_20: data.sma20,
          sma_50: data.sma50,
          sma_200: data.sma200,
          rsi: data.rsi,
          atr_20: data.atr,
          updated_at: new Date(),
        },
        update: {
          sma_20: data.sma20,
          sma_50: data.sma50,
          sma_200: data.sma200,
          rsi: data.rsi,
          atr_20: data.atr,
          updated_at: new Date(),
        },
      });
    } catch (error) {
      console.error('Failed to cache technical data in DB:', error);
    }
    */
  }
  
  private notifySubscribers(symbol: string, price: PriceData): void {
    const subscribers = this.subscriptions.get(symbol);
    if (subscribers) {
      for (const callback of subscribers) {
        try {
          callback(price);
        } catch (error) {
          console.error(`Subscriber callback error for ${symbol}:`, error);
        }
      }
    }
  }
  
  private cleanupCache(): void {
    const now = Date.now();
    
    // Cleanup expired memory cache entries
    for (const [symbol, cached] of this.priceCache) {
      if (cached.expires < now) {
        this.priceCache.delete(symbol);
      }
    }
  }
}

// Singleton instance
let marketDataService: MarketDataService | null = null;

export async function getMarketDataService(): Promise<MarketDataService> {
  if (!marketDataService) {
    marketDataService = new MarketDataService();
    await marketDataService.initialize();
  }
  return marketDataService;
}