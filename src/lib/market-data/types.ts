/**
 * Market Data Provider Types and Interfaces
 * @business-critical: Core market data abstractions
 */

// Price data types
export interface PriceData {
  symbol: string;
  price: number;
  timestamp: Date;
  volume?: number;
  change?: number;
  changePercent?: number;
  bid?: number;
  ask?: number;
  marketCap?: number;
}

// OHLC candle data
export interface Candle {
  timestamp: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

// Technical indicators
export interface TechnicalData {
  symbol: string;
  timestamp: Date;
  sma20?: number;
  sma50?: number;
  sma200?: number;
  ema12?: number;
  ema26?: number;
  rsi?: number;
  macd?: {
    value: number;
    signal: number;
    histogram: number;
  };
  atr?: number;
  bollingerBands?: {
    upper: number;
    middle: number;
    lower: number;
  };
}

// Provider status
export interface ProviderStatus {
  name: string;
  isHealthy: boolean;
  lastCheck: Date;
  latency?: number;
  errorRate?: number;
  rateLimit?: {
    remaining: number;
    reset: Date;
  };
}

// Subscription types
export interface PriceSubscription {
  symbol: string;
  unsubscribe: () => void;
}

// Timeframe options
export type Timeframe = '1m' | '5m' | '15m' | '30m' | '1h' | '4h' | '1d' | '1w' | '1M';

// Date range options
export interface DateRange {
  start: Date;
  end: Date;
}

// Provider configuration
export interface ProviderConfig {
  type: 'yahoo' | 'polygon' | 'alphavantage' | 'mock';
  apiKey?: string;
  tier: 'free' | 'basic' | 'pro';
  rateLimit: number;
  timeout: number;
  retryAttempts: number;
  baseUrl?: string;
}

// Error types
export class MarketDataError extends Error {
  constructor(
    message: string,
    public code: MarketDataErrorCode,
    public provider?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'MarketDataError';
  }
}

export enum MarketDataErrorCode {
  PROVIDER_ERROR = 'PROVIDER_ERROR',
  RATE_LIMIT = 'RATE_LIMIT',
  INVALID_SYMBOL = 'INVALID_SYMBOL',
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT = 'TIMEOUT',
  INVALID_RESPONSE = 'INVALID_RESPONSE',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  PROVIDER_UNAVAILABLE = 'PROVIDER_UNAVAILABLE',
}

// Bulk price response
export type BulkPriceResponse = Map<string, PriceData>;

// Historical data options
export interface HistoricalDataOptions {
  symbol: string;
  timeframe: Timeframe;
  range?: DateRange;
  limit?: number;
}

// Provider capabilities
export interface ProviderCapabilities {
  realtime: boolean;
  historical: boolean;
  technicalIndicators: boolean;
  fundamentals: boolean;
  streaming: boolean;
  bulkQuotes: boolean;
  maxSymbolsPerRequest: number;
  supportedTimeframes: Timeframe[];
  supportedMarkets: string[];
}