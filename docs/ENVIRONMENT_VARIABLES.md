# Environment Variables Reference

## 🔑 Complete Variable List

### Core Requirements (ALL Environments)

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` | ✅ Yes |
| `NEXTAUTH_SECRET` | Auth encryption key | Generate: `openssl rand -base64 32` | ✅ Yes |
| `NEXTAUTH_URL` | Application URL | See environment-specific values below | ✅ Yes |

### Market Data Integration

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `POLYGON_API_KEY` | Polygon.io API key | `your_polygon_api_key` | ✅ Preview/Prod |

### Cron Jobs & Background Tasks

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `CRON_SECRET` | Vercel cron authentication | Generate: `openssl rand -hex 32` | ✅ Preview/Prod |

### Vercel Platform

| Variable | Description | Set By | Required |
|----------|-------------|--------|----------|
| `VERCEL_ENV` | Environment name | Vercel (automatic) | ✅ Preview/Prod |
| `VERCEL_URL` | Deployment URL | Vercel (automatic) | ✅ Preview/Prod |
| `VERCEL_GIT_COMMIT_SHA` | Commit hash | Vercel (automatic) | Auto |
| `VERCEL_GIT_COMMIT_MESSAGE` | Commit message | Vercel (automatic) | Auto |
| `VERCEL_GIT_COMMIT_REF` | Branch name | Vercel (automatic) | Auto |

### Optional Enhancements

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `SENTRY_DSN` | Error tracking | `https://xxx@sentry.io/xxx` | ❌ Optional |
| `NEXT_PUBLIC_MAINTENANCE_MODE` | Maintenance flag | `true` or `false` | ❌ Optional |
| `LOG_LEVEL` | Logging verbosity | `debug`, `info`, `warn`, `error` | ❌ Optional |

## 🌍 Environment-Specific Values

### Local Development
```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/trenddojo_dev
NEXTAUTH_SECRET=dev-secret-change-in-production
NEXTAUTH_URL=http://localhost:3002  # Port from starto registry
POLYGON_API_KEY=your_dev_api_key
```

### Preview Environment
```env
DATABASE_URL=postgresql://[supabase-connection-string]
NEXTAUTH_SECRET=[secure-generated-secret]
NEXTAUTH_URL=https://trenddojo-v2-git-dev-traderclicks.vercel.app
POLYGON_API_KEY=[polygon-api-key]
CRON_SECRET=[secure-cron-secret]
```

### Production Environment
```env
DATABASE_URL=postgresql://[production-db-connection]
NEXTAUTH_SECRET=[production-secret-rotated-quarterly]
NEXTAUTH_URL=https://trenddojo.com
POLYGON_API_KEY=[production-polygon-key]
CRON_SECRET=[production-cron-secret]
SENTRY_DSN=[sentry-project-dsn]
```

## 🔧 Setting Environment Variables

### Local Development (.env.local)
```bash
# Create .env.local file
cp .env.example .env.local

# Edit with your values
nano .env.local
```

### Vercel Dashboard
1. Go to [Environment Variables](https://vercel.com/traderclicks/trenddojo-v2/settings/environment-variables)
2. Click "Add New"
3. Enter name and value
4. Select environments:
   - [ ] Production
   - [ ] Preview
   - [ ] Development
5. Click "Save"

### Vercel CLI
```bash
# Add to specific environment
vercel env add VARIABLE_NAME production

# Add to multiple environments
vercel env add VARIABLE_NAME preview production

# List all variables
vercel env ls

# Remove variable
vercel env rm VARIABLE_NAME production
```

## 🔐 Secret Generation

### Generate NEXTAUTH_SECRET
```bash
# Method 1: OpenSSL
openssl rand -base64 32

# Method 2: Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Method 3: UUID
uuidgen | shasum -a 256 | base64
```

### Generate CRON_SECRET
```bash
# Hexadecimal format
openssl rand -hex 32

# Or alphanumeric
openssl rand -base64 24 | tr -d "=+/" | cut -c1-32
```

## 🧪 Validation

### Check Required Variables
```bash
# Run validation script
./scripts/deployment/validate-environment.sh

# Or manually check
env | grep -E "DATABASE_URL|NEXTAUTH|POLYGON|CRON"
```

### Test Database Connection
```bash
# Using Prisma
npx prisma db pull --print

# Using psql
psql $DATABASE_URL -c "SELECT 1"
```

### Test API Keys
```bash
# Test Polygon API
curl -H "Authorization: Bearer $POLYGON_API_KEY" \
  "https://api.polygon.io/v2/aggs/ticker/AAPL/range/1/day/2024-01-01/2024-01-01"
```

## 📝 Best Practices

### DO's ✅
- Use strong, unique secrets for each environment
- Rotate secrets quarterly (production)
- Use Vercel dashboard for production secrets
- Keep `.env.local` in `.gitignore`
- Document variable purposes clearly
- Use environment-specific prefixes (e.g., `NEXT_PUBLIC_` for client-side)

### DON'Ts ❌
- Never commit `.env` files to git
- Don't use same secrets across environments
- Don't hardcode secrets in code
- Don't share production secrets in documentation
- Don't use weak or predictable secrets
- Don't expose server-side variables to client

## 🚨 Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| "DATABASE_URL not set" | Check `.env.local` exists and has DATABASE_URL |
| "Invalid NEXTAUTH_SECRET" | Regenerate with proper length (32+ chars base64) |
| "POLYGON_API_KEY invalid" | Verify key is active and has correct permissions |
| "Environment variable not found" | Restart dev server after adding variables |
| "Different behavior local vs deployed" | Check Vercel dashboard for missing variables |

### Debug Commands
```bash
# Show all environment variables (careful!)
env | sort

# Check specific variable
echo $DATABASE_URL | cut -c1-20...  # Show first 20 chars only

# Verify in Node.js
node -e "console.log(process.env.NEXTAUTH_URL)"

# Check in Next.js app
console.log('Env check:', {
  hasDb: !!process.env.DATABASE_URL,
  hasAuth: !!process.env.NEXTAUTH_SECRET,
  env: process.env.VERCEL_ENV || 'local'
})
```

## 🔄 Migration from Old Setup

If migrating from old environment setup:

1. **Export old variables**:
   ```bash
   vercel env pull .env.old
   ```

2. **Update variable names** (if changed):
   - `NEXT_AUTH_SECRET` → `NEXTAUTH_SECRET`
   - `NEXT_AUTH_URL` → `NEXTAUTH_URL`

3. **Add new required variables**:
   - `CRON_SECRET` for scheduled jobs
   - `POLYGON_API_KEY` for market data

4. **Remove deprecated variables**:
   - Any unused API keys
   - Old service configurations

5. **Test thoroughly** before deploying

---

**Security Note**: This document shows variable names and formats only. Never commit actual secret values to git.

*Last updated: 2025-09-28*
*Review secrets: Quarterly*