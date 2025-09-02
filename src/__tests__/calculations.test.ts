import { describe, it, expect } from "vitest";
import {
  calculatePositionSize,
  calculatePnL,
  calculateRMultiple,
  validateRiskLimits,
} from "@/lib/calculations";

describe("Financial Calculations", () => {
  describe("calculatePositionSize", () => {
    it("should calculate correct position size for long trade", () => {
      const result = calculatePositionSize(
        100, // entryPrice
        95,  // stopLoss
        500, // riskAmount ($500)
        10000, // accountBalance ($10,000)
        110  // targetPrice
      );

      expect(result.quantity).toBe(100); // 500 / 5 = 100 shares
      expect(result.positionSizeUsd).toBe(10000); // 100 * 100 = $10,000
      expect(result.riskAmount).toBe(500);
      expect(result.riskPercent).toBe(5); // 500/10000 * 100 = 5%
      expect(result.riskRewardRatio).toBe(2); // (110-100)/(100-95) = 10/5 = 2:1
    });

    it("should calculate correct position size for short trade", () => {
      const result = calculatePositionSize(
        100, // entryPrice
        105, // stopLoss (higher for short)
        250, // riskAmount ($250)
        5000, // accountBalance ($5,000)
        90   // targetPrice (lower for short)
      );

      expect(result.quantity).toBe(50); // 250 / 5 = 50 shares
      expect(result.positionSizeUsd).toBe(5000); // 50 * 100 = $5,000
      expect(result.riskPercent).toBe(5); // 250/5000 * 100 = 5%
      expect(result.riskRewardRatio).toBe(2); // (100-90)/(105-100) = 10/5 = 2:1
    });

    it("should handle target price not provided", () => {
      const result = calculatePositionSize(50, 45, 100, 2000);
      
      expect(result.quantity).toBe(20); // 100 / 5 = 20 shares
      expect(result.riskRewardRatio).toBeNull();
    });

    it("should throw error for invalid inputs", () => {
      expect(() => calculatePositionSize(0, 95, 500, 10000)).toThrow("Entry price must be positive");
      expect(() => calculatePositionSize(100, 0, 500, 10000)).toThrow("Stop loss must be positive");
      expect(() => calculatePositionSize(100, 95, 0, 10000)).toThrow("Risk amount must be positive");
      expect(() => calculatePositionSize(100, 95, 500, 0)).toThrow("Account balance must be positive");
      expect(() => calculatePositionSize(100, 100, 500, 10000)).toThrow("Entry price cannot equal stop loss");
    });
  });

  describe("calculatePnL", () => {
    it("should calculate profit for winning long trade", () => {
      const result = calculatePnL(100, 110, 100, "long", 10);
      
      expect(result.pnlAmount).toBe(990); // (110-100)*100 - 10 = 1000 - 10 = 990
      expect(result.pnlPercent).toBe(9.9); // 990/10000 * 100 = 9.9%
    });

    it("should calculate loss for losing long trade", () => {
      const result = calculatePnL(100, 95, 100, "long", 10);
      
      expect(result.pnlAmount).toBe(-510); // (95-100)*100 - 10 = -500 - 10 = -510
      expect(result.pnlPercent).toBe(-5.1); // -510/10000 * 100 = -5.1%
    });

    it("should calculate profit for winning short trade", () => {
      const result = calculatePnL(100, 90, 100, "short", 10);
      
      expect(result.pnlAmount).toBe(990); // (100-90)*100 - 10 = 1000 - 10 = 990
      expect(result.pnlPercent).toBe(9.9);
    });

    it("should calculate loss for losing short trade", () => {
      const result = calculatePnL(100, 105, 100, "short", 10);
      
      expect(result.pnlAmount).toBe(-510); // (100-105)*100 - 10 = -500 - 10 = -510
      expect(result.pnlPercent).toBe(-5.1);
    });

    it("should handle zero commission", () => {
      const result = calculatePnL(100, 110, 100, "long");
      
      expect(result.pnlAmount).toBe(1000);
      expect(result.pnlPercent).toBe(10);
    });

    it("should throw error for invalid inputs", () => {
      expect(() => calculatePnL(0, 110, 100, "long")).toThrow("Entry price must be positive");
      expect(() => calculatePnL(100, 0, 100, "long")).toThrow("Exit price must be positive");
      expect(() => calculatePnL(100, 110, 0, "long")).toThrow("Quantity must be positive");
      expect(() => calculatePnL(100, 110, 100, "long", -10)).toThrow("Commission cannot be negative");
    });
  });

  describe("calculateRMultiple", () => {
    it("should calculate positive R-multiple for profit", () => {
      const rMultiple = calculateRMultiple(1000, 500);
      expect(rMultiple).toBe(2); // 1000/500 = 2R
    });

    it("should calculate negative R-multiple for loss", () => {
      const rMultiple = calculateRMultiple(-500, 500);
      expect(rMultiple).toBe(-1); // -500/500 = -1R
    });

    it("should handle partial losses", () => {
      const rMultiple = calculateRMultiple(-250, 500);
      expect(rMultiple).toBe(-0.5); // -250/500 = -0.5R
    });

    it("should throw error for invalid risk", () => {
      expect(() => calculateRMultiple(1000, 0)).toThrow("Initial risk must be positive");
      expect(() => calculateRMultiple(1000, -500)).toThrow("Initial risk must be positive");
    });
  });

  describe("validateRiskLimits", () => {
    it("should pass validation when within all limits", () => {
      const result = validateRiskLimits(
        1.0, // riskPercent
        2.0, // dailyRiskUsed
        5.0, // weeklyRiskUsed
        2.0, // maxRiskPerTrade
        5.0, // maxDailyRisk
        10.0 // maxWeeklyRisk
      );

      expect(result.isValid).toBe(true);
      expect(result.violations).toHaveLength(0);
    });

    it("should fail validation when risk per trade exceeds limit", () => {
      const result = validateRiskLimits(3.0, 1.0, 2.0, 2.0, 5.0, 10.0);

      expect(result.isValid).toBe(false);
      expect(result.violations).toContain("Risk per trade (3%) exceeds limit (2%)");
    });

    it("should fail validation when daily risk would exceed limit", () => {
      const result = validateRiskLimits(2.0, 4.0, 2.0, 2.0, 5.0, 10.0);

      expect(result.isValid).toBe(false);
      expect(result.violations).toContain("Daily risk would exceed limit (6% > 5%)");
    });

    it("should fail validation when weekly risk would exceed limit", () => {
      const result = validateRiskLimits(2.0, 1.0, 9.0, 2.0, 5.0, 10.0);

      expect(result.isValid).toBe(false);
      expect(result.violations).toContain("Weekly risk would exceed limit (11% > 10%)");
    });

    it("should return multiple violations", () => {
      const result = validateRiskLimits(3.0, 4.0, 9.0, 2.0, 5.0, 10.0);

      expect(result.isValid).toBe(false);
      expect(result.violations).toHaveLength(3);
    });
  });
});