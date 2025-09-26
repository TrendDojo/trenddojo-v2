/**
 * Data Provider Interface
 * @business-critical: All market data sources must implement this interface
 *
 * This enables multi-source architecture where users can choose
 * between Alpaca, Polygon, Yahoo, or future providers
 */

export interface Quote {
  symbol: string;
  price: number;
  bid?: number;
  ask?: number;
  bidSize?: number;
  askSize?: number;
  volume: number;
  timestamp: Date;
}

export interface Bar {
  timestamp: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  vwap?: number;
}

export interface Snapshot {
  symbol: string;
  price: number;
  dayOpen: number;
  dayHigh: number;
  dayLow: number;
  dayClose: number;
  dayVolume: number;
  prevClose: number;
  change: number;
  changePercent: number;
  bid?: number;
  ask?: number;
  timestamp: Date;
}

export interface Fundamentals {
  symbol: string;
  marketCap?: number;
  peRatio?: number;
  eps?: number;
  dividendYield?: number;
  beta?: number;
  sector?: string;
  industry?: string;
}

export interface DataCapabilities {
  hasRealtime: boolean;
  hasHistorical: boolean;
  hasFundamentals: boolean;
  hasOptions: boolean;
  hasCrypto: boolean;
  hasForex: boolean;
  maxHistoricalDays: number;
  rateLimit: number; // requests per minute
}

/**
 * Standard interface for all data providers
 */
export interface IDataProvider {
  // Identification
  getName(): string;
  getCapabilities(): DataCapabilities;

  // Core data methods (all providers must implement)
  getQuote(symbol: string): Promise<Quote>;
  getBars(
    symbol: string,
    timeframe: '1min' | '5min' | '15min' | '1hour' | '1day',
    start: Date,
    end: Date
  ): Promise<Bar[]>;
  getSnapshot(symbol: string): Promise<Snapshot>;

  // Optional methods (provider-specific features)
  getFundamentals?(symbol: string): Promise<Fundamentals>;
  getOptionsChain?(symbol: string, expiry?: Date): Promise<any>;
  streamQuotes?(symbols: string[]): AsyncIterator<Quote>;

  // Bulk operations (for efficiency)
  getBulkQuotes?(symbols: string[]): Promise<Map<string, Quote>>;
  getBulkSnapshots?(symbols: string[]): Promise<Map<string, Snapshot>>;

  // Health check
  isHealthy(): Promise<boolean>;
  getQuotaRemaining?(): Promise<number>;
}

/**
 * Provider configuration
 */
export interface ProviderConfig {
  apiKey?: string;
  apiSecret?: string;
  baseUrl?: string;
  tier?: 'free' | 'basic' | 'premium' | 'enterprise';
  rateLimit?: number;
}

/**
 * Base class with common functionality
 */
export abstract class BaseDataProvider implements IDataProvider {
  protected config: ProviderConfig;
  protected lastHealthCheck: Date = new Date();
  protected isHealthyCache: boolean = true;

  constructor(config: ProviderConfig) {
    this.config = config;
  }

  abstract getName(): string;
  abstract getCapabilities(): DataCapabilities;
  abstract getQuote(symbol: string): Promise<Quote>;
  abstract getBars(
    symbol: string,
    timeframe: '1min' | '5min' | '15min' | '1hour' | '1day',
    start: Date,
    end: Date
  ): Promise<Bar[]>;
  abstract getSnapshot(symbol: string): Promise<Snapshot>;

  async isHealthy(): Promise<boolean> {
    // Cache health check for 1 minute
    const now = new Date();
    if (now.getTime() - this.lastHealthCheck.getTime() < 60000) {
      return this.isHealthyCache;
    }

    try {
      // Try a simple quote request
      await this.getQuote('AAPL');
      this.isHealthyCache = true;
    } catch {
      this.isHealthyCache = false;
    }

    this.lastHealthCheck = now;
    return this.isHealthyCache;
  }
}