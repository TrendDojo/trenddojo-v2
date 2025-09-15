/**
 * Broker Integration Types
 * @business-critical: Core broker abstraction layer
 */

export type OrderSide = 'buy' | 'sell';
export type OrderType = 'market' | 'limit' | 'stop' | 'stop_limit';
export type OrderStatus = 'pending' | 'submitted' | 'filled' | 'partial' | 'cancelled' | 'rejected';
export type PositionSide = 'long' | 'short';

export interface BrokerConfig {
  apiKey?: string;
  apiSecret?: string;
  environment?: 'production' | 'paper' | 'sandbox';
  [key: string]: any;
}

export interface BrokerClient {
  name: string;
  connect(): Promise<boolean>;
  disconnect(): Promise<void>;
  getAccountInfo(): Promise<AccountInfo>;
  getPositions(): Promise<Position[]>;
  placeOrder(order: OrderRequest): Promise<OrderResponse>;
  cancelOrder(orderId: string): Promise<boolean>;
  getMarketData(symbol: string): Promise<MarketData>;
  subscribeToMarketData(
    symbol: string,
    callback: (data: MarketData) => void
  ): Promise<() => void>;
}

export interface AccountInfo {
  accountId: string;
  balance: number;
  buyingPower: number;
  currency: string;
  positions: Position[];
  marginUsed?: number;
  availableMargin?: number;
  unrealizedPnL?: number;
  realizedPnL?: number;
}

export interface Position {
  symbol: string;
  quantity: number;
  averagePrice: number;
  currentPrice: number;
  marketValue: number;
  unrealizedPnL: number;
  realizedPnL: number;
  side: PositionSide;
  openDate?: Date;
}

export interface OrderRequest {
  symbol: string;
  quantity: number;
  side: OrderSide;
  type: OrderType;
  price?: number; // For limit/stop orders
  stopPrice?: number; // For stop-limit orders
  timeInForce?: 'day' | 'gtc' | 'ioc' | 'fok';
  notes?: string;
}

export interface OrderResponse {
  orderId: string;
  symbol: string;
  quantity: number;
  side: OrderSide;
  type: OrderType;
  status: OrderStatus;
  executedPrice?: number;
  executedQuantity?: number;
  timestamp: Date;
  commission?: number;
  message?: string;
}

export interface MarketData {
  symbol: string;
  bid: number;
  ask: number;
  last: number;
  volume: number;
  open?: number;
  high?: number;
  low?: number;
  close?: number;
  timestamp: Date;
}

export interface BrokerError extends Error {
  code?: string;
  broker: string;
  details?: any;
}

// Risk management types

export interface RiskLimits {
  maxPositionSize: number; // Maximum $ per position
  maxPortfolioRisk: number; // Maximum % of portfolio at risk
  maxDailyLoss: number; // Maximum $ loss per day
  maxOpenPositions: number; // Maximum number of concurrent positions
}

export interface TradeExecution {
  broker: string;
  orderId: string;
  symbol: string;
  quantity: number;
  side: OrderSide;
  entryPrice: number;
  exitPrice?: number;
  stopLoss?: number;
  takeProfit?: number;
  commission: number;
  slippage: number;
  executedAt: Date;
  closedAt?: Date;
  pnl?: number;
  pnlPercent?: number;
}

// Broker-specific features

export interface BrokerCapabilities {
  supportsRealTimeData: boolean;
  supportsOptionsTrading: boolean;
  supportsFractionalShares: boolean;
  supportsExtendedHours: boolean;
  supportsCrypto: boolean;
  supportsInternationalMarkets: boolean;
  maxOrdersPerSecond?: number;
  minimumOrderSize?: number;
  commissionStructure?: CommissionStructure;
}

export interface CommissionStructure {
  type: 'per_share' | 'per_trade' | 'percentage' | 'tiered';
  baseRate: number;
  minimum?: number;
  maximum?: number;
  description?: string;
}