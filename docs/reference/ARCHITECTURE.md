# TrendDojo Architecture Specification

*Last updated: 2025-09-28*
*Extracted from: trenddojo-setup-technical-spec.md*

## Stack Decision

**Core Technologies:**
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

## Architecture Principles

### 1. Simplified Architecture Principles

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
```

### 2. Core Trading Flow Architecture

```typescript
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
```

### 3. UI Architecture Patterns

```typescript
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
```

### 4. State Management Architecture

```typescript
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
```

### 5. Error Handling Architecture

```typescript
// SIMPLIFIED ERROR HANDLING
// One pattern everywhere

export const apiHandler = (handler: Function) => {
  return async (req: Request, res: Response) => {
    try {
      const result = await handler(req, res);
      return res.json({ success: true, data: result });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        error: 'Something went wrong. Please try again.'
      });
    }
  };
};
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

## Environment Configuration

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

## Deployment Architecture

- **Development**: Local dev server on localhost:3000
- **Preview**: Vercel preview deployments for feature branches
- **Staging**: Main branch auto-deploys to staging environment
- **Production**: Manual promotion from staging to production

## Key Simplifications Made

1. **No complex broker integrations initially** - Manual entry for beta
2. **Yahoo Finance for market data** - Free and reliable
3. **Simple position sizing** - Fixed risk percentage method
4. **Zustand over Redux** - Less boilerplate, easier to understand
5. **Recharts over TradingView** - Simpler integration, sufficient for beta
6. **Manual trade entry** - Skip complex order routing initially
7. **File-based routing** - Next.js App Router simplifies navigation
8. **Component co-location** - Related files grouped together

## Future Architecture Considerations

- **Broker Integrations**: Add Alpaca, IBKR APIs post-beta
- **Real-time Data**: Upgrade to Polygon.io for professional users
- **Advanced Charts**: Consider TradingView Charting Library
- **Microservices**: Split into separate services if scaling needs arise
- **Caching Layer**: Redis for market data and user sessions
- **CDN**: CloudFront for static assets and global distribution

---

*See also:*
- [Data Models](./DATA_MODELS.md) - Database schemas and data structures
- [API Specification](./API_SPECIFICATION.md) - API endpoints and contracts
- [UI Components](./UI_COMPONENTS.md) - Component specifications
- [Broker Integration](../BROKER_INTEGRATION.md) - External broker APIs