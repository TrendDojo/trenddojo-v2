# TrendDojo Roadmap

*Last Updated: 2025-01-26*

## 📚 Overview
This roadmap provides a high-level view of planned and completed features. For implementation details, see the referenced work blocks and documentation.

## 🚀 High-Level Roadmap

### Near Term (NEXT)
1. **Stop Loss Implementation** - Waiting on business decision
2. **Manual Position Entry** - Critical for user adoption
3. **Alpaca Integration** - Enable real trading
4. **End-of-Day Data Consolidation** - Complete data pipeline

### Medium Term (LATER)
1. **Advanced Charting** - More indicators and drawing tools
2. **Strategy Backtesting** - Test strategies on historical data
3. **Multi-broker Support** - Interactive Brokers, TDAmeritrade
4. **Mobile App** - iOS/Android native apps

### Long Term (FUTURE)
1. **AI Strategy Generation** - ML-powered strategy creation
2. **Social Trading** - Copy trading and strategy marketplace
3. **Institutional Features** - Multi-account management
4. **Regulatory Compliance** - SEC/FINRA reporting

## 📈 Success Metrics

### Completed
- ✅ 107,000+ historical price records imported
- ✅ <10ms query performance achieved
- ✅ 100+ symbols with full historical data
- ✅ Risk management system operational
- ✅ Trading mode differentiation working
- ✅ 1-minute data refresh architecture designed

### Target Metrics
- 📊 1-minute data freshness (ready to implement)
- 📊 1000+ active symbols (infrastructure ready)
- 📊 Stop loss monitoring (awaiting approval)
- 📊 Live broker integration (next priority)
- 📊 10,000+ users scalability

## 🔗 Quick Links

### Documentation
- [Architecture Overview](/docs/architecture/)
- [Pattern Library](/docs/patterns/)
- [Work Blocks](/_workblocks/ACTIVE_WORK_BLOCKS.md)
- [Completed Work](/_workblocks/COMPLETED_WORK_BLOCKS.md)
- [API Reference](/docs/api/)

### Key Files
- [Market Data Cache](/src/lib/market-data/cache/MarketDataCache.ts)
- [Risk Management](/src/lib/risk/)
- [Broker Manager](/src/lib/brokers/)
- [UI Components](/src/components/)

### Development
- [Local Setup](/docs/LOCAL_SETUP.md)
- [Testing Strategy](/docs/TESTING_STRATEGY.md)
- [Deployment Guide](/docs/DEPLOYMENT.md)

---

## 🎯 Active/Planned Features

### 🛑 Stop Loss Monitoring System
**Work Block**: [WB-2025-01-26-001](/_workblocks/ACTIVE_WORK_BLOCKS.md#wb-2025-01-26-001-stop-loss-architecture-monitoring-strategy)
**Priority**: HIGH
**Status**: Blocked (Business Decision)
**Documentation**:
- [Data Refresh Architecture](/docs/architecture/DATA-REFRESH-ARCHITECTURE.md)

**Planned Features**:
- 1-minute stop loss checks (paper trading)
- Broker delegation for live stops
- Clear disclaimers and user education
- Progressive rollout (paper → live)

**Decision Required**: Accept paper-only implementation with 60-second checks?

---

### ✏️ Manual Position Management
**Work Block**: [WB-2025-01-24-002](/_workblocks/ACTIVE_WORK_BLOCKS.md#wb-2025-01-24-002-manual-position-management)
**Priority**: HIGH
**Status**: Paused (Depends on Market Data)
**Documentation**: TBD

**Planned Features**:
- Manual position entry (quick & detailed modes)
- Symbol search with autocomplete
- External position tracking
- Fee and commission tracking
- CSV import capability
- Position editing and notes

---

### 🔌 Broker Integration - Alpaca
**Work Block**: [WB-2025-01-20-001](/_workblocks/ACTIVE_WORK_BLOCKS.md#wb-2025-01-20-001-broker-integration-alpaca-paper-trading)
**Priority**: HIGH
**Status**: Paused
**Documentation**:
- [Broker Integration Guide](/docs/brokers/BROKER_INTEGRATION.md)

**Planned Features**:
- Alpaca paper trading connection
- Order placement and execution
- Position synchronization
- Real-time updates via WebSocket
- Credential encryption

---

### 🎨 Living Theme System
**Work Block**: [WB-2025-01-21-001](/_workblocks/ACTIVE_WORK_BLOCKS.md#wb-2025-01-21-001-living-theme-system-implementation)
**Priority**: MEDIUM
**Status**: Paused
**Documentation**:
- [Design System](/docs/features/DESIGN_SYSTEM.md)
- Theme page at `/dev/theme`

**Planned Features**:
- Complete style centralization
- Domain components tab
- Nuclear test verification
- Production access control
- Group-wide monitoring system

**Completed So Far**:
- Centralized style files (buttons, tables, panels)
- Tabbed theme showcase
- Home page theme adoption

---

### 📊 Position Status Indicator
**Work Block**: [WB-2025-01-18-001](/_workblocks/ACTIVE_WORK_BLOCKS.md#wb-2025-01-18-001-position-indicator-graphic-enhancement)
**Priority**: LOW
**Status**: Paused
**Documentation**: Component in `/src/components/positions/PositionStatusBar.tsx`

**Planned Features**:
- Visual key/legend
- Hover tooltips
- Mobile responsiveness
- Pending/closed position states

**Completed So Far**:
- Fixed-width implementation
- Proportional spacing
- Three-row layout

---

## ✅ Completed Features

### 📊 Market Data Infrastructure
**Work Block**: [WB-2025-01-25-001](/_workblocks/ACTIVE_WORK_BLOCKS.md#wb-2025-01-25-001-market-data-infrastructure)
**Status**: Production Ready (Partial)
**Documentation**:
- [Data Refresh Architecture](/docs/architecture/DATA-REFRESH-ARCHITECTURE.md)
- [Market Database Service](/src/lib/market-data/database/MarketDatabase.ts)

**Features Delivered**:
- SQLite storage for 100+ symbols (107k+ records)
- Sub-10ms query performance
- CDNChart component with TradingView integration
- API routes for historical data access
- 2-hour intraday bar storage
- 1-minute bulk update architecture (documented, not deployed)

---

### 🎨 UI Enhancement & Trading Modes
**Work Block**: [WB-2025-01-24-001](/_workblocks/ACTIVE_WORK_BLOCKS.md#wb-2025-01-24-001-ui-enhancement-and-trading-mode-implementation)
**Status**: Complete
**Documentation**:
- [UX Patterns](/docs/patterns/UX-PATTERNS.md)
- [Design Patterns](/docs/patterns/DESIGN-PATTERNS.md)

**Features Delivered**:
- DevDropdown menu with amber styling
- Flexible trading mode indicators (paper/live)
- Enhanced positions page with dual-mode support
- Broker connection status cards
- Symbol detail pages with real charts
- Global refresh indicator (dev-only)

---

### 🎯 Hierarchical Risk Management System
**Work Block**: [WB-2025-09-16-001](/_workblocks/ACTIVE_WORK_BLOCKS.md#wb-2025-09-16-001-hierarchical-risk-management-implementation)
**Status**: Production Ready
**Documentation**:
- [Risk Management Patterns](/docs/patterns/TRADING-PATTERNS.md#risk-management)
- Database schema includes risk_settings table

**Features Delivered**:
- Account → Strategy → Position risk hierarchy
- Strategy cloning for versioning
- Circuit breakers with progressive tiers
- Flexible JSON configuration for risk rules
- AccountStatusBar UI component

---

*This roadmap is manually maintained. Update when completing or planning major features.*