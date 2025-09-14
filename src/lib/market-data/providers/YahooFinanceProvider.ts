/**
 * Yahoo Finance Market Data Provider
 * @business-critical: Primary market data source for free/basic tiers
 * 
 * Rate limits: ~2000 requests/hour (not officially documented)
 * No API key required for basic data
 */

import { IMarketDataProvider } from './IMarketDataProvider';
import {
  PriceData,
  Candle,
  TechnicalData,
  ProviderStatus,
  BulkPriceResponse,
  HistoricalDataOptions,
  ProviderCapabilities,
  ProviderConfig,
  MarketDataError,
  MarketDataErrorCode,
  Timeframe,
} from '../types';

interface YahooQuoteResponse {
  quoteResponse: {
    result: Array<{
      symbol: string;
      regularMarketPrice: number;
      regularMarketTime: number;
      regularMarketChange: number;
      regularMarketChangePercent: number;
      regularMarketVolume: number;
      bid: number;
      ask: number;
      marketCap: number;
    }>;
    error: any;
  };
}

interface YahooChartResponse {
  chart: {
    result: Array<{
      meta: {
        symbol: string;
        regularMarketPrice: number;
        regularMarketTime: number;
      };
      timestamp: number[];
      indicators: {
        quote: Array<{
          open: number[];
          high: number[];
          low: number[];
          close: number[];
          volume: number[];
        }>;
      };
    }>;
    error: any;
  };
}

export class YahooFinanceProvider implements IMarketDataProvider {
  readonly name = 'Yahoo Finance';
  readonly config: ProviderConfig;
  
  private baseUrl = 'https://query1.finance.yahoo.com';
  private isInitialized = false;
  private requestCount = 0;
  private requestResetTime = Date.now() + 3600000; // 1 hour
  private healthCheckInterval?: NodeJS.Timeout;
  private lastHealthCheck = new Date();
  private isHealthy = true;
  
  constructor(config?: Partial<ProviderConfig>) {
    this.config = {
      type: 'yahoo',
      tier: config?.tier || 'free',
      rateLimit: config?.rateLimit || 2000,
      timeout: config?.timeout || 5000,
      retryAttempts: config?.retryAttempts || 3,
      baseUrl: config?.baseUrl || this.baseUrl,
    };
    
    if (config?.baseUrl) {
      this.baseUrl = config.baseUrl;
    }
  }
  
  async initialize(): Promise<void> {
    if (this.isInitialized) return;
    
    // Start health check interval
    this.healthCheckInterval = setInterval(
      () => this.performHealthCheck(),
      60000 // Check every minute
    );
    
    // Initial health check
    await this.performHealthCheck();
    
    this.isInitialized = true;
  }
  
  async shutdown(): Promise<void> {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = undefined;
    }
    this.isInitialized = false;
  }
  
  async getCurrentPrice(symbol: string): Promise<PriceData> {
    await this.checkRateLimit();
    
    const normalizedSymbol = this.normalizeSymbol(symbol);
    const url = `${this.baseUrl}/v8/finance/quote?symbols=${normalizedSymbol}`;
    
    try {
      const response = await this.fetchWithRetry<YahooQuoteResponse>(url);
      
      if (!response.quoteResponse?.result?.[0]) {
        throw new MarketDataError(
          `No data found for symbol: ${symbol}`,
          MarketDataErrorCode.INVALID_SYMBOL,
          this.name
        );
      }
      
      const quote = response.quoteResponse.result[0];
      
      return {
        symbol: quote.symbol,
        price: quote.regularMarketPrice,
        timestamp: new Date(quote.regularMarketTime * 1000),
        volume: quote.regularMarketVolume,
        change: quote.regularMarketChange,
        changePercent: quote.regularMarketChangePercent,
        bid: quote.bid,
        ask: quote.ask,
        marketCap: quote.marketCap,
      };
    } catch (error) {
      if (error instanceof MarketDataError) throw error;
      
      throw new MarketDataError(
        `Failed to fetch price for ${symbol}`,
        MarketDataErrorCode.PROVIDER_ERROR,
        this.name,
        error
      );
    }
  }
  
  async getBulkPrices(symbols: string[]): Promise<BulkPriceResponse> {
    await this.checkRateLimit();
    
    const result = new Map<string, PriceData>();
    
    // Yahoo allows up to 200 symbols per request
    const chunks = this.chunkArray(symbols, 200);
    
    for (const chunk of chunks) {
      const normalizedSymbols = chunk.map(s => this.normalizeSymbol(s));
      const url = `${this.baseUrl}/v8/finance/quote?symbols=${normalizedSymbols.join(',')}`;
      
      try {
        const response = await this.fetchWithRetry<YahooQuoteResponse>(url);
        
        if (response.quoteResponse?.result) {
          for (const quote of response.quoteResponse.result) {
            result.set(quote.symbol, {
              symbol: quote.symbol,
              price: quote.regularMarketPrice,
              timestamp: new Date(quote.regularMarketTime * 1000),
              volume: quote.regularMarketVolume,
              change: quote.regularMarketChange,
              changePercent: quote.regularMarketChangePercent,
              bid: quote.bid,
              ask: quote.ask,
              marketCap: quote.marketCap,
            });
          }
        }
      } catch (error) {
        console.error(`Failed to fetch bulk prices for chunk: ${chunk}`, error);
        // Continue with other chunks even if one fails
      }
    }
    
    return result;
  }
  
  async getHistoricalData(options: HistoricalDataOptions): Promise<Candle[]> {
    await this.checkRateLimit();
    
    const { symbol, timeframe, range, limit } = options;
    const normalizedSymbol = this.normalizeSymbol(symbol);
    
    // Convert timeframe to Yahoo interval
    const interval = this.mapTimeframeToInterval(timeframe);
    
    // Calculate range
    const yahooRange = this.calculateRange(range, timeframe, limit);
    
    const url = `${this.baseUrl}/v8/finance/chart/${normalizedSymbol}?interval=${interval}&range=${yahooRange}`;
    
    try {
      const response = await this.fetchWithRetry<YahooChartResponse>(url);
      
      if (!response.chart?.result?.[0]) {
        throw new MarketDataError(
          `No historical data found for symbol: ${symbol}`,
          MarketDataErrorCode.INVALID_SYMBOL,
          this.name
        );
      }
      
      const chartData = response.chart.result[0];
      const quotes = chartData.indicators.quote[0];
      const timestamps = chartData.timestamp;
      
      const candles: Candle[] = [];
      
      for (let i = 0; i < timestamps.length; i++) {
        // Skip invalid data points
        if (!quotes.close[i] || !quotes.open[i]) continue;
        
        candles.push({
          timestamp: new Date(timestamps[i] * 1000),
          open: quotes.open[i],
          high: quotes.high[i],
          low: quotes.low[i],
          close: quotes.close[i],
          volume: quotes.volume[i] || 0,
        });
      }
      
      // Apply limit if specified
      if (limit && candles.length > limit) {
        return candles.slice(-limit);
      }
      
      return candles;
    } catch (error) {
      if (error instanceof MarketDataError) throw error;
      
      throw new MarketDataError(
        `Failed to fetch historical data for ${symbol}`,
        MarketDataErrorCode.PROVIDER_ERROR,
        this.name,
        error
      );
    }
  }
  
  async getTechnicalIndicators(symbol: string): Promise<TechnicalData> {
    // Yahoo doesn't provide calculated indicators, so we calculate them from historical data
    const candles = await this.getHistoricalData({
      symbol,
      timeframe: '1d',
      limit: 200, // Enough for 200-day SMA
    });
    
    if (candles.length < 20) {
      throw new MarketDataError(
        `Insufficient data for technical indicators: ${symbol}`,
        MarketDataErrorCode.INVALID_RESPONSE,
        this.name
      );
    }
    
    const closes = candles.map(c => c.close);
    
    return {
      symbol,
      timestamp: new Date(),
      sma20: this.calculateSMA(closes, 20),
      sma50: closes.length >= 50 ? this.calculateSMA(closes, 50) : undefined,
      sma200: closes.length >= 200 ? this.calculateSMA(closes, 200) : undefined,
      rsi: this.calculateRSI(closes, 14),
      atr: this.calculateATR(candles, 14),
      bollingerBands: this.calculateBollingerBands(closes, 20, 2),
    };
  }
  
  async getStatus(): Promise<ProviderStatus> {
    return {
      name: this.name,
      isHealthy: this.isHealthy,
      lastCheck: this.lastHealthCheck,
      rateLimit: {
        remaining: Math.max(0, this.config.rateLimit - this.requestCount),
        reset: new Date(this.requestResetTime),
      },
    };
  }
  
  getCapabilities(): ProviderCapabilities {
    return {
      realtime: false,
      historical: true,
      technicalIndicators: true,
      fundamentals: false,
      streaming: false,
      bulkQuotes: true,
      maxSymbolsPerRequest: 200,
      supportedTimeframes: ['1m', '5m', '15m', '30m', '1h', '1d', '1w', '1M'] as Timeframe[],
      supportedMarkets: ['US', 'CRYPTO'],
    };
  }
  
  async isSymbolValid(symbol: string): Promise<boolean> {
    try {
      await this.getCurrentPrice(symbol);
      return true;
    } catch (error) {
      if (error instanceof MarketDataError && 
          error.code === MarketDataErrorCode.INVALID_SYMBOL) {
        return false;
      }
      throw error;
    }
  }
  
  normalizeSymbol(symbol: string): string {
    // Yahoo uses standard ticker symbols
    // Add special handling for crypto (BTC-USD) if needed
    return symbol.toUpperCase().replace('/', '-');
  }
  
  // Private helper methods
  
  private async fetchWithRetry<T>(url: string): Promise<T> {
    let lastError: any;
    
    for (let attempt = 0; attempt < this.config.retryAttempts; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);
        
        const response = await fetch(url, {
          signal: controller.signal,
          headers: {
            'User-Agent': 'TrendDojo/1.0',
          },
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        this.incrementRequestCount();
        return data;
      } catch (error: any) {
        lastError = error;
        
        if (error.name === 'AbortError') {
          throw new MarketDataError(
            'Request timeout',
            MarketDataErrorCode.TIMEOUT,
            this.name
          );
        }
        
        // Wait before retry (exponential backoff)
        if (attempt < this.config.retryAttempts - 1) {
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        }
      }
    }
    
    throw new MarketDataError(
      'Failed after retries',
      MarketDataErrorCode.NETWORK_ERROR,
      this.name,
      lastError
    );
  }
  
  private async checkRateLimit(): Promise<void> {
    // Reset counter if hour has passed
    if (Date.now() > this.requestResetTime) {
      this.requestCount = 0;
      this.requestResetTime = Date.now() + 3600000;
    }
    
    if (this.requestCount >= this.config.rateLimit) {
      throw new MarketDataError(
        'Rate limit exceeded',
        MarketDataErrorCode.RATE_LIMIT,
        this.name,
        { resetTime: new Date(this.requestResetTime) }
      );
    }
  }
  
  private incrementRequestCount(): void {
    this.requestCount++;
  }
  
  private async performHealthCheck(): Promise<void> {
    try {
      // Try to fetch a common symbol
      await this.getCurrentPrice('AAPL');
      this.isHealthy = true;
    } catch (error) {
      this.isHealthy = false;
      console.error('Yahoo Finance health check failed:', error);
    }
    this.lastHealthCheck = new Date();
  }
  
  private mapTimeframeToInterval(timeframe: Timeframe): string {
    const mapping: Record<Timeframe, string> = {
      '1m': '1m',
      '5m': '5m',
      '15m': '15m',
      '30m': '30m',
      '1h': '60m',
      '4h': '1d', // Yahoo doesn't support 4h, use daily
      '1d': '1d',
      '1w': '1wk',
      '1M': '1mo',
    };
    return mapping[timeframe] || '1d';
  }
  
  private calculateRange(
    range: HistoricalDataOptions['range'],
    timeframe: Timeframe,
    limit?: number
  ): string {
    if (range) {
      const days = Math.ceil(
        (range.end.getTime() - range.start.getTime()) / (1000 * 60 * 60 * 24)
      );
      
      if (days <= 5) return '5d';
      if (days <= 30) return '1mo';
      if (days <= 90) return '3mo';
      if (days <= 180) return '6mo';
      if (days <= 365) return '1y';
      if (days <= 730) return '2y';
      if (days <= 1825) return '5y';
      return '10y';
    }
    
    // Default ranges based on timeframe
    const defaults: Record<Timeframe, string> = {
      '1m': '1d',
      '5m': '5d',
      '15m': '5d',
      '30m': '1mo',
      '1h': '1mo',
      '4h': '3mo',
      '1d': '1y',
      '1w': '2y',
      '1M': '5y',
    };
    
    return defaults[timeframe] || '1y';
  }
  
  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }
  
  // Technical indicator calculations
  
  private calculateSMA(values: number[], period: number): number {
    if (values.length < period) return 0;
    const slice = values.slice(-period);
    return slice.reduce((sum, val) => sum + val, 0) / period;
  }
  
  private calculateRSI(closes: number[], period: number = 14): number {
    if (closes.length < period + 1) return 50;
    
    const changes = [];
    for (let i = 1; i < closes.length; i++) {
      changes.push(closes[i] - closes[i - 1]);
    }
    
    const gains = changes.map(c => c > 0 ? c : 0);
    const losses = changes.map(c => c < 0 ? -c : 0);
    
    const avgGain = gains.slice(-period).reduce((sum, g) => sum + g, 0) / period;
    const avgLoss = losses.slice(-period).reduce((sum, l) => sum + l, 0) / period;
    
    if (avgLoss === 0) return 100;
    
    const rs = avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
  }
  
  private calculateATR(candles: Candle[], period: number = 14): number {
    if (candles.length < period) return 0;
    
    const trueRanges = [];
    for (let i = 1; i < candles.length; i++) {
      const high = candles[i].high;
      const low = candles[i].low;
      const prevClose = candles[i - 1].close;
      
      const tr = Math.max(
        high - low,
        Math.abs(high - prevClose),
        Math.abs(low - prevClose)
      );
      trueRanges.push(tr);
    }
    
    const recentTRs = trueRanges.slice(-period);
    return recentTRs.reduce((sum, tr) => sum + tr, 0) / period;
  }
  
  private calculateBollingerBands(
    closes: number[],
    period: number = 20,
    stdDev: number = 2
  ): { upper: number; middle: number; lower: number } {
    const sma = this.calculateSMA(closes, period);
    
    if (closes.length < period) {
      return { upper: sma, middle: sma, lower: sma };
    }
    
    const slice = closes.slice(-period);
    const variance = slice.reduce((sum, val) => {
      const diff = val - sma;
      return sum + diff * diff;
    }, 0) / period;
    
    const standardDeviation = Math.sqrt(variance);
    
    return {
      upper: sma + standardDeviation * stdDev,
      middle: sma,
      lower: sma - standardDeviation * stdDev,
    };
  }
}