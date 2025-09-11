# TrendDojo Architecture Overview

*Last updated: 2025-09-10*

## System Architecture

TrendDojo is a professional trading platform built as a modern SaaS application with systematic risk management and position sizing capabilities.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend                             │
│                    Next.js 14 App Router                     │
│                  TypeScript + React + Tailwind               │
└─────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                      API Layer (tRPC)                        │
│                   Type-safe API endpoints                    │
│                    Input/Output validation                   │
└─────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                    Business Logic Layer                      │
│              Risk calculations, Position sizing              │
│                Strategy execution, Analytics                 │
└─────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                      Data Layer (Prisma)                     │
│                  PostgreSQL (via Supabase)                   │
│                    Type-safe ORM queries                     │
└─────────────────────────────────────────────────────────────┘
```

## Core Components

### Frontend (Next.js 14)
- **App Router**: Modern routing with layouts and server components
- **Server Components**: Reduced client bundle, better SEO
- **Client Components**: Interactive features with Zustand state management
- **Responsive Design**: Mobile-first with Tailwind CSS

### API Layer (tRPC)
- **Type Safety**: End-to-end TypeScript with no code generation
- **Validation**: Zod schemas for input/output validation
- **Error Handling**: Structured error responses with proper status codes
- **Rate Limiting**: Protection against abuse

### Authentication (NextAuth.js v5)
- **Multiple Providers**: Email, Google, GitHub
- **Session Management**: JWT-based sessions
- **Role-Based Access**: User, Pro, Admin roles
- **Secure by Default**: CSRF protection, secure cookies

### Database (PostgreSQL/Supabase)
- **Managed Infrastructure**: Supabase handles scaling and backups
- **Row-Level Security**: Tenant isolation at database level
- **Migrations**: Prisma migrate for schema versioning
- **Type Safety**: Generated TypeScript types from schema

### Deployment (Vercel)
- **Edge Network**: Global CDN for static assets
- **Serverless Functions**: Auto-scaling API endpoints
- **Preview Deployments**: Automatic deploys for branches
- **Environment Management**: Secure secrets handling

## Key Design Decisions

### 1. Graceful Degradation
The app works without a database for marketing pages, allowing preview deployments without full infrastructure.

### 2. Type Safety First
tRPC + Prisma + TypeScript ensures type safety from database to UI, catching errors at compile time.

### 3. Server-First Rendering
Next.js App Router with server components reduces client bundle size and improves performance.

### 4. Managed Services
Using Supabase and Vercel reduces operational overhead and provides enterprise-grade infrastructure.

## Security Architecture

### Authentication & Authorization
- JWT tokens with secure httpOnly cookies
- Role-based access control (RBAC)
- Multi-factor authentication support

### Data Protection
- All API endpoints require authentication
- Row-level security in database
- Encrypted data at rest and in transit
- PII data minimization

### API Security
- Rate limiting on all endpoints
- Input validation with Zod
- CORS configuration
- SQL injection protection via Prisma

## Performance Considerations

### Optimization Strategies
- Image optimization with Next.js Image
- Code splitting and lazy loading
- Database query optimization
- CDN caching for static assets

### Monitoring
- Error tracking (planned: Sentry)
- Performance monitoring (Vercel Analytics)
- Uptime monitoring
- Database performance metrics

## Scalability

### Horizontal Scaling
- Stateless API design
- Serverless functions auto-scale
- Database connection pooling
- CDN for global distribution

### Data Architecture
- Efficient indexing strategies
- Pagination for large datasets
- Caching layer (planned: Redis)
- Background job processing (planned)

## Integration Points

### External Services
- **Payment Processing**: Airwallex (planned)
- **Email Service**: Resend (planned)
- **Broker APIs**: Alpaca, IBKR, TD Ameritrade (planned)
- **Market Data**: Polygon.io (planned)

### Webhooks
- Payment events
- Broker trade confirmations
- Market data updates

## Development Workflow

### Local Development
```bash
npm install
npm run dev
# Runs on http://localhost:3000
```

### Testing Strategy
- Unit tests with Vitest
- Integration tests for API endpoints
- E2E tests with Playwright
- Manual testing checklist

### CI/CD Pipeline
1. GitHub push triggers build
2. Automated tests run
3. Type checking and linting
4. Preview deployment on Vercel
5. Manual promotion to production

## Future Considerations

### Planned Enhancements
- WebSocket support for real-time data
- Multi-region deployment
- Advanced caching strategies
- Microservices architecture (if needed)

### Technical Debt
- Add comprehensive test coverage
- Implement proper error boundaries
- Add request tracing
- Performance optimization pass

---

For implementation details, see `/docs/reference/` directory.
For design decisions, see `/docs/decisions/` directory.