#!/bin/bash

# Theme Compliance Scanner v1.0
# Checks for violations of the living theme system
# Part of the Tidy & Audit Protocol

echo "🎨 Theme Compliance Scanner"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "   Note: Excludes /dev/theme/* (theme showcase)"
echo ""

# Initialize counters
TOTAL_VIOLATIONS=0
TOTAL_FILES=0

# Color for output
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

# Function to count and display violations
count_violations() {
    local pattern="$1"
    local description="$2"
    local count=$(find src -type f \( -name "*.tsx" -o -name "*.ts" \) -not -path "*/dev/theme/*" -exec grep "$pattern" {} \; 2>/dev/null | wc -l | tr -d ' ')

    if [ "$count" -gt 0 ]; then
        echo -e "${RED}❌ $description: $count violations${NC}"
        if [ "$3" = "show" ]; then
            echo "   Sample violations:"
            find src -type f \( -name "*.tsx" -o -name "*.ts" \) -not -path "*/dev/theme/*" -exec grep -H "$pattern" {} \; 2>/dev/null | head -3 | sed 's/^/     /'
        fi
        TOTAL_VIOLATIONS=$((TOTAL_VIOLATIONS + count))
    else
        echo -e "${GREEN}✅ $description: Clean!${NC}"
    fi
}

# Function to check for specific anti-patterns
check_antipattern() {
    local pattern="$1"
    local description="$2"
    local files=$(find src -type f -name "*.tsx" -not -path "*/dev/theme/*" -exec grep -l "$pattern" {} \; 2>/dev/null | wc -l | tr -d ' ')

    if [ "$files" -gt 0 ]; then
        echo -e "${YELLOW}⚠️  $description: $files files affected${NC}"
        TOTAL_FILES=$((TOTAL_FILES + files))
    fi
}

echo "📊 Checking Color Violations"
echo "────────────────────────────"

# Check for hardcoded Tailwind colors (should use semantic colors)
count_violations "text-\(red\|blue\|green\|yellow\|purple\|indigo\|pink\|gray\|slate\)-[0-9]" "Hardcoded text colors"
count_violations "bg-\(red\|blue\|green\|yellow\|purple\|indigo\|pink\|gray\|slate\)-[0-9]" "Hardcoded backgrounds"
count_violations "border-\(red\|blue\|green\|yellow\|purple\|indigo\|pink\|gray\|slate\)-[0-9]" "Hardcoded border colors"

echo ""
echo "🔘 Checking Component Violations"
echo "────────────────────────────────"

# Check for raw HTML elements instead of components
count_violations "<button[[:space:]]" "Raw <button> instead of <Button>"
count_violations "<input[[:space:]]" "Raw <input> instead of <Input>"
count_violations "<select[[:space:]]" "Raw <select> instead of <Select>"
count_violations "<table[[:space:]]" "Raw <table> instead of theme table"

echo ""
echo "📐 Checking Style Violations"
echo "────────────────────────────"

# Check for inline styles
count_violations "style={{" "Inline styles instead of classes"
count_violations "style=\"" "Inline styles (string format)"

# Check for non-semantic classes
count_violations "className=\"[^\"]*rounded-\(sm\|md\|lg\|xl\|2xl\|3xl\|full\)" "Hardcoded border radius"
count_violations "className=\"[^\"]*shadow-\(sm\|md\|lg\|xl\|2xl\)" "Hardcoded shadows"

echo ""
echo "🎯 Checking Panel/Card Usage"
echo "────────────────────────────"

# Check for divs that should be Panels/Cards
check_antipattern "className=\"[^\"]*rounded[^\"]*bg-" "Divs with both rounded + bg (should be Panel/Card)"
check_antipattern "className=\"[^\"]*p-[0-9][^\"]*rounded" "Divs with padding + rounded (should be Panel/Card)"

echo ""
echo "🔤 Checking Typography"
echo "──────────────────────"

# Check for hardcoded font sizes
count_violations "text-\(xs\|sm\|base\|lg\|xl\|2xl\|3xl\|4xl\|5xl\)" "Hardcoded font sizes"
count_violations "font-\(thin\|light\|normal\|medium\|semibold\|bold\|extrabold\)" "Hardcoded font weights"

echo ""
echo "🎛️ Checking Spacing Consistency"
echo "────────────────────────────────"

# Look for inconsistent spacing
SPACE_VARIANTS=$(find src -type f -name "*.tsx" -not -path "*/dev/theme/*" -exec grep -oh "className=\"[^\"]*" {} \; | grep -o "\(p\|m\|gap\)-[0-9]\+" | sort -u | wc -l | tr -d ' ')
echo "   Found $SPACE_VARIANTS different spacing values in use"
if [ "$SPACE_VARIANTS" -gt 10 ]; then
    echo -e "   ${YELLOW}⚠️  High variance suggests inconsistent spacing${NC}"
fi

echo ""
echo "📋 Specific Theme System Checks"
echo "────────────────────────────────"

# Check if using theme system imports (excluding theme page itself)
THEME_IMPORTS=$(find src -type f \( -name "*.tsx" -o -name "*.ts" \) -not -path "*/dev/theme/*" -exec grep "from.*['\"]@/lib/.*Styles" {} \; | wc -l | tr -d ' ')
PANEL_IMPORTS=$(find src -type f -name "*.tsx" -not -path "*/dev/theme/*" -exec grep "from.*['\"]@/components/ui/Panel" {} \; | wc -l | tr -d ' ')
BUTTON_IMPORTS=$(find src -type f -name "*.tsx" -not -path "*/dev/theme/*" -exec grep "from.*['\"]@/components/ui/Button" {} \; | wc -l | tr -d ' ')

echo "   Theme system usage:"
echo "   - Files importing style modules: $THEME_IMPORTS"
echo "   - Files importing Panel/Card: $PANEL_IMPORTS"
echo "   - Files importing Button: $BUTTON_IMPORTS"

echo ""
echo "📊 Summary Report"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ "$TOTAL_VIOLATIONS" -eq 0 ]; then
    echo -e "${GREEN}🎉 Perfect! No theme violations found!${NC}"
else
    echo -e "${RED}Found $TOTAL_VIOLATIONS total violations${NC}"
    echo ""
    echo "Priority fixes:"
    echo "1. Replace hardcoded colors with semantic colors"
    echo "2. Use Button, Panel, Card components"
    echo "3. Move inline styles to theme classes"
    echo "4. Standardize spacing values"
fi

echo ""
echo "💡 Next Steps:"
echo "   - Run 'npm run theme:fix' to auto-fix some issues (future)"
echo "   - Check /docs/patterns/DESIGN-PATTERNS.md for guidelines"
echo "   - Use the living theme at /app/dev/theme"

# Return exit code based on violations
if [ "$TOTAL_VIOLATIONS" -gt 100 ]; then
    exit 2  # Major violations
elif [ "$TOTAL_VIOLATIONS" -gt 0 ]; then
    exit 1  # Minor violations
else
    exit 0  # Clean
fi