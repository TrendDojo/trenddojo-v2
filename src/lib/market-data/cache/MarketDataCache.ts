/**
 * Market Data Cache Service
 * @business-critical: Manages 1-minute bulk updates from Polygon
 *
 * This service implements the "fetch all every minute" strategy:
 * - Fetches all 8000+ symbols from Polygon every minute
 * - Caches everything in PostgreSQL
 * - Enables 1-minute stop loss monitoring
 * - Pipelines data to historical storage
 */

import { PolygonProvider } from '../providers/PolygonProvider';

export interface CachedSnapshot {
  symbol: string;
  price: number;
  dayOpen: number;
  dayHigh: number;
  dayLow: number;
  dayClose: number;
  dayVolume: number;
  prevClose: number;
  change: number;
  changePercent: number;
  timestamp: Date;
  marketStatus: 'open' | 'closed' | 'pre' | 'post';
}

export class MarketDataCache {
  private provider: PolygonProvider;
  private db: any; // Will be PostgreSQL connection
  private isUpdating: boolean = false;
  private lastUpdateTime: Date | null = null;
  private updateInterval: NodeJS.Timeout | null = null;

  constructor(db: any) {
    this.provider = new PolygonProvider();
    this.db = db;
  }

  /**
   * Start the 1-minute update cycle
   * @business-critical: Core update loop for all market data
   */
  async startMinuteUpdates(): Promise<void> {
    // DEBUG: console.log('[MarketDataCache] Starting 1-minute update cycle');

    // Initial update
    await this.performBulkUpdate();

    // Schedule every minute
    this.updateInterval = setInterval(async () => {
      // Only update during market hours (9:30 AM - 4:00 PM ET)
      if (this.isMarketHours()) {
        await this.performBulkUpdate();
      }
    }, 60 * 1000); // 60 seconds
  }

  /**
   * Stop the update cycle
   */
  stopUpdates(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  /**
   * Perform bulk update of all symbols
   * @business-critical: Fetches and caches all market data
   */
  private async performBulkUpdate(): Promise<void> {
    if (this.isUpdating) {
    // DEBUG: console.log('[MarketDataCache] Update already in progress, skipping');
      return;
    }

    const startTime = Date.now();
    this.isUpdating = true;

    try {
    // DEBUG: console.log('[MarketDataCache] Fetching all tickers snapshot...');

      // Fetch ALL tickers in one API call
      const snapshot = await this.provider.getSnapshot('ALL');

      if (!snapshot || !snapshot.tickers) {
        throw new Error('Failed to fetch market snapshot');
      }

      const tickers = snapshot.tickers;
    // DEBUG: console.log(`[MarketDataCache] Received ${tickers.length} symbols`);

      // Bulk insert into cache
      await this.bulkUpdateCache(tickers);

      // Check stop losses
      await this.checkAllStopLosses(tickers);

      // Queue for historical storage
      await this.queueForHistorical(tickers);

      // Log success
      const duration = Date.now() - startTime;
      await this.logUpdate(tickers.length, duration, true);

      this.lastUpdateTime = new Date();
    // DEBUG: console.log(`[MarketDataCache] Update complete in ${duration}ms`);

    } catch (error) {
      console.error('[MarketDataCache] Update failed:', error);
      await this.logUpdate(0, Date.now() - startTime, false, error);
    } finally {
      this.isUpdating = false;
    }
  }

  /**
   * Bulk update cache with all snapshots
   */
  private async bulkUpdateCache(tickers: any[]): Promise<void> {
    // Prepare bulk insert values
    const values = tickers.map(ticker => ({
      symbol: ticker.ticker,
      data_type: 'snapshot',
      data: {
        symbol: ticker.ticker,
        price: ticker.lastTrade?.p || ticker.prevDay?.c || 0,
        dayOpen: ticker.day?.o,
        dayHigh: ticker.day?.h,
        dayLow: ticker.day?.l,
        dayClose: ticker.day?.c,
        dayVolume: ticker.day?.v,
        prevClose: ticker.prevDay?.c,
        change: (ticker.day?.c || 0) - (ticker.prevDay?.c || 0),
        changePercent: ticker.prevDay?.c ?
          ((ticker.day?.c || 0) - ticker.prevDay.c) / ticker.prevDay.c * 100 : 0,
        bid: ticker.lastQuote?.p,
        ask: ticker.lastQuote?.P,
        bidSize: ticker.lastQuote?.s,
        askSize: ticker.lastQuote?.S,
        timestamp: new Date(ticker.updated || Date.now())
      }
    }));

    // Bulk upsert using ON CONFLICT
    const query = `
      INSERT INTO market_data_cache (symbol, data_type, data, fetched_at, expires_at)
      VALUES ${values.map((_, i) => `($${i*3+1}, $${i*3+2}, $${i*3+3}, NOW(), NOW() + INTERVAL '2 minutes')`).join(',')}
      ON CONFLICT (symbol, data_type)
      DO UPDATE SET
        data = EXCLUDED.data,
        fetched_at = NOW(),
        expires_at = NOW() + INTERVAL '2 minutes'
    `;

    const params = values.flatMap(v => [v.symbol, v.data_type, JSON.stringify(v.data)]);
    await this.db.query(query, params);
  }

  /**
   * Check all stop losses against current prices
   * @business-critical: Stop loss monitoring with 1-minute granularity
   */
  private async checkAllStopLosses(tickers: any[]): Promise<void> {
    // Get all active stop losses
    const stopLosses = await this.db.query(`
      SELECT
        sl.*,
        p.user_id
      FROM stop_loss_checks sl
      JOIN positions p ON p.id = sl.position_id
      WHERE sl.triggered = FALSE
        AND p.status = 'open'
    `);

    // Create price map for fast lookup
    const priceMap = new Map(
      tickers.map(t => [
        t.ticker,
        t.lastTrade?.p || t.day?.c || t.prevDay?.c || 0
      ])
    );

    // Check each stop loss
    for (const stop of stopLosses.rows) {
      const currentPrice = priceMap.get(stop.symbol);

      if (currentPrice && currentPrice <= stop.stop_price) {
    // DEBUG: console.log(`[STOP LOSS TRIGGERED] ${stop.symbol} at ${currentPrice} (stop: ${stop.stop_price})`);

        // Mark as triggered
        await this.db.query(`
          UPDATE stop_loss_checks
          SET
            triggered = TRUE,
            triggered_at = NOW(),
            current_price = $1
          WHERE id = $2
        `, [currentPrice, stop.id]);

        // Create alert/notification
        await this.createStopLossAlert(stop, currentPrice);
      }

      // Update last checked
      await this.db.query(`
        UPDATE stop_loss_checks
        SET
          last_checked = NOW(),
          check_count = check_count + 1,
          current_price = $1
        WHERE id = $2
      `, [currentPrice, stop.id]);
    }
  }

  /**
   * Queue data for historical storage
   */
  private async queueForHistorical(tickers: any[]): Promise<void> {
    // Only queue during market hours and for symbols with significant volume
    const significantTickers = tickers.filter(t =>
      t.day?.v > 100000 // More than 100k volume
    );

    const values = significantTickers.map(ticker => ({
      symbol: ticker.ticker,
      timestamp: new Date(),
      data_type: 'snapshot',
      price_data: {
        open: ticker.day?.o,
        high: ticker.day?.h,
        low: ticker.day?.l,
        close: ticker.day?.c || ticker.lastTrade?.p,
        volume: ticker.day?.v
      }
    }));

    if (values.length > 0) {
      const query = `
        INSERT INTO historical_write_queue (symbol, timestamp, data_type, price_data)
        VALUES ${values.map((_, i) => `($${i*4+1}, $${i*4+2}, $${i*4+3}, $${i*4+4})`).join(',')}
      `;

      const params = values.flatMap(v => [
        v.symbol,
        v.timestamp,
        v.data_type,
        JSON.stringify(v.price_data)
      ]);

      await this.db.query(query, params);
    }
  }

  /**
   * Get cached data for a symbol
   */
  async getCachedData(symbol: string): Promise<CachedSnapshot | null> {
    const result = await this.db.query(`
      SELECT data, fetched_at
      FROM market_data_cache
      WHERE symbol = $1
        AND data_type = 'snapshot'
        AND expires_at > NOW()
    `, [symbol]);

    if (result.rows.length === 0) {
      return null;
    }

    // Increment access count
    await this.db.query(`
      UPDATE market_data_cache
      SET access_count = access_count + 1
      WHERE symbol = $1 AND data_type = 'snapshot'
    `, [symbol]);

    return result.rows[0].data as CachedSnapshot;
  }

  /**
   * Create alert for triggered stop loss
   */
  private async createStopLossAlert(stop: any, currentPrice: number): Promise<void> {
    // This would integrate with your notification system
    // DEBUG: console.log(`[ALERT] Stop loss triggered for ${stop.symbol} at ${currentPrice}`);

    // Alert notifications will be added with stop loss monitoring
    // await notificationService.sendStopLossAlert(stop.user_id, stop.symbol, currentPrice);
  }

  /**
   * Check if market is open
   */
  private isMarketHours(): boolean {
    const now = new Date();
    const hours = now.getUTCHours() - 5; // Convert to ET (rough)
    const minutes = now.getMinutes();
    const day = now.getDay();

    // Market hours: 9:30 AM - 4:00 PM ET, Monday-Friday
    if (day === 0 || day === 6) return false; // Weekend

    const marketStart = 9.5; // 9:30 AM
    const marketEnd = 16; // 4:00 PM
    const currentTime = hours + minutes / 60;

    return currentTime >= marketStart && currentTime <= marketEnd;
  }

  /**
   * Log update for monitoring
   */
  private async logUpdate(
    symbolsUpdated: number,
    durationMs: number,
    success: boolean,
    error?: any
  ): Promise<void> {
    await this.db.query(`
      INSERT INTO bulk_update_log (symbols_updated, duration_ms, success, error_message)
      VALUES ($1, $2, $3, $4)
    `, [symbolsUpdated, durationMs, success, error?.message || null]);
  }

  /**
   * Get cache statistics
   */
  async getCacheStats(): Promise<any> {
    const result = await this.db.query('SELECT * FROM cache_stats');
    return result.rows[0];
  }
}