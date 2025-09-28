# Security & SEO Configuration

## 🔒 Security Measures Implemented

### 1. Security Headers (via Middleware)
- **X-Frame-Options**: DENY - Prevents clickjacking
- **X-Content-Type-Options**: nosniff - Prevents MIME sniffing
- **X-XSS-Protection**: 1; mode=block - XSS protection
- **Referrer-Policy**: strict-origin-when-cross-origin
- **Permissions-Policy**: Blocks camera, microphone, geolocation
- **Content-Security-Policy**: Restricts resource loading
- **Strict-Transport-Security**: HTTPS only (production)

### 2. Environment-Specific Protection

#### Preview/Staging
- ✅ **X-Robots-Tag**: noindex, nofollow - Prevents indexing
- ✅ **robots.txt**: Blocks all crawlers
- ✅ **CSP**: Restrictive content policy
- ⚡ **Optional Basic Auth**: Ready to enable

#### Production
- ✅ **HTTPS enforced**: Via HSTS header
- ✅ **Selective robots.txt**: Allows indexing of public pages
- ✅ **API rate limiting headers**: Informational

### 3. API Security
- **CORS**: Configured for market data endpoints
- **Rate limiting headers**: X-RateLimit-* headers
- **Cron protection**: Authorization required (401 for unauthorized)

## 🚫 SEO Protection

### Preview Environment Protection
```
https://trenddojo-v2-git-dev-traderclicks.vercel.app
```
- **robots.txt**: Returns "Disallow: /" for all crawlers
- **X-Robots-Tag header**: noindex, nofollow, noarchive
- **No sitemap**: Prevents discovery
- **Crawl delay**: 24 hours to slow persistent bots

### Production SEO
```
https://trenddojo.com
```
- **Selective indexing**: Public pages allowed
- **Protected areas**: /api/, /admin/, /positions/, /settings/
- **Bad bot blocking**: AhrefsBot, SemrushBot, etc.
- **Google friendly**: Special rules for Googlebot

## 🔐 Optional Security Enhancements

### 1. Enable Basic Auth for Preview (Uncomment in middleware.ts)
```typescript
const basicAuth = request.headers.get('authorization')
const validAuth = 'Basic ' + Buffer.from('preview:yourpassword').toString('base64')

if (basicAuth !== validAuth) {
  return new Response('Authentication required', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Preview Environment"',
    },
  })
}
```

### 2. IP Allowlisting (Vercel Dashboard)
- Go to: Settings → Security → IP Allowlisting
- Add your office/home IP addresses
- Applies to Preview environment only

### 3. Environment Variables Security
```bash
# Never commit these
NEXTAUTH_SECRET=        # Strong random string
CRON_SECRET=           # For cron job protection
POLYGON_API_KEY=       # Keep in Vercel only
DATABASE_URL=          # Never in code
```

### 4. Rate Limiting (Future)
- Consider Vercel Edge Config for rate limiting
- Or use Cloudflare in front for DDoS protection

## 🧪 Testing Security

### Check robots.txt
```bash
# Preview - should block everything
curl https://trenddojo-v2-git-dev-traderclicks.vercel.app/robots.txt

# Production - should allow selective
curl https://trenddojo.com/robots.txt
```

### Check Security Headers
```bash
# Test Preview
curl -I https://trenddojo-v2-git-dev-traderclicks.vercel.app | grep -E "X-Frame|X-Content|X-XSS|X-Robots"

# Should see:
# X-Frame-Options: DENY
# X-Content-Type-Options: nosniff
# X-XSS-Protection: 1; mode=block
# X-Robots-Tag: noindex, nofollow, noarchive
```

### Verify CSP
```bash
# Check Content Security Policy
curl -I https://trenddojo-v2-git-dev-traderclicks.vercel.app | grep "Content-Security"
```

## 📊 Security Checklist

### Preview Environment
- [x] Blocks search engines
- [x] Security headers active
- [x] No sensitive data exposed
- [x] CORS configured
- [ ] Basic auth (optional)
- [ ] IP allowlisting (optional)

### Production Environment
- [x] HTTPS enforced
- [x] Security headers active
- [x] Selective robot blocking
- [x] API protection
- [ ] Rate limiting (future)
- [ ] WAF/CDN (future)

## 🚨 Important Notes

1. **Never expose API keys** in client-side code
2. **Always use environment variables** for secrets
3. **Review Vercel logs** regularly for suspicious activity
4. **Update dependencies** to patch vulnerabilities
5. **Test security headers** after each deployment

## 🔄 Next Steps

1. **Enable Basic Auth** if Preview needs protection
2. **Configure Cloudflare** for additional protection
3. **Set up monitoring** for security events
4. **Regular security audits** with `npm audit`
5. **Consider penetration testing** before launch