/**
 * Smart Data Router
 * @business-critical: Routes market data requests to optimal source
 *
 * Manages multiple data providers and intelligently routes requests
 * based on user preferences, data availability, and cost optimization
 */

import { IDataProvider, Quote, Bar, Snapshot, Fundamentals } from './providers/IDataProvider';
import { prisma } from '@/lib/prisma';

export interface UserDataPreferences {
  userId: string;
  quotes: string;      // Primary source for quotes
  charts: string;      // Primary source for charts
  fundamentals: string; // Primary source for fundamentals
  fallbackSources: string[]; // Ordered list of fallbacks
}

export interface DataRouterConfig {
  providers: Map<string, IDataProvider>;
  cacheEnabled: boolean;
  cacheTTL: number; // seconds
}

export class DataRouter {
  private providers: Map<string, IDataProvider>;
  private cache: Map<string, { data: any; expires: Date }> = new Map();
  private config: DataRouterConfig;

  constructor(config: DataRouterConfig) {
    this.providers = config.providers;
    this.config = config;
  }

  /**
   * Register a new data provider
   */
  registerProvider(name: string, provider: IDataProvider) {
    this.providers.set(name, provider);
  }

  /**
   * Get user's data preferences
   */
  private async getUserPreferences(userId: string): Promise<UserDataPreferences> {
    // TODO: Implement user_data_preferences table in schema
    // For now, return default preferences

    // const prefs = await prisma.user_data_preferences.findMany({
    //   where: { user_id: userId }
    // });

    // if (prefs.length > 0) {
    //   // Convert DB records to preferences object
    //   return {
    //     userId,
    //     quotes: prefs.find(p => p.preference_type === 'quotes')?.primary_source || 'alpaca',
    //     charts: prefs.find(p => p.preference_type === 'charts')?.primary_source || 'polygon',
    //     fundamentals: prefs.find(p => p.preference_type === 'fundamentals')?.primary_source || 'yahoo',
    //     fallbackSources: ['yahoo', 'cached']
    //   };
    // }

    // Default preferences
    return {
      userId,
      quotes: 'alpaca',
      charts: 'polygon',
      fundamentals: 'yahoo',
      fallbackSources: ['yahoo', 'cached']
    };
  }

  /**
   * Get available data sources for a user
   */
  private async getAvailableSources(userId: string): Promise<Set<string>> {
    const available = new Set<string>();

    // Always available
    available.add('cached');
    available.add('yahoo'); // Free tier

    // Check user's broker connections
    const brokers = await prisma.broker_connections.findMany({
      where: { userId, isActive: true }
    });

    for (const broker of brokers) {
      if (broker.broker === 'alpaca' && broker.credentials) {
        available.add('alpaca');
      }
      // Add more brokers as we support them
    }

    // TODO: Implement user_data_sources table in schema
    // Check if user has premium data subscriptions
    // const dataSources = await prisma.user_data_sources?.findMany({
    //   where: { user_id: userId }
    // });

    // if (dataSources) {
    //   for (const source of dataSources) {
    //     available.add(source.source);
    //   }
    // }

    return available;
  }

  /**
   * Get quote with smart routing
   */
  async getQuote(symbol: string, userId?: string): Promise<Quote & { source: string }> {
    const cacheKey = `quote:${symbol}`;

    // Check cache first
    if (this.config.cacheEnabled) {
      const cached = this.cache.get(cacheKey);
      if (cached && cached.expires > new Date()) {
        return { ...cached.data, source: 'cache' };
      }
    }

    // Get user preferences and available sources
    const preferences = userId ? await this.getUserPreferences(userId) : null;
    const available = userId ? await this.getAvailableSources(userId) : new Set(['yahoo', 'cached']);

    // Build ordered list of sources to try
    const sources = this.buildSourceList(preferences?.quotes, available, preferences?.fallbackSources);

    // Try each source in order
    for (const sourceName of sources) {
      const provider = this.providers.get(sourceName);
      if (!provider) continue;

      try {
        const quote = await provider.getQuote(symbol);

        // Cache the result
        if (this.config.cacheEnabled) {
          this.cache.set(cacheKey, {
            data: quote,
            expires: new Date(Date.now() + this.config.cacheTTL * 1000)
          });
        }

        return { ...quote, source: sourceName };
      } catch (error) {
    // DEBUG: console.log(`[DataRouter] ${sourceName} failed for ${symbol}:`, error);
        continue;
      }
    }

    // All sources failed, return stale cache or error
    const staleCache = this.cache.get(cacheKey);
    if (staleCache) {
      return { ...staleCache.data, source: 'cache-stale' };
    }

    throw new Error(`Failed to get quote for ${symbol} from any source`);
  }

  /**
   * Get historical bars with smart routing
   */
  async getBars(
    symbol: string,
    timeframe: '1min' | '5min' | '15min' | '1hour' | '1day',
    start: Date,
    end: Date,
    userId?: string
  ): Promise<Bar[] & { source: string }> {
    const preferences = userId ? await this.getUserPreferences(userId) : null;
    const available = userId ? await this.getAvailableSources(userId) : new Set(['polygon', 'yahoo']);

    // For historical data, prefer sources with good historical depth
    const sources = this.buildSourceList(preferences?.charts || 'polygon', available, ['polygon', 'alpaca', 'yahoo']);

    for (const sourceName of sources) {
      const provider = this.providers.get(sourceName);
      if (!provider) continue;

      try {
        const bars = await provider.getBars(symbol, timeframe, start, end);
        return Object.assign(bars, { source: sourceName });
      } catch (error) {
    // DEBUG: console.log(`[DataRouter] ${sourceName} failed for ${symbol} bars:`, error);
        continue;
      }
    }

    throw new Error(`Failed to get bars for ${symbol} from any source`);
  }

  /**
   * Get snapshot with smart routing
   */
  async getSnapshot(symbol: string, userId?: string): Promise<Snapshot & { source: string }> {
    const preferences = userId ? await this.getUserPreferences(userId) : null;
    const available = userId ? await this.getAvailableSources(userId) : new Set(['yahoo', 'cached']);

    const sources = this.buildSourceList(preferences?.quotes, available, preferences?.fallbackSources);

    for (const sourceName of sources) {
      const provider = this.providers.get(sourceName);
      if (!provider) continue;

      try {
        const snapshot = await provider.getSnapshot(symbol);
        return { ...snapshot, source: sourceName };
      } catch (error) {
    // DEBUG: console.log(`[DataRouter] ${sourceName} failed for ${symbol} snapshot:`, error);
        continue;
      }
    }

    throw new Error(`Failed to get snapshot for ${symbol} from any source`);
  }

  /**
   * Get fundamentals with smart routing
   */
  async getFundamentals(symbol: string, userId?: string): Promise<Fundamentals & { source: string }> {
    const preferences = userId ? await this.getUserPreferences(userId) : null;
    const available = userId ? await this.getAvailableSources(userId) : new Set(['yahoo']);

    // For fundamentals, prefer Yahoo (free) over paid sources
    const sources = this.buildSourceList(preferences?.fundamentals || 'yahoo', available, ['yahoo', 'alphaVantage', 'polygon']);

    for (const sourceName of sources) {
      const provider = this.providers.get(sourceName);
      if (!provider || !provider.getFundamentals) continue;

      try {
        const fundamentals = await provider.getFundamentals(symbol);
        return { ...fundamentals, source: sourceName };
      } catch (error) {
    // DEBUG: console.log(`[DataRouter] ${sourceName} failed for ${symbol} fundamentals:`, error);
        continue;
      }
    }

    throw new Error(`Failed to get fundamentals for ${symbol} from any source`);
  }

  /**
   * Build ordered list of sources to try
   */
  private buildSourceList(
    primary: string | undefined,
    available: Set<string>,
    fallbacks: string[] = []
  ): string[] {
    const sources: string[] = [];

    // Add primary if available
    if (primary && available.has(primary)) {
      sources.push(primary);
    }

    // Add fallbacks
    for (const fallback of fallbacks) {
      if (available.has(fallback) && !sources.includes(fallback)) {
        sources.push(fallback);
      }
    }

    // If no sources yet, add any available
    if (sources.length === 0) {
      sources.push(...Array.from(available));
    }

    return sources;
  }

  /**
   * Health check all providers
   */
  async healthCheck(): Promise<Map<string, boolean>> {
    const health = new Map<string, boolean>();

    for (const [name, provider] of this.providers) {
      try {
        const isHealthy = await provider.isHealthy();
        health.set(name, isHealthy);
      } catch {
        health.set(name, false);
      }
    }

    return health;
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache.clear();
  }
}