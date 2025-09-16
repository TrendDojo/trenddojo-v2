# TrendDojo Project Context

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
GitHub → Staging (automatic) → Production (manual promotion)
- Feature branches deploy to preview URLs
- Main branch deploys to staging
- Production requires manual promotion + approval
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

### Technical Documentation
- **Technical Setup**: `/docs/reference/trenddojo-setup-technical-spec.md` - Complete technical architecture
- **Database Plan**: `/docs/DATABASE-PLAN.md` - Database schema and deployment
- **Trading Philosophy**: `/docs/TRADING-PHILOSOPHY.md` - What we support and DON'T support

### Work Management
- **Work Tracking**: `/docs/_work/ACTIVE_WORK_BLOCKS.md` - Current work context
- **Work History**: `/docs/_work/COMPLETED_WORK_BLOCKS.md` - Historical record
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
**Stage:** Production setup phase
**Priority:** Establish deployment pipeline + core patterns
**Next:** Implement setup document specifications

## ⚠️ Tech Stack Reality Check
The actual implementation uses:
- **Database**: PostgreSQL (Supabase) - staging/production not yet connected
- **Auth**: NextAuth.js v5
- **Deployment**: Vercel (marketing site deployed successfully)
- **Status**: Marketing brochure complete, core features pending

## 🎯 Recent Architecture Decisions

### Hierarchical Risk Management (2025-09-16)
- Account → Strategy → Position rule hierarchy
- Strategy cloning for rule changes (immutable once positions exist)
- Circuit breakers with progressive drawdown tiers
- Asset-class specific risk limits

### Database Schema Evolution
- Added `parentStrategyId` for strategy versioning
- Added `accountStatus` and `currentDrawdown` to portfolios
- JSON fields for flexible risk rules instead of rigid tables
- Minimal changes following "Marie Kondo" principle