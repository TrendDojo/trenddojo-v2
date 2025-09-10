# Trading-Specific Patterns - TrendDojo

*Specialized patterns for financial trading applications and risk management*
*Last Updated: 2025-09-10*

## Risk Management Patterns

### Position Sizing Calculations
```typescript
interface PositionSizing {
  accountBalance: number;
  riskPercentage: number; // e.g., 0.02 for 2%
  entryPrice: number;
  stopLoss: number;
  
  // Calculated values
  riskAmount: number; // accountBalance * riskPercentage
  priceRisk: number;  // entryPrice - stopLoss
  shareQuantity: number; // riskAmount / priceRisk
}

// @business-critical: Position sizing affects capital at risk
// MUST have unit tests before deployment
function calculatePositionSize(params: PositionSizing): number {
  const riskAmount = params.accountBalance * params.riskPercentage;
  const priceRisk = Math.abs(params.entryPrice - params.stopLoss);
  return Math.floor(riskAmount / priceRisk);
}
```

### Risk Validation Rules
- **Maximum Position Size**: 10% of portfolio per single stock
- **Maximum Sector Exposure**: 25% of portfolio per sector
- **Daily Loss Limit**: Stop trading if daily loss exceeds 2%
- **Consecutive Loss Limit**: Reduce position size after 3 consecutive losses

### Portfolio Risk Metrics
```typescript
interface RiskMetrics {
  totalExposure: number;        // Sum of all position values
  marginUsed: number;           // Amount of margin currently used
  buyingPower: number;          // Available cash for new positions
  betaWeightedDelta: number;    // Portfolio correlation to market
  maxDrawdown: number;          // Maximum peak-to-trough decline
  sharpeRatio: number;          // Risk-adjusted return measure
}
```

## Trade Lifecycle Patterns

### Order States
```typescript
type OrderStatus = 
  | 'draft'           // Being created, not submitted
  | 'pending'         // Submitted, awaiting broker confirmation
  | 'working'         // Active in market, waiting for fill
  | 'partially_filled' // Some shares filled, waiting for remainder
  | 'filled'          // Complete execution
  | 'cancelled'       // User or system cancelled
  | 'rejected'        // Broker rejected order
  | 'expired'         // Time-based order expired

interface TradeOrder {
  id: string;
  symbol: string;
  side: 'buy' | 'sell';
  quantity: number;
  orderType: 'market' | 'limit' | 'stop' | 'stop_limit';
  price?: number;
  stopPrice?: number;
  timeInForce: 'DAY' | 'GTC' | 'IOC' | 'FOK';
  status: OrderStatus;
  
  // Execution details
  filledQuantity: number;
  avgFillPrice: number;
  commission: number;
  
  // Timestamps
  submittedAt: Date;
  filledAt?: Date;
  cancelledAt?: Date;
}
```

### Position Tracking
```typescript
interface Position {
  id: string;
  symbol: string;
  quantity: number;
  averagePrice: number;
  
  // Current market data
  currentPrice: number;
  lastUpdate: Date;
  
  // P&L calculations (server-side only)
  unrealizedPnL: number;
  unrealizedPnLPercent: number;
  dayChange: number;
  dayChangePercent: number;
  
  // Risk management
  initialRisk: number;        // Amount at risk when opened
  stopLoss?: number;
  takeProfit?: number;
  
  // Metadata
  strategy?: string;          // Which strategy opened this
  notes?: string;
  openedAt: Date;
}
```

## Market Data Patterns

### Real-time Price Updates
```typescript
interface PriceUpdate {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  timestamp: Date;
  
  // Market session info
  marketSession: 'pre' | 'regular' | 'after' | 'closed';
  lastTradeTime: Date;
}

// WebSocket subscription pattern
class MarketDataService {
  subscribeToSymbols(symbols: string[], callback: (update: PriceUpdate) => void) {
    // Subscribe to real-time feeds
    // Handle connection drops and reconnection
    // Batch updates to prevent UI thrashing
  }
  
  unsubscribeFromSymbols(symbols: string[]) {
    // Clean up subscriptions
  }
}
```

### Chart Data Management
```typescript
interface ChartData {
  symbol: string;
  timeframe: '1m' | '5m' | '15m' | '1h' | '4h' | '1d' | '1w';
  candles: {
    timestamp: Date;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
  }[];
}

// Efficient data loading
class ChartDataService {
  async getChartData(symbol: string, timeframe: string, range: string): Promise<ChartData> {
    // Check cache first
    // Fetch missing data from API
    // Store in time-series optimized format
    // Return merged result
  }
}
```

## Performance Tracking Patterns

### Trade Analysis
```typescript
interface TradeAnalysis {
  // Basic metrics
  entryPrice: number;
  exitPrice: number;
  quantity: number;
  commission: number;
  
  // Performance
  grossProfit: number;        // Before commission
  netProfit: number;          // After commission
  returnPercent: number;      // Percentage return
  
  // Risk metrics
  initialRisk: number;        // Amount at risk
  riskRewardRatio: number;    // Reward/Risk ratio
  maxAdverseExcursion: number; // Worst drawdown during trade
  maxFavorableExcursion: number; // Best profit during trade
  
  // Timing
  holdingPeriod: number;      // Days held
  entryTime: Date;
  exitTime: Date;
  
  // Classification
  winner: boolean;
  strategy?: string;
  tags: string[];
}
```

### Portfolio Performance
```typescript
interface PerformanceMetrics {
  // Time periods
  daily: PerformancePeriod;
  weekly: PerformancePeriod;
  monthly: PerformancePeriod;
  yearly: PerformancePeriod;
  inception: PerformancePeriod;
}

interface PerformancePeriod {
  startValue: number;
  endValue: number;
  totalReturn: number;
  totalReturnPercent: number;
  
  // Risk-adjusted metrics
  sharpeRatio: number;
  sortinoRatio: number;
  maxDrawdown: number;
  volatility: number;
  
  // Trading metrics
  winRate: number;
  profitFactor: number;
  averageWin: number;
  averageLoss: number;
  expectancy: number;
  
  // Activity
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
}
```

## Strategy Pattern Implementation

### Strategy Interface
```typescript
interface TradingStrategy {
  name: string;
  description: string;
  parameters: Record<string, any>;
  
  // Signal generation
  generateSignals(marketData: MarketData): TradingSignal[];
  
  // Risk management
  calculatePositionSize(signal: TradingSignal, portfolio: Portfolio): number;
  setStopLoss(entry: number, signal: TradingSignal): number;
  setTakeProfit(entry: number, signal: TradingSignal): number;
  
  // Position management
  shouldExit(position: Position, marketData: MarketData): boolean;
}

interface TradingSignal {
  symbol: string;
  direction: 'long' | 'short';
  strength: number;      // 0-1 signal confidence
  entryPrice: number;
  stopLoss: number;
  takeProfit: number;
  reasoning: string;     // Why this signal was generated
  timestamp: Date;
}
```

### Common Strategy Types
```typescript
// Trend following
class MovingAverageCrossover implements TradingStrategy {
  generateSignals(data: MarketData): TradingSignal[] {
    // Fast MA crosses above slow MA = buy signal
    // Fast MA crosses below slow MA = sell signal
  }
}

// Mean reversion
class RSIOversold implements TradingStrategy {
  generateSignals(data: MarketData): TradingSignal[] {
    // RSI < 30 = potential buy
    // RSI > 70 = potential sell
  }
}

// Breakout
class ChannelBreakout implements TradingStrategy {
  generateSignals(data: MarketData): TradingSignal[] {
    // Price breaks above resistance = buy
    // Price breaks below support = sell
  }
}
```

## Error Recovery Patterns

### Broker API Failures
```typescript
class BrokerAPIClient {
  async placeOrder(order: TradeOrder): Promise<OrderResponse> {
    try {
      return await this.submitOrder(order);
    } catch (error) {
      if (error.code === 'INSUFFICIENT_FUNDS') {
        throw new TradingError('Not enough buying power', 'FUNDS');
      } else if (error.code === 'MARKET_CLOSED') {
        // Queue for when market opens
        await this.queueOrder(order);
        return { status: 'queued' };
      } else if (error.code === 'RATE_LIMIT') {
        // Retry with exponential backoff
        await this.delay(error.retryAfter);
        return this.placeOrder(order);
      } else {
        // Log and fail gracefully
        this.logError(error, order);
        throw new TradingError('Order failed - please try again', 'API_ERROR');
      }
    }
  }
}
```

### Data Feed Interruptions
```typescript
class ReliableMarketData {
  private primaryFeed: MarketDataFeed;
  private fallbackFeeds: MarketDataFeed[];
  
  async subscribe(symbols: string[]): Promise<void> {
    try {
      await this.primaryFeed.subscribe(symbols);
    } catch (error) {
      // Fall back to secondary data source
      await this.fallbackFeeds[0].subscribe(symbols);
      this.notifyDataSourceChange('fallback');
    }
  }
  
  private handleConnectionLoss(): void {
    // Show user that data is stale
    // Attempt reconnection
    // Use cached data with timestamps
    // Prevent trading on stale data
  }
}
```

## 🔍 Business-Critical Functions

All functions in this document marked with `@business-critical` comments MUST:
1. Have comprehensive unit tests (>95% coverage)
2. Include edge case testing
3. Have integration tests with mock broker APIs
4. Be reviewed before deployment
5. Never be deployed without explicit approval

## Usage History
<!-- Add entries when this doc contributes to completing a task -->
<!-- Format: - YYYY-MM-DD: Used for WB-XXXX-XX-XXX (Brief description) -->
- 2025-09-05: Created for documentation harmonization (Trading-specific patterns and risk management)
- 2025-09-10: Enhanced with business-critical flagging system