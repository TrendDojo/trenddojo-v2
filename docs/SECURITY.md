# Security Configuration

*Last updated: 2025-09-28*

## 🔒 Security Philosophy

**Defense in Depth**: Multiple layers of security to protect Preview and Production environments.

## 🛡️ Security Measures by Environment

### All Environments
```typescript
// Implemented in middleware.ts
const securityHeaders = {
  'X-Frame-Options': 'DENY',                    // Prevent clickjacking
  'X-Content-Type-Options': 'nosniff',         // Prevent MIME sniffing
  'X-XSS-Protection': '1; mode=block',         // XSS protection
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
}
```

### Preview Environment (Additional)
- **X-Robots-Tag**: `noindex, nofollow, noarchive, nosnippet`
- **Dynamic robots.txt**: Returns `Disallow: /` for all crawlers
- **Obscure URL**: Vercel-generated URL prevents discovery
- **Optional Basic Auth**: Ready to enable in middleware.ts

### Production Environment (Additional)
- **HSTS Header**: `Strict-Transport-Security: max-age=31536000`
- **SSL Only**: HTTPS enforced
- **Selective robots.txt**: Public pages indexed, admin areas blocked

## 🌐 Preview URL Security Strategy

### ✅ Decision: Use Vercel URLs for Preview

**Current URL**: `https://trenddojo-v2-git-dev-traderclicks.vercel.app`

### Why Vercel URLs Are More Secure

| Security Aspect | Custom Domain (preview.trenddojo.com) | Vercel URL | Winner |
|-----------------|---------------------------------------|------------|---------|
| Discoverability | Easy via subdomain scanning | Nearly impossible | Vercel ✅ |
| Brand exposure | Obvious TrendDojo connection | No connection | Vercel ✅ |
| SSL transparency | Public CT logs | Generic cert | Vercel ✅ |
| Cookie isolation | Partial (subdomain) | Complete | Vercel ✅ |
| DNS footprint | Visible in DNS | None | Vercel ✅ |

### Security Through Obscurity Benefits
1. **Unguessable**: Contains random team identifier
2. **No brand association**: Doesn't reveal it's TrendDojo
3. **Not in DNS records**: Can't be enumerated
4. **No SSL transparency logs**: Doesn't appear in CT logs
5. **Complete domain isolation**: Different origin from production

### Complete Domain Isolation
```
Production:  trenddojo.com
Preview:     trenddojo-v2-git-dev-traderclicks.vercel.app
```
- **Different origins**: Complete browser security isolation
- **No cookie sharing**: Different domains = no cookie leaks
- **Separate localStorage**: No data sharing
- **Independent SSL**: Different certificates

### Protection from Common Attacks

| Attack Vector | Custom Domain Risk | Vercel URL Protection |
|--------------|-------------------|----------------------|
| Subdomain enumeration | HIGH - Tools find preview.trenddojo.com | NONE - Not a subdomain |
| DNS zone transfer | MEDIUM - Might leak | NONE - Different zone |
| Certificate transparency | HIGH - Public logs | LOW - Generic cert |
| Targeted attacks | HIGH - Brand association | LOW - Unknown target |
| Cookie hijacking | MEDIUM - *.trenddojo.com | NONE - Different domain |
| Subdomain takeover | MEDIUM - If misconfigured | NONE - Vercel managed |

## 🚫 SEO Protection

### Preview Environment
```typescript
// Dynamic robots.txt (src/app/robots.ts)
if (isPreview || !isProduction) {
  return {
    rules: {
      userAgent: '*',
      disallow: '/',           // Block everything
      crawlDelay: 86400,       // 24 hours delay
    },
    sitemap: undefined,        // No sitemap
  }
}
```

### Production Environment
```typescript
// Selective blocking
rules: [
  {
    userAgent: '*',
    allow: '/',
    disallow: ['/api/', '/admin/', '/positions/', '/settings/']
  },
  {
    userAgent: ['AhrefsBot', 'SemrushBot'],  // Block bad bots
    disallow: '/'
  }
]
```

## 🔐 Content Security Policy (CSP)

```typescript
// Implemented in middleware.ts
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-eval' 'unsafe-inline' *.vercel.app",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https: blob:",
  "font-src 'self' data:",
  "connect-src 'self' *.vercel.app wss: https:",
  "frame-ancestors 'none'",
].join('; ')
```

## 🔑 Security Enhancements

### 1. Enable Basic Auth for Preview
```typescript
// Uncomment in middleware.ts
const basicAuth = request.headers.get('authorization')
const validAuth = 'Basic ' + Buffer.from('preview:YourSecurePassword').toString('base64')

if (basicAuth !== validAuth) {
  return new Response('Authentication required', {
    status: 401,
    headers: { 'WWW-Authenticate': 'Basic realm="Preview"' }
  })
}
```

### 2. IP Allowlisting (Vercel Dashboard)
1. Go to Settings → Functions → Allowlist IPs
2. Add office/home IP addresses
3. Blocks all other access

### 3. Environment Detection
```typescript
// Already implemented
if (process.env.VERCEL_ENV === 'preview') {
  // Block robots
  // Add security headers
  // Disable features
}
```

### 4. Rate Limiting (Informational Headers)
```typescript
// Currently informational only
response.headers.set('X-RateLimit-Limit', '100')
response.headers.set('X-RateLimit-Remaining', '99')
response.headers.set('X-RateLimit-Reset', new Date(Date.now() + 60000).toISOString())
```

## 🔐 Environment Variables Security

### Critical Secrets
```bash
# Never commit these
NEXTAUTH_SECRET=        # Strong random string (rotate quarterly)
CRON_SECRET=           # For cron job protection
POLYGON_API_KEY=       # Keep in Vercel only
DATABASE_URL=          # Never in code
```

### API Security
- **CORS**: Configured for market data endpoints
- **Rate limiting headers**: X-RateLimit-* headers
- **Cron protection**: Authorization required (401 for unauthorized)

## 🧪 Testing Security

### Check All Headers
```bash
# Preview
curl -I https://trenddojo-v2-git-dev-traderclicks.vercel.app | grep -E "^X-|^Content-Security|^Strict"

# Production
curl -I https://trenddojo.com | grep -E "^X-|^Content-Security|^Strict"
```

### Verify robots.txt
```bash
# Preview - should block everything
curl https://trenddojo-v2-git-dev-traderclicks.vercel.app/robots.txt

# Expected:
# User-agent: *
# Disallow: /
```

### Test CSP
```bash
# Check Content Security Policy
curl -I https://trenddojo-v2-git-dev-traderclicks.vercel.app | grep "Content-Security-Policy"
```

## 🔐 How to Share Preview URL Securely

### Option 1: Environment File (Current)
```bash
# .env.deployment
PREVIEW_URL=https://trenddojo-v2-git-dev-traderclicks.vercel.app
```

### Option 2: Team Password Manager
- Store in 1Password/LastPass/Bitwarden
- Share with team members only
- Rotate if compromised

### Option 3: Internal Wiki
- Document in private Notion/Confluence
- Restrict access to team

### Never:
- ❌ Put in public documentation
- ❌ Share in public forums
- ❌ Include in client emails
- ❌ Post on social media

## 📊 Security Checklist

### Preview Environment
- [x] Blocks search engines (X-Robots-Tag + robots.txt)
- [x] Security headers active
- [x] Obscure Vercel URL (not custom domain)
- [x] CORS configured for market data
- [x] Complete cookie isolation from production
- [ ] Basic auth (optional - ready to enable)
- [ ] IP allowlisting (optional - via Vercel)

### Production Environment
- [x] HTTPS enforced (HSTS header)
- [x] Security headers active
- [x] Selective robot blocking
- [x] API protection
- [ ] Rate limiting (future - currently informational)
- [ ] WAF/CDN (future - Cloudflare)

## 🚨 If Preview URL Is Discovered

1. **Enable Basic Auth immediately** (uncomment in middleware.ts)
2. **Check access logs** in Vercel dashboard
3. **Add IP allowlisting** via Vercel settings
4. **Monitor for suspicious activity**
5. **Consider changing branch name** (creates new URL)

## 📈 Security Monitoring

### Weekly Checks
- [ ] Review Vercel access logs
- [ ] Check for unusual traffic patterns
- [ ] Verify no search engine indexing
- [ ] Confirm security headers active

### Monthly Audits
- [ ] Review who has Preview URL access
- [ ] Update IP allowlist if needed
- [ ] Check for exposed secrets with `npm audit`
- [ ] Test all security headers

## 🔄 Security Updates

### Dependency Security
```bash
# Check for vulnerabilities
npm audit

# Auto-fix when safe
npm audit fix

# Check for updates
npm outdated
```

### Secret Rotation
- Rotate NEXTAUTH_SECRET quarterly
- Update CRON_SECRET if exposed
- Rotate API keys annually or if compromised

## 📝 Security Best Practices

1. **Never expose API keys** in client-side code
2. **Always use environment variables** for secrets
3. **Review Vercel logs** regularly for suspicious activity
4. **Update dependencies** to patch vulnerabilities
5. **Test security headers** after each deployment
6. **Use Vercel URLs** for non-production environments
7. **Enable additional protections** (Basic Auth, IP allowlist) if handling sensitive data

## 🎯 Recommended Configuration

### Keep Using Vercel URLs For:
- ✅ Preview environment (dev branch)
- ✅ PR preview deployments
- ✅ Staging environment
- ✅ Internal testing

### Use Custom Domain Only For:
- ✅ Production (trenddojo.com)

---

**Remember**: Security is not optional. When in doubt, choose the more secure option.

*Next review: 2025-10-28*