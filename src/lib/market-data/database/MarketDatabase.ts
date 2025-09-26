/**
 * Market Database Service
 * @business-critical: Core service for historical market data access
 */

import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import {
  DailyPrice,
  StockMetadata,
  CorporateAction,
  DataSyncStatus,
  ImportJob,
  MarketDataQuery,
  BulkImportOptions,
  ImportProgress
} from './types';

export class MarketDatabase {
  private db: Database.Database | null = null;
  private readonly dbPath: string;
  private readonly cacheSize = 10000; // Pages in cache

  constructor(dbPath?: string) {
    this.dbPath = dbPath || path.join(process.cwd(), 'data', 'market', 'historical_prices.db');
  }

  /**
   * Initialize database connection and create schema
   */
  async initialize(): Promise<void> {
    try {
      // Ensure directory exists
      const dir = path.dirname(this.dbPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      // Open database
      this.db = new Database(this.dbPath);

      // Configure for optimal performance
      this.db.pragma('journal_mode = WAL');
      this.db.pragma('synchronous = NORMAL');
      this.db.pragma(`cache_size = ${this.cacheSize}`);
      this.db.pragma('temp_store = MEMORY');

      // Skip schema creation if database already exists (it's already populated)
      // The schema.sql approach doesn't work well in Next.js runtime
    // DEBUG: console.log(`Market database initialized at: ${this.dbPath}`);
    } catch (error) {
      console.error('Failed to initialize market database:', error);
      throw error;
    }
  }

  /**
   * Close database connection
   */
  close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }

  /**
   * Get price data for a symbol and date range
   */
  getPrices(symbol: string, startDate?: string, endDate?: string): DailyPrice[] {
    if (!this.db) throw new Error('Database not initialized');

    let query = 'SELECT * FROM daily_prices WHERE symbol = ?';
    const params: any[] = [symbol];

    if (startDate) {
      query += ' AND date >= ?';
      params.push(startDate);
    }

    if (endDate) {
      query += ' AND date <= ?';
      params.push(endDate);
    }

    query += ' ORDER BY date ASC';

    const stmt = this.db.prepare(query);
    const rows = stmt.all(...params) as any[];

    return rows.map(row => ({
      symbol: row.symbol,
      date: row.date,
      open: row.open,
      high: row.high,
      low: row.low,
      close: row.close,
      volume: row.volume,
      adjustedClose: row.adjusted_close,
      dataSource: row.data_source
    }));
  }

  /**
   * Get latest price for a symbol
   */
  getLatestPrice(symbol: string): DailyPrice | null {
    if (!this.db) throw new Error('Database not initialized');

    const stmt = this.db.prepare(`
      SELECT * FROM daily_prices
      WHERE symbol = ?
      ORDER BY date DESC
      LIMIT 1
    `);

    const row = stmt.get(symbol) as any;
    if (!row) return null;

    return {
      symbol: row.symbol,
      date: row.date,
      open: row.open,
      high: row.high,
      low: row.low,
      close: row.close,
      volume: row.volume,
      adjustedClose: row.adjusted_close,
      dataSource: row.data_source
    };
  }

  /**
   * Bulk insert price data
   */
  insertPrices(prices: DailyPrice[], options?: { skipDuplicates?: boolean }): void {
    if (!this.db) throw new Error('Database not initialized');

    const insertStmt = this.db.prepare(`
      INSERT ${options?.skipDuplicates ? 'OR IGNORE' : 'OR REPLACE'} INTO daily_prices
      (symbol, date, open, high, low, close, volume, adjusted_close, data_source)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const transaction = this.db.transaction((prices: DailyPrice[]) => {
      for (const price of prices) {
        insertStmt.run(
          price.symbol,
          price.date,
          price.open,
          price.high,
          price.low,
          price.close,
          price.volume,
          price.adjustedClose,
          price.dataSource || 'unknown'
        );
      }
    });

    transaction(prices);
  }

  /**
   * Get stock metadata
   */
  getMetadata(symbol: string): StockMetadata | null {
    if (!this.db) throw new Error('Database not initialized');

    const stmt = this.db.prepare('SELECT * FROM stock_metadata WHERE symbol = ?');
    const row = stmt.get(symbol) as any;

    if (!row) return null;

    return {
      symbol: row.symbol,
      companyName: row.company_name,
      exchange: row.exchange,
      sector: row.sector,
      industry: row.industry,
      marketCap: row.market_cap,
      sharesOutstanding: row.shares_outstanding,
      firstTradeDate: row.first_trade_date,
      lastTradeDate: row.last_trade_date,
      isActive: row.is_active === 1
    };
  }

  /**
   * Update stock metadata
   */
  updateMetadata(metadata: StockMetadata): void {
    if (!this.db) throw new Error('Database not initialized');

    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO stock_metadata
      (symbol, company_name, exchange, sector, industry, market_cap,
       shares_outstanding, first_trade_date, last_trade_date, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      metadata.symbol,
      metadata.companyName,
      metadata.exchange,
      metadata.sector,
      metadata.industry,
      metadata.marketCap,
      metadata.sharesOutstanding,
      metadata.firstTradeDate,
      metadata.lastTradeDate,
      metadata.isActive ? 1 : 0
    );
  }

  /**
   * Get sync status for a symbol
   */
  getSyncStatus(symbol: string): DataSyncStatus | null {
    if (!this.db) throw new Error('Database not initialized');

    const stmt = this.db.prepare('SELECT * FROM data_sync_status WHERE symbol = ?');
    const row = stmt.get(symbol) as any;

    if (!row) return null;

    return {
      symbol: row.symbol,
      earliestDate: row.earliest_date,
      latestDate: row.latest_date,
      recordCount: row.record_count,
      lastSync: row.last_sync,
      syncStatus: row.sync_status,
      errorMessage: row.error_message,
      dataSource: row.data_source
    };
  }

  /**
   * Update sync status
   */
  updateSyncStatus(status: DataSyncStatus): void {
    if (!this.db) throw new Error('Database not initialized');

    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO data_sync_status
      (symbol, earliest_date, latest_date, record_count, last_sync,
       sync_status, error_message, data_source)
      VALUES (?, ?, ?, ?, datetime('now'), ?, ?, ?)
    `);

    stmt.run(
      status.symbol,
      status.earliestDate,
      status.latestDate,
      status.recordCount,
      status.syncStatus,
      status.errorMessage,
      status.dataSource
    );
  }

  /**
   * Get all available symbols
   */
  getSymbols(): string[] {
    if (!this.db) throw new Error('Database not initialized');

    const stmt = this.db.prepare('SELECT DISTINCT symbol FROM daily_prices ORDER BY symbol');
    const rows = stmt.all() as any[];

    return rows.map(row => row.symbol);
  }

  /**
   * Get database statistics
   */
  getStats(): any {
    if (!this.db) throw new Error('Database not initialized');

    const stats = {
      totalSymbols: (this.db.prepare('SELECT COUNT(DISTINCT symbol) as count FROM daily_prices').get() as any)?.count || 0,
      totalRecords: (this.db.prepare('SELECT COUNT(*) as count FROM daily_prices').get() as any)?.count || 0,
      earliestDate: (this.db.prepare('SELECT MIN(date) as date FROM daily_prices').get() as any)?.date || null,
      latestDate: (this.db.prepare('SELECT MAX(date) as date FROM daily_prices').get() as any)?.date || null,
      databaseSize: fs.statSync(this.dbPath).size,
      lastUpdated: fs.statSync(this.dbPath).mtime
    };

    return stats;
  }

  /**
   * Check if symbol exists in database
   */
  hasSymbol(symbol: string): boolean {
    if (!this.db) throw new Error('Database not initialized');

    const stmt = this.db.prepare(
      'SELECT COUNT(*) as count FROM daily_prices WHERE symbol = ? LIMIT 1'
    );
    const result = stmt.get(symbol) as { count: number };
    return result.count > 0;
  }

  /**
   * Get price history for a symbol (limited number of records)
   */
  getPriceHistory(symbol: string, limit: number = 30): DailyPrice[] {
    if (!this.db) throw new Error('Database not initialized');

    const stmt = this.db.prepare(`
      SELECT * FROM daily_prices
      WHERE symbol = ?
      ORDER BY date DESC
      LIMIT ?
    `);
    const rows = stmt.all(symbol, limit) as any[];

    return rows.map(row => ({
      symbol: row.symbol,
      date: row.date,
      open: row.open,
      high: row.high,
      low: row.low,
      close: row.close,
      volume: row.volume,
      adjustedClose: row.adjusted_close,
      dataSource: row.data_source
    })).reverse(); // Return in chronological order
  }

  /**
   * Get price on a specific date
   */
  getPriceOnDate(symbol: string, date: string): DailyPrice | null {
    if (!this.db) throw new Error('Database not initialized');

    const stmt = this.db.prepare(`
      SELECT * FROM daily_prices
      WHERE symbol = ? AND date = ?
    `);
    const row = stmt.get(symbol, date) as any;

    if (!row) return null;

    return {
      symbol: row.symbol,
      date: row.date,
      open: row.open,
      high: row.high,
      low: row.low,
      close: row.close,
      volume: row.volume,
      adjustedClose: row.adjusted_close,
      dataSource: row.data_source
    };
  }

  /**
   * Get nearest available price to a date (for weekends/holidays)
   */
  getNearestPrice(symbol: string, date: string): DailyPrice | null {
    if (!this.db) throw new Error('Database not initialized');

    // Try exact date first
    const exactPrice = this.getPriceOnDate(symbol, date);
    if (exactPrice) return exactPrice;

    // Get nearest price before the date
    const stmt = this.db.prepare(`
      SELECT * FROM daily_prices
      WHERE symbol = ? AND date <= ?
      ORDER BY date DESC
      LIMIT 1
    `);
    const row = stmt.get(symbol, date) as any;

    if (!row) {
      // If no price before, try after
      const stmtAfter = this.db.prepare(`
        SELECT * FROM daily_prices
        WHERE symbol = ? AND date > ?
        ORDER BY date ASC
        LIMIT 1
      `);
      const rowAfter = stmtAfter.get(symbol, date) as any;

      if (!rowAfter) return null;

      return {
        symbol: rowAfter.symbol,
        date: rowAfter.date,
        open: rowAfter.open,
        high: rowAfter.high,
        low: rowAfter.low,
        close: rowAfter.close,
        volume: rowAfter.volume,
        adjustedClose: rowAfter.adjusted_close,
        dataSource: rowAfter.data_source
      };
    }

    return {
      symbol: row.symbol,
      date: row.date,
      open: row.open,
      high: row.high,
      low: row.low,
      close: row.close,
      volume: row.volume,
      adjustedClose: row.adjusted_close,
      dataSource: row.data_source
    };
  }

  /**
   * Vacuum database to reclaim space
   */
  vacuum(): void {
    if (!this.db) throw new Error('Database not initialized');
    this.db.pragma('VACUUM');
  }

  /**
   * Create backup of database
   */
  backup(backupPath: string): void {
    if (!this.db) throw new Error('Database not initialized');

    const backupDb = new Database(backupPath);
    this.db.backup(backupDb.name);
    backupDb.close();

    // DEBUG: console.log(`Database backed up to: ${backupPath}`);
  }
}