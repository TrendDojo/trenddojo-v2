# Market Data Provider Implementation Guide

*Last updated: 2025-09-14*

## Overview

This guide explains how to implement new market data providers for TrendDojo. All providers must implement the `IMarketDataProvider` interface to ensure compatibility with the orchestration layer.

## Architecture

```
IMarketDataProvider (interface)
    ↓
├── YahooFinanceProvider (free tier)
├── PolygonProvider (pro tier - future)
├── AlphaVantageProvider (backup - future)
├── MockProvider (development/testing)
└── [YourProvider] (new implementation)
    ↓
MarketDataService (orchestrator)
    ↓
PostgreSQL Cache (persistence)
```

## Interface Contract

All providers MUST implement the `IMarketDataProvider` interface:

```typescript
interface IMarketDataProvider {
  // Provider identification
  readonly name: string;
  readonly config: ProviderConfig;
  
  // Lifecycle methods
  initialize(): Promise<void>;
  shutdown(): Promise<void>;
  
  // Core data methods
  getCurrentPrice(symbol: string): Promise<PriceData>;
  getBulkPrices(symbols: string[]): Promise<BulkPriceResponse>;
  getHistoricalData(options: HistoricalDataOptions): Promise<Candle[]>;
  getTechnicalIndicators(symbol: string): Promise<TechnicalData>;
  
  // Optional streaming
  subscribeToPrice?(
    symbol: string,
    callback: (price: PriceData) => void
  ): PriceSubscription | null;
  
  // Provider health
  getStatus(): Promise<ProviderStatus>;
  getCapabilities(): ProviderCapabilities;
  
  // Validation
  isSymbolValid(symbol: string): Promise<boolean>;
  normalizeSymbol(symbol: string): string;
}
```

## Implementation Checklist

### 1. Create Provider Class

```typescript
import { IMarketDataProvider } from './IMarketDataProvider';
import { /* required types */ } from '../types';

export class YourProvider implements IMarketDataProvider {
  readonly name = 'Your Provider Name';
  readonly config: ProviderConfig;
  
  constructor(config?: Partial<ProviderConfig>) {
    this.config = {
      type: 'your-provider',
      tier: config?.tier || 'free',
      rateLimit: config?.rateLimit || 1000,
      timeout: config?.timeout || 5000,
      retryAttempts: config?.retryAttempts || 3,
      apiKey: config?.apiKey,
    };
  }
  
  // Implement all required methods...
}
```

### 2. Handle Rate Limiting

```typescript
private requestCount = 0;
private requestResetTime = Date.now() + 3600000;

private async checkRateLimit(): Promise<void> {
  if (Date.now() > this.requestResetTime) {
    this.requestCount = 0;
    this.requestResetTime = Date.now() + 3600000;
  }
  
  if (this.requestCount >= this.config.rateLimit) {
    throw new MarketDataError(
      'Rate limit exceeded',
      MarketDataErrorCode.RATE_LIMIT,
      this.name
    );
  }
}
```

### 3. Implement Retry Logic

```typescript
private async fetchWithRetry<T>(url: string): Promise<T> {
  let lastError: any;
  
  for (let attempt = 0; attempt < this.config.retryAttempts; attempt++) {
    try {
      const response = await fetch(url, {
        signal: AbortSignal.timeout(this.config.timeout),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      lastError = error;
      
      if (attempt < this.config.retryAttempts - 1) {
        // Exponential backoff
        await new Promise(resolve => 
          setTimeout(resolve, Math.pow(2, attempt) * 1000)
        );
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
```

### 4. Normalize Data Format

All providers must return data in the standard format:

```typescript
// Price data
interface PriceData {
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

// Candle data
interface Candle {
  timestamp: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}
```

### 5. Handle Errors Consistently

```typescript
async getCurrentPrice(symbol: string): Promise<PriceData> {
  try {
    // Your implementation
  } catch (error) {
    if (/* symbol not found */) {
      throw new MarketDataError(
        `Invalid symbol: ${symbol}`,
        MarketDataErrorCode.INVALID_SYMBOL,
        this.name
      );
    }
    
    if (/* network error */) {
      throw new MarketDataError(
        'Network error',
        MarketDataErrorCode.NETWORK_ERROR,
        this.name,
        error
      );
    }
    
    // Generic provider error
    throw new MarketDataError(
      'Provider error',
      MarketDataErrorCode.PROVIDER_ERROR,
      this.name,
      error
    );
  }
}
```

## Testing Requirements

### 1. Unit Tests

Create comprehensive unit tests covering:

- ✅ All interface methods
- ✅ Error handling scenarios
- ✅ Rate limiting behavior
- ✅ Retry logic
- ✅ Data normalization
- ✅ Symbol validation

### 2. Mock External APIs

```typescript
// Mock fetch for testing
global.fetch = vi.fn();

beforeEach(() => {
  (global.fetch as any).mockResolvedValue({
    ok: true,
    json: async () => mockApiResponse,
  });
});
```

### 3. Test Error Scenarios

```typescript
it('should handle rate limit errors', async () => {
  // Exhaust rate limit
  for (let i = 0; i < provider.config.rateLimit; i++) {
    await provider.getCurrentPrice('AAPL');
  }
  
  // Next request should fail
  await expect(provider.getCurrentPrice('AAPL'))
    .rejects.toThrow(MarketDataErrorCode.RATE_LIMIT);
});
```

## Integration with MarketDataService

### 1. Register Provider

In `MarketDataService.initializeProviders()`:

```typescript
private async initializeProviders(): Promise<void> {
  // Existing providers...
  
  // Add your provider
  if (this.config.userTier === 'premium') {
    const yourProvider = new YourProvider({
      apiKey: process.env.YOUR_PROVIDER_API_KEY,
      tier: this.config.userTier,
    });
    await yourProvider.initialize();
    this.providers.set('your-provider', yourProvider);
    
    // Set as primary if appropriate
    if (this.config.defaultProvider === 'your-provider') {
      this.primaryProvider = yourProvider;
    }
  }
}
```

### 2. Add to Configuration

Update `ServiceConfig` type:

```typescript
interface ServiceConfig {
  defaultProvider: 'yahoo' | 'polygon' | 'your-provider' | 'mock';
  // ...
}
```

## Provider-Specific Considerations

### Yahoo Finance
- **No API key required** for basic data
- **Rate limit**: ~2000 req/hour (undocumented)
- **Limitations**: No real-time streaming, 15-min delay
- **Best for**: Free tier users

### Polygon.io (Future)
- **API key required**
- **Rate limits**: Varies by plan
- **Features**: WebSocket streaming, real-time data
- **Best for**: Pro tier users

### Alpha Vantage (Future)
- **API key required** (free tier available)
- **Rate limit**: 5 req/min (free), 500 req/day
- **Features**: Technical indicators, fundamentals
- **Best for**: Backup provider

### Interactive Brokers (Future)
- **Account required**
- **Features**: Real-time data for account holders
- **Best for**: Users with IBKR accounts

## WebSocket Implementation (Optional)

For providers supporting streaming:

```typescript
private ws?: WebSocket;

private async connectWebSocket(): Promise<void> {
  this.ws = new WebSocket(this.wsUrl);
  
  this.ws.on('open', () => {
    this.ws?.send(JSON.stringify({
      action: 'auth',
      key: this.config.apiKey,
    }));
  });
  
  this.ws.on('message', (data) => {
    const price = this.parseWebSocketMessage(data);
    this.notifySubscribers(price);
  });
  
  this.ws.on('error', (error) => {
    console.error('WebSocket error:', error);
    this.reconnectWebSocket();
  });
}

subscribeToPrice(
  symbol: string,
  callback: (price: PriceData) => void
): PriceSubscription {
  // Add to subscribers
  this.subscribers.get(symbol)?.add(callback) ||
    this.subscribers.set(symbol, new Set([callback]));
  
  // Subscribe via WebSocket
  this.ws?.send(JSON.stringify({
    action: 'subscribe',
    symbols: [symbol],
  }));
  
  return {
    symbol,
    unsubscribe: () => {
      // Remove subscriber and unsubscribe if last one
    },
  };
}
```

## Performance Optimization

### 1. Batch Requests

```typescript
async getBulkPrices(symbols: string[]): Promise<BulkPriceResponse> {
  // Chunk symbols to respect API limits
  const chunks = this.chunkArray(symbols, this.maxSymbolsPerRequest);
  
  const results = await Promise.all(
    chunks.map(chunk => this.fetchBulkPrices(chunk))
  );
  
  // Combine results
  return new Map(results.flatMap(r => Array.from(r)));
}
```

### 2. Implement Caching

The MarketDataService handles caching, but providers can implement internal caching:

```typescript
private cache = new Map<string, { data: any; expires: number }>();

private getCached<T>(key: string): T | null {
  const cached = this.cache.get(key);
  if (cached && cached.expires > Date.now()) {
    return cached.data;
  }
  return null;
}
```

## Deployment Considerations

### 1. Environment Variables

```env
# Provider API keys
YAHOO_FINANCE_API_KEY=optional
POLYGON_API_KEY=your_key_here
ALPHA_VANTAGE_API_KEY=your_key_here
YOUR_PROVIDER_API_KEY=your_key_here

# Provider selection by tier
FREE_TIER_PROVIDER=yahoo
BASIC_TIER_PROVIDER=yahoo
PRO_TIER_PROVIDER=polygon
```

### 2. Feature Flags

```typescript
const FEATURE_FLAGS = {
  enablePolygonProvider: process.env.ENABLE_POLYGON === 'true',
  enableAlphaVantage: process.env.ENABLE_ALPHA_VANTAGE === 'true',
  // ...
};
```

### 3. Monitoring

```typescript
async getStatus(): Promise<ProviderStatus> {
  return {
    name: this.name,
    isHealthy: await this.checkHealth(),
    lastCheck: new Date(),
    latency: this.averageLatency,
    errorRate: this.calculateErrorRate(),
    rateLimit: {
      remaining: this.getRemainingRequests(),
      reset: this.getResetTime(),
    },
  };
}
```

## Migration Path

When adding a new provider as replacement:

1. **Implement provider** following this guide
2. **Add comprehensive tests** (>95% coverage)
3. **Test in development** with MockProvider fallback
4. **Deploy to staging** with limited users
5. **Monitor performance** and error rates
6. **Gradual rollout** using feature flags
7. **Full deployment** after validation

## Common Pitfalls to Avoid

1. ❌ **Not handling rate limits** - Always implement rate limiting
2. ❌ **Missing retry logic** - Network failures are common
3. ❌ **Inconsistent data format** - Always normalize to standard types
4. ❌ **Poor error messages** - Use specific error codes
5. ❌ **No timeout handling** - Always set request timeouts
6. ❌ **Ignoring timezones** - Ensure consistent timestamp handling
7. ❌ **Memory leaks** - Clean up subscriptions and intervals
8. ❌ **Missing health checks** - Implement provider health monitoring

## Example: Adding Polygon.io Provider

See `/src/lib/market-data/providers/YahooFinanceProvider.ts` for a complete reference implementation. Key differences for Polygon.io would be:

1. **WebSocket support** for real-time streaming
2. **API key authentication** required
3. **Different endpoint structure**
4. **Native technical indicators** (no calculation needed)
5. **Higher rate limits** for paid tiers

---

*For questions or improvements to this guide, please update this document and notify the team.*