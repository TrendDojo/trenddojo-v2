# TrendDojo Active Work Blocks

> 🚀 **CRITICAL DEPLOYMENT PROCESS**
> **BEFORE ANY DEPLOYMENT**: READ `/docs/DEPLOYMENT_GUIDE.md`
> - **MANDATORY**: Complete all 4 phases (Local → Preview → Documentation → Production)
> - **NEVER** skip steps or push directly to production
> - **AI ASSISTANT**: You are responsible for the COMPLETE deployment process

## 🔴 MANDATORY AI CONTEXT REFRESH
**BEFORE STARTING ANY WORK BLOCK, YOU MUST READ:**
1. `/docs/CLAUDE.md` - Rules & behavior
2. `/docs/PROJECT_CONTEXT.md` - Project specifics
3. `/_workblocks/ACTIVE_WORK_BLOCKS.md` - Current work (this file)

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
- [x] **MULTI-SOURCE**: Create IDataProvider interface (DONE 2025-01-27)
- [x] **MULTI-SOURCE**: Build DataRouter class (DONE 2025-01-27)
- [x] **MULTI-SOURCE**: Add source tracking to responses (DONE 2025-01-27)
- [x] **DATABASE**: Add data_tier, is_primary to broker_connections (DONE 2025-01-27)
- [x] **DATABASE**: Create user_data_preferences table (DONE 2025-01-27)
- [x] **DATABASE**: Create user_data_sources table (DONE 2025-01-27)
- [x] **DATABASE**: Uncomment DataRouter code for new tables (DONE 2025-01-27)
- [x] Set up production PostgreSQL market schema (DONE 2025-01-27)
- [x] Configure read-only access for dev/staging (DONE 2025-01-27)
- [x] Implement Vercel Cron for updates (DONE 2025-01-27)
- [x] Create sync state tracking per environment (DONE 2025-01-27)
- [x] Build catch-up mechanism for data gaps (DONE 2025-01-27)
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
- See `/docs/MARKET_DATA_SYSTEM.md` for detailed design

### Implementation Strategy
1. **Phase 1**: Polygon historical + Alpaca live when connected
2. **Phase 2**: Add data source selection UI
3. **Phase 3**: Add more brokers (IBKR, TD Ameritrade)
4. **Phase 4**: Add crypto sources (Coinbase, Binance)
5. **Phase 5**: Add forex sources

## WB-2025-09-28-003: Paper Trading MVP Launch Plan Implementation
**State**: pending
**Timeframe**: LATER
**Created**: 2025-09-28
**Dependencies**: WB-2025-09-28-002 (deployment automation)
**Tags**: #launch #paper-trading #security #infrastructure #mvp

### Goal
Implement the complete 4-week sprint plan to launch TrendDojo as a free paper trading platform, focusing on security foundation, infrastructure setup, feature completion, and beta launch.

### Tasks
- [ ] **Week 1: Security Foundation**
  - [ ] Create encryption service for broker credentials (AES-256-GCM)
  - [ ] Add password authentication to User model
  - [ ] Implement bcrypt password hashing in auth.ts
  - [ ] Configure secure environment variables for all stages
  - [ ] Set up encryption keys and NextAuth secrets

- [ ] **Week 2: Infrastructure Setup**
  - [ ] Set up Supabase production project
  - [ ] Deploy database migrations to production
  - [ ] Enable Row-Level Security (RLS) policies
  - [ ] Implement API rate limiting (100 requests/minute per user)
  - [ ] Add input validation with Zod schemas
  - [ ] Deploy staging environment with security scan

- [ ] **Week 3: Feature Completion**
  - [ ] Connect strategies to Alpaca paper trading execution
  - [ ] Implement real-time position monitoring with WebSocket
  - [ ] Add live P&L updates to positions page
  - [ ] Build comprehensive end-to-end testing
  - [ ] Polish UI/UX and error handling
  - [ ] Create help documentation and onboarding flow

- [ ] **Week 4: Beta Launch**
  - [ ] Conduct final security audit and penetration testing
  - [ ] Set up beta user signup and welcome emails
  - [ ] Create Terms of Service, Privacy Policy, Risk Disclaimers
  - [ ] Deploy to production with monitoring
  - [ ] Launch to controlled beta group
  - [ ] Monitor metrics and gather feedback

### Success Criteria
- 10 beta users signed up in first week
- 5 users successfully connect Alpaca paper accounts
- 3 users create and execute strategies
- 0 security incidents during launch
- 95% uptime maintained
- 100+ paper trades executed in first month

### Notes
- Converted from LAUNCH_PLAN_2025.md
- Focus on paper trading only - no real money risk
- Free tier limits: 3 strategies, 5 positions, 10 daily trades
- Hard-coded safety: REAL_MONEY_ENABLED = false
- Security-first approach with encryption and RLS

## WB-2025-09-28-004: Production Readiness Implementation
**State**: pending
**Timeframe**: NOW
**Created**: 2025-09-28
**Dependencies**: None
**Tags**: #production #security #infrastructure #database #critical

### Goal
Address all critical gaps identified in production readiness checklist to make TrendDojo ready for multi-tenant production deployment with proper security, encryption, and monitoring.

### Tasks
- [ ] **Database & Infrastructure**
  - [ ] Migrate from local PostgreSQL to Supabase production
  - [ ] Enable Row-Level Security (RLS) on all user data tables
  - [ ] Deploy database migrations to production environment
  - [ ] Set up database backup strategy and monitoring
  - [ ] Configure error tracking with Sentry

- [ ] **Authentication Security**
  - [ ] Add passwordHash field to User model
  - [ ] Implement bcrypt password hashing (min 12 rounds)
  - [ ] Generate secure NEXTAUTH_SECRET for production
  - [ ] Set up account lockout after failed login attempts
  - [ ] Configure session management with secure cookies

- [ ] **Broker Credential Security**
  - [ ] Implement AES-256-GCM encryption service
  - [ ] Update broker connection API to encrypt credentials
  - [ ] Add credential rotation policies
  - [ ] Implement audit logging for credential access
  - [ ] Test encryption/decryption with real broker APIs

- [ ] **API Security & Rate Limiting**
  - [ ] Implement rate limiting (100 requests/minute per user)
  - [ ] Add input validation with Zod schemas on all endpoints
  - [ ] Configure CORS policies for production
  - [ ] Enable CSRF protection verification
  - [ ] Set up DDoS protection via Cloudflare/Vercel

- [ ] **Environment Configuration**
  - [ ] Create .env.production with all required variables
  - [ ] Set up Vercel environment variables securely
  - [ ] Configure production database URLs
  - [ ] Set up email service (SendGrid) for notifications
  - [ ] Configure monitoring and alerting services

- [ ] **Deployment & Monitoring**
  - [ ] Configure Vercel build with Prisma migrations
  - [ ] Set up domain and SSL certificates
  - [ ] Implement health checks and uptime monitoring
  - [ ] Create incident response plan
  - [ ] Set up performance tracking and database monitoring

### Success Criteria
- All broker credentials encrypted at rest
- RLS policies prevent cross-user data access
- Rate limiting prevents API abuse
- Production database configured with backups
- Security audit passes with no critical vulnerabilities
- Monitoring alerts work for errors and downtime
- Load testing completed successfully

### Notes
- Converted from PRODUCTION_READINESS.md
- Multi-tenant architecture already in place
- Focus on security hardening and production infrastructure
- Estimated 4-8 weeks to complete all items
- Launch with paper trading only initially

## WB-2025-09-28-005: Release Process Standardization
**State**: pending
**Timeframe**: NEXT
**Created**: 2025-09-28
**Dependencies**: WB-2025-09-28-002 (deployment automation)
**Tags**: #release-process #documentation #standards #automation

### Goal
Complete the implementation of standardized release documentation and process automation across the project, ensuring consistent and professional release management.

### Tasks
- [ ] **Release Documentation Standards**
  - [ ] Verify CHANGELOG.md follows standard format
  - [ ] Ensure docs/releases/ directory has proper structure
  - [ ] Create release note templates for different release types
  - [ ] Document version numbering strategy (semantic versioning)

- [ ] **Automated Release Tools**
  - [ ] Install and configure standard-version for automated changelog
  - [ ] Add release scripts to package.json
  - [ ] Create postrelease verification hooks
  - [ ] Set up automated version bumping and tagging

- [ ] **GitHub Actions Integration**
  - [ ] Create .github/workflows/release.yml
  - [ ] Add automated GitHub release creation
  - [ ] Configure release notes generation from commits
  - [ ] Set up automated deployment triggers

- [ ] **Process Documentation**
  - [ ] Update deployment workflow with Phase 3 (versioning)
  - [ ] Create quick reference guide for releases
  - [ ] Document rollback procedures
  - [ ] Add release checklist template

- [ ] **Cross-Project Implementation**
  - [ ] Apply release standards to other portfolio projects
  - [ ] Update shared framework with lessons learned
  - [ ] Create onboarding documentation for new developers
  - [ ] Test automation with patch/minor/major releases

### Success Criteria
- Version numbers assigned after preview verification
- CHANGELOG.md automatically updated from commits
- Releases take <5 minutes with automation
- GitHub releases created automatically with proper notes
- Process documented and repeatable
- Standards applied consistently across projects

### Notes
- Converted from RELEASE_PROCESS_IMPLEMENTATION.md
- Builds on existing work in shared framework
- Integrates with deployment automation from WB-2025-09-28-002
- Critical rule: version AFTER preview testing, not before
- Standard location for cross-project consistency

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

## WB-2025-09-28-002: Implement Atomic Deployment Automation
**State**: pending
**Timeframe**: NOW
**Created**: 2025-09-28
**Dependencies**: None
**Tags**: #deployment #automation #devops #efficiency

### Goal
Implement the automation scripts and tooling to achieve <5 minute deployments, preventing future 3+ hour deployment sessions like v0.4.0.

### Context
v0.4.0 deployment took 3+ hours due to missing DATABASE_URL parameter, manual migration setup, and documentation updates. This work block implements automation to prevent these issues.

### Tasks
- [ ] Create environment variable validator
  - [ ] Build `src/lib/env-validator.ts` with validation rules
  - [ ] Check DATABASE_URL includes `?pgbouncer=true`
  - [ ] Check MIGRATE_DATABASE_URL uses port 5432
  - [ ] Validate all required env vars exist

- [ ] Implement pre-flight check script
  - [ ] Create `scripts/deployment/preflight-check.sh`
  - [ ] Test environment variables
  - [ ] Verify database connection
  - [ ] Check migration status
  - [ ] Validate API keys via health endpoint

- [ ] Add automated release scripts
  - [ ] Install and configure `standard-version`
  - [ ] Add release scripts to package.json
  - [ ] Create postrelease verification hook
  - [ ] Test version bumping and tagging

- [ ] Set up GitHub Actions workflow
  - [ ] Create `.github/workflows/release.yml`
  - [ ] Add Vercel deployment step
  - [ ] Add health check verification
  - [ ] Configure GitHub release creation

- [ ] Update DEPLOYMENT_GUIDE.md
  - [ ] Add new quick release commands
  - [ ] Document automated workflow
  - [ ] Include rollback procedures
  - [ ] Remove manual steps

- [ ] Test the automation
  - [ ] Run pre-flight checks
  - [ ] Test release commands
  - [ ] Verify <5 minute deployment time
  - [ ] Test rollback procedure

### Success Criteria
- Next deployment takes <5 minutes
- Pre-flight checks catch configuration issues
- One command deploys and verifies
- DEPLOYMENT_GUIDE.md updated with new automation
- ATOMIC_DEPLOYMENT_STRATEGY.md can be deleted

### Notes
- This is implementation of the ATOMIC_DEPLOYMENT_STRATEGY.md blueprint
- Once complete, delete ATOMIC_DEPLOYMENT_STRATEGY.md
- Scripts live in `/scripts/deployment/`, not `/docs/`
- Update existing DEPLOYMENT_GUIDE.md, don't create new docs

## WB-2025-09-28-001: Stop Loss Architecture & Zero-Downtime Monitoring
**State**: pending
**Timeframe**: LATER
**Created**: 2025-09-28
**Dependencies**: Market data infrastructure, broker integrations
**Tags**: #critical #risk-management #monitoring #high-availability

### Goal
Design and implement a resilient stop-loss monitoring system that continues operating during deployments, outages, and maintenance windows.

### Critical Requirements
1. **Zero monitoring downtime** during deployments (blue-green or canary)
2. **Multi-layer redundancy** for critical stop-loss checks
3. **Sub-minute monitoring** for active positions near stops
4. **Clear user communication** about monitoring intervals and guarantees

### Architecture Options

#### Option 1: Distributed Worker Pattern (Recommended)
```typescript
// Separate monitoring service running outside main app
interface StopLossMonitor {
  primaryWorker: VercelCron;      // Every 60 seconds
  backupWorker: CloudflareWorker; // Failover if primary fails
  brokerDelegation: BrokerAPI;    // Native stop orders when available
}
```

**Deployment Strategy:**
- Deploy monitoring workers BEFORE main app
- Workers continue running during main app deployment
- Database remains accessible throughout
- Zero downtime achievable

#### Option 2: Broker-First with App Backup
```typescript
// Prefer broker-native stops, app monitors as backup
if (broker.supportsStopOrders()) {
  await broker.createStopOrder(params);  // Broker handles 24/7
  await app.monitorAsBackup(params);     // Secondary check
} else {
  await app.createMonitoredStop(params); // App primary monitor
  await notifyUser("60-second checks");  // Clear disclosure
}
```

#### Option 3: Edge Function Monitoring
- Deploy stop-loss checks to Vercel Edge Functions
- Run independently of main application
- Geographic distribution for redundancy
- ~10-30 second check intervals possible

### Implementation Phases

**Phase 1: Foundation (NEXT)**
- [ ] Design stop-loss data model
- [ ] Create monitoring service interface
- [ ] Build broker delegation system
- [ ] Implement basic 60-second checks
- [ ] Add monitoring status dashboard

**Phase 2: High Availability (LATER)**
- [ ] Deploy separate monitoring workers
- [ ] Implement failover logic
- [ ] Add health checks and alerting
- [ ] Create deployment coordination scripts
- [ ] Test zero-downtime deployments

**Phase 3: Advanced Features (FUTURE)**
- [ ] Adaptive check frequency (increase near stops)
- [ ] Push notifications for executions
- [ ] SMS/email alerts for critical events
- [ ] Multi-broker aggregation
- [ ] Partial fill handling

### Deployment Coordination

```bash
# Deployment sequence for zero downtime
1. Deploy monitoring workers (remain running)
2. Deploy database migrations (backward compatible)
3. Deploy new app version (blue-green swap)
4. Verify monitoring continuity
5. Decommission old version

# Monitoring never stops during steps 2-5
```

### Risk Mitigation
1. **Legal disclaimers** about check intervals and limitations
2. **User education** on broker-native vs app-monitored stops
3. **Terms of service** explicitly define monitoring guarantees
4. **Audit logging** of all stop-loss checks and executions
5. **Insurance/liability** considerations for live trading

### Technical Decisions Needed
- [ ] Choose primary monitoring architecture (workers vs edge)
- [ ] Select redundancy providers (Cloudflare, AWS, etc.)
- [ ] Define acceptable check intervals (60s, 30s, 10s)
- [ ] Determine paper-only vs live trading timeline
- [ ] Set monitoring SLAs and uptime targets

### Success Criteria
- Stop-losses continue monitoring during deployments
- 99.99% uptime for critical monitoring
- <60 second maximum check interval
- Clear user visibility into monitoring status
- Automatic failover with <30 second detection

### Notes
- Stop-loss monitoring is THE most critical feature for trader trust
- Even 5 minutes of downtime during volatile markets is unacceptable
- Consider regulatory requirements (SEC, FINRA) for trade execution
- May need separate infrastructure budget for redundancy
- Could become key differentiator: "TrendDojo Never Sleeps"

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

## WB-2025-09-28-006: Infrastructure Pattern Adoption from Controlla
**State**: completed
**Timeframe**: NOW
**Created**: 2025-09-06
**Completed**: 2025-09-06
**Dependencies**: None
**Tags**: #infrastructure #authentication #email #security #production-ready

### Goal
Adopt and adapt proven infrastructure patterns from Controlla V2 to provide production-ready foundations for TrendDojo's trading platform.

### Tasks Completed
- [x] Environment configuration system with trading safety features
- [x] Visual environment indicators with real money warnings
- [x] Multi-app SendGrid email service architecture
- [x] NextAuth configuration with trading permissions
- [x] Trading safety system with comprehensive checks
- [x] Enhanced unit testing for financial accuracy
- [x] Production-ready documentation

### Infrastructure Components Adopted

#### 1. Environment Configuration System
- **Source**: Controlla's environment detection system
- **Enhancement**: Added trading-specific safety (real money vs paper trading)
- **Features**: Auto-detection, visual indicators, feature flags
- **Safety**: Prevents accidental real money trades in non-production

#### 2. Multi-App Email Service
- **Architecture**: App-specific configs (TRENDDOJO, CONTROLLA)
- **Features**: Environment prefixes, template system, scalable design
- **Trading emails**: Trade confirmations, price alerts, portfolio notifications

#### 3. NextAuth with Prisma
- **Integration**: Full database adapter with relational data
- **Trading permissions**: Granular control (paper, real money)
- **Subscription tiers**: Free, Pro, Premium access levels

#### 4. Trading Safety System
- **Comprehensive checks**: Environment, user, parameter, risk validation
- **Critical features**: Real money protection, risk limits, market hours
- **Confirmation requirements**: Mandatory for real money trades

#### 5. Financial Testing Suite
- **Coverage**: 100% for financial calculations and safety checks
- **Edge cases**: Floating point precision, boundary conditions
- **Mock environments**: Testing across different trading modes

#### 6. Security Implementation
- **Real money protection**: Multiple environment checks
- **Authentication**: JWT tokens, bcrypt hashing, OAuth
- **Data protection**: Encryption, audit logging, secure sessions

### Outcome
**Success** - Complete infrastructure adoption providing production-ready foundations with enhanced trading safety features. All critical systems tested with 100% coverage on financial calculations.

### Notes
- Converted from INFRASTRUCTURE_ADOPTION.md during documentation refactor
- Successfully adapted patterns for trading-specific requirements
- Real SendGrid integration pending (using mock responses)
- Database migration from Controlla patterns pending

## WB-2025-09-28-007: Basic Stock Screener Implementation
**State**: doing
**Timeframe**: NOW
**Created**: 2025-09-28 15:00
**Dependencies**: Market Data Infrastructure (WB-2025-01-25-001)
**Tags**: #screener #filtering #market-data #ui

### Goal
Implement a basic working stock screener that filters stocks based on price, volume, market cap, and technical indicators using the existing market data infrastructure.

### Current State
- UI exists with sophisticated filter dropdowns
- Filters don't actually work (just dummy data)
- Yahoo Finance integration partially working
- Market data infrastructure available (SQLite)

### Tasks
- [ ] Connect screener to market data database
- [ ] Implement real filtering logic for:
  - [ ] Price range filters
  - [ ] Volume filters
  - [ ] Market cap filters
  - [ ] Sector filters
  - [ ] Technical indicators (RSI, moving averages)
  - [ ] Price change percentage
- [ ] Create API endpoint for screener queries
- [ ] Add proper data caching
- [ ] Implement sorting functionality
- [ ] Add pagination for large result sets
- [ ] Save/load filter presets to database
- [ ] Test with real market data

### Success Criteria
- Filters actually filter the data
- Results update when filters change
- Sorting works on all columns
- Can save and load filter presets
- Performance: <500ms for filter operations

### Notes
- Keep it simple - bare bones version first
- Use existing market data infrastructure
- Focus on making filters work, not adding features

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