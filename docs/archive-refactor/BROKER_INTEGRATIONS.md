# TrendDojo Broker Integrations Specification

*Last updated: 2025-09-28*
*Extracted from: trenddojo-setup-technical-spec.md*

## Overview

TrendDojo supports multiple broker integrations for position execution and portfolio synchronization. The system prioritizes manual entry for beta with planned automated broker integrations for production.

## Supported Brokers

### Current Support Status

| Broker | Status | Account Types | API Integration | Notes |
|--------|--------|---------------|-----------------|-------|
| Manual | ✅ Active | All | N/A | Primary method for beta |
| Alpaca | 🚧 Planned | Live, Paper | REST API | Priority integration |
| Interactive Brokers (IBKR) | 📋 Future | Live, Paper | TWS API | Complex integration |
| TD Ameritrade | 📋 Future | Live, Paper | REST API | Legacy support |

## Database Schema

### Broker Connections Table

Stores encrypted broker credentials and connection status.

```sql
CREATE TABLE broker_connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    broker VARCHAR(50), -- 'alpaca', 'td_ameritrade', 'interactive_brokers'
    credentials TEXT, -- Encrypted JSON
    is_paper BOOLEAN DEFAULT true,
    is_active BOOLEAN DEFAULT true,
    last_sync TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### Broker-Related Trade Fields

Trades table includes broker integration fields for execution tracking.

```sql
-- In trades table:
-- Broker Integration
broker VARCHAR(50), -- 'alpaca', 'manual', etc
broker_order_id VARCHAR(255),
broker_sync_status VARCHAR(50), -- 'synced', 'pending', 'error', 'imported'
broker_fill_price DECIMAL(15,6),
broker_commission DECIMAL(10,2),
```

### Account Configuration

Accounts support different broker types and paper trading.

```sql
-- In accounts table:
broker VARCHAR(50), -- 'alpaca', 'ibkr', 'manual'
account_type VARCHAR(20), -- 'live', 'paper', 'tracking'
```

## Integration Architecture

### Manual Entry (Current)

For beta and users without broker connections, all trades are entered manually.

**Features:**
- Manual position entry with validation
- Risk management calculations
- Trade journaling
- Performance tracking
- No real-time execution

**Workflow:**
1. User calculates position size
2. Manually places order with broker
3. Records execution details in TrendDojo
4. System tracks performance and risk metrics

### Alpaca Integration (Planned)

REST API integration for automated order execution and portfolio sync.

**Features:**
- Live and paper trading accounts
- Real-time order execution
- Portfolio synchronization
- Commission tracking
- Market data access

**Configuration:**
```typescript
interface AlpacaConfig {
  apiKey: string;
  secretKey: string;
  baseUrl: string; // live or paper trading
  accountId: string;
}
```

**Order Execution Flow:**
```typescript
class AlpacaBrokerService {
  async executeOrder(trade: Trade): Promise<OrderResult> {
    // 1. Validate account and buying power
    const account = await this.getAccount();
    if (account.buying_power < trade.positionValue) {
      throw new Error('Insufficient buying power');
    }

    // 2. Create order request
    const orderRequest = {
      symbol: trade.symbol,
      qty: trade.quantity,
      side: trade.direction === 'long' ? 'buy' : 'sell',
      type: 'limit',
      limit_price: trade.entryPrice,
      time_in_force: 'day',
      stop_loss: {
        stop_price: trade.stopLoss
      },
      take_profit: trade.targetPrice ? {
        limit_price: trade.targetPrice
      } : undefined
    };

    // 3. Submit order
    const order = await alpaca.orders.create(orderRequest);

    // 4. Update trade record
    await prisma.trade.update({
      where: { id: trade.id },
      data: {
        broker_order_id: order.id,
        broker_sync_status: 'pending'
      }
    });

    return {
      orderId: order.id,
      status: order.status,
      commission: this.calculateCommission(trade)
    };
  }

  async syncPortfolio(): Promise<void> {
    // 1. Get positions from Alpaca
    const positions = await alpaca.positions.getAll();

    // 2. Sync with TrendDojo trades
    for (const position of positions) {
      await this.syncPosition(position);
    }
  }

  private async syncPosition(alpacaPosition: any): Promise<void> {
    // Find matching trade in TrendDojo
    const trade = await prisma.trade.findFirst({
      where: {
        symbol: alpacaPosition.symbol,
        status: 'active',
        broker_order_id: { not: null }
      }
    });

    if (trade) {
      // Update with live data
      await prisma.trade.update({
        where: { id: trade.id },
        data: {
          quantity: parseFloat(alpacaPosition.qty),
          broker_fill_price: parseFloat(alpacaPosition.avg_entry_price),
          broker_sync_status: 'synced',
          last_sync: new Date()
        }
      });
    }
  }
}
```

### Interactive Brokers Integration (Future)

TWS API integration for professional traders.

**Features:**
- Multiple account types
- Advanced order types
- Real-time market data
- International markets
- Options trading support

**Challenges:**
- Complex API setup
- TWS software requirement
- Authentication complexity
- Rate limiting

### Market Data Integration

Broker APIs also provide market data for real-time pricing.

```typescript
interface MarketDataProvider {
  getCurrentPrice(symbol: string): Promise<number>;
  getQuote(symbol: string): Promise<Quote>;
  getBarData(symbol: string, timeframe: string): Promise<Candle[]>;
}

class AlpacaMarketData implements MarketDataProvider {
  async getCurrentPrice(symbol: string): Promise<number> {
    const quote = await alpaca.data.quotes.latest(symbol);
    return (quote.bid_price + quote.ask_price) / 2;
  }

  async getBarData(symbol: string, timeframe: string): Promise<Candle[]> {
    const bars = await alpaca.data.bars.latest({
      symbols: [symbol],
      timeframe: this.convertTimeframe(timeframe)
    });

    return bars[symbol].map(bar => ({
      timestamp: new Date(bar.timestamp),
      open: bar.open,
      high: bar.high,
      low: bar.low,
      close: bar.close,
      volume: bar.volume
    }));
  }
}
```

## Risk Management Integration

### Position Size Validation

Broker integrations validate position sizes against account equity.

```typescript
class RiskValidator {
  async validatePositionSize(trade: Trade, broker: BrokerService): Promise<ValidationResult> {
    const account = await broker.getAccount();
    const maxPositionValue = account.equity * 0.3; // 30% max position size

    if (trade.positionValue > maxPositionValue) {
      return {
        valid: false,
        errors: [`Position size ${trade.positionValue} exceeds 30% of account equity`]
      };
    }

    // Check buying power
    if (trade.positionValue > account.buying_power) {
      return {
        valid: false,
        errors: ['Insufficient buying power for position']
      };
    }

    return { valid: true, errors: [] };
  }
}
```

### Commission Calculation

Different brokers have different commission structures.

```typescript
class CommissionCalculator {
  calculateCommission(trade: Trade, broker: string): number {
    switch (broker) {
      case 'alpaca':
        return 0; // Commission-free stock trading

      case 'interactive_brokers':
        // IBKR commission structure
        const shares = trade.quantity;
        const perShare = 0.005; // $0.005 per share
        const minimum = 1.00;   // $1 minimum
        return Math.max(shares * perShare, minimum);

      case 'td_ameritrade':
        return 0; // Commission-free for online stock trades

      default:
        return 0;
    }
  }
}
```

## Order Management

### Order Types

Support for different order types across brokers.

```typescript
interface OrderRequest {
  symbol: string;
  quantity: number;
  side: 'buy' | 'sell';
  type: 'market' | 'limit' | 'stop' | 'stop_limit';
  limitPrice?: number;
  stopPrice?: number;
  timeInForce: 'day' | 'gtc' | 'ioc' | 'fok';
  stopLoss?: {
    stopPrice: number;
    limitPrice?: number;
  };
  takeProfit?: {
    limitPrice: number;
  };
}

class OrderManager {
  async submitOrder(request: OrderRequest, broker: BrokerService): Promise<Order> {
    // Validate order parameters
    const validation = await this.validateOrder(request);
    if (!validation.valid) {
      throw new Error(validation.errors.join(', '));
    }

    // Submit to broker
    const order = await broker.submitOrder(request);

    // Store in database
    await this.storeOrder(order);

    return order;
  }

  async cancelOrder(orderId: string, broker: BrokerService): Promise<void> {
    await broker.cancelOrder(orderId);

    // Update local status
    await prisma.trade.updateMany({
      where: { broker_order_id: orderId },
      data: { broker_sync_status: 'cancelled' }
    });
  }
}
```

### Order Status Tracking

Real-time order status updates from broker APIs.

```typescript
enum OrderStatus {
  PENDING = 'pending',
  FILLED = 'filled',
  PARTIALLY_FILLED = 'partially_filled',
  CANCELLED = 'cancelled',
  REJECTED = 'rejected'
}

class OrderStatusTracker {
  async updateOrderStatus(orderId: string, status: OrderStatus, fillData?: FillData): Promise<void> {
    const trade = await prisma.trade.findFirst({
      where: { broker_order_id: orderId }
    });

    if (!trade) return;

    const updateData: any = {
      broker_sync_status: status,
      last_sync: new Date()
    };

    if (status === OrderStatus.FILLED && fillData) {
      updateData.actual_entry = fillData.price;
      updateData.quantity = fillData.quantity;
      updateData.broker_commission = fillData.commission;
      updateData.entry_date = fillData.timestamp;
      updateData.status = 'active';
    }

    await prisma.trade.update({
      where: { id: trade.id },
      data: updateData
    });
  }
}
```

## Security & Credentials

### Credential Encryption

Broker API keys are encrypted before database storage.

```typescript
class CredentialManager {
  private encryptionKey = process.env.BROKER_ENCRYPTION_KEY;

  async storeBrokerCredentials(userId: string, broker: string, credentials: BrokerCredentials): Promise<void> {
    const encrypted = this.encrypt(JSON.stringify(credentials));

    await prisma.brokerConnections.upsert({
      where: { userId_broker: { userId, broker } },
      create: {
        userId,
        broker,
        credentials: encrypted,
        is_paper: credentials.isPaper,
        is_active: true
      },
      update: {
        credentials: encrypted,
        is_paper: credentials.isPaper,
        last_sync: new Date()
      }
    });
  }

  async getBrokerCredentials(userId: string, broker: string): Promise<BrokerCredentials | null> {
    const connection = await prisma.brokerConnections.findUnique({
      where: { userId_broker: { userId, broker } }
    });

    if (!connection || !connection.is_active) {
      return null;
    }

    const decrypted = this.decrypt(connection.credentials);
    return JSON.parse(decrypted);
  }

  private encrypt(text: string): string {
    // Use crypto module for encryption
    const cipher = crypto.createCipher('aes-256-cbc', this.encryptionKey);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
  }

  private decrypt(encryptedText: string): string {
    const decipher = crypto.createDecipher('aes-256-cbc', this.encryptionKey);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }
}
```

### API Rate Limiting

Respect broker API rate limits to avoid disconnections.

```typescript
class RateLimiter {
  private requests: Map<string, number[]> = new Map();

  async checkRateLimit(broker: string, endpoint: string): Promise<boolean> {
    const key = `${broker}-${endpoint}`;
    const now = Date.now();
    const requests = this.requests.get(key) || [];

    // Remove requests older than 1 minute
    const recentRequests = requests.filter(time => now - time < 60000);

    // Check limits (example: 200 requests per minute)
    const limit = this.getRateLimit(broker, endpoint);
    if (recentRequests.length >= limit) {
      return false; // Rate limit exceeded
    }

    // Add current request
    recentRequests.push(now);
    this.requests.set(key, recentRequests);

    return true;
  }

  private getRateLimit(broker: string, endpoint: string): number {
    const limits: Record<string, Record<string, number>> = {
      alpaca: {
        orders: 200,      // 200 orders per minute
        positions: 100,   // 100 position requests per minute
        account: 60       // 60 account requests per minute
      },
      interactive_brokers: {
        orders: 50,       // More conservative for IBKR
        positions: 30,
        account: 10
      }
    };

    return limits[broker]?.[endpoint] || 60;
  }
}
```

## Error Handling

### Broker Connection Failures

Graceful handling of broker API failures.

```typescript
class BrokerErrorHandler {
  async handleBrokerError(error: BrokerError, operation: string): Promise<void> {
    switch (error.type) {
      case 'AUTHENTICATION_FAILED':
        await this.disableBrokerConnection(error.brokerId);
        await this.notifyUser(error.userId, 'Broker authentication failed. Please reconnect.');
        break;

      case 'INSUFFICIENT_FUNDS':
        await this.logError(error, 'Order rejected due to insufficient funds');
        break;

      case 'MARKET_CLOSED':
        await this.queueOrderForMarketOpen(error.orderId);
        break;

      case 'RATE_LIMITED':
        await this.delayAndRetry(error.operation, 60000); // Wait 1 minute
        break;

      default:
        await this.logError(error, `Unexpected broker error: ${error.message}`);
    }
  }
}
```

## Development & Testing

### Broker Mocks

Mock broker services for development and testing.

```typescript
class MockBrokerService implements BrokerService {
  async submitOrder(request: OrderRequest): Promise<Order> {
    // Simulate order processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    return {
      id: `mock-${Date.now()}`,
      status: 'filled',
      filled_at: new Date(),
      filled_qty: request.quantity,
      filled_avg_price: request.limitPrice || 100,
      commission: 0
    };
  }

  async getAccount(): Promise<Account> {
    return {
      equity: 100000,
      buying_power: 80000,
      cash: 20000
    };
  }

  async getPositions(): Promise<Position[]> {
    return []; // Empty for testing
  }
}
```

## Configuration

### Environment Variables

Broker API configuration through environment variables.

```bash
# Alpaca Configuration
ALPACA_API_KEY=your_alpaca_api_key
ALPACA_SECRET_KEY=your_alpaca_secret_key
ALPACA_BASE_URL=https://paper-api.alpaca.markets # or live URL

# Interactive Brokers Configuration
IBKR_CLIENT_ID=your_ibkr_client_id
IBKR_HOST=127.0.0.1
IBKR_PORT=7497 # Paper trading port (7496 for live)

# Security
BROKER_ENCRYPTION_KEY=your_32_character_encryption_key

# Feature Flags
ENABLE_BROKER_INTEGRATIONS=false # Enable for production
DEFAULT_BROKER_MODE=paper # paper or live
```

## Future Enhancements

1. **Multi-Broker Support**: Execute trades across multiple brokers
2. **Smart Order Routing**: Optimize execution across venues
3. **Options Trading**: Support for options strategies
4. **International Markets**: Support for global exchanges
5. **Cryptocurrency**: Integration with crypto exchanges
6. **Alternative Data**: ESG scores, sentiment analysis
7. **Portfolio Optimization**: Automated rebalancing

---

*See also:*
- [Data Models](./DATA_MODELS.md) - Database schemas for broker data
- [API Specification](./API_SPECIFICATION.md) - Broker-related API endpoints
- [Architecture](./ARCHITECTURE.md) - Integration architecture patterns
- [Security](../SECURITY.md) - Security requirements for broker integrations