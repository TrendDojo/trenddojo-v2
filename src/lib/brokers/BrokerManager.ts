/**
 * Broker Manager - Central broker integration orchestrator
 * @business-critical: Manages all broker connections and order routing
 */

import { BrokerClient, BrokerConfig, OrderRequest, OrderResponse, AccountInfo } from './types';
import { InteractiveBrokersClient, IBConfig } from './interactive-brokers/IBClient';
import { AlpacaClient, AlpacaConfig } from './alpaca/AlpacaClient';

export type SupportedBroker = 'interactive_brokers' | 'alpaca' | 'alpaca_paper' | 'alpaca_live' | 'td_ameritrade';

interface BrokerConnection {
  broker: SupportedBroker;
  client: BrokerClient;
  isConnected: boolean;
  isPrimary: boolean;
}

export class BrokerManager {
  private connections: Map<string, BrokerConnection> = new Map();
  private primaryBroker: string | null = null;
  
  /**
   * Connect to a broker
   */
  async connectBroker(
    broker: SupportedBroker,
    config: BrokerConfig,
    setPrimary = false
  ): Promise<boolean> {
    try {
      const client = this.createBrokerClient(broker, config);
      const isConnected = await client.connect();
      
      if (isConnected) {
        const connection: BrokerConnection = {
          broker,
          client,
          isConnected,
          isPrimary: setPrimary || this.connections.size === 0,
        };
        
        this.connections.set(broker, connection);
        
        if (connection.isPrimary) {
          this.primaryBroker = broker;
        }
        
    // DEBUG: console.log(`Connected to ${broker}${connection.isPrimary ? ' (primary)' : ''}`);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error(`Failed to connect to ${broker}:`, error);
      return false;
    }
  }
  
  /**
   * Disconnect from a broker
   */
  async disconnectBroker(broker: string): Promise<void> {
    const connection = this.connections.get(broker);
    if (connection) {
      await connection.client.disconnect();
      this.connections.delete(broker);
      
      if (this.primaryBroker === broker) {
        // Set next broker as primary
        const nextConnection = this.connections.values().next().value;
        if (nextConnection) {
          nextConnection.isPrimary = true;
          this.primaryBroker = nextConnection.broker;
        } else {
          this.primaryBroker = null;
        }
      }
    }
  }
  
  /**
   * Get broker client
   */
  getBroker(broker?: string): BrokerClient | null {
    if (!broker && this.primaryBroker) {
      broker = this.primaryBroker;
    }
    
    const connection = broker ? this.connections.get(broker) : null;
    return connection?.client || null;
  }
  
  /**
   * Get primary broker
   */
  getPrimaryBroker(): BrokerClient | null {
    return this.primaryBroker ? this.getBroker(this.primaryBroker) : null;
  }
  
  /**
   * Place order with specific or primary broker
   */
  async placeOrder(
    order: OrderRequest,
    broker?: string
  ): Promise<OrderResponse> {
    const client = broker ? this.getBroker(broker) : this.getPrimaryBroker();
    
    if (!client) {
      throw new Error('No broker connected');
    }
    
    // Add risk checks here
    await this.validateOrder(order);
    
    // Execute order
    const response = await client.placeOrder(order);
    
    // Log execution
    await this.logExecution(response, broker || this.primaryBroker!);
    
    return response;
  }
  
  /**
   * Get aggregated account info from all connected brokers
   */
  async getAggregatedAccountInfo(): Promise<{
    totalBalance: number;
    totalBuyingPower: number;
    accounts: Map<string, AccountInfo>;
  }> {
    const accounts = new Map<string, AccountInfo>();
    let totalBalance = 0;
    let totalBuyingPower = 0;
    
    for (const [broker, connection] of this.connections) {
      if (connection.isConnected) {
        const info = await connection.client.getAccountInfo();
        accounts.set(broker, info);
        totalBalance += info.balance;
        totalBuyingPower += info.buyingPower;
      }
    }
    
    return {
      totalBalance,
      totalBuyingPower,
      accounts,
    };
  }
  
  /**
   * Subscribe to market data from primary broker
   */
  async subscribeToMarketData(
    symbol: string,
    callback: (data: any) => void
  ): Promise<() => void> {
    const client = this.getPrimaryBroker();
    
    if (!client) {
      throw new Error('No broker connected');
    }
    
    return client.subscribeToMarketData(symbol, callback);
  }
  
  /**
   * Get list of connected brokers
   */
  getConnectedBrokers(): SupportedBroker[] {
    return Array.from(this.connections.keys()) as SupportedBroker[];
  }
  
  /**
   * Check if a broker is connected
   */
  isBrokerConnected(broker: string): boolean {
    return this.connections.has(broker);
  }
  
  /**
   * Create broker client based on type
   */
  private createBrokerClient(
    broker: SupportedBroker,
    config: BrokerConfig
  ): BrokerClient {
    switch (broker) {
      case 'interactive_brokers':
        return new InteractiveBrokersClient(config as IBConfig);
      
      case 'alpaca':
        return new AlpacaClient(config as AlpacaConfig);

      case 'alpaca_paper':
        return new AlpacaClient({
          ...config,
          paperTrading: true,
        } as AlpacaConfig);

      case 'alpaca_live':
        return new AlpacaClient({
          ...config,
          paperTrading: false,
        } as AlpacaConfig);

      // Add other brokers here
      case 'td_ameritrade':
        throw new Error(`${broker} integration not yet implemented`);
      
      default:
        throw new Error(`Unknown broker: ${broker}`);
    }
  }
  
  /**
   * Validate order against risk rules
   */
  private async validateOrder(order: OrderRequest): Promise<void> {
    // Implement risk validation
    // - Check position size limits
    // - Check daily loss limits
    // - Check buying power
    // - Check symbol restrictions
    
    if (!order.symbol || !order.quantity || order.quantity <= 0) {
      throw new Error('Invalid order parameters');
    }
    
    // Add more validation as needed
  }
  
  /**
   * Log trade execution
   */
  private async logExecution(
    response: OrderResponse,
    broker: string
  ): Promise<void> {
    // In production, this would save to database
    // DEBUG: console.log('Trade Execution:', {
      broker,
      orderId: response.orderId,
      symbol: response.symbol,
      quantity: response.quantity,
      side: response.side,
      status: response.status,
      executedPrice: response.executedPrice,
      timestamp: response.timestamp,
    });
  }
}

// Singleton instance
let brokerManager: BrokerManager | null = null;

export function getBrokerManager(): BrokerManager {
  if (!brokerManager) {
    brokerManager = new BrokerManager();
  }
  return brokerManager;
}