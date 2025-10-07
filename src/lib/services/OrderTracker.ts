/**
 * OrderTracker Service
 *
 * Event-driven order tracking service that polls brokers adaptively based on order type and status.
 *
 * Polling Strategy:
 * - Market orders: Poll every 1s until filled (typically <10s, ~5-10 polls)
 * - Limit orders: Poll at 2s and 5s for confirmation, then every 60s
 * - All orders: Stop polling when filled, canceled, rejected, or expired
 *
 * @business-critical: Order tracking must be accurate for position management
 */

import { PrismaClient } from '@prisma/client';
import { IBrokerAdapter, NormalizedOrder, NormalizedOrderStatus, OrderType } from '../brokers/types';

const prisma = new PrismaClient();

export interface OrderTrackerConfig {
  marketOrderPollInterval: number;      // 1000ms for market orders
  limitOrderConfirmPolls: number[];     // [2000, 5000] for limit orders
  limitOrderMonitorInterval: number;    // 60000ms for ongoing monitoring
  maxPollAttempts: number;              // Stop after this many polls
}

const DEFAULT_CONFIG: OrderTrackerConfig = {
  marketOrderPollInterval: 1000,
  limitOrderConfirmPolls: [2000, 5000],
  limitOrderMonitorInterval: 60000,
  maxPollAttempts: 300, // 5 minutes at 1s intervals
};

export class OrderTracker {
  private config: OrderTrackerConfig;
  private activeTracking = new Map<string, NodeJS.Timeout>();
  private pollCounts = new Map<string, number>();

  constructor(config: OrderTrackerConfig = DEFAULT_CONFIG) {
    this.config = config;
  }

  /**
   * Start tracking an order with adaptive polling
   */
  async trackOrder(
    broker: IBrokerAdapter,
    orderId: string,
    userId: string,
    orderType: OrderType
  ): Promise<void> {
    console.log(`[OrderTracker] Starting tracking for ${orderType} order ${orderId}`);

    // Stop any existing tracking for this order
    this.stopTracking(orderId);

    // Initialize poll count
    this.pollCounts.set(orderId, 0);

    // Determine polling strategy based on order type
    if (orderType === 'market') {
      await this.trackMarketOrder(broker, orderId, userId);
    } else if (orderType === 'limit') {
      await this.trackLimitOrder(broker, orderId, userId);
    } else {
      // For stop and stop_limit, use limit order strategy
      await this.trackLimitOrder(broker, orderId, userId);
    }
  }

  /**
   * Track market order - poll every 1s until filled
   */
  private async trackMarketOrder(
    broker: IBrokerAdapter,
    orderId: string,
    userId: string
  ): Promise<void> {
    const poll = async () => {
      try {
        const pollCount = (this.pollCounts.get(orderId) || 0) + 1;
        this.pollCounts.set(orderId, pollCount);

        // Get order status from broker
        const order = await broker.getOrderTracked(orderId);

        // Update database
        await this.updateBrokerOrder(userId, order);

        console.log(`[OrderTracker] Market order ${orderId} poll #${pollCount}: ${order.status}`);

        // Check if we should stop polling
        if (this.shouldStopPolling(order.status)) {
          console.log(`[OrderTracker] Stopping tracking for order ${orderId} - status: ${order.status}`);
          this.stopTracking(orderId);

          // If filled, update associated position
          if (order.status === NormalizedOrderStatus.FILLED) {
            await this.handleOrderFilled(userId, order);
          }
          return;
        }

        // Check max attempts
        if (pollCount >= this.config.maxPollAttempts) {
          console.warn(`[OrderTracker] Max poll attempts reached for order ${orderId}`);
          this.stopTracking(orderId);
          return;
        }

        // Schedule next poll
        const timeout = setTimeout(poll, this.config.marketOrderPollInterval);
        this.activeTracking.set(orderId, timeout);
      } catch (error) {
        console.error(`[OrderTracker] Error polling market order ${orderId}:`, error);
        // Continue polling on error
        const timeout = setTimeout(poll, this.config.marketOrderPollInterval);
        this.activeTracking.set(orderId, timeout);
      }
    };

    // Start first poll immediately
    await poll();
  }

  /**
   * Track limit order - poll at 2s and 5s, then every 60s
   */
  private async trackLimitOrder(
    broker: IBrokerAdapter,
    orderId: string,
    userId: string
  ): Promise<void> {
    let confirmPollIndex = 0;

    const poll = async () => {
      try {
        const pollCount = (this.pollCounts.get(orderId) || 0) + 1;
        this.pollCounts.set(orderId, pollCount);

        // Get order status from broker
        const order = await broker.getOrderTracked(orderId);

        // Update database
        await this.updateBrokerOrder(userId, order);

        console.log(`[OrderTracker] Limit order ${orderId} poll #${pollCount}: ${order.status}`);

        // Check if we should stop polling
        if (this.shouldStopPolling(order.status)) {
          console.log(`[OrderTracker] Stopping tracking for order ${orderId} - status: ${order.status}`);
          this.stopTracking(orderId);

          // If filled, update associated position
          if (order.status === NormalizedOrderStatus.FILLED) {
            await this.handleOrderFilled(userId, order);
          }
          return;
        }

        // Determine next poll interval
        let nextInterval: number;
        if (confirmPollIndex < this.config.limitOrderConfirmPolls.length) {
          // Use confirmation poll intervals (2s, 5s)
          nextInterval = this.config.limitOrderConfirmPolls[confirmPollIndex];
          confirmPollIndex++;
        } else {
          // Switch to monitoring interval (60s)
          nextInterval = this.config.limitOrderMonitorInterval;
        }

        // Schedule next poll
        const timeout = setTimeout(poll, nextInterval);
        this.activeTracking.set(orderId, timeout);
      } catch (error) {
        console.error(`[OrderTracker] Error polling limit order ${orderId}:`, error);
        // Continue polling on error
        const timeout = setTimeout(poll, this.config.limitOrderMonitorInterval);
        this.activeTracking.set(orderId, timeout);
      }
    };

    // Start first poll immediately
    await poll();
  }

  /**
   * Update broker_orders table with latest order data
   */
  private async updateBrokerOrder(userId: string, order: NormalizedOrder): Promise<void> {
    await prisma.broker_orders.upsert({
      where: { brokerOrderId: order.orderId },
      create: {
        id: crypto.randomUUID(),
        userId,
        broker: 'alpaca', // TODO: Get from adapter
        brokerOrderId: order.orderId,
        symbol: order.symbol,
        side: order.side,
        qty: order.quantity,
        orderType: order.orderType,
        status: order.status,
        limitPrice: order.limitPrice,
        stopPrice: order.stopPrice,
        filledQty: order.filledQuantity,
        filledAvgPrice: order.filledAvgPrice,
        submittedAt: order.submittedAt,
        acceptedAt: order.acceptedAt,
        filledAt: order.filledAt,
        canceledAt: order.canceledAt,
        lastSyncedAt: new Date(),
        rawData: order.rawBrokerData,
      },
      update: {
        status: order.status,
        filledQty: order.filledQuantity,
        filledAvgPrice: order.filledAvgPrice,
        acceptedAt: order.acceptedAt,
        filledAt: order.filledAt,
        canceledAt: order.canceledAt,
        lastSyncedAt: new Date(),
        rawData: order.rawBrokerData,
      },
    });
  }

  /**
   * Handle order filled - update position
   */
  private async handleOrderFilled(userId: string, order: NormalizedOrder): Promise<void> {
    console.log(`[OrderTracker] Order ${order.orderId} filled - updating position`);

    // Find position for this order by brokerPositionId
    const position = await prisma.positions.findFirst({
      where: {
        brokerPositionId: order.orderId,
        strategies: {
          portfolios: {
            userId,
          },
        },
      },
    });

    if (!position) {
      console.warn(`[OrderTracker] No position found for filled order ${order.orderId}`);
      return;
    }

    // Only update if still pending
    if (position.status !== 'pending') {
      console.log(`[OrderTracker] Position ${position.id} already ${position.status}, skipping update`);
      return;
    }

    // Update position to open with fill details
    await prisma.positions.update({
      where: { id: position.id },
      data: {
        status: 'open',
        currentQuantity: order.filledQuantity || order.quantity,
        avgEntryPrice: order.filledAvgPrice || 0,
        lastSyncedAt: new Date(),
        lastExecutionAt: order.filledAt || new Date(),
      },
    });

    // Create execution record
    await prisma.executions.create({
      data: {
        id: crypto.randomUUID(),
        positionId: position.id,
        type: order.side === 'buy' ? 'entry' : 'exit',
        quantity: order.filledQuantity || order.quantity,
        price: order.filledAvgPrice || 0,
        grossValue: (order.filledQuantity || order.quantity) * (order.filledAvgPrice || 0),
        netValue: (order.filledQuantity || order.quantity) * (order.filledAvgPrice || 0),
        brokerOrderId: order.orderId,
        executedAt: order.filledAt || new Date(),
      },
    });

    console.log(`[OrderTracker] Updated position ${position.id} to open`);
  }

  /**
   * Determine if we should stop polling this order
   */
  private shouldStopPolling(status: NormalizedOrderStatus): boolean {
    return [
      NormalizedOrderStatus.FILLED,
      NormalizedOrderStatus.CANCELED,
      NormalizedOrderStatus.REJECTED,
      NormalizedOrderStatus.EXPIRED,
    ].includes(status);
  }

  /**
   * Stop tracking an order
   */
  stopTracking(orderId: string): void {
    const timeout = this.activeTracking.get(orderId);
    if (timeout) {
      clearTimeout(timeout);
      this.activeTracking.delete(orderId);
    }
    this.pollCounts.delete(orderId);
  }

  /**
   * Stop all active tracking
   */
  stopAll(): void {
    for (const orderId of this.activeTracking.keys()) {
      this.stopTracking(orderId);
    }
  }

  /**
   * Get active tracking count
   */
  getActiveTrackingCount(): number {
    return this.activeTracking.size;
  }
}

// Singleton instance
export const orderTracker = new OrderTracker();
