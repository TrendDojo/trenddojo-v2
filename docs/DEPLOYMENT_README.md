# 📚 Deployment Documentation Index

## ✅ Active Documentation (Use These)

These are the authoritative, up-to-date deployment documents:

### Core Guides
1. **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** - Complete deployment procedures
2. **[SECURITY_CONFIG.md](./SECURITY_CONFIG.md)** - Security settings and protections
3. **[ENVIRONMENT_VARIABLES.md](./ENVIRONMENT_VARIABLES.md)** - All environment variables
4. **[PORT_CONFIG.md](./PORT_CONFIG.md)** - Port management (flexible with starto)
5. **[DEPLOYMENT_STATUS.md](./DEPLOYMENT_STATUS.md)** - Current deployment state

### Quick Links
- **Check deployment status**: [DEPLOYMENT_STATUS.md](./DEPLOYMENT_STATUS.md)
- **Deploy to Preview**: See [DEPLOYMENT_GUIDE.md#phase-2-preview-deployment](./DEPLOYMENT_GUIDE.md#phase-2-preview-deployment)
- **Security checklist**: See [SECURITY_CONFIG.md#security-checklist](./SECURITY_CONFIG.md#security-checklist)
- **Add env variables**: See [ENVIRONMENT_VARIABLES.md#setting-environment-variables](./ENVIRONMENT_VARIABLES.md#setting-environment-variables)

## ⚠️ Deprecated Documentation (Do Not Use)

These files have been consolidated into the above guides and should not be used:

- ~~DEPLOYMENT.md~~ → Use **DEPLOYMENT_GUIDE.md**
- ~~DEPLOYMENT_COMPLETE.md~~ → Use **DEPLOYMENT_GUIDE.md**
- ~~SECURITY_SETUP.md~~ → Use **SECURITY_CONFIG.md**
- ~~VERCEL_URL_SECURITY.md~~ → Use **SECURITY_CONFIG.md**
- ~~PREVIEW_URL_SETUP.md~~ → Removed (conflicts with security recommendations)

## 🚀 Quick Start

### First Time Setup
1. Read [DEPLOYMENT_STATUS.md](./DEPLOYMENT_STATUS.md) to understand current state
2. Check [PORT_CONFIG.md](./PORT_CONFIG.md) for local development port
3. Review [ENVIRONMENT_VARIABLES.md](./ENVIRONMENT_VARIABLES.md) for required variables

### Deploying Changes
1. Follow [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) step by step
2. Use automated scripts in `/scripts/deployment/`
3. Verify with health check endpoint

### Security Setup
1. Review [SECURITY_CONFIG.md](./SECURITY_CONFIG.md) for all protections
2. Ensure Preview URL uses Vercel URL (not custom domain)
3. Enable optional protections if needed

## 📋 Documentation Principles

### Port Flexibility
- Ports are managed by `starto` script centrally
- Documentation references PORT_CONFIG.md instead of hardcoding ports
- This allows starto to change without breaking docs

### Single Source of Truth
- Each topic has ONE authoritative document
- No duplicate information across files
- Clear deprecation notices on old files

### Environment Awareness
- Separate sections for Local/Preview/Production
- Clear indication of what's configured vs pending
- Current state documented in DEPLOYMENT_STATUS.md

## 🔄 Maintenance

### Weekly Reviews
- Update DEPLOYMENT_STATUS.md with current state
- Check for any new deployment issues
- Verify all scripts still working

### When Starto Changes
1. Port changes automatically work (code uses starto)
2. Update PORT_CONFIG.md with new verification commands
3. No need to update other docs (they reference PORT_CONFIG.md)

### When Adding Features
1. Update ENVIRONMENT_VARIABLES.md if new env vars needed
2. Update DEPLOYMENT_GUIDE.md if deployment process changes
3. Update SECURITY_CONFIG.md if security implications

---

*Master index created: 2025-09-28*
*Purpose: Single entry point for all deployment documentation*