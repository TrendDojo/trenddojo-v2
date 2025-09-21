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


## WB-2025-01-21-001: Living Theme System Implementation
**State**: considering
**Timeframe**: NOW
**Created**: 2025-01-21 09:00
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
- [ ] Add tab navigation to theme page (Core Design System | Domain Components)
- [ ] Organize Core Design System tab with universal elements
- [ ] Create Domain Components tab for trading-specific UI
- [ ] Audit all components for inline styles
- [ ] Create buttonStyles.ts, panelStyles.ts, formStyles.ts
- [ ] Refactor ALL tables to use tableStyles.ts
- [ ] Update theme page to import real components
- [ ] Move universal components to Core tab
- [ ] Move trading components to Domain tab
- [ ] Implement nuclear test verification
- [ ] Add environment-based theme page access control
- [ ] Create development mode with interactive controls
- [ ] Build production mode with auth gate
- [ ] Add build-time flag to exclude theme page from production bundle
- [ ] Create style consistency monitoring script
- [ ] Document the living theme pattern in proven-solutions
- [ ] Create CI/CD checks for style consistency
- [ ] Build group-wide adoption tracking system
- [ ] Create template for other projects to adopt

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

## WB-2025-01-20-001: Broker Integration - Alpaca Paper Trading
**State**: doing
**Timeframe**: NOW
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