/**
 * Mock Market Data Provider for Development and Testing
 * @business-critical: Testing provider with predictable data
 * 
 * Provides realistic but deterministic market data for testing
 * without making external API calls.
 */

import { IMarketDataProvider } from './IMarketDataProvider';
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
  MarketDataError,
  MarketDataErrorCode,
  Timeframe,
} from '../types';

interface MockConfig extends Partial<ProviderConfig> {
  simulateErrors?: boolean;
  errorRate?: number; // 0-1 probability
  latencyMs?: number;
  volatility?: number; // Price movement volatility (0.01 = 1%)
}

export class MockProvider implements IMarketDataProvider {
  readonly name = 'Mock Provider';
  readonly config: ProviderConfig;
  
  private mockConfig: MockConfig;
  private basePrices: Map<string, number> = new Map();
  private priceHistory: Map<string, Candle[]> = new Map();
  private subscriptions: Map<string, NodeJS.Timeout> = new Map();
  private isInitialized = false;
  
  constructor(config?: MockConfig) {
    this.mockConfig = {
      simulateErrors: config?.simulateErrors || false,
      errorRate: config?.errorRate || 0.1,
      latencyMs: config?.latencyMs || 100,
      volatility: config?.volatility || 0.02,
      ...config,
    };
    
    this.config = {
      type: 'mock',
      tier: config?.tier || 'free',
      rateLimit: 999999,
      timeout: 5000,
      retryAttempts: 3,
    };
    
    // Initialize base prices for common symbols
    this.initializeBasePrices();
  }
  
  async initialize(): Promise<void> {
    if (this.isInitialized) return;
    
    // Generate historical data for common symbols
    await this.generateHistoricalData();
    
    this.isInitialized = true;
    // DEBUG: console.log('Mock provider initialized with', this.basePrices.size, 'symbols');
  }
  
  async shutdown(): Promise<void> {
    // Clear all subscriptions
    for (const [, interval] of this.subscriptions) {
      clearInterval(interval);
    }
    this.subscriptions.clear();
    this.isInitialized = false;
  }
  
  async getCurrentPrice(symbol: string): Promise<PriceData> {
    await this.simulateLatency();
    this.maybeThrowError();
    
    const basePrice = this.getOrCreateBasePrice(symbol);
    const price = this.generateRealisticPrice(basePrice);
    
    return {
      symbol,
      price,
      timestamp: new Date(),
      volume: Math.floor(Math.random() * 10000000) + 1000000,
      change: price - basePrice,
      changePercent: ((price - basePrice) / basePrice) * 100,
      bid: price - 0.01,
      ask: price + 0.01,
      marketCap: Math.floor(price * 1000000000),
    };
  }
  
  async getBulkPrices(symbols: string[]): Promise<BulkPriceResponse> {
    await this.simulateLatency();
    this.maybeThrowError();
    
    const result = new Map<string, PriceData>();
    
    for (const symbol of symbols) {
      const price = await this.getCurrentPrice(symbol);
      result.set(symbol, price);
    }
    
    return result;
  }
  
  async getHistoricalData(options: HistoricalDataOptions): Promise<Candle[]> {
    await this.simulateLatency();
    this.maybeThrowError();
    
    const { symbol, timeframe, range, limit } = options;
    
    // Get or generate historical data
    let history = this.priceHistory.get(symbol);
    if (!history) {
      history = this.generateCandlesForSymbol(symbol, 500);
      this.priceHistory.set(symbol, history);
    }
    
    // Filter by range if provided
    let candles = [...history];
    if (range) {
      candles = candles.filter(
        c => c.timestamp >= range.start && c.timestamp <= range.end
      );
    }
    
    // Apply limit
    if (limit && candles.length > limit) {
      candles = candles.slice(-limit);
    }
    
    return candles;
  }
  
  async getTechnicalIndicators(symbol: string): Promise<TechnicalData> {
    await this.simulateLatency();
    this.maybeThrowError();
    
    const candles = await this.getHistoricalData({
      symbol,
      timeframe: '1d',
      limit: 200,
    });
    
    const closes = candles.map(c => c.close);
    const currentPrice = closes[closes.length - 1];
    
    return {
      symbol,
      timestamp: new Date(),
      sma20: this.calculateSMA(closes, 20),
      sma50: this.calculateSMA(closes, 50),
      sma200: closes.length >= 200 ? this.calculateSMA(closes, 200) : undefined,
      ema12: currentPrice * 0.98, // Mock EMA
      ema26: currentPrice * 0.97, // Mock EMA
      rsi: 50 + (Math.random() - 0.5) * 40, // RSI between 30-70
      macd: {
        value: (Math.random() - 0.5) * 2,
        signal: (Math.random() - 0.5) * 1.5,
        histogram: (Math.random() - 0.5) * 0.5,
      },
      atr: currentPrice * 0.02, // 2% ATR
      bollingerBands: {
        upper: currentPrice * 1.02,
        middle: currentPrice,
        lower: currentPrice * 0.98,
      },
    };
  }
  
  subscribeToPrice(
    symbol: string,
    callback: (price: PriceData) => void
  ): PriceSubscription {
    // Simulate real-time updates every 5 seconds
    const interval = setInterval(async () => {
      try {
        const price = await this.getCurrentPrice(symbol);
        callback(price);
      } catch (error) {
        console.error('Mock subscription error:', error);
      }
    }, 5000);
    
    this.subscriptions.set(symbol, interval);
    
    return {
      symbol,
      unsubscribe: () => {
        const sub = this.subscriptions.get(symbol);
        if (sub) {
          clearInterval(sub);
          this.subscriptions.delete(symbol);
        }
      },
    };
  }
  
  async getStatus(): Promise<ProviderStatus> {
    return {
      name: this.name,
      isHealthy: true,
      lastCheck: new Date(),
      latency: this.mockConfig.latencyMs,
      errorRate: this.mockConfig.errorRate,
    };
  }
  
  getCapabilities(): ProviderCapabilities {
    return {
      realtime: true,
      historical: true,
      technicalIndicators: true,
      fundamentals: false,
      streaming: true,
      bulkQuotes: true,
      maxSymbolsPerRequest: 1000,
      supportedTimeframes: ['1m', '5m', '15m', '30m', '1h', '4h', '1d', '1w', '1M'] as Timeframe[],
      supportedMarkets: ['US', 'CRYPTO', 'TEST'],
    };
  }
  
  async isSymbolValid(symbol: string): Promise<boolean> {
    // Mock provider accepts any symbol
    return symbol.length > 0 && symbol.length < 10;
  }
  
  normalizeSymbol(symbol: string): string {
    return symbol.toUpperCase();
  }
  
  // Helper methods for mock data generation
  
  private initializeBasePrices(): void {
    // Common stocks
    this.basePrices.set('AAPL', 175.50);
    this.basePrices.set('GOOGL', 140.25);
    this.basePrices.set('MSFT', 380.75);
    this.basePrices.set('AMZN', 155.00);
    this.basePrices.set('TSLA', 250.30);
    this.basePrices.set('META', 485.50);
    this.basePrices.set('NVDA', 875.25);
    
    // ETFs
    this.basePrices.set('SPY', 450.00);
    this.basePrices.set('QQQ', 385.50);
    this.basePrices.set('IWM', 195.75);
    
    // Crypto
    this.basePrices.set('BTC-USD', 45000);
    this.basePrices.set('ETH-USD', 2500);
    
    // Test symbols
    this.basePrices.set('TEST', 100.00);
    this.basePrices.set('VOLATILE', 50.00);
    this.basePrices.set('STABLE', 25.00);
  }
  
  private getOrCreateBasePrice(symbol: string): number {
    let price = this.basePrices.get(symbol);
    if (!price) {
      // Generate a random price for unknown symbols
      price = Math.random() * 900 + 100; // Between $100-$1000
      this.basePrices.set(symbol, price);
    }
    return price;
  }
  
  private generateRealisticPrice(basePrice: number): number {
    // Add realistic price movement
    const volatility = this.mockConfig.volatility!;
    const change = (Math.random() - 0.5) * 2 * volatility;
    const newPrice = basePrice * (1 + change);
    
    // Round to 2 decimal places
    return Math.round(newPrice * 100) / 100;
  }
  
  private async generateHistoricalData(): Promise<void> {
    for (const [symbol, basePrice] of this.basePrices) {
      const candles = this.generateCandlesForSymbol(symbol, 500);
      this.priceHistory.set(symbol, candles);
    }
  }
  
  private generateCandlesForSymbol(symbol: string, count: number): Candle[] {
    const basePrice = this.getOrCreateBasePrice(symbol);
    const candles: Candle[] = [];
    const now = new Date();
    
    let currentPrice = basePrice;
    
    for (let i = count - 1; i >= 0; i--) {
      const timestamp = new Date(now.getTime() - i * 24 * 60 * 60 * 1000); // Daily candles
      
      // Generate OHLC with realistic relationships
      const dayVolatility = this.mockConfig.volatility! * 2;
      const open = currentPrice;
      const change = (Math.random() - 0.5) * dayVolatility;
      const close = open * (1 + change);
      const high = Math.max(open, close) * (1 + Math.random() * dayVolatility * 0.5);
      const low = Math.min(open, close) * (1 - Math.random() * dayVolatility * 0.5);
      const volume = Math.floor(Math.random() * 10000000) + 1000000;
      
      candles.push({
        timestamp,
        open: Math.round(open * 100) / 100,
        high: Math.round(high * 100) / 100,
        low: Math.round(low * 100) / 100,
        close: Math.round(close * 100) / 100,
        volume,
      });
      
      currentPrice = close;
    }
    
    return candles;
  }
  
  private calculateSMA(values: number[], period: number): number {
    if (values.length < period) return values[values.length - 1];
    const slice = values.slice(-period);
    return slice.reduce((sum, val) => sum + val, 0) / period;
  }
  
  private async simulateLatency(): Promise<void> {
    if (this.mockConfig.latencyMs && this.mockConfig.latencyMs > 0) {
      await new Promise(resolve => setTimeout(resolve, this.mockConfig.latencyMs));
    }
  }
  
  private maybeThrowError(): void {
    if (this.mockConfig.simulateErrors && Math.random() < this.mockConfig.errorRate!) {
      const errors = [
        { code: MarketDataErrorCode.NETWORK_ERROR, message: 'Mock network error' },
        { code: MarketDataErrorCode.TIMEOUT, message: 'Mock timeout' },
        { code: MarketDataErrorCode.RATE_LIMIT, message: 'Mock rate limit' },
        { code: MarketDataErrorCode.INVALID_RESPONSE, message: 'Mock invalid response' },
      ];
      
      const error = errors[Math.floor(Math.random() * errors.length)];
      throw new MarketDataError(error.message, error.code, this.name);
    }
  }
}