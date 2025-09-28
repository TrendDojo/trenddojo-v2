# TrendDojo Project Context

<!-- Last verified: 2025-01-26 (commit: a53d260) -->

## 📋 Project Overview
**Name:** TrendDojo
**Purpose:** "Stripe for Trading Strategies" - sophisticated automation layer for systematic swing and trend following trading
**Target:** Professionals with $25k+ portfolios wanting systematic execution without daily management
**Trading Focus:** Swing trading (3-10 days) and trend following (weeks-months). **NO DAY TRADING SUPPORT.**
**Business Model:** SaaS subscriptions (free → $4.99 → $14.99 → $39.99)

## 🏗️ Production Architecture

### Confirmed Tech Stack
- **Framework:** Next.js 14+ App Router (Vercel deployment)
- **Database:** PostgreSQL (Supabase)
- **API:** tRPC for type safety
- **Auth:** NextAuth.js
- **Payments:** Airwallex
- **State:** Zustand
- **UI:** Tailwind + Shadcn/ui
- **Testing:** Vitest + Playwright
- **CI/CD:** GitHub → Staging (Vercel) → Production (Vercel)

### Deployment Pipeline
```
WB-* → dev → PR to staging → PR to main
- Work block branches (WB-*) for active development
- dev branch accumulates completed features
- PR from dev → staging deploys to staging environment
- PR from staging → main deploys to production
- Version tags on main for releases
```

## 💼 Core Business Workflows
1. **User Onboarding:** Account creation → subscription tier → broker connection
2. **Portfolio Management:** Risk settings → position planning → execution
3. **Trade Lifecycle:** Entry → management → exit → analysis
4. **Performance Tracking:** P&L calculation → risk-adjusted returns → reporting

## 📚 Key Reference Documents

### Pattern Documentation (CHECK BEFORE BUILDING)
- **Design Patterns**: `/docs/patterns/DESIGN-PATTERNS.md` - UI components, colors, trading-specific styling
- **Architecture Patterns**: `/docs/patterns/ARCHITECTURE-PATTERNS.md` - tRPC, Next.js, financial data handling
- **UX Patterns**: `/docs/patterns/UX-PATTERNS.md` - Trading forms, real-time updates, mobile patterns
- **Trading Patterns**: `/docs/patterns/TRADING-PATTERNS.md` - Risk management, position sizing, strategy implementation
- **Broker Integration**: `/docs/BROKER_INTEGRATION.md` - Alpaca, IBKR integration patterns
- **Market Data System**: `/docs/MARKET_DATA_SYSTEM.md` - Complete market data architecture and implementation guide

### Technical Documentation
- **Architecture**: `/docs/reference/ARCHITECTURE.md` - System architecture and tech stack
- **Data Models**: `/docs/reference/DATA_MODELS.md` - Database schemas and data structures
- **API Specification**: `/docs/reference/API_SPECIFICATION.md` - API endpoints and request/response formats
- **UI Components**: `/docs/reference/UI_COMPONENTS.md` - Component specifications and patterns
- **Broker Integration**: `/docs/BROKER_INTEGRATION.md` - External broker API integrations
- **Database Plan**: `/docs/DATABASE-PLAN.md` - Database schema and deployment
- **Trading Philosophy**: `/docs/TRADING-PHILOSOPHY.md` - What we support and DON'T support

### Work Management
- **Work Tracking**: `/_workblocks/ACTIVE_WORK_BLOCKS.md` - Current work context
- **Work History**: `/_workblocks/COMPLETED_WORK_BLOCKS.md` - Historical record
- **Archive**: `/docs/archive/` - V1 reference materials and legacy docs

## 📁 Directory Structure
```
trenddojo-v2/
├── docs/
│   ├── PROJECT_CONTEXT.md           # This file - project specifics
│   ├── _work/                       # Work block tracking
│   ├── patterns/                    # Design, architecture, UX patterns
│   ├── reference/                   # Implementation guides
│   ├── adr/                        # Architecture Decision Records
│   └── archive/                    # Historical documents
├── src/
│   ├── app/                        # Next.js App Router
│   ├── components/
│   ├── lib/                        # Utilities, calculations
│   └── __tests__/
├── prisma/
└── .github/workflows/              # CI/CD
```

## 🔐 Security & Compliance
- **API Keys:** Environment variables, Vercel secrets, rotation procedures
- **Financial Data:** Audit trails, regulatory compliance, secure transmission
- **User Privacy:** GDPR compliance, data retention, secure deletion
- **Trading Safety:** Position limits, stop losses, risk validation

## ✅ Current Status
**Stage:** Core infrastructure complete, building trading features
**Current Branch:** main
**Priority:** Stop loss monitoring decision & manual position entry
**Next:** Complete 1-minute data refresh deployment

## ⚠️ Tech Stack Reality Check
The actual implementation uses:
- **Database**: PostgreSQL (Supabase) for main data, SQLite for market data cache
- **Market Data**: Polygon.io API with 1-minute bulk update architecture (designed, not deployed)
- **Auth**: NextAuth.js v4 with credentials + OAuth providers
- **Deployment**: Vercel (marketing site live at trenddojo.com)
- **Status**: Marketing complete, risk management system operational, market data infrastructure ready

## 🎯 Recent Architecture Decisions

### 1-Minute Bulk Update Strategy (2025-01-26)
- Fetch ALL market symbols every minute (8000+ tickers)
- Single API call more efficient than individual fetches
- Enables stop loss monitoring with 60-second precision
- PostgreSQL cache with 2-minute TTL
- SQLite for permanent historical storage

### Market Data Infrastructure (2025-01-25)
- CDNChart component with TradingView integration
- 2-hour intraday bars for swing trading focus
- 107,000+ historical records imported
- Sub-10ms query performance achieved

### Hierarchical Risk Management (2025-09-16)
- Account → Strategy → Position rule hierarchy
- Strategy cloning for rule changes (immutable once positions exist)
- Circuit breakers with progressive drawdown tiers
- JSON fields for flexible risk rules