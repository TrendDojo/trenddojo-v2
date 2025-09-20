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

## WB-2025-01-19-001: Trading Strategy Implementation - MVP
**State**: completed
**Timeframe**: NOW
**Created**: 2025-01-19 14:00
**Updated**: 2025-01-19 15:00 (Simplified to MVP scope)
**Completed**: 2025-01-19 16:30
**Duration**: 2.5 hours
**Outcome**: Success - MVP UI fully implemented
**Dependencies**: None (simplified)
**Tags**: #trading #strategies #mvp #business-critical

### Goal
Ship a dead-simple strategy management page where users can create strategies by picking 3 rules (entry, position, exit) and track basic performance.

### MVP Requirements (Simplified from Original)
1. **Single Page with Two Tabs**
   - Strategies Tab: List view with Name, Status, P&L, Win Rate
   - Rules Tab: Three sections showing available rules
   - "New Strategy" button opens modal

2. **Strategy Creation**
   - Modal with 3 dropdowns (Entry, Position, Exit)
   - No editing after creation
   - Can only pause/resume

3. **Fixed Rules (9 Total)**
   - Entry: Breakout, Pullback, Manual
   - Position: 2% Risk (only one for now)
   - Exit: 2R Target, Trail 20MA, Manual

4. **Basic Performance Tracking**
   - Count trades
   - Calculate win rate
   - Sum P&L
   - That's it

### Tasks (MVP Only)
- [x] Review and align with MVP requirements
- [ ] Create rules table migration (id, type, name, config_json)
- [ ] Seed database with 9 fixed rules
- [ ] Build strategies page with tabs (Strategies/Rules)
- [ ] Create strategy list table component
- [ ] Build rules display (3 sections, simple list)
- [ ] Create "New Strategy" modal (3 dropdowns + create)
- [ ] Implement pause/resume functionality
- [ ] Add basic P&L calculation from trades
- [ ] Calculate and display win rate
- [ ] Connect to trades table for performance data
- [ ] Add expandable row to show positions
- [ ] Basic testing with mock trades

### What We're NOT Building (Yet)
- ❌ Complex strategy builder
- ❌ Backtesting
- ❌ Signal generation
- ❌ Custom indicators
- ❌ Rule versioning
- ❌ Strategy cloning
- ❌ Advanced metrics (Sharpe, etc.)
- ❌ Automated trading

### Database Changes Needed
```sql
-- New rules table
CREATE TABLE rules (
  id SERIAL PRIMARY KEY,
  type VARCHAR(20), -- 'entry', 'position', 'exit'
  name VARCHAR(50),
  config_json JSONB
);

-- Simplified strategies table
CREATE TABLE strategies (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100),
  entry_rule_id INT REFERENCES rules(id),
  position_rule_id INT REFERENCES rules(id),
  exit_rule_id INT REFERENCES rules(id),
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Basic trades table
CREATE TABLE trades (
  id SERIAL PRIMARY KEY,
  strategy_id INT REFERENCES strategies(id),
  symbol VARCHAR(10),
  entry_price DECIMAL,
  exit_price DECIMAL,
  pnl DECIMAL,
  status VARCHAR(20),
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Success Criteria
✅ User can create a strategy in <30 seconds
✅ Strategy appears in list immediately
✅ Can see P&L updating as trades happen
✅ Can pause/resume strategies
✅ Total implementation time: 2-3 days max

### Notes
- This is a radical simplification of the original work block
- Focus on shipping something users can interact with TODAY
- Once MVP works, we can add complexity incrementally
- No automation in MVP - all trades can be manual

## WB-2025-01-18-001: Position Indicator Graphic Enhancement
**State**: doing
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