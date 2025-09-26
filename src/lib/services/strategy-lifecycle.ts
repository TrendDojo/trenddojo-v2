// Strategy Lifecycle Management
// Handles cloning, blocking, and archiving strategies

import { PrismaClient } from '@prisma/client';
import type {
  StrategyStatus,
  EntryRules,
  ExitRules,
  PositionSizingRules
} from '@/lib/types/risk-management';

const prisma = new PrismaClient();

export class StrategyLifecycle {
  /**
   * Clone a strategy when rules need to change
   * - Original strategy keeps its stats and positions
   * - New strategy starts fresh with updated rules
   */
  static async cloneStrategy(
    strategyId: string,
    updates: {
      name?: string;
      entryRules?: EntryRules;
      exitRules?: ExitRules;
      positionSizingRules?: PositionSizingRules;
      description?: string;
    }
  ) {
    // Get original strategy
    const original = await prisma.strategies.findUnique({
      where: { id: strategyId },
      include: { positions: { where: { status: 'open' } } }
    });

    if (!original) {
      throw new Error('Strategy not found');
    }

    // Check if original has open positions
    const hasOpenPositions = original.positions.length > 0;

    // Create transaction to handle both operations
    return await prisma.$transaction(async (tx) => {
      // If original has open positions, block it from opening new ones
      if (hasOpenPositions) {
        await tx.strategies.update({
          where: { id: strategyId },
          data: {
            status: 'blocked',
            blocked_reason: 'Superseded by updated strategy version'
          }
        });
      } else {
        // No open positions, can safely close the original
        await tx.strategies.update({
          where: { id: strategyId },
          data: {
            status: 'closed',
            closedAt: new Date()
          }
        });
      }

      // Create new strategy with updated rules
      const newStrategy = await tx.strategies.create({
        data: {
          id: crypto.randomUUID(),
          portfolioId: original.portfolioId,
          parent_strategy_id: strategyId,
          name: updates.name || `${original.name} v2`,
          description: updates.description || original.description,
          status: 'active',
          type: original.type,
          allocatedCapital: original.allocatedCapital,
          createdAt: new Date(),
          updatedAt: new Date(),
          maxPositions: original.maxPositions,
          maxRiskPercent: original.maxRiskPercent,
          maxDrawdown: original.maxDrawdown,
          entryRules: (updates.entryRules || original.entryRules) as any,
          exitRules: (updates.exitRules || original.exitRules) as any,
          positionSizingRules: (updates.positionSizingRules || original.positionSizingRules) as any
        }
      });

      return {
        original: {
          id: strategyId,
          status: hasOpenPositions ? 'blocked' : 'closed'
        },
        cloned: newStrategy
      };
    });
  }

  /**
   * Block a strategy from opening new positions
   * Used when drawdown limits are hit or manual intervention needed
   */
  static async blockStrategy(strategyId: string, reason: string) {
    return await prisma.strategies.update({
      where: { id: strategyId },
      data: {
        status: 'blocked',
        blocked_reason: reason
      }
    });
  }

  /**
   * Archive a strategy after all positions are closed
   * Cannot archive with open positions
   */
  static async archiveStrategy(strategyId: string) {
    const strategy = await prisma.strategies.findUnique({
      where: { id: strategyId },
      include: {
        positions: { where: { status: 'open' } }
      }
    });

    if (!strategy) {
      throw new Error('Strategy not found');
    }

    if (strategy.positions.length > 0) {
      throw new Error(
        `Cannot archive strategy with ${strategy.positions.length} open positions. ` +
        'Close all positions first or use block to prevent new positions.'
      );
    }

    return await prisma.strategies.update({
      where: { id: strategyId },
      data: {
        status: 'closed',
        closedAt: new Date()
      }
    });
  }

  /**
   * Get strategy lineage - all versions of a strategy
   */
  static async getStrategyLineage(strategyId: string) {
    // Find the root strategy
    let currentStrategy: any = await prisma.strategies.findUnique({
      where: { id: strategyId }
    });

    if (!currentStrategy) {
      throw new Error('Strategy not found');
    }

    // Walk up to find the root
    while (currentStrategy && currentStrategy.parentStrategyId) {
      const parent: any = await prisma.strategies.findUnique({
        where: { id: currentStrategy.parentStrategyId }
      });
      if (!parent) break;
      currentStrategy = parent;
    }

    // Now get all descendants from the root
    const lineage = currentStrategy ? await this.getDescendants(currentStrategy.id) : [];

    return {
      root: currentStrategy,
      versions: lineage,
      totalVersions: lineage.length
    };
  }

  /**
   * Recursively get all child strategies
   * NOTE: Parent-child strategy relations pending implementation
   */
  private static async getDescendants(strategyId: string): Promise<any[]> {
    // For now, just return the single strategy
    const strategy = await prisma.strategies.findUnique({
      where: { id: strategyId },
      include: {
        positions: {
          select: {
            id: true,
            status: true,
            openedAt: true,
            closedAt: true,
            netPnl: true
          }
        }
      }
    });

    if (!strategy) return [];

    return [strategy];

    // Parent-child relations implementation:
    /*
    const descendants = [strategy];
    for (const child of strategy.childStrategies) {
      const childDescendants = await this.getDescendants(child.id);
      descendants.push(...childDescendants);
    }
    return descendants;
    */
  }

  /**
   * Check if a strategy can open new positions
   */
  static async canOpenPositions(strategyId: string): Promise<{
    allowed: boolean;
    reason?: string;
  }> {
    const strategy = await prisma.strategies.findUnique({
      where: { id: strategyId },
      include: {
        portfolios: true,
        positions: { where: { status: 'open' } }
      }
    });

    if (!strategy) {
      return { allowed: false, reason: 'Strategy not found' };
    }

    // Check strategy status
    if (strategy.status === 'blocked') {
      return {
        allowed: false,
        reason: strategy.blocked_reason || 'Strategy is blocked'
      };
    }

    if (strategy.status === 'closed') {
      return { allowed: false, reason: 'Strategy is closed' };
    }

    if (strategy.status === 'paused') {
      return { allowed: false, reason: 'Strategy is paused' };
    }

    // Check portfolio status
    if (strategy.portfolios.account_status === 'locked') {
      return {
        allowed: false,
        reason: 'Portfolio is locked due to risk limits'
      };
    }

    // Check position limits
    if (strategy.positions.length >= strategy.maxPositions) {
      return {
        allowed: false,
        reason: `Maximum positions (${strategy.maxPositions}) reached`
      };
    }

    return { allowed: true };
  }
}