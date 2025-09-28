# Shared Framework News Update Recommendations

*Created: 2025-09-28*

## Context
We've just completed a major documentation refactor reducing 16,842 lines across 64 files down to ~13,398 lines across 40 files (20.5% reduction). Many files referenced in `_shared-framework/news/` have been consolidated or moved.

## Files That Need Updating

### 1. `/news/trenddojo-solutions.md`

#### Current References That Changed:
- **Line 109**: References `/docs/patterns/*.md` files - These still exist but content has changed
- **Line 93**: References `/docs/infrastructure/` - This directory structure has changed
- **Line 64**: References `/docs/PROJECT_CONTEXT.md` - Still valid
- **Line 12**: References `/docs/TIDY-PROTOCOL.md` - Need to verify if still exists

#### Recommended Updates:

**For Pattern Documentation Entry (line 105-110):**
```markdown
### 📚 Complete Trading Pattern Documentation System (2025-09-05)
**ADOPT THIS!** TrendDojo created comprehensive pattern documentation adapted from Controlla's system.
- **See**: Trading-specific patterns now documented for reuse across financial applications
- **Why**: Prevents reinventing patterns, ensures consistency, accelerates development
- **Files**: `/docs/patterns/` directory contains living pattern documents
- **Value**: Any project needing financial features can adopt these patterns
- **Note**: Documentation consolidated 2025-09-28 - see refactor log for details
```

**Add New Entry for Documentation Refactor:**
```markdown
### 📚 Documentation Consolidation Strategy (2025-09-28)
**ADOPT THIS!** TrendDojo successfully reduced documentation by 20% while preserving all information.
- **Problem**: 15,000+ lines across 60+ files causing confusion and overlap
- **Solution**: Systematic consolidation with archive-refactor tracking
- **Key Files**:
  - `/docs/archive-refactor/_refactor-log.md` - Complete tracking of all changes
  - Consolidated: `SECURITY.md`, `DESIGN_SYSTEM.md`, `BROKER_INTEGRATION.md`, `MARKET_DATA_SYSTEM.md`
- **Process**:
  1. Identify duplicate/overlapping documents
  2. Find all cross-references
  3. Create consolidated version preserving all information
  4. Move originals to archive with detailed log
  5. Update all references
- **Value**: Cleaner docs, single sources of truth, better maintainability
- **Results**: 3,444 lines removed, 24 files consolidated
```

### 2. `/news/trenddojo-design-system.md`

This file likely references old design documentation that's now consolidated into `DESIGN_SYSTEM.md`. Should be checked and updated.

## Recommended Actions

### Immediate Updates Needed:

1. **Update Pattern Documentation References**
   - Change specific file references to directory references
   - Add note about 2025-09-28 consolidation

2. **Add Documentation Refactor Entry**
   - Document the successful 20% reduction strategy
   - Share the archive-refactor pattern for other projects

3. **Update Infrastructure References**
   - `/docs/infrastructure/` references should note the consolidation
   - DNS documentation may have moved to archive

### Future Considerations:

1. **Version Documentation References**
   - Consider adding dates to all documentation references
   - Note: "As of 2025-09-28" to help with future updates

2. **Create Documentation Map**
   - Consider creating a `/docs/DOCUMENTATION_MAP.md` that lists current structure
   - Update shared framework to reference the map instead of specific files

3. **Automate Cross-Reference Checking**
   - Create a script to validate documentation references across projects
   - Run during CI/CD to catch broken references

## Implementation Strategy

### Phase 1: Quick Fixes (NOW)
- Update the 4 direct file references in trenddojo-solutions.md
- Add the documentation refactor success story

### Phase 2: Systematic Review (NEXT)
- Review all proven-solutions files for stale references
- Update controlla-solutions.md if it references TrendDojo docs
- Check trenddojo-design-system.md for outdated design file references

### Phase 3: Prevention (LATER)
- Create documentation map file
- Add reference validation to CI/CD
- Document the reference update process

## Benefits of These Updates

1. **Accuracy**: Shared framework news remains current and useful
2. **Discoverability**: Other projects can learn from our refactor success
3. **Maintainability**: Clear tracking of what changed when
4. **Reusability**: Archive-refactor pattern can be adopted by other projects

## Example Script for Reference Validation

```bash
#!/bin/bash
# validate-doc-references.sh
# Check if documentation references in shared framework are valid

echo "Checking documentation references..."

# Files to check
NEWS_FILES=(
  "_shared-framework/news/trenddojo-solutions.md"
  "_shared-framework/news/controlla-solutions.md"
  "_shared-framework/proven-solutions/*.md"
)

# Extract file references and validate
for news_file in "${NEWS_FILES[@]}"; do
  if [ -f "$news_file" ]; then
    echo "Checking $news_file..."
    # Extract paths starting with /docs/
    grep -o '/docs/[^"]*' "$news_file" | while read -r ref; do
      full_path="trenddojo-v2$ref"
      if [ ! -e "$full_path" ]; then
        echo "  ❌ Missing: $ref"
      fi
    done
  fi
done
```

## Summary

The shared framework news system needs updating to reflect our major documentation refactor. The updates are straightforward:
1. Fix 4 direct file references
2. Add our refactor success as a new solution
3. Consider systematic improvements for future maintainability

This ensures the shared framework continues to provide accurate, valuable information to all projects in the portfolio.