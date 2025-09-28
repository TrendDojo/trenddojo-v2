# ⚠️ DEPRECATED - Use DEPLOYMENT_GUIDE.md Instead

**This document is deprecated and should not be used.**
**Please use [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for current deployment procedures.**

---

# TrendDojo V2 Deployment Guide [DEPRECATED]

## 🚀 Deployment Pipeline

### Environment Structure
- **Development**: Local development (localhost:3011)
- **Preview**: Vercel Preview environment (dev branch)
- **Production**: Vercel Production (main branch)

## 📋 Pre-Deployment Checklist

### 1. Local Validation (MANDATORY)
```bash
# Run the complete pre-deployment check
npm run pre-deploy

# Individual checks if needed:
npm run typecheck                     # TypeScript validation
npm run build                         # Production build test
npm run test:run                      # Unit tests
./scripts/validate-environment.sh     # Environment variables
./scripts/validate-migrations.sh      # Database migrations
./scripts/validate-api.sh            # API endpoints
```

### 2. Environment Variables Validation

#### Required for ALL environments:
- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_SECRET` - Auth encryption secret
- `NEXTAUTH_URL` - Application URL

#### Required for Preview/Production:
- `POLYGON_API_KEY` - Market data provider API
- `CRON_SECRET` - Vercel cron job authentication

#### Production only:
- `SENTRY_DSN` - Error tracking (optional but recommended)
- `VERCEL_ENV` - Set automatically by Vercel

### 3. Database Migration Check
```bash
# Check migration status
npx prisma migrate status

# If migrations are pending:
npx prisma migrate deploy

# Validate schema
npx prisma validate
```

## 🔄 Deployment Process

### Phase 1: Preview Deployment
```bash
# 1. Ensure on dev branch
git checkout dev

# 2. Run pre-deployment checks
npm run pre-deploy

# 3. Fix any issues found
# ... make fixes ...

# 4. Commit changes
git add -A
git commit -m "fix: [description]"

# 5. Push to trigger Preview deployment
git push origin dev

# 6. Monitor deployment
# Check: https://vercel.com/[your-team]/trenddojo-v2
```

### Phase 2: Preview Validation
```bash
# 1. Wait for deployment to complete (2-3 minutes)

# 2. Test health endpoint
curl https://[preview-url].vercel.app/api/health

# 3. Run API validation against Preview
API_BASE_URL=https://[preview-url].vercel.app ./scripts/validate-api.sh

# 4. Manual testing checklist:
# - [ ] Homepage loads
# - [ ] Market data displays
# - [ ] Authentication works
# - [ ] Database queries work
```

### Phase 3: Production Deployment
```bash
# 1. Ensure Preview is stable

# 2. Create PR from dev to main
gh pr create --base main --head dev --title "Deploy to Production" --body "
## Changes
- [List key changes]

## Testing
- [ ] Preview environment tested
- [ ] API endpoints validated
- [ ] Database migrations complete
"

# 3. Merge PR (after review if team)
gh pr merge --merge

# OR direct merge if solo:
git checkout main
git merge dev
git push origin main

# 4. Monitor production deployment
```

## 🔙 Rollback Procedures

### Immediate Rollback (< 5 minutes)
```bash
# Vercel instant rollback
# 1. Go to Vercel dashboard
# 2. Navigate to deployments
# 3. Find previous stable deployment
# 4. Click "..." → "Promote to Production"
```

### Git-based Rollback
```bash
# 1. Find last known good commit
git log --oneline -n 10

# 2. Revert to that commit
git checkout main
git reset --hard [commit-hash]
git push --force origin main

# 3. Create fix branch
git checkout -b hotfix/rollback-[date]
```

### Database Rollback
```bash
# 1. Check migration history
npx prisma migrate status

# 2. If migration was applied, create down migration
npx prisma migrate dev --name rollback_[feature]

# 3. Apply to production
npx prisma migrate deploy
```

## 🚨 Emergency Procedures

### Critical Production Issue
1. **Immediate Response**:
   ```bash
   # Set maintenance mode (if implemented)
   vercel env pull
   echo "NEXT_PUBLIC_MAINTENANCE_MODE=true" >> .env.production
   vercel env add NEXT_PUBLIC_MAINTENANCE_MODE production
   ```

2. **Rollback**:
   - Use Vercel instant rollback (fastest)
   - Or git-based rollback

3. **Investigate**:
   ```bash
   # Check logs
   vercel logs --prod

   # Check health
   curl https://trenddojo.com/api/health
   ```

4. **Fix & Re-deploy**:
   ```bash
   # Create hotfix branch
   git checkout -b hotfix/critical-issue
   # ... fix issue ...
   git push origin hotfix/critical-issue
   # Test in Preview first!
   ```

## 📊 Monitoring

### Health Checks
- **Endpoint**: `/api/health`
- **Frequency**: Every 5 minutes
- **Alert on**: Status != 'healthy' for 2 consecutive checks

### Key Metrics to Monitor
1. **Response Times**: > 3s requires investigation
2. **Error Rate**: > 1% requires investigation
3. **Database Connection Pool**: > 80% usage warning
4. **Cron Job Success Rate**: < 95% requires investigation

### Monitoring Commands
```bash
# Vercel logs (real-time)
vercel logs --prod --follow

# Check deployment status
vercel list

# Environment variables audit
vercel env ls production

# Database connection test
npx prisma db pull --print
```

## 🔐 Security Checklist

Before EVERY production deployment:
- [ ] No hardcoded secrets in code
- [ ] All console.logs removed or commented
- [ ] Environment variables validated
- [ ] Database migrations reviewed
- [ ] API endpoints return appropriate errors
- [ ] Rate limiting configured (if applicable)
- [ ] CORS settings appropriate
- [ ] Authentication required where needed

## 📝 Post-Deployment

### Verification Steps
1. Check health endpoint
2. Verify cron jobs scheduled (Vercel dashboard)
3. Test critical user flows
4. Monitor error logs for 30 minutes
5. Check performance metrics

### Documentation Updates
- [ ] Update CHANGELOG.md
- [ ] Update API documentation if changed
- [ ] Note deployment in team channel
- [ ] Update known issues if any

## 🆘 Support Contacts

### Escalation Path
1. Check health endpoint
2. Review Vercel logs
3. Check GitHub issues
4. Contact team lead
5. Vercel support (if infrastructure issue)

### Useful Links
- [Vercel Dashboard](https://vercel.com/dashboard)
- [GitHub Repo](https://github.com/TrendDojo/trenddojo-v2)
- [Prisma Docs](https://www.prisma.io/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)

---

**Remember**: When in doubt, rollback first, investigate second. User experience > everything else.