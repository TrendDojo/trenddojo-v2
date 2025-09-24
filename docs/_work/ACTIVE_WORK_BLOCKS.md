# TrendDojo Active Work Blocks

## 🔴 MANDATORY AI CONTEXT REFRESH
**BEFORE STARTING ANY WORK BLOCK, YOU MUST READ:**
1. `/CLAUDE.md` - Rules & behavior
2. `/docs/PROJECT_CONTEXT.md` - Project specifics
3. `/docs/_work/ACTIVE_WORK_BLOCKS.md` - Current work (this file)

**AT EACH TOUCHPOINT (session start, context switch, new task), RE-READ ALL THREE FILES**

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

## WB-2025-01-21-001: Living Theme System Implementation
**State**: confirmed
**Timeframe**: NEXT
**Created**: 2025-01-21 09:00
**Updated**: 2025-01-22 14:30
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
- [ ] Audit all TrendDojo components for inline styles
- [ ] Create buttonStyles.ts, panelStyles.ts, formStyles.ts
- [ ] Refactor ALL tables to use tableStyles.ts (partially done)
- [ ] Add tab navigation to theme page (Core Design System | Domain Components)
- [ ] Organize Core Design System tab with universal elements
- [ ] Create Domain Components tab for trading-specific UI
- [ ] Update theme page to import real components
- [ ] Move universal components to Core tab
- [ ] Move trading components to Domain tab
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
**State**: confirmed
**Timeframe**: NOW
**Created**: 2025-01-24 11:45
**Updated**: 2025-01-24 12:30
**Dependencies**: None
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
**State**: doing
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