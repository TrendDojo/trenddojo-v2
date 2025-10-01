/**
 * Price Downloader Service
 * @business-critical: Downloads and stores market data from Polygon
 *
 * Features:
 * - Bulk download with error handling
 * - Automatic retry on failures
 * - Rate limiting (even though unlimited)
 * - Data validation and integrity checks
 * - Progress tracking and reporting
 */

import { PolygonProvider } from '../providers/PolygonProvider';
import { MarketDatabase } from '../database/MarketDatabase';
import { DailyPrice } from '../database/types';

export interface DownloadOptions {
  symbols: string[];
  startDate: string;
  endDate: string;
  batchSize?: number;
  delayMs?: number;
  maxRetries?: number;
}

export interface DownloadProgress {
  total: number;
  completed: number;
  failed: number;
  currentSymbol: string;
  percentComplete: number;
}

export interface DownloadResult {
  success: number;
  failed: number;
  totalRecords: number;
  duration: number;
  errors: Array<{ symbol: string; error: string }>;
}

export class PriceDownloader {
  private provider: PolygonProvider;
  private db: MarketDatabase;
  private progressCallback?: (progress: DownloadProgress) => void;

  constructor(apiKey?: string) {
    this.provider = new PolygonProvider(apiKey);
    this.db = new MarketDatabase();
  }

  /**
   * Set progress callback for real-time updates
   */
  onProgress(callback: (progress: DownloadProgress) => void): void {
    this.progressCallback = callback;
  }

  /**
   * Download historical data for multiple symbols
   */
  async downloadHistorical(options: DownloadOptions): Promise<DownloadResult> {
    const startTime = Date.now();
    const {
      symbols,
      startDate,
      endDate,
      batchSize = 50,
      delayMs = 100,
      maxRetries = 3
    } = options;

    console.log('\n📊 Starting Historical Data Download');
    console.log('━'.repeat(50));
    console.log(`📈 Symbols: ${symbols.length}`);
    console.log(`📅 Date Range: ${startDate} to ${endDate}`);
    console.log('');

    await this.db.initialize();

    let successCount = 0;
    let failCount = 0;
    let totalRecords = 0;
    const errors: Array<{ symbol: string; error: string }> = [];

    // Process in batches
    for (let i = 0; i < symbols.length; i += batchSize) {
      const batch = symbols.slice(i, i + batchSize);

      for (const symbol of batch) {
        const progress: DownloadProgress = {
          total: symbols.length,
          completed: i + batch.indexOf(symbol),
          failed: failCount,
          currentSymbol: symbol,
          percentComplete: ((i + batch.indexOf(symbol)) / symbols.length) * 100
        };

        if (this.progressCallback) {
          this.progressCallback(progress);
        }

        // Log progress to console
        process.stdout.write(
          `\r⚙️  [${progress.completed + 1}/${progress.total}] ` +
          `${progress.percentComplete.toFixed(1)}% | ` +
          `Current: ${symbol} | Success: ${successCount} | Failed: ${failCount}`
        );

        // Download with retry logic
        const result = await this.downloadSymbolWithRetry(
          symbol,
          startDate,
          endDate,
          maxRetries
        );

        if (result.success) {
          totalRecords += result.recordCount;
          successCount++;
        } else {
          failCount++;
          errors.push({ symbol, error: result.error || 'Unknown error' });
        }

        // Small delay between requests
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }

    const duration = Date.now() - startTime;

    console.log('\n\n✅ Download Complete!');
    console.log('━'.repeat(50));
    console.log(`📊 Statistics:`);
    console.log(`   Successful: ${successCount} symbols`);
    console.log(`   Failed: ${failCount} symbols`);
    console.log(`   Total Records: ${totalRecords.toLocaleString()}`);
    console.log(`   Duration: ${(duration / 1000).toFixed(2)}s`);

    if (errors.length > 0) {
      console.log(`\n⚠️  Errors (first 10):`);
      errors.slice(0, 10).forEach(err => {
        console.log(`   ${err.symbol}: ${err.error}`);
      });
    }

    const stats = this.db.getStats();
    console.log(`\n📈 Database Status:`);
    console.log(`   Total Symbols: ${stats.totalSymbols.toLocaleString()}`);
    console.log(`   Total Records: ${stats.totalRecords.toLocaleString()}`);
    console.log(`   Date Range: ${stats.earliestDate} to ${stats.latestDate}`);

    this.db.close();

    return {
      success: successCount,
      failed: failCount,
      totalRecords,
      duration,
      errors
    };
  }

  /**
   * Download single symbol with retry logic
   */
  private async downloadSymbolWithRetry(
    symbol: string,
    startDate: string,
    endDate: string,
    maxRetries: number
  ): Promise<{ success: boolean; recordCount: number; error?: string }> {
    let lastError: string | undefined;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const bars = await this.provider.getDailyBars(symbol, startDate, endDate);

        if (bars.length > 0) {
          // Validate data before storing
          const validBars = this.validatePriceData(bars);

          if (validBars.length > 0) {
            this.db.insertPrices(validBars, { skipDuplicates: true });

            // Update sync status
            this.db.updateSyncStatus({
              symbol,
              earliestDate: validBars[0].date,
              latestDate: validBars[validBars.length - 1].date,
              recordCount: validBars.length,
              syncStatus: 'complete',
              dataSource: 'polygon'
            });

            return { success: true, recordCount: validBars.length };
          } else {
            return { success: false, recordCount: 0, error: 'No valid data after validation' };
          }
        } else {
          return { success: false, recordCount: 0, error: 'No data returned from API' };
        }
      } catch (error) {
        lastError = error instanceof Error ? error.message : 'Unknown error';

        // Exponential backoff before retry
        if (attempt < maxRetries - 1) {
          const backoffMs = Math.pow(2, attempt) * 1000;
          await new Promise(resolve => setTimeout(resolve, backoffMs));
        }
      }
    }

    return { success: false, recordCount: 0, error: lastError };
  }

  /**
   * Validate price data for sanity
   * @business-critical: Prevents bad data from entering the system
   */
  private validatePriceData(prices: DailyPrice[]): DailyPrice[] {
    return prices.filter(price => {
      // Basic sanity checks
      if (!price.symbol || !price.date) return false;
      if (price.open <= 0 || price.high <= 0 || price.low <= 0 || price.close <= 0) return false;
      if (price.high < price.low) return false;
      if (price.high < price.open || price.high < price.close) return false;
      if (price.low > price.open || price.low > price.close) return false;
      if (price.volume < 0) return false;

      // Reasonable price range (avoid corrupt data)
      const maxPrice = 100000; // $100k per share is already extreme
      if (price.high > maxPrice) return false;

      return true;
    });
  }

  /**
   * Download latest prices for all symbols (for hourly sync)
   */
  async downloadLatest(symbols: string[]): Promise<DownloadResult> {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const startDate = yesterday.toISOString().split('T')[0];
    const endDate = today.toISOString().split('T')[0];

    return this.downloadHistorical({
      symbols,
      startDate,
      endDate,
      batchSize: 100, // Larger batches for single day
      delayMs: 50 // Faster since we have unlimited API
    });
  }
}
