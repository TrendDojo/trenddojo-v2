# TrendDojo Quick Setup Guide

*Infrastructure patterns adopted from Controlla V2*

## Prerequisites

- Node.js 18+ 
- PostgreSQL database
- SendGrid account (optional for development)
- Google OAuth credentials (optional)

## Environment Setup

### 1. Copy Environment Template
```bash
cp .env.example .env.local
```

### 2. Configure Core Variables
```bash
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/trenddojo_dev"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-super-secret-key-here"

# Trading Safety (IMPORTANT)
NEXT_PUBLIC_REAL_MONEY_ENABLED=false  # Keep false for development!

# SendGrid (optional for dev)
SENDGRID_TRENDDOJO_API_KEY=""
SENDGRID_TRENDDOJO_FROM_EMAIL="dev@trenddojo.com"
```

## Database Setup

### 1. Initialize Database
```bash
npm run prisma:generate
npm run db:push
```

### 2. Seed Development Data
```bash
npm run db:seed:dev
```

## Start Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` - you should see:
- 🔵 **DEVELOPMENT** badge in bottom-left corner
- 📊 **PAPER TRADING** badge in top-right corner  
- No real money warnings (safe for development)

## Key Features Enabled

### ✅ Environment Safety
- Visual indicators prevent confusion about environment
- Real money trading blocked in development
- Click environment badge to see safety details

### ✅ Trading Safety System
```typescript
// All trades go through safety checks
import { TradingSafetyContext } from '@/lib/trading/safety-checks'

const context = new TradingSafetyContext(userId)
const result = await context.executeTrade(tradeRequest)
```

### ✅ Email Service (Mock Mode)
```typescript
// Emails logged to console in development
import { trendDojoEmailService } from '@/lib/email/trenddojo-email-service'

await trendDojoEmailService.send({
  to: 'user@example.com',
  templateType: 'welcome',
  data: { firstName: 'Trader' }
})
```

### ✅ Authentication Ready
- `/login` and `/signup` pages configured
- NextAuth with Prisma adapter
- Google OAuth ready (add credentials to enable)

## Run Tests

```bash
# All tests
npm run test

# Financial calculations (critical)
npm run test calculations.test.ts

# Trading safety system
npm run test trading-safety.test.ts

# Test coverage
npm run test:coverage
```

## Production Deployment

### Critical Environment Variables
```bash
NODE_ENV=production
VERCEL_ENV=production
NEXT_PUBLIC_REAL_MONEY_ENABLED=true  # Only set true in production!
DATABASE_URL="postgresql://prod-host/trenddojo"
SENDGRID_TRENDDOJO_API_KEY="sg-production-key"
```

### Deployment Checklist
- [ ] All tests passing (`npm run test:run`)
- [ ] Build successful (`npm run build`)
- [ ] Database migrations applied (`npm run db:migrate:production`)
- [ ] SendGrid configured with production templates
- [ ] Real money trading safety verified
- [ ] Environment indicators hidden in production

## Troubleshooting

### Environment Badge Not Showing?
- Check that `NODE_ENV` is not set to `production`
- Verify `NEXT_PUBLIC_APP_URL` is set correctly

### Trading Safety Errors?
- Ensure user has proper trading permissions in database
- Check that environment allows the trade type (real vs paper)

### Email Not Working?
- In development, emails are logged to console
- Check SendGrid API key configuration
- Verify `SENDGRID_TRENDDOJO_*` environment variables

### Tests Failing?
- Ensure all required dependencies installed: `npm install`
- Check that test database is accessible
- Run tests in isolation: `npm run test -- --reporter=verbose`

## Next Steps

1. **Configure Real Trading API**: Add your broker API credentials
2. **Set Up Production SendGrid**: Create email templates
3. **Enable Google OAuth**: Add client ID and secret
4. **Customize Email Templates**: Update branding and content
5. **Configure Risk Limits**: Set appropriate trading limits
6. **Set Up Monitoring**: Add logging and alerting

## Support

For issues with infrastructure patterns, check:
- [Infrastructure Adoption Guide](/docs/infrastructure/INFRASTRUCTURE_ADOPTION.md)
- [Controlla V2 Reference Implementation](/Users/duncanmcgill/coding/controlla-v2/)
- Test files for usage examples

Remember: **Always keep real money trading disabled in development!** 🚨