#!/bin/bash

# Database Migration Validation Script
# Ensures database schema is in sync before deployment

set -e

echo "🗄️  DATABASE MIGRATION VALIDATION"
echo "================================="

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check migration status
echo -e "\n📊 Checking migration status..."
MIGRATION_OUTPUT=$(npx prisma migrate status 2>&1)

if echo "$MIGRATION_OUTPUT" | grep -q "Database schema is up to date"; then
  echo -e "${GREEN}✅ Database schema is up to date${NC}"
elif echo "$MIGRATION_OUTPUT" | grep -q "drift"; then
  echo -e "${RED}❌ Database drift detected!${NC}"
  echo "The database schema has diverged from migrations."
  echo "Run: npx prisma migrate dev to create a new migration"
  exit 1
elif echo "$MIGRATION_OUTPUT" | grep -q "pending"; then
  echo -e "${YELLOW}⚠️ Pending migrations detected${NC}"
  echo "$MIGRATION_OUTPUT" | grep "pending"
  echo -e "\nRun: npx prisma migrate deploy"
  exit 1
else
  echo -e "${YELLOW}⚠️ Unknown migration status${NC}"
  echo "$MIGRATION_OUTPUT"
fi

# Validate schema compilation
echo -e "\n🔧 Validating Prisma schema..."
if npx prisma validate 2>&1; then
  echo -e "${GREEN}✅ Prisma schema is valid${NC}"
else
  echo -e "${RED}❌ Prisma schema validation failed${NC}"
  exit 1
fi

# Check for market schema tables
echo -e "\n📊 Checking market schema tables..."
TABLES_CHECK=$(npx prisma db execute --file /dev/stdin <<EOF 2>&1 || true
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'market'
LIMIT 1;
EOF
)

if echo "$TABLES_CHECK" | grep -q "error"; then
  echo -e "${YELLOW}⚠️ Could not verify market schema (may not exist yet)${NC}"
else
  echo -e "${GREEN}✅ Market schema accessible${NC}"
fi

# Generate client to ensure it matches schema
echo -e "\n🔄 Regenerating Prisma client..."
if npx prisma generate 2>&1 | grep -q "Generated"; then
  echo -e "${GREEN}✅ Prisma client generated successfully${NC}"
else
  echo -e "${RED}❌ Failed to generate Prisma client${NC}"
  exit 1
fi

echo -e "\n${GREEN}✅ DATABASE VALIDATION COMPLETE${NC}"