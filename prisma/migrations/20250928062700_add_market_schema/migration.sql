-- Market Data Schema for Production PostgreSQL
-- This creates a separate schema for market data that can be shared across environments
-- Run this in your production database first

-- Create the market schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS market;

-- Grant appropriate permissions
GRANT USAGE ON SCHEMA market TO PUBLIC;

-- Market data cache table (optimized for time-series data)
CREATE TABLE IF NOT EXISTS market.price_data (
    symbol VARCHAR(10) NOT NULL,
    date DATE NOT NULL,
    open DECIMAL(15, 6) NOT NULL,
    high DECIMAL(15, 6) NOT NULL,
    low DECIMAL(15, 6) NOT NULL,
    close DECIMAL(15, 6) NOT NULL,
    volume BIGINT NOT NULL,
    vwap DECIMAL(15, 6),
    transactions INTEGER,
    data_source VARCHAR(20) DEFAULT 'polygon',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (symbol, date)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_price_data_symbol ON market.price_data(symbol);
CREATE INDEX IF NOT EXISTS idx_price_data_date ON market.price_data(date DESC);
CREATE INDEX IF NOT EXISTS idx_price_data_symbol_date ON market.price_data(symbol, date DESC);

-- Latest quotes table (for real-time data)
CREATE TABLE IF NOT EXISTS market.latest_quotes (
    symbol VARCHAR(10) PRIMARY KEY,
    price DECIMAL(15, 6) NOT NULL,
    bid DECIMAL(15, 6),
    ask DECIMAL(15, 6),
    bid_size INTEGER,
    ask_size INTEGER,
    volume BIGINT,
    day_open DECIMAL(15, 6),
    day_high DECIMAL(15, 6),
    day_low DECIMAL(15, 6),
    prev_close DECIMAL(15, 6),
    change DECIMAL(15, 6),
    change_percent DECIMAL(10, 4),
    data_source VARCHAR(20) DEFAULT 'alpaca',
    timestamp TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Symbol metadata table
CREATE TABLE IF NOT EXISTS market.symbols (
    symbol VARCHAR(10) PRIMARY KEY,
    name VARCHAR(255),
    exchange VARCHAR(20),
    type VARCHAR(20), -- stock, etf, crypto, forex
    sector VARCHAR(100),
    industry VARCHAR(100),
    market_cap BIGINT,
    is_active BOOLEAN DEFAULT true,
    tier INTEGER DEFAULT 3, -- 1=S&P500, 2=Russell3000, 3=All
    last_updated DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Data sync tracking table
CREATE TABLE IF NOT EXISTS market.sync_state (
    id SERIAL PRIMARY KEY,
    symbol VARCHAR(10),
    sync_type VARCHAR(20), -- daily, intraday, realtime
    last_sync_date DATE,
    last_sync_time TIMESTAMP,
    records_synced INTEGER,
    status VARCHAR(20), -- success, failed, partial
    error_message TEXT,
    environment VARCHAR(20), -- production, staging, development
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create read-only role for dev/staging (skip if already exists)
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'market_reader') THEN
        CREATE ROLE market_reader WITH LOGIN PASSWORD 'change_this_password';
    END IF;
END
$$;
GRANT CONNECT ON DATABASE postgres TO market_reader;
GRANT USAGE ON SCHEMA market TO market_reader;
GRANT SELECT ON ALL TABLES IN SCHEMA market TO market_reader;

-- Make sure future tables are also accessible
ALTER DEFAULT PRIVILEGES IN SCHEMA market GRANT SELECT ON TABLES TO market_reader;

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION market.update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for automatic timestamp updates
CREATE TRIGGER update_price_data_modtime
    BEFORE UPDATE ON market.price_data
    FOR EACH ROW EXECUTE FUNCTION market.update_modified_column();

CREATE TRIGGER update_latest_quotes_modtime
    BEFORE UPDATE ON market.latest_quotes
    FOR EACH ROW EXECUTE FUNCTION market.update_modified_column();

-- Partition strategy for scaling (optional, for when data grows)
-- This creates monthly partitions for price_data
-- Uncomment when ready to scale beyond 1M records

-- CREATE TABLE market.price_data_2025_01 PARTITION OF market.price_data
--     FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');
--
-- CREATE TABLE market.price_data_2025_02 PARTITION OF market.price_data
--     FOR VALUES FROM ('2025-02-01') TO ('2025-03-01');

-- Add comment documentation
COMMENT ON SCHEMA market IS 'Shared market data schema accessible across all environments';
COMMENT ON TABLE market.price_data IS 'Historical daily price data for all symbols';
COMMENT ON TABLE market.latest_quotes IS 'Real-time quote cache, updated every minute during market hours';
COMMENT ON TABLE market.symbols IS 'Symbol metadata and classification';
COMMENT ON TABLE market.sync_state IS 'Tracks data synchronization status per environment';