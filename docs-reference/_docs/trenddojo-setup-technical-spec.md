# TrendDojo Beta - Complete Technical Specification

## Architecture Decision

**Stack:**
- **Frontend**: Next.js 14+ (App Router)
- **Backend**: Next.js API Routes + tRPC for type safety
- **Database**: PostgreSQL with Prisma ORM
- **Auth**: NextAuth.js (Auth.js)
- **Hosting**: Vercel (frontend) + Supabase/Neon (PostgreSQL)
- **Market Data**: Yahoo Finance (free) initially, upgrade path to Polygon.io
- **Charts**: Recharts for simple charts (no TradingView in beta)
- **Payments**: Airwallex (not Stripe)
- **Testing**: Vitest + Playwright + React Testing Library
- **State**: Zustand for client state
- **UI**: Tailwind + Shadcn/ui components + Framer Motion for animations

## Database Schema

```sql
-- Core Tables
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    subscription_tier VARCHAR(20) DEFAULT 'free', -- 'free', 'basic', 'pro'
    subscription_status VARCHAR(20) DEFAULT 'active', -- 'active', 'cancelled', 'past_due'
    airwallex_customer_id VARCHAR(255),
    airwallex_payment_method_id VARCHAR(255),
    subscription_expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

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

-- Insert revised tiers (very limited free, easy first paid tier)
INSERT INTO subscription_limits VALUES
('free', 1, 1, 5, 900, false, false, false, false, 0),        -- Very limited free
('starter', 2, 5, 25, 300, false, false, false, true, 4.99),  -- Easy entry point
('basic', 3, 15, 50, 60, true, false, false, true, 14.99),    -- Good value
('pro', 10, 100, 200, 5, true, true, true, true, 39.99);      -- Full features

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

CREATE TABLE trade_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trade_id UUID REFERENCES trades(id) ON DELETE CASCADE,
    note_type VARCHAR(20), -- 'entry', 'management', 'exit', 'review'
    content TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

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

-- Market Data Tables
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

-- Create indexes for efficient queries
CREATE INDEX idx_market_data_symbol_time ON market_data_cache(symbol, timestamp);
CREATE INDEX idx_market_data_timeframe ON market_data_cache(timeframe, timestamp);

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

-- Screener Tables
CREATE TABLE screener_presets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    filters JSONB NOT NULL, -- Store filter criteria as JSON
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE screener_results_cache (
    preset_id UUID REFERENCES screener_presets(id) ON DELETE CASCADE,
    symbol VARCHAR(20),
    score DECIMAL(5,2),
    matches_at TIMESTAMP,
    PRIMARY KEY (preset_id, symbol)
);

-- Indexes
CREATE INDEX idx_trades_account_status ON trades(account_id, status);
CREATE INDEX idx_trades_symbol ON trades(symbol);
CREATE INDEX idx_trades_entry_date ON trades(entry_date);
CREATE INDEX idx_market_data_symbol_time ON market_data_cache(symbol, timestamp);
CREATE INDEX idx_technicals_updated ON stock_technicals(updated_at);
CREATE INDEX idx_fundamentals_sector ON stock_fundamentals(sector);
```

## API Structure (tRPC Routes)

```typescript
// src/server/api/routers/trade.ts
export const tradeRouter = {
  
  // Position Sizing Calculator (with validation and broker integration)
  calculatePosition: procedure
    .input(z.object({
      accountBalance: z.number(),
      riskPercent: z.number(),
      entryPrice: z.number(),
      stopLoss: z.number(),
      targetPrice: z.number().optional(),
      assetType: z.enum(['stock', 'crypto', 'forex']),
      direction: z.enum(['long', 'short'])
    }))
    .mutation(async ({ input, ctx }) => {
      // STOP LOSS VALIDATION
      if (input.direction === 'long' && input.stopLoss >= input.entryPrice) {
        throw new Error('Stop loss must be below entry price for long positions');
      }
      if (input.direction === 'short' && input.stopLoss <= input.entryPrice) {
        throw new Error('Stop loss must be above entry price for short positions');
      }
      
      // Validate stop is not too tight (less than 0.5% away)
      const stopDistance = Math.abs(input.entryPrice - input.stopLoss);
      const stopPercent = (stopDistance / input.entryPrice) * 100;
      
      if (stopPercent < 0.5) {
        return {
          warning: 'Stop loss is very tight (< 0.5%). Consider wider stop or smaller position.',
          requiresConfirmation: true,
          // Still calculate but flag it
        };
      }
      
      // Check subscription limits
      const user = await prisma.user.findUnique({
        where: { id: ctx.session.user.id }
      });
      
      const limits = await prisma.subscriptionLimits.findUnique({
        where: { tier: user.subscription_tier }
      });
      
      const activePositions = await prisma.trade.count({
        where: {
          account: { userId: ctx.session.user.id },
          status: 'active'
        }
      });
      
      if (activePositions >= limits.max_positions) {
        throw new Error(`Position limit reached. Upgrade to add more than ${limits.max_positions} positions.`);
      }
      
      // POSITION SIZE CALCULATION
      const riskAmount = input.accountBalance * (input.riskPercent / 100);
      
      let positionSize;
      switch(input.assetType) {
        case 'stock':
          positionSize = Math.floor(riskAmount / stopDistance);
          break;
        case 'crypto':
          positionSize = riskAmount / stopDistance;
          break;
        case 'forex':
          positionSize = calculateForexPosition(riskAmount, stopDistance);
          break;
      }
      
      const positionValue = positionSize * input.entryPrice;
      
      // ADDITIONAL VALIDATIONS
      const warnings = [];
      
      // Warn if position is > 30% of account
      if (positionValue > input.accountBalance * 0.3) {
        warnings.push('Position size exceeds 30% of account balance');
      }
      
      // Warn if risk per trade > 3%
      if (input.riskPercent > 3) {
        warnings.push('Risk per trade exceeds 3% - consider reducing');
      }
      
      // Calculate R:R ratio
      const riskRewardRatio = input.targetPrice 
        ? Math.abs(input.targetPrice - input.entryPrice) / stopDistance 
        : null;
      
      // Warn if R:R < 1.5
      if (riskRewardRatio && riskRewardRatio < 1.5) {
        warnings.push('Risk/Reward ratio is less than 1.5:1');
      }
      
      return {
        positionSize,
        positionValue,
        riskAmount,
        stopPercent,
        riskRewardRatio,
        warnings,
        // Include these for display
        stopDistance,
        potentialProfit: input.targetPrice 
          ? (input.targetPrice - input.entryPrice) * positionSize 
          : null,
        // Commission estimate (if broker connected)
        estimatedCommission: await estimateCommission(positionSize, input.assetType)
      };
    }),

  // Pre-trade Validation with Multiple Position Support
  validateEntry: procedure
    .input(z.object({
      accountId: z.string(),
      symbol: z.string(),
      proposedRisk: z.number(),
      timeframe: z.string(),
      direction: z.enum(['long', 'short'])
    }))
    .query(async ({ input, ctx }) => {
      const warnings = [];
      const errors = [];
      
      // Check daily risk limit
      const todayRisk = await getTodayRiskTotal(accountId);
      if (todayRisk + proposedRisk > settings.maxDailyRisk) {
        errors.push('Exceeds daily risk limit');
      }
      
      // Check for existing positions on same symbol
      const sameSymbolPositions = await prisma.trade.findMany({
        where: {
          accountId: input.accountId,
          symbol: input.symbol,
          status: 'active'
        }
      });
      
      if (sameSymbolPositions.length > 0) {
        const oppositeDirection = sameSymbolPositions.find(
          p => p.direction !== input.direction
        );
        if (oppositeDirection) {
          warnings.push(`Opposite ${oppositeDirection.direction} position exists`);
        }
        
        const positionInfo = sameSymbolPositions.map(p => 
          `${p.direction} on ${p.timeframe}`
        ).join(', ');
        warnings.push(`Existing positions: ${positionInfo}`);
      }
      
      // Check correlation
      const correlatedPositions = await getCorrelatedPositions(symbol);
      if (correlatedPositions.length >= settings.maxCorrelated) {
        warnings.push(`${correlatedPositions.length} correlated positions open`);
      }
      
      // Check position count
      const openPositions = await getOpenPositionCount(accountId);
      if (openPositions >= settings.maxOpenPositions) {
        warnings.push('At maximum position count');
      }
      
      return { 
        warnings, 
        errors, 
        canTrade: errors.length === 0,
        existingPositions: sameSymbolPositions
      };
    }),

  // Create Trade
  createTrade: procedure
    .input(TradeCreateSchema)
    .mutation(async ({ input, ctx }) => {
      // Validate checklist completed
      const checklistComplete = await validateChecklist(input.checklistResponses);
      if (!checklistComplete) {
        throw new Error('Must complete required checklist items');
      }
      
      // Validate risk limits
      const validation = await validateEntry(input);
      if (validation.errors.length > 0) {
        throw new Error(validation.errors.join(', '));
      }
      
      // Create trade record
      const trade = await prisma.trade.create({
        data: {
          ...input,
          status: 'pending',
          initial_stop: input.stopLoss,
          riskAmount: calculateRiskAmount(input),
          riskRewardRatio: calculateRR(input)
        }
      });
      
      return trade;
    }),

  // Update Position (with stop ratchet validation)
  updatePosition: procedure
    .input(z.object({
      tradeId: z.string(),
      updates: z.object({
        stopLoss: z.number().optional(),
        targetPrice: z.number().optional(),
        notes: z.string().optional()
      })
    }))
    .mutation(async ({ input }) => {
      const trade = await getTrade(input.tradeId);
      
      // Validate stop only moves in profit direction
      if (input.updates.stopLoss) {
        if (trade.direction === 'long' && input.updates.stopLoss < trade.stopLoss) {
          throw new Error('Cannot move stop lower on long position');
        }
        if (trade.direction === 'short' && input.updates.stopLoss > trade.stopLoss) {
          throw new Error('Cannot move stop higher on short position');
        }
      }
      
      return await prisma.trade.update({
        where: { id: input.tradeId },
        data: input.updates
      });
    }),

  // Get Dashboard Data
  getDashboard: procedure
    .input(z.object({ accountId: z.string() }))
    .query(async ({ input }) => {
      const [activePositions, stats, riskMetrics] = await Promise.all([
        getActivePositions(input.accountId),
        getAccountStats(input.accountId),
        getCurrentRiskMetrics(input.accountId)
      ]);
      
      // Enrich positions with current prices
      const enrichedPositions = await Promise.all(
        activePositions.map(async (pos) => {
          const currentPrice = await marketData.getCurrentPrice(pos.symbol);
          const unrealizedPnl = calculatePnL(pos, currentPrice);
          return { ...pos, currentPrice, unrealizedPnl };
        })
      );
      
      return {
        activePositions: enrichedPositions,
        totalRiskAmount: riskMetrics.totalRisk,
        totalRiskPercent: riskMetrics.totalRiskPercent,
        dailyRiskUsed: riskMetrics.dailyUsed,
        weeklyRiskUsed: riskMetrics.weeklyUsed,
        stats: {
          winRate: stats.winRate,
          avgRMultiple: stats.avgR,
          profitFactor: stats.profitFactor,
          currentStreak: stats.streak
        }
      };
    })
};

// src/server/api/routers/screener.ts
export const screenerRouter = {
  
  // Run screener with filters (tier-based limits)
  runScreener: procedure
    .input(z.object({
      filters: z.object({
        // Price filters
        priceMin: z.number().optional(),
        priceMax: z.number().optional(),
        volumeMin: z.number().optional(),
        
        // Technical filters
        aboveSMA20: z.boolean().optional(),
        aboveSMA50: z.boolean().optional(),
        aboveSMA200: z.boolean().optional(),
        nearHigh52w: z.number().optional(), // within X%
        nearLow52w: z.number().optional(),
        rsiMin: z.number().optional(),
        rsiMax: z.number().optional(),
        atrMin: z.number().optional(),
        atrMax: z.number().optional(),
        
        // Fundamental filters (pro only)
        marketCapMin: z.number().optional(),
        isProfitable: z.boolean().optional(),
        peMax: z.number().optional(),
        revenueGrowthMin: z.number().optional(),
        sectors: z.array(z.string()).optional(),
        
        // Risk filters
        maxCorrelation: z.number().optional(),
        excludeExisting: z.boolean().optional(),
        fitRiskBudget: z.boolean().optional()
      }),
      accountId: z.string(),
      limit: z.number().default(50)
    }))
    .query(async ({ input, ctx }) => {
      // Check subscription for screener access
      const user = await prisma.user.findUnique({
        where: { id: ctx.session.user.id }
      });
      
      const limits = await prisma.subscriptionLimits.findUnique({
        where: { tier: user.subscription_tier }
      });
      
      // Check if fundamentals are requested
      const hasFundamentalFilters = input.filters.marketCapMin || 
        input.filters.isProfitable !== undefined ||
        input.filters.peMax ||
        input.filters.revenueGrowthMin ||
        input.filters.sectors;
      
      if (hasFundamentalFilters && !limits.has_fundamentals) {
        throw new Error('Fundamental filters require Basic or Pro subscription');
      }
      
      // Limit results based on tier
      const maxResults = Math.min(input.limit, limits.max_screener_results);
      
      // Rate limit based on tier
      const lastScreener = await getLastScreenerTime(ctx.session.user.id);
      if (lastScreener && Date.now() - lastScreener < limits.screener_refresh_seconds * 1000) {
        throw new Error(`Please wait ${limits.screener_refresh_seconds} seconds between searches`);
      }
      
      let query = prisma.$queryRaw`
        SELECT 
          t.symbol,
          t.price,
          t.volume_avg_20d,
          t.atr_20d,
          t.rsi_14d,
          t.percent_from_high_52w,
          f.market_cap,
          f.pe_ratio,
          f.sector,
          f.is_profitable
        FROM stock_technicals t
        LEFT JOIN stock_fundamentals f ON t.symbol = f.symbol
        WHERE 1=1
      `;
      
      // Apply filters...
      const results = await query;
      
      // Return limited results
      return results.slice(0, maxResults);
    }),
      
      // Calculate position sizing for each result
      const account = await getAccount(input.accountId);
      const enrichedResults = results.map(stock => {
        const stopDistance = stock.atr_20d * 2; // 2 ATR stop
        const positionSize = calculatePositionSize(
          account.currentBalance,
          1.0, // 1% risk
          stock.price,
          stock.price - stopDistance
        );
        
        return {
          ...stock,
          suggestedStop: stock.price - stopDistance,
          suggestedTarget: stock.price + (stopDistance * 2),
          positionSize,
          riskRewardRatio: 2.0
        };
      });
      
      return enrichedResults;
    }),

  // Save screener preset
  savePreset: procedure
    .input(z.object({
      name: z.string(),
      description: z.string().optional(),
      filters: z.any(), // JSON object
      isPublic: z.boolean().default(false)
    }))
    .mutation(async ({ input, ctx }) => {
      return await prisma.screenerPresets.create({
        data: {
          userId: ctx.session.user.id,
          name: input.name,
          description: input.description,
          filters: input.filters,
          isPublic: input.isPublic
        }
      });
    }),

  // Get user's saved presets
  getPresets: procedure
    .query(async ({ ctx }) => {
      return await prisma.screenerPresets.findMany({
        where: {
          OR: [
            { userId: ctx.session.user.id },
            { isPublic: true }
          ]
        }
      });
    })
};

// src/server/api/routers/subscription.ts (AIRWALLEX IMPLEMENTATION)
export const subscriptionRouter = {
  
  // Get current subscription status
  getStatus: procedure
    .query(async ({ ctx }) => {
      const user = await prisma.user.findUnique({
        where: { id: ctx.session.user.id },
        include: {
          subscriptionLimits: true
        }
      });
      
      return {
        tier: user.subscription_tier,
        status: user.subscription_status,
        expiresAt: user.subscription_expires_at,
        limits: user.subscriptionLimits
      };
    }),
  
  // Create Airwallex payment session
  createCheckout: procedure
    .input(z.object({
      tier: z.enum(['basic', 'pro']),
      annual: z.boolean().default(false)
    }))
    .mutation(async ({ input, ctx }) => {
      // Initialize Airwallex
      const paymentIntent = await airwallex.paymentIntents.create({
        amount: input.tier === 'basic' 
          ? (input.annual ? 9999 : 999) 
          : (input.annual ? 29999 : 2999),
        currency: 'USD',
        merchant_order_id: `sub_${ctx.session.user.id}_${Date.now()}`,
        metadata: {
          userId: ctx.session.user.id,
          tier: input.tier,
          annual: input.annual
        },
        return_url: `${process.env.NEXTAUTH_URL}/subscription/confirm`
      });
      
      // Create hosted payment page
      const hostedPaymentPage = await airwallex.hostedPaymentPage.create({
        payment_intent_id: paymentIntent.id,
        customer_email: ctx.session.user.email,
        theme: {
          primary_color: '#6366f1',
          page_title: 'TrendDojo Subscription'
        }
      });
      
      return { url: hostedPaymentPage.url };
    }),
  
  // Handle Airwallex webhook
  handleWebhook: procedure
    .input(z.any())
    .mutation(async ({ input }) => {
      // Verify webhook signature
      const signature = input.headers['x-signature'];
      const isValid = airwallex.webhooks.verify(
        input.body,
        signature,
        process.env.AIRWALLEX_WEBHOOK_SECRET
      );
      
      if (!isValid) {
        throw new Error('Invalid webhook signature');
      }
      
      const event = input.body;
      
      switch (event.name) {
        case 'payment_intent.succeeded':
          const metadata = event.data.object.metadata;
          await prisma.user.update({
            where: { id: metadata.userId },
            data: {
              subscription_tier: metadata.tier,
              subscription_status: 'active',
              airwallex_customer_id: event.data.object.customer_id,
              subscription_expires_at: metadata.annual 
                ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
                : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            }
          });
          break;
          
        case 'payment_intent.failed':
          // Handle failed payment
          break;
      }
    })
};

// src/server/api/routers/marketData.ts
export const marketDataRouter = {
  
  // Get price history for charting
  getPriceHistory: procedure
    .input(z.object({
      symbol: z.string(),
      timeframe: z.enum(['5m', '15m', '1h', '4h', '1d', '1w']),
      limit: z.number().default(100)
    }))
    .query(async ({ input }) => {
      // Check cache first
      const cached = await prisma.marketDataCache.findMany({
        where: {
          symbol: input.symbol,
          timeframe: input.timeframe
        },
        orderBy: { timestamp: 'desc' },
        take: input.limit
      });
      
      if (cached.length >= input.limit) {
        return cached;
      }
      
      // Fetch from data provider
      const data = await fetchFromProvider(input.symbol, input.timeframe);
      
      // Cache the data
      await prisma.marketDataCache.createMany({
        data: data.map(candle => ({
          symbol: input.symbol,
          timeframe: input.timeframe,
          ...candle
        }))
      });
      
      return data;
    }),

  // Update all technical indicators (cron job)
  updateTechnicals: procedure
    .mutation(async () => {
      const symbols = await prisma.trades.findMany({
        where: { status: 'active' },
        select: { symbol: true },
        distinct: ['symbol']
      });
      
      for (const { symbol } of symbols) {
        const data = await fetchTechnicalData(symbol);
        await prisma.stockTechnicals.upsert({
          where: { symbol },
          create: { symbol, ...data },
          update: data
        });
      }
    })
};
```

## Brochure/Marketing Website Components

```typescript
// src/app/(marketing)/layout.tsx
// Separate layout for marketing pages with Polygon.io-inspired design
export default function MarketingLayout({ children }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
      <MarketingNav />
      {children}
      <MarketingFooter />
    </div>
  );
}

// src/app/(marketing)/page.tsx - Landing Page
const LandingPage: React.FC = () => {
  return (
    <>
      {/* Hero Section with animated polygons */}
      <section className="relative overflow-hidden">
        <AnimatedPolygonBackground />
        <div className="relative z-10 container mx-auto px-6 py-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-6xl font-bold text-white mb-6">
              Trade with <span className="text-indigo-400">Discipline</span>
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Professional position sizing, risk management, and trade journaling 
              for serious traders who want consistent results.
            </p>
            <div className="flex gap-4 justify-center">
              <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700">
                Start Free Trial
              </Button>
              <Button size="lg" variant="outline" className="text-white border-white">
                View Demo
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-slate-900/50">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold text-center text-white mb-12">
            Built for Traders, by Traders
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <FeatureCard 
                key={index}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                delay={index * 0.1}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Live Data Showcase */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-3xl font-bold text-white mb-6">
                Real-Time Market Data
              </h3>
              <p className="text-gray-300 mb-4">
                Connect to institutional-grade data feeds. Get accurate prices, 
                live charts, and instant position calculations.
              </p>
              <ul className="space-y-3">
                {dataFeatures.map(item => (
                  <li key={item} className="flex items-center text-gray-300">
                    <CheckCircle className="w-5 h-5 text-green-400 mr-3" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative">
              <LiveDataDemo />
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Demo */}
      <section className="py-20 bg-slate-900/50">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold text-center text-white mb-12">
            Try It Now
          </h2>
          <InteractivePositionCalculator />
        </div>
      </section>

      {/* Testimonials */}
      <TestimonialsCarousel />

      {/* Pricing */}
      <PricingSection />

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-indigo-600 to-purple-600">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Start Trading with Confidence
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Join thousands of traders who've improved their consistency
          </p>
          <Button size="lg" className="bg-white text-indigo-600 hover:bg-gray-100">
            Get Started Free
          </Button>
        </div>
      </section>
    </>
  );
};

// src/components/marketing/AnimatedPolygonBackground.tsx
const AnimatedPolygonBackground: React.FC = () => {
  return (
    <div className="absolute inset-0">
      <svg className="w-full h-full" viewBox="0 0 1200 800">
        {/* Animated polygons using Framer Motion */}
        {polygons.map((poly, i) => (
          <motion.polygon
            key={i}
            points={poly.points}
            fill={poly.fill}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ 
              opacity: [0.3, 0.6, 0.3],
              scale: [1, 1.1, 1]
            }}
            transition={{
              duration: 4,
              delay: i * 0.2,
              repeat: Infinity
            }}
          />
        ))}
      </svg>
    </div>
  );
};

// src/components/marketing/LiveDataDemo.tsx
const LiveDataDemo: React.FC = () => {
  const [price, setPrice] = useState(145.32);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setPrice(prev => prev + (Math.random() - 0.5) * 0.5);
    }, 2000);
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
      <div className="flex justify-between items-center mb-4">
        <span className="text-white font-semibold">AAPL</span>
        <span className="text-green-400 text-2xl font-mono">
          ${price.toFixed(2)}
        </span>
      </div>
      <MiniChart data={generateMockData(price)} />
      <div className="grid grid-cols-3 gap-4 mt-4">
        <div>
          <p className="text-gray-400 text-sm">Position Size</p>
          <p className="text-white font-bold">342 shares</p>
        </div>
        <div>
          <p className="text-gray-400 text-sm">Risk</p>
          <p className="text-white font-bold">1.5%</p>
        </div>
        <div>
          <p className="text-gray-400 text-sm">R:R</p>
          <p className="text-white font-bold">1:2.5</p>
        </div>
      </div>
    </div>
  );
};

// src/app/(marketing)/docs/page.tsx - Documentation
const DocsPage: React.FC = () => {
  return (
    <div className="container mx-auto px-6 py-12">
      <div className="grid lg:grid-cols-4 gap-8">
        <DocsSidebar />
        <main className="lg:col-span-3">
          <DocsContent />
        </main>
      </div>
    </div>
  );
};

// src/app/(marketing)/blog/page.tsx - Blog/Tutorials
const BlogPage: React.FC = () => {
  return (
    <div className="container mx-auto px-6 py-12">
      <h1 className="text-4xl font-bold text-white mb-8">
        Trading Insights & Tutorials
      </h1>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map(post => (
          <BlogCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
};

```typescript
// src/components/subscription/PricingCard.tsx
const PricingCard: React.FC<{ tier: 'free' | 'basic' | 'pro' }> = ({ tier }) => {
  const { mutate: checkout } = api.subscription.createCheckout.useMutation({
    onSuccess: (data) => {
      window.location.href = data.url;
    }
  });
  
  const features = {
    free: [
      '3 active positions',
      '1 account',
      '20 screener results',
      '5 minute data refresh',
      'Basic charts'
    ],
    basic: [
      '10 active positions',
      '3 accounts',
      '50 screener results',
      '1 minute data refresh',
      'Fundamental data',
      'Email alerts'
    ],
    pro: [
      'Unlimited positions',
      '10 accounts',
      '200 screener results',
      'Real-time data',
      'All fundamentals',
      'API access',
      'Priority support'
    ]
  };
  
  const prices = {
    free: 0,
    basic: 9.99,
    pro: 29.99
  };
  
  return (
    <Card className={tier === 'basic' ? 'border-blue-500 border-2' : ''}>
      <CardHeader>
        <h3 className="text-2xl font-bold capitalize">{tier}</h3>
        <p className="text-3xl font-bold">
          ${prices[tier]}
          {tier !== 'free' && <span className="text-sm">/month</span>}
        </p>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {features[tier].map(feature => (
            <li key={feature} className="flex items-center">
              <Check className="w-4 h-4 mr-2 text-green-500" />
              {feature}
            </li>
          ))}
        </ul>
        
        {tier !== 'free' && (
          <Button 
            className="w-full mt-4"
            onClick={() => checkout({ tier, annual: false })}
          >
            Start {tier === 'basic' ? '7-day' : '14-day'} Free Trial
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

// src/components/subscription/UpgradePrompt.tsx
const UpgradePrompt: React.FC<{ feature: string }> = ({ feature }) => {
  return (
    <Alert className="border-amber-500">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Upgrade Required</AlertTitle>
      <AlertDescription>
        {feature} requires a Pro subscription.
        <Link href="/pricing" className="ml-2 underline">
          View pricing →
        </Link>
      </AlertDescription>
    </Alert>
  );
};

// src/components/subscription/UsageBar.tsx
const UsageBar: React.FC = () => {
  const { data: status } = api.subscription.getStatus.useQuery();
  
  if (!status) return null;
  
  const { data: usage } = api.trade.getUsage.useQuery();
  
  return (
    <div className="bg-gray-100 p-4 rounded-lg">
      <div className="flex justify-between mb-2">
        <span className="text-sm font-medium">Positions Used</span>
        <span className="text-sm">
          {usage?.activePositions} / {status.limits.max_positions}
        </span>
      </div>
      <Progress 
        value={(usage?.activePositions / status.limits.max_positions) * 100}
        className={usage?.activePositions >= status.limits.max_positions ? 'bg-red-500' : ''}
      />
      
      {usage?.activePositions >= status.limits.max_positions * 0.8 && (
        <p className="text-xs text-amber-600 mt-2">
          Approaching position limit. 
          <Link href="/pricing" className="underline ml-1">
            Upgrade for more
          </Link>
        </p>
      )}
    </div>
  );
};

// src/components/position-sizer/PositionSizer.tsx (updated with limits)
const PositionSizer: React.FC = ({ accountBalance, symbol }) => {
  const [entry, setEntry] = useState('');
  const [stop, setStop] = useState('');
  const [target, setTarget] = useState('');
  const [riskPercent, setRiskPercent] = useState(1.0);
  
  const { mutate: calculate } = api.trade.calculatePosition.useMutation({
    onSuccess: (data) => {
      positionStore.setCalculation(data);
      toast.success(`Position: ${data.positionSize} units`);
    }
  });
  
  return (
    <Card>
      <CardHeader>Position Calculator</CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <Input 
            label="Entry Price"
            value={entry}
            onChange={setEntry}
            type="number"
            step="0.01"
          />
          <Input 
            label="Stop Loss"
            value={stop}
            onChange={setStop}
            type="number"
            step="0.01"
          />
          <Input 
            label="Target (Optional)"
            value={target}
            onChange={setTarget}
            type="number"
            step="0.01"
          />
          <Slider
            label={`Risk: ${riskPercent}%`}
            min={0.25}
            max={3}
            step={0.25}
            value={riskPercent}
            onChange={setRiskPercent}
          />
          <Button onClick={() => calculate({
            accountBalance,
            riskPercent,
            entryPrice: parseFloat(entry),
            stopLoss: parseFloat(stop),
            targetPrice: target ? parseFloat(target) : null
          })}>
            Calculate Position
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

// src/components/positions/PositionChart.tsx
const PositionChart: React.FC<{ position: Position }> = ({ position }) => {
  const { data: priceHistory } = api.marketData.getPriceHistory.useQuery({
    symbol: position.symbol,
    timeframe: position.timeframe || '1h',
    limit: 100
  });
  
  if (!priceHistory) return <Skeleton />;
  
  // Format data for Recharts
  const chartData = priceHistory.map(candle => ({
    time: format(candle.timestamp, 'HH:mm'),
    price: candle.close,
    high: candle.high,
    low: candle.low
  }));
  
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="time" />
        <YAxis domain={['dataMin - 5', 'dataMax + 5']} />
        <Tooltip />
        
        {/* Price line */}
        <Line 
          type="monotone" 
          dataKey="price" 
          stroke="#8884d8" 
          dot={false}
          strokeWidth={2}
        />
        
        {/* Entry line */}
        <ReferenceLine 
          y={position.entryPrice} 
          stroke="green" 
          strokeWidth={2}
          label={{ value: "Entry", position: "right" }}
        />
        
        {/* Stop loss line */}
        <ReferenceLine 
          y={position.stopLoss} 
          stroke="red" 
          strokeWidth={2}
          strokeDasharray="5 5"
          label={{ value: "Stop", position: "right" }}
        />
        
        {/* Target line */}
        {position.targetPrice && (
          <ReferenceLine 
            y={position.targetPrice} 
            stroke="blue" 
            strokeWidth={2}
            label={{ value: "Target", position: "right" }}
          />
        )}
        
        {/* Risk zone (entry to stop) */}
        <ReferenceArea 
          y1={position.entryPrice} 
          y2={position.stopLoss} 
          fill="red" 
          fillOpacity={0.1}
        />
        
        {/* Profit zone (entry to target) */}
        {position.targetPrice && (
          <ReferenceArea 
            y1={position.entryPrice} 
            y2={position.targetPrice} 
            fill="green" 
            fillOpacity={0.1}
          />
        )}
      </LineChart>
    </ResponsiveContainer>
  );
};

// src/components/positions/ActivePositions.tsx
const ActivePositions: React.FC = () => {
  const { data: positions } = api.trade.getActive.useQuery();
  
  return (
    <div className="grid gap-4">
      {positions?.map(position => (
        <PositionCard key={position.id}>
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="font-bold text-lg">
                {position.symbol} - {position.position_label || position.timeframe}
              </h3>
              <p className="text-sm text-gray-500">
                Entry: ${position.entryPrice} | Size: {position.quantity}
              </p>
            </div>
            <PnLDisplay
              amount={position.unrealizedPnl}
              percent={position.unrealizedPnlPercent}
              rMultiple={position.currentRMultiple}
            />
          </div>
          
          {/* Chart with overlays */}
          <PositionChart position={position} />
          
          <div className="mt-4 grid grid-cols-3 gap-2 text-sm">
            <div>
              <span className="text-gray-500">To Stop:</span>
              <span className="ml-2 font-mono">
                {position.percentToStop.toFixed(2)}%
              </span>
            </div>
            <div>
              <span className="text-gray-500">To Target:</span>
              <span className="ml-2 font-mono">
                {position.percentToTarget.toFixed(2)}%
              </span>
            </div>
            <div>
              <span className="text-gray-500">R-Multiple:</span>
              <span className="ml-2 font-mono">
                {position.currentRMultiple.toFixed(2)}R
              </span>
            </div>
          </div>
          
          <div className="mt-4 flex gap-2">
            <Button size="sm" onClick={() => adjustStop(position)}>
              Adjust Stop
            </Button>
            <Button size="sm" variant="outline">
              Add Note
            </Button>
            <Button 
              size="sm" 
              variant="destructive"
              onClick={() => closePosition(position.id)}
            >
              Close Position
            </Button>
          </div>
        </PositionCard>
      ))}
    </div>
  );
};

// src/components/screener/Screener.tsx
const Screener: React.FC = () => {
  const [filters, setFilters] = useState<ScreenerFilters>({
    priceMin: 5,
    priceMax: 500,
    volumeMin: 100000,
    aboveSMA50: true,
    excludeExisting: true
  });
  
  const { data: results, refetch } = api.screener.runScreener.useQuery({
    filters,
    accountId: currentAccount.id
  });
  
  const { data: presets } = api.screener.getPresets.useQuery();
  
  return (
    <div className="space-y-4">
      {/* Filter Controls */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Stock Screener</h2>
            <Select 
              value={selectedPreset}
              onChange={(preset) => setFilters(preset.filters)}
            >
              <option value="">Custom</option>
              {presets?.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            {/* Price Filters */}
            <div>
              <Label>Price Range</Label>
              <div className="flex gap-2">
                <Input 
                  type="number"
                  placeholder="Min"
                  value={filters.priceMin}
                  onChange={(e) => setFilters({
                    ...filters,
                    priceMin: parseFloat(e.target.value)
                  })}
                />
                <Input 
                  type="number"
                  placeholder="Max"
                  value={filters.priceMax}
                  onChange={(e) => setFilters({
                    ...filters,
                    priceMax: parseFloat(e.target.value)
                  })}
                />
              </div>
            </div>
            
            {/* Technical Filters */}
            <div>
              <Label>Technical</Label>
              <div className="space-y-2">
                <Checkbox
                  label="Above 50 SMA"
                  checked={filters.aboveSMA50}
                  onChange={(checked) => setFilters({
                    ...filters,
                    aboveSMA50: checked
                  })}
                />
                <Checkbox
                  label="Above 200 SMA"
                  checked={filters.aboveSMA200}
                  onChange={(checked) => setFilters({
                    ...filters,
                    aboveSMA200: checked
                  })}
                />
              </div>
            </div>
            
            {/* Risk Filters */}
            <div>
              <Label>Risk Management</Label>
              <Checkbox
                label="Exclude existing positions"
                checked={filters.excludeExisting}
                onChange={(checked) => setFilters({
                  ...filters,
                  excludeExisting: checked
                })}
              />
            </div>
          </div>
          
          <div className="mt-4 flex gap-2">
            <Button onClick={() => refetch()}>
              Run Screener
            </Button>
            <Button variant="outline" onClick={saveCurrentFilters}>
              Save Preset
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Results Table */}
      <Card>
        <CardHeader>
          <h3 className="font-bold">
            Results ({results?.length || 0} matches)
          </h3>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Symbol</th>
                  <th className="text-right p-2">Price</th>
                  <th className="text-right p-2">ATR</th>
                  <th className="text-right p-2">Volume</th>
                  <th className="text-right p-2">52W %</th>
                  <th className="text-right p-2">Position Size</th>
                  <th className="text-right p-2">R:R</th>
                  <th className="p-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {results?.map(stock => (
                  <tr key={stock.symbol} className="border-b hover:bg-gray-50">
                    <td className="p-2 font-mono">{stock.symbol}</td>
                    <td className="text-right p-2">${stock.price.toFixed(2)}</td>
                    <td className="text-right p-2">${stock.atr_20d.toFixed(2)}</td>
                    <td className="text-right p-2">
                      {(stock.volume_avg_20d / 1000000).toFixed(1)}M
                    </td>
                    <td className="text-right p-2">
                      {stock.percent_from_high_52w.toFixed(1)}%
                    </td>
                    <td className="text-right p-2">
                      {stock.positionSize}
                    </td>
                    <td className="text-right p-2">
                      1:{stock.riskRewardRatio.toFixed(1)}
                    </td>
                    <td className="p-2">
                      <Button 
                        size="sm"
                        onClick={() => openTradeEntry(stock)}
                      >
                        Trade
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// src/components/dashboard/RiskMonitor.tsx
const RiskMonitor: React.FC = () => {
  const { data } = api.trade.getDashboard.useQuery();
  
  const getRiskColor = (percent: number, max: number) => {
    const ratio = percent / max;
    if (ratio < 0.5) return 'green';
    if (ratio < 0.8) return 'yellow';
    return 'red';
  };
  
  // Group positions by symbol for multiple position tracking
  const positionsBySymbol = data?.activePositions.reduce((acc, pos) => {
    if (!acc[pos.symbol]) acc[pos.symbol] = [];
    acc[pos.symbol].push(pos);
    return acc;
  }, {} as Record<string, Position[]>);
  
  return (
    <Card>
      <CardHeader>Risk Monitor</CardHeader>
      <CardContent>
        <div className="space-y-4">
          <RiskMeter
            label="Portfolio Heat"
            current={data?.totalRiskPercent}
            max={6}
            color={getRiskColor(data?.totalRiskPercent, 6)}
          />
          <RiskMeter
            label="Daily Risk Used"
            current={data?.dailyRiskUsed}
            max={3}
            color={getRiskColor(data?.dailyRiskUsed, 3)}
          />
          
          {/* Show symbols with multiple positions */}
          {Object.entries(positionsBySymbol || {})
            .filter(([_, positions]) => positions.length > 1)
            .map(([symbol, positions]) => (
              <Alert key={symbol}>
                <AlertDescription>
                  {symbol}: {positions.length} positions
                  ({positions.map(p => p.timeframe).join(', ')})
                </AlertDescription>
              </Alert>
            ))
          }
          
          <CorrelationWarning positions={data?.activePositions} />
        </div>
      </CardContent>
    </Card>
  );
};
```

## Market Data Service

```typescript
// src/lib/marketData.ts - Data Storage Strategy
class MarketDataService {
  // Data retention policy by timeframe (optimized for swing/trend trading)
  private readonly RETENTION_DAYS = {
    '15m': 30,    // Keep 1 month for intraday context
    '1h': 90,     // Keep 3 months for recent swing trades
    '4h': 365,    // Keep 1 year for swing trading
    '1d': 3650,   // Keep 10 years of daily data
    '1w': 3650,   // Keep 10 years of weekly data
    '1M': 7300    // Keep 20 years of monthly data
  };
  
  // How much data to fetch initially per timeframe
  private readonly INITIAL_BARS = {
    '15m': 672,   // 1 week (7 * 96 fifteen-min bars)
    '1h': 720,    // 1 month (30 * 24 hours)
    '4h': 540,    // 3 months (90 * 6 four-hour bars)
    '1d': 365,    // 1 year
    '1w': 104,    // 2 years (52 * 2 weeks)
    '1M': 60      // 5 years (12 * 5 months)
  };
  
  // Minimum timeframe by user tier
  private readonly MIN_TIMEFRAME_BY_TIER = {
    'free': '1d',   // Daily only for free users
    'basic': '4h',  // 4-hour and above for basic
    'pro': '15m'    // All timeframes for pro
  };
  
  async getHistoricalData(
    symbol: string,
    timeframe: string,
    limit: number = 100
  ): Promise<Candle[]> {
    // Check user tier for timeframe access
    const user = await getCurrentUser();
    const allowedTimeframes = this.getAllowedTimeframes(user.subscription_tier);
    
    if (!allowedTimeframes.includes(timeframe)) {
      throw new Error(`${timeframe} charts require ${this.getRequiredTier(timeframe)} subscription`);
    }
    
    // Check if we have enough data in DB
    const stored = await prisma.marketDataCache.findMany({
      where: { symbol, timeframe },
      orderBy: { timestamp: 'desc' },
      take: limit
    });
    
    if (stored.length >= limit) {
      return stored;
    }
    
    // Fetch missing data based on timeframe
    const missingData = await this.fetchHistoricalData(
      symbol,
      timeframe,
      stored[stored.length - 1]?.timestamp || new Date(),
      limit - stored.length
    );
    
    // Store new data
    if (missingData.length > 0) {
      await prisma.marketDataCache.createMany({
        data: missingData.map(candle => ({
          symbol,
          timeframe,
          ...candle
        }))
      });
    }
    
    return [...stored, ...missingData].slice(0, limit);
  }
  
  private getAllowedTimeframes(tier: string): string[] {
    switch (tier) {
      case 'pro':
        return ['15m', '1h', '4h', '1d', '1w', '1M'];
      case 'basic':
        return ['4h', '1d', '1w', '1M'];
      case 'free':
      default:
        return ['1d', '1w', '1M'];
    }
  }
  
  private getRequiredTier(timeframe: string): string {
    if (['15m', '1h'].includes(timeframe)) return 'Pro';
    if (['4h'].includes(timeframe)) return 'Basic';
    return 'Free';
  }
  
  async aggregateTimeframes(symbol: string) {
    // Build higher timeframes from lower ones
    // More efficient for swing/trend trading focus
    
    // Only aggregate if we have the source data
    const has15m = await this.hasDataForTimeframe(symbol, '15m');
    
    if (has15m) {
      // Build 1h from 15m (4 bars)
      await this.buildTimeframe(symbol, '15m', '1h', 4);
      
      // Build 4h from 1h (4 bars)
      await this.buildTimeframe(symbol, '1h', '4h', 4);
    }
    
    // Build 1d from 4h or fetch directly
    const has4h = await this.hasDataForTimeframe(symbol, '4h');
    if (has4h) {
      await this.buildDailyFrom4Hour(symbol);
    }
    
    // Build 1w from 1d (5 trading days typically)
    await this.buildWeeklyFromDaily(symbol);
    
    // Build 1M from 1d (~21 trading days)
    await this.buildMonthlyFromDaily(symbol);
  }
  
  private async buildDailyFrom4Hour(symbol: string) {
    // Group 4h bars by trading day
    const fourHourData = await prisma.marketDataCache.findMany({
      where: { symbol, timeframe: '4h' },
      orderBy: { timestamp: 'asc' }
    });
    
    const dailyBars = new Map<string, any[]>();
    
    for (const bar of fourHourData) {
      const dateKey = bar.timestamp.toISOString().split('T')[0];
      if (!dailyBars.has(dateKey)) {
        dailyBars.set(dateKey, []);
      }
      dailyBars.get(dateKey)?.push(bar);
    }
    
    // Create daily bars
    for (const [date, bars] of dailyBars) {
      if (bars.length > 0) {
        await prisma.marketDataCache.upsert({
          where: {
            symbol_timeframe_timestamp: {
              symbol,
              timeframe: '1d',
              timestamp: new Date(date)
            }
          },
          create: {
            symbol,
            timeframe: '1d',
            timestamp: new Date(date),
            open: bars[0].open,
            high: Math.max(...bars.map(b => b.high)),
            low: Math.min(...bars.map(b => b.low)),
            close: bars[bars.length - 1].close,
            volume: bars.reduce((sum, b) => sum + b.volume, 0)
          },
          update: {}
        });
      }
    }
  }
  
  private async buildWeeklyFromDaily(symbol: string) {
    const dailyData = await prisma.marketDataCache.findMany({
      where: { symbol, timeframe: '1d' },
      orderBy: { timestamp: 'asc' }
    });
    
    const weeklyBars = new Map<string, any[]>();
    
    for (const bar of dailyData) {
      // Get Monday of the week
      const date = new Date(bar.timestamp);
      const monday = new Date(date);
      monday.setDate(date.getDate() - date.getDay() + 1);
      const weekKey = monday.toISOString().split('T')[0];
      
      if (!weeklyBars.has(weekKey)) {
        weeklyBars.set(weekKey, []);
      }
      weeklyBars.get(weekKey)?.push(bar);
    }
    
    // Create weekly bars
    for (const [weekStart, bars] of weeklyBars) {
      if (bars.length > 0) {
        await prisma.marketDataCache.upsert({
          where: {
            symbol_timeframe_timestamp: {
              symbol,
              timeframe: '1w',
              timestamp: new Date(weekStart)
            }
          },
          create: {
            symbol,
            timeframe: '1w',
            timestamp: new Date(weekStart),
            open: bars[0].open,
            high: Math.max(...bars.map(b => b.high)),
            low: Math.min(...bars.map(b => b.low)),
            close: bars[bars.length - 1].close,
            volume: bars.reduce((sum, b) => sum + b.volume, 0)
          },
          update: {}
        });
      }
    }
  }
  
  private async buildMonthlyFromDaily(symbol: string) {
    const dailyData = await prisma.marketDataCache.findMany({
      where: { symbol, timeframe: '1d' },
      orderBy: { timestamp: 'asc' }
    });
    
    const monthlyBars = new Map<string, any[]>();
    
    for (const bar of dailyData) {
      const date = new Date(bar.timestamp);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyBars.has(monthKey)) {
        monthlyBars.set(monthKey, []);
      }
      monthlyBars.get(monthKey)?.push(bar);
    }
    
    // Create monthly bars
    for (const [monthKey, bars] of monthlyBars) {
      if (bars.length > 0) {
        const [year, month] = monthKey.split('-');
        const timestamp = new Date(parseInt(year), parseInt(month) - 1, 1);
        
        await prisma.marketDataCache.upsert({
          where: {
            symbol_timeframe_timestamp: {
              symbol,
              timeframe: '1M',
              timestamp
            }
          },
          create: {
            symbol,
            timeframe: '1M',
            timestamp,
            open: bars[0].open,
            high: Math.max(...bars.map(b => b.high)),
            low: Math.min(...bars.map(b => b.low)),
            close: bars[bars.length - 1].close,
            volume: bars.reduce((sum, b) => sum + b.volume, 0)
          },
          update: {}
        });
      }
    }
  }
  
  async cleanupOldData() {
    // Run weekly to remove old data beyond retention policy
    for (const [timeframe, days] of Object.entries(this.RETENTION_DAYS)) {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      
      await prisma.marketDataCache.deleteMany({
        where: {
          timeframe,
          timestamp: { lt: cutoffDate }
        }
      });
    }
  }
}
  
  async getCurrentPrice(symbol: string): Promise<number> {
    // 1. Check database first (for last known price)
    const dbPrice = await prisma.stockTechnicals.findUnique({
      where: { symbol },
      select: { price: true, updated_at: true }
    });
    
    // 2. If recent enough (< 1 minute for active trading hours), use it
    if (dbPrice && Date.now() - dbPrice.updated_at.getTime() < 60000) {
      return dbPrice.price;
    }
    
    // 3. Check memory cache (5 second TTL)
    const cached = this.cache.get(symbol);
    if (cached && Date.now() - cached.timestamp < 5000) {
      return cached.price;
    }
    
    // 4. Fetch fresh price based on subscription tier
    const user = await getCurrentUser();
    if (user.subscription_tier === 'pro' && this.ws) {
      // Pro users get WebSocket streaming
      return this.getStreamedPrice(symbol);
    } else {
      // Free/Basic users get polled data
      return this.getPolledPrice(symbol);
    }
  }
  
  private async getPolledPrice(symbol: string): Promise<number> {
    try {
      // Yahoo Finance for free tier
      const response = await fetch(
        `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`
      );
      const data = await response.json();
      const price = data.chart.result[0].meta.regularMarketPrice;
      
      // Update cache and database
      this.cache.set(symbol, { price, timestamp: Date.now() });
      await this.updatePriceInDB(symbol, price);
      
      return price;
    } catch (error) {
      // Fallback to last known price from DB
      const lastKnown = await prisma.stockTechnicals.findUnique({
        where: { symbol },
        select: { price: true }
      });
      return lastKnown?.price || 0;
    }
  }
  
  private async getStreamedPrice(symbol: string): Promise<number> {
    // For pro users with Polygon.io WebSocket
    if (!this.ws) {
      await this.connectWebSocket();
    }
    
    // Subscribe to symbol if not already
    if (!this.subscribers.has(symbol)) {
      this.ws?.send(JSON.stringify({
        action: 'subscribe',
        params: `T.${symbol}`
      }));
    }
    
    // Return last known while waiting for stream
    const cached = this.cache.get(symbol);
    return cached?.price || await this.getPolledPrice(symbol);
  }
  
  private async connectWebSocket() {
    // Only for pro users with Polygon.io
    if (!process.env.POLYGON_API_KEY) return;
    
    this.ws = new WebSocket(`wss://socket.polygon.io/stocks`);
    
    this.ws.on('open', () => {
      this.ws?.send(JSON.stringify({
        action: 'auth',
        params: process.env.POLYGON_API_KEY
      }));
    });
    
    this.ws.on('message', async (data) => {
      const parsed = JSON.parse(data);
      if (parsed.ev === 'T') {
        const symbol = parsed.sym;
        const price = parsed.p;
        
        // Update cache and notify subscribers
        this.cache.set(symbol, { price, timestamp: Date.now() });
        await this.updatePriceInDB(symbol, price);
        
        const callbacks = this.subscribers.get(symbol);
        callbacks?.forEach(cb => cb(price));
      }
    });
    
    // Reconnect on disconnect
    this.ws.on('close', () => {
      setTimeout(() => this.connectWebSocket(), 5000);
    });
  }
  
  private async updatePriceInDB(symbol: string, price: number) {
    // Update price in database for offline access
    await prisma.stockTechnicals.upsert({
      where: { symbol },
      create: {
        symbol,
        price,
        updated_at: new Date()
      },
      update: {
        price,
        updated_at: new Date()
      }
    });
    
    // Also store in time series for charts
    await prisma.marketDataCache.create({
      data: {
        symbol,
        timeframe: '1m',
        close: price,
        timestamp: new Date()
      }
    });
  }
  
  async getBulkPrices(symbols: string[]): Promise<Map<string, number>> {
    const prices = new Map<string, number>();
    
    // First, get all from DB in one query
    const dbPrices = await prisma.stockTechnicals.findMany({
      where: { symbol: { in: symbols } },
      select: { symbol: true, price: true, updated_at: true }
    });
    
    const staleSymbols = [];
    const now = Date.now();
    
    for (const item of dbPrices) {
      if (now - item.updated_at.getTime() < 60000) {
        prices.set(item.symbol, item.price);
      } else {
        staleSymbols.push(item.symbol);
      }
    }
    
    // Fetch only stale prices
    if (staleSymbols.length > 0) {
      await Promise.all(
        staleSymbols.map(async (symbol) => {
          const price = await this.getCurrentPrice(symbol);
          prices.set(symbol, price);
        })
      );
    }
    
    return prices;
  }
  
  // Background job to update prices
  async refreshActivePrices() {
    // Run every 30 seconds for active positions
    const activeSymbols = await prisma.trade.findMany({
      where: { status: 'active' },
      select: { symbol: true },
      distinct: ['symbol']
    });
    
    const symbols = activeSymbols.map(t => t.symbol);
    await this.getBulkPrices(symbols);
  }
}

// Cron job for price updates
// src/app/api/cron/update-prices/route.ts
export async function GET(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }
  
  const marketData = new MarketDataService();
  await marketData.refreshActivePrices();
  
  return Response.json({ success: true });
}

export const marketData = new MarketDataService();
  
  async getTechnicalData(symbol: string): Promise<TechnicalData> {
    // Fetch OHLC data
    const response = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=3mo`
    );
    const data = await response.json();
    const quotes = data.chart.result[0].indicators.quote[0];
    const closes = quotes.close;
    
    // Calculate indicators
    const sma20 = calculateSMA(closes, 20);
    const sma50 = calculateSMA(closes, 50);
    const sma200 = calculateSMA(closes, 200);
    const atr = calculateATR(quotes, 20);
    const rsi = calculateRSI(closes, 14);
    
    return {
      price: closes[closes.length - 1],
      sma_20: sma20,
      sma_50: sma50,
      sma_200: sma200,
      atr_20d: atr,
      rsi_14d: rsi,
      high_52w: Math.max(...closes),
      low_52w: Math.min(...closes)
    };
  }
}

// Helper functions for technical indicators
function calculateSMA(values: number[], period: number): number {
  if (values.length < period) return 0;
  const slice = values.slice(-period);
  return slice.reduce((a, b) => a + b, 0) / period;
}

function calculateATR(quotes: any, period: number): number {
  // Simplified ATR calculation
  const highs = quotes.high.slice(-period);
  const lows = quotes.low.slice(-period);
  const ranges = highs.map((h, i) => h - lows[i]);
  return ranges.reduce((a, b) => a + b, 0) / period;
}

function calculateRSI(closes: number[], period: number): number {
  // Simplified RSI calculation
  const gains = [];
  const losses = [];
  
  for (let i = 1; i < closes.length; i++) {
    const diff = closes[i] - closes[i - 1];
    if (diff > 0) {
      gains.push(diff);
      losses.push(0);
    } else {
      gains.push(0);
      losses.push(Math.abs(diff));
    }
  }
  
  const avgGain = gains.slice(-period).reduce((a, b) => a + b, 0) / period;
  const avgLoss = losses.slice(-period).reduce((a, b) => a + b, 0) / period;
  
  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return 100 - (100 / (1 + rs));
}

export const marketData = new MarketDataService();
```

## Code Quality & Architecture Review

### Simplified Architecture Principles

```typescript
/*
ARCHITECTURE PRINCIPLES FOR ELEGANCE:

1. SINGLE RESPONSIBILITY
   Each component/function does ONE thing well
   
2. CLEAR NAMING
   - calculatePositionSize() not calc() 
   - isMarketOpen() not checkMkt()
   
3. FAIL GRACEFULLY
   - Return safe defaults on error
   - Show helpful messages to users
   - Log for debugging, don't crash
   
4. PROGRESSIVE DISCLOSURE
   - Start simple (MVP)
   - Add complexity only when needed
   - Hide advanced features from beginners

5. CONSISTENT PATTERNS
   - All API routes return { data, error }
   - All forms use the same validation pattern
   - All modals follow same structure
*/

// SIMPLIFIED CORE FLOW - The Heart of TrendDojo
export class TradingCore {
  // 1. Calculate position size (pure function, no side effects)
  static calculatePosition(params: PositionParams): PositionResult {
    const { balance, risk, entry, stop } = params;
    
    // Simple, clear calculation
    const riskAmount = balance * (risk / 100);
    const stopDistance = Math.abs(entry - stop);
    const shares = Math.floor(riskAmount / stopDistance);
    
    return {
      shares,
      value: shares * entry,
      risk: riskAmount,
      stopPercent: (stopDistance / entry) * 100
    };
  }
  
  // 2. Validate trade (clear business rules)
  static validateTrade(trade: Trade, account: Account): ValidationResult {
    const errors = [];
    const warnings = [];
    
    // Clear, readable validations
    if (trade.stop >= trade.entry && trade.direction === 'long') {
      errors.push('Stop must be below entry for longs');
    }
    
    if (trade.risk > account.maxRisk) {
      errors.push(`Risk exceeds limit of ${account.maxRisk}%`);
    }
    
    if (trade.riskReward < 1.5) {
      warnings.push('Risk/Reward below 1.5:1');
    }
    
    return { valid: errors.length === 0, errors, warnings };
  }
  
  // 3. Execute trade (handles complexity internally)
  static async executeTrade(trade: Trade): Promise<ExecutionResult> {
    try {
      // Pre-flight checks
      const validation = this.validateTrade(trade);
      if (!validation.valid) return { success: false, errors: validation.errors };
      
      // Execute with broker
      const result = await BrokerService.execute(trade);
      
      // Store in database
      await DatabaseService.saveTrade(trade);
      
      // Notify user
      await NotificationService.send('trade_executed', trade);
      
      return { success: true, trade };
      
    } catch (error) {
      // Graceful failure
      console.error('Trade execution failed:', error);
      return { 
        success: false, 
        errors: ['Unable to execute trade. Please try again.'] 
      };
    }
  }
}

// SIMPLIFIED UI PATTERNS
// Instead of complex nested components, use clear composition

// Pattern 1: Smart/Dumb Components
// Smart: Handles logic
export const PositionSizerContainer = () => {
  const account = useAccount();
  const [result, setResult] = useState(null);
  
  const handleCalculate = (inputs) => {
    const result = TradingCore.calculatePosition({
      balance: account.balance,
      ...inputs
    });
    setResult(result);
  };
  
  return <PositionSizerView onCalculate={handleCalculate} result={result} />;
};

// Dumb: Just displays
export const PositionSizerView = ({ onCalculate, result }) => (
  <Card>
    <SimpleForm onSubmit={onCalculate} />
    {result && <ResultDisplay {...result} />}
  </Card>
);

// Pattern 2: Compound Components for Complex UI
export const TradeEntry = {
  Container: ({ children }) => <div className="trade-entry">{children}</div>,
  Symbol: () => <SymbolSelector />,
  Levels: () => <LevelInputs />,
  Sizer: () => <PositionSizer />,
  Confirm: () => <ConfirmationStep />
};

// Usage is clear and flexible
<TradeEntry.Container>
  <TradeEntry.Symbol />
  <TradeEntry.Levels />
  <TradeEntry.Sizer />
  <TradeEntry.Confirm />
</TradeEntry.Container>

// Pattern 3: Hooks for Shared Logic
export const useMarketStatus = (symbol: string) => {
  const [status, setStatus] = useState(null);
  
  useEffect(() => {
    const checkStatus = () => {
      setStatus(MarketHours.getStatus(symbol));
    };
    
    checkStatus();
    const interval = setInterval(checkStatus, 60000);
    return () => clearInterval(interval);
  }, [symbol]);
  
  return status;
};

// SIMPLIFIED STATE MANAGEMENT
// Instead of complex Redux, use simple Zustand stores

export const useTradingStore = create((set, get) => ({
  // State
  positions: [],
  activePortfolio: null,
  
  // Actions (clear names)
  addPosition: (position) => 
    set(state => ({ positions: [...state.positions, position] })),
    
  closePosition: (id) =>
    set(state => ({ positions: state.positions.filter(p => p.id !== id) })),
    
  // Computed values
  get totalRisk() {
    return get().positions.reduce((sum, p) => sum + p.risk, 0);
  },
  
  get canAddPosition() {
    return get().totalRisk < get().activePortfolio?.maxRisk;
  }
}));

// SIMPLIFIED ERROR HANDLING
// One pattern everywhere

export const apiHandler = (handler: Function) => {
  return async (req: Request, res: Response) => {
    try {
      const result = await handler(req, res);
      return res.json({ success: true, data: result });
    } catch (error) {
      console.error(error);
      
      // User-friendly error
      const message = error.message.includes('auth') 
        ? 'Please login to continue'
        : 'Something went wrong. Please try again.';
        
      return res.status(500).json({ 
        success: false, 
        error: message 
      });
    }
  };
};
```

### Key Simplifications Made:

1. **Removed Overly Complex Features**
   - No complex correlation calculations initially
   - No advanced portfolio optimization
   - Start with manual trade entry, add automation later

2. **Unified Patterns**
   - All API responses: `{ success, data, error }`
   - All forms: Same validation approach
   - All modals: Same open/close pattern

3. **Progressive Complexity**
   - Free tier: 1 portfolio, basic features
   - Paid tiers: Add portfolios, add features
   - Don't show pro features to free users

4. **Clear Separation**
   - Business logic in `/lib`
   - UI components in `/components`
   - API routes in `/api`
   - No mixing concerns

5. **Readable Over Clever**
   ```typescript
   // Bad: Clever but unclear
   const r = b * (rp / 100) / Math.abs(e - s);
   
   // Good: Clear intent
   const riskAmount = balance * (riskPercent / 100);
   const stopDistance = Math.abs(entry - stop);
   const shares = riskAmount / stopDistance;
   ```

The spec now balances comprehensive coverage with elegant, maintainable code that won't overwhelm developers or users.

1. POSITION SIZING MUST BE EXACT
   - Always round DOWN for stocks (no fractional shares)
   - Handle crypto to 8 decimal places
   - Forex must calculate pip values correctly
   - NEVER allow position size that risks more than specified

2. MULTIPLE POSITIONS PER SYMBOL
   - Each position has independent stop/target
   - Track timeframe for each position
   - Allow custom labels for organization
   - Warn about opposite direction positions
   - Sum total risk across all positions for risk management

3. STOP LOSS ENFORCEMENT
   - Stops can only move in direction of profit
   - Long: stop can only move up
   - Short: stop can only move down
   - Store initial stop permanently for R-multiple calculation
   - Each position's stop is independent

4. SCREENER REQUIREMENTS
   - Cache screener results (5 minute TTL)
   - Pre-calculate position sizes in results
   - Exclude symbols with existing positions when flagged
   - Save/load preset filters
   - One-click from result to trade entry

5. CHARTING REQUIREMENTS
   - Simple line charts with Recharts (no TradingView)
   - Always show entry, stop, target lines
   - Color-code risk/reward zones
   - Update prices every 5 seconds for active positions
   - Mobile responsive charts

6. RISK CALCULATION PRECEDENCE
   - Check daily risk BEFORE allowing new position
   - Include unrealized losses in current risk
   - Correlation counts as 1.5x risk for same sector
   - Multiple positions on same symbol count full risk each

7. DATA INTEGRITY
   - All monetary values store as DECIMAL, not FLOAT
   - All percentages store as decimal (1.5% = 1.5, not 0.015)
   - Use database transactions for trade entry/exit
   - Audit log for all position modifications

8. REAL-TIME UPDATES
   - Dashboard must update every 5 seconds minimum
   - Price alerts must trigger within 1 second
   - Fallback to cached prices if API fails
   - Group positions by symbol in UI for clarity

9. PERFORMANCE
   - Virtualize screener results table (>100 rows)
   - Lazy load chart data
   - Cache market data aggressively
   - Batch API requests where possible

10. TESTING REQUIREMENTS
    - Unit test ALL position sizing math
    - Integration test risk limit enforcement
    - Test multiple positions on same symbol
    - Test screener with 1000+ symbols
    - Test chart rendering on mobile
*/
```

## Environment Variables

```bash
# .env.local
DATABASE_URL=postgresql://user:pass@host:5432/trenddojo
NEXTAUTH_SECRET=generate-random-32-char
NEXTAUTH_URL=http://localhost:3000

# Airwallex
AIRWALLEX_API_KEY=your_api_key
AIRWALLEX_CLIENT_ID=your_client_id
AIRWALLEX_WEBHOOK_SECRET=your_webhook_secret

# Start with Yahoo Finance (free)
# Upgrade path to paid services later
POLYGON_API_KEY=optional_for_future
ALPHA_VANTAGE_KEY=optional_for_future
```

## File Structure

```
trenddojo/
├── src/
│   ├── app/
│   │   ├── (marketing)/          # Brochure website
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx          # Landing page
│   │   │   ├── pricing/page.tsx
│   │   │   ├── docs/page.tsx
│   │   │   ├── blog/page.tsx
│   │   │   └── about/page.tsx
│   │   ├── (app)/                # Main application
│   │   │   ├── api/
│   │   │   │   ├── trpc/[trpc]/route.ts
│   │   │   │   ├── auth/[...nextauth]/route.ts
│   │   │   │   └── webhooks/airwallex/route.ts
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── screener/page.tsx
│   │   │   ├── trades/
│   │   │   │   ├── new/page.tsx
│   │   │   │   └── [id]/page.tsx
│   │   │   └── layout.tsx
│   │   └── layout.tsx
│   ├── components/
│   │   ├── marketing/
│   │   │   ├── AnimatedPolygonBackground.tsx
│   │   │   ├── FeatureCard.tsx
│   │   │   ├── LiveDataDemo.tsx
│   │   │   └── PricingCard.tsx
│   │   ├── charts/
│   │   │   └── PositionChart.tsx
│   │   ├── position-sizer/
│   │   ├── risk-monitor/
│   │   ├── screener/
│   │   ├── trade-entry/
│   │   └── ui/
│   ├── lib/
│   │   ├── prisma.ts
│   │   ├── marketData.ts
│   │   ├── calculations.ts
│   │   ├── airwallex.ts
│   │   └── technicalIndicators.ts
│   ├── server/
│   │   ├── api/
│   │   │   ├── root.ts
│   │   │   └── routers/
│   │   │       ├── trade.ts
│   │   │       ├── screener.ts
│   │   │       ├── subscription.ts
│   │   │       └── marketData.ts
│   │   └── auth.ts
│   ├── stores/
│   │   ├── positionStore.ts
│   │   ├── screenerStore.ts
│   │   └── settingsStore.ts
│   ├── __tests__/
│   │   ├── unit/
│   │   │   ├── calculations.test.ts
│   │   │   └── risk.test.ts
│   │   ├── integration/
│   │   │   └── trade-flow.test.ts
│   │   └── components/
│   │       └── PositionSizer.test.tsx
│   └── test/
│       ├── setup.ts
│       └── utils.ts
├── e2e/
│   ├── trade-flow.spec.ts
│   ├── screener.spec.ts
│   └── subscription.spec.ts
├── prisma/
│   └── schema.prisma
├── vitest.config.ts
├── playwright.config.ts
└── package.json
```

## Development Seed Data & Testing Utils

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

async function createAccount(userId: string) {
  return prisma.account.create({
    data: {
      userId,
      name: 'Main Trading Account',
      broker: 'manual',
      account_type: 'paper',
      base_currency: 'USD',
      starting_balance: 100000,
      current_balance: 105000 + faker.number.float({ min: -5000, max: 10000 })
    }
  });
}

async function createTradesForAccount(accountId: string, tier: string) {
  const tradeCount = tier === 'free' ? 2 : tier === 'basic' ? 5 : 15;
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
        
        planned_entry: entryPrice,
        actual_entry: entryPrice + faker.number.float({ min: -0.5, max: 0.5 }),
        entry_date: faker.date.recent({ days: isActive ? 5 : 30 }),
        quantity: faker.number.int({ min: 10, max: 1000 }),
        position_size_usd: entryPrice * faker.number.int({ min: 100, max: 5000 }),
        
        stop_loss: entryPrice - stopDistance,
        initial_stop: entryPrice - stopDistance,
        target_price: entryPrice + targetDistance,
        risk_amount: faker.number.float({ min: 100, max: 500 }),
        risk_percent: faker.number.float({ min: 0.5, max: 2, precision: 0.1 }),
        risk_reward_ratio: targetDistance / stopDistance,
        
        // Closed trades have exit data
        ...(isActive ? {
          status: 'active'
        } : {
          status: 'closed',
          exit_price: entryPrice + faker.number.float({ min: -stopDistance, max: targetDistance }),
          exit_date: faker.date.recent({ days: 2 }),
          exit_reason: faker.helpers.arrayElement(['stop_loss', 'target', 'manual']),
          pnl_amount: faker.number.float({ min: -500, max: 1500 }),
          pnl_percent: faker.number.float({ min: -5, max: 15 }),
          r_multiple: faker.number.float({ min: -1, max: 3, precision: 0.1 })
        }),
        
        strategy_type: faker.helpers.arrayElement(['breakout', 'pullback', 'trend', 'reversal']),
        setup_quality: faker.number.int({ min: 3, max: 5 }),
        market_condition: faker.helpers.arrayElement(['trending', 'ranging', 'volatile'])
      }
    });
  }
  
  // Add trade notes to some trades
  const trades = await prisma.trade.findMany({ where: { accountId }, take: 5 });
  for (const trade of trades) {
    await prisma.tradeNotes.create({
      data: {
        tradeId: trade.id,
        note_type: faker.helpers.arrayElement(['entry', 'management', 'exit', 'review']),
        content: faker.lorem.paragraph()
      }
    });
  }
}

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

async function seedMarketData() {
  const symbols = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'META', 'NVDA', 'SPY', 'QQQ'];
  
  for (const symbol of symbols) {
    // Technical data
    const price = faker.number.float({ min: 50, max: 500, precision: 0.01 });
    await prisma.stockTechnicals.upsert({
      where: { symbol },
      create: {
        symbol,
        price,
        volume_avg_20d: faker.number.int({ min: 1000000, max: 50000000 }),
        atr_20d: price * faker.number.float({ min: 0.01, max: 0.03 }),
        rsi_14d: faker.number.float({ min: 30, max: 70 }),
        sma_20: price * faker.number.float({ min: 0.95, max: 1.05 }),
        sma_50: price * faker.number.float({ min: 0.9, max: 1.1 }),
        sma_200: price * faker.number.float({ min: 0.8, max: 1.2 }),
        high_52w: price * faker.number.float({ min: 1.1, max: 1.5 }),
        low_52w: price * faker.number.float({ min: 0.5, max: 0.9 }),
        percent_from_high_52w: faker.number.float({ min: -30, max: 0 }),
        percent_from_low_52w: faker.number.float({ min: 0, max: 100 })
      },
      update: {}
    });
    
    // Fundamental data
    await prisma.stockFundamentals.upsert({
      where: { symbol },
      create: {
        symbol,
        market_cap: faker.number.int({ min: 10000000000, max: 3000000000000 }),
        pe_ratio: faker.number.float({ min: 10, max: 50, precision: 0.1 }),
        revenue_growth: faker.number.float({ min: -10, max: 50, precision: 0.1 }),
        profit_margin: faker.number.float({ min: 5, max: 30, precision: 0.1 }),
        debt_to_equity: faker.number.float({ min: 0.1, max: 2, precision: 0.01 }),
        roe: faker.number.float({ min: 5, max: 40, precision: 0.1 }),
        is_profitable: faker.datatype.boolean({ probability: 0.8 }),
        sector: faker.helpers.arrayElement(['Technology', 'Healthcare', 'Finance', 'Consumer', 'Energy']),
        industry: faker.company.buzzNoun()
      },
      update: {}
    });
    
    // Historical price data (last 100 days)
    for (let i = 0; i < 100; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const open = price + faker.number.float({ min: -2, max: 2 });
      const close = open + faker.number.float({ min: -3, max: 3 });
      
      await prisma.marketDataCache.create({
        data: {
          symbol,
          timeframe: '1d',
          open,
          high: Math.max(open, close) + faker.number.float({ min: 0, max: 2 }),
          low: Math.min(open, close) - faker.number.float({ min: 0, max: 2 }),
          close,
          volume: faker.number.int({ min: 1000000, max: 50000000 }),
          timestamp: date
        }
      });
    }
  }
}

// Run the seed
main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

// package.json
{
  "prisma": {
    "seed": "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts"
  },
  "scripts": {
    "db:seed": "prisma db seed",
    "db:reset": "prisma migrate reset --force",
    "db:reset-seed": "npm run db:reset && npm run db:seed"
  }
}

// src/lib/dev-utils.ts
// Development utilities for testing specific scenarios
export const DevUtils = {
  // Create a trade at specific R-multiple
  async createTradeAtRMultiple(accountId: string, rMultiple: number) {
    const entryPrice = 100;
    const stopLoss = 95;
    const currentPrice = entryPrice + (stopLoss * rMultiple);
    
    return prisma.trade.create({
      data: {
        accountId,
        symbol: 'TEST',
        entry_price: entryPrice,
        stop_loss: stopLoss,
        current_price: currentPrice,
        status: 'active'
      }
    });
  },
  
  // Simulate hitting risk limits
  async fillToRiskLimit(accountId: string) {
    const settings = await prisma.riskSettings.findFirst({
      where: { accountId }
    });
    
    const maxPositions = settings?.max_open_positions || 5;
    
    for (let i = 0; i < maxPositions; i++) {
      await this.createTradeAtRMultiple(accountId, 0);
    }
  },
  
  // Create correlated positions
  async createCorrelatedPositions(accountId: string, sector: string = 'Technology') {
    const techStocks = ['AAPL', 'MSFT', 'GOOGL', 'META', 'NVDA'];
    
    for (const symbol of techStocks) {
      await prisma.trade.create({
        data: {
          accountId,
          symbol,
          sector,
          status: 'active',
          entry_price: 100,
          stop_loss: 95,
          risk_amount: 100
        }
      });
    }
  },
  
  // Simulate market crash
  async simulateMarketCrash(percentDrop: number = 20) {
    const trades = await prisma.trade.findMany({
      where: { status: 'active' }
    });
    
    for (const trade of trades) {
      const crashPrice = trade.entry_price * (1 - percentDrop / 100);
      await prisma.trade.update({
        where: { id: trade.id },
        data: {
          current_price: crashPrice,
          unrealized_pnl: (crashPrice - trade.entry_price) * trade.quantity
        }
      });
    }
  }
};
```

## Solo Development Workflow with AI

```markdown
# Development & Deployment Workflow for Solo Developer with AI

## 1. DEVELOPMENT PHASE

### Daily Development Routine
```bash
# Morning setup
git checkout -b feature/$(date +%Y%m%d)-feature-name
npm run db:reset-seed     # Fresh data each day
npm run dev               # Start dev server

# Development loop with AI
1. Write feature requirement in plain English
2. Ask AI to generate code following the spec
3. Copy code to appropriate files
4. Run immediate tests:
   npm run test:watch -- calculations.test.ts
5. Test in browser with dummy data
6. Commit frequently:
   git add -A && git commit -m "feat: add position sizing for crypto"
```

### AI Prompting Strategy
```markdown
TEMPLATE FOR AI REQUESTS:
"Using the TrendDojo spec, create [component/function] that:
- Requirement 1
- Requirement 2
Follow the existing patterns for [similar component]
Include unit tests"

EXAMPLE:
"Create a new screener filter for momentum stocks that:
- Filters by 20-day price momentum
- Excludes stocks under $5
- Includes volume surge detection
Follow the existing filter patterns in screenerRouter
Include vitest unit tests"
```

## 2. TESTING PHASE

### Progressive Testing Approach
```bash
# Level 1: Unit tests (after each function)
npm run test -- calculations.test.ts

# Level 2: Integration tests (after feature complete)
npm run test -- trade-flow.test.ts

# Level 3: Component tests (after UI complete)
npm run test -- PositionSizer.test.tsx

# Level 4: E2E tests (before merge)
npm run test:e2e -- trade-flow.spec.ts

# Level 5: Full regression (before deploy)
npm run test:all
```

### Test Data Scenarios
```bash
# Test specific scenarios
npm run db:reset-seed

# In browser console (dev tools)
await DevUtils.fillToRiskLimit('account-id')  # Test limit enforcement
await DevUtils.createCorrelatedPositions()     # Test correlation warnings
await DevUtils.simulateMarketCrash(10)        # Test drawdown handling
```

## 3. ACCEPTANCE PHASE

### Self-Review Checklist
```markdown
- [ ] Feature works with seeded data
- [ ] Feature works with empty data
- [ ] Mobile responsive (test at 375px, 768px, 1440px)
- [ ] All tests passing
- [ ] No console errors
- [ ] Performance acceptable (<3s page load)
- [ ] Risk calculations verified manually
```

### User Journey Testing
```bash
# Test each user tier
1. Login as free@test.com (3 position limit)
2. Login as basic@test.com (10 positions, fundamentals)
3. Login as pro@test.com (unlimited, real-time)

# Test complete flows
- Screener → Position Size → Entry → Monitor → Exit
- Hit risk limit → See warning → Upgrade → Continue
- Create multiple positions same symbol
```

## 4. STAGING PHASE

### Pre-Production Verification
```bash
# Deploy to staging
git push origin feature-branch
vercel --env preview

# Run against staging
NEXT_PUBLIC_API_URL=https://staging.trenddojo.com npm run test:e2e

# Verify critical paths
- [ ] Payment flow works (use Airwallex test cards)
- [ ] Calculations match Excel/calculator
- [ ] Data updates properly
- [ ] Webhooks firing
```

### Database Migration Testing
```bash
# Test migration on copy of production
pg_dump production_db > prod_backup.sql
psql staging_db < prod_backup.sql
npx prisma migrate deploy --preview-feature
```

## 5. DEPLOYMENT PHASE

### Deployment Checklist
```bash
# Pre-deployment
npm run build                  # Build succeeds
npm run test:all              # All tests pass
npm audit                     # No high vulnerabilities

# Merge to main
git checkout main
git merge feature-branch
git push origin main

# Vercel auto-deploys main branch
# Monitor deployment at vercel.com/dashboard
```

### Post-Deployment Verification
```bash
# Smoke tests in production
1. Create test account
2. Run through critical path
3. Verify calculations
4. Check monitoring dashboard

# Rollback if needed
vercel rollback
```

## 6. MONITORING & MAINTENANCE

### Daily Monitoring Routine
```bash
# Morning checks (5 min)
- Check Vercel dashboard for errors
- Check Airwallex for payment issues
- Review any user feedback

# Weekly maintenance
npm update                    # Update dependencies
npm audit fix                # Fix vulnerabilities
npm run test:all             # Regression test
```

### Error Tracking
```javascript
// Add to all critical functions
try {
  // ... code
} catch (error) {
  console.error('Context:', { 
    user: session.user.id,
    action: 'calculatePosition',
    input: sanitizedInput,
    error: error.message 
  });
  
  // Dev mode: throw error
  if (process.env.NODE_ENV === 'development') throw error;
  
  // Prod mode: return safe default
  return { error: 'Calculation failed, please try again' };
}
```

## 7. ITERATION WORKFLOW

### Feature Request to Production
```
Day 1: Design & Prototype
- Write requirements
- Get AI to generate code
- Test with dummy data

Day 2: Testing & Refinement  
- Write tests
- Fix edge cases
- Test all user tiers

Day 3: Staging & Deploy
- Deploy to staging
- Final verification
- Deploy to production
```

### Quick Fixes
```bash
# For urgent fixes
git checkout -b hotfix/issue-name
# Fix issue
npm run test -- specific.test.ts
git add -A && git commit -m "fix: stop loss calculation"
git push origin hotfix/issue-name
# Merge directly to main after testing
```

## 8. BACKUP & RECOVERY

### Daily Backups
```bash
# Automated via cron/Vercel
0 2 * * * pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql

# Manual backup before major changes
npm run db:backup

# Recovery procedure
psql $DATABASE_URL < backup-20240315.sql
npx prisma migrate deploy
```

### Rollback Procedures
```bash
# Code rollback
vercel rollback [deployment-id]

# Database rollback
psql $DATABASE_URL < last-known-good.sql

# Feature flag alternative (add to .env)
DISABLE_FEATURE_X=true
```

## Tools & Aliases for Efficiency

```bash
# .zshrc or .bashrc aliases
alias td-dev="npm run db:reset-seed && npm run dev"
alias td-test="npm run test:watch"
alias td-deploy="npm run test:all && git push origin main"
alias td-backup="pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql"

# Git aliases
git config --global alias.feat "commit -m 'feat:'"
git config --global alias.fix "commit -m 'fix:'"
git config --global alias.wip "commit -m 'wip:'"
```

## AI Assistant Instructions Template

Save this for consistent AI assistance:

```
You are helping build TrendDojo, a trading discipline platform.
Tech stack: Next.js 14, TypeScript, PostgreSQL, Prisma, tRPC, Tailwind
Key requirements:
- Position sizing must be exact (round down for stocks)
- Stops only move toward profit
- All money stored as DECIMAL
- Test coverage required
- Mobile responsive

When generating code:
1. Follow existing patterns in the spec
2. Include error handling
3. Add TypeScript types
4. Include basic tests
5. Consider edge cases

Current task: [describe what you need]
```
```
