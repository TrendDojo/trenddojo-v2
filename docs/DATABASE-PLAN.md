# TrendDojo Database Plan

*Last updated: 2025-09-02*

## 🏗️ Database Architecture Overview

### Environment Strategy
```
Development → Staging → Production
    ↓           ↓         ↓
 Local PG   →  Supabase → Supabase
             (staging)   (production)
```

## 📊 Database Configuration by Environment

### 🔧 **Development (Local)**
- **Database**: PostgreSQL 15+ (local installation)
- **Connection**: `postgresql://postgres:password@localhost:5432/trenddojo_dev`
- **Purpose**: Local development with full control
- **Data**: Seeded test data with realistic trading scenarios
- **Backup**: Not required (disposable)

### 🚀 **Staging** 
- **Database**: Supabase (managed PostgreSQL)
- **Connection**: Supabase connection string
- **Purpose**: Pre-production testing with production-like data
- **Data**: Subset of production data (anonymized) + test scenarios
- **Backup**: Automated via Supabase
- **Access**: Development team only

### 🌟 **Production**
- **Database**: Supabase (managed PostgreSQL) 
- **Connection**: Supabase production connection string
- **Purpose**: Live user data and trading operations
- **Data**: Real user accounts, trades, financial data
- **Backup**: Automated daily backups + point-in-time recovery
- **Access**: Restricted, audit logged

## 🗂️ Database Schema Summary

### Core Trading Tables
- `users` - User accounts with subscription management
- `accounts` - Trading accounts (multiple per user)
- `trades` - Complete trade lifecycle tracking
- `risk_settings` - Per-account risk management rules
- `broker_connections` - API connections to brokers

### Supporting Tables  
- `subscription_limits` - Tier-based feature limits
- `market_data_cache` - Price data caching
- `stock_fundamentals` - Company financial data
- `trade_notes` - Trade journal entries
- `trade_checklist_*` - Pre-trade validation

### Financial Data Protection
- Sensitive fields encrypted at rest
- Audit trails for all financial operations
- Row-level security for multi-tenant isolation
- Compliance logging for regulatory requirements

## 🛠️ Development Workflow

### Initial Setup (One-time)
```bash
# 1. Install PostgreSQL locally
brew install postgresql
brew services start postgresql

# 2. Create development database  
createdb trenddojo_dev

# 3. Run initial migration
npm run db:migrate

# 4. Seed development data
npm run db:seed
```

### Daily Development
```bash
# Start development with fresh data
npm run db:reset    # Drop, recreate, migrate, seed

# Update schema during development
npm run db:push     # Push schema changes without migration
npm run db:migrate  # Create proper migration
```

### Staging Deployment
```bash
# Deploy to staging
npm run db:migrate:staging
npm run db:seed:staging

# Verify staging environment
npm run test:e2e:staging
```

### Production Deployment  
```bash
# Production migration (requires approval)
npm run db:migrate:production

# Production verification
npm run db:status:production
```

## 📋 Test Data Seeding Strategy

### Seed Data Types

**1. Empty State**
```bash
npm run db:seed:empty
# Creates: Basic subscription limits only
# Use for: Clean slate testing
```

**2. Development State** 
```bash
npm run db:seed:dev
# Creates: 
# - 3 test users (free, basic, pro tiers)
# - 5 demo trading accounts  
# - 50+ sample trades (winners, losers, active)
# - Realistic market data cache
# Use for: Daily development
```

**3. Demo State**
```bash  
npm run db:seed:demo
# Creates:
# - Single demo user: demo@trenddojo.com / demo123
# - Well-performing portfolio examples
# - Clean, impressive data for demos
# Use for: Client presentations, screenshots
```

**4. Testing State**
```bash
npm run db:seed:test
# Creates:
# - Edge case scenarios  
# - Boundary condition data
# - Error condition setups
# Use for: Automated testing
```

### Standard Test Accounts
```
Empty:  empty@demo.test   / demo123
Basic:  basic@demo.test   / demo123  
Pro:    pro@demo.test     / demo123
Demo:   demo@trenddojo.com / demo123
```

## 🚨 Security & Compliance

### Data Classification
- **PUBLIC**: Market data, general settings
- **INTERNAL**: User preferences, non-financial data  
- **CONFIDENTIAL**: Account balances, positions, PII
- **RESTRICTED**: API keys, payment information

### Backup Strategy
- **Development**: No backup (recreate from seed)
- **Staging**: Daily automated backup (7-day retention)
- **Production**: Automated backup (30-day retention) + weekly deep archive

### Migration Safety
- All migrations reversible where possible
- Staging environment mirrors production exactly
- Migration testing required before production
- Rollback procedures documented for each migration

## 📊 Performance Considerations

### Database Optimization
- Indexes on frequently queried fields (user_id, account_id, symbol, created_at)
- Partitioning for large tables (market_data_cache by date)
- Connection pooling via Supabase/Prisma
- Query optimization for real-time trading data

### Monitoring
- Query performance monitoring
- Connection pool utilization
- Database size growth tracking
- Automated alerts for performance degradation

## 🔄 Migration Philosophy

### Development Phase
- Use `prisma db push` for rapid schema iteration
- Create formal migrations for significant changes
- Reset database frequently with fresh seed data

### Production Phase  
- All changes through formal migrations
- Backward-compatible changes preferred
- Breaking changes require coordination
- Zero-downtime deployment procedures

## ⚠️ Critical Success Factors

1. **Financial Accuracy**: All money calculations must be precise
2. **Data Integrity**: Trading data must be consistent and auditable  
3. **Performance**: Real-time trading requires <100ms query response
4. **Security**: Financial data requires enterprise-grade protection
5. **Compliance**: Audit trails for regulatory requirements

---

*This plan follows the TrendDojo production-ready standards and integrates with the established work block management system.*