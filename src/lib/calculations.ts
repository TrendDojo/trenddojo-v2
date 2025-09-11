/**
 * Financial calculation utilities for TrendDojo
 * All functions must be thoroughly tested due to financial accuracy requirements
 */

export interface PositionCalculation {
  quantity: number;
  positionSizeUsd: number;
  riskAmount: number;
  riskPercent: number;
  riskRewardRatio: number | null;
}

/**
 * @business-critical: Position size calculation determines capital at risk
 * MUST have unit tests before deployment
 * Calculate position size based on fixed risk amount
 * @param entryPrice - Planned entry price
 * @param stopLoss - Stop loss price
 * @param riskAmount - Maximum risk in USD
 * @param accountBalance - Current account balance
 * @param targetPrice - Optional target price for R:R calculation
 */
export function calculatePositionSize(
  entryPrice: number,
  stopLoss: number,
  riskAmount: number,
  accountBalance: number,
  targetPrice?: number
): PositionCalculation {
  if (entryPrice <= 0) throw new Error("Entry price must be positive");
  if (stopLoss <= 0) throw new Error("Stop loss must be positive");
  if (riskAmount <= 0) throw new Error("Risk amount must be positive");
  if (accountBalance <= 0) throw new Error("Account balance must be positive");
  if (entryPrice === stopLoss) throw new Error("Entry price cannot equal stop loss");

  const riskPerShare = Math.abs(entryPrice - stopLoss);
  const quantity = riskAmount / riskPerShare;
  const positionSizeUsd = quantity * entryPrice;
  const riskPercent = (riskAmount / accountBalance) * 100;

  let riskRewardRatio: number | null = null;
  if (targetPrice && targetPrice > 0) {
    const rewardPerShare = Math.abs(targetPrice - entryPrice);
    riskRewardRatio = rewardPerShare / riskPerShare;
  }

  return {
    quantity: Number(quantity.toFixed(6)),
    positionSizeUsd: Number(positionSizeUsd.toFixed(2)),
    riskAmount: Number(riskAmount.toFixed(2)),
    riskPercent: Number(riskPercent.toFixed(2)),
    riskRewardRatio: riskRewardRatio ? Number(riskRewardRatio.toFixed(2)) : null,
  };
}

/**
 * @business-critical: P&L calculation affects user financial reporting
 * MUST have unit tests before deployment
 * Calculate P&L for a closed position
 * @param entryPrice - Actual entry price
 * @param exitPrice - Exit price
 * @param quantity - Number of shares/units
 * @param direction - Position direction (long/short)
 * @param commission - Total commission costs
 */
export function calculatePnL(
  entryPrice: number,
  exitPrice: number,
  quantity: number,
  direction: "long" | "short",
  commission: number = 0
): { pnlAmount: number; pnlPercent: number } {
  if (entryPrice <= 0) throw new Error("Entry price must be positive");
  if (exitPrice <= 0) throw new Error("Exit price must be positive");
  if (quantity <= 0) throw new Error("Quantity must be positive");
  if (commission < 0) throw new Error("Commission cannot be negative");

  let pnlAmount: number;
  
  if (direction === "long") {
    pnlAmount = (exitPrice - entryPrice) * quantity - commission;
  } else {
    pnlAmount = (entryPrice - exitPrice) * quantity - commission;
  }

  const positionValue = entryPrice * quantity;
  const pnlPercent = (pnlAmount / positionValue) * 100;

  return {
    pnlAmount: Number(pnlAmount.toFixed(2)),
    pnlPercent: Number(pnlPercent.toFixed(2)),
  };
}

/**
 * Calculate R-multiple for a trade
 * @param pnlAmount - Profit/loss amount
 * @param initialRisk - Initial risk amount
 */
export function calculateRMultiple(pnlAmount: number, initialRisk: number): number {
  if (initialRisk <= 0) throw new Error("Initial risk must be positive");
  
  const rMultiple = pnlAmount / initialRisk;
  return Number(rMultiple.toFixed(2));
}

/**
 * Validate risk management limits
 * @param riskPercent - Risk percentage for this trade
 * @param dailyRiskUsed - Risk already used today
 * @param weeklyRiskUsed - Risk already used this week
 * @param maxRiskPerTrade - Maximum risk per trade (%)
 * @param maxDailyRisk - Maximum daily risk (%)
 * @param maxWeeklyRisk - Maximum weekly risk (%)
 */
export function validateRiskLimits(
  riskPercent: number,
  dailyRiskUsed: number,
  weeklyRiskUsed: number,
  maxRiskPerTrade: number,
  maxDailyRisk: number,
  maxWeeklyRisk: number
): { isValid: boolean; violations: string[] } {
  const violations: string[] = [];

  if (riskPercent > maxRiskPerTrade) {
    violations.push(`Risk per trade (${riskPercent}%) exceeds limit (${maxRiskPerTrade}%)`);
  }

  if (dailyRiskUsed + riskPercent > maxDailyRisk) {
    violations.push(`Daily risk would exceed limit (${dailyRiskUsed + riskPercent}% > ${maxDailyRisk}%)`);
  }

  if (weeklyRiskUsed + riskPercent > maxWeeklyRisk) {
    violations.push(`Weekly risk would exceed limit (${weeklyRiskUsed + riskPercent}% > ${maxWeeklyRisk}%)`);
  }

  return {
    isValid: violations.length === 0,
    violations,
  };
}