# TrendDojo Deployment Guide

> 📏 **Documentation Standards**: See [DEPLOYMENT_AUDIT_CLAUSE.md](./DEPLOYMENT_AUDIT_CLAUSE.md) for accuracy requirements and monthly audit procedures.

## 🤖 AI Assistant Responsibility
**The AI assistant is responsible for leading the COMPLETE deployment process from start to finish, including production deployment.**

The process is NOT complete until:
- ✅ Code is deployed to Preview
- ✅ Preview is verified
- ✅ Release is documented and tagged
- ✅ **Production is deployed**
- ✅ Production is verified
- ✅ User is informed of completion WITH production status

## 🚀 Quick Reference

### URLs
- **Production**: `https://trenddojo.com` (main branch)
- **Preview**: Vercel URL - `https://trenddojo-v2-git-dev-traderclicks.vercel.app` (dev branch)
- **Local Dev**: See [PORT_CONFIG.md](./PORT_CONFIG.md) for current port assignment

### Key Commands
```bash
# Pre-deployment checks
npm run pre-deploy          # Run all checks before deployment

# Deployment (includes automatic migrations)
git push origin dev         # Deploy to Preview
git push origin main        # Deploy to Production (runs migrations via build hook)

# Verification
./scripts/deployment/verify-preview.sh [PREVIEW_URL]
```

### 🔄 Automatic Migration System
**Migrations run automatically on every production deployment:**
1. Vercel uses `npm run vercel-build` as the build command
2. Script checks for `MIGRATE_DATABASE_URL` environment variable
3. If present, runs `prisma migrate deploy` before building
4. Build continues even if migrations fail (graceful fallback)

## 📋 Environment Structure

| Environment | URL | Branch | Auto Deploy | Purpose |
|------------|-----|--------|-------------|---------|
| Local | localhost (see PORT_CONFIG.md) | any | N/A | Development |
| Preview | Vercel URL | dev | Yes | Testing/QA |
| Production | trenddojo.com | main | Yes | Live users |

## 🔄 Deployment Workflow

### Phase 1: Local Development
```bash
# 1. Start local server (port managed by starto)
starto  # Or see PORT_CONFIG.md for alternatives

# 2. Make changes and test locally

# 3. Run pre-deployment checks
npm run pre-deploy
```

### Phase 2: Preview Deployment
```bash
# 1. Commit changes
git add -A
git commit -m "feat: description"

# 2. Push to dev branch (auto-deploys to Preview)
git push origin dev

# 3. Wait for deployment (2-3 minutes)
./scripts/deployment/wait-for-deployment.sh

# 4. Get Preview URL
./scripts/deployment/get-preview-url.sh

# 5. Run automated tests
./scripts/deployment/verify-preview.sh $(./scripts/deployment/get-preview-url.sh)
```

### Phase 3: Release Documentation (After Preview Success)
```bash
# 1. Update CHANGELOG.md - move items from Unreleased
vim CHANGELOG.md

# 2. Bump version in package.json
npm version minor  # or patch/major

# 3. Commit release
git add -A
git commit -m "chore: release v0.3.0"

# 4. Tag the release
git tag -a v0.3.0 -m "Release v0.3.0 - verified in preview"
```

### Phase 4: Production Deployment (REQUIRED - DO NOT SKIP)
```bash
# AI ASSISTANT MUST COMPLETE THIS PHASE
# Do not stop at Phase 3 unless explicitly told to

# 1. Merge to main with release tag
git checkout main
git merge dev
git push origin main --tags

# 2. Monitor deployment in Vercel dashboard
# https://vercel.com/traderclicks/trenddojo-v2

# 3. Verify production health
curl https://trenddojo.com/api/health

# 4. Report to user:
# - Production deployment status
# - Any issues found
# - Confirmation that release is FULLY complete
```

## ✅ Pre-Deployment Checklist

### Automated Checks (`npm run pre-deploy`)
The pre-deploy script runs these checks:
1. TypeScript compilation
2. Next.js build verification
3. Unit tests
4. Environment variables validation
5. Database migration status
6. Console.log detection
7. Git status check

### Manual Verification
- [ ] All features tested locally
- [ ] No hardcoded secrets
- [ ] Database migrations reviewed
- [ ] API endpoints return appropriate errors

## 🔐 Environment Variables

### Required for ALL Environments
```env
DATABASE_URL=           # PostgreSQL connection string
NEXTAUTH_SECRET=        # Auth encryption (generate with: openssl rand -base64 32)
NEXTAUTH_URL=           # Application URL (localhost/preview/production)
```

### Required for Preview/Production
```env
POLYGON_API_KEY=        # Market data provider
CRON_SECRET=           # Cron job authentication
VERCEL_ENV=            # Set automatically by Vercel
```

### Setting in Vercel
1. Go to [Vercel Dashboard](https://vercel.com/traderclicks/trenddojo-v2/settings/environment-variables)
2. Add each variable
3. Select appropriate environments (Preview/Production)
4. Save changes

## 🔙 Rollback Procedures

### Instant Rollback (< 1 minute)
1. Go to [Vercel Dashboard](https://vercel.com/traderclicks/trenddojo-v2/deployments)
2. Find previous stable deployment
3. Click "..." → "Promote to Production"

### Git-based Rollback
```bash
# Find last good commit
git log --oneline -n 10

# Reset to that commit
git checkout main
git reset --hard [commit-hash]
git push --force origin main
```

## 📊 Health Monitoring

### Health Check Endpoint
```bash
# Check Preview
curl https://trenddojo-v2-git-dev-traderclicks.vercel.app/api/health

# Check Production
curl https://trenddojo.com/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "environment": "preview|production",
  "timestamp": "...",
  "checks": {
    "database": { "status": "pass" },
    "marketSchema": { "status": "pass" },
    "auth": { "configured": true },
    "apiKeys": { "configured": true }
  }
}
```

### Monitoring Commands
```bash
# View Vercel logs
vercel logs --follow

# Check deployment status
vercel list

# Environment variables audit
vercel env ls production
```

## 🚨 Emergency Procedures

### Critical Issue Response
1. **Immediate**: Rollback via Vercel dashboard
2. **Investigate**: Check Vercel logs
3. **Fix**: Create hotfix branch
4. **Test**: Deploy to Preview first
5. **Deploy**: Only after Preview verification

### Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Build fails | Check TypeScript errors with `npm run typecheck` |
| Database error | Verify DATABASE_URL and run migrations |
| Auth not working | Check NEXTAUTH_SECRET and NEXTAUTH_URL |
| API calls fail | Verify POLYGON_API_KEY is set |
| Port conflicts locally | Use `starto` to manage ports |

## 📝 Post-Deployment Verification

### Automated Testing
```bash
# Run full verification suite
./scripts/deployment/verify-preview.sh [URL]
```

This tests:
- 40+ API endpoints
- Security headers
- SEO protection
- Health checks
- Authentication flow

### Manual Checks
1. Homepage loads correctly
2. Authentication works
3. Market data displays
4. Database queries succeed
5. No console errors

## 🔒 Security Configuration

### Preview Environment Protection
- **X-Robots-Tag**: noindex, nofollow
- **Dynamic robots.txt**: Blocks all crawlers
- **Security headers**: CSP, X-Frame-Options, etc.
- **Vercel URL**: Obscure URL prevents discovery

### Why Vercel URLs for Preview?
- More secure through obscurity
- Complete cookie isolation
- No SSL transparency logs
- Zero DNS footprint

See [SECURITY.md](./SECURITY.md) for full details.

## 📚 Related Documentation

- [PORT_CONFIG.md](./PORT_CONFIG.md) - Local port management
- [SECURITY.md](./SECURITY.md) - Security settings
- [ENVIRONMENT_VARIABLES.md](./ENVIRONMENT_VARIABLES.md) - Complete env var reference
- [PROJECT_CONTEXT.md](./PROJECT_CONTEXT.md) - Business & technical context
- [CHANGELOG.md](../CHANGELOG.md) - Release history
- [Release Standard](../../_shared-framework/standards/RELEASE-DOCUMENTATION-STANDARD.md) - Release process

## 🚨 Emergency Hotfix Procedure

### When to Use Emergency Process
Use ONLY when ALL conditions are met:
- Production is broken or severely degraded
- Users are actively impacted
- Fix is isolated and well-understood
- Fix contains ONLY the bug resolution (no other changes)

### Emergency Deployment Process

#### Phase 1: Isolated Fix Branch (5 minutes)
1. Create dedicated hotfix branch from main: `git checkout -b hotfix/YYYY-MM-DD-issue`
2. Make ONLY the change needed to fix the issue
3. **NO OTHER CHANGES** allowed in this branch:
   - No code cleanup
   - No "while we're here" improvements
   - No dependency updates
   - No documentation except the fix explanation
4. Test locally to verify fix works
5. Commit with prefix: `hotfix: [specific issue description]`

#### Phase 2: Direct to Production (10 minutes)
1. Push hotfix branch: `git push origin hotfix/YYYY-MM-DD-issue`
2. Merge to main: `git checkout main && git merge hotfix/YYYY-MM-DD-issue`
3. Push directly: `git push origin main`
4. Monitor Vercel deployment
5. Verify fix is working at trenddojo.com

#### Phase 3: Mandatory Documentation (Within same session)
1. Update CHANGELOG.md with new HOTFIX section:
   ```
   ## [HOTFIX] - YYYY-MM-DD
   ### Fixed
   - Critical: [Description of what was broken]
   - Impact: [How many users/what features affected]
   - Root cause: [Why it broke]
   - Fix: [What was changed]
   ```

2. Create/update incident record in `/_workblocks/INCIDENTS.md`:
   ```markdown
   ## INC-YYYY-MM-DD: [Issue Title]
   **Severity**: Critical
   **Detection Time**: HH:MM
   **Resolution Time**: HH:MM
   **User Impact**: [Description]

   ### What Happened
   [Detailed description]

   ### Root Cause
   [Technical explanation]

   ### Fix Applied
   - Branch: hotfix/YYYY-MM-DD-issue
   - Commit: [hash]
   - Changes: [Specific files and changes]

   ### Prevention
   [What will prevent this in future]
   ```

3. Add entry to `/_workblocks/ACTIVE_WORK_BLOCKS.md`:
   - Mark as completed immediately
   - Reference incident number
   - Note that standard process was bypassed for emergency

### AI Assistant Protocol
When user says "emergency" or "production is broken":
1. IMMEDIATELY ask: "Is this a critical production issue affecting users?"
2. If yes, state: "Initiating emergency hotfix procedure - creating isolated branch"
3. Create the hotfix branch and make ONLY the necessary fix
4. After deployment, state: "Hotfix deployed. Now documenting in CHANGELOG and INCIDENTS.md"

### What NOT to Use Emergency Process For:
- ❌ Feature additions (even if "urgent" for demo)
- ❌ Performance improvements (unless site is completely down)
- ❌ UI/cosmetic fixes
- ❌ Refactoring or code cleanup
- ❌ "Quick" additions while fixing something else

**CRITICAL RULE**: The hotfix branch contains EXACTLY and ONLY what fixes the issue.

## 🆘 Support

### Issues?
1. Check health endpoint first
2. Review Vercel logs
3. Check this guide's troubleshooting section
4. Contact team if needed

### Useful Links
- [Vercel Dashboard](https://vercel.com/traderclicks/trenddojo-v2)
- [GitHub Repo](https://github.com/TrendDojo/trenddojo-v2)
- [Health Check](https://trenddojo-v2-git-dev-traderclicks.vercel.app/api/health)

---

**Remember**: When in doubt, rollback first, investigate second.

*Last updated: 2025-09-28*