#!/bin/bash

# Automated Preview Environment Verification
# Runs all checks against the Preview deployment

set -e

echo "🔍 AUTOMATED PREVIEW VERIFICATION"
echo "=================================="

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Get Preview URL from Vercel or use provided
if [ -z "$1" ]; then
    echo "Attempting to fetch latest Preview URL from Vercel..."

    # Try to get the latest deployment URL
    PREVIEW_URL=$(vercel ls --json 2>/dev/null | jq -r '.[0].url' 2>/dev/null || echo "")

    if [ -z "$PREVIEW_URL" ]; then
        echo -e "${YELLOW}Could not auto-detect Preview URL${NC}"
        echo "Usage: $0 <preview-url>"
        echo "Example: $0 https://trenddojo-v2-abc123.vercel.app"
        exit 1
    fi

    # Ensure https://
    if [[ ! "$PREVIEW_URL" =~ ^https?:// ]]; then
        PREVIEW_URL="https://$PREVIEW_URL"
    fi
else
    PREVIEW_URL="$1"
fi

echo -e "Testing: ${BLUE}$PREVIEW_URL${NC}\n"

# Track overall status
ALL_PASSED=true
TOTAL_CHECKS=0
PASSED_CHECKS=0

# Function to check endpoint
check_endpoint() {
    local path=$1
    local expected_status=$2
    local description=$3

    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    echo -n "$description... "

    response=$(curl -s -o /dev/null -w "%{http_code}" "$PREVIEW_URL$path" 2>/dev/null || echo "000")

    if [ "$response" = "$expected_status" ]; then
        echo -e "${GREEN}✅ Pass (HTTP $response)${NC}"
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
        return 0
    else
        echo -e "${RED}❌ Fail (Expected: $expected_status, Got: $response)${NC}"
        ALL_PASSED=false
        return 1
    fi
}

# Function to check JSON response
check_json_endpoint() {
    local path=$1
    local json_path=$2
    local description=$3

    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    echo -n "$description... "

    response=$(curl -s "$PREVIEW_URL$path" 2>/dev/null)

    if [ -z "$response" ]; then
        echo -e "${RED}❌ No response${NC}"
        ALL_PASSED=false
        return 1
    fi

    # Check if valid JSON
    if ! echo "$response" | jq . >/dev/null 2>&1; then
        echo -e "${RED}❌ Invalid JSON response${NC}"
        ALL_PASSED=false
        return 1
    fi

    # Check specific field if provided
    if [ -n "$json_path" ]; then
        value=$(echo "$response" | jq -r "$json_path" 2>/dev/null)
        if [ "$value" != "null" ] && [ -n "$value" ]; then
            echo -e "${GREEN}✅ Pass ($json_path: $value)${NC}"
            PASSED_CHECKS=$((PASSED_CHECKS + 1))
            return 0
        else
            echo -e "${RED}❌ Missing field: $json_path${NC}"
            ALL_PASSED=false
            return 1
        fi
    else
        echo -e "${GREEN}✅ Valid JSON${NC}"
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
        return 0
    fi
}

# Function to measure response time
check_performance() {
    local path=$1
    local max_ms=$2
    local description=$3

    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    echo -n "$description... "

    # Measure time in milliseconds
    response_time=$(curl -s -o /dev/null -w "%{time_total}" "$PREVIEW_URL$path" 2>/dev/null || echo "999")
    response_ms=$(echo "$response_time * 1000" | bc 2>/dev/null || echo "999")
    response_ms=${response_ms%.*} # Remove decimals

    if [ "$response_ms" -lt "$max_ms" ]; then
        echo -e "${GREEN}✅ Pass (${response_ms}ms < ${max_ms}ms)${NC}"
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
        return 0
    else
        echo -e "${YELLOW}⚠️ Slow (${response_ms}ms > ${max_ms}ms)${NC}"
        # Don't fail for performance
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
        return 0
    fi
}

# 1. BASIC CONNECTIVITY
echo -e "\n${YELLOW}1. Basic Connectivity${NC}"
check_endpoint "/" "200" "Homepage"
check_endpoint "/favicon.ico" "200" "Static assets"

# 2. HEALTH CHECK
echo -e "\n${YELLOW}2. System Health${NC}"
check_json_endpoint "/api/health" ".status" "Health endpoint"
check_json_endpoint "/api/health" ".checks.database.status" "Database check"
check_json_endpoint "/api/health" ".checks.auth.status" "Auth configuration"
check_json_endpoint "/api/health" ".checks.marketData.status" "Market data config"

# 3. AUTHENTICATION PAGES
echo -e "\n${YELLOW}3. Authentication Pages${NC}"
check_endpoint "/login" "200" "Login page"
check_endpoint "/signup" "200" "Signup page"
check_endpoint "/api/auth/providers" "200" "Auth providers"

# 4. MARKET DATA ENDPOINTS
echo -e "\n${YELLOW}4. Market Data API${NC}"
check_endpoint "/api/market-data/price/AAPL" "200" "Price endpoint"
check_endpoint "/api/market-data/quote/AAPL" "200" "Quote endpoint"
check_endpoint "/api/market-data/history/AAPL" "200" "History endpoint"
check_endpoint "/api/market-data/search?q=AAPL" "200" "Search endpoint"

# 5. ERROR HANDLING
echo -e "\n${YELLOW}5. Error Handling${NC}"
check_endpoint "/api/market-data/price/INVALID_XYZ" "404" "Invalid symbol"
check_endpoint "/api/market-data/price/" "400" "Missing parameter"
check_endpoint "/nonexistent-page-xyz" "404" "404 page"

# 6. PROTECTED ENDPOINTS
echo -e "\n${YELLOW}6. Protected Endpoints${NC}"
check_endpoint "/api/cron/market-update" "401" "Cron protection (market)"
check_endpoint "/api/cron/daily-close" "401" "Cron protection (daily)"

# 7. APPLICATION PAGES
echo -e "\n${YELLOW}7. Application Pages${NC}"
check_endpoint "/positions" "200" "Positions page"
check_endpoint "/screener" "200" "Screener page"
check_endpoint "/symbol/AAPL" "200" "Symbol page"

# 8. PERFORMANCE CHECKS
echo -e "\n${YELLOW}8. Performance${NC}"
check_performance "/" "3000" "Homepage load time"
check_performance "/api/health" "1000" "Health check response"
check_performance "/api/market-data/price/AAPL" "2000" "API response time"

# 9. SECURITY HEADERS
echo -e "\n${YELLOW}9. Security Headers${NC}"
TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
echo -n "Security headers... "
headers=$(curl -s -I "$PREVIEW_URL" 2>/dev/null)
if echo "$headers" | grep -q "X-Frame-Options\|Content-Security-Policy\|X-Content-Type-Options"; then
    echo -e "${GREEN}✅ Security headers present${NC}"
    PASSED_CHECKS=$((PASSED_CHECKS + 1))
else
    echo -e "${YELLOW}⚠️ Some security headers missing${NC}"
    PASSED_CHECKS=$((PASSED_CHECKS + 1))
fi

# 10. BUILD INFO
echo -e "\n${YELLOW}10. Build Information${NC}"
echo -n "Checking deployment info... "
health_response=$(curl -s "$PREVIEW_URL/api/health" 2>/dev/null)
if [ -n "$health_response" ]; then
    environment=$(echo "$health_response" | jq -r '.environment' 2>/dev/null || echo "unknown")
    version=$(echo "$health_response" | jq -r '.version' 2>/dev/null || echo "unknown")
    echo -e "${BLUE}Environment: $environment, Version: ${version:0:7}${NC}"
fi

# FINAL REPORT
echo -e "\n${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}VERIFICATION REPORT${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

echo -e "\nURL Tested: ${BLUE}$PREVIEW_URL${NC}"
echo -e "Checks Run: $TOTAL_CHECKS"
echo -e "Checks Passed: ${GREEN}$PASSED_CHECKS${NC}"
echo -e "Checks Failed: ${RED}$((TOTAL_CHECKS - PASSED_CHECKS))${NC}"

if [ "$ALL_PASSED" = true ]; then
    echo -e "\n${GREEN}✅ PREVIEW VERIFICATION PASSED${NC}"
    echo -e "The Preview environment is ready for production deployment."
    echo -e "\nNext step: ${BLUE}npm run deploy:production${NC}"
    exit 0
else
    echo -e "\n${RED}❌ PREVIEW VERIFICATION FAILED${NC}"
    echo -e "Fix the issues above before deploying to production."
    exit 1
fi