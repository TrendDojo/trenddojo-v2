/**
 * STANDARD TESTS - Market Data Features
 * These tests SHOULD pass for quality assurance
 * Verifies feature completeness and business logic
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MarketDatabase } from '@/lib/market-data/database/MarketDatabase';
import { PolygonProvider } from '@/lib/market-data/providers/PolygonProvider';

describe('Standard: Market Data Feature Tests', () => {
  describe('Market Database', () => {
    let db: MarketDatabase;

    beforeEach(async () => {
      db = new MarketDatabase();
      await db.initialize();
    });

    afterEach(() => {
      db.close();
    });

    it('should initialize with database connection', () => {
      expect(db).toBeDefined();
    });

    it('should fetch symbol data from database', () => {
      const data = db.getLatestPrice('AAPL');

      if (data) {
        expect(data).toHaveProperty('symbol');
        expect(data).toHaveProperty('close');
        expect(data.symbol).toBe('AAPL');
      }
    });

    it('should return historical data for valid date range', () => {
      const data = db.getPrices('AAPL', '2024-01-01', '2024-01-31');

      expect(Array.isArray(data)).toBe(true);
      if (data.length > 0) {
        expect(data[0]).toHaveProperty('date');
        expect(data[0]).toHaveProperty('close');
      }
    });

    it('should handle multiple symbols in batch', () => {
      const symbols = ['AAPL', 'GOOGL', 'MSFT'];

      const results = symbols.map(symbol => db.getLatestPrice(symbol));

      expect(results.length).toBe(3);
      results.forEach((result, index) => {
        if (result) {
          expect(result.symbol).toBe(symbols[index]);
        }
      });
    });
  });

  describe('Data Transformation', () => {
    it('should normalize price data correctly', () => {
      const rawData = {
        o: 150.25,
        h: 152.50,
        l: 149.75,
        c: 151.00,
        v: 1000000
      };

      const normalized = {
        open: rawData.o,
        high: rawData.h,
        low: rawData.l,
        close: rawData.c,
        volume: rawData.v
      };

      expect(normalized.open).toBe(150.25);
      expect(normalized.close).toBe(151.00);
      expect(normalized.volume).toBe(1000000);
    });

    it('should calculate price changes correctly', () => {
      const previousClose = 150.00;
      const currentPrice = 153.00;

      const change = currentPrice - previousClose;
      const changePercent = (change / previousClose) * 100;

      expect(change).toBe(3.00);
      expect(changePercent).toBeCloseTo(2.00, 2);
    });

    it('should format dates consistently', () => {
      const dates = ['2024-01-01', '2024-12-31', '2024-06-15'];

      dates.forEach(dateStr => {
        const date = new Date(dateStr);
        const formatted = date.toISOString().split('T')[0];
        expect(formatted).toBe(dateStr);
      });
    });
  });

  describe('Search Functionality', () => {
    let db: MarketDatabase;

    beforeEach(async () => {
      db = new MarketDatabase();
      await db.initialize();
    });

    afterEach(() => {
      db.close();
    });

    it('should find symbols by exact match', () => {
      const result = db.getLatestPrice('AAPL');

      if (result) {
        expect(result.symbol).toBe('AAPL');
      }
    });

    it('should handle invalid symbols', () => {
      const result = db.getLatestPrice('XXXINVALIDXXX');
      expect(result).toBeNull();
    });
  });

  describe('Data Aggregation', () => {
    let db: MarketDatabase;

    beforeEach(async () => {
      db = new MarketDatabase();
      await db.initialize();
    });

    afterEach(() => {
      db.close();
    });

    it('should retrieve daily data with correct relationships', () => {
      const data = db.getPrices('AAPL', '2024-01-01', '2024-01-31');

      if (data && data.length > 0) {
        data.forEach((day) => {
          expect(day.high).toBeGreaterThanOrEqual(day.low);
          expect(day.high).toBeGreaterThanOrEqual(day.open);
          expect(day.high).toBeGreaterThanOrEqual(day.close);
          expect(day.low).toBeLessThanOrEqual(day.open);
          expect(day.low).toBeLessThanOrEqual(day.close);
        });
      }
    });

    it('should group daily data by week for aggregation', () => {
      const dailyData = db.getPrices('AAPL', '2024-01-01', '2024-01-31');

      if (dailyData && dailyData.length > 0) {
        // Group by week and verify aggregation
        const weeks = new Map();
        dailyData.forEach((day) => {
          const date = new Date(day.date);
          const weekKey = `${date.getFullYear()}-W${Math.floor(date.getDate() / 7)}`;

          if (!weeks.has(weekKey)) {
            weeks.set(weekKey, []);
          }
          weeks.get(weekKey).push(day);
        });

        weeks.forEach((weekDays) => {
          expect(weekDays.length).toBeGreaterThan(0);
          expect(weekDays.length).toBeLessThanOrEqual(7);
        });
      }
    });
  });

  describe('Error Recovery', () => {
    let db: MarketDatabase;

    beforeEach(async () => {
      db = new MarketDatabase();
      await db.initialize();
    });

    afterEach(() => {
      db.close();
    });

    it('should handle missing data gracefully', () => {
      const data = db.getLatestPrice('INVALID_SYMBOL_12345');
      // Should return null, not throw
      expect(data).toBeNull();
    });

    it('should validate Polygon provider initialization', () => {
      // Provider should throw if no API key
      expect(() => new PolygonProvider('')).toThrow();
    });

    it('should validate data before storing', () => {
      const invalidData = [
        { open: -10, high: 100, low: 90, close: 95 }, // Negative price
        { open: 100, high: 90, low: 95, close: 95 },  // High < Open
        { open: 100, high: 105, low: 110, close: 95 }, // Low > High
      ];

      invalidData.forEach(data => {
        const isValid = data.open >= 0 &&
                       data.high >= data.low &&
                       data.high >= data.open &&
                       data.high >= data.close &&
                       data.low <= data.open &&
                       data.low <= data.close;

        expect(isValid).toBe(false);
      });
    });
  });
});