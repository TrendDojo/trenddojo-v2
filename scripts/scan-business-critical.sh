#!/bin/bash

# Business-Critical Code Scanner for TrendDojo
# Scans for @business-critical comments and verifies test coverage
# Last updated: 2025-09-10

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Project root
PROJECT_ROOT="/Users/duncanmcgill/coding/trenddojo-v2"
cd "$PROJECT_ROOT"

echo -e "${BLUE}=== Business-Critical Code Scanner ===${NC}"
echo ""

# Find all @business-critical comments
echo -e "${YELLOW}Scanning for @business-critical code...${NC}"
echo ""

# Create temp file for results
TEMP_FILE=$(mktemp)
CRITICAL_COUNT=0
TESTED_COUNT=0

# Search for business-critical comments
rg "@business-critical" \
  --type ts \
  --type tsx \
  --type js \
  --type jsx \
  -n \
  --no-heading \
  2>/dev/null > "$TEMP_FILE" || true

if [ ! -s "$TEMP_FILE" ]; then
  echo -e "${GREEN}No @business-critical code found. Consider adding flags to critical functions.${NC}"
  exit 0
fi

echo -e "${BLUE}Found business-critical code in:${NC}"
echo ""

# Process each finding
while IFS=: read -r file line content; do
  CRITICAL_COUNT=$((CRITICAL_COUNT + 1))
  
  # Extract function name if possible
  FUNC_NAME=$(echo "$content" | grep -oP '(?<=function )\w+|(?<=const )\w+(?= =)|(?<=export )\w+' | head -1 || echo "unknown")
  
  # Check if test file exists
  TEST_FILE=""
  if [[ "$file" == *"/src/"* ]]; then
    # Look for corresponding test file
    BASE_NAME=$(basename "$file" .ts)
    BASE_NAME=$(basename "$BASE_NAME" .tsx)
    BASE_NAME=$(basename "$BASE_NAME" .js)
    BASE_NAME=$(basename "$BASE_NAME" .jsx)
    
    # Common test file patterns
    POSSIBLE_TESTS=(
      "$(dirname "$file")/__tests__/${BASE_NAME}.test.ts"
      "$(dirname "$file")/__tests__/${BASE_NAME}.test.tsx"
      "$(dirname "$file")/${BASE_NAME}.test.ts"
      "$(dirname "$file")/${BASE_NAME}.test.tsx"
      "src/__tests__/$(basename "$file" | sed 's/\.[^.]*$/.test.ts/')"
      "src/__tests__/$(basename "$file" | sed 's/\.[^.]*$/.test.tsx/')"
    )
    
    for test in "${POSSIBLE_TESTS[@]}"; do
      if [ -f "$test" ]; then
        TEST_FILE="$test"
        break
      fi
    done
  fi
  
  # Display finding
  echo -e "${YELLOW}📍 $file:$line${NC}"
  
  # Extract the comment reason
  REASON=$(echo "$content" | grep -oP '(?<=@business-critical: ).*' || echo "No reason provided")
  echo "   Function: ${FUNC_NAME}"
  echo "   Reason: ${REASON}"
  
  if [ -n "$TEST_FILE" ]; then
    # Check if function is tested
    if grep -q "$FUNC_NAME" "$TEST_FILE" 2>/dev/null; then
      echo -e "   Test: ${GREEN}✓ Found in $TEST_FILE${NC}"
      TESTED_COUNT=$((TESTED_COUNT + 1))
    else
      echo -e "   Test: ${YELLOW}⚠ Test file exists but function not found${NC}"
    fi
  else
    echo -e "   Test: ${RED}✗ No test file found${NC}"
  fi
  echo ""
done < "$TEMP_FILE"

# Summary
echo -e "${BLUE}=== Summary ===${NC}"
echo "Total business-critical functions: $CRITICAL_COUNT"
echo "Functions with tests: $TESTED_COUNT"

if [ "$TESTED_COUNT" -eq "$CRITICAL_COUNT" ]; then
  echo -e "${GREEN}✓ All business-critical code has tests!${NC}"
  EXIT_CODE=0
elif [ "$TESTED_COUNT" -gt 0 ]; then
  UNTESTED=$((CRITICAL_COUNT - TESTED_COUNT))
  echo -e "${YELLOW}⚠ Warning: $UNTESTED business-critical functions lack tests${NC}"
  EXIT_CODE=1
else
  echo -e "${RED}✗ No business-critical functions have tests!${NC}"
  EXIT_CODE=1
fi

# Cleanup
rm -f "$TEMP_FILE"

# Recommendations
if [ "$CRITICAL_COUNT" -eq 0 ]; then
  echo ""
  echo -e "${YELLOW}Recommendations:${NC}"
  echo "1. Add @business-critical comments to:"
  echo "   - Authentication/authorization functions"
  echo "   - Position sizing calculations"
  echo "   - P&L calculations"
  echo "   - Order execution logic"
  echo "   - Risk management functions"
  echo "   - Payment processing"
fi

if [ "$EXIT_CODE" -eq 1 ]; then
  echo ""
  echo -e "${YELLOW}Next Steps:${NC}"
  echo "1. Write tests for all untested business-critical functions"
  echo "2. Ensure >95% code coverage for critical paths"
  echo "3. Add integration tests with mock broker APIs"
  echo "4. Run: npm test -- --coverage"
fi

exit $EXIT_CODE