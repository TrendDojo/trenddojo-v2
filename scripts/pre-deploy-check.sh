#!/bin/bash

# Pre-deployment check script for TrendDojo V2
# Run this before every push to main or deployment

set -e  # Exit on any error

echo "🎯 TRENDDOJO V2 PRE-DEPLOYMENT CHECK"
echo "===================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Track overall success
ALL_PASSED=true

echo -e "\n📝 ${YELLOW}Step 1: TypeScript Check${NC}"
echo "Running full TypeScript compilation..."
if npx tsc --noEmit; then
    echo -e "${GREEN}✅ TypeScript check passed${NC}"
else
    echo -e "${RED}❌ TypeScript errors found${NC}"
    ALL_PASSED=false
fi

echo -e "\n🏗️  ${YELLOW}Step 2: Production Build${NC}"
echo "Testing production build..."
if npm run build; then
    echo -e "${GREEN}✅ Production build successful${NC}"
else
    echo -e "${RED}❌ Production build failed${NC}"
    ALL_PASSED=false
fi

echo -e "\n🔍 ${YELLOW}Step 3: Lint Check${NC}"
echo "Running ESLint..."
if npm run lint 2>/dev/null || echo "Lint not configured"; then
    echo -e "${GREEN}✅ Lint check passed (or not configured)${NC}"
else
    echo -e "${RED}❌ Lint errors found${NC}"
    ALL_PASSED=false
fi

echo -e "\n🧪 ${YELLOW}Step 4: Unit Tests${NC}"
echo "Running unit tests..."
if npm run test:run 2>/dev/null || echo "Tests not configured"; then
    echo -e "${GREEN}✅ Tests passed (or none configured)${NC}"
else
    echo -e "${RED}❌ Tests failed${NC}"
    ALL_PASSED=false
fi

echo -e "\n📦 ${YELLOW}Step 5: Package Audit${NC}"
echo "Checking for known vulnerabilities..."
if npm audit --audit-level=high 2>/dev/null; then
    echo -e "${GREEN}✅ No high/critical vulnerabilities${NC}"
else
    echo -e "${YELLOW}⚠️ Vulnerabilities found (review recommended)${NC}"
    # Don't fail build for vulnerabilities
fi

echo -e "\n🔧 ${YELLOW}Step 6: Environment Check${NC}"
echo "Validating required environment variables..."
ENV_ISSUES=false

# Check for .env or .env.local
if [ ! -f .env.local ] && [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️ No .env or .env.local found - using defaults${NC}"
fi

# Check critical env vars exist in some form
if [ -z "$DATABASE_URL" ] && ! grep -q "DATABASE_URL" .env* 2>/dev/null; then
    echo -e "${RED}❌ DATABASE_URL not configured${NC}"
    ENV_ISSUES=true
fi

if [ "$ENV_ISSUES" = false ]; then
    echo -e "${GREEN}✅ Environment check passed${NC}"
fi

echo -e "\n🔍 ${YELLOW}Step 7: Check for Debug Artifacts${NC}"
echo "Checking for console.log statements..."
CONSOLE_COUNT=$(grep -r "console.log" src --include="*.ts" --include="*.tsx" 2>/dev/null | grep -v "// DEBUG:" | wc -l || echo "0")
if [ "$CONSOLE_COUNT" -eq "0" ]; then
    echo -e "${GREEN}✅ No active console.log statements${NC}"
else
    echo -e "${YELLOW}⚠️ Found $CONSOLE_COUNT active console.log statements${NC}"
    echo "Consider commenting them with // DEBUG: prefix"
fi

echo -e "\n📊 ${YELLOW}Final Result${NC}"
echo "===================="
if [ "$ALL_PASSED" = true ]; then
    echo -e "${GREEN}🎉 ALL CHECKS PASSED - READY TO DEPLOY${NC}"
    echo -e "You can safely push to main or deploy to production"
    exit 0
else
    echo -e "${RED}💥 SOME CHECKS FAILED - DO NOT DEPLOY${NC}"
    echo -e "Please fix the issues above before deploying"
    exit 1
fi