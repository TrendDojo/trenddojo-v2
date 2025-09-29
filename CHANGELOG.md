# Changelog

> 🚀 **DEPLOYMENT PROCESS**: Before ANY deployment, READ `/docs/DEPLOYMENT_GUIDE.md`
> - **MANDATORY**: Follow all 4 phases (Local → Preview → Documentation → Production)
> - **NEVER** push directly to main without following the process
> - AI assistant MUST complete the entire deployment workflow

All notable changes to TrendDojo V2 will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]
### To Do
- Error tracking setup (Sentry)
- External monitoring/alerting
- Automated database backups

## [0.4.0] - 2025-09-28
### Added
- Automated database migration system via Vercel build hook
- Market schema with 4 tables for price data and quotes
- Secure migration script with encryption for local runs
- GitHub Actions workflow for CI/CD migrations
- DATABASE_MIGRATIONS.md documentation

### Fixed
- Database connection using proper pooling (port 6543 with pgbouncer)
- All API keys configured (Polygon, CRON_SECRET)
- Health check now returns "healthy" status
- Market schema initialization warning resolved

### Changed
- Build process uses `npm run vercel-build` for automatic migrations
- DATABASE_URL requires `?pgbouncer=true` for Vercel deployments
- Added MIGRATE_DATABASE_URL for direct migration connections

## [0.3.0] - 2025-09-28
### Added
- Release documentation process with CHANGELOG.md
- Release notes directory structure
- Integrated release phase into deployment workflow
- Shared framework release documentation standard

### Changed
- Deployment process now includes release documentation phase
- Version numbers assigned AFTER preview verification

## [0.2.0] - 2025-09-28
### Added
- Comprehensive deployment documentation system
  - DEPLOYMENT_GUIDE.md - Single source for deployment procedures
  - SECURITY.md - Consolidated security configuration
  - ENVIRONMENT_VARIABLES.md - Complete env var reference
  - PORT_CONFIG.md - Dynamic port management via starto
  - DEPLOYMENT_STATUS.md - Current deployment state tracking
  - DEPLOYMENT_AUDIT_CLAUSE.md - Documentation standards
- Preview environment deployment pipeline
- Automated deployment verification scripts (40+ endpoint tests)
- Security headers via Next.js middleware
- Dynamic robots.txt for environment-specific SEO control
- Health check monitoring endpoint

### Changed
- Standardized on port 3002 (from starto registry) instead of 3011
- Preview environment uses Vercel URLs for better security
- Consolidated 6 overlapping deployment docs into 5 authoritative guides

### Fixed
- Port inconsistencies across documentation
- Broken script path references
- Non-existent npm script commands
- TypeScript errors in cron jobs

### Deprecated
- DEPLOYMENT.md (use DEPLOYMENT_GUIDE.md)
- DEPLOYMENT_COMPLETE.md (use DEPLOYMENT_GUIDE.md)
- SECURITY_SETUP.md (use SECURITY.md)
- VERCEL_URL_SECURITY.md (use SECURITY.md)
- SECURITY_CONFIG.md (use SECURITY.md)
- PREVIEW_URL_SETUP.md (conflicts with security best practices)

### Security
- Implemented X-Robots-Tag for Preview environment
- Added CSP headers for all environments
- Enforced HTTPS-only for production
- Complete cookie isolation between Preview and Production

## [0.1.0] - 2025-09-15
### Added
- Initial Next.js 14 project setup
- Theme system with TrendDojo branding
- Market data infrastructure (Polygon.io integration)
- Database schema with Prisma
- Authentication setup with NextAuth.js
- Basic UI components with Tailwind CSS

---

## Release Types
- `[MAJOR.MINOR.PATCH]` following Semantic Versioning
- **MAJOR**: Breaking changes
- **MINOR**: New features, backwards compatible
- **PATCH**: Bug fixes, backwards compatible

## How to Release
1. Update this CHANGELOG.md moving items from Unreleased
2. Commit with message: `chore: release v[VERSION]`
3. Tag the commit: `git tag v[VERSION]`
4. Push: `git push origin main --tags`