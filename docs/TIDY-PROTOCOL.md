# Tidy & Audit Protocol - Codebase & Documentation Health Check

**CLAUDE INSTRUCTION**: When user mentions "tidy", "audit", "cleanup", or "clean up", reference this document and execute these checks.

## 🎯 Quick Tidy Command Sequence

```bash
# Run in this order for comprehensive cleanup
./scripts/theme-compliance-scanner.sh  # Check theme violations
npm run tidy:check    # See what needs cleaning (future script)
npm run tidy:fix      # Auto-fix what's possible (future script)
git status            # Review changes
```

## 📚 Documentation Audit

### Check Local vs Framework Alignment
```bash
# Check if local CLAUDE.md matches framework version
diff CLAUDE.md ../_shared-framework/CLAUDE.md | head -20

# Check required pattern docs exist
ls -la docs/patterns/*.md

# Check pattern docs freshness
find docs/patterns -name "*.md" -mtime +30 -exec echo "Stale: {}" \;

# Check if following group standards
ls -la README.md docs/architecture.md docs/decisions/
```

### Required Documentation Files
- [ ] `/docs/PROJECT_CONTEXT.md` exists and current
- [ ] `/docs/patterns/DESIGN-PATTERNS.md` (<30 days old if building UI)
- [ ] `/docs/patterns/ARCHITECTURE-PATTERNS.md` (<90 days old)
- [ ] `/docs/patterns/UX-PATTERNS.md` (if has UI)
- [ ] `/docs/patterns/TRADING-PATTERNS.md` (TrendDojo specific)
- [ ] `README.md` with standard sections
- [ ] `/docs/architecture.md` exists
- [ ] `/docs/decisions/` ADR folder exists

## ✅ Code Tidy Checklist

### 1. Debug Statements
```bash
# Find uncommented console.logs
grep -r "^[[:space:]]*console\.log" src --include="*.ts" --include="*.tsx" | wc -l

# Comment them out (preserve for dev)
find src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' 's/^[[:space:]]*console\.log/    \/\/ DEBUG: console.log/g' {} +

# Verify cleanup
grep -r "^[[:space:]]*console\.log" src --include="*.ts" --include="*.tsx" | wc -l
```

### 2. TODO Comments
```bash
# Find all TODOs
grep -r "TODO" src --include="*.ts" --include="*.tsx" -n

# Decision criteria:
# - Completed → Remove entirely
# - Obsolete → Remove entirely
# - Still valid → Keep with date: // TODO: [YYYY-MM-DD] Description
# - Vague → Make specific or remove
```

### 3. Script Organization
```bash
# Check scripts directory
ls -la scripts/

# Move based on type:
# - One-time/experimental → /temp/ then delete
# - Test scripts → /temp/ for debugging
# - Production utilities → Keep in /scripts/
```

### 4. Unused Code Detection
```bash
# Find unused imports (if eslint configured)
npx eslint src --ext .ts,.tsx --rule '@typescript-eslint/no-unused-vars: warn' 2>&1 | grep "is defined but never used"

# Find unreferenced files (if unimported available)
npx unimported 2>/dev/null || echo "Install: npm i -D unimported"

# Find files that might be temporary
find src -name "test-*" -o -name "temp-*" -o -name "old-*" -o -name "*-backup*"
```

### 5. File Size Check
```bash
# Find large files that might need splitting
find src -name "*.tsx" -o -name "*.ts" | xargs wc -l | awk '$1 > 500 {print $2 ": " $1 " lines"}'
```

### 6. Git Hygiene
```bash
# Check for uncommitted changes
git status --short

# Files that should be in .gitignore
find . -name "*.log" -o -name ".DS_Store" -o -name "*.tmp" | grep -v node_modules
```

### 7. Theme Compliance Check
```bash
# Run theme compliance scanner
./scripts/theme-compliance-scanner.sh

# Key violations to watch:
# - Hardcoded colors (text-red-500, bg-gray-100, etc.)
# - Raw HTML elements (<button>, <input>, <table>)
# - Inline styles (style={{ }})
# - Inconsistent spacing (p-2 vs p-3 vs p-4)
```

## 📁 Directory Rules

### /scripts/ - Production Only
- Database operations
- Deployment scripts
- Data import/export utilities
- Business-critical automation

### /temp/ - Temporary Only
- Debugging scripts
- One-time fixes (delete after use)
- API connection tests
- Experiments
- **Gets purged periodically**

### /src/__tests__/ - Real Tests
- Unit tests
- Integration tests
- Test fixtures

## 🚫 Anti-Patterns to Remove

1. **Commented-out code blocks** - Delete, git has history
2. **Multiple consecutive blank lines** - Max 2
3. **Trailing whitespace** - Remove
4. **Inconsistent naming** - Follow conventions
5. **Dead imports** - Remove unused
6. **Test code in production** - Move to /temp/ or __tests__/
7. **Hardcoded values** - Move to config/env
8. **console.log in production code** - Use proper logging

## 🤖 Future Automation Goals

Create `scripts/tidy.sh`:
```bash
#!/bin/bash
# Automated tidy script

echo "🧹 Running TrendDojo Tidy Protocol..."

# 1. Console logs
LOGS=$(grep -r "^[[:space:]]*console\.log" src --include="*.ts" --include="*.tsx" | wc -l)
if [ "$LOGS" -gt 0 ]; then
  echo "⚠️  Found $LOGS uncommented console.logs"
  read -p "Comment them out? (y/n) " -n 1 -r
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    find src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' 's/^[[:space:]]*console\.log/    \/\/ DEBUG: console.log/g' {} +
    echo "✅ Commented out console.logs"
  fi
fi

# 2. TODO audit
echo ""
echo "📝 TODO Comments:"
grep -r "TODO" src --include="*.ts" --include="*.tsx" | head -5
TODO_COUNT=$(grep -r "TODO" src --include="*.ts" --include="*.tsx" | wc -l)
echo "... and $((TODO_COUNT - 5)) more"

# 3. Large files
echo ""
echo "📏 Files over 500 lines:"
find src -name "*.tsx" -o -name "*.ts" | xargs wc -l | awk '$1 > 500 {print "  - " $2 ": " $1 " lines"}'

# 4. Temp file check
echo ""
TEMP_FILES=$(find src -name "test-*" -o -name "temp-*" -o -name "old-*" | wc -l)
if [ "$TEMP_FILES" -gt 0 ]; then
  echo "⚠️  Found $TEMP_FILES temporary-looking files in src/"
  find src -name "test-*" -o -name "temp-*" -o -name "old-*"
fi

echo ""
echo "✅ Tidy check complete!"
```

Add to package.json:
```json
{
  "scripts": {
    "tidy": "./scripts/tidy.sh",
    "tidy:check": "./scripts/tidy.sh --check",
    "tidy:fix": "./scripts/tidy.sh --fix"
  }
}
```

## 📊 Tidy Metrics Target

After a successful tidy:
- ✅ 0 uncommented console.logs
- ✅ All TODOs have dates or are removed
- ✅ No files in wrong directories
- ✅ No files >800 lines
- ✅ All scripts categorized correctly
- ✅ /temp/ contains only active experiments

## 🔄 When to Run Tidy

1. **Before commits** - Quick check
2. **Weekly** - Full cleanup
3. **After feature completion** - Remove debug code
4. **Before deployment** - Ensure production ready

---

*Last tidy: 2025-01-26*
*Next scheduled: Weekly*