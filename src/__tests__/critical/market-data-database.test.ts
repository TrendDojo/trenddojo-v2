/**
 * CRITICAL TESTS - Market Data Database
 * These tests MUST pass before any deployment
 * Verifies SQLite database operations are functioning correctly
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { MarketDatabase } from '@/lib/market-data/database/MarketDatabase';
import path from 'path';

describe('Critical: Market Data Database Operations', () => {
  let db: MarketDatabase;

  beforeAll(() => {
    const dbPath = path.join(process.cwd(), 'data', 'market', 'historical_prices.db');
    db = new MarketDatabase(dbPath);
  });

  afterAll(() => {
    if (db) {
      db.close();
    }
  });

  describe('Database Connection', () => {
    it('MUST connect to SQLite database', async () => {
      await db.initialize();
      expect(db).toBeDefined();
    });

    it('MUST retrieve price data', () => {
      // Test with a known symbol that should be in the database
      const prices = db.getPrices('AAPL', '2024-01-01', '2024-01-31');
      expect(Array.isArray(prices)).toBe(true);
    });
  });

  describe('Data Integrity', () => {
    it('MUST return valid price data structure', () => {
      const price = db.getLatestPrice('AAPL');

      if (price) {
        expect(price).toHaveProperty('symbol');
        expect(price).toHaveProperty('date');
        expect(price).toHaveProperty('open');
        expect(price).toHaveProperty('high');
        expect(price).toHaveProperty('low');
        expect(price).toHaveProperty('close');
        expect(price).toHaveProperty('volume');
      }
    });

    it('MUST handle missing symbols gracefully', () => {
      const price = db.getLatestPrice('INVALID_SYMBOL_XYZ');
      expect(price === null || price === undefined).toBe(true);
    });
  });

  describe('Query Performance', () => {
    it('MUST retrieve single symbol data quickly', () => {
      const start = Date.now();
      const result = db.getLatestPrice('AAPL');
      const duration = Date.now() - start;

      // Query should complete in under 100ms
      expect(duration).toBeLessThan(100);

      if (result) {
        expect(result).toHaveProperty('symbol');
        expect(result).toHaveProperty('close');
      }
    });

    it('MUST retrieve date range data efficiently', () => {
      const start = Date.now();
      const results = db.getPrices('AAPL', '2024-01-01', '2024-12-31');
      const duration = Date.now() - start;

      // Query should complete in under 500ms even for a year of data
      expect(duration).toBeLessThan(500);
      expect(Array.isArray(results)).toBe(true);
    });
  });

  describe('Data Validation', () => {
    it('MUST have non-negative prices', () => {
      const prices = db.getPrices('AAPL', '2024-01-01', '2024-01-31');

      prices.forEach((price) => {
        expect(price.open).toBeGreaterThanOrEqual(0);
        expect(price.high).toBeGreaterThanOrEqual(0);
        expect(price.low).toBeGreaterThanOrEqual(0);
        expect(price.close).toBeGreaterThanOrEqual(0);
      });
    });

    it('MUST have valid high/low relationships', () => {
      const prices = db.getPrices('AAPL', '2024-01-01', '2024-01-31');

      prices.forEach((price) => {
        expect(price.high).toBeGreaterThanOrEqual(price.low);
        expect(price.high).toBeGreaterThanOrEqual(price.open);
        expect(price.high).toBeGreaterThanOrEqual(price.close);
        expect(price.low).toBeLessThanOrEqual(price.open);
        expect(price.low).toBeLessThanOrEqual(price.close);
      });
    });

    it('MUST have valid date formats', () => {
      const prices = db.getPrices('AAPL', '2024-01-01', '2024-01-10');

      prices.forEach((price) => {
        const date = new Date(price.date);
        expect(date.toString()).not.toBe('Invalid Date');
        expect(date.getFullYear()).toBeGreaterThanOrEqual(1900);
        expect(date.getFullYear()).toBeLessThanOrEqual(new Date().getFullYear());
      });
    });
  });
});