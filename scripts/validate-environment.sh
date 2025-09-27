#!/bin/bash

# Environment Variable Validation Script
# Ensures all required environment variables are set before deployment

set -e

echo "🔍 Validating Environment Variables"
echo "===================================="

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Track validation status
VALIDATION_FAILED=false

# Required variables for ALL environments
REQUIRED_VARS=(
  "DATABASE_URL"
  "NEXTAUTH_SECRET"
  "NEXTAUTH_URL"
)

# Production-only required variables
PRODUCTION_VARS=(
  "POLYGON_API_KEY"
  "CRON_SECRET"
  "SENTRY_DSN"
  "VERCEL_ENV"
)

# Staging/Preview required variables
STAGING_VARS=(
  "POLYGON_API_KEY"
  "CRON_SECRET"
)

# Function to check variable
check_var() {
  local var_name=$1
  local var_value="${!var_name}"

  if [ -z "$var_value" ]; then
    echo -e "${RED}❌ $var_name is not set${NC}"
    VALIDATION_FAILED=true
  else
    # Mask sensitive values in output
    if [[ "$var_name" == *"KEY"* ]] || [[ "$var_name" == *"SECRET"* ]] || [[ "$var_name" == *"PASSWORD"* ]]; then
      echo -e "${GREEN}✅ $var_name is set (${#var_value} characters)${NC}"
    else
      echo -e "${GREEN}✅ $var_name is set${NC}"
    fi
  fi
}

# Check environment type
ENV_TYPE="${VERCEL_ENV:-development}"
echo -e "\n🌍 Environment: ${YELLOW}$ENV_TYPE${NC}\n"

# Check required variables
echo "Required Variables:"
for var in "${REQUIRED_VARS[@]}"; do
  check_var "$var"
done

# Check environment-specific variables
if [ "$ENV_TYPE" = "production" ]; then
  echo -e "\nProduction Variables:"
  for var in "${PRODUCTION_VARS[@]}"; do
    check_var "$var"
  done
elif [ "$ENV_TYPE" = "preview" ] || [ "$ENV_TYPE" = "staging" ]; then
  echo -e "\nStaging/Preview Variables:"
  for var in "${STAGING_VARS[@]}"; do
    check_var "$var"
  done
fi

# Database connection test
echo -e "\n📊 Testing Database Connection..."
if npx prisma db pull --print 2>/dev/null | grep -q "Introspecting"; then
  echo -e "${GREEN}✅ Database connection successful${NC}"
else
  echo -e "${RED}❌ Database connection failed${NC}"
  VALIDATION_FAILED=true
fi

# Check for .env files in development
if [ "$ENV_TYPE" = "development" ]; then
  echo -e "\n📁 Checking .env files..."
  if [ -f .env.local ]; then
    echo -e "${GREEN}✅ .env.local found${NC}"
  elif [ -f .env ]; then
    echo -e "${GREEN}✅ .env found${NC}"
  else
    echo -e "${YELLOW}⚠️ No .env file found (using system environment)${NC}"
  fi
fi

# Final result
echo -e "\n📊 Validation Result"
echo "===================="
if [ "$VALIDATION_FAILED" = true ]; then
  echo -e "${RED}❌ VALIDATION FAILED - Do not deploy${NC}"
  exit 1
else
  echo -e "${GREEN}✅ ALL VALIDATIONS PASSED${NC}"
  exit 0
fi