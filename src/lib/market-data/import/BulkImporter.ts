/**
 * Bulk Data Importer
 * @business-critical: Handles bulk import of historical market data
 */

import { parse } from 'csv-parse';
import fs from 'fs';
import path from 'path';
import { createReadStream } from 'fs';
import { MarketDatabase } from '../database/MarketDatabase';
import { DailyPrice, ImportProgress, BulkImportOptions } from '../database/types';

export class BulkImporter {
  private db: MarketDatabase;
  private batchSize = 1000;
  private validateData = true;

  constructor(database: MarketDatabase) {
    this.db = database;
  }

  /**
   * Import CSV file with price data
   * Expected format: symbol,date,open,high,low,close,volume,adjusted_close
   */
  async importCSV(filePath: string, options?: Partial<BulkImportOptions>): Promise<void> {
    // DEBUG: console.log(`Starting CSV import from: ${filePath}`);

    const fileSize = fs.statSync(filePath).size;
    let processedBytes = 0;
    let processedRecords = 0;
    let failedRecords = 0;
    let batch: DailyPrice[] = [];

    return new Promise((resolve, reject) => {
      const stream = createReadStream(filePath);
      const parser = parse({
        columns: true,
        skip_empty_lines: true,
        trim: true,
        cast: true,
        cast_date: false
      });

      stream.pipe(parser);

      parser.on('data', async (row) => {
        processedBytes += JSON.stringify(row).length;

        try {
          // Validate and transform row
          const price = this.transformRow(row);

          if (this.validatePrice(price)) {
            batch.push(price);

            // Insert batch when it reaches batchSize
            if (batch.length >= this.batchSize) {
              parser.pause();
              await this.insertBatch(batch, options);
              processedRecords += batch.length;

              // Report progress
              if (options?.onProgress) {
                const progress: ImportProgress = {
                  totalRecords: 0, // Unknown for CSV
                  processedRecords,
                  failedRecords,
                  currentSymbol: price.symbol,
                  percentComplete: (processedBytes / fileSize) * 100
                };
                options.onProgress(progress);
              }

              batch = [];
              parser.resume();
            }
          } else {
            failedRecords++;
            console.warn(`Invalid price data: ${JSON.stringify(row)}`);
          }
        } catch (error) {
          failedRecords++;
          console.error(`Error processing row: ${error}`);
        }
      });

      parser.on('end', async () => {
        // Insert remaining batch
        if (batch.length > 0) {
          await this.insertBatch(batch, options);
          processedRecords += batch.length;
        }

    // DEBUG: console.log(`CSV import completed: ${processedRecords} records processed, ${failedRecords} failed`);
        resolve();
      });

      parser.on('error', (error) => {
        console.error('CSV parsing error:', error);
        reject(error);
      });
    });
  }

  /**
   * Import JSON file with price data
   */
  async importJSON(filePath: string, options?: Partial<BulkImportOptions>): Promise<void> {
    // DEBUG: console.log(`Starting JSON import from: ${filePath}`);

    const content = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(content);

    let prices: DailyPrice[] = [];

    // Handle different JSON structures
    if (Array.isArray(data)) {
      prices = data.map(item => this.transformRow(item));
    } else if (data.prices && Array.isArray(data.prices)) {
      prices = data.prices.map((item: any) => this.transformRow(item));
    } else if (data.data && Array.isArray(data.data)) {
      prices = data.data.map((item: any) => this.transformRow(item));
    } else {
      throw new Error('Unsupported JSON structure');
    }

    // Validate all prices
    const validPrices = prices.filter(price => this.validatePrice(price));
    const invalidCount = prices.length - validPrices.length;

    if (invalidCount > 0) {
      console.warn(`Skipped ${invalidCount} invalid records`);
    }

    // Insert in batches
    for (let i = 0; i < validPrices.length; i += this.batchSize) {
      const batch = validPrices.slice(i, i + this.batchSize);
      await this.insertBatch(batch, options);

      if (options?.onProgress) {
        const progress: ImportProgress = {
          totalRecords: validPrices.length,
          processedRecords: Math.min(i + this.batchSize, validPrices.length),
          failedRecords: invalidCount,
          percentComplete: ((i + this.batchSize) / validPrices.length) * 100
        };
        options.onProgress(progress);
      }
    }

    // DEBUG: console.log(`JSON import completed: ${validPrices.length} records imported`);
  }

  /**
   * Transform various data formats to our standard DailyPrice
   */
  private transformRow(row: any): DailyPrice {
    // Handle different column naming conventions
    return {
      symbol: row.symbol || row.ticker || row.Symbol || row.SYMBOL,
      date: this.normalizeDate(row.date || row.Date || row.DATE || row.timestamp),
      open: parseFloat(row.open || row.Open || row.OPEN || row.o),
      high: parseFloat(row.high || row.High || row.HIGH || row.h),
      low: parseFloat(row.low || row.Low || row.LOW || row.l),
      close: parseFloat(row.close || row.Close || row.CLOSE || row.c),
      volume: parseInt(row.volume || row.Volume || row.VOLUME || row.v || '0'),
      adjustedClose: parseFloat(
        row.adjusted_close || row.adjustedClose || row.AdjustedClose ||
        row.adj_close || row.adjClose || row.close || row.Close || row.c
      ),
      dataSource: row.source || row.dataSource || 'import'
    };
  }

  /**
   * Normalize date to YYYY-MM-DD format
   */
  private normalizeDate(dateStr: string): string {
    if (!dateStr) return '';

    // Already in correct format
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      return dateStr;
    }

    // Parse various date formats
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      throw new Error(`Invalid date: ${dateStr}`);
    }

    // Format as YYYY-MM-DD
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  /**
   * Validate price data
   */
  private validatePrice(price: DailyPrice): boolean {
    if (!this.validateData) return true;

    // Basic validation
    if (!price.symbol || price.symbol.length === 0) return false;
    if (!price.date || !this.isValidDate(price.date)) return false;
    if (isNaN(price.open) || price.open < 0) return false;
    if (isNaN(price.high) || price.high < 0) return false;
    if (isNaN(price.low) || price.low < 0) return false;
    if (isNaN(price.close) || price.close < 0) return false;
    if (isNaN(price.volume) || price.volume < 0) return false;
    if (isNaN(price.adjustedClose) || price.adjustedClose < 0) return false;

    // Logical validation
    if (price.high < price.low) return false;
    if (price.high < price.open || price.high < price.close) return false;
    if (price.low > price.open || price.low > price.close) return false;

    return true;
  }

  /**
   * Check if date is valid
   */
  private isValidDate(dateStr: string): boolean {
    const date = new Date(dateStr);
    return !isNaN(date.getTime()) && date.getFullYear() > 1900 && date.getFullYear() < 2100;
  }

  /**
   * Insert batch of prices
   */
  private async insertBatch(batch: DailyPrice[], options?: Partial<BulkImportOptions>): Promise<void> {
    try {
      this.db.insertPrices(batch, { skipDuplicates: options?.skipDuplicates });

      // Update sync status for each symbol
      const symbols = [...new Set(batch.map(p => p.symbol))];
      for (const symbol of symbols) {
        const symbolPrices = batch.filter(p => p.symbol === symbol);
        const dates = symbolPrices.map(p => p.date).sort();

        this.db.updateSyncStatus({
          symbol,
          earliestDate: dates[0],
          latestDate: dates[dates.length - 1],
          recordCount: symbolPrices.length,
          syncStatus: 'complete',
          dataSource: options?.format || 'import'
        });
      }
    } catch (error) {
      console.error('Batch insert failed:', error);
      throw error;
    }
  }

  /**
   * Set batch size for imports
   */
  setBatchSize(size: number): void {
    this.batchSize = Math.max(1, Math.min(10000, size));
  }

  /**
   * Set whether to validate data
   */
  setValidation(validate: boolean): void {
    this.validateData = validate;
  }
}