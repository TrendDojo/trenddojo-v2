/**
 * Market Data Types
 * @business-critical: Type definitions for market data system
 */

export interface DailyPrice {
  symbol: string;
  date: string; // ISO format: YYYY-MM-DD
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  adjustedClose: number;
  dataSource?: string;
}

export interface StockMetadata {
  symbol: string;
  companyName: string;
  exchange?: string;
  sector?: string;
  industry?: string;
  marketCap?: number;
  sharesOutstanding?: number;
  firstTradeDate?: string;
  lastTradeDate?: string;
  isActive: boolean;
}

export interface CorporateAction {
  id?: number;
  symbol: string;
  actionDate: string;
  actionType: 'split' | 'dividend' | 'symbol_change' | 'delisting';
  details?: any; // JSON data
  adjustmentFactor: number;
}

export interface DataSyncStatus {
  symbol: string;
  earliestDate?: string;
  latestDate?: string;
  recordCount: number;
  lastSync?: string;
  syncStatus: 'pending' | 'complete' | 'error';
  errorMessage?: string;
  dataSource?: string;
}

export interface ImportJob {
  id?: number;
  jobType: 'bulk_initial' | 'daily_update' | 'corporate_action';
  status: 'running' | 'completed' | 'failed';
  startedAt: string;
  completedAt?: string;
  totalRecords: number;
  processedRecords: number;
  failedRecords: number;
  errorLog?: string;
  metadata?: any;
}

export interface PriceRange {
  symbol: string;
  startDate: string;
  endDate: string;
}

export interface BulkImportOptions {
  format: 'csv' | 'json' | 'parquet';
  filePath: string;
  validateData?: boolean;
  skipDuplicates?: boolean;
  updateExisting?: boolean;
  batchSize?: number;
  onProgress?: (progress: ImportProgress) => void;
}

export interface ImportProgress {
  totalRecords: number;
  processedRecords: number;
  failedRecords: number;
  currentSymbol?: string;
  percentComplete: number;
  estimatedTimeRemaining?: number;
}

export interface MarketDataQuery {
  symbols?: string[];
  startDate?: string;
  endDate?: string;
  fields?: Array<keyof DailyPrice>;
  sortBy?: 'date' | 'symbol' | 'volume';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}