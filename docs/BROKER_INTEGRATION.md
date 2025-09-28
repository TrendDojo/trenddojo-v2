# TrendDojo Broker Integration Guide

*Last updated: 2025-09-28*
*Consolidated from: patterns/BROKER-INTEGRATION-PATTERNS.md + reference/BROKER_INTEGRATIONS.md*

## Overview

TrendDojo supports multiple broker integrations for position execution and portfolio synchronization. The system prioritizes manual entry for beta with planned automated broker integrations for production.

## Core Principles

### 1. Mock-First Development
- **ALWAYS** develop with mock data first
- **NEVER** connect to live brokers during development
- Mock mode is the default - live connections require explicit configuration
- All broker clients must implement comprehensive mock responses

### 2. Abstraction Layer
- All brokers implement the `BrokerClient` interface
- Core business logic NEVER imports specific broker implementations
- BrokerManager handles broker selection and orchestration
- Provider-specific quirks isolated within broker implementations

### 3. Security First
- Credentials encrypted at rest using AES-256-GCM
- Paper trading completely isolated from live trading
- Audit logging for all trading operations
- Rate limiting on all broker API endpoints
- Session-based credential access with automatic timeout

## Supported Brokers

### Current Support Status

| Broker | Status | Account Types | API Integration | Notes |
|--------|--------|---------------|-----------------|-------|
| Manual | ✅ Active | All | N/A | Primary method for beta |
| Alpaca | 🚧 Planned | Live, Paper | REST API | Priority integration |
| Interactive Brokers (IBKR) | 📋 Future | Live, Paper | TWS API | Complex integration |
| TD Ameritrade | 📋 Future | Live, Paper | REST API | Legacy support |

## Core Interface

```typescript
// @business-critical: Core broker abstraction
export interface BrokerClient {
  // Connection Management
  name: string;
  connect(): Promise<boolean>;
  disconnect(): Promise<void>;
  isConnected(): boolean;
  getConnectionStatus(): ConnectionStatus;

  // Account Information
  getAccountInfo(): Promise<AccountInfo>;
  getPositions(): Promise<Position[]>;
  getBalances(): Promise<Balances>;

  // Order Management
  placeOrder(order: OrderRequest): Promise<OrderResponse>;
  cancelOrder(orderId: string): Promise<boolean>;
  modifyOrder(orderId: string, updates: OrderUpdate): Promise<boolean>;
  getOrderStatus(orderId: string): Promise<OrderStatus>;
  getOpenOrders(): Promise<Order[]>;
  getOrderHistory(days: number): Promise<Order[]>;

  // Market Data
  getMarketData(symbol: string): Promise<MarketData>;
  getMarketHours(market: string): Promise<MarketHours>;
  subscribeToMarketData(
    symbol: string,
    callback: (data: MarketData) => void
  ): Promise<() => void>;

  // Risk Management
  validateOrder(order: OrderRequest): Promise<ValidationResult>;
  getMarginRequirements(order: OrderRequest): Promise<MarginInfo>;
  getRiskMetrics(): Promise<RiskMetrics>;
}
```

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

```sql
-- In accounts table:
broker VARCHAR(50), -- 'alpaca', 'ibkr', 'manual'
account_type VARCHAR(20), -- 'live', 'paper', 'tracking'
```

## Implementation Structure

### Directory Layout
```
src/lib/brokers/
├── types.ts                    # Shared types and interfaces
├── BrokerManager.ts            # Central orchestrator
├── BrokerCredentialStore.ts    # Secure credential storage
├── mock/
│   └── MockBrokerClient.ts    # Base mock implementation
├── interactive-brokers/
│   ├── IBClient.ts            # IB implementation
│   ├── IBGateway.ts           # Gateway connection logic
│   ├── IBMockData.ts          # IB-specific mock data
│   └── IBTypes.ts             # IB-specific types
├── alpaca/
│   ├── AlpacaClient.ts        # Alpaca implementation
│   └── AlpacaMockData.ts      # Alpaca mock data
└── __tests__/
    ├── BrokerManager.test.ts
    └── brokers/                # Broker-specific tests
```

## Broker Implementations

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

## Mock Development Pattern

### Base Mock Client
```typescript
export abstract class MockBrokerClient implements BrokerClient {
  protected mockMode = true;
  protected mockLatency = 100; // ms
  protected mockAccounts: Map<string, AccountInfo> = new Map();
  protected mockPositions: Position[] = [];
  protected mockOrders: Order[] = [];

  constructor(config?: MockConfig) {
    this.initializeMockData();
  }

  private initializeMockData(): void {
    // Generate realistic mock data
    this.mockAccounts.set('default', {
      accountId: 'MOCK123456',
      balance: 100000,
      buyingPower: 200000,
      currency: 'USD',
      positions: [],
    });
  }

  async connect(): Promise<boolean> {
    await this.simulateLatency();
    return true;
  }

  protected async simulateLatency(): Promise<void> {
    await new Promise(resolve =>
      setTimeout(resolve, this.mockLatency)
    );
  }

  // Mock realistic market data changes
  protected generatePriceMovement(basePrice: number): number {
    const volatility = 0.02; // 2% volatility
    const change = (Math.random() - 0.5) * volatility;
    return basePrice * (1 + change);
  }
}
```

### Broker-Specific Mock Implementation
```typescript
export class InteractiveBrokersClient extends MockBrokerClient {
  private ibGateway?: IBGateway;

  constructor(config: IBConfig) {
    super(config);
    this.name = 'Interactive Brokers';

    if (!config.mockMode && config.gateway) {
      this.ibGateway = new IBGateway(config.gateway);
      this.mockMode = false;
    }
  }

  async placeOrder(order: OrderRequest): Promise<OrderResponse> {
    if (this.mockMode) {
      return this.placeMockOrder(order);
    }

    // Real IB implementation
    if (!this.ibGateway?.isConnected()) {
      throw new BrokerError('IB Gateway not connected');
    }

    return this.ibGateway.placeOrder(order);
  }

  private async placeMockOrder(order: OrderRequest): Promise<OrderResponse> {
    await this.simulateLatency();

    // Validate order
    const validation = await this.validateOrder(order);
    if (!validation.isValid) {
      throw new BrokerError(validation.errors.join(', '));
    }

    // Generate mock response
    return {
      orderId: `IB-${Date.now()}`,
      symbol: order.symbol,
      quantity: order.quantity,
      side: order.side,
      type: order.type,
      status: 'submitted',
      timestamp: new Date(),
      message: 'Order submitted successfully (mock)',
    };
  }
}
```

## Security Implementation

### Credential Encryption
```typescript
// @business-critical: Credential encryption
import { createCipheriv, createDecipheriv, randomBytes, scrypt } from 'crypto';

export class BrokerCredentialStore {
  private algorithm = 'aes-256-gcm';
  private salt: Buffer;

  constructor(private masterKey: string) {
    this.salt = randomBytes(32);
  }

  async encryptCredentials(
    broker: string,
    credentials: BrokerCredentials
  ): Promise<EncryptedCredentials> {
    const key = await this.deriveKey(this.masterKey);
    const iv = randomBytes(16);
    const cipher = createCipheriv(this.algorithm, key, iv);

    const encrypted = Buffer.concat([
      cipher.update(JSON.stringify(credentials), 'utf8'),
      cipher.final(),
    ]);

    const authTag = cipher.getAuthTag();

    return {
      broker,
      encrypted: encrypted.toString('base64'),
      iv: iv.toString('base64'),
      authTag: authTag.toString('base64'),
      salt: this.salt.toString('base64'),
    };
  }

  async decryptCredentials(
    encrypted: EncryptedCredentials
  ): Promise<BrokerCredentials> {
    const key = await this.deriveKey(this.masterKey);
    const decipher = createDecipheriv(
      this.algorithm,
      key,
      Buffer.from(encrypted.iv, 'base64')
    );

    decipher.setAuthTag(Buffer.from(encrypted.authTag, 'base64'));

    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(encrypted.encrypted, 'base64')),
      decipher.final(),
    ]);

    return JSON.parse(decrypted.toString('utf8'));
  }

  private async deriveKey(password: string): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      scrypt(password, this.salt, 32, (err, key) => {
        if (err) reject(err);
        else resolve(key);
      });
    });
  }
}
```

### API Rate Limiting
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

### Standard Error Types
```typescript
export class BrokerError extends Error {
  constructor(
    message: string,
    public code: BrokerErrorCode,
    public broker: string,
    public details?: any
  ) {
    super(message);
    this.name = 'BrokerError';
  }
}

export enum BrokerErrorCode {
  // Connection errors
  CONNECTION_FAILED = 'CONNECTION_FAILED',
  AUTHENTICATION_FAILED = 'AUTHENTICATION_FAILED',
  GATEWAY_NOT_RUNNING = 'GATEWAY_NOT_RUNNING',
  SESSION_EXPIRED = 'SESSION_EXPIRED',

  // Trading errors
  INSUFFICIENT_FUNDS = 'INSUFFICIENT_FUNDS',
  POSITION_SIZE_EXCEEDED = 'POSITION_SIZE_EXCEEDED',
  MARKET_CLOSED = 'MARKET_CLOSED',
  SYMBOL_NOT_FOUND = 'SYMBOL_NOT_FOUND',
  ORDER_REJECTED = 'ORDER_REJECTED',

  // Risk errors
  RISK_LIMIT_EXCEEDED = 'RISK_LIMIT_EXCEEDED',
  DAILY_LOSS_LIMIT = 'DAILY_LOSS_LIMIT',
  MARGIN_CALL = 'MARGIN_CALL',

  // System errors
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  API_ERROR = 'API_ERROR',
  TIMEOUT = 'TIMEOUT',
  UNKNOWN = 'UNKNOWN',
}
```

### Error Recovery Pattern
```typescript
export class BrokerErrorHandler {
  async handleError(
    error: BrokerError,
    context: ErrorContext
  ): Promise<ErrorResolution> {
    switch (error.code) {
      case BrokerErrorCode.CONNECTION_FAILED:
        return this.handleConnectionError(error, context);

      case BrokerErrorCode.INSUFFICIENT_FUNDS:
        return {
          action: 'NOTIFY_USER',
          message: 'Insufficient funds for this trade',
          canRetry: false,
        };

      case BrokerErrorCode.RATE_LIMIT_EXCEEDED:
        return {
          action: 'RETRY_WITH_BACKOFF',
          retryAfter: 60000, // 1 minute
          canRetry: true,
        };

      case BrokerErrorCode.SESSION_EXPIRED:
        return {
          action: 'REAUTHENTICATE',
          message: 'Session expired, please reconnect',
          canRetry: true,
        };

      default:
        return {
          action: 'LOG_AND_NOTIFY',
          message: error.message,
          canRetry: false,
        };
    }
  }
}
```

## Order Management

### Order Types
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
```

### Order Status Tracking
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

## Risk Management Integration

### Position Size Validation
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

## Connection Management

### Connection Status Monitoring
```typescript
export class BrokerConnectionMonitor {
  private intervals: Map<string, NodeJS.Timeout> = new Map();
  private statusCallbacks: Map<string, Set<StatusCallback>> = new Map();

  startMonitoring(
    broker: string,
    client: BrokerClient,
    interval = 30000 // 30 seconds
  ): void {
    // Clear existing interval
    this.stopMonitoring(broker);

    const checkConnection = async () => {
      try {
        const status = await client.getConnectionStatus();
        this.notifyStatusChange(broker, status);

        if (status.isConnected && !status.isHealthy) {
          // Attempt reconnection
          await client.disconnect();
          await client.connect();
        }
      } catch (error) {
        this.notifyStatusChange(broker, {
          isConnected: false,
          isHealthy: false,
          error: error.message,
        });
      }
    };

    // Initial check
    checkConnection();

    // Set up interval
    const intervalId = setInterval(checkConnection, interval);
    this.intervals.set(broker, intervalId);
  }

  stopMonitoring(broker: string): void {
    const interval = this.intervals.get(broker);
    if (interval) {
      clearInterval(interval);
      this.intervals.delete(broker);
    }
  }
}
```

## API Implementation

### REST API Endpoint
```typescript
// app/api/brokers/[broker]/connect/route.ts
export async function POST(
  request: Request,
  { params }: { params: { broker: string } }
) {
  try {
    // Authentication check
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Rate limiting
    const rateLimitOk = await checkRateLimit(
      session.user.id,
      'broker_connect'
    );
    if (!rateLimitOk) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }

    // Validate broker
    const supportedBrokers = ['interactive_brokers', 'alpaca', 'paper'];
    if (!supportedBrokers.includes(params.broker)) {
      return NextResponse.json(
        { error: 'Unsupported broker' },
        { status: 400 }
      );
    }

    // Parse and validate credentials
    const body = await request.json();
    const validation = validateBrokerCredentials(params.broker, body);
    if (!validation.isValid) {
      return NextResponse.json(
        { error: validation.errors },
        { status: 400 }
      );
    }

    // Encrypt and store credentials
    const credentialStore = new BrokerCredentialStore(
      process.env.CREDENTIAL_MASTER_KEY!
    );
    const encrypted = await credentialStore.encryptCredentials(
      params.broker,
      body
    );

    // Store in database
    await prisma.brokerCredential.upsert({
      where: {
        userId_broker: {
          userId: session.user.id,
          broker: params.broker,
        },
      },
      update: {
        credentials: encrypted,
        updatedAt: new Date(),
      },
      create: {
        userId: session.user.id,
        broker: params.broker,
        credentials: encrypted,
      },
    });

    // Attempt connection
    const brokerManager = getBrokerManager();
    const success = await brokerManager.connectBroker(
      params.broker as SupportedBroker,
      body
    );

    if (success) {
      const accountInfo = await brokerManager
        .getBroker(params.broker)
        ?.getAccountInfo();

      return NextResponse.json({
        success: true,
        accountInfo,
      });
    } else {
      return NextResponse.json(
        { error: 'Connection failed' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Broker connection error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

## UI Components

### Broker Connection Form
```typescript
export function BrokerConnectionForm({ broker }: { broker: string }) {
  const [credentials, setCredentials] = useState<BrokerCredentials>({});
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConnect = async () => {
    setIsConnecting(true);
    setError(null);

    try {
      const response = await fetch(`/api/brokers/${broker}/connect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(`Connected to ${broker}`);
        // Update UI with account info
      } else {
        setError(data.error || 'Connection failed');
      }
    } catch (error) {
      setError('Network error');
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Connect to {broker}</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Broker-specific credential fields */}
        <BrokerCredentialFields
          broker={broker}
          credentials={credentials}
          onChange={setCredentials}
        />

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter>
        <Button
          onClick={handleConnect}
          disabled={isConnecting}
        >
          {isConnecting ? 'Connecting...' : 'Connect'}
        </Button>
      </CardFooter>
    </Card>
  );
}
```

## Testing

### Integration Test Structure
```typescript
describe('BrokerClient Integration', () => {
  let client: BrokerClient;
  let monitor: BrokerConnectionMonitor;

  beforeEach(() => {
    // Always use mock mode for tests
    client = new InteractiveBrokersClient({
      mockMode: true,
      mockLatency: 10,
    });
    monitor = new BrokerConnectionMonitor();
  });

  describe('Connection Management', () => {
    it('should connect successfully in mock mode', async () => {
      const result = await client.connect();
      expect(result).toBe(true);
      expect(client.isConnected()).toBe(true);
    });

    it('should handle connection failures gracefully', async () => {
      // Force connection failure
      client.simulateError(BrokerErrorCode.CONNECTION_FAILED);

      await expect(client.connect()).rejects.toThrow(BrokerError);
      expect(client.isConnected()).toBe(false);
    });
  });

  describe('Order Execution', () => {
    beforeEach(async () => {
      await client.connect();
    });

    it('should validate orders before submission', async () => {
      const invalidOrder: OrderRequest = {
        symbol: 'AAPL',
        quantity: -10, // Invalid quantity
        side: 'buy',
        type: 'market',
      };

      await expect(client.placeOrder(invalidOrder))
        .rejects.toThrow('Invalid order quantity');
    });

    it('should execute valid orders', async () => {
      const order: OrderRequest = {
        symbol: 'AAPL',
        quantity: 100,
        side: 'buy',
        type: 'limit',
        price: 150.00,
      };

      const response = await client.placeOrder(order);

      expect(response.orderId).toBeDefined();
      expect(response.status).toBe('submitted');
      expect(response.symbol).toBe('AAPL');
    });
  });
});
```

## Migration Guide for New Brokers

### Step-by-Step Implementation

1. **Create broker directory structure**
```bash
mkdir -p src/lib/brokers/new-broker
touch src/lib/brokers/new-broker/NewBrokerClient.ts
touch src/lib/brokers/new-broker/NewBrokerMockData.ts
touch src/lib/brokers/new-broker/NewBrokerTypes.ts
```

2. **Implement BrokerClient interface**
```typescript
// NewBrokerClient.ts
import { BrokerClient } from '../types';
import { MockBrokerClient } from '../mock/MockBrokerClient';

export class NewBrokerClient extends MockBrokerClient {
  constructor(config: NewBrokerConfig) {
    super(config);
    this.name = 'New Broker';

    if (!config.mockMode) {
      // Initialize real broker connection
    }
  }

  // Implement all required methods
}
```

3. **Add to BrokerManager**
```typescript
// In BrokerManager.ts
private createBrokerClient(
  broker: SupportedBroker,
  config: BrokerConfig
): BrokerClient {
  switch (broker) {
    case 'new_broker':
      return new NewBrokerClient(config);
    // ... other cases
  }
}
```

4. **Create comprehensive tests**
5. **Add UI components**
6. **Update documentation**

## Configuration

### Environment Variables
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

## Security Checklist

Before deploying any broker integration:

- [ ] All credentials encrypted with AES-256-GCM
- [ ] Paper trading isolated from live trading
- [ ] Rate limiting implemented on all endpoints
- [ ] Audit logging for all operations
- [ ] Session timeout configured
- [ ] Error messages don't leak sensitive info
- [ ] All inputs validated and sanitized
- [ ] CORS properly configured
- [ ] API keys rotatable
- [ ] Penetration testing completed

## Best Practices

### DO's
- ✅ Always develop with mock mode first
- ✅ Implement comprehensive error handling
- ✅ Add audit logging for all trading operations
- ✅ Validate all orders before submission
- ✅ Encrypt credentials at rest
- ✅ Implement rate limiting
- ✅ Test all error scenarios
- ✅ Document broker-specific quirks
- ✅ Use TypeScript strict mode
- ✅ Follow the abstraction pattern

### DON'Ts
- ❌ Never store plain text credentials
- ❌ Never connect to live brokers in development
- ❌ Never skip order validation
- ❌ Never ignore error handling
- ❌ Never mix paper and live trading
- ❌ Never hardcode broker-specific logic in core
- ❌ Never skip the mock implementation
- ❌ Never bypass rate limits
- ❌ Never log sensitive information
- ❌ Never deploy without testing

## Future Enhancements

1. **Multi-Broker Support**: Execute trades across multiple brokers
2. **Smart Order Routing**: Optimize execution across venues
3. **Options Trading**: Support for options strategies
4. **International Markets**: Support for global exchanges
5. **Cryptocurrency**: Integration with crypto exchanges
6. **Alternative Data**: ESG scores, sentiment analysis
7. **Portfolio Optimization**: Automated rebalancing

---

*For broker-specific implementation details, see individual broker documentation in `/docs/brokers/`*

**See also:**
- [Data Models](./reference/DATA_MODELS.md) - Database schemas for broker data
- [API Specification](./reference/API_SPECIFICATION.md) - Broker-related API endpoints
- [Architecture](./reference/ARCHITECTURE.md) - Integration architecture patterns
- [Security](./SECURITY.md) - Security requirements for broker integrations