#!/bin/bash

# TrendDojo Pre-Deployment Script
# This script ensures everything is ready before pushing to staging

set -e  # Exit on any error

echo "🚀 TrendDojo Pre-Deployment Checks"
echo "=================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

# Function to print status
print_status() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ $2${NC}"
    else
        echo -e "${RED}❌ $2${NC}"
        exit 1
    fi
}

print_warning() {
    echo -e "${YELLOW}⚠️ $1${NC}"
}

echo ""
echo "📋 Step 1: Environment Check"
echo "----------------------------"

# Check Node.js version
node_version=$(node -v)
echo "Node.js version: $node_version"

# Check npm version  
npm_version=$(npm -v)
echo "npm version: $npm_version"

echo ""
echo "🔍 Step 2: Code Quality Checks"
echo "------------------------------"

# Run TypeScript check
echo "Running TypeScript check..."
npx tsc --noEmit
print_status $? "TypeScript compilation"

# Run ESLint
echo "Running ESLint..."
npm run lint
print_status $? "ESLint checks"

echo ""
echo "🧪 Step 3: Test Suite"
echo "---------------------"

# Set test environment
export NODE_ENV=test

# Run unit tests
echo "Running unit tests..."
npm run test:run
test_result=$?

if [ $test_result -eq 0 ]; then
    print_status 0 "Unit tests"
else
    print_warning "Some tests failed. Review test output above."
    echo "Continue anyway? (y/N)"
    read -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_status 1 "Tests must pass before deployment"
    fi
fi

echo ""
echo "🏗️ Step 4: Build Verification"
echo "-----------------------------"

# Clean previous build
echo "Cleaning previous build..."
rm -rf .next

# Build application
echo "Building application..."
npm run build
print_status $? "Production build"

echo ""
echo "🔐 Step 5: Security Checks"
echo "--------------------------"

# Check for sensitive files
echo "Checking for sensitive files..."
if [ -f ".env.local" ] && [ -s ".env.local" ]; then
    print_warning ".env.local exists and is not empty"
    echo "Contents:"
    head -n 3 .env.local
    echo "Is this file in .gitignore? Checking..."
    if grep -q "\.env\*\|\.env\.local" .gitignore; then
        echo -e "${GREEN}✅ .env.local is in .gitignore${NC}"
    else
        print_status 1 ".env.local must be in .gitignore"
    fi
fi

# Check git status
echo "Checking git status..."
if [ -n "$(git status --porcelain)" ]; then
    echo "Uncommitted changes found:"
    git status --short
    echo ""
    echo "Commit these changes before deploying? (Y/n)"
    read -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Nn]$ ]]; then
        echo "Enter commit message:"
        read commit_msg
        git add .
        git commit -m "$commit_msg

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>"
        print_status $? "Git commit"
    fi
fi

echo ""
echo "📦 Step 6: Package Audit"
echo "------------------------"

# Run npm audit (allow moderate vulnerabilities for now)
echo "Running security audit..."
npm audit --audit-level high
audit_result=$?

if [ $audit_result -ne 0 ]; then
    print_warning "Security vulnerabilities found"
    echo "Continue anyway? (y/N)"
    read -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_status 1 "Security issues must be addressed"
    fi
fi

echo ""
echo "🎯 Step 7: Pre-Flight Summary"
echo "-----------------------------"

echo -e "${GREEN}✅ TypeScript compilation passed${NC}"
echo -e "${GREEN}✅ ESLint checks passed${NC}"
echo -e "${GREEN}✅ Build completed successfully${NC}"

if [ $test_result -eq 0 ]; then
    echo -e "${GREEN}✅ All tests passed${NC}"
else
    echo -e "${YELLOW}⚠️ Some tests failed (proceeding anyway)${NC}"
fi

echo ""
echo "🚀 Ready for Deployment!"
echo "======================="
echo ""
echo "Next steps:"
echo "1. Push to GitHub: git push origin main"
echo "2. Monitor Vercel deployment at: https://vercel.com"
echo "3. Test staging at: https://trenddojo-v2.vercel.app"
echo ""
echo "To push now, run: git push origin main"
echo ""