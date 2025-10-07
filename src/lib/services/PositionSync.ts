/**
 * PositionSync Service
 *
 * Periodically syncs open positions with broker to:
 * - Update current prices and P&L
 * - Detect stop loss / take profit triggers
 * - Sync position quantities (partial exits)
 * - Handle broker-side position closures
 *
 * Runs independently from OrderTracker - this is for ongoing position monitoring,
 * while OrderTracker is for new order lifecycle.
 *
 * @business-critical: Position sync must be accurate for risk management
 */

import { PrismaClient } from '@prisma/client';
import { IBrokerAdapter, NormalizedPosition } from '../brokers/types';
import { AlpacaClient } from '../brokers/alpaca/AlpacaClient';
import { getEncryption } from '../security/encryption';

const prisma = new PrismaClient();

export interface PositionSyncConfig {
  syncInterval: number;          // 60000ms = 1 minute
  stalePositionThreshold: number; // 300000ms = 5 minutes
  maxConcurrentSyncs: number;    // Limit concurrent broker API calls
}

const DEFAULT_CONFIG: PositionSyncConfig = {
  syncInterval: 60000,         // 1 minute
  stalePositionThreshold: 300000, // 5 minutes
  maxConcurrentSyncs: 3,
};

export class PositionSync {
  private config: PositionSyncConfig;
  private syncTimer?: NodeJS.Timeout;
  private isRunning = false;
  private activeSyncs = new Set<string>();

  constructor(config: PositionSyncConfig = DEFAULT_CONFIG) {
    this.config = config;
  }

  /**
   * Start periodic syncing
   */
  start(): void {
    if (this.isRunning) {
      console.warn('[PositionSync] Already running');
      return;
    }

    console.log(`[PositionSync] Starting with ${this.config.syncInterval}ms interval`);
    this.isRunning = true;

    // Run immediately, then on interval
    this.syncAllPositions();
    this.syncTimer = setInterval(() => {
      this.syncAllPositions();
    }, this.config.syncInterval);
  }

  /**
   * Stop periodic syncing
   */
  stop(): void {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
      this.syncTimer = undefined;
    }
    this.isRunning = false;
    console.log('[PositionSync] Stopped');
  }

  /**
   * Sync all open positions across all users
   */
  private async syncAllPositions(): Promise<void> {
    if (this.activeSyncs.size >= this.config.maxConcurrentSyncs) {
      console.log('[PositionSync] Max concurrent syncs reached, skipping');
      return;
    }

    try {
      // Get all open positions that need syncing
      const staleThreshold = new Date(Date.now() - this.config.stalePositionThreshold);

      const positions = await prisma.positions.findMany({
        where: {
          status: 'open',
          broker: {
            not: null,
          },
          OR: [
            { lastSyncedAt: null },
            { lastSyncedAt: { lt: staleThreshold } },
          ],
        },
        include: {
          strategies: {
            include: {
              portfolios: {
                select: {
                  userId: true,
                },
              },
            },
          },
        },
        orderBy: {
          lastSyncedAt: 'asc', // Sync oldest first
        },
        take: this.config.maxConcurrentSyncs,
      });

      if (positions.length === 0) {
        return;
      }

      console.log(`[PositionSync] Syncing ${positions.length} positions`);

      // Sync positions in parallel (up to maxConcurrentSyncs)
      const syncPromises = positions.map(position =>
        this.syncPosition(
          position.id,
          position.strategies.portfolios.userId,
          position.broker!,
          position.symbol
        )
      );

      await Promise.allSettled(syncPromises);
    } catch (error) {
      console.error('[PositionSync] Error in syncAllPositions:', error);
    }
  }

  /**
   * Sync a single position
   */
  private async syncPosition(
    positionId: string,
    userId: string,
    broker: string,
    symbol: string
  ): Promise<void> {
    // Prevent concurrent syncs of same position
    if (this.activeSyncs.has(positionId)) {
      return;
    }

    this.activeSyncs.add(positionId);

    try {
      // Get broker connection
      const brokerConnection = await prisma.broker_connections.findFirst({
        where: {
          userId,
          broker,
          isActive: true,
        },
      });

      if (!brokerConnection) {
        console.warn(`[PositionSync] No active broker connection for user ${userId}, broker ${broker}`);
        return;
      }

      // Create broker client
      const brokerClient = await this.createBrokerClient(broker, brokerConnection.credentials);

      // Get position from broker
      const brokerPosition = await brokerClient.getPositionNormalized(symbol);

      if (!brokerPosition) {
        // Position not found at broker - may have been closed externally
        await this.handlePositionClosed(positionId, 'Position closed at broker');
        return;
      }

      // Update position in database
      await this.updatePosition(positionId, brokerPosition);

      // Check stop loss / take profit
      await this.checkExitTriggers(positionId, brokerPosition);

    } catch (error) {
      console.error(`[PositionSync] Error syncing position ${positionId}:`, error);
    } finally {
      this.activeSyncs.delete(positionId);
    }
  }

  /**
   * Create broker client from credentials
   */
  private async createBrokerClient(broker: string, encryptedCredentials: string): Promise<IBrokerAdapter> {
    const encryption = getEncryption();
    const credentials = encryption.decryptObject(encryptedCredentials);

    // For now, only support Alpaca
    if (broker === 'alpaca_paper' || broker === 'alpaca_live') {
      const alpacaClient = new AlpacaClient({
        apiKeyId: credentials.apiKeyId,
        secretKey: credentials.secretKey,
        paperTrading: broker === 'alpaca_paper',
      });

      await alpacaClient.connect();
      return alpacaClient;
    }

    throw new Error(`[PositionSync] Unsupported broker: ${broker}`);
  }

  /**
   * Update position with broker data
   */
  private async updatePosition(positionId: string, brokerPosition: NormalizedPosition): Promise<void> {
    const position = await prisma.positions.findUnique({
      where: { id: positionId },
    });

    if (!position) {
      return;
    }

    // Calculate unrealized P&L
    const avgEntry = Number(position.avgEntryPrice || 0);
    const currentPrice = brokerPosition.currentPrice;
    const quantity = brokerPosition.quantity;
    const direction = position.direction;

    let unrealizedPnl = 0;
    if (direction === 'long') {
      unrealizedPnl = (currentPrice - avgEntry) * quantity;
    } else {
      unrealizedPnl = (avgEntry - currentPrice) * quantity;
    }

    // Update database
    await prisma.positions.update({
      where: { id: positionId },
      data: {
        currentQuantity: brokerPosition.quantity,
        unrealizedPnl: unrealizedPnl,
        lastSyncedAt: new Date(),
      },
    });

    console.log(`[PositionSync] Updated position ${positionId}: ${brokerPosition.symbol} @ ${currentPrice}, P&L: ${unrealizedPnl.toFixed(2)}`);
  }

  /**
   * Check if stop loss or take profit should be triggered
   */
  private async checkExitTriggers(positionId: string, brokerPosition: NormalizedPosition): Promise<void> {
    const position = await prisma.positions.findUnique({
      where: { id: positionId },
    });

    if (!position) {
      return;
    }

    const currentPrice = brokerPosition.currentPrice;
    const direction = position.direction;
    const stopLoss = position.stopLoss ? Number(position.stopLoss) : null;
    const takeProfit = position.takeProfit ? Number(position.takeProfit) : null;

    let shouldClose = false;
    let closeReason = '';

    // Check stop loss
    if (stopLoss) {
      if (direction === 'long' && currentPrice <= stopLoss) {
        shouldClose = true;
        closeReason = 'Stop loss triggered';
      } else if (direction === 'short' && currentPrice >= stopLoss) {
        shouldClose = true;
        closeReason = 'Stop loss triggered';
      }
    }

    // Check take profit
    if (takeProfit && !shouldClose) {
      if (direction === 'long' && currentPrice >= takeProfit) {
        shouldClose = true;
        closeReason = 'Take profit triggered';
      } else if (direction === 'short' && currentPrice <= takeProfit) {
        shouldClose = true;
        closeReason = 'Take profit triggered';
      }
    }

    if (shouldClose) {
      console.log(`[PositionSync] ${closeReason} for position ${positionId} at ${currentPrice}`);

      // TODO: Actually submit close order to broker
      // For now, just log it
      await prisma.position_notes.create({
        data: {
          id: crypto.randomUUID(),
          positionId: positionId,
          noteType: 'system',
          content: `${closeReason} detected at ${currentPrice}. Manual close required.`,
          createdAt: new Date(),
        },
      });
    }
  }

  /**
   * Handle position closed at broker
   */
  private async handlePositionClosed(positionId: string, reason: string): Promise<void> {
    console.log(`[PositionSync] Closing position ${positionId}: ${reason}`);

    await prisma.positions.update({
      where: { id: positionId },
      data: {
        status: 'closed',
        closedAt: new Date(),
        lastSyncedAt: new Date(),
      },
    });

    // Add note
    await prisma.position_notes.create({
      data: {
        id: crypto.randomUUID(),
        positionId: positionId,
        noteType: 'system',
        content: reason,
        createdAt: new Date(),
      },
    });
  }

  /**
   * Manually sync a specific position (on-demand)
   */
  async syncPositionNow(positionId: string): Promise<void> {
    const position = await prisma.positions.findUnique({
      where: { id: positionId },
      include: {
        strategies: {
          include: {
            portfolios: {
              select: {
                userId: true,
              },
            },
          },
        },
      },
    });

    if (!position) {
      throw new Error(`Position ${positionId} not found`);
    }

    if (!position.broker) {
      throw new Error(`Position ${positionId} has no broker`);
    }

    await this.syncPosition(
      position.id,
      position.strategies.portfolios.userId,
      position.broker,
      position.symbol
    );
  }

  /**
   * Get sync status
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      activeSyncs: this.activeSyncs.size,
      config: this.config,
    };
  }
}

// Singleton instance
export const positionSync = new PositionSync();

// Auto-start in production (but not in tests or dev)
if (process.env.NODE_ENV === 'production') {
  positionSync.start();
  console.log('[PositionSync] Auto-started in production mode');
}
