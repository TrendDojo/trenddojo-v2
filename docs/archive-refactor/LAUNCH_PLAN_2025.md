# TrendDojo Launch Plan - Paper Trading MVP
*Created: 2025-01-20*

## 🎯 Launch Strategy: Free Paper Trading Only

### Core Decision
- **Paper Trading Only** - No real money risk
- **Free Tier Only** - No payment complexity
- **Focus**: Validate platform, gather feedback, build trust

## 📅 4-Week Sprint to Beta Launch

### Week 1: Security Foundation (Jan 20-26)
**Goal**: Secure the Alpaca integration and user data

#### Day 1-2: Credential Encryption
```typescript
// 1. Create encryption service
src/lib/security/encryption.ts
- AES-256-GCM encryption
- Environment-based keys
- Secure key storage

// 2. Update broker connection storage
src/app/api/brokers/connect/route.ts
- Encrypt before storing
- Decrypt on retrieval
- Audit trail
```

#### Day 3-4: Password Authentication
```bash
# 1. Update Prisma schema
model User {
  passwordHash String?
  emailVerified DateTime?
}

# 2. Run migration
npx prisma migrate dev --name add-password-auth

# 3. Update auth.ts
- Enable bcrypt hashing
- Implement password verification
- Add password reset flow
```

#### Day 5-7: Environment Configuration
```typescript
// Create secure environment configs
.env.development    # Local development
.env.staging       # Staging (paper only)
.env.production    # Production (paper only initially)

// Key variables
ENCRYPTION_KEY=[32-byte-key]
NEXTAUTH_SECRET=[secure-random]
DATABASE_URL=[supabase-url]
```

### Week 2: Infrastructure Setup (Jan 27 - Feb 2)
**Goal**: Production-grade infrastructure on Supabase

#### Day 1-2: Supabase Setup
```sql
-- 1. Create Supabase project
-- 2. Run migrations
npx prisma migrate deploy

-- 3. Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE strategies ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS policies
CREATE POLICY "Users can only see own data"
ON portfolios FOR ALL
USING (user_id = auth.uid());
```

#### Day 3-4: API Security
```typescript
// 1. Rate limiting
src/middleware/rateLimit.ts
- 100 requests/minute per user
- 10 auth attempts/hour

// 2. Input validation
src/lib/validation/schemas.ts
- Zod schemas for all inputs
- Sanitization rules
- Error messages
```

#### Day 5-7: Staging Deployment
```bash
# 1. Deploy to Vercel staging
vercel --env=staging

# 2. Connect Supabase staging
# 3. Run integration tests
# 4. Security scan
```

### Week 3: Feature Completion (Feb 3-9)
**Goal**: Connect all the pieces for paper trading

#### Day 1-2: Strategy Execution
```typescript
// Connect strategies to Alpaca
src/lib/trading/executor.ts
- Strategy → Signal → Order
- Paper trading validation
- Position tracking
```

#### Day 3-4: Position Monitoring
```typescript
// Real-time position updates
src/app/positions/page.tsx
- WebSocket connection
- Live P&L updates
- Position status display
```

#### Day 5-7: Testing & Polish
- End-to-end testing
- UI/UX refinements
- Error handling
- Help documentation

### Week 4: Beta Launch (Feb 10-16)
**Goal**: Controlled release to beta users

#### Day 1-2: Final Security Audit
- Penetration testing
- Credential verification
- RLS policy testing
- Rate limit testing

#### Day 3-4: Beta User Setup
- Create landing page
- Beta signup form
- Welcome emails
- Onboarding flow

#### Day 5-7: Launch!
- Deploy to production
- Monitor closely
- Gather feedback
- Quick fixes

## 🚀 Implementation Checklist

### Security (MUST HAVE for launch)
- [ ] Credential encryption implemented
- [ ] Password authentication working
- [ ] RLS policies active
- [ ] Rate limiting enabled
- [ ] Input validation on all endpoints
- [ ] Security headers configured
- [ ] HTTPS enforced
- [ ] Audit logging active

### Infrastructure
- [ ] Supabase production database
- [ ] Vercel production deployment
- [ ] Environment variables secured
- [ ] Error tracking (Sentry)
- [ ] Monitoring dashboard
- [ ] Backup strategy

### Features (Paper Trading)
- [ ] User registration/login
- [ ] Alpaca paper account connection
- [ ] Strategy creation (3 dropdowns)
- [ ] Paper order execution
- [ ] Position tracking
- [ ] Basic P&L display
- [ ] Account dashboard

### Documentation
- [ ] Terms of Service
- [ ] Privacy Policy
- [ ] Risk Disclaimers
- [ ] Getting Started guide
- [ ] FAQ section

## 🎯 Simplified Free Tier Limits

```typescript
const FREE_TIER = {
  maxStrategies: 3,
  maxPositions: 5,
  maxDailyTrades: 10,
  dataDelay: '15 minutes',
  paperTradingOnly: true,
  realMoneyEnabled: false,
  emailAlerts: false,
  apiAccess: false
}
```

## 📊 Success Metrics

### Week 1 (Beta Launch)
- 10 beta users signed up
- 5 users connect Alpaca
- 3 users create strategies
- 0 security incidents

### Month 1
- 50 total users
- 25 active paper traders
- 100+ paper trades executed
- 95% uptime

### Month 3
- 200 users
- Consider paid tiers
- Real money trading evaluation
- Feature expansion

## 🔒 Security Guardrails

### Paper Trading Only
```typescript
// Hard-coded safety
const REAL_MONEY_ENABLED = false; // NEVER change without full audit

// Multiple checks
if (order.realMoney) {
  throw new Error('Real money trading not enabled');
}

// Visual warnings everywhere
<Banner>
  ⚠️ PAPER TRADING ONLY - No Real Money ⚠️
</Banner>
```

### Data Protection
- All API keys encrypted
- No sensitive data in logs
- User data isolated by RLS
- Regular security scans

## 💻 Day 1 Implementation Tasks

### Task 1: Create Encryption Service
```bash
# Create encryption module
touch src/lib/security/encryption.ts
touch src/lib/security/encryption.test.ts
```

```typescript
// encryption.ts
import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const KEY = Buffer.from(process.env.ENCRYPTION_KEY!, 'hex');

export class EncryptionService {
  encrypt(text: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag();

    return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted;
  }

  decrypt(encrypted: string): string {
    const parts = encrypted.split(':');
    const iv = Buffer.from(parts[0], 'hex');
    const authTag = Buffer.from(parts[1], 'hex');
    const encryptedText = parts[2];

    const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }
}
```

### Task 2: Update Broker Connection API
```typescript
// Update src/app/api/brokers/connect/route.ts
import { EncryptionService } from '@/lib/security/encryption';

const encryption = new EncryptionService();

// Store encrypted
await prisma.brokerConnection.create({
  data: {
    userId: session.user.id,
    broker: 'alpaca',
    credentials: encryption.encrypt(JSON.stringify(credentials)),
    isPaper: true, // ALWAYS true for now
    isActive: true
  }
});
```

### Task 3: Add Password to Schema
```prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  passwordHash  String?   // Add this
  emailVerified DateTime? // Add this
  // ... rest of fields
}
```

## 📝 Daily Standup Format

```markdown
## Day X Update

### Completed
- [ ] Task 1
- [ ] Task 2

### Blockers
- None / Issue description

### Next
- Task 3
- Task 4

### Metrics
- Build passing: ✅/❌
- Tests passing: XX/XX
- Security scan: ✅/❌
```

## 🎉 Launch Day Checklist

### Pre-Launch (24 hours before)
- [ ] Final security scan
- [ ] Database backup
- [ ] Rollback plan ready
- [ ] Support email ready
- [ ] Monitoring dashboard up

### Launch Hour
- [ ] Deploy to production
- [ ] Verify all services
- [ ] Test user signup
- [ ] Test Alpaca connection
- [ ] Test paper trading

### Post-Launch (First 24 hours)
- [ ] Monitor error logs
- [ ] Check performance metrics
- [ ] Respond to user issues
- [ ] Daily backup verified
- [ ] Team celebration! 🎉

## 🚨 Abort Criteria

Stop launch if ANY of these occur:
- Security vulnerability discovered
- User data leak of any kind
- Authentication bypass found
- Encryption not working
- RLS policies failing

## 📞 Support Plan

### Channels
- Email: support@trenddojo.com
- Documentation: docs.trenddojo.com
- Status page: status.trenddojo.com

### Response Times (Free Tier)
- Critical (security): 2 hours
- High (can't trade): 24 hours
- Medium (bug): 48 hours
- Low (feature request): Best effort

## 🎯 North Star

**Remember**: We're launching a FREE, PAPER TRADING ONLY platform to validate the concept safely. No payment processing, no real money risk, just pure platform validation.

**Success looks like**:
- Users successfully paper trade
- Platform remains secure
- Feedback guides next features
- Foundation for paid tiers later

---

*Let's build something amazing, safely and systematically!*