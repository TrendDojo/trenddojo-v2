# TrendDojo Complete Deployment Setup

This guide provides step-by-step instructions to replicate the Controlla V2 setup for TrendDojo with Supabase and Vercel.

## 🔧 Prerequisites

- ✅ TrendDojo codebase ready (current state)
- ⏳ Supabase account access (you'll create this)
- ⏳ Vercel account access (you'll configure this)
- ✅ GitHub repository for TrendDojo (already exists)

---

## Phase 1: Database Setup

### Step 1: Create Supabase Projects

1. Go to https://supabase.com/dashboard
2. **Create staging database:**
   - Click "New Project"
   - Name: "trenddojo staging"
   - Choose region (recommend same as Controlla for consistency)
   - Set strong password - **save this password securely**
   - Wait for setup completion

3. **Create production database:**
   - Click "New Project"
   - Name: "trenddojo" (production)
   - Same region as staging
   - Set strong password - **save this password securely**
   - Wait for setup completion

### Step 2: Get Database Connection Strings

**For "trenddojo staging":**
1. Go to Settings → Database
2. Copy Connection string (PostgreSQL format)
3. Format: `postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres`

**For "trenddojo" (production):**
1. Repeat same process
2. Save both connection strings securely

---

## Phase 2: Environment Configuration

### Step 3: Local Development Setup

Copy the example environment file:
```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your values:
```env
# Use your local PostgreSQL or staging Supabase for development
DATABASE_URL="postgresql://postgres:[STAGING-PASSWORD]@db.[STAGING-REF].supabase.co:5432/postgres"
NEXTAUTH_SECRET="your-generated-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

Generate a secure secret:
```bash
openssl rand -base64 32
```

### Step 4: Test Local Development

```bash
# Install dependencies
npm install

# Deploy schema to development database
npm run db:dev

# Start development server
npm run dev
```

Visit http://localhost:3000 to verify it works!

---

## Phase 3: Vercel Project Setup

### Step 5: Create Vercel Project

1. Go to https://vercel.com/dashboard
2. Import Project → Connect GitHub → Select TrendDojo repository
3. **Project Settings:**
   - Framework: Next.js
   - Root Directory: `/` (default)
   - Build Command: `npm run build`
   - Output Directory: `/` (default)

### Step 6: Configure Environment Variables

In Vercel Dashboard → TrendDojo Project → Settings → Environment Variables:

**Add Preview Environment Variables** (set Environment: "Preview"):
```
DATABASE_URL = postgresql://postgres:[STAGING-PASSWORD]@db.[STAGING-REF].supabase.co:5432/postgres
NEXTAUTH_SECRET = your-nextauth-secret-key-here
NEXTAUTH_URL = https://trenddojo-git-main-[username].vercel.app
NEXT_PUBLIC_APP_URL = https://trenddojo-git-main-[username].vercel.app
```

**Add Production Environment Variables** (set Environment: "Production"):
```
DATABASE_URL = postgresql://postgres:[PROD-PASSWORD]@db.[PROD-REF].supabase.co:5432/postgres
NEXTAUTH_SECRET = your-nextauth-secret-key-here
NEXTAUTH_URL = https://trenddojo-[username].vercel.app
NEXT_PUBLIC_APP_URL = https://trenddojo-[username].vercel.app
```

### Step 7: Disable Deployment Protection

⚠️ **Critical**: Prevent 401 errors
1. Settings → General
2. Find "Deployment Protection" 
3. **Disable deployment protection** for Preview environments
4. Save settings

---

## Phase 4: Database Schema Deployment

### Step 8: Deploy Schema to Staging

```bash
# Set staging database connection
export DATABASE_URL="postgresql://postgres:[STAGING-PASSWORD]@db.[STAGING-REF].supabase.co:5432/postgres"

# Deploy schema using bulletproof system
npm run db:staging
```

### Step 9: Deploy Schema to Production (when ready)

```bash
# Set production database connection  
export DATABASE_URL="postgresql://postgres:[PROD-PASSWORD]@db.[PROD-REF].supabase.co:5432/postgres"

# Deploy schema to production (extra safety confirmations)
npm run db:prod
```

---

## Phase 5: Testing & Verification

### Step 10: Test Deployments

**Test Preview/Staging:**
1. Push any branch to trigger preview deployment
2. Visit the generated preview URL
3. Verify: Marketing pages work, database connected

**Test Production:**
1. Push to main branch or manually deploy
2. Visit your production URL  
3. Verify: All features working, production database

### Step 11: Optional Supabase-Vercel Integration

**For Production (Recommended):**
1. Supabase → "trenddojo" project → Settings → Integrations
2. Add Vercel Integration
3. Authorize and select TrendDojo Vercel project
4. Set environment scope: "Production"
5. This automatically manages production environment variables

**Keep Staging Manual:**
- Gives you precise control over staging database
- Prevents accidental production deployments

---

## 📋 Verification Checklist

- [ ] Supabase Projects: "trenddojo staging" + "trenddojo" created
- [ ] Environment Files: .env.local configured and working locally
- [ ] Vercel Project: Created and connected to GitHub
- [ ] Environment Variables: Preview and Production configured in Vercel
- [ ] Deployment Protection: Disabled for previews
- [ ] Database Schema: Deployed to staging successfully
- [ ] Database Schema: Ready to deploy to production
- [ ] Local Development: Working with `npm run dev`
- [ ] Preview Deployment: Working with staging database
- [ ] Production Deployment: Ready (database schema deployed)

---

## 🚀 Deployment Commands Reference

```bash
# Local development
npm run db:dev        # Deploy to local/dev database
npm run dev           # Start development server

# Staging deployment  
npm run db:staging    # Deploy to staging database (with safety prompts)

# Production deployment
npm run db:prod       # Deploy to production database (extra safety)

# Other useful commands
npm run build         # Test build locally
npm run deploy-safe   # Run tests + build before deploying
```

---

## 🔒 Security Notes

- Never commit real passwords or secrets to Git
- Use different passwords for staging and production databases
- Store connection strings securely (password manager)
- Rotate secrets regularly
- Monitor database connections and usage

---

## 🚨 Troubleshooting

### Build Fails with Database Errors
- Verify DATABASE_URL format is correct
- Test connection: `npx prisma db pull`
- Check Supabase project is running

### Preview Deployment Shows "Preview Banner"
- This is normal! It means graceful degradation is working
- Database operations return mock data
- Marketing pages work fully

### Environment Variables Not Working
- Double-check spelling in Vercel dashboard
- Verify Environment scope (Preview vs Production)
- Redeploy after changing variables

---

This setup gives you an identical infrastructure to Controlla V2 with proper staging/production separation and bulletproof deployment safety.