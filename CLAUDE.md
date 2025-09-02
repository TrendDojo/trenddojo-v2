# TrendDojo AI Context

*Last updated: 2025-09-02*

## 🚨 PRODUCTION-READY RULES

### RULE #1: Financial Accuracy First
- All financial calculations MUST have unit tests before deployment
- Position sizing, P&L, risk calculations require validation
- Backend validation mandatory for all financial operations
- Never deploy financial logic without explicit approval

### RULE #2: Complete Features, Don't Fragment
- Finish current work block before starting new features
- Update docs in same commit as feature implementation
- Test → Deploy → Document completion
- Push back on scope creep: "New work block needed"

### RULE #3: Production Safety
- All broker integrations require comprehensive mocks for development
- Risk management changes need extra review
- Never test against live trading APIs during development
- Staging environment mirrors production exactly

### RULE #4: Git Workflow Discipline
- Feature branches for all development work
- Staging deployment required before production
- Work blocks only complete after successful deployment
- Descriptive commit messages with work block references

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

## 📁 Directory Structure
```
trenddojo/
├── _work/
│   ├── ACTIVE_WORK_BLOCKS.md
│   └── COMPLETED_WORK_BLOCKS.md
├── docs/ (pattern docs created as needed)
├── src/
│   ├── app/ (Next.js App Router)
│   ├── components/
│   ├── lib/ (utilities, calculations)
│   └── __tests__/
├── prisma/
└── .github/workflows/ (CI/CD)
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

## 🚫 Production Constraints
- No live trading API calls during development
- All financial calculations require unit tests
- Staging deployment before production
- Manual approval for risk management changes
- Git commit required before work block completion

---
*Framework Reference: ../_shared-framework/ for business context*