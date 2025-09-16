// Circuit Breaker Service
// Monitors drawdowns and enforces risk limits

import { PrismaClient } from '@prisma/client';
import type {
  AccountStatus,
  DrawdownActions,
  AssetClassLimits,
  SystemMetrics
} from '@/lib/types/risk-management';
import { RiskManager } from '@/lib/types/risk-management';

const prisma = new PrismaClient();

export class CircuitBreaker {
  /**
   * Check portfolio health and update status based on drawdown
   */
  static async checkPortfolioHealth(portfolioId: string): Promise<SystemMetrics> {
    const portfolio = await prisma.portfolio.findUnique({
      where: { id: portfolioId },
      include: {
        riskSettings: true,
        strategies: {
          where: { status: 'active' },
          include: {
            positions: { where: { status: 'open' } }
          }
        }
      }
    });

    if (!portfolio) {
      throw new Error('Portfolio not found');
    }

    const riskSettings = portfolio.riskSettings[0];
    if (!riskSettings) {
      throw new Error('No risk settings found for portfolio');
    }

    // Calculate current metrics
    const currentBalance = Number(portfolio.currentBalance || 0);
    const startingBalance = Number(portfolio.startingBalance || currentBalance);

    // Calculate drawdown (simplified - should track actual peak)
    const currentDrawdown = ((currentBalance - startingBalance) / startingBalance) * 100;

    // Get drawdown actions from risk settings
    const drawdownActions = riskSettings.drawdownActions as DrawdownActions | null;

    if (!drawdownActions) {
      // No actions defined, just track metrics
      return {
        portfolioId,
        currentDrawdown,
        peakBalance: startingBalance,
        currentBalance,
        openPositions: portfolio.strategies.reduce((sum, s) => sum + s.positions.length, 0),
        totalExposure: 0, // Would calculate from positions
        dailyPnL: 0, // Would calculate from today's trades
        accountStatus: portfolio.accountStatus as AccountStatus,
        activeBreakers: [],
        lastUpdated: new Date()
      };
    }

    // Determine what action should be taken
    const action = RiskManager.getActionForDrawdown(currentDrawdown, drawdownActions);

    // Map action to account status
    let newStatus: AccountStatus = 'active';
    if (action) {
      switch (action.action) {
        case 'warning':
          newStatus = 'warning';
          break;
        case 'reduce':
        case 'defensive':
          newStatus = 'recovery';
          break;
        case 'locked':
          newStatus = 'locked';
          break;
      }
    }

    // Update portfolio status if changed
    if (newStatus !== portfolio.accountStatus) {
      await prisma.portfolio.update({
        where: { id: portfolioId },
        data: {
          accountStatus: newStatus,
          currentDrawdown
        }
      });

      // If entering defensive or locked, block all strategies
      if (newStatus === 'recovery' || newStatus === 'locked') {
        await this.blockAllStrategies(
          portfolioId,
          `Portfolio entered ${newStatus} mode at ${currentDrawdown.toFixed(2)}% drawdown`
        );
      }
    }

    return {
      portfolioId,
      currentDrawdown,
      peakBalance: startingBalance,
      currentBalance,
      openPositions: portfolio.strategies.reduce((sum, s) => sum + s.positions.length, 0),
      totalExposure: 0,
      dailyPnL: 0,
      accountStatus: newStatus,
      activeBreakers: action ? [{
        level: 'portfolio',
        triggeredBy: 'drawdown',
        reason: `Drawdown of ${currentDrawdown.toFixed(2)}% triggered ${action.action} action`,
        triggeredAt: new Date()
      }] : [],
      lastUpdated: new Date()
    };
  }

  /**
   * Block all strategies in a portfolio
   */
  private static async blockAllStrategies(portfolioId: string, reason: string) {
    await prisma.strategy.updateMany({
      where: {
        portfolioId,
        status: 'active'
      },
      data: {
        status: 'blocked',
        blockedReason: reason
      }
    });
  }

  /**
   * Check if recovery conditions are met
   */
  static async checkRecoveryConditions(portfolioId: string): Promise<boolean> {
    const portfolio = await prisma.portfolio.findUnique({
      where: { id: portfolioId },
      include: { riskSettings: true }
    });

    if (!portfolio || portfolio.accountStatus !== 'recovery') {
      return false;
    }

    const riskSettings = portfolio.riskSettings[0];
    const drawdownActions = riskSettings?.drawdownActions as DrawdownActions | null;

    if (!drawdownActions?.recoveryRules) {
      return false;
    }

    const currentDrawdown = Number(portfolio.currentDrawdown);
    const exitThreshold = drawdownActions.recoveryRules.exitPercent;

    // Exit recovery if drawdown improves past threshold
    if (currentDrawdown > exitThreshold) {
      await prisma.portfolio.update({
        where: { id: portfolioId },
        data: { accountStatus: 'active' }
      });

      // Unblock strategies
      await prisma.strategy.updateMany({
        where: {
          portfolioId,
          status: 'blocked',
          blockedReason: { contains: 'recovery mode' }
        },
        data: {
          status: 'active',
          blockedReason: null
        }
      });

      return true;
    }

    return false;
  }

  /**
   * Emergency stop - immediately close all positions
   */
  static async emergencyStop(portfolioId: string, reason: string) {
    return await prisma.$transaction(async (tx) => {
      // Lock the portfolio
      await tx.portfolio.update({
        where: { id: portfolioId },
        data: {
          accountStatus: 'locked',
          currentDrawdown: -100 // Flag for emergency
        }
      });

      // Block all strategies
      await tx.strategy.updateMany({
        where: { portfolioId },
        data: {
          status: 'blocked',
          blockedReason: `EMERGENCY STOP: ${reason}`
        }
      });

      // Mark all open positions for closing
      // In real system, this would trigger actual market orders
      const positions = await tx.position.updateMany({
        where: {
          strategy: { portfolioId },
          status: 'open'
        },
        data: {
          status: 'closing'
        }
      });

      return {
        portfolioLocked: true,
        strategiesBlocked: true,
        positionsMarkedForClosing: positions.count,
        reason
      };
    });
  }

  /**
   * Calculate position size with circuit breaker adjustments
   */
  static async calculateAdjustedPositionSize(
    strategyId: string,
    baseSize: number
  ): Promise<number> {
    const strategy = await prisma.strategy.findUnique({
      where: { id: strategyId },
      include: {
        portfolio: {
          include: { riskSettings: true }
        }
      }
    });

    if (!strategy) {
      throw new Error('Strategy not found');
    }

    const portfolio = strategy.portfolio;
    const riskSettings = portfolio.riskSettings[0];
    const drawdownActions = riskSettings?.drawdownActions as DrawdownActions | null;

    if (!drawdownActions) {
      return baseSize; // No adjustments defined
    }

    // Apply drawdown-based adjustment
    const currentDrawdown = Number(portfolio.currentDrawdown);
    const adjustedSize = RiskManager.calculatePositionSizeAdjustment(
      baseSize,
      currentDrawdown,
      drawdownActions
    );

    // Apply recovery mode adjustment if applicable
    if (portfolio.accountStatus === 'recovery' && drawdownActions.recoveryRules) {
      const recoveryMax = drawdownActions.recoveryRules.maxPositionSize;
      return Math.min(adjustedSize, baseSize * recoveryMax);
    }

    return adjustedSize;
  }
}