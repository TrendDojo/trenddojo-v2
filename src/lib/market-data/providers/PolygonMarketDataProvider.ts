/**
 * Polygon.io Market Data Provider Implementation
 * @business-critical: Primary source for live market data
 * Implements IMarketDataProvider interface for MarketDataService integration
 */

import { IMarketDataProvider } from './IMarketDataProvider';
import { PolygonProvider } from './PolygonProvider';
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

export class PolygonMarketDataProvider implements IMarketDataProvider {
  public readonly name = 'Polygon';
  public readonly config: ProviderConfig;
  private polygonClient!: PolygonProvider; // Will be initialized in initialize()
  private isInitialized = false;

  constructor(config: ProviderConfig) {
    this.config = {
      ...config,
      tier: config.tier || 'free',
      rateLimit: config.rateLimit || 100, // Polygon pro tier: 100 req/min
    };
  }

  async initialize(): Promise<void> {
    try {
      this.polygonClient = new PolygonProvider();

      // Test the connection with a simple request
      const testSymbol = 'AAPL';
      const snapshot = await this.polygonClient.getSnapshot(testSymbol);

      if (!snapshot) {
        console.warn('Polygon API test failed - may be rate limited or invalid key');
      }

      this.isInitialized = true;
    } catch (error) {
      throw new MarketDataError(
        'Failed to initialize Polygon provider',
        MarketDataErrorCode.PROVIDER_ERROR,
        this.name,
        error
      );
    }
  }

  async shutdown(): Promise<void> {
    this.isInitialized = false;
  }

  async getCurrentPrice(symbol: string): Promise<PriceData> {
    if (!this.isInitialized) {
      throw new MarketDataError(
        'Provider not initialized',
        MarketDataErrorCode.PROVIDER_ERROR,
        this.name
      );
    }

    try {
      // Get snapshot for current price and daily data
      const snapshot = await this.polygonClient.getSnapshot(symbol);

      if (!snapshot) {
        throw new MarketDataError(
          `No data available for ${symbol}`,
          MarketDataErrorCode.INVALID_SYMBOL,
          this.name
        );
      }

      const currentPrice = snapshot.lastTrade?.price || snapshot.day?.close || 0;
      const previousClose = snapshot.prevDay?.close || 0;
      const change = currentPrice - previousClose;
      const changePercent = previousClose > 0 ? (change / previousClose) * 100 : 0;

      return {
        symbol: symbol.toUpperCase(),
        price: currentPrice,
        change,
        changePercent,
        volume: snapshot.day?.volume || 0,
        timestamp: new Date(snapshot.lastTrade?.timestamp || snapshot.updated || Date.now()),
        bid: snapshot.lastQuote?.bid,
        ask: snapshot.lastQuote?.ask,
        marketCap: snapshot.marketCap,
      };
    } catch (error) {
      if (error instanceof MarketDataError) throw error;

      throw new MarketDataError(
        `Failed to fetch price for ${symbol}`,
        MarketDataErrorCode.NETWORK_ERROR,
        this.name,
        error
      );
    }
  }

  async getBulkPrices(symbols: string[]): Promise<BulkPriceResponse> {
    const prices = new Map<string, PriceData>();

    // Process in batches to avoid rate limiting
    const batchSize = 10; // Pro tier can handle more

    for (let i = 0; i < symbols.length; i += batchSize) {
      const batch = symbols.slice(i, i + batchSize);

      await Promise.all(
        batch.map(async (symbol) => {
          try {
            const price = await this.getCurrentPrice(symbol);
            prices.set(symbol, price);
          } catch (error) {
            console.error(`Failed to fetch price for ${symbol}:`, error instanceof Error ? error.message : 'Unknown error');
          }
        })
      );

      // Small delay between batches (pro tier has higher limits)
      if (i + batchSize < symbols.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    return prices;
  }

  async getHistoricalData(options: HistoricalDataOptions): Promise<Candle[]> {
    if (!this.isInitialized) {
      throw new MarketDataError(
        'Provider not initialized',
        MarketDataErrorCode.PROVIDER_ERROR,
        this.name
      );
    }

    try {
      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);

      const fromStr = startDate.toISOString().split('T')[0];
      const toStr = endDate.toISOString().split('T')[0];

      // Map timeframe to Polygon parameters
      let multiplier = 1;
      let timespan: 'minute' | 'hour' | 'day' = 'day';

      switch (options.timeframe) {
        case '5m':
          multiplier = 5;
          timespan = 'minute';
          break;
        case '15m':
          multiplier = 15;
          timespan = 'minute';
          break;
        case '1h':
          multiplier = 1;
          timespan = 'hour';
          break;
        case '4h':
          multiplier = 4;
          timespan = 'hour';
          break;
        case '1d':
        default:
          multiplier = 1;
          timespan = 'day';
          break;
      }

      let bars: any[];

      if (timespan === 'day') {
        const dailyBars = await this.polygonClient.getDailyBars(
          options.symbol,
          fromStr,
          toStr,
          true
        );

        bars = dailyBars.map(bar => ({
          timestamp: bar.date,
          open: bar.open,
          high: bar.high,
          low: bar.low,
          close: bar.close,
          volume: bar.volume
        }));
      } else {
        bars = await this.polygonClient.getIntradayBars(
          options.symbol,
          multiplier,
          timespan,
          fromStr,
          toStr
        );
      }

      return bars.map(bar => ({
        timestamp: new Date(bar.timestamp || bar.date),
        open: bar.open,
        high: bar.high,
        low: bar.low,
        close: bar.close,
        volume: bar.volume,
        symbol: options.symbol,
        timeframe: options.timeframe || '1d',
      }));
    } catch (error) {
      throw new MarketDataError(
        `Failed to fetch historical data for ${options.symbol}`,
        MarketDataErrorCode.NETWORK_ERROR,
        this.name,
        error
      );
    }
  }

  async getTechnicalIndicators(symbol: string): Promise<TechnicalData> {
    // Polygon doesn't provide technical indicators directly
    // We'd need to calculate them from historical data
    const historicalData = await this.getHistoricalData({
      symbol,
      timeframe: '1d',
      limit: 50
    });

    if (historicalData.length < 20) {
      throw new MarketDataError(
        'Insufficient data for technical indicators',
        MarketDataErrorCode.INVALID_RESPONSE,
        this.name
      );
    }

    // Simple calculations (would be more sophisticated in production)
    const closes = historicalData.map(c => c.close);
    const sma20 = closes.slice(-20).reduce((a, b) => a + b, 0) / 20;
    const sma50 = closes.length >= 50 ? closes.reduce((a, b) => a + b, 0) / 50 : sma20;

    // RSI calculation (simplified)
    const rsi = this.calculateRSI(closes, 14);

    return {
      symbol,
      rsi,
      macd: undefined, // Would need proper calculation
      sma20,
      sma50,
      sma200: undefined, // Would need 200 days of data
      ema12: undefined,
      ema26: undefined,
      timestamp: new Date(),
    };
  }

  async getStatus(): Promise<ProviderStatus> {
    try {
      const testSymbol = 'AAPL';
      const startTime = Date.now();
      await this.polygonClient.getQuote(testSymbol);
      const latency = Date.now() - startTime;

      return {
        name: this.name,
        isHealthy: true,
        latency,
        lastCheck: new Date(),
      };
    } catch (error) {
      return {
        name: this.name,
        isHealthy: false,
        latency: 0,
        lastCheck: new Date(),
      };
    }
  }

  getCapabilities(): ProviderCapabilities {
    return {
      realtime: this.config.tier === 'pro',
      historical: true,
      technicalIndicators: false, // We calculate them, not provided directly
      fundamentals: false,
      streaming: false, // WebSocket available but not implemented yet
      bulkQuotes: true,
      maxSymbolsPerRequest: this.config.tier === 'pro' ? 100 : 10,
      supportedTimeframes: ['1m', '5m', '15m', '1h', '4h', '1d'] as Timeframe[],
      supportedMarkets: ['US'],
    };
  }

  async isSymbolValid(symbol: string): Promise<boolean> {
    try {
      const details = await this.polygonClient.getTickerDetails(symbol);
      return details !== null && details.isActive !== false;
    } catch {
      return false;
    }
  }

  normalizeSymbol(symbol: string): string {
    // Polygon uses uppercase symbols
    return symbol.toUpperCase().replace('/', '.');
  }

  // Helper method for RSI calculation
  private calculateRSI(prices: number[], period: number = 14): number {
    if (prices.length < period + 1) return 50; // Not enough data

    const gains: number[] = [];
    const losses: number[] = [];

    for (let i = 1; i < prices.length; i++) {
      const diff = prices[i] - prices[i - 1];
      gains.push(diff > 0 ? diff : 0);
      losses.push(diff < 0 ? Math.abs(diff) : 0);
    }

    const avgGain = gains.slice(-period).reduce((a, b) => a + b, 0) / period;
    const avgLoss = losses.slice(-period).reduce((a, b) => a + b, 0) / period;

    if (avgLoss === 0) return 100;
    const rs = avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
  }
}