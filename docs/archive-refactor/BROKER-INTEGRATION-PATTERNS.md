# Broker Integration Patterns

*Last updated: 2025-09-15*

## Overview

This document defines the standard patterns for integrating brokers into TrendDojo. All broker integrations MUST follow these patterns to ensure consistency, security, and maintainability.

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
- Credentials encrypted at rest using AES-256
- Paper trading completely isolated from live trading
- Audit logging for all trading operations
- Rate limiting on all broker API endpoints
- Session-based credential access with automatic timeout

## Standard Broker Interface

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

## Credential Storage Pattern

### Secure Storage Implementation
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

## Connection Management Pattern

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
  
  onStatusChange(
    broker: string,
    callback: StatusCallback
  ): () => void {
    if (!this.statusCallbacks.has(broker)) {
      this.statusCallbacks.set(broker, new Set());
    }
    
    this.statusCallbacks.get(broker)!.add(callback);
    
    // Return unsubscribe function
    return () => {
      this.statusCallbacks.get(broker)?.delete(callback);
    };
  }
  
  private notifyStatusChange(
    broker: string,
    status: ConnectionStatus
  ): void {
    const callbacks = this.statusCallbacks.get(broker);
    if (callbacks) {
      callbacks.forEach(cb => cb(status));
    }
  }
}
```

## Error Handling Pattern

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
  
  private async handleConnectionError(
    error: BrokerError,
    context: ErrorContext
  ): Promise<ErrorResolution> {
    // Attempt reconnection up to 3 times
    for (let i = 0; i < 3; i++) {
      await this.delay(Math.pow(2, i) * 1000); // Exponential backoff
      
      try {
        await context.client.connect();
        return {
          action: 'RECOVERED',
          message: 'Connection restored',
          canRetry: true,
        };
      } catch (retryError) {
        // Continue to next attempt
      }
    }
    
    return {
      action: 'NOTIFY_USER',
      message: 'Unable to connect to broker',
      canRetry: true,
    };
  }
}
```

## Testing Pattern

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
  
  describe('Risk Management', () => {
    it('should enforce position size limits', async () => {
      const order: OrderRequest = {
        symbol: 'AAPL',
        quantity: 100000, // Exceeds position limit
        side: 'buy',
        type: 'market',
      };
      
      const validation = await client.validateOrder(order);
      
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Position size exceeds limit');
    });
    
    it('should check margin requirements', async () => {
      const order: OrderRequest = {
        symbol: 'TSLA',
        quantity: 1000,
        side: 'buy',
        type: 'market',
      };
      
      const margin = await client.getMarginRequirements(order);
      
      expect(margin.required).toBeGreaterThan(0);
      expect(margin.available).toBeDefined();
      expect(margin.canExecute).toBeDefined();
    });
  });
});
```

## API Endpoint Pattern

### REST API Implementation
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
    
    // Audit log
    await auditLog({
      userId: session.user.id,
      action: 'BROKER_CONNECT',
      broker: params.broker,
      success,
      timestamp: new Date(),
    });
    
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

## UI Component Pattern

### Broker Connection Component
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

## Migration Pattern for New Brokers

### Step-by-Step Guide

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

4. **Create tests**
```typescript
// __tests__/brokers/NewBroker.test.ts
describe('NewBroker Integration', () => {
  // Test all interface methods
  // Test error scenarios
  // Test mock mode
});
```

5. **Add UI components**
```typescript
// components/brokers/NewBrokerCredentials.tsx
export function NewBrokerCredentials({ onChange }) {
  // Broker-specific credential fields
}
```

6. **Update documentation**
- Add to supported brokers list
- Document any broker-specific quirks
- Update API documentation
- Add setup instructions

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

## Security Checklist

Before deploying any broker integration:

- [ ] All credentials encrypted with AES-256
- [ ] Paper trading isolated from live trading
- [ ] Rate limiting implemented on all endpoints
- [ ] Audit logging for all operations
- [ ] Session timeout configured
- [ ] Error messages don't leak sensitive info
- [ ] All inputs validated and sanitized
- [ ] CORS properly configured
- [ ] API keys rotatable
- [ ] Penetration testing completed

## Support and Maintenance

### Monitoring
- Connection health checks every 30 seconds
- Alert on connection failures
- Track API rate limit usage
- Monitor order execution times
- Log all errors with context

### Updates
- Review broker API changes quarterly
- Update mock data monthly
- Refresh security audit annually
- Performance optimization as needed
- Documentation updates with each change

---

*For broker-specific implementation details, see individual broker documentation in `/docs/brokers/`*