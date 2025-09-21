#!/bin/bash

# Script to replace hardcoded Tailwind colors with semantic classes
# Usage: ./replace-colors.sh

echo "🎨 Starting semantic color replacement..."

# Define color mappings
# Success colors (green, teal, emerald) -> success
# Danger colors (red, rose, pink) -> danger
# Warning colors (yellow, amber, orange) -> warning
# Info colors (blue, sky, cyan) -> info

# Function to replace colors in a file
replace_in_file() {
    local file="$1"
    echo "Processing: $file"

    # Create a temporary file
    temp_file="${file}.tmp"
    cp "$file" "$temp_file"

    # Text colors - Success variants
    sed -i '' 's/text-green-[0-9][0-9][0-9]/text-success/g' "$temp_file"
    sed -i '' 's/text-teal-[0-9][0-9][0-9]/text-success/g' "$temp_file"
    sed -i '' 's/text-emerald-[0-9][0-9][0-9]/text-success/g' "$temp_file"

    # Text colors - Danger variants
    sed -i '' 's/text-red-[0-9][0-9][0-9]/text-danger/g' "$temp_file"
    sed -i '' 's/text-rose-[0-9][0-9][0-9]/text-danger/g' "$temp_file"
    sed -i '' 's/text-pink-[0-9][0-9][0-9]/text-danger/g' "$temp_file"

    # Text colors - Warning variants
    sed -i '' 's/text-yellow-[0-9][0-9][0-9]/text-warning/g' "$temp_file"
    sed -i '' 's/text-amber-[0-9][0-9][0-9]/text-warning/g' "$temp_file"
    sed -i '' 's/text-orange-[0-9][0-9][0-9]/text-warning/g' "$temp_file"

    # Text colors - Info variants
    sed -i '' 's/text-blue-[0-9][0-9][0-9]/text-info/g' "$temp_file"
    sed -i '' 's/text-sky-[0-9][0-9][0-9]/text-info/g' "$temp_file"
    sed -i '' 's/text-cyan-[0-9][0-9][0-9]/text-info/g' "$temp_file"

    # Dark mode text colors
    sed -i '' 's/dark:text-green-[0-9][0-9][0-9]/dark:text-success/g' "$temp_file"
    sed -i '' 's/dark:text-teal-[0-9][0-9][0-9]/dark:text-success/g' "$temp_file"
    sed -i '' 's/dark:text-red-[0-9][0-9][0-9]/dark:text-danger/g' "$temp_file"
    sed -i '' 's/dark:text-rose-[0-9][0-9][0-9]/dark:text-danger/g' "$temp_file"
    sed -i '' 's/dark:text-yellow-[0-9][0-9][0-9]/dark:text-warning/g' "$temp_file"
    sed -i '' 's/dark:text-amber-[0-9][0-9][0-9]/dark:text-warning/g' "$temp_file"
    sed -i '' 's/dark:text-blue-[0-9][0-9][0-9]/dark:text-info/g' "$temp_file"

    # Background colors - Success variants
    sed -i '' 's/bg-green-[0-9][0-9][0-9]\/[0-9][0-9]/bg-success\/\1/g' "$temp_file"
    sed -i '' 's/bg-teal-[0-9][0-9][0-9]\/[0-9][0-9]/bg-success\/\1/g' "$temp_file"
    sed -i '' 's/bg-emerald-[0-9][0-9][0-9]\/[0-9][0-9]/bg-success\/\1/g' "$temp_file"
    sed -i '' 's/bg-green-[0-9][0-9][0-9]/bg-success/g' "$temp_file"
    sed -i '' 's/bg-teal-[0-9][0-9][0-9]/bg-success/g' "$temp_file"
    sed -i '' 's/bg-emerald-[0-9][0-9][0-9]/bg-success/g' "$temp_file"

    # Background colors - Danger variants
    sed -i '' 's/bg-red-[0-9][0-9][0-9]\/[0-9][0-9]/bg-danger\/\1/g' "$temp_file"
    sed -i '' 's/bg-rose-[0-9][0-9][0-9]\/[0-9][0-9]/bg-danger\/\1/g' "$temp_file"
    sed -i '' 's/bg-pink-[0-9][0-9][0-9]\/[0-9][0-9]/bg-danger\/\1/g' "$temp_file"
    sed -i '' 's/bg-red-[0-9][0-9][0-9]/bg-danger/g' "$temp_file"
    sed -i '' 's/bg-rose-[0-9][0-9][0-9]/bg-danger/g' "$temp_file"
    sed -i '' 's/bg-pink-[0-9][0-9][0-9]/bg-danger/g' "$temp_file"

    # Background colors - Warning variants
    sed -i '' 's/bg-yellow-[0-9][0-9][0-9]\/[0-9][0-9]/bg-warning\/\1/g' "$temp_file"
    sed -i '' 's/bg-amber-[0-9][0-9][0-9]\/[0-9][0-9]/bg-warning\/\1/g' "$temp_file"
    sed -i '' 's/bg-orange-[0-9][0-9][0-9]\/[0-9][0-9]/bg-warning\/\1/g' "$temp_file"
    sed -i '' 's/bg-yellow-[0-9][0-9][0-9]/bg-warning/g' "$temp_file"
    sed -i '' 's/bg-amber-[0-9][0-9][0-9]/bg-warning/g' "$temp_file"
    sed -i '' 's/bg-orange-[0-9][0-9][0-9]/bg-warning/g' "$temp_file"

    # Background colors - Info variants
    sed -i '' 's/bg-blue-[0-9][0-9][0-9]\/[0-9][0-9]/bg-info\/\1/g' "$temp_file"
    sed -i '' 's/bg-sky-[0-9][0-9][0-9]\/[0-9][0-9]/bg-info\/\1/g' "$temp_file"
    sed -i '' 's/bg-cyan-[0-9][0-9][0-9]\/[0-9][0-9]/bg-info\/\1/g' "$temp_file"
    sed -i '' 's/bg-blue-[0-9][0-9][0-9]/bg-info/g' "$temp_file"
    sed -i '' 's/bg-sky-[0-9][0-9][0-9]/bg-info/g' "$temp_file"
    sed -i '' 's/bg-cyan-[0-9][0-9][0-9]/bg-info/g' "$temp_file"

    # Border colors - all variants
    sed -i '' 's/border-green-[0-9][0-9][0-9]/border-success/g' "$temp_file"
    sed -i '' 's/border-teal-[0-9][0-9][0-9]/border-success/g' "$temp_file"
    sed -i '' 's/border-red-[0-9][0-9][0-9]/border-danger/g' "$temp_file"
    sed -i '' 's/border-rose-[0-9][0-9][0-9]/border-danger/g' "$temp_file"
    sed -i '' 's/border-yellow-[0-9][0-9][0-9]/border-warning/g' "$temp_file"
    sed -i '' 's/border-amber-[0-9][0-9][0-9]/border-warning/g' "$temp_file"
    sed -i '' 's/border-blue-[0-9][0-9][0-9]/border-info/g' "$temp_file"
    sed -i '' 's/border-sky-[0-9][0-9][0-9]/border-info/g' "$temp_file"

    # Only update if changes were made
    if ! diff -q "$file" "$temp_file" > /dev/null; then
        mv "$temp_file" "$file"
        echo "  ✓ Updated $file"
    else
        rm "$temp_file"
        echo "  - No changes needed"
    fi
}

# Files to exclude (don't modify)
EXCLUDE_PATTERNS=(
    "*/node_modules/*"
    "*/dist/*"
    "*/build/*"
    "*/.next/*"
    "*/globals.css"
    "*/theme.ts"
    "*/theme.tsx"
    "*/replace-colors.sh"
    "*/DESIGN*.md"
    "*/docs/*"
    "*/.git/*"
)

# Build exclude string for find command
EXCLUDE_STRING=""
for pattern in "${EXCLUDE_PATTERNS[@]}"; do
    EXCLUDE_STRING="$EXCLUDE_STRING -not -path '$pattern'"
done

# Find all TypeScript/TSX files
echo "Finding files to process..."
FILES=$(find /Users/duncanmcgill/coding/trenddojo-v2/src \
    -type f \( -name "*.tsx" -o -name "*.ts" \) \
    -not -path "*/node_modules/*" \
    -not -path "*/.next/*" \
    -not -path "*/dist/*" \
    -not -name "theme.ts" \
    -not -name "globals.css")

# Process each file
for file in $FILES; do
    # Skip certain files that should keep their colors
    if [[ "$file" == *"marketing"* ]] || [[ "$file" == *"AnimatedPolygon"* ]]; then
        echo "Skipping marketing/animation file: $file"
        continue
    fi

    replace_in_file "$file"
done

echo "✅ Color replacement complete!"
echo ""
echo "⚠️  IMPORTANT: Please review the changes and test thoroughly!"
echo "Some files may need manual adjustment for:"
echo "  - Gradient colors"
echo "  - Hover states with opacity"
echo "  - Complex color expressions"
echo "  - Marketing/branding colors that should remain as-is"