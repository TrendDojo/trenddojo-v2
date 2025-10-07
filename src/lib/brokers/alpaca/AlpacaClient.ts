/**
 * Alpaca Broker Client Implementation
 * @business-critical: Handles Alpaca broker integration for US/Canada markets
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
  OrderSide,
  PositionSide,
  IBrokerAdapter,
  NormalizedOrder,
  NormalizedOrderStatus,
  NormalizedPosition,
  NormalizedAccount
} from '../types';

export interface AlpacaConfig extends BrokerConfig {
  apiKeyId: string;
  secretKey: string;
  paperTrading?: boolean;
  dataFeed?: 'iex' | 'sip'; // IEX for free tier, SIP for paid
}

export class AlpacaClient implements IBrokerAdapter {
  name = 'Alpaca';
  private config: AlpacaConfig;
  private baseUrl: string;
  private dataUrl: string;
  private wsUrl: string;
  private connected = false;
  private ws?: WebSocket;
  
  constructor(config: AlpacaConfig) {
    this.config = config;
    
    // Set URLs based on paper trading mode
    if (config.paperTrading) {
      this.baseUrl = 'https://paper-api.alpaca.markets';
      this.dataUrl = 'https://data.alpaca.markets';
      this.wsUrl = 'wss://paper-api.alpaca.markets/stream';
    } else {
      this.baseUrl = 'https://api.alpaca.markets';
      this.dataUrl = 'https://data.alpaca.markets';
      this.wsUrl = 'wss://api.alpaca.markets/stream';
    }
  }
  
  /**
   * Connect to Alpaca
   */
  async connect(): Promise<boolean> {
    try {
      if (this.connected) {
        return true;
      }

      // Test connection by fetching account info
      const accountInfo = await this.getAccountInfo();
      if (accountInfo) {
        // Validate that we're connected to the right environment
        // Paper trading accounts typically have different characteristics
        // Note: This is a heuristic check as Alpaca doesn't explicitly indicate paper vs live
        await this.validateTradingMode(accountInfo);

        this.connected = true;
    // DEBUG: console.log(`Connected to Alpaca (${this.config.paperTrading ? 'Paper' : 'Live'} trading)`);
        return true;
      }

      return false;
    } catch (error) {
      throw new BrokerError(
        `Failed to connect to Alpaca: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'alpaca',
        undefined,
        { paperTrading: this.config.paperTrading }
      );
    }
  }

  /**
   * Validate that credentials match the intended trading mode
   */
  private async validateTradingMode(accountInfo: AccountInfo): Promise<void> {
    // Try to detect if we're in paper trading mode
    // Paper accounts often have specific patterns in account IDs or high starting balances

    // If we're expecting paper trading but get a live account warning
    if (this.config.paperTrading && accountInfo.accountId && !accountInfo.accountId.includes('PA')) {
      console.warn('Warning: Credentials may be for a live account but paper trading mode is selected');
      // In production, you might want to throw an error here
      // throw new BrokerError('Live credentials detected but paper trading mode selected', 'alpaca');
    }

    // Additional checks could be added here based on Alpaca's response patterns
  }
  
  /**
   * Disconnect from Alpaca
   */
  async disconnect(): Promise<void> {
    if (this.ws) {
      this.ws.close();
      this.ws = undefined;
    }
    
    this.connected = false;
    // DEBUG: console.log('Disconnected from Alpaca');
  }
  
  /**
   * Get account information
   */
  async getAccountInfo(): Promise<AccountInfo> {
    const response = await this.makeRequest('/v2/account');
    
    return {
      accountId: response.account_number,
      balance: parseFloat(response.cash),
      buyingPower: parseFloat(response.buying_power),
      currency: response.currency,
      positions: await this.getPositions(),
      marginUsed: parseFloat(response.cash) - parseFloat(response.cash_withdrawable || response.cash),
      availableMargin: parseFloat(response.buying_power),
      unrealizedPnL: parseFloat(response.long_market_value) + parseFloat(response.short_market_value) - parseFloat(response.equity),
      realizedPnL: 0, // Alpaca doesn't provide this directly
    };
  }
  
  /**
   * Get current positions
   */
  async getPositions(): Promise<Position[]> {
    const response = await this.makeRequest('/v2/positions');
    
    return response.map((position: any) => ({
      symbol: position.symbol,
      quantity: parseInt(position.qty),
      averagePrice: parseFloat(position.avg_entry_price),
      currentPrice: parseFloat(position.current_price || position.market_value / position.qty),
      marketValue: parseFloat(position.market_value),
      unrealizedPnL: parseFloat(position.unrealized_pl),
      realizedPnL: parseFloat(position.realized_pl || 0),
      side: parseInt(position.qty) > 0 ? 'long' : 'short' as PositionSide,
      openDate: new Date(position.created_at),
    }));
  }
  
  /**
   * Place an order
   */
  async placeOrder(order: OrderRequest): Promise<OrderResponse> {
    const alpacaOrder = {
      symbol: order.symbol,
      qty: order.quantity,
      side: order.side,
      type: this.mapOrderType(order.type),
      time_in_force: order.timeInForce || 'day',
      limit_price: order.price,
      stop_price: order.stopPrice,
      extended_hours: false,
    };
    
    const response = await this.makeRequest('/v2/orders', 'POST', alpacaOrder);
    
    return {
      orderId: response.id,
      symbol: response.symbol,
      quantity: parseInt(response.qty),
      side: response.side as OrderSide,
      type: this.reverseMapOrderType(response.order_type),
      status: this.mapOrderStatus(response.status),
      executedPrice: response.filled_avg_price ? parseFloat(response.filled_avg_price) : undefined,
      executedQuantity: response.filled_qty ? parseInt(response.filled_qty) : 0,
      timestamp: new Date(response.created_at),
      commission: 0, // Alpaca is commission-free
      message: `Order ${response.status}`,
    };
  }
  
  /**
   * Cancel an order
   */
  async cancelOrder(orderId: string): Promise<boolean> {
    try {
      await this.makeRequest(`/v2/orders/${orderId}`, 'DELETE');
      return true;
    } catch (error) {
      console.error('Failed to cancel order:', error);
      return false;
    }
  }
  
  /**
   * Get market data for a symbol
   */
  async getMarketData(symbol: string): Promise<MarketData> {
    const [quote, trade] = await Promise.all([
      this.makeRequest(`/v2/stocks/${symbol}/quotes/latest`, 'GET', null, true),
      this.makeRequest(`/v2/stocks/${symbol}/trades/latest`, 'GET', null, true),
    ]);
    
    return {
      symbol,
      bid: quote.quote.bp,
      ask: quote.quote.ap,
      last: trade.trade.p,
      volume: trade.trade.s,
      timestamp: new Date(trade.trade.t),
    };
  }
  
  /**
   * Subscribe to real-time market data
   */
  async subscribeToMarketData(
    symbol: string,
    callback: (data: MarketData) => void
  ): Promise<() => void> {
    // Initialize WebSocket if not already connected
    if (!this.ws) {
      await this.initializeWebSocket();
    }
    
    // Subscribe to trades and quotes
    const subscribeMsg = JSON.stringify({
      action: 'subscribe',
      trades: [symbol],
      quotes: [symbol],
    });
    
    this.ws?.send(subscribeMsg);
    
    // Handle incoming messages
    const messageHandler = (event: MessageEvent) => {
      const data = JSON.parse(event.data);
      
      if (data[0]?.S === symbol) {
        const marketData: MarketData = {
          symbol,
          bid: data[0].bp || 0,
          ask: data[0].ap || 0,
          last: data[0].p || 0,
          volume: data[0].s || 0,
          timestamp: new Date(data[0].t),
        };
        
        callback(marketData);
      }
    };
    
    this.ws?.addEventListener('message', messageHandler);
    
    // Return unsubscribe function
    return () => {
      const unsubscribeMsg = JSON.stringify({
        action: 'unsubscribe',
        trades: [symbol],
        quotes: [symbol],
      });
      
      this.ws?.send(unsubscribeMsg);
      this.ws?.removeEventListener('message', messageHandler);
    };
  }
  
  /**
   * Initialize WebSocket connection
   */
  private async initializeWebSocket(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.wsUrl);
      
      this.ws.onopen = () => {
        // Authenticate
        const authMsg = JSON.stringify({
          action: 'auth',
          key: this.config.apiKeyId,
          secret: this.config.secretKey,
        });
        
        this.ws?.send(authMsg);
        resolve();
      };
      
      this.ws.onerror = (error) => {
        reject(new Error(`WebSocket error: ${error}`));
      };
    });
  }
  
  /**
   * Make HTTP request to Alpaca API
   */
  private async makeRequest(
    endpoint: string,
    method: string = 'GET',
    body?: any,
    isDataApi: boolean = false
  ): Promise<any> {
    const url = `${isDataApi ? this.dataUrl : this.baseUrl}${endpoint}`;
    
    const headers: HeadersInit = {
      'APCA-API-KEY-ID': this.config.apiKeyId,
      'APCA-API-SECRET-KEY': this.config.secretKey,
      'Content-Type': 'application/json',
    };
    
    const options: RequestInit = {
      method,
      headers,
    };
    
    if (body && method !== 'GET') {
      options.body = JSON.stringify(body);
    }
    
    const response = await fetch(url, options);
    
    if (!response.ok) {
      const error = await response.json();
      throw new BrokerError(
        error.message || `Alpaca API error: ${response.statusText}`,
        'alpaca',
        undefined,
        { status: response.status, error }
      );
    }
    
    return response.json();
  }
  
  /**
   * Map order type to Alpaca format
   */
  private mapOrderType(type: OrderType): string {
    const typeMap: Record<OrderType, string> = {
      market: 'market',
      limit: 'limit',
      stop: 'stop',
      stop_limit: 'stop_limit',
    };
    return typeMap[type];
  }
  
  /**
   * Reverse map Alpaca order type
   */
  private reverseMapOrderType(alpacaType: string): OrderType {
    const typeMap: Record<string, OrderType> = {
      market: 'market',
      limit: 'limit',
      stop: 'stop',
      stop_limit: 'stop_limit',
    };
    return typeMap[alpacaType] || 'market';
  }
  
  /**
   * Map Alpaca order status
   */
  private mapOrderStatus(alpacaStatus: string): OrderStatus {
    const statusMap: Record<string, OrderStatus> = {
      new: 'submitted',
      partially_filled: 'partial',
      filled: 'filled',
      done_for_day: 'cancelled',
      canceled: 'cancelled',
      expired: 'cancelled',
      replaced: 'submitted',
      pending_cancel: 'submitted',
      pending_replace: 'submitted',
      accepted: 'submitted',
      pending_new: 'pending',
      accepted_for_bidding: 'submitted',
      stopped: 'cancelled',
      rejected: 'rejected',
      suspended: 'cancelled',
      calculated: 'submitted',
    };
    return statusMap[alpacaStatus] || 'pending';
  }
  
  /**
   * Get historical data
   */
  async getHistoricalData(
    symbol: string,
    timeframe: '1Min' | '5Min' | '15Min' | '1Hour' | '1Day' = '1Day',
    limit: number = 100
  ): Promise<any[]> {
    const endpoint = `/v2/stocks/${symbol}/bars`;
    const params = new URLSearchParams({
      timeframe,
      limit: limit.toString(),
      feed: this.config.dataFeed || 'iex',
    });
    
    const response = await this.makeRequest(`${endpoint}?${params}`, 'GET', null, true);
    return response.bars || [];
  }
  
  /**
   * Search for symbols
   */
  async searchSymbols(query: string): Promise<Array<{ symbol: string; name: string }>> {
    // Alpaca doesn't have a direct search endpoint
    // You would typically use a separate service for this
    // For now, return empty array
    return [];
  }
  
  /**
   * Check if market is open
   */
  async isMarketOpen(): Promise<boolean> {
    const response = await this.makeRequest('/v2/clock');
    return response.is_open;
  }
  
  /**
   * Get market calendar
   */
  async getMarketCalendar(start?: Date, end?: Date): Promise<any[]> {
    const params = new URLSearchParams();
    if (start) params.append('start', start.toISOString().split('T')[0]);
    if (end) params.append('end', end.toISOString().split('T')[0]);

    const response = await this.makeRequest(`/v2/calendar?${params}`);
    return response;
  }

  // ========================================
  // IBrokerAdapter Implementation
  // ========================================

  /**
   * Map Alpaca order status to normalized status
   */
  private mapToNormalizedStatus(alpacaStatus: string): NormalizedOrderStatus {
    const statusMap: Record<string, NormalizedOrderStatus> = {
      new: NormalizedOrderStatus.ACCEPTED,
      accepted: NormalizedOrderStatus.ACCEPTED,
      pending_new: NormalizedOrderStatus.SUBMITTED,
      partially_filled: NormalizedOrderStatus.FILLING,
      filled: NormalizedOrderStatus.FILLED,
      canceled: NormalizedOrderStatus.CANCELED,
      expired: NormalizedOrderStatus.EXPIRED,
      rejected: NormalizedOrderStatus.REJECTED,
      replaced: NormalizedOrderStatus.SUBMITTED,
      pending_cancel: NormalizedOrderStatus.ACCEPTED,
      pending_replace: NormalizedOrderStatus.ACCEPTED,
      accepted_for_bidding: NormalizedOrderStatus.ACCEPTED,
      stopped: NormalizedOrderStatus.CANCELED,
      suspended: NormalizedOrderStatus.CANCELED,
      calculated: NormalizedOrderStatus.ACCEPTED,
      done_for_day: NormalizedOrderStatus.EXPIRED,
    };
    return statusMap[alpacaStatus] || NormalizedOrderStatus.SUBMITTED;
  }

  /**
   * Submit order with tracking
   */
  async submitOrderTracked(params: OrderRequest): Promise<NormalizedOrder> {
    const alpacaOrder = {
      symbol: params.symbol,
      qty: params.quantity,
      side: params.side,
      type: this.mapOrderType(params.type),
      time_in_force: params.timeInForce || 'day',
      limit_price: params.price,
      stop_price: params.stopPrice,
      extended_hours: false,
    };

    const response = await this.makeRequest('/v2/orders', 'POST', alpacaOrder);

    return {
      orderId: response.id,
      symbol: response.symbol,
      side: response.side as OrderSide,
      quantity: parseFloat(response.qty),
      orderType: this.reverseMapOrderType(response.order_type),
      status: this.mapToNormalizedStatus(response.status),
      timeInForce: response.time_in_force,
      limitPrice: response.limit_price ? parseFloat(response.limit_price) : undefined,
      stopPrice: response.stop_price ? parseFloat(response.stop_price) : undefined,
      filledQuantity: response.filled_qty ? parseFloat(response.filled_qty) : undefined,
      filledAvgPrice: response.filled_avg_price ? parseFloat(response.filled_avg_price) : undefined,
      submittedAt: new Date(response.submitted_at || response.created_at),
      acceptedAt: response.status === 'accepted' ? new Date() : undefined,
      filledAt: response.status === 'filled' ? new Date(response.filled_at || new Date()) : undefined,
      rawBrokerData: response,
    };
  }

  /**
   * Get order status with tracking
   */
  async getOrderTracked(orderId: string): Promise<NormalizedOrder> {
    const response = await this.makeRequest(`/v2/orders/${orderId}`);

    return {
      orderId: response.id,
      symbol: response.symbol,
      side: response.side as OrderSide,
      quantity: parseFloat(response.qty),
      orderType: this.reverseMapOrderType(response.order_type),
      status: this.mapToNormalizedStatus(response.status),
      timeInForce: response.time_in_force,
      limitPrice: response.limit_price ? parseFloat(response.limit_price) : undefined,
      stopPrice: response.stop_price ? parseFloat(response.stop_price) : undefined,
      filledQuantity: response.filled_qty ? parseFloat(response.filled_qty) : undefined,
      filledAvgPrice: response.filled_avg_price ? parseFloat(response.filled_avg_price) : undefined,
      submittedAt: new Date(response.submitted_at || response.created_at),
      acceptedAt: ['accepted', 'new', 'partially_filled', 'filled'].includes(response.status)
        ? new Date(response.created_at)
        : undefined,
      filledAt: response.status === 'filled' && response.filled_at
        ? new Date(response.filled_at)
        : undefined,
      canceledAt: response.status === 'canceled' && response.canceled_at
        ? new Date(response.canceled_at)
        : undefined,
      rejectedAt: response.status === 'rejected'
        ? new Date()
        : undefined,
      rejectReason: response.status === 'rejected'
        ? response.reject_reason || 'Order rejected by broker'
        : undefined,
      rawBrokerData: response,
    };
  }

  /**
   * Get multiple orders with tracking
   */
  async getOrdersTracked(params?: { status?: string; symbols?: string[] }): Promise<NormalizedOrder[]> {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    // Note: Alpaca doesn't support filtering by symbols in /v2/orders

    const endpoint = `/v2/orders${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    const response = await this.makeRequest(endpoint);

    let orders = response;

    // Filter by symbols if provided
    if (params?.symbols && params.symbols.length > 0) {
      orders = orders.filter((order: any) => params.symbols!.includes(order.symbol));
    }

    return orders.map((order: any) => ({
      orderId: order.id,
      symbol: order.symbol,
      side: order.side as OrderSide,
      quantity: parseFloat(order.qty),
      orderType: this.reverseMapOrderType(order.order_type),
      status: this.mapToNormalizedStatus(order.status),
      timeInForce: order.time_in_force,
      limitPrice: order.limit_price ? parseFloat(order.limit_price) : undefined,
      stopPrice: order.stop_price ? parseFloat(order.stop_price) : undefined,
      filledQuantity: order.filled_qty ? parseFloat(order.filled_qty) : undefined,
      filledAvgPrice: order.filled_avg_price ? parseFloat(order.filled_avg_price) : undefined,
      submittedAt: new Date(order.submitted_at || order.created_at),
      acceptedAt: ['accepted', 'new', 'partially_filled', 'filled'].includes(order.status)
        ? new Date(order.created_at)
        : undefined,
      filledAt: order.status === 'filled' && order.filled_at
        ? new Date(order.filled_at)
        : undefined,
      canceledAt: order.status === 'canceled' && order.canceled_at
        ? new Date(order.canceled_at)
        : undefined,
      rawBrokerData: order,
    }));
  }

  /**
   * Get positions in normalized format
   */
  async getPositionsNormalized(): Promise<NormalizedPosition[]> {
    const response = await this.makeRequest('/v2/positions');

    return response.map((position: any) => ({
      symbol: position.symbol,
      quantity: parseFloat(position.qty),
      avgEntryPrice: parseFloat(position.avg_entry_price),
      currentPrice: parseFloat(position.current_price || position.market_value / position.qty),
      unrealizedPnl: parseFloat(position.unrealized_pl),
      realizedPnl: parseFloat(position.realized_pl || 0),
      side: parseFloat(position.qty) > 0 ? 'long' : 'short' as PositionSide,
      assetType: position.asset_class,
      marketValue: parseFloat(position.market_value),
    }));
  }

  /**
   * Get single position in normalized format
   */
  async getPositionNormalized(symbol: string): Promise<NormalizedPosition | null> {
    try {
      const response = await this.makeRequest(`/v2/positions/${symbol}`);

      return {
        symbol: response.symbol,
        quantity: parseFloat(response.qty),
        avgEntryPrice: parseFloat(response.avg_entry_price),
        currentPrice: parseFloat(response.current_price || response.market_value / response.qty),
        unrealizedPnl: parseFloat(response.unrealized_pl),
        realizedPnl: parseFloat(response.realized_pl || 0),
        side: parseFloat(response.qty) > 0 ? 'long' : 'short' as PositionSide,
        assetType: response.asset_class,
        marketValue: parseFloat(response.market_value),
      };
    } catch (error) {
      // Position not found
      return null;
    }
  }

  /**
   * Get account info in normalized format
   */
  async getAccountNormalized(): Promise<NormalizedAccount> {
    const response = await this.makeRequest('/v2/account');
    const positions = await this.getPositionsNormalized();

    return {
      accountId: response.account_number,
      balance: parseFloat(response.cash),
      buyingPower: parseFloat(response.buying_power),
      currency: response.currency,
      marginUsed: parseFloat(response.cash) - parseFloat(response.cash_withdrawable || response.cash),
      availableMargin: parseFloat(response.buying_power),
      positions,
      unrealizedPnL: parseFloat(response.unrealized_pl || 0),
      realizedPnL: parseFloat(response.realized_pl || 0),
    };
  }
}