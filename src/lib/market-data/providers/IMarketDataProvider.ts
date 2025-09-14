/**
 * Market Data Provider Interface
 * @business-critical: All market data providers must implement this interface
 * 
 * This abstraction ensures that market data sources can be swapped without
 * affecting the core business logic. Providers handle their own rate limiting,
 * error handling, and data normalization.
 */

import {
  PriceData,
  Candle,
  TechnicalData,
  ProviderStatus,
  PriceSubscription,
  BulkPriceResponse,
  HistoricalDataOptions,
  ProviderCapabilities,
  ProviderConfig,
} from '../types';

export interface IMarketDataProvider {
  // Provider identification
  readonly name: string;
  readonly config: ProviderConfig;
  
  // Initialization and lifecycle
  initialize(): Promise<void>;
  shutdown(): Promise<void>;
  
  // Core data methods
  getCurrentPrice(symbol: string): Promise<PriceData>;
  getBulkPrices(symbols: string[]): Promise<BulkPriceResponse>;
  getHistoricalData(options: HistoricalDataOptions): Promise<Candle[]>;
  getTechnicalIndicators(symbol: string): Promise<TechnicalData>;
  
  // Streaming (optional - returns null if not supported)
  subscribeToPrice?(
    symbol: string,
    callback: (price: PriceData) => void
  ): PriceSubscription | null;
  
  // Provider health and capabilities
  getStatus(): Promise<ProviderStatus>;
  getCapabilities(): ProviderCapabilities;
  
  // Validation
  isSymbolValid(symbol: string): Promise<boolean>;
  normalizeSymbol(symbol: string): string;
}