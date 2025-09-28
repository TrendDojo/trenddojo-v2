# TrendDojo Data Models & Database Schema

*Last updated: 2025-09-28*
*Extracted from: trenddojo-setup-technical-spec.md*

## Database Schema Overview

This document defines the complete database schema for TrendDojo, including all tables, relationships, and data structures used for trading, user management, market data, and screening functionality.

## Core User & Account Tables

### Users Table
Stores user authentication and subscription information.

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    subscription_tier VARCHAR(20) DEFAULT 'free', -- 'free', 'starter', 'basic', 'pro'
    subscription_status VARCHAR(20) DEFAULT 'active', -- 'active', 'cancelled', 'past_due'
    airwallex_customer_id VARCHAR(255),
    airwallex_payment_method_id VARCHAR(255),
    subscription_expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### Accounts Table
Trading accounts linked to users - supports multiple accounts per user.

```sql
CREATE TABLE accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    broker VARCHAR(50), -- 'alpaca', 'ibkr', 'manual'
    account_type VARCHAR(20), -- 'live', 'paper', 'tracking'
    base_currency VARCHAR(3) DEFAULT 'USD',
    starting_balance DECIMAL(15,2),
    current_balance DECIMAL(15,2),
    created_at TIMESTAMP DEFAULT NOW()
);
```

### Subscription Limits
Defines features and limits for each subscription tier.

```sql
CREATE TABLE subscription_limits (
    tier VARCHAR(20) PRIMARY KEY,
    max_accounts INTEGER,
    max_positions INTEGER,
    max_screener_results INTEGER,
    screener_refresh_seconds INTEGER,
    has_fundamentals BOOLEAN,
    has_realtime_data BOOLEAN,
    has_api_access BOOLEAN,
    has_broker_integration BOOLEAN,
    monthly_price DECIMAL(6,2)
);

-- Insert subscription tiers
INSERT INTO subscription_limits VALUES
('free', 1, 1, 5, 900, false, false, false, false, 0),        -- Very limited free
('starter', 2, 5, 25, 300, false, false, false, true, 4.99),  -- Easy entry point
('basic', 3, 15, 50, 60, true, false, false, true, 14.99),    -- Good value
('pro', 10, 100, 200, 5, true, true, true, true, 39.99);      -- Full features
```

## Risk Management Tables

### Risk Settings
Per-account risk management configuration.

```sql
CREATE TABLE risk_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    account_id UUID REFERENCES accounts(id) ON DELETE CASCADE,
    max_risk_per_trade DECIMAL(5,2) DEFAULT 1.0, -- percentage
    max_daily_risk DECIMAL(5,2) DEFAULT 3.0,
    max_weekly_risk DECIMAL(5,2) DEFAULT 6.0,
    max_open_positions INTEGER DEFAULT 5,
    max_correlated_positions INTEGER DEFAULT 3,
    position_sizing_method VARCHAR(20) DEFAULT 'fixed_risk', -- 'fixed_risk', 'kelly', 'fixed_units'
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### Broker Connections
Encrypted storage for broker API credentials.

```sql
CREATE TABLE broker_connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    broker VARCHAR(50), -- 'alpaca', 'td_ameritrade', 'interactive_brokers'
    credentials TEXT, -- Encrypted JSON
    is_paper BOOLEAN DEFAULT true,
    is_active BOOLEAN DEFAULT true,
    last_sync TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);
```

## Trading Tables

### Trades Table
Core table storing all trade information and position data.

```sql
CREATE TABLE trades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID REFERENCES accounts(id) ON DELETE CASCADE,
    symbol VARCHAR(20) NOT NULL,
    asset_type VARCHAR(20), -- 'stock', 'crypto', 'forex', 'option'
    direction VARCHAR(10), -- 'long', 'short'

    -- Position Grouping (for multiple positions same symbol)
    position_group_id UUID, -- Groups related positions (pyramiding)
    parent_trade_id UUID REFERENCES trades(id), -- For scale-in positions
    timeframe VARCHAR(20), -- '5min', '1h', '4h', '1d', '1w'
    position_label VARCHAR(100), -- User's custom label "AAPL Swing #1"

    -- Entry
    planned_entry DECIMAL(15,6),
    actual_entry DECIMAL(15,6),
    entry_date TIMESTAMP,
    quantity DECIMAL(15,6),
    position_size_usd DECIMAL(15,2),

    -- Risk Management
    stop_loss DECIMAL(15,6) NOT NULL,
    initial_stop DECIMAL(15,6), -- for tracking stop adjustments
    target_price DECIMAL(15,6),
    target_price_2 DECIMAL(15,6), -- optional second target
    risk_amount DECIMAL(15,2),
    risk_percent DECIMAL(5,2),
    risk_reward_ratio DECIMAL(5,2),

    -- Dynamic Position Sizing
    maintain_risk_on_stop_adjust BOOLEAN DEFAULT true,
    original_quantity DECIMAL(15,6), -- Before any adjustments
    stop_adjustment_history JSONB, -- Track all stop/size adjustments

    -- Broker Integration
    broker VARCHAR(50), -- 'alpaca', 'manual', etc
    broker_order_id VARCHAR(255),
    broker_sync_status VARCHAR(50), -- 'synced', 'pending', 'error', 'imported'
    broker_fill_price DECIMAL(15,6),
    broker_commission DECIMAL(10,2),

    -- Exit
    exit_price DECIMAL(15,6),
    exit_date TIMESTAMP,
    exit_reason VARCHAR(50), -- 'stop_loss', 'target', 'manual', 'trailing_stop'

    -- Results
    pnl_amount DECIMAL(15,2),
    pnl_percent DECIMAL(10,2),
    r_multiple DECIMAL(5,2), -- profit/initial_risk

    -- Status
    status VARCHAR(20), -- 'planning', 'pending', 'active', 'closed'

    -- Metadata
    strategy_type VARCHAR(50),
    setup_quality INTEGER CHECK (setup_quality BETWEEN 1 AND 5),
    market_condition VARCHAR(50), -- 'trending', 'ranging', 'volatile'

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### Trade Notes
Journal entries and notes for each trade.

```sql
CREATE TABLE trade_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trade_id UUID REFERENCES trades(id) ON DELETE CASCADE,
    note_type VARCHAR(20), -- 'entry', 'management', 'exit', 'review'
    content TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### Trade Checklist System
Customizable pre-trade checklist for each user.

```sql
CREATE TABLE trade_checklist_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    is_required BOOLEAN DEFAULT true,
    order_index INTEGER,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE trade_checklist_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trade_id UUID REFERENCES trades(id) ON DELETE CASCADE,
    checklist_item_id UUID REFERENCES trade_checklist_items(id),
    response BOOLEAN,
    created_at TIMESTAMP DEFAULT NOW()
);
```

## Market Data Tables

### Market Data Cache
Stores historical price data for backtesting and charting.

```sql
CREATE TABLE market_data_cache (
    symbol VARCHAR(20),
    timeframe VARCHAR(10), -- '15m', '1h', '4h', '1d', '1w', '1M'
    open DECIMAL(15,6),
    high DECIMAL(15,6),
    low DECIMAL(15,6),
    close DECIMAL(15,6),
    volume BIGINT,
    timestamp TIMESTAMP,
    PRIMARY KEY (symbol, timeframe, timestamp)
);
```

### Stock Fundamentals
Fundamental analysis data for stocks.

```sql
CREATE TABLE stock_fundamentals (
    symbol VARCHAR(20) PRIMARY KEY,
    market_cap BIGINT,
    pe_ratio DECIMAL(10,2),
    revenue_growth DECIMAL(10,2),
    profit_margin DECIMAL(10,2),
    debt_to_equity DECIMAL(10,2),
    roe DECIMAL(10,2),
    is_profitable BOOLEAN,
    sector VARCHAR(50),
    industry VARCHAR(100),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### Stock Technicals
Technical analysis indicators and metrics.

```sql
CREATE TABLE stock_technicals (
    symbol VARCHAR(20) PRIMARY KEY,
    price DECIMAL(15,6),
    volume_avg_20d BIGINT,
    atr_20d DECIMAL(15,6),
    rsi_14d DECIMAL(5,2),
    sma_20 DECIMAL(15,6),
    sma_50 DECIMAL(15,6),
    sma_200 DECIMAL(15,6),
    high_52w DECIMAL(15,6),
    low_52w DECIMAL(15,6),
    percent_from_high_52w DECIMAL(10,2),
    percent_from_low_52w DECIMAL(10,2),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

## Screener Tables

### Screener Presets
User-defined and public stock screening criteria.

```sql
CREATE TABLE screener_presets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    filters JSONB NOT NULL, -- Store filter criteria as JSON
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### Screener Results Cache
Cached results for screener queries.

```sql
CREATE TABLE screener_results_cache (
    preset_id UUID REFERENCES screener_presets(id) ON DELETE CASCADE,
    symbol VARCHAR(20),
    score DECIMAL(5,2),
    matches_at TIMESTAMP,
    PRIMARY KEY (preset_id, symbol)
);
```

## Database Indexes

Performance optimization indexes for frequent queries.

```sql
-- Trading indexes
CREATE INDEX idx_trades_account_status ON trades(account_id, status);
CREATE INDEX idx_trades_symbol ON trades(symbol);
CREATE INDEX idx_trades_entry_date ON trades(entry_date);

-- Market data indexes
CREATE INDEX idx_market_data_symbol_time ON market_data_cache(symbol, timestamp);
CREATE INDEX idx_market_data_timeframe ON market_data_cache(timeframe, timestamp);

-- Technical data indexes
CREATE INDEX idx_technicals_updated ON stock_technicals(updated_at);
CREATE INDEX idx_fundamentals_sector ON stock_fundamentals(sector);
```

## Development Seed Data

### Seed Script Structure

```typescript
// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Clear existing data
  await prisma.trade.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();

  // Create test users with different subscription tiers
  const users = await Promise.all([
    createUser('free@test.com', 'Free User', 'free'),
    createUser('starter@test.com', 'Starter User', 'starter'),
    createUser('basic@test.com', 'Basic User', 'basic'),
    createUser('pro@test.com', 'Pro User', 'pro'),
  ]);

  // Create accounts and trades for each user
  for (const user of users) {
    const account = await createAccount(user.id);
    await createTradesForAccount(account.id, user.subscription_tier);
    await createScreenerPresets(user.id);
  }

  // Seed market data
  await seedMarketData();

  console.log('✅ Seed completed!');
}
```

### Sample User Creation

```typescript
async function createUser(email: string, name: string, tier: string) {
  return prisma.user.create({
    data: {
      email,
      name,
      subscription_tier: tier,
      subscription_status: 'active',
      subscription_expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    }
  });
}
```

### Sample Trade Data

```typescript
async function createTradesForAccount(accountId: string, tier: string) {
  const tradeCount = tier === 'free' ? 2 : tier === 'starter' ? 5 : tier === 'basic' ? 15 : 50;
  const symbols = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'META', 'NVDA', 'SPY', 'QQQ', 'BTC'];

  // Create mix of active and closed trades
  for (let i = 0; i < tradeCount; i++) {
    const symbol = faker.helpers.arrayElement(symbols);
    const isActive = i < tradeCount / 2;
    const entryPrice = faker.number.float({ min: 50, max: 500, precision: 0.01 });
    const stopDistance = entryPrice * faker.number.float({ min: 0.02, max: 0.05 });
    const targetDistance = stopDistance * faker.number.float({ min: 1.5, max: 3 });

    await prisma.trade.create({
      data: {
        accountId,
        symbol,
        asset_type: symbol === 'BTC' ? 'crypto' : 'stock',
        direction: faker.helpers.arrayElement(['long', 'short']),
        timeframe: faker.helpers.arrayElement(['5m', '1h', '4h', '1d', '1w']),
        position_label: `${symbol} ${faker.word.adjective()} trade`,

        // Entry data
        planned_entry: entryPrice,
        actual_entry: entryPrice + faker.number.float({ min: -0.5, max: 0.5 }),
        entry_date: faker.date.recent({ days: isActive ? 5 : 30 }),
        quantity: faker.number.int({ min: 10, max: 1000 }),
        position_size_usd: entryPrice * faker.number.int({ min: 100, max: 5000 }),

        // Risk management
        stop_loss: entryPrice - stopDistance,
        initial_stop: entryPrice - stopDistance,
        target_price: entryPrice + targetDistance,
        risk_amount: faker.number.float({ min: 100, max: 500 }),
        risk_percent: faker.number.float({ min: 0.5, max: 2, precision: 0.1 }),
        risk_reward_ratio: targetDistance / stopDistance,

        // Status and metadata
        status: isActive ? 'active' : 'closed',
        strategy_type: faker.helpers.arrayElement(['breakout', 'pullback', 'trend', 'reversal']),
        setup_quality: faker.number.int({ min: 3, max: 5 }),
        market_condition: faker.helpers.arrayElement(['trending', 'ranging', 'volatile'])
      }
    });
  }
}
```

### Sample Screener Presets

```typescript
async function createScreenerPresets(userId: string) {
  const presets = [
    {
      name: 'Momentum Breakouts',
      description: 'Stocks breaking 52-week highs with volume',
      filters: {
        nearHigh52w: 5,
        volumeMin: 1000000,
        aboveSMA20: true,
        aboveSMA50: true
      },
      isPublic: true
    },
    {
      name: 'Oversold Bounce',
      description: 'RSI < 30 in uptrend',
      filters: {
        rsiMax: 30,
        aboveSMA200: true,
        priceMin: 10
      },
      isPublic: false
    },
    {
      name: 'Quality Growth',
      description: 'Profitable companies with growth',
      filters: {
        isProfitable: true,
        revenueGrowthMin: 15,
        peMax: 30,
        marketCapMin: 1000000000
      },
      isPublic: true
    }
  ];

  for (const preset of presets) {
    await prisma.screenerPresets.create({
      data: {
        userId,
        ...preset
      }
    });
  }
}
```

## Key Relationships

1. **Users → Accounts** (1:many): Users can have multiple trading accounts
2. **Accounts → Trades** (1:many): Each account contains multiple trades
3. **Trades → Trade Notes** (1:many): Each trade can have multiple journal entries
4. **Users → Screener Presets** (1:many): Users can create custom screeners
5. **Users → Trade Checklist Items** (1:many): Custom pre-trade checklists per user

## Data Validation Rules

1. **Trade Validation**:
   - Stop loss must be appropriate for direction (below entry for longs, above for shorts)
   - Risk amount cannot exceed account balance
   - Position size must be positive
   - Dates must be logical (entry before exit)

2. **Risk Management**:
   - Risk percentages must be between 0.1% and 10%
   - Position counts respect subscription limits
   - Account balance cannot go negative

3. **Market Data**:
   - OHLC data must be logically consistent (high ≥ open/close, low ≤ open/close)
   - Timestamps must be valid market hours for the asset type
   - Volume must be non-negative

---

*See also:*
- [Architecture](./ARCHITECTURE.md) - System architecture and tech stack
- [API Specification](./API_SPECIFICATION.md) - API endpoints using this data
- [Broker Integration](../BROKER_INTEGRATION.md) - External data sources