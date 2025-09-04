# TrendDojo AI Context

*Last updated: 2025-09-04*

## 🚨 MANDATORY RULES (IN ORDER OF PRECEDENCE)

### RULE #1: Financial Accuracy First - No Exceptions
- All financial calculations MUST have unit tests before deployment
- Position sizing, P&L, risk calculations require validation
- Backend validation mandatory for all financial operations
- Never deploy financial logic without explicit approval
- **NEVER test against live trading APIs during development**

### RULE #2: Complete Features, Don't Fragment
- Finish current work block before starting new features
- Update docs in same commit as feature implementation
- Test → Deploy → Document completion
- **PUSH BACK**: "That needs a new work block. Let's finish current work first."

### RULE #3: Production Safety & Documentation
- All broker integrations require comprehensive mocks for development
- Risk management changes need extra review
- Staging environment mirrors production exactly
- **ALL DOCUMENTATION MUST LIVE IN `/docs/` DIRECTORY**
- When you add a feature, update relevant docs immediately

### RULE #4: Work Block Completion Requires Git Commit
- **NEVER CLOSE** a work block without explicit user permission
- Work blocks can only be marked "completed" after:
  1. User explicitly approves closure
  2. All changes are committed to git
  3. User confirms the commit is satisfactory
- Always ask: "Ready to commit these changes?" before closing

## 📋 Project Overview
**Name:** TrendDojo
**Purpose:** "Stripe for Trading Strategies" - sophisticated automation layer for systematic trading
**Target:** Professionals with $25k+ portfolios wanting systematic execution without daily management
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
- **Technical Setup**: `/docs/reference/trenddojo-setup-technical-spec.md` - Complete technical architecture
- **Database Plan**: `/docs/DATABASE-PLAN.md` - Database schema and deployment
- **Work Tracking**: `/docs/_work/ACTIVE_WORK_BLOCKS.md` - Current work context
- **Work History**: `/docs/_work/COMPLETED_WORK_BLOCKS.md` - Historical record
- **Archive**: `/docs/archive/` - V1 reference materials and legacy docs

## 🔧 Tool Usage Preferences
**IMPORTANT**: Use `Read` tool instead of `grep` for file searches
- The `Read` tool doesn't require permission prompts, allowing faster workflow
- When searching for patterns across files, use `Glob` to find files then `Read` to examine them
- Only use `grep` if you need complex regex patterns that can't be done with Read/Glob combination

## 📁 Directory Structure
```
trenddojo-v2/
├── docs/
│   ├── CLAUDE.md                    # This file
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

## 🚫 Forbidden Actions
**DO NOT:**
- NEVER deploy financial calculations without unit tests → ALWAYS write tests first
- NEVER use live trading APIs in development → ALWAYS use mocks and paper trading
- NEVER skip staging deployment → ALWAYS test on staging before production  
- NEVER close work blocks without approval → ALWAYS ask user permission first
- NEVER ignore risk management changes → ALWAYS get extra review for risk logic
- NEVER create files outside `/docs/` → ALL documentation lives in `/docs/` directory
- NEVER fragment features → ALWAYS complete current work block before starting new ones

## ⚠️ Tech Stack Reality Check
The actual implementation uses:
- **Database**: PostgreSQL (Supabase) - staging/production not yet connected
- **Auth**: NextAuth.js v5 
- **Deployment**: Vercel (marketing site deployed successfully)
- **Status**: Marketing brochure complete, core features pending

---
*Framework Reference: `../../../_shared-framework/` for business context*