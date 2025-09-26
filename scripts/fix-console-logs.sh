#!/bin/bash

# Fix broken console.log comments that have orphaned object properties
# These occur when console.log was commented but the object properties weren't

echo "🔧 Fixing broken console.log comments..."

# Find all TypeScript/TSX files with potential broken console.logs
find src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec grep -l "// DEBUG: console.log" {} \; | while read file; do
    echo "  Checking $file..."

    # Create a temporary file
    temp_file="${file}.tmp"

    # Process the file to fix broken console.logs
    awk '
    BEGIN {
        in_broken_log = 0;
        indent = "";
    }

    # Detect start of broken console.log
    /^[[:space:]]*\/\/ DEBUG: console\.log/ {
        in_broken_log = 1;
        # Capture the indent
        match($0, /^[[:space:]]*/);
        indent = substr($0, RSTART, RLENGTH);
        print $0;
        next;
    }

    # If we are in a broken log
    in_broken_log == 1 {
        # Check if this line looks like an object property or closing
        if ($0 ~ /^[[:space:]]+[a-zA-Z_][a-zA-Z0-9_]*:/ ||
            $0 ~ /^[[:space:]]+\.\.\./ ||
            $0 ~ /^[[:space:]]*\}\);?[[:space:]]*$/ ||
            $0 ~ /^[[:space:]]*\);?[[:space:]]*$/) {
            # Add comment prefix preserving original indent
            sub(/^[[:space:]]*/, indent "// ");
            print $0;
            # Check if this is the end of the object
            if ($0 ~ /\}\);?[[:space:]]*$/ || $0 ~ /\);[[:space:]]*$/) {
                in_broken_log = 0;
            }
        } else {
            # Not part of the console.log anymore
            print $0;
            in_broken_log = 0;
        }
        next;
    }

    # Normal lines
    { print $0 }
    ' "$file" > "$temp_file"

    # Check if file changed
    if ! cmp -s "$file" "$temp_file"; then
        echo "    ✅ Fixed console.log comments in $file"
        mv "$temp_file" "$file"
    else
        rm "$temp_file"
    fi
done

echo "✅ Console.log cleanup complete!"

# Verify the build passes
echo "🔍 Verifying build..."
if npm run build > /dev/null 2>&1; then
    echo "✅ Build passes successfully!"
else
    echo "⚠️ Build still has errors. Please check manually."
    npm run build 2>&1 | head -50
fi