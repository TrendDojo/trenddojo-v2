#!/bin/bash

# API Endpoint Validation Script
# Tests critical API endpoints before deployment

set -e

echo "🔍 API ENDPOINT VALIDATION"
echo "=========================="

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Base URL - can be overridden
BASE_URL="${API_BASE_URL:-http://localhost:3011}"

# Track failures
TOTAL_TESTS=0
FAILED_TESTS=0

# Function to test endpoint
test_endpoint() {
  local method=$1
  local path=$2
  local expected_status=$3
  local description=$4

  TOTAL_TESTS=$((TOTAL_TESTS + 1))

  echo -n "Testing $description... "

  # Make request
  response=$(curl -s -o /dev/null -w "%{http_code}" -X "$method" "$BASE_URL$path" 2>/dev/null || echo "000")

  if [ "$response" = "$expected_status" ]; then
    echo -e "${GREEN}✅ Pass (HTTP $response)${NC}"
  else
    echo -e "${RED}❌ Fail (Expected: $expected_status, Got: $response)${NC}"
    FAILED_TESTS=$((FAILED_TESTS + 1))
  fi
}

# Function to test with auth
test_auth_endpoint() {
  local method=$1
  local path=$2
  local expected_status=$3
  local description=$4
  local auth_token="${AUTH_TOKEN:-}"

  TOTAL_TESTS=$((TOTAL_TESTS + 1))

  echo -n "Testing $description... "

  if [ -z "$auth_token" ]; then
    echo -e "${YELLOW}⚠️ Skipped (no auth token)${NC}"
    return
  fi

  response=$(curl -s -o /dev/null -w "%{http_code}" -X "$method" \
    -H "Authorization: Bearer $auth_token" \
    "$BASE_URL$path" 2>/dev/null || echo "000")

  if [ "$response" = "$expected_status" ]; then
    echo -e "${GREEN}✅ Pass (HTTP $response)${NC}"
  else
    echo -e "${RED}❌ Fail (Expected: $expected_status, Got: $response)${NC}"
    FAILED_TESTS=$((FAILED_TESTS + 1))
  fi
}

echo -e "\n🌍 Testing against: ${YELLOW}$BASE_URL${NC}\n"

# 1. Health Check
echo "Health Endpoints:"
test_endpoint "GET" "/api/health" "200" "Health check endpoint"

# 2. Market Data Endpoints
echo -e "\nMarket Data Endpoints:"
test_endpoint "GET" "/api/market-data/price/AAPL" "200" "Price data endpoint"
test_endpoint "GET" "/api/market-data/quote/AAPL" "200" "Quote data endpoint"
test_endpoint "GET" "/api/market-data/history/AAPL" "200" "Historical data endpoint"
test_endpoint "GET" "/api/market-data/search?q=AAPL" "200" "Symbol search endpoint"

# 3. Error Handling
echo -e "\nError Handling:"
test_endpoint "GET" "/api/market-data/price/INVALID_SYMBOL_XYZ" "404" "Invalid symbol handling"
test_endpoint "GET" "/api/market-data/price/" "400" "Missing symbol parameter"

# 4. Cron Endpoints (should be protected)
echo -e "\nCron Job Protection:"
test_endpoint "GET" "/api/cron/market-update" "401" "Market update cron (unauthorized)"
test_endpoint "GET" "/api/cron/daily-close" "401" "Daily close cron (unauthorized)"

# 5. Auth Endpoints
echo -e "\nAuth Endpoints:"
test_endpoint "GET" "/api/auth/providers" "200" "Auth providers list"

# 6. Static Pages
echo -e "\nStatic Pages:"
test_endpoint "GET" "/" "200" "Homepage"
test_endpoint "GET" "/login" "200" "Login page"
test_endpoint "GET" "/positions" "200" "Positions page"
test_endpoint "GET" "/screener" "200" "Screener page"

# Final Results
echo -e "\n📊 Test Results"
echo "==============="
PASSED_TESTS=$((TOTAL_TESTS - FAILED_TESTS))
echo "Total: $TOTAL_TESTS"
echo -e "Passed: ${GREEN}$PASSED_TESTS${NC}"
echo -e "Failed: ${RED}$FAILED_TESTS${NC}"

if [ $FAILED_TESTS -eq 0 ]; then
  echo -e "\n${GREEN}✅ ALL API TESTS PASSED${NC}"
  exit 0
else
  echo -e "\n${RED}❌ API VALIDATION FAILED${NC}"
  echo "Fix the failing endpoints before deployment"
  exit 1
fi