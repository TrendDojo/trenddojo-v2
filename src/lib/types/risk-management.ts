// Risk Management Types for Hierarchical Rule System

export type AccountStatus = 'active' | 'warning' | 'recovery' | 'locked';
export type StrategyStatus = 'active' | 'paused' | 'blocked' | 'closed' | 'testing';

// Asset class specific risk limits
export interface AssetClassLimit {
  maxDrawdownPercent: number;      // e.g., 40 for crypto, 20 for equities
  maxVolatilityMultiplier: number; // Position size multiplier in high volatility
  coolingOffPeriodHours: number;   // Hours to wait after circuit breaker
  maxLeverage?: number;             // For forex/futures
}

export interface AssetClassLimits {
  crypto?: AssetClassLimit;
  equities?: AssetClassLimit;
  forex?: AssetClassLimit;
  commodities?: AssetClassLimit;
}

// Drawdown tier actions
export interface DrawdownTier {
  threshold: number;        // Negative percentage (e.g., -5)
  action: 'warning' | 'reduce' | 'defensive' | 'locked';
  positionSizeMultiplier?: number; // e.g., 0.5 for 50% reduction
  notification?: boolean;
}

export interface DrawdownActions {
  tiers: DrawdownTier[];
  recoveryRules?: {
    triggerPercent: number;    // e.g., -10 to enter recovery
    exitPercent: number;       // e.g., -5 to exit recovery
    maxPositionSize: number;   // e.g., 0.5 for 50% of normal
  };
}

// Strategy rules (stored in JSON fields)
export interface EntryRules {
  signals: string[];                    // Technical indicator signals
  requiredConfirmations: number;        // How many signals must align
  signalValidityMinutes: number;        // How long signal remains valid
  correlationLimit?: number;            // Max correlation with existing positions
  blackoutPeriods?: {
    newsMinutesBefore?: number;
    newsMinutesAfter?: number;
    earningsBlackout?: boolean;
  };
}

export interface ExitRules {
  stopLoss: {
    type: 'fixed' | 'atr' | 'percentage';
    value: number;
    trailingEnabled?: boolean;
    trailingActivation?: number;      // Profit % to activate trailing
  };
  takeProfit: {
    targets: Array<{
      percentage: number;              // Exit % of position
      profitPercent: number;           // At this profit level
    }>;
    trailingEnabled?: boolean;
  };
  timeBasedExit?: {
    maxHoldingDays?: number;
    weekendExit?: boolean;            // Close before weekend (for swing trades)
  };
}

export interface PositionSizingRules {
  method: 'fixed' | 'kelly' | 'volatility' | 'risk_parity';
  baseSize?: number;                  // For fixed method
  maxRiskPercent?: number;            // Max % of portfolio to risk
  volatilityLookback?: number;        // Days for volatility calculation
  kellyFraction?: number;             // Fraction of Kelly criterion (e.g., 0.25)
}

// Circuit breaker event tracking
export interface CircuitBreakerEvent {
  level: 'portfolio' | 'strategy' | 'position';
  triggeredBy: string;                // What triggered it
  reason: string;                      // Human-readable explanation
  triggeredAt: Date;
  expiresAt?: Date;
  clearedAt?: Date;
}

// Current system state
export interface SystemMetrics {
  portfolioId: string;
  currentDrawdown: number;
  peakBalance: number;
  currentBalance: number;
  openPositions: number;
  totalExposure: number;
  dailyPnL: number;
  accountStatus: AccountStatus;
  activeBreakers: CircuitBreakerEvent[];
  lastUpdated: Date;
}

// Helper functions for working with the system
export class RiskManager {
  static getActionForDrawdown(
    drawdown: number,
    actions: DrawdownActions
  ): DrawdownTier | null {
    // Sort tiers by threshold (most negative first)
    const sortedTiers = [...actions.tiers].sort((a, b) => a.threshold - b.threshold);

    // Find the most severe tier that applies
    for (const tier of sortedTiers) {
      if (drawdown <= tier.threshold) {
        return tier;
      }
    }

    return null;
  }

  static calculatePositionSizeAdjustment(
    baseSize: number,
    currentDrawdown: number,
    drawdownActions: DrawdownActions
  ): number {
    const action = this.getActionForDrawdown(currentDrawdown, drawdownActions);

    if (!action) return baseSize;

    const multiplier = action.positionSizeMultiplier ?? 1;
    return baseSize * multiplier;
  }

  static shouldBlockNewPositions(
    status: AccountStatus,
    currentDrawdown: number,
    drawdownActions: DrawdownActions
  ): boolean {
    if (status === 'locked') return true;

    const action = this.getActionForDrawdown(currentDrawdown, drawdownActions);
    return action?.action === 'defensive' || action?.action === 'locked';
  }

  static getAssetClassLimit(
    assetClass: string,
    limits: AssetClassLimits
  ): AssetClassLimit | null {
    return limits[assetClass as keyof AssetClassLimits] ?? null;
  }
}