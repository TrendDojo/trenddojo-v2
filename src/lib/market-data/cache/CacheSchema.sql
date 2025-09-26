-- Market Data Cache Schema
-- @business-critical: Core caching infrastructure for 1-minute updates

-- Main cache table for all market data
CREATE TABLE IF NOT EXISTS market_data_cache (
  symbol VARCHAR(10) NOT NULL,
  data_type VARCHAR(20) NOT NULL, -- 'snapshot', 'quote', 'daily', 'intraday'
  data JSONB NOT NULL,
  price DECIMAL(10, 2) GENERATED ALWAYS AS ((data->>'price')::DECIMAL) STORED, -- For fast stop loss checks
  fetched_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP DEFAULT (NOW() + INTERVAL '2 minutes'), -- 2 min TTL as buffer
  access_count INTEGER DEFAULT 0,
  PRIMARY KEY (symbol, data_type)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_cache_expires ON market_data_cache(expires_at)
  WHERE expires_at > NOW();

CREATE INDEX IF NOT EXISTS idx_cache_symbol ON market_data_cache(symbol);

CREATE INDEX IF NOT EXISTS idx_cache_price ON market_data_cache(symbol, price)
  WHERE data_type = 'snapshot'; -- For stop loss checks

CREATE INDEX IF NOT EXISTS idx_cache_hot_symbols ON market_data_cache(access_count DESC)
  WHERE access_count > 10;

-- Historical queue for permanent storage
CREATE TABLE IF NOT EXISTS historical_write_queue (
  id SERIAL PRIMARY KEY,
  symbol VARCHAR(10) NOT NULL,
  timestamp TIMESTAMP NOT NULL,
  data_type VARCHAR(20) NOT NULL,
  price_data JSONB NOT NULL,
  processed BOOLEAN DEFAULT FALSE,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_queue_unprocessed ON historical_write_queue(processed)
  WHERE processed = FALSE;

-- Stop loss monitoring table
CREATE TABLE IF NOT EXISTS stop_loss_checks (
  id SERIAL PRIMARY KEY,
  position_id INTEGER NOT NULL,
  symbol VARCHAR(10) NOT NULL,
  stop_price DECIMAL(10, 2) NOT NULL,
  current_price DECIMAL(10, 2),
  triggered BOOLEAN DEFAULT FALSE,
  triggered_at TIMESTAMP,
  last_checked TIMESTAMP DEFAULT NOW(),
  check_count INTEGER DEFAULT 0,
  FOREIGN KEY (position_id) REFERENCES positions(id)
);

CREATE INDEX IF NOT EXISTS idx_stop_loss_active ON stop_loss_checks(symbol, triggered)
  WHERE triggered = FALSE;

-- Bulk update tracking
CREATE TABLE IF NOT EXISTS bulk_update_log (
  id SERIAL PRIMARY KEY,
  update_timestamp TIMESTAMP DEFAULT NOW(),
  symbols_updated INTEGER,
  duration_ms INTEGER,
  success BOOLEAN DEFAULT TRUE,
  error_message TEXT,
  api_calls_used INTEGER DEFAULT 1
);

-- View for monitoring cache effectiveness
CREATE OR REPLACE VIEW cache_stats AS
SELECT
  COUNT(DISTINCT symbol) as cached_symbols,
  AVG(access_count) as avg_access_count,
  COUNT(*) FILTER (WHERE expires_at > NOW()) as active_entries,
  COUNT(*) FILTER (WHERE expires_at <= NOW()) as expired_entries,
  MAX(fetched_at) as last_update,
  EXTRACT(EPOCH FROM (NOW() - MAX(fetched_at))) as seconds_since_update
FROM market_data_cache;