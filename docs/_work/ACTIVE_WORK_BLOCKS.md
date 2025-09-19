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

## WB-2025-01-18-001: Position Indicator Graphic Enhancement
**State**: confirmed
**Timeframe**: NOW
**Created**: 2025-01-18 12:00
**Dependencies**: None
**Tags**: #ui #visualization #positions #data-viz

### Goal
Enhance the position indicator graphic to provide accurate visual representation of position status with proper proportions relative to real pricing data.

### Requirements
1. **Fixed Width Implementation**
   - Convert from percentage-based to fixed pixel widths
   - Ensure consistent display across different screen sizes
   - Maintain responsiveness while keeping proportions accurate

2. **Correct Ratio Spacing**
   - Elements must be proportionally spaced based on actual price points
   - Entry price, current price, stop loss, and take profit positions must accurately reflect their relative distances
   - Visual representation should match real-world pricing ratios (e.g., if stop is 5% below entry and target is 10% above, the visual spacing should be 1:2)

3. **Visual Key/Legend**
   - Add a key explaining color coding and symbols
   - Include labels for: Entry Price, Current Price, Stop Loss, Take Profit
   - Consider hover tooltips for additional context
   - Position the key in an unobtrusive but accessible location

4. **Technical Considerations**
   - Calculate pixel positions based on price ranges
   - Handle edge cases (very tight stops, distant targets)
   - Ensure performance with multiple indicators on screen
   - Consider animation for price movements

### Tasks
- [ ] Analyze current PositionStatusBar implementation
- [ ] Design new calculation system for proportional spacing
- [ ] Implement fixed-width container with proper ratios
- [ ] Create visual key component
- [ ] Add hover states and tooltips
- [ ] Test with various price scenarios
- [ ] Ensure mobile responsiveness
- [ ] Document the visualization logic

### Notes
- Current implementation uses percentage-based positioning which doesn't reflect actual price relationships
- Need to balance accuracy with visual clarity (extreme ratios may need clamping)
- Consider using a logarithmic scale for very large price ranges