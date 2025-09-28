#!/bin/bash

# Get the latest Preview deployment URL from Vercel
# Uses multiple methods to find the URL

set -e

echo "🔍 FINDING PREVIEW URL"
echo "====================="

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Track if we found a URL
FOUND_URL=""

# Method 1: Check Vercel CLI (if logged in)
echo -e "\n${YELLOW}Method 1: Vercel CLI${NC}"
if command -v vercel &> /dev/null; then
    echo "Checking Vercel deployments..."

    # Try to get list of deployments
    deployments=$(vercel ls --json 2>/dev/null || echo "[]")

    if [ "$deployments" != "[]" ]; then
        # Get the most recent deployment URL
        url=$(echo "$deployments" | jq -r '.[0].url' 2>/dev/null || echo "")
        state=$(echo "$deployments" | jq -r '.[0].state' 2>/dev/null || echo "")

        if [ -n "$url" ]; then
            # Ensure https://
            if [[ ! "$url" =~ ^https?:// ]]; then
                url="https://$url"
            fi
            echo -e "${GREEN}✅ Found deployment: $url (Status: $state)${NC}"
            FOUND_URL="$url"
        else
            echo -e "${YELLOW}⚠️ Vercel CLI: No deployments found${NC}"
        fi
    else
        echo -e "${YELLOW}⚠️ Vercel CLI not authenticated or no access${NC}"
        echo "Run: vercel login"
    fi
else
    echo -e "${YELLOW}⚠️ Vercel CLI not installed${NC}"
    echo "Install with: npm i -g vercel"
fi

# Method 2: Check known URL patterns
echo -e "\n${YELLOW}Method 2: Known URL Patterns${NC}"

# Get current git branch
BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "dev")
echo "Current branch: $BRANCH"

# Get latest commit hash
COMMIT=$(git rev-parse --short HEAD 2>/dev/null || echo "")
echo "Latest commit: $COMMIT"

# Possible URL patterns for Vercel
# The git-based URL is stable and always points to dev branch
POSSIBLE_URLS=(
    "https://trenddojo-v2-git-dev-traderclicks.vercel.app"  # Stable dev branch URL
    "https://preview.trenddojo.com"                          # Future custom domain
    "https://trenddojo-v2-dev.vercel.app"
    "https://trenddojo-v2-preview.vercel.app"
    "https://trenddojo-v2-staging.vercel.app"
    "https://trenddojo-v2-${COMMIT}-traderclicks.vercel.app"
)

echo "Testing common URL patterns..."
for url in "${POSSIBLE_URLS[@]}"; do
    echo -n "  Testing $url... "
    response=$(curl -s -o /dev/null -w "%{http_code}" "$url" --max-time 3 2>/dev/null || echo "000")

    if [ "$response" = "200" ] || [ "$response" = "304" ]; then
        echo -e "${GREEN}✅ FOUND!${NC}"
        FOUND_URL="$url"
        break
    else
        echo "❌ (HTTP $response)"
    fi
done

# Method 3: GitHub API (if GITHUB_TOKEN is set)
echo -e "\n${YELLOW}Method 3: GitHub API${NC}"
if [ -n "$GITHUB_TOKEN" ]; then
    echo "Checking GitHub deployments..."

    deployments=$(curl -s -H "Authorization: token $GITHUB_TOKEN" \
        "https://api.github.com/repos/TrendDojo/trenddojo-v2/deployments?environment=preview&limit=1" \
        2>/dev/null || echo "[]")

    if [ "$deployments" != "[]" ]; then
        deployment_url=$(echo "$deployments" | jq -r '.[0].payload.web_url' 2>/dev/null || echo "")

        if [ -n "$deployment_url" ] && [ "$deployment_url" != "null" ]; then
            echo -e "${GREEN}✅ Found via GitHub: $deployment_url${NC}"
            FOUND_URL="$deployment_url"
        else
            echo -e "${YELLOW}⚠️ No deployment URL in GitHub API${NC}"
        fi
    else
        echo -e "${YELLOW}⚠️ No GitHub deployments found${NC}"
    fi
else
    echo -e "${YELLOW}⚠️ GITHUB_TOKEN not set${NC}"
    echo "Set with: export GITHUB_TOKEN=your_token"
fi

# Method 4: Manual guidance
echo -e "\n${YELLOW}Method 4: Manual Check${NC}"
echo "Visit one of these URLs to find your deployment:"
echo -e "${BLUE}1. Vercel Dashboard: https://vercel.com/dashboard${NC}"
echo -e "${BLUE}2. GitHub Deployments: https://github.com/TrendDojo/trenddojo-v2/deployments${NC}"
echo -e "${BLUE}3. Project Page: https://vercel.com/trenddojo/trenddojo-v2${NC}"

# Final result
echo -e "\n${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
if [ -n "$FOUND_URL" ]; then
    echo -e "${GREEN}✅ PREVIEW URL FOUND${NC}"
    echo -e "URL: ${BLUE}$FOUND_URL${NC}"
    echo ""
    echo "You can now run:"
    echo -e "${BLUE}npm run verify:preview $FOUND_URL${NC}"
    echo "or"
    echo -e "${BLUE}./scripts/deployment/verify-preview.sh $FOUND_URL${NC}"

    # Export for other scripts
    echo "$FOUND_URL" > .vercel-preview-url
    echo ""
    echo "URL saved to .vercel-preview-url"

    # Offer to run verification
    echo ""
    read -p "Run verification now? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        ./scripts/deployment/verify-preview.sh "$FOUND_URL"
    fi
else
    echo -e "${RED}❌ COULD NOT AUTO-DETECT URL${NC}"
    echo ""
    echo "Please check manually and run:"
    echo -e "${BLUE}./scripts/deployment/verify-preview.sh <your-preview-url>${NC}"
fi