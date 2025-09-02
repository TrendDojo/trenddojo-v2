# Database Setup Guide

## Overview

TrendDojo uses PostgreSQL with Prisma ORM. The app supports graceful degradation, running in preview mode without a database for marketing site functionality.

## Production Database (Required for Full Functionality)

### 1. Database Provider Options

**Recommended: Supabase (Free tier available)**
- Visit [supabase.com](https://supabase.com)
- Create a new project
- Go to Settings > Database > Connection string
- Copy the connection string

**Alternative: Neon.tech**
- Visit [neon.tech](https://neon.tech)
- Create database
- Copy connection string

**Alternative: Railway**
- Visit [railway.app](https://railway.app)
- Add PostgreSQL service
- Copy connection string

### 2. Environment Variables

Add to your `.env.local` (development) and Vercel environment variables (production):

```env
# Database
DATABASE_URL="postgresql://username:password@host:port/database?schema=public"

# NextAuth.js
NEXTAUTH_URL="http://localhost:3000"  # or your production URL
NEXTAUTH_SECRET="your-secret-key-here"

# OAuth Providers (optional for preview)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

### 3. Database Migration

Once you have a database URL:

```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate deploy

# Seed initial data (subscription tiers, etc.)
npx prisma db seed
```

## Preview Deployments (No Database Required)

The app automatically detects preview deployments and runs in graceful degradation mode:

- ✅ Marketing pages work fully
- ✅ Navigation and UI components
- ✅ Static content and pricing
- ⚠️ API routes return mock data
- ❌ User authentication disabled
- ❌ Database operations unavailable

### Preview Environment Detection

```typescript
// Automatic detection in preview mode
const isPreview = process.env.VERCEL_ENV === 'preview'
const hasDatabase = !!process.env.DATABASE_URL
const useGracefulDegradation = isPreview && !hasDatabase
```

## Local Development Setup

### Option 1: With Database (Full Features)

1. Set up a PostgreSQL database (see options above)
2. Add `DATABASE_URL` to `.env.local`
3. Run migrations: `npx prisma migrate dev`
4. Start development: `npm run dev`

### Option 2: Preview Mode (Marketing Only)

1. Don't add `DATABASE_URL` to `.env.local`
2. Start development: `npm run dev`
3. App runs in graceful degradation mode

## Vercel Deployment

### Production Deployment

1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard:
   - `DATABASE_URL`
   - `NEXTAUTH_URL`
   - `NEXTAUTH_SECRET`
   - OAuth credentials (if using)
3. Deploy - database migrations run automatically

### Preview Deployments

1. No database required
2. Preview deployments automatically run in graceful mode
3. Perfect for reviewing UI/UX changes
4. Banner displays "Preview Deployment" mode

## Database Schema

Key tables:
- `User` - User accounts and subscriptions
- `Account` - Trading accounts (paper/live)
- `Trade` - Individual trades and positions
- `RiskSettings` - Risk management configuration
- `SubscriptionLimit` - Feature limits per tier

## Troubleshooting

### Build Fails with Database Errors

```bash
# Check if DATABASE_URL is set
echo $DATABASE_URL

# Test database connection
npx prisma db pull
```

### Preview Deployment Issues

- Verify `VERCEL_ENV=preview` is set
- Check browser console for graceful degradation logs
- Banner should show "Preview Deployment" message

### Local Development Database Issues

```bash
# Reset database
npx prisma migrate reset

# Regenerate client
npx prisma generate

# Check database status
npx prisma studio
```

## Migration Commands

```bash
# Create new migration
npx prisma migrate dev --name "description"

# Deploy to production
npx prisma migrate deploy

# Reset database (development only)
npx prisma migrate reset

# View database
npx prisma studio
```

## Security Notes

- Never commit `.env.local` or real credentials
- Use separate databases for development and production
- Rotate `NEXTAUTH_SECRET` regularly
- Enable SSL for production database connections

## Cost Optimization

**Free Tiers Available:**
- Supabase: 500MB, 2 projects
- Neon: 10GB, 1 project  
- Railway: $5 credit monthly

**Preview Strategy:**
- Use graceful degradation to minimize database usage
- Perfect for stakeholder reviews without database costs