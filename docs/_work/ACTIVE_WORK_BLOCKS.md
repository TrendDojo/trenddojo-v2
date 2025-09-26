# TrendDojo Active Work Blocks

## 🔴 MANDATORY AI CONTEXT REFRESH
**BEFORE STARTING ANY WORK BLOCK, YOU MUST READ:**
1. `/CLAUDE.md` - Rules & behavior
2. `/docs/PROJECT_CONTEXT.md` - Project specifics
3. `/docs/_work/ACTIVE_WORK_BLOCKS.md` - Current work (this file)

**AT EACH TOUCHPOINT (session start, context switch, new task), RE-READ ALL THREE FILES**

## 🧪 Testing Requirements for All Work Blocks
**EVERY WORK BLOCK MUST INCLUDE TESTS:**
- See `_shared-framework/VERIFICATION-PROTOCOL.md` → Testing Protocol section
- Generate tests during implementation (AI does this automatically)
- Critical tests MUST pass before marking complete
- Include test results in Outcome section

## 🌿 Git Branching Strategy for Work Blocks

### Approach: Inline on Main
- **Default**: Work directly on `main` branch for most work blocks
- **Rationale**: Faster iteration, less overhead for single-developer project
- **When to branch**: Only for experimental features or breaking changes
- **Commit frequently**: Small, atomic commits with clear messages
- **Work block references**: Include WB-ID in commit messages

### When to Create Feature Branches
1. **Experimental features** that might be reverted
2. **Breaking changes** that need gradual migration
3. **Parallel work** by multiple developers
4. **Large refactors** that span multiple days

### Commit Message Format
```
WB-YYYY-MM-DD-NNN: Brief description

- Detail 1
- Detail 2
```

## WB-2025-09-16-001: Hierarchical Risk Management Implementation
**State**: completed
**Timeframe**: NOW
**Created**: 2025-09-16 10:00
**Completed**: 2025-09-16 15:30
**Dependencies**: None
**Tags**: #database #risk-management #architecture

### Goal
Implement the hierarchical risk management system with Account → Strategy → Position rules, including strategy cloning and circuit breakers.

### Tasks
- [x] Design minimal database schema changes
- [x] Add parentStrategyId and blockedReason to strategies table
- [x] Add accountStatus and currentDrawdown to portfolios table
- [x] Add flexible JSON fields to risk_settings
- [x] Create TypeScript types for risk management
- [x] Create strategy lifecycle service
- [x] Create circuit breaker service
- [x] Update UI components to show new features
- [x] Add AccountStatusBar component
- [x] Update strategies page with clone menu and new statuses
- [x] Document three-file context system

### Notes
- Used "Marie Kondo" approach - minimal changes, maximum impact
- Strategy cloning instead of versioning tables
- JSON fields for flexibility
- Circuit breakers use progressive tiers
- Separated CLAUDE.md from PROJECT_CONTEXT.md for cleaner maintenance

### Outcome
**Success** - Full hierarchical risk system implemented with minimal database changes. UI updated to reflect new features. Framework updated with three-file context system.


## WB-2025-01-24-001: UI Enhancement and Trading Mode Implementation
**State**: completed
**Timeframe**: NOW
**Created**: 2025-01-24 09:00
**Completed**: 2025-01-24 11:30
**Dependencies**: None
**Tags**: #ui #trading-modes #dev-tools #broker-integration

### Goal
Reorganize development tools, implement flexible trading mode indicators, enhance stock and positions pages, and improve broker connection UI.

### Tasks
- [x] Remove PaperTradingIndicator from bottom left
- [x] Create DevDropdown menu in header with amber warning color
- [x] Move theme showcase and test-refresh to /dev/* routes
- [x] Implement dev-only route protection
- [x] Create flexible TradingModeIndicator system
- [x] Support multiple brokers and parallel paper/live trading
- [x] Add stock detail page with Create Position button
- [x] Remove quick trade buttons from stock page
- [x] Add trading mode indicators to positions table
- [x] Add 10+ dummy paper trading positions
- [x] Enhance broker cards with connection status
- [x] Add "Ready to connect!" message for disconnected brokers
- [x] Add "Visit Alpaca" link to broker cards
- [x] Create /temp/ directory for temporary files
- [x] Update .gitignore for temp files

### Outcome
**Success** - Complete UI reorganization with dev tools centralized, flexible trading mode system supporting multiple brokers, enhanced positions page with paper trading indicators, and improved broker connection experience. Established /temp/ directory convention for temporary files.

## WB-2025-01-25-001: Market Data Infrastructure - Unified Architecture
**State**: doing
**Timeframe**: NOW
**Created**: 2025-01-25 18:00
**Updated**: 2025-01-26 14:30
**Dependencies**: None
**Tags**: #infrastructure #market-data #database #business-critical

### ⚠️ MANDATORY: Living Theme System
**ALL UI components MUST use styles from the living theme:**
- Check `/src/lib/*Styles.ts` files (buttonStyles, tableStyles, panelStyles, formStyles)
- Check `/src/app/dev/theme/page.tsx` for available components
- If a style doesn't exist, ADD IT to the theme system first (confirm with user)
- NEVER use hardcoded Tailwind classes for colors/spacing/borders
- ALWAYS use semantic classes (text-success, bg-danger, etc.)

### Goal
Build a unified market data infrastructure where production PostgreSQL serves as the single source of truth for all environments (dev/staging/prod), eliminating data staleness issues, with built-in expansion capability from 100 to 8000+ symbols.

### Architecture Decision (FINAL - Multi-Source Ready)
- **Initial Implementation**: Alpaca (broker) + Polygon (historical) hybrid
- **Data Consistency**: Both use SIP feed, data is 99.9% identical
- **Multi-Source Architecture**: Built-in from day one
  - Database schema supports multiple brokers per user
  - Data router interface allows pluggable sources
  - User preferences table for source selection
- **Single PostgreSQL database** in production with `market.*` schema
- **All environments read from production** market data (read-only access)
- **User data remains isolated** per environment (`public.*` schema)
- **Production Vercel Cron** fetches from primary source (Alpaca/Polygon)
- **Fallback chain**: User's broker → Polygon → Yahoo → Cached data

### Tasks
- [x] Create SQLite schema for historical prices (local testing)
- [x] Build bulk data import system (Polygon.io integration)
- [x] Create data access layer with TypeScript types
- [x] Build data validation and integrity checks
- [x] Create MarketDatabase service with full CRUD operations
- [x] Implement API routes for market data access
- [x] Create CDNChart component with Lightweight Charts integration
- [x] Build symbol detail page with chart display
- [x] Import initial dataset (100 symbols, 107k+ records)
- [x] Write comprehensive tests
- [x] Design multi-source architecture
- [ ] **MULTI-SOURCE**: Create IDataProvider interface
- [ ] **MULTI-SOURCE**: Build DataRouter class
- [ ] **MULTI-SOURCE**: Add source tracking to responses
- [ ] **DATABASE**: Add data_tier, is_primary to broker_connections
- [ ] **DATABASE**: Create user_data_preferences table
  - NOTE: Code already exists in `/src/lib/market-data/DataRouter.ts:47-63` (currently commented out)
  - Uncomment after table creation
- [ ] **DATABASE**: Create user_data_sources table
  - NOTE: Code already exists in `/src/lib/market-data/DataRouter.ts:99-107` (currently commented out)
  - Uncomment after table creation
- [ ] Set up production PostgreSQL market schema
- [ ] Configure read-only access for dev/staging
- [ ] Implement Vercel Cron for updates
- [ ] Create sync state tracking per environment
- [ ] Build catch-up mechanism for data gaps
- [ ] **EXPANSION**: Implement symbol universe management
- [ ] **EXPANSION**: Create tiered update strategy

### Technical Implementation
**Current State**: SQLite for local dev, transitioning to unified PostgreSQL
**Target Architecture**:
- Production PostgreSQL hosts `market.*` schema (single writer)
- Dev/staging connect as read-only to production market data
- User data (`public.*`) remains isolated per environment
- Polygon API moves from dev localhost to production Vercel Cron

### Expansion Strategy (100 → 8000+ symbols)

**Symbol Universe Management**:
```typescript
// Symbol tiers for progressive expansion
interface SymbolUniverse {
  core: string[];        // S&P 500 (~500 symbols) - 1min updates
  extended: string[];    // Russell 3000 (~3000) - 5min updates
  full: string[];        // All US equities (~8000) - 15min updates
  watchlist: string[];   // User-specific symbols - 1min updates
}
```

**Database Scaling Strategy**:
- **Partitioning**: By symbol range (A-C, D-G, etc.) or by date
- **Indexes**: Composite on (symbol, timestamp) with BRIN for time-series
- **Materialized Views**: Pre-computed latest prices, daily summaries
- **Archival**: Move data >2 years to cold storage

**API Cost Management**:
- **Tier 1**: Start with top 100 most-traded symbols
- **Tier 2**: Add S&P 500 when user base hits 100 users
- **Tier 3**: Russell 3000 at 1000 users
- **Tier 4**: Full universe at enterprise scale

**Update Frequency Strategy**:
```typescript
function getUpdateFrequency(symbol: string): number {
  if (userWatchlist.includes(symbol)) return 60;      // 1 min
  if (coreSymbols.includes(symbol)) return 60;        // 1 min
  if (extendedSymbols.includes(symbol)) return 300;   // 5 min
  return 900;                                          // 15 min
}
```

**Benefits**:
- Zero data staleness between environments
- Single API quota (no duplicate Polygon calls)
- Dev uses real market data for better testing
- Immutable historical data safe for read-only access
- **Painless expansion** from 100 to 8000+ symbols

### Progress Update (2025-09-25)
- ✅ SQLite database created with optimized schema
- ✅ MarketDatabase service fully implemented with performance optimizations
- ✅ Polygon.io provider integrated for data fetching
- ✅ API routes created for historical data access
- ✅ CDNChart component working with real market data
- ✅ Symbol detail pages displaying live charts
- ✅ Initial data load complete: 100 symbols, 107,657 records
- ✅ Chart performance: <10ms query times achieved
- ✅ Multiple timeframes supported (1M, 3M, 6M, 1Y, 3Y, ALL)
- ✅ Chart types: Candlestick and Line charts with volume

### Tests Generated
- [x] Critical tests (must pass for completion) - 9 tests passing
  - Database connection and initialization
  - Price data retrieval
  - Data integrity validation
  - Query performance (<100ms)
- [x] Standard tests (should pass for quality) - 16 tests passing
  - Feature completeness
  - Data transformation
  - Search functionality
  - Error recovery
- [x] Edge case tests (document known limits) - 15 tests passing
  - Extreme value handling
  - Date range extremes
  - Special character symbols
  - Concurrent operations

### Test Results (2025-09-26)
**Test Summary**: 40 tests passing (3 test files)
- `src/__tests__/critical/market-data-database.test.ts` - ✅ All 9 critical tests pass
- `src/__tests__/standard/market-data-features.test.ts` - ✅ All 16 standard tests pass
- `src/__tests__/edge-cases/market-data-limits.test.ts` - ✅ All 15 edge case tests pass
- Tests follow new AI-generated testing protocol from VERIFICATION-PROTOCOL.md
- Test organization: critical/ vs standard/ vs edge-cases/ directories
- Performance validated: queries complete in <10ms as required

### Success Criteria
- ✅ Import data for 100+ symbols in minutes
- ✅ Chart queries return in <10ms
- ✅ Zero API calls for historical data
- ✅ Comprehensive test coverage implemented
- ⏳ Automated nightly updates (pending)
- ⏳ Handle corporate actions correctly (pending)

### Notes
- Successfully separated from positions work to maintain clear boundaries
- Charts are fully functional with CDN-loaded Lightweight Charts library
- Database performance excellent with WAL mode and proper indexing
- **ARCHITECTURE SHIFT**: Moving from isolated databases to unified market data
- **KEY INSIGHT**: Market data is universal truth - same across all environments
- **DATA CONSISTENCY**: Alpaca and Polygon use same SIP feed - 99.9% identical data
- **MULTI-SOURCE READY**: Architecture supports multiple brokers and data sources per user
- **EXPANSION READY**: Architecture supports growth from 100 to 8000+ symbols
- **COST CONSCIOUS**: Users can bring their own data subscriptions
- **PERFORMANCE**: Partitioning and indexing strategy maintains <10ms queries at scale
- See `/docs/patterns/MARKET-DATA-ARCHITECTURE.md` for detailed design

### Implementation Strategy
1. **Phase 1**: Polygon historical + Alpaca live when connected
2. **Phase 2**: Add data source selection UI
3. **Phase 3**: Add more brokers (IBKR, TD Ameritrade)
4. **Phase 4**: Add crypto sources (Coinbase, Binance)
5. **Phase 5**: Add forex sources

## WB-2025-01-21-001: Living Theme System Implementation
**State**: paused
**Timeframe**: NEXT
**Created**: 2025-01-21 09:00
**Updated**: 2025-01-25 16:00
**Paused**: 2025-01-25 - Shifting to stock data integration
**Dependencies**: None
**Tags**: #ui #design-system #infrastructure #group-wide

### Goal
Implement a truly living theme system where the theme page and application components are tightly coupled, sharing the exact same style definitions. This will be expanded into a robust group-wide monitoring system to ensure all projects maintain this standard.

### Scope
1. **TrendDojo Implementation**
   - Complete adoption of centralized styling system across ALL components
   - Theme page must import actual components, not recreate them
   - Nuclear test must pass (delete theme page = app works, restore = perfect match)
   - Theme page organized with tabs:
     - **"Core Design System"**: Universal elements used across all projects (buttons, forms, alerts, tables, typography, colors)
     - **"Domain Components"**: Project-specific elements (trading indicators, position bars, strategy panels, broker cards, P&L displays)

2. **Development vs Production Modes**
   - **Development Mode**: Theme page visible at `/theme` for active development
     - Shows all components and variations
     - Includes experimental/beta components
     - Has interactive controls for testing states
     - Shows design tokens and CSS variables
   - **Production Mode**: Theme page hidden or requires auth
     - Prevents external access to design system
     - Only accessible to authenticated developers
     - Lightweight version without dev tools
     - Can be completely removed from production bundle

3. **Group-Wide System**
   - Create monitoring scripts to verify theme/app coupling
   - Automated checks for style duplication
   - CI/CD integration to prevent regression
   - Documentation of the pattern for other projects

4. **Ongoing Monitoring**
   - Weekly automated reports on style consistency
   - Alert system for divergence between theme and app
   - Metrics dashboard for tracking adoption

### Tasks
- [x] Document the living theme pattern in proven-solutions (COMPLETED 2025-01-22)
- [x] Create group-wide implementation guide in _shared-framework
- [x] Create buttonStyles.ts, panelStyles.ts, formStyles.ts (COMPLETED 2025-01-25)
- [x] Refactor ALL tables to use tableStyles.ts (COMPLETED 2025-01-25)
- [x] Add tab navigation to theme page (COMPLETED 2025-01-25 - Core, Tables, Badges, Alerts, Forms)
- [x] Fix Alert component styling issues (COMPLETED 2025-01-25)
- [x] Update home page to use theme buttons and colors (COMPLETED 2025-01-25)
- [x] Apply theme pagination to positions table (COMPLETED 2025-01-25)
- [x] Remove old pagination components (COMPLETED 2025-01-25)
- [ ] Audit remaining components for inline styles
- [ ] Create Domain Components tab for trading-specific UI
- [ ] Update theme page to import real components (partially done)
- [ ] Implement nuclear test verification
- [ ] Add environment-based theme page access control
- [ ] Create development mode with interactive controls
- [ ] Build production mode with auth gate
- [ ] Add build-time flag to exclude theme page from production bundle
- [ ] Create style consistency monitoring script
- [ ] Create CI/CD checks for style consistency
- [ ] Build group-wide adoption tracking system

### Success Criteria
- Zero inline Tailwind classes in components (all use centralized styles)
- Theme page uses actual components from the app
- Theme page has clear separation between core and domain-specific components
- Core Design System tab is portable to other projects
- Domain Components tab showcases TrendDojo-specific patterns
- Changing one style variable updates everywhere
- Theme page is protected in production (auth-gated or removed)
- Development mode provides full design system access
- Production mode prevents design system exposure
- Monitoring system catches any divergence
- Other projects can adopt the pattern easily

### Notes
- Emerged from WB-2025-01-21 color system work where we discovered systematic issues
- Addresses the "almost the same" trap that creates UI inconsistency
- Will prevent future AI claims of "fixed" when visual changes aren't verifiable
- Group-wide impact: all projects will benefit from this infrastructure
- Tab structure enables clear separation of concerns:
  - Core tab can be copied to any project (Controlla, Three, etc.)
  - Domain tab demonstrates project-specific patterns (trading UI)
  - Makes it easier to maintain consistency while allowing specialization

**Progress Update 2025-01-25:**
- Successfully created centralized style files (buttonStyles, tableStyles, panelStyles)
- Theme page reorganized with tabs (Core Components, Tables, Badges, Alerts, Forms)
- Fixed major issues: Alert backgrounds, table header styling, dropdown menus
- Applied theme system to production pages (home page, positions table)
- Removed old pagination system in favor of new compact icon-based design
- All tables now use centralized tableStyles.ts for consistency
- Home page fully converted to use theme colors (indigo instead of custom purple)

## WB-2025-01-23-001: Positions Page Enhancement
**State**: completed
**Timeframe**: NOW
**Created**: 2025-01-23 09:00
**Completed**: 2025-01-23 11:00
**Dependencies**: None
**Tags**: #ui #positions #navigation #broker-integration

### Goal
Enhance positions page with improved navigation, broker connection handling, and UI consistency.

### Tasks Completed
- [x] Investigated and restored lost functionality (position status filters)
- [x] Added top-level account type tabs (Live Positions, Paper Positions, Dev, Rules)
- [x] Added second-level status filters (Active, Pending, Closed)
- [x] Moved position rules from strategies page to dedicated Rules tab
- [x] Implemented broker connection checks with helpful messages
- [x] Added "Connect Broker" link when no broker connected
- [x] Maintained mock data for Dev mode
- [x] Removed breadcrumbs from positions, screener, and brokers pages
- [x] Renamed tabs for clarity (Live Trading → Live Positions, etc.)
- [x] Fixed tab spacing and layout issues
- [x] Moved "New Position" button to same row as status filters
- [x] Created starto command documentation in shared framework

### Outcome
**Success** - Positions page now has proper two-level navigation with broker connection handling and improved UI consistency.

## WB-2025-01-24-002: Manual Position Management
**State**: paused
**Timeframe**: NOW
**Created**: 2025-01-24 11:45
**Updated**: 2025-01-25 18:00
**Paused**: 2025-01-25 - Shifting to market data infrastructure (dependency)
**Dependencies**: WB-2025-01-25-001 (Market Data Infrastructure)
**Tags**: #positions #manual-entry #ui #data-management #live-tracking

### Goal
Implement manual position creation and editing capabilities to allow users to track ALL positions including:
1. **External Live Trades** - Real money positions executed elsewhere (other brokers, crypto exchanges, forex platforms)
2. **Legacy Positions** - Existing holdings from before using TrendDojo
3. **Unsupported Brokers** - Positions at brokers we don't integrate with yet
4. **Manual Testing** - Paper positions for strategy development

### Tasks
- [ ] Create comprehensive NewPositionModal with two modes:
  - [ ] "Quick Entry" - Just symbol, qty, price for fast tracking
  - [ ] "Detailed Entry" - Full form with all trade details
- [ ] Implement symbol lookup/search functionality:
  - [ ] Autocomplete search field when symbol not pre-filled
  - [ ] Search as user types (debounced API calls)
  - [ ] Show symbol, company name, and exchange in results
  - [ ] Recent symbols quick-select list
  - [ ] Popular/trending symbols suggestion
  - [ ] Handle invalid symbols with helpful error messages
- [ ] Add position entry fields:
  - [ ] Basic: symbol, quantity, entry price, entry date/time
  - [ ] Strategy selection:
    - [ ] Dropdown of user's active strategies
    - [ ] Quick-create new strategy option
    - [ ] Optional: no strategy (unassigned)
  - [ ] Trade details: execution price, fees, commissions, slippage
  - [ ] Risk management: stop loss, take profit, trailing stop
  - [ ] Position type: long/short, live/paper indicator
  - [ ] Source: manual, broker name (if external), exchange
- [ ] Implement manual trade execution tracking:
  - [ ] Add trades to existing position (averaging up/down)
  - [ ] Partial exits with fee tracking
  - [ ] Record actual execution prices vs intended prices
- [ ] Create EditPositionModal for updates:
  - [ ] Edit stops and targets
  - [ ] Add execution notes
  - [ ] Adjust for splits/dividends
  - [ ] Mark as closed with exit details
- [ ] Add manual position indicators:
  - [ ] "Manual" badge to distinguish from API positions
  - [ ] "External" tag for trades made elsewhere
  - [ ] Broker/exchange name display
- [ ] Implement fee and commission tracking:
  - [ ] Per-trade fees
  - [ ] Running total fees per position
  - [ ] Impact on P&L calculations
- [ ] Create position validation logic
- [ ] Add manual position storage in database with audit trail
- [ ] Implement accurate P&L calculations including fees
- [ ] Add bulk import capability (CSV/JSON) for trade history
- [ ] Create reconciliation workflow for manual vs broker positions

### Success Criteria
- Users can track ANY position regardless of where it was executed
- Every position can be linked to a strategy for performance tracking
- Manual entry supports full trade lifecycle (entry, scaling, exit)
- Fees and commissions properly tracked and included in P&L
- Clear distinction between manual, API, and external positions
- Can import historical trades from CSV exports
- Position journal/notes for tracking reasoning
- Strategy-level P&L and metrics aggregation works correctly

### Notes
- **Critical for real traders** who execute across multiple platforms
- Many users trade on platforms we'll never integrate with (local brokers, crypto DEXs, forex)
- Manual tracking allows immediate platform value without waiting for integrations
- Consider template system for common fee structures (e.g., "$4.95 per trade")
- Important for tax reporting and performance tracking
- Enables tracking of complex positions (options, futures) before full support

## WB-2025-01-20-001: Broker Integration - Alpaca Paper Trading
**State**: paused
**Timeframe**: NEXT
**Created**: 2025-01-20 09:00
**Dependencies**: None
**Tags**: #brokers #integration #paper-trading #business-critical

### Goal
Complete Alpaca broker integration for paper trading to enable actual trade execution from strategies.

### Current Status
- BrokerManager architecture exists
- AlpacaClient partially implemented
- API routes created
- UI broker connection page exists
- Missing: Actual connectivity and order execution

### Tasks
- [ ] Complete AlpacaClient implementation
  - [ ] Finish order placement methods
  - [ ] Implement position fetching
  - [ ] Add market data streaming
  - [ ] Handle WebSocket connections
- [ ] Test Alpaca paper trading connection
- [ ] Implement credential encryption
- [ ] Connect strategies to order execution
- [ ] Add position monitoring
- [ ] Create paper trading dashboard
- [ ] Test full order lifecycle
- [ ] Add error recovery mechanisms

### Success Criteria
- Can connect to Alpaca paper account
- Can place buy/sell orders
- Can fetch positions and P&L
- Strategies can execute trades automatically
- Real-time position updates work

### Notes
- Focus on paper trading first for safety
- Alpaca provides free paper trading accounts
- Simpler API than Interactive Brokers
- No local gateway required

## WB-2025-01-26-001: Stop Loss Architecture & Monitoring Strategy
**State**: pending
**Timeframe**: LATER
**Created**: 2025-01-26
**Dependencies**: Market data refresh framework
**Tags**: #critical #risk-management #monitoring #compliance

### Goal
Determine and implement stop loss strategy leveraging the new 1-minute bulk update architecture.

### Decision: 1-Minute Monitoring + Broker Delegation

With our 1-minute bulk update architecture (fetching all 8000 symbols every minute), stop losses become viable:
- Maximum delay: **60 seconds** (vs 15 minutes originally considered)
- Acceptable for swing traders (our target market)
- NOT suitable for day traders (need sub-second)

### Implementation Strategy

**Phase 1: Paper Trading with 1-Minute Checks (NOW)**
- Paper positions only
- Clear "60-second check interval" disclosure
- No real money liability
- Cost: 1 call/minute = 390 calls/day
- Requires: Polygon Basic ($29/month)

**Phase 2: Live Trading Options (NEXT)**
```typescript
if (user.hasBrokerConnection) {
  // Broker-native stops (recommended)
  await broker.placeStopOrder(params);
} else {
  // Our 1-minute monitoring (with disclaimers)
  await createMonitoredStop(params);
  await showDisclaimer("Checked every 60 seconds");
}
```

**Phase 3: Enhanced Features (LATER)**
- Adaptive frequency (30 seconds when near stop)
- Push notifications
- SMS alerts for critical events

### Tasks
- [ ] Implement stop loss checks in MarketDataCache
- [ ] Create stop loss management UI
- [ ] Add clear disclaimers and user education
- [ ] Test with paper trading accounts
- [ ] Legal review of terms and disclaimers
- [ ] Broker integration for live stops

### Notes
- 1-minute updates solve the stop loss monitoring problem
- Paper trading first eliminates initial liability
- Broker delegation for live trading is safest approach
- Clear communication about check intervals is critical

**BLOCKED UNTIL**: Business decision on paper-only implementation

## WB-2025-01-26-002: Living Theme System - Complete Migration
**State**: pending
**Timeframe**: NEXT
**Created**: 2025-01-26 16:30
**Dependencies**: None
**Tags**: #ui #design-system #infrastructure #refactoring

### Goal
Migrate the entire codebase from hardcoded Tailwind classes to a proper Tailwind-first semantic theme system, achieving 90%+ semantic class usage.

### Current State Analysis
- **30% living theme**: buttonStyles, tableStyles, panelStyles, formStyles, dropdownStyles
- **70% hardcoded**: Direct Tailwind classes like `bg-gray-100 text-blue-500`
- **4,400+ violations** detected by theme compliance scanner
- **Wrong approach**: Theming components instead of theming Tailwind itself

### CRITICAL INSIGHT: Theme Tailwind, Not Components
**Current (Wrong) Approach**: Wrapping Tailwind in component styles
```typescript
// ❌ Fighting Tailwind
export const buttonStyles = {
  primary: "bg-blue-500 text-white hover:bg-blue-600"
}
<Button className={buttonStyles.primary}>
```

**Better Approach**: Theme at Tailwind config level
```typescript
// ✅ Working WITH Tailwind
// tailwind.config.js extends semantic colors
<button className="bg-primary text-primary-foreground hover:bg-primary/90">
```

### New Target Architecture
1. **Extend Tailwind Config** with semantic colors:
   - `primary`, `secondary`, `muted`, `destructive`
   - `background`, `foreground`, `border`
   - `success`, `warning`, `danger`, `info`

2. **Use CSS Variables** for theme switching:
   ```css
   :root { --primary: 221.2 83.2% 53.3%; }
   .dark { --primary: 217.2 91.2% 59.8%; }
   ```

3. **Semantic Classes Everywhere**:
   ```tsx
   // Instead of: bg-gray-100 dark:bg-gray-800
   // Use: bg-muted
   ```

### Tasks
- [ ] Phase 1: Setup Tailwind Theme System
  - [ ] Update `tailwind.config.js` with semantic color system
  - [ ] Add CSS variables to `globals.css`
  - [ ] Create color documentation in living theme

- [ ] Phase 2: Update Living Theme Showcase
  - [ ] Show semantic colors (bg-primary) not raw colors (bg-blue-500)
  - [ ] Document the semantic system
  - [ ] Create migration guide

- [ ] Phase 3: Component Migration (use scanner to track)
  - [ ] Start with new components - use semantic only
  - [ ] Migrate high-impact components (Button, Card, Panel)
  - [ ] Systematic refactor of 4,400 violations
  - [ ] `chartStyles.ts` - Chart containers and controls
  - [ ] `badgeStyles.ts` - Status badges, pills, tags

- [ ] Migrate existing components (by priority):
  - [ ] Marketing pages (homepage, footer, nav)
  - [ ] Layout components (sidebar, header, user dropdown)
  - [ ] Position components (NewPositionModal, status bars)
  - [ ] Strategy components (tabs, rules, exits)
  - [ ] Chart components (wrappers, controls)
  - [ ] Broker components (cards, connection modals)

- [ ] Establish enforcement rules:
  - [ ] Create ESLint rule to flag hardcoded colors
  - [ ] Add pre-commit hook to check for style violations
  - [ ] Document migration patterns in LIVING-THEME-USAGE.md
  - [ ] Create migration guide for developers

- [ ] Quality assurance:
  - [ ] Audit all components for remaining inline styles
  - [ ] Verify dark mode consistency
  - [ ] Test responsive behavior
  - [ ] Performance impact assessment

### Success Criteria
- **90%+ living theme usage** (measured by component audit)
- **Zero hardcoded colors** in business components
- **Tailwind only for**: spacing, layout (flex/grid), positioning
- **All new PRs** pass theme compliance checks
- **Theme changes** propagate instantly across entire app
- **Developer docs** make it easy to use theme correctly

### Benefits
1. **Consistency**: Every component looks cohesive
2. **Maintainability**: Change once, update everywhere
3. **Developer velocity**: No decision fatigue about colors
4. **Dark mode**: Automatic support without extra work
5. **Branding**: Easy to rebrand entire app

### Notes
- Start with most visible components first (marketing, layout)
- Create migration checklist for each component type
- Consider automated migration script for simple cases
- Keep Tailwind for non-visual utilities (spacing, layout)
- Document before/after examples for training

## WB-2025-01-18-001: Position Indicator Graphic Enhancement
**State**: paused
**Timeframe**: NOW
**Created**: 2025-01-18 12:00
**Dependencies**: None
**Tags**: #ui #visualization #positions #data-viz

### Goal
Enhance the position indicator graphic to provide accurate visual representation of position status with proper proportions relative to real pricing data.

### Requirements
1. **Fixed Width Implementation** ✅
   - Converted to fixed pixel widths (120px container)
   - Consistent display across different screen sizes
   - Maintains proportions accurately

2. **Correct Ratio Spacing** ✅
   - Elements proportionally spaced based on actual price points
   - Entry, current, stop, and target positions reflect relative distances
   - Visual spacing matches real-world pricing ratios

3. **Visual Key/Legend**
   - Add a key explaining color coding and symbols
   - Include labels for: Entry Price, Current Price, Stop Loss, Take Profit
   - Consider hover tooltips for additional context
   - Position the key in an unobtrusive but accessible location

4. **Technical Considerations** ✅ (partial)
   - Pixel positions calculated based on price ranges
   - Edge cases handled
   - Performance maintained with multiple indicators

### Tasks
- [x] Analyze current PositionStatusBar implementation
- [x] Design new calculation system for proportional spacing
- [x] Implement fixed-width container with proper ratios
- [x] Convert to three-row layout (current price, segments, symbols/prices)
- [x] Switch from absolute positioning to flexbox
- [x] Standardize symbol widths to 9px
- [x] Apply theme variables throughout
- [ ] Handle stop loss changes elegantly
- [ ] Refine bottom row width solution
- [ ] Add pending and closed position indicators
- [ ] Create visual key component
- [ ] Add hover states and tooltips
- [ ] Test with various price scenarios
- [ ] Ensure mobile responsiveness
- [ ] Document the visualization logic

### Notes
- Successfully refactored from 350+ lines to 337 lines
- Three-row layout: current price (top), segments (middle), symbols/prices (bottom)
- Flexbox layout provides better maintainability than absolute positioning
- Dynamic current price positioning based on actual values working correctly
- Bottom row alignment solved with equal-width containers
- Remaining work focuses on edge cases and visual polish