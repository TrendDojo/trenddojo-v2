-- SQLite Schema for Historical Market Data
-- @business-critical: Core data structure for all price history
-- This schema is optimized for read performance and storage efficiency

-- Main price table for daily OHLCV data
CREATE TABLE IF NOT EXISTS daily_prices (
  symbol TEXT NOT NULL,
  date TEXT NOT NULL, -- ISO format: YYYY-MM-DD
  open REAL NOT NULL,
  high REAL NOT NULL,
  low REAL NOT NULL,
  close REAL NOT NULL,
  volume INTEGER NOT NULL,
  adjusted_close REAL NOT NULL,
  data_source TEXT DEFAULT 'unknown',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (symbol, date)
) WITHOUT ROWID; -- Saves ~30% space, faster for our access pattern

-- Stock metadata (rarely changes)
CREATE TABLE IF NOT EXISTS stock_metadata (
  symbol TEXT PRIMARY KEY,
  company_name TEXT NOT NULL,
  exchange TEXT,
  sector TEXT,
  industry TEXT,
  market_cap INTEGER,
  shares_outstanding INTEGER,
  first_trade_date TEXT,
  last_trade_date TEXT, -- For delisted stocks
  is_active BOOLEAN DEFAULT 1,
  last_updated TEXT DEFAULT CURRENT_TIMESTAMP
) WITHOUT ROWID;

-- Corporate actions tracking
CREATE TABLE IF NOT EXISTS corporate_actions (
  id INTEGER PRIMARY KEY,
  symbol TEXT NOT NULL,
  action_date TEXT NOT NULL,
  action_type TEXT NOT NULL, -- 'split', 'dividend', 'symbol_change', 'delisting'
  details TEXT, -- JSON with action-specific data
  adjustment_factor REAL DEFAULT 1.0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Data sync tracking
CREATE TABLE IF NOT EXISTS data_sync_status (
  symbol TEXT PRIMARY KEY,
  earliest_date TEXT,
  latest_date TEXT,
  record_count INTEGER DEFAULT 0,
  last_sync TEXT,
  sync_status TEXT DEFAULT 'pending', -- 'pending', 'complete', 'error'
  error_message TEXT,
  data_source TEXT
) WITHOUT ROWID;

-- Import job tracking
CREATE TABLE IF NOT EXISTS import_jobs (
  id INTEGER PRIMARY KEY,
  job_type TEXT NOT NULL, -- 'bulk_initial', 'daily_update', 'corporate_action'
  status TEXT NOT NULL, -- 'running', 'completed', 'failed'
  started_at TEXT DEFAULT CURRENT_TIMESTAMP,
  completed_at TEXT,
  total_records INTEGER DEFAULT 0,
  processed_records INTEGER DEFAULT 0,
  failed_records INTEGER DEFAULT 0,
  error_log TEXT,
  metadata TEXT -- JSON with job-specific details
);

-- Create optimized indexes
CREATE INDEX IF NOT EXISTS idx_symbol_date ON daily_prices(symbol, date DESC);
CREATE INDEX IF NOT EXISTS idx_date ON daily_prices(date);
CREATE INDEX IF NOT EXISTS idx_volume ON daily_prices(symbol, volume DESC);
CREATE INDEX IF NOT EXISTS idx_corp_actions ON corporate_actions(symbol, action_date);
CREATE INDEX IF NOT EXISTS idx_sync_status ON data_sync_status(sync_status);

-- Create a view for easy access to latest prices
CREATE VIEW IF NOT EXISTS latest_prices AS
SELECT
  dp.symbol,
  dp.date,
  dp.close,
  dp.volume,
  dp.adjusted_close,
  sm.company_name,
  sm.sector,
  sm.market_cap
FROM daily_prices dp
INNER JOIN (
  SELECT symbol, MAX(date) as max_date
  FROM daily_prices
  GROUP BY symbol
) latest ON dp.symbol = latest.symbol AND dp.date = latest.max_date
LEFT JOIN stock_metadata sm ON dp.symbol = sm.symbol;

-- Performance settings for bulk imports
PRAGMA journal_mode = WAL;
PRAGMA synchronous = NORMAL;
PRAGMA cache_size = 10000;
PRAGMA temp_store = MEMORY;