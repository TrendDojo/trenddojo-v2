# Database Rollback Procedures

## Overview
This document outlines safe procedures for handling database migration failures and rollbacks in TrendDojo's CI/CD pipeline.

## Automatic Rollback Scenarios
The deployment pipeline will automatically block deployment in these cases:
1. Prisma schema validation fails
2. Migration deployment fails
3. Database connection cannot be established
4. Migration causes data loss (detected by Prisma)

## Manual Rollback Procedures

### Staging Environment Rollback
If staging deployment fails due to database issues:

#### 1. Check Migration Status
```bash
# Connect to staging database
npx prisma migrate status --schema=./prisma/schema.prisma
```

#### 2. Reset to Previous Migration (Destructive)
**⚠️ WARNING: This will lose data. Only use on staging.**
```bash
# Reset database to specific migration
npx prisma migrate reset
# Or reset to specific migration
npx prisma db execute --file ./path/to/previous/migration.sql
```

#### 3. Rollback Git and Redeploy
```bash
git revert [problematic-commit]
git push origin main  # Triggers new deployment
```

### Production Environment Rollback

#### 🚨 Production Rollback Protocol
1. **IMMEDIATE**: Disable new user registrations (circuit breaker)
2. **ASSESS**: Determine if application is functional with current DB state
3. **COORDINATE**: Notify team before any database changes
4. **BACKUP**: Always create backup before any changes

#### Production Rollback Steps

##### 1. Create Emergency Backup
```bash
# Create point-in-time backup in Supabase
# This must be done via Supabase Dashboard -> Database -> Backups
```

##### 2. Application-Level Rollback (Preferred)
```bash
# Deploy previous known-good application version
git checkout [previous-good-commit]
git tag emergency-rollback-$(date +%Y%m%d-%H%M)
# Update Vercel deployment to this tag
```

##### 3. Database Rollback (Last Resort)
```bash
# ONLY if application rollback is insufficient
# Restore from Supabase backup via Dashboard
# This requires manual intervention and downtime
```

## Migration Failure Recovery

### Common Failure Scenarios

#### Schema Validation Failure
```
Error: Schema validation failed
```
**Solution**: Fix schema issues locally, test, then redeploy

#### Migration Deployment Failure
```
Error: Migration failed to apply
```
**Recovery Steps**:
1. Check specific error in GitHub Actions logs
2. Fix migration conflict locally
3. Create new migration to resolve issue
4. Deploy fix

#### Connection Timeout
```
Error: Database connection timeout
```
**Recovery Steps**:
1. Check Supabase service status
2. Verify DATABASE_URL secret is correct
3. Check firewall/network configuration
4. Retry deployment after service recovery

## Prevention Best Practices

### 1. Safe Migration Patterns
```sql
-- ✅ Safe: Adding nullable column
ALTER TABLE users ADD COLUMN phone_number TEXT;

-- ✅ Safe: Adding index
CREATE INDEX idx_users_email ON users(email);

-- ⚠️ Risky: Dropping column (plan carefully)
-- ALTER TABLE users DROP COLUMN old_column;

-- ❌ Dangerous: Changing column type
-- ALTER TABLE users ALTER COLUMN balance TYPE DECIMAL;
```

### 2. Migration Testing Protocol
1. **Local Testing**: Always test migrations locally first
2. **Staging Testing**: Verify migrations work on staging database
3. **Production Testing**: Use Supabase migrations preview feature
4. **Data Migration**: For large data changes, use separate data migration scripts

### 3. Deployment Safety Checklist
- [ ] Migration tested locally with representative data
- [ ] Migration tested on staging environment
- [ ] Backup strategy confirmed for production
- [ ] Rollback plan documented and tested
- [ ] Team notified of upcoming database changes
- [ ] Database performance impact assessed

## Emergency Contacts
- **Database Issues**: Supabase support (if using managed service)
- **Deployment Issues**: GitHub Actions status page
- **Application Issues**: Vercel status page

## Recovery Time Objectives
- **Staging**: 15 minutes maximum downtime
- **Production**: 5 minutes maximum downtime (target)
- **Data Recovery**: 1 hour maximum (from backup)

## Monitoring and Alerts
- Database connection health checks
- Migration deployment success/failure alerts
- Application error rate spikes
- Database performance degradation

---

*Last updated: 2025-09-08*