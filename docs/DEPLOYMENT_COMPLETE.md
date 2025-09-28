# ⚠️ DEPRECATED - Use DEPLOYMENT_GUIDE.md Instead

**This document is deprecated and has been replaced.**
**Please use [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for current deployment procedures.**

---

# TrendDojo Deployment Documentation [DEPRECATED]

## 🎯 Quick Reference

### URLs
- **Production**: `https://trenddojo.com` (main branch)
- **Preview**: `https://trenddojo-v2-git-dev-traderclicks.vercel.app` (dev branch)

### Key Commands
```bash
npm run preview:check      # Test Preview environment
npm run deploy:preview      # Push to Preview (dev branch)
npm run deploy:production   # Deploy to Production (main → production)
npm run pre-deploy         # Run all pre-deployment checks
```

## 📋 Deployment Workflow

### 1. Local Development → Preview
```bash
# Make changes locally
git add -A
git commit -m "feat: description"
git push origin dev    # Automatically deploys to Preview
```

### 2. Preview → Production
```bash
# After Preview is verified
git checkout main
git merge dev
git push origin main   # Automatically deploys to Production
```

## ✅ Pre-Deployment Checklist

### Before EVERY Deployment
```bash
npm run pre-deploy
```
This checks:
- ✅ TypeScript compilation
- ✅ Build success
- ✅ Tests passing
- ✅ No console.logs
- ✅ Environment variables
- ✅ Database migrations

### Manual Verification
```bash
npm run preview:check   # Tests 40+ endpoints automatically
```

## 🔒 Security Configuration

### Preview Environment Protection
- **Robots blocked**: X-Robots-Tag: noindex
- **Not discoverable**: Vercel URL obscurity
- **Security headers**: CSP, X-Frame-Options, HSTS
- **No indexing**: Dynamic robots.txt returns Disallow: /

### Why Vercel URLs for Preview?
- More secure through obscurity (not scannable)
- Complete cookie isolation from production
- No SSL certificate transparency exposure
- Zero DNS footprint

## 🚨 Environment Variables

### Required for Production
```env
DATABASE_URL=           # PostgreSQL connection
NEXTAUTH_SECRET=        # Auth encryption
NEXTAUTH_URL=           # https://trenddojo.com
POLYGON_API_KEY=        # Market data
CRON_SECRET=           # Cron job protection
```

### Set in Vercel Dashboard
1. Go to: Settings → Environment Variables
2. Add each variable
3. Select appropriate environments

## 📊 Monitoring & Health

### Health Check Endpoint
```bash
curl https://trenddojo-v2-git-dev-traderclicks.vercel.app/api/health
```

Returns:
- Database status
- Market schema status
- Auth configuration
- API keys status
- Environment info

### Automated Testing
```bash
# Full verification suite
./scripts/deployment/verify-preview.sh [URL]

# Tests:
# - 40+ endpoints
# - Security headers
# - Performance metrics
# - Error handling
```

## 🔄 Rollback Procedures

### Instant Rollback (< 1 minute)
1. Go to Vercel Dashboard
2. Find previous deployment
3. Click "..." → "Promote to Production"

### Git Rollback
```bash
git checkout main
git reset --hard [last-good-commit]
git push --force origin main
```

## 🗂️ File Structure

```
docs/
├── DEPLOYMENT_COMPLETE.md     # This file (master reference)
├── PROJECT_CONTEXT.md         # Business & technical context
└── _work/
    └── ACTIVE_WORK_BLOCKS.md  # Current work tracking

scripts/
├── deployment/
│   ├── verify-preview.sh      # Automated testing
│   ├── wait-for-deployment.sh # Deployment monitor
│   └── get-preview-url.sh     # URL finder
├── pre-deploy-check.sh        # Pre-deployment validation
├── validate-environment.sh    # Environment checks
├── validate-migrations.sh     # Database checks
└── validate-api.sh           # API endpoint tests

src/
├── app/
│   ├── api/health/           # Health monitoring
│   └── robots.ts             # Dynamic robots.txt
└── middleware.ts             # Security headers
```

## 📝 Missing Processes to Document

### Still Need Documentation For:

1. **Database Migration Process**
   - How to create migrations
   - Testing migrations locally
   - Applying to production

2. **Environment Setup**
   - How to get Polygon API key
   - Setting up NextAuth secret
   - Database connection string format

3. **Monitoring & Alerts**
   - How to set up Vercel monitoring
   - Error tracking (Sentry?)
   - Performance monitoring

4. **Team Onboarding**
   - How to get Vercel access
   - Git branch permissions
   - Environment variable access

5. **Incident Response**
   - Who to contact
   - Escalation path
   - Status page updates

## 🎯 Action Items

### Immediate
- [ ] Add DATABASE_URL to Vercel Production
- [ ] Add POLYGON_API_KEY to Vercel
- [ ] Test production deployment

### Next Sprint
- [ ] Set up error tracking (Sentry)
- [ ] Configure monitoring alerts
- [ ] Document migration process
- [ ] Create runbook for incidents

### Future
- [ ] Automated performance testing
- [ ] Load testing procedures
- [ ] Disaster recovery plan
- [ ] Security audit schedule

## 📞 Support & Contacts

### Deployments
- **Vercel Dashboard**: https://vercel.com/traderclicks/trenddojo-v2
- **GitHub Repo**: https://github.com/TrendDojo/trenddojo-v2

### Issues
- Check: `/api/health` endpoint
- Logs: Vercel Dashboard → Functions → Logs
- Rollback: See procedures above

---

**Last Updated**: 2025-09-28
**Version**: 1.0.0
**Status**: Preview environment active and secured