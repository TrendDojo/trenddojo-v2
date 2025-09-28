# ⚠️ DEPRECATED - Do Not Use

**This document is deprecated and its recommendations conflict with security best practices.**
**We use Vercel URLs for Preview environments for security reasons.**
**See [SECURITY.md](./SECURITY.md#preview-url-security-strategy) for current approach.**

---

# Preview URL Configuration [DEPRECATED - DO NOT FOLLOW]

## Recommended Setup: Permanent Preview URL

### Option 1: Subdomain Approach (RECOMMENDED)
Create a permanent subdomain that always points to the `dev` branch:
- **preview.trenddojo.com** → Always shows dev branch
- **staging.trenddojo.com** → Alternative naming
- **dev.trenddojo.com** → Clear branch association

### Option 2: Environment-Based URLs
- **trenddojo.com** → Production (main branch)
- **preview.trenddojo.com** → Preview (dev branch)
- **test.trenddojo.com** → Testing environment

## Setup Instructions

### 1. Configure in Vercel Dashboard

```bash
# Via CLI (if you have access)
vercel alias set https://trenddojo-v2-git-dev-traderclicks.vercel.app preview.trenddojo.com

# Or manually in dashboard:
1. Go to: https://vercel.com/traderclicks/trenddojo-v2/settings/domains
2. Add domain: preview.trenddojo.com
3. Configure to: Git Branch → dev
```

### 2. DNS Configuration

Add CNAME record to your DNS provider:
```
Type: CNAME
Name: preview
Value: cname.vercel-dns.com
TTL: 3600
```

Or if using Vercel DNS:
```
Type: CNAME
Name: preview
Value: trenddojo-v2-git-dev-traderclicks.vercel.app
```

### 3. Update Scripts

Once configured, update deployment scripts:

```bash
# In scripts/deployment/get-preview-url.sh
PREVIEW_URL="https://preview.trenddojo.com"

# In package.json
"preview:url": "echo https://preview.trenddojo.com"
```

## Benefits of Permanent Preview URL

✅ **Consistent Testing**: Same URL every time
✅ **Documentation**: Can hardcode in guides
✅ **Bookmarkable**: Team can bookmark Preview
✅ **CI/CD**: Reliable endpoint for automated tests
✅ **Professional**: Looks better than hash URLs
✅ **SEO Control**: Can add robots.txt to prevent indexing

## Current Dynamic URLs (for reference)

- **Pattern**: `https://trenddojo-v2-[hash]-traderclicks.vercel.app`
- **Latest**: `https://trenddojo-v2-7b6hnnsqh-traderclicks.vercel.app`
- **Changes**: Every deployment gets new hash

## Recommended Configuration

```
Production:    trenddojo.com          → main branch
Preview:       preview.trenddojo.com  → dev branch
Feature:       pr-*.trenddojo.com     → PR branches (optional)
```

## Security Considerations

1. **Add authentication** to Preview if sensitive data
2. **Block search engines** with robots.txt
3. **Use environment variables** to differentiate
4. **Consider IP allowlisting** for internal Preview

## Next Steps

1. Choose subdomain name (preview, staging, or dev)
2. Configure in Vercel dashboard
3. Update DNS records
4. Test the permanent URL
5. Update all scripts to use permanent URL