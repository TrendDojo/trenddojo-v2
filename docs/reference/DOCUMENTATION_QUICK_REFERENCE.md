# Documentation Quick Reference Card

## 📍 Where to Put Documentation

### ✅ ROOT LEVEL (Only These 6 Files!)
```
docs/
├── README.md              ✓ Navigation hub
├── PROJECT_CONTEXT.md     ✓ Project overview
├── ROADMAP.md            ✓ Product roadmap
├── architecture.md       ✓ System architecture
├── SECURITY.md          ✓ Security guidelines
└── CLAUDE.md            ✓ AI context (if needed in docs)
```

### 📁 FOLDER STRUCTURE (All Other Docs Go Here!)

| If documenting... | Put it in... | Example |
|------------------|--------------|---------|
| Database, market data, sync | `docs/data/` | DATABASE_SCHEMA.md |
| Features (charts, trading, etc) | `docs/features/` | CHART-SYSTEM.md |
| Design/architecture patterns | `docs/patterns/` | DESIGN-PATTERNS.md |
| Setup, config, environment | `docs/setup/` | ENVIRONMENT_VARIABLES.md |
| Dev workflow, processes | `docs/operations/` | DEVELOPMENT_WORKFLOW.md |
| Broker integrations | `docs/brokers/` | ALPACA_SETUP.md |
| Deployment guides | `docs/deployment/` | DEPLOYMENT_GUIDE.md |
| Decisions, ADRs | `docs/decisions/` | 2025-01-25-refactor.md |
| Old/deprecated content | `docs/archive/` | old-feature.md |

## ⚠️ COMMON MISTAKES TO AVOID

❌ **DON'T**: Create `docs/FEATURE_NAME.md` in root
✅ **DO**: Create `docs/features/FEATURE_NAME.md`

❌ **DON'T**: Create `docs/DATABASE_MIGRATION.md` in root
✅ **DO**: Create `docs/data/DATABASE_MIGRATION.md`

❌ **DON'T**: Create `docs/HOW_TO_DEPLOY.md` in root
✅ **DO**: Create `docs/deployment/HOW_TO_DEPLOY.md`

## 🤔 Still Unsure?

**ASK THE USER FIRST!**

Better to ask than to put documentation in the wrong place.

## 🔒 Enforcement

- Pre-commit hook will BLOCK commits with docs in wrong locations
- Check `/docs/README.md` for complete navigation
- Rule #4 and #12 in CLAUDE.md enforce this structure

---
*Last updated: 2025-01-25 - Documentation structure refactor*