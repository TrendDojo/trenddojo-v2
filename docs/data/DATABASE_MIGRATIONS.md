# Database Migration Strategy

*Last updated: 2025-09-28*

## 🔐 The Challenge

Prisma migrations require a direct database connection (port 5432), but:
- Vercel uses pooled connections (port 6543) for runtime
- Direct connections contain passwords we can't expose
- Migrations must run securely without manual password entry

## 📋 Available Solutions

### Solution 1: GitHub Actions (Recommended for Teams)

**Setup:**
1. Add `DATABASE_URL_DIRECT` secret to GitHub repository settings
   - Use direct connection string (port 5432)
   - Format: `postgresql://postgres.[PROJECT]:[PASSWORD]@[HOST].supabase.co:5432/postgres`

2. Migrations run automatically when:
   - Pushing to main branch
   - Changes detected in `prisma/` directory
   - Manually triggered via GitHub Actions UI

**Usage:**
```bash
# Automatic on push to main
git push origin main

# Or manually trigger in GitHub Actions tab
```

### Solution 2: Vercel Build Hook

**Setup:**
1. Add `MIGRATE_DATABASE_URL` to Vercel environment variables
   - Use direct connection (port 5432)
   - Only set for production environment

2. Update Vercel build settings:
   ```json
   {
     "buildCommand": "npm run vercel-build"
   }
   ```

**How it works:**
- Migrations run during Vercel build process
- Only in production environment
- Falls back gracefully if migration fails

### Solution 3: Local Secure Migration

**Setup (one-time):**
```bash
npm run migrate:setup
# Enter your direct DATABASE_URL
# Create a password to encrypt it
```

**Usage:**
```bash
npm run migrate:run
# Enter your password
# Migrations run securely
```

**Security:**
- Credentials encrypted with AES-256-GCM
- Stored in `~/.trenddojo-migrate-config` with 600 permissions
- Password never stored, only used for decryption

## 🔄 Connection Strategy

### Runtime (Application)
- **Connection Type**: Pooled
- **Port**: 6543
- **URL Parameter**: `?pgbouncer=true`
- **Used by**: Vercel functions, API routes

### Migrations (Schema Changes)
- **Connection Type**: Direct
- **Port**: 5432
- **URL Parameter**: None
- **Used by**: Migration scripts, schema pushes

## 🚨 Important Notes

1. **Never commit database URLs** to version control
2. **Always use pooled connections** in Vercel environment variables
3. **Only use direct connections** for migrations
4. **Test migrations in staging** before production

## 📝 Migration Workflow

### Development
```bash
# Create new migration
npx prisma migrate dev --name descriptive-name

# Test locally
npm run dev
```

### Staging
```bash
# Deploy to preview branch
git push origin dev

# Migrations run automatically (if configured)
```

### Production
```bash
# Option 1: GitHub Actions (automatic)
git push origin main

# Option 2: Local secure migration
npm run migrate:run

# Option 3: Vercel build hook (automatic)
vercel --prod
```

## 🔧 Troubleshooting

### "prepared statement already exists"
- **Cause**: Using pooled connection for migrations
- **Fix**: Use direct connection (port 5432)

### "Can't reach database server"
- **Cause**: Database may be paused (Supabase free tier)
- **Fix**: Check Supabase dashboard, unpause database

### "Migration already applied"
- **Cause**: Migration history out of sync
- **Fix**: Run `npx prisma migrate status` to check state

## 🔒 Security Best Practices

1. **Rotate credentials regularly**
2. **Use different passwords** for different environments
3. **Audit access logs** in Supabase dashboard
4. **Enable 2FA** on GitHub and Vercel accounts
5. **Limit migration permissions** to specific users/services