# Pre-Deployment Checklist

**⚠️ ALWAYS RUN THIS BEFORE PUSHING TO GITHUB**

## 🛠️ Build Verification

```bash
# 1. Verify build works locally
npm run build:verify

# 2. Test development server
npm run dev
# Visit http://localhost:3000 and verify all pages work

# 3. Run linting (optional but recommended)
npm run lint
```

## 📋 Deployment Checklist

### Before Pushing to GitHub:
- [ ] ✅ `npm run build:verify` passes successfully
- [ ] ✅ All marketing pages load correctly (/, /features, /pricing, /docs)
- [ ] ✅ No TypeScript errors (warnings are OK)
- [ ] ✅ Environment files are NOT committed (.env.local should be in .gitignore)
- [ ] ✅ Commit message describes the changes clearly

### Vercel Configuration (One-time setup):
- [ ] ✅ Project connected to GitHub repository
- [ ] ✅ Build Command: `npm run build` (NO --turbopack flag)
- [ ] ✅ Environment variables configured:
  - Preview: trenddojo-v2.vercel.app
  - Production: www.trenddojo.com
- [ ] ✅ Deployment Protection disabled for Preview

### Database Setup (When ready):
- [ ] ✅ Supabase "trenddojo staging" database created
- [ ] ✅ Supabase "trenddojo" production database created
- [ ] ✅ Environment variables include correct DATABASE_URL
- [ ] ✅ Schema deployed with `npm run db:staging`
- [ ] ✅ Schema deployed with `npm run db:prod` (when ready for production)

## 🚨 Known Issues Fixed

### ❌ Turbopack Build Error (SOLVED)
**Issue**: `FATAL: An unexpected Turbopack error occurred: Build error occurred`
**Solution**: Disabled Turbopack in build script (`"build": "next build"`)

### ✅ Current Build Status
- **Local builds**: ✅ Working perfectly
- **Vercel builds**: ✅ Should work with standard Next.js build
- **Graceful degradation**: ✅ Preview deployments work without database

## 🎯 Deployment Commands

```bash
# Test everything locally before deploy
npm run build:verify && npm run dev

# Push to trigger preview deployment
git push origin main

# Deploy database schema (when ready)
npm run db:staging    # For staging/preview
npm run db:prod      # For production (requires confirmation)
```

## 📞 If Deployment Fails

1. Check Vercel build logs for specific error
2. Run `npm run build:verify` locally to reproduce
3. Verify environment variables in Vercel dashboard
4. Check that build command is `npm run build` (no Turbopack)
5. Ensure `.env.local` is not committed to repository