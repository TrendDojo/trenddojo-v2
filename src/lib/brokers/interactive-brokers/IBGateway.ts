/**
 * Interactive Brokers Gateway connection handler
 * @business-critical: Manages IB Gateway/TWS connections
 */

import { EventEmitter } from 'events';
import { BrokerError } from '../types';

export interface IBGatewayConfig {
  host: string;
  port: number;
  clientId: number;
  paperTrading: boolean;
  connectionTimeout?: number;
  requestTimeout?: number;
}

export interface IBConnectionStatus {
  isConnected: boolean;
  isAuthenticated: boolean;
  accountId?: string;
  serverVersion?: number;
  connectionTime?: Date;
  lastHeartbeat?: Date;
}

/**
 * Handles connection to IB Gateway or TWS
 * Note: In production, this would use the IB API client library
 * Currently implements mock behavior for development
 */
export class IBGateway extends EventEmitter {
  private config: IBGatewayConfig;
  private status: IBConnectionStatus;
  private heartbeatInterval?: NodeJS.Timeout;
  private mockMode = true; // Always mock in development
  
  constructor(config: IBGatewayConfig) {
    super();
    this.config = {
      connectionTimeout: 30000,
      requestTimeout: 10000,
      ...config,
    };
    
    this.status = {
      isConnected: false,
      isAuthenticated: false,
    };
    
    // In production, check for IB API availability
    if (process.env.NODE_ENV === 'production' && process.env.ENABLE_IB_LIVE === 'true') {
      this.mockMode = false;
      // TODO: Initialize real IB API client
    }
  }
  
  /**
   * Connect to IB Gateway/TWS
   */
  async connect(): Promise<boolean> {
    try {
      if (this.status.isConnected) {
        return true;
      }
      
      if (this.mockMode) {
        return this.mockConnect();
      }
      
      // Production IB Gateway connection would go here
      // This would use the official IB API client library
      throw new Error('Live IB Gateway connection not yet implemented');
      
    } catch (error) {
      this.emit('error', error);
      throw new BrokerError(
        `Failed to connect to IB Gateway: ${error.message}`,
        'interactive_brokers',
        {
          host: this.config.host,
          port: this.config.port,
        }
      );
    }
  }
  
  /**
   * Disconnect from IB Gateway/TWS
   */
  async disconnect(): Promise<void> {
    this.stopHeartbeat();
    
    if (!this.status.isConnected) {
      return;
    }
    
    if (this.mockMode) {
      this.status.isConnected = false;
      this.status.isAuthenticated = false;
      this.emit('disconnected');
      return;
    }
    
    // Production disconnect logic would go here
  }
  
  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.status.isConnected;
  }
  
  /**
   * Get connection status
   */
  getStatus(): IBConnectionStatus {
    return { ...this.status };
  }
  
  /**
   * Send order to IB
   */
  async placeOrder(order: any): Promise<any> {
    if (!this.status.isConnected) {
      throw new BrokerError(
        'Not connected to IB Gateway',
        'interactive_brokers'
      );
    }
    
    if (this.mockMode) {
      return this.mockPlaceOrder(order);
    }
    
    // Production order placement would go here
    throw new Error('Live order placement not yet implemented');
  }
  
  /**
   * Cancel order
   */
  async cancelOrder(orderId: string): Promise<boolean> {
    if (!this.status.isConnected) {
      throw new BrokerError(
        'Not connected to IB Gateway',
        'interactive_brokers'
      );
    }
    
    if (this.mockMode) {
      await this.simulateLatency();
      return true;
    }
    
    // Production order cancellation would go here
    throw new Error('Live order cancellation not yet implemented');
  }
  
  /**
   * Get account information
   */
  async getAccountInfo(): Promise<any> {
    if (!this.status.isConnected) {
      throw new BrokerError(
        'Not connected to IB Gateway',
        'interactive_brokers'
      );
    }
    
    if (this.mockMode) {
      return this.mockGetAccountInfo();
    }
    
    // Production account info retrieval would go here
    throw new Error('Live account info not yet implemented');
  }
  
  /**
   * Get positions
   */
  async getPositions(): Promise<any[]> {
    if (!this.status.isConnected) {
      throw new BrokerError(
        'Not connected to IB Gateway',
        'interactive_brokers'
      );
    }
    
    if (this.mockMode) {
      return this.mockGetPositions();
    }
    
    // Production positions retrieval would go here
    throw new Error('Live positions not yet implemented');
  }
  
  /**
   * Subscribe to market data
   */
  async subscribeMarketData(
    symbol: string,
    callback: (data: any) => void
  ): Promise<() => void> {
    if (!this.status.isConnected) {
      throw new BrokerError(
        'Not connected to IB Gateway',
        'interactive_brokers'
      );
    }
    
    if (this.mockMode) {
      return this.mockSubscribeMarketData(symbol, callback);
    }
    
    // Production market data subscription would go here
    throw new Error('Live market data not yet implemented');
  }
  
  // Mock implementations for development
  
  private async mockConnect(): Promise<boolean> {
    await this.simulateLatency(1000);
    
    // Simulate connection process
    this.emit('connecting', { host: this.config.host, port: this.config.port });
    
    // Check if "gateway is running" (always true in mock)
    const gatewayRunning = true;
    
    if (!gatewayRunning) {
      throw new Error('IB Gateway is not running');
    }
    
    // Simulate authentication
    await this.simulateLatency(500);
    
    this.status = {
      isConnected: true,
      isAuthenticated: true,
      accountId: this.config.paperTrading ? 'DU1234567' : 'U1234567',
      serverVersion: 176,
      connectionTime: new Date(),
      lastHeartbeat: new Date(),
    };
    
    // Start heartbeat
    this.startHeartbeat();
    
    this.emit('connected', this.status);
    return true;
  }
  
  private async mockPlaceOrder(order: any): Promise<any> {
    await this.simulateLatency(200);
    
    const orderId = `IB${Date.now()}`;
    
    return {
      orderId,
      status: 'Submitted',
      filled: 0,
      remaining: order.quantity,
      avgFillPrice: 0,
      permId: Math.floor(Math.random() * 1000000),
      parentId: 0,
      lastFillPrice: 0,
      clientId: this.config.clientId,
      whyHeld: null,
      mktCapPrice: 0,
    };
  }
  
  private async mockGetAccountInfo(): Promise<any> {
    await this.simulateLatency(300);
    
    const isPaper = this.config.paperTrading;
    
    return {
      accountId: isPaper ? 'DU1234567' : 'U1234567',
      accountType: isPaper ? 'PAPER' : 'LIVE',
      currency: 'USD',
      balance: 100000,
      netLiquidation: 98500,
      unrealizedPnL: -500,
      realizedPnL: 1250,
      buyingPower: isPaper ? 400000 : 197000, // 4x for paper, 2x for live
      availableFunds: 95000,
      excessLiquidity: 93000,
      cushion: 0.93,
      initMarginReq: 5500,
      maintMarginReq: 4400,
      sma: 98500,
      dayTradesRemaining: isPaper ? 'Unlimited' : 3,
    };
  }
  
  private async mockGetPositions(): Promise<any[]> {
    await this.simulateLatency(300);
    
    return [
      {
        symbol: 'AAPL',
        position: 100,
        marketPrice: 178.25,
        marketValue: 17825,
        averageCost: 175.50,
        unrealizedPnL: 275,
        realizedPnL: 0,
      },
      {
        symbol: 'MSFT',
        position: 50,
        marketPrice: 425.75,
        marketValue: 21287.50,
        averageCost: 430.00,
        unrealizedPnL: -212.50,
        realizedPnL: 0,
      },
      {
        symbol: 'GOOGL',
        position: -25, // Short position
        marketPrice: 175.50,
        marketValue: -4387.50,
        averageCost: 172.00,
        unrealizedPnL: -87.50,
        realizedPnL: 0,
      },
    ];
  }
  
  private mockSubscribeMarketData(
    symbol: string,
    callback: (data: any) => void
  ): () => void {
    // Generate mock market data every second
    const interval = setInterval(() => {
      const basePrice = this.getBasePrice(symbol);
      const change = (Math.random() - 0.5) * 0.02; // ±1% change
      const price = basePrice * (1 + change);
      
      const data = {
        symbol,
        bid: price - 0.01,
        ask: price + 0.01,
        last: price,
        volume: Math.floor(Math.random() * 1000000),
        high: price * 1.01,
        low: price * 0.99,
        close: basePrice,
        timestamp: new Date(),
      };
      
      callback(data);
    }, 1000);
    
    // Return unsubscribe function
    return () => clearInterval(interval);
  }
  
  private getBasePrice(symbol: string): number {
    // Mock base prices for common symbols
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
    
    return prices[symbol] || 100;
  }
  
  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      this.status.lastHeartbeat = new Date();
      this.emit('heartbeat', this.status.lastHeartbeat);
    }, 5000);
  }
  
  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = undefined;
    }
  }
  
  private async simulateLatency(ms = 100): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, ms));
  }
}