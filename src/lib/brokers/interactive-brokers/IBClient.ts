/**
 * Interactive Brokers Client Implementation
 * @business-critical: Handles IB broker integration
 */

import { 
  BrokerClient, 
  BrokerConfig, 
  AccountInfo, 
  Position, 
  OrderRequest, 
  OrderResponse,
  MarketData,
  BrokerError,
  OrderStatus,
  OrderType,
  OrderSide
} from '../types';
import { IBGateway, IBGatewayConfig } from './IBGateway';

export interface IBConfig extends BrokerConfig {
  host?: string;
  port?: number;
  clientId?: number;
  accountId?: string;
  paperTrading?: boolean;
  mockMode?: boolean;
}

export class InteractiveBrokersClient implements BrokerClient {
  name = 'Interactive Brokers';
  private config: IBConfig;
  private connected = false;
  private gateway?: IBGateway;
  private mockMode: boolean;
  
  constructor(config: IBConfig) {
    this.config = {
      host: config.host || 'localhost',
      port: config.port || (config.paperTrading ? 7497 : 7496), // Paper: 7497, Live: 7496
      clientId: config.clientId || 1,
      accountId: config.accountId || '',
      mockMode: config.mockMode !== false, // Default to mock mode
      paperTrading: config.paperTrading ?? true,
      ...config,
    };
    
    this.mockMode = this.config.mockMode !== false;
    
    // Initialize IB Gateway if not in mock mode
    if (!this.mockMode && this.config.host && this.config.port) {
      const gatewayConfig: IBGatewayConfig = {
        host: this.config.host,
        port: this.config.port,
        clientId: this.config.clientId || 1,
        paperTrading: this.config.paperTrading || false,
      };
      
      this.gateway = new IBGateway(gatewayConfig);
      
      // Listen to gateway events
      this.gateway.on('connected', (status) => {
    // DEBUG: console.log('IB Gateway connected:', status);
      });
      
      this.gateway.on('disconnected', () => {
    // DEBUG: console.log('IB Gateway disconnected');
        this.connected = false;
      });
      
      this.gateway.on('error', (error) => {
        console.error('IB Gateway error:', error);
      });
    }
  }
  
  async connect(): Promise<boolean> {
    try {
      if (this.connected) {
        return true;
      }
      
      if (this.mockMode) {
        // Simulate connection delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        this.connected = true;
    // DEBUG: console.log(`Connected to IB (mock mode, ${this.config.paperTrading ? 'paper' : 'live'} trading)`);
        return true;
      }
      
      // Connect via IB Gateway
      if (!this.gateway) {
        throw new Error('IB Gateway not initialized');
      }
      
      const success = await this.gateway.connect();
      this.connected = success;
      return success;
      
    } catch (error) {
      throw new BrokerError(
        `Failed to connect to Interactive Brokers: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'interactive_brokers'
      );
    }
  }
  
  async disconnect(): Promise<void> {
    if (this.gateway) {
      await this.gateway.disconnect();
    }
    
    this.connected = false;
    // DEBUG: console.log('Disconnected from IB');
  }
  
  async getAccountInfo(): Promise<AccountInfo> {
    if (!this.connected) {
      throw new BrokerError('Not connected to broker', 'interactive_brokers');
    }
    
    if (this.gateway && !this.mockMode) {
      const accountData = await this.gateway.getAccountInfo();
      const positions = await this.gateway.getPositions();
      
      return {
        accountId: accountData.accountId,
        balance: accountData.balance,
        buyingPower: accountData.buyingPower,
        currency: accountData.currency,
        positions: this.convertPositions(positions),
        marginUsed: accountData.initMarginReq,
        availableMargin: accountData.excessLiquidity,
        unrealizedPnL: accountData.unrealizedPnL,
        realizedPnL: accountData.realizedPnL,
      };
    }
    
    // Mock account data
    return {
      accountId: this.config.accountId || (this.config.paperTrading ? 'DU1234567' : 'U1234567'),
      balance: 100000,
      buyingPower: this.config.paperTrading ? 400000 : 200000,
      currency: 'USD',
      positions: await this.getPositions(),
      marginUsed: 25000,
      availableMargin: 175000,
      unrealizedPnL: 2500,
      realizedPnL: 1250,
    };
  }
  
  async getPositions(): Promise<Position[]> {
    if (!this.connected) {
      throw new BrokerError('Not connected to broker', 'interactive_brokers');
    }
    
    if (this.gateway && !this.mockMode) {
      const positions = await this.gateway.getPositions();
      return this.convertPositions(positions);
    }
    
    // Mock positions
    return [
      {
        symbol: 'AAPL',
        quantity: 100,
        averagePrice: 175.50,
        currentPrice: 178.25,
        marketValue: 17825,
        unrealizedPnL: 275,
        realizedPnL: 0,
        side: 'long',
        openDate: new Date('2024-01-15'),
      },
      {
        symbol: 'MSFT',
        quantity: 50,
        averagePrice: 430.00,
        currentPrice: 425.75,
        marketValue: 21287.50,
        unrealizedPnL: -212.50,
        realizedPnL: 0,
        side: 'long',
        openDate: new Date('2024-01-20'),
      },
      {
        symbol: 'GOOGL',
        quantity: 25,
        averagePrice: 172.00,
        currentPrice: 175.50,
        marketValue: 4387.50,
        unrealizedPnL: 87.50,
        realizedPnL: 0,
        side: 'long',
        openDate: new Date('2024-02-01'),
      },
    ];
  }
  
  async placeOrder(order: OrderRequest): Promise<OrderResponse> {
    if (!this.connected) {
      throw new BrokerError('Not connected to broker', 'interactive_brokers');
    }
    
    // Validate order
    const validation = await this.validateOrder(order);
    if (!validation.isValid) {
      throw new BrokerError(
        validation.errors.join(', '),
        'interactive_brokers'
      );
    }
    
    if (this.gateway && !this.mockMode) {
      const ibOrder = this.convertToIBOrder(order);
      const response = await this.gateway.placeOrder(ibOrder);
      return this.convertFromIBOrder(response);
    }
    
    // Mock order execution
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Simulate different order statuses based on order type
    let status: OrderStatus = 'submitted';
    let executedPrice: number | undefined;
    
    if (order.type === 'market') {
      status = 'filled';
      executedPrice = await this.getMockPrice(order.symbol);
    }
    
    return {
      orderId: `IB-${Date.now()}`,
      symbol: order.symbol,
      quantity: order.quantity,
      side: order.side,
      type: order.type,
      status,
      executedPrice,
      executedQuantity: status === 'filled' ? order.quantity : 0,
      timestamp: new Date(),
      commission: this.calculateCommission(order),
      message: `Order ${status} via IB ${this.config.paperTrading ? '(Paper)' : '(Live)'}`,
    };
  }
  
  async cancelOrder(orderId: string): Promise<boolean> {
    if (!this.connected) {
      throw new BrokerError('Not connected to broker', 'interactive_brokers');
    }
    
    if (this.gateway && !this.mockMode) {
      return await this.gateway.cancelOrder(orderId);
    }
    
    // Mock order cancellation
    await new Promise(resolve => setTimeout(resolve, 300));
    return true;
  }
  
  async getMarketData(symbol: string): Promise<MarketData> {
    if (!this.connected) {
      throw new BrokerError('Not connected to broker', 'interactive_brokers');
    }
    
    // Use mock data for now (would use gateway in production)
    const basePrice = await this.getMockPrice(symbol);
    const spread = 0.01; // 1 cent spread
    
    return {
      symbol,
      bid: basePrice - spread/2,
      ask: basePrice + spread/2,
      last: basePrice,
      volume: Math.floor(Math.random() * 10000000),
      open: basePrice * (1 + (Math.random() - 0.5) * 0.02),
      high: basePrice * (1 + Math.random() * 0.03),
      low: basePrice * (1 - Math.random() * 0.03),
      close: basePrice * (1 + (Math.random() - 0.5) * 0.01),
      timestamp: new Date(),
    };
  }
  
  async subscribeToMarketData(
    symbol: string,
    callback: (data: MarketData) => void
  ): Promise<() => void> {
    if (!this.connected) {
      throw new BrokerError('Not connected to broker', 'interactive_brokers');
    }
    
    if (this.gateway && !this.mockMode) {
      return await this.gateway.subscribeMarketData(symbol, (ibData) => {
        const marketData: MarketData = {
          symbol: ibData.symbol,
          bid: ibData.bid,
          ask: ibData.ask,
          last: ibData.last,
          volume: ibData.volume,
          open: ibData.open,
          high: ibData.high,
          low: ibData.low,
          close: ibData.close,
          timestamp: ibData.timestamp,
        };
        callback(marketData);
      });
    }
    
    // Mock real-time data stream
    let basePrice = await this.getMockPrice(symbol);
    const interval = setInterval(async () => {
      // Add some random walk to the price
      basePrice *= (1 + (Math.random() - 0.5) * 0.001);
      
      const data: MarketData = {
        symbol,
        bid: basePrice - 0.01,
        ask: basePrice + 0.01,
        last: basePrice,
        volume: Math.floor(Math.random() * 100000),
        open: basePrice * 0.99,
        high: basePrice * 1.01,
        low: basePrice * 0.98,
        close: basePrice,
        timestamp: new Date(),
      };
      
      callback(data);
    }, 1000);
    
    // Return unsubscribe function
    return () => clearInterval(interval);
  }
  
  // Risk management methods
  
  async setStopLoss(
    symbol: string,
    quantity: number,
    stopPrice: number
  ): Promise<OrderResponse> {
    return this.placeOrder({
      symbol,
      quantity,
      side: 'sell',
      type: 'stop',
      stopPrice,
    });
  }
  
  async setTakeProfit(
    symbol: string,
    quantity: number,
    limitPrice: number
  ): Promise<OrderResponse> {
    return this.placeOrder({
      symbol,
      quantity,
      side: 'sell',
      type: 'limit',
      price: limitPrice,
    });
  }
  
  // Helper methods
  
  isPaperTrading(): boolean {
    return this.config.paperTrading || this.mockMode;
  }
  
  async validateConnection(): Promise<boolean> {
    try {
      await this.connect();
      await this.getAccountInfo();
      return true;
    } catch (error) {
      console.error('IB connection validation failed:', error);
      return false;
    }
  }
  
  private async validateOrder(order: OrderRequest): Promise<{
    isValid: boolean;
    errors: string[];
  }> {
    const errors: string[] = [];
    
    if (!order.symbol || order.symbol.length === 0) {
      errors.push('Symbol is required');
    }
    
    if (!order.quantity || order.quantity <= 0) {
      errors.push('Quantity must be positive');
    }
    
    if (!['buy', 'sell'].includes(order.side)) {
      errors.push('Side must be buy or sell');
    }
    
    if (!['market', 'limit', 'stop', 'stop_limit'].includes(order.type)) {
      errors.push('Invalid order type');
    }
    
    if ((order.type === 'limit' || order.type === 'stop_limit') && !order.price) {
      errors.push('Limit price required for limit orders');
    }
    
    if ((order.type === 'stop' || order.type === 'stop_limit') && !order.stopPrice) {
      errors.push('Stop price required for stop orders');
    }
    
    // Check position size limits
    const accountInfo = await this.getAccountInfo();
    const orderValue = order.quantity * (order.price || await this.getMockPrice(order.symbol));
    
    if (orderValue > accountInfo.buyingPower) {
      errors.push('Order exceeds buying power');
    }
    
    if (orderValue > accountInfo.balance * 0.2) {
      errors.push('Order exceeds 20% position size limit');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  }
  
  private convertToIBOrder(order: OrderRequest): any {
    // Convert to IB API format
    return {
      action: order.side.toUpperCase(),
      totalQuantity: order.quantity,
      orderType: this.mapOrderType(order.type),
      lmtPrice: order.price,
      auxPrice: order.stopPrice,
      tif: order.timeInForce?.toUpperCase() || 'DAY',
      outsideRth: false,
      transmit: true,
    };
  }
  
  private convertFromIBOrder(ibResponse: any): OrderResponse {
    return {
      orderId: ibResponse.orderId.toString(),
      symbol: ibResponse.symbol || '',
      quantity: ibResponse.totalQuantity,
      side: ibResponse.action.toLowerCase() as OrderSide,
      type: 'market', // Would map from IB type
      status: this.mapOrderStatus(ibResponse.status),
      executedPrice: ibResponse.avgFillPrice,
      executedQuantity: ibResponse.filled,
      timestamp: new Date(),
      commission: ibResponse.commission,
    };
  }
  
  private mapOrderType(type: OrderType): string {
    const typeMap: Record<OrderType, string> = {
      market: 'MKT',
      limit: 'LMT',
      stop: 'STP',
      stop_limit: 'STP LMT',
    };
    return typeMap[type] || 'MKT';
  }
  
  private mapOrderStatus(ibStatus: string): OrderStatus {
    const statusMap: Record<string, OrderStatus> = {
      'PendingSubmit': 'pending',
      'PreSubmitted': 'pending',
      'Submitted': 'submitted',
      'Filled': 'filled',
      'Cancelled': 'cancelled',
      'Inactive': 'rejected',
    };
    return statusMap[ibStatus] || 'pending';
  }
  
  private convertPositions(ibPositions: any[]): Position[] {
    return ibPositions.map(pos => ({
      symbol: pos.symbol,
      quantity: Math.abs(pos.position),
      averagePrice: pos.averageCost,
      currentPrice: pos.marketPrice,
      marketValue: pos.marketValue,
      unrealizedPnL: pos.unrealizedPnL,
      realizedPnL: pos.realizedPnL,
      side: pos.position > 0 ? 'long' : 'short',
    }));
  }
  
  private calculateCommission(order: OrderRequest): number {
    // IB commission structure (simplified)
    // $0.005 per share, $1 minimum, $0.5% maximum
    const perShare = 0.005;
    const commission = Math.max(1, order.quantity * perShare);
    return Math.min(commission, order.quantity * (order.price || 100) * 0.005);
  }
  
  private async getMockPrice(symbol: string): Promise<number> {
    // Mock prices for testing
    const prices: Record<string, number> = {
      AAPL: 178.25,
      MSFT: 425.75,
      GOOGL: 175.50,
      AMZN: 185.75,
      TSLA: 245.50,
      META: 505.25,
      NVDA: 875.50,
      SPY: 520.75,
      QQQ: 425.25,
    };
    
    return prices[symbol] || 100 + Math.random() * 400;
  }
}