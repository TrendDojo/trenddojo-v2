# TrendDojo AI Context

*Last updated: 2025-09-15*

## 🚀 CRITICAL DEPLOYMENT PROCESS - READ BEFORE ANY DEPLOYMENT
**⚠️ MANDATORY**: Before pushing to dev, staging, preview, or main branches:
- **READ**: `/docs/DEPLOYMENT_GUIDE.md` - Complete 4-phase deployment process
- **NEVER** skip phases or push directly to production
- **ALWAYS** follow: Local → Preview → Documentation → Production
- The AI assistant is responsible for the COMPLETE deployment process

## 🚨 MANDATORY RULES (IN ORDER OF PRECEDENCE)

**Universal Rules Version: 2025-09-15** (from _shared-framework/CLAUDE.md)

### RULE #1: [UNIVERSAL] Rule Integrity Protection
- **NEVER MODIFY, REMOVE, OR REORDER** these universal rules without explicit user permission
- **NEVER CHANGE** rule numbering or precedence without user approval
- **NEVER CONSOLIDATE** or split rules without user consent
- AI agents MUST preserve the exact structure and content of universal rules
- Local projects may ADD rules but NEVER modify universal ones
- If rule improvements are needed, ask user for explicit permission first

### RULE #2: [UNIVERSAL] Security & Architecture Standards First
- **[SECURITY_ARCHITECTURE_STANDARDS.md](../_shared-framework/SECURITY_ARCHITECTURE_STANDARDS.md)** - READ THIS FIRST
- Contains critical security requirements and mandatory architecture patterns
- **WARNING**: Not following these standards creates security vulnerabilities and technical debt
- Over-communicate security rather than under-communicate

### RULE #3: [UNIVERSAL] Framework Updates Check (Single Source)
**MANDATORY at start of every work block:**
- [ ] Check `_shared-framework/CHANGELOG.md` "Recent Updates" section (top of file)
- [ ] If framework version newer than local: Update your CLAUDE.md
- [ ] If relevant solutions listed: Read specified proven-solutions files
- [ ] Document: [No updates] OR [Found: (list updates taking action on)]

### RULE #4: [UNIVERSAL] Documentation Integrity & Group Alignment
**Before every work block:**
- [ ] **Local Pattern Check**: Required pattern docs exist and current?
  - `/docs/patterns/DESIGN-PATTERNS.md` (last updated <30 days if actively building UI)
  - `/docs/patterns/ARCHITECTURE-PATTERNS.md` (last updated <90 days)
  - `/docs/patterns/UX-PATTERNS.md` (if building user interfaces)
  - `/docs/patterns/TRADING-PATTERNS.md` (TrendDojo-specific)
- [ ] **Group Standards Compliance**: Project meets `_shared-framework/Standards-Housekeeping.md`?
  - README.md exists with required sections
  - docs/architecture.md exists, docs/decisions/ ADR folder exists

**Every 5th work block:**
- [ ] **Group Health Check**: Read `_shared-framework/DOCUMENTATION-HEALTH.md`
- [ ] Note any TrendDojo files flagged as stale/missing timestamps
- [ ] Address flagged issues in current or next work block

### RULE #5: [UNIVERSAL] Standardization & Templates
- Use standardized templates for all new projects
- Maintain consistency across project documentation
- Focus on cross-project patterns and shared standards
- All documentation uses `.md` format

### RULE #6: [UNIVERSAL] Complete Features, Don't Fragment
- **MANDATORY PRE-WORK**: Follow @claude/development-workflow.md checklist before coding
- Finish current work block before starting new features
- **IDENTIFY BUSINESS-CRITICAL LOGIC**: Add `@business-critical` comments during development
- **MANDATORY BEFORE COMMIT**: Verify all `@business-critical` code has unit tests
- Update docs in same commit as feature implementation
- **PUSH BACK**: "That needs a new work block. Let's finish current work first."

### RULE #7: [UNIVERSAL] Project Boundary Enforcement
- **ONLY MODIFY FILES WITHIN THIS PROJECT** - `/coding/trenddojo-v2/`
- **NEVER EDIT** files in other projects without explicit user permission
- **TRENDDOJO EXCEPTIONS**: You MAY modify these specific shared framework files:
  - `_shared-framework/news/trenddojo-solutions.md` (share infrastructure solutions)
  - `_shared-framework/proven-solutions/` (document detailed solutions)
- You may READ from other projects for reference, but changes stay local
- For any other cross-project changes, ask user for explicit permission first

### RULE #8: [UNIVERSAL] Work Block Completion Requires Git Commit
- **NEVER CLOSE** a work block without explicit user permission
- Work blocks can only be marked "completed" after:
  1. **All `@business-critical` code has unit tests**
  2. User explicitly approves closure
  3. All changes are committed to git
  4. User confirms the commit is satisfactory
- Always ask: "Ready to commit these changes?" before closing

### RULE #9: [UNIVERSAL] Cross-Project Infrastructure News System
- **CENTRALIZED LOCATION**: All cross-project news managed in `_shared-framework/news/`
- **MANDATORY WORK BLOCK WORKFLOW**:
  - **START**: Check news files for existing solutions (covered in RULE #3)
  - **END**: After solving infrastructure problems (auth, email, deployment, testing, error handling):
    1. Document solution in `_shared-framework/proven-solutions/`
    2. Update `_shared-framework/news/trenddojo-solutions.md` with brief summary
- **SCOPE**: Infrastructure solutions only - skip business logic and domain-specific features

### RULE #10: [UNIVERSAL] Critical System Accuracy - No Exceptions
- All business-critical logic MUST have unit tests before deployment
- **BUSINESS-CRITICAL IDENTIFICATION**: Look for `@business-critical` comments in code
- Backend validation mandatory for all flagged critical operations
- Never deploy critical system logic without explicit approval
- **NEVER test against live/production APIs during development**

### RULE #11: [UNIVERSAL] Production Safety & Documentation Standards
- All external integrations require comprehensive mocks for development
- Critical system changes need extra review (payments, auth, data processing)
- Staging environment mirrors production exactly
- **ALL DOCUMENTATION MUST LIVE IN PROJECT `/docs/` DIRECTORY**
- When you add a feature, update relevant docs immediately

### RULE #12: [UNIVERSAL] Design System Consistency (For UI Projects)
**IF project has UI components, check for design system:**
- [x] Does `/docs/DESIGN_SYSTEM.md` exist? **YES - READ IT FIRST**
- [x] Does `/app/theme/page.tsx` exist? **YES - Check before ANY UI work**
- [x] Are there shared UI components in `/components/ui/`? **YES - ALWAYS use them**
- [x] **NEVER change visual appearance without user permission** - colors, layouts, themes, etc.

**Design consistency enforcement:**
- Follow DESIGN_SYSTEM.md exactly, no exceptions
- Theme page is single source of truth for UI
- Shared components prevent inconsistency - use them always
- Alerts have NO borders (TrendDojo specific rule)

## 🔍 Business-Critical Flagging System
**Required comment format:**
```javascript
// @business-critical: [reason]
// MUST have unit tests before deployment
function criticalFunction() { ... }
```

**TrendDojo Critical Areas:**
- Trading algorithm calculations
- Position sizing logic
- Risk management functions
- P&L calculations
- Order execution logic
- Portfolio valuation
- Stop loss/take profit triggers
- Authentication/authorization
- Payment processing
- API rate limiting

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

### Pattern Documentation (CHECK BEFORE BUILDING)
- **🚨 Design System**: `/docs/DESIGN_SYSTEM.md` - MANDATORY: Read this FIRST for all UI work
- **Design Patterns**: `/docs/patterns/DESIGN-PATTERNS.md` - UI components, colors, trading-specific styling
- **Architecture Patterns**: `/docs/patterns/ARCHITECTURE-PATTERNS.md` - tRPC, Next.js, financial data handling
- **UX Patterns**: `/docs/patterns/UX-PATTERNS.md` - Trading forms, real-time updates, mobile patterns
- **Trading Patterns**: `/docs/patterns/TRADING-PATTERNS.md` - Risk management, position sizing, strategy implementation

### Technical Documentation
- **Architecture**: `/docs/reference/ARCHITECTURE.md` - System architecture and tech stack
- **Data Models**: `/docs/reference/DATA_MODELS.md` - Database schemas and data structures
- **API Specification**: `/docs/reference/API_SPECIFICATION.md` - API endpoints and request/response formats
- **UI Components**: `/docs/reference/UI_COMPONENTS.md` - Component specifications and patterns
- **Broker Integration**: `/docs/BROKER_INTEGRATION.md` - External broker API integrations
- **Database Plan**: `/docs/DATABASE-PLAN.md` - Database schema and deployment

### Work Management
- **Work Tracking**: `/_workblocks/ACTIVE_WORK_BLOCKS.md` - Current work context
- **Work History**: `/_workblocks/COMPLETED_WORK_BLOCKS.md` - Historical record
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
- **NEVER implement day trading features** → We DO NOT support day trading, scalping, or intraday strategies
- NEVER deploy financial calculations without unit tests → ALWAYS write tests first
- NEVER use live trading APIs in development → ALWAYS use mocks and paper trading
- NEVER skip staging deployment → ALWAYS test on staging before production
- NEVER close work blocks without approval → ALWAYS ask user permission first
- NEVER ignore risk management changes → ALWAYS get extra review for risk logic
- NEVER create files outside `/docs/` → ALL documentation lives in `/docs/` directory
- NEVER fragment features → ALWAYS complete current work block before starting new ones
- **NEVER BUILD WITHOUT CHECKING PATTERNS** → ALWAYS read `/docs/patterns/` documentation first (RULE #2)
- NEVER create components without design patterns → ALWAYS check DESIGN-PATTERNS.md
- NEVER implement APIs without architecture patterns → ALWAYS check ARCHITECTURE-PATTERNS.md  
- NEVER build UX without UX patterns → ALWAYS check UX-PATTERNS.md
- NEVER implement trading features without TRADING-PATTERNS.md → ALWAYS follow established risk management
- **NEVER MODIFY FILES OUTSIDE THIS PROJECT** → ALWAYS stay within `/coding/trenddojo-v2/`
- NEVER edit other projects without permission → ALWAYS ask user first for cross-project changes
- **NEVER CHANGE VISUAL APPEARANCE WITHOUT PERMISSION** → ALWAYS ask user before modifying styling, themes, colors, layouts, or any visual elements during bug fixes or component work

## ⚠️ Tech Stack Reality Check
The actual implementation uses:
- **Database**: PostgreSQL (Supabase) - staging/production not yet connected
- **Auth**: NextAuth.js v5 
- **Deployment**: Vercel (marketing site deployed successfully)
- **Status**: Marketing brochure complete, core features pending

---
*Framework Reference: `/coding/_shared-framework/` for business context*