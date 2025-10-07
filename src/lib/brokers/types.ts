/**
 * Broker Integration Types
 * @business-critical: Core broker abstraction layer
 */

export type OrderSide = 'buy' | 'sell';
export type OrderType = 'market' | 'limit' | 'stop' | 'stop_limit';
export type OrderStatus = 'pending' | 'submitted' | 'filled' | 'partial' | 'cancelled' | 'rejected';

// Enhanced order status for tracking (normalized across brokers)
export enum NormalizedOrderStatus {
  SUBMITTED = 'submitted',   // We sent it to broker
  ACCEPTED = 'accepted',     // Broker confirmed receipt
  FILLING = 'filling',       // Partial fill in progress
  FILLED = 'filled',         // Completely filled
  REJECTED = 'rejected',     // Broker rejected
  CANCELED = 'canceled',     // User or system canceled
  EXPIRED = 'expired'        // Time limit reached
}
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

export class BrokerError extends Error {
  code?: string;
  broker: string;
  details?: any;

  constructor(message: string, broker: string, code?: string, details?: any) {
    super(message);
    this.name = 'BrokerError';
    this.broker = broker;
    this.code = code;
    this.details = details;
  }
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

// Enhanced order tracking types (normalized across brokers)

export interface NormalizedOrder {
  orderId: string;
  symbol: string;
  side: OrderSide;
  quantity: number;
  orderType: OrderType;
  status: NormalizedOrderStatus;
  timeInForce: 'day' | 'gtc' | 'ioc' | 'fok';
  limitPrice?: number;
  stopPrice?: number;
  filledQuantity?: number;
  filledAvgPrice?: number;
  submittedAt: Date;
  acceptedAt?: Date;
  filledAt?: Date;
  canceledAt?: Date;
  rejectedAt?: Date;
  rejectReason?: string;
  rawBrokerData?: any; // Store original broker response for debugging
}

export interface NormalizedPosition {
  symbol: string;
  quantity: number;
  avgEntryPrice: number;
  currentPrice: number;
  unrealizedPnl: number;
  realizedPnl?: number;
  side: PositionSide;
  assetType?: string;
  marketValue?: number;
}

export interface NormalizedAccount {
  accountId: string;
  balance: number;
  buyingPower: number;
  currency: string;
  marginUsed?: number;
  availableMargin?: number;
  positions: NormalizedPosition[];
  unrealizedPnL?: number;
  realizedPnL?: number;
}

// Broker adapter interface (extends existing BrokerClient)
export interface IBrokerAdapter extends BrokerClient {
  // Enhanced order tracking methods
  submitOrderTracked(params: OrderRequest): Promise<NormalizedOrder>;
  getOrderTracked(orderId: string): Promise<NormalizedOrder>;
  getOrdersTracked(params?: { status?: string; symbols?: string[] }): Promise<NormalizedOrder[]>;

  // Enhanced position methods
  getPositionsNormalized(): Promise<NormalizedPosition[]>;
  getPositionNormalized(symbol: string): Promise<NormalizedPosition | null>;

  // Enhanced account method
  getAccountNormalized(): Promise<NormalizedAccount>;
}