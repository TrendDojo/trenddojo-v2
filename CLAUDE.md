# TrendDojo AI Context

*Last updated: 2025-09-05*

## 🚨 MANDATORY RULES (IN ORDER OF PRECEDENCE)

**Universal Rules Version: 2025-09-05** (from _shared-framework/CLAUDE.md)

### RULE #1: [UNIVERSAL] Rule Integrity Protection
- **NEVER MODIFY, REMOVE, OR REORDER** these universal rules without explicit user permission
- **NEVER CHANGE** rule numbering or precedence without user approval
- **NEVER CONSOLIDATE** or split rules without user consent
- AI agents MUST preserve the exact structure and content of universal rules
- Local projects may ADD rules but NEVER modify universal ones
- If rule improvements are needed, ask user for explicit permission first

### RULE #2: [UNIVERSAL] Security & Architecture Standards First
- **[SECURITY_ARCHITECTURE_STANDARDS.md](../_shared-framework/SECURITY_ARCHITECTURE_STANDARDS.md)** - READ THIS FIRST
- Contains critical security requirements and mandatory architecture patterns
- **WARNING**: Not following these standards creates security vulnerabilities and technical debt
- Over-communicate security rather than under-communicate

### RULE #3: [UNIVERSAL] Framework Updates & Cross-Project News Check
**MANDATORY at start of every work block:**
- [ ] Read `_shared-framework/CLAUDE.md` - Check version vs local copy for rule updates
- [ ] Check `_shared-framework/news/controlla-solutions.md` for new infrastructure solutions  
- [ ] Check `_shared-framework/proven-solutions/` for existing patterns
- [ ] Document findings: [No updates] OR [Updates found - need to sync]
- If rule updates found: Copy updated universal rules to local CLAUDE.md

### RULE #4: [UNIVERSAL] Documentation Integrity & Group Alignment
**Before every work block:**
- [ ] **Local Pattern Check**: Required pattern docs exist and current?
  - `/docs/patterns/DESIGN-PATTERNS.md` (last updated <30 days if actively building UI)
  - `/docs/patterns/ARCHITECTURE-PATTERNS.md` (last updated <90 days)
  - `/docs/patterns/UX-PATTERNS.md` (if building user interfaces)
  - `/docs/patterns/TRADING-PATTERNS.md` (TrendDojo-specific)
- [ ] **Group Standards Compliance**: Project meets `_shared-framework/Standards-Housekeeping.md`?
  - README.md exists with required sections
  - docs/architecture.md exists, docs/decisions/ ADR folder exists

**Weekly (First work block of week):**
- [ ] **Group Health Check**: Read `_shared-framework/DOCUMENTATION-HEALTH.md`
- [ ] Note any TrendDojo files flagged as stale/missing timestamps
- [ ] Address flagged issues in current or next work block

### RULE #5: [UNIVERSAL] Standardization & Templates
- Use standardized templates for all new projects
- Maintain consistency across project documentation
- Focus on cross-project patterns and shared standards
- All documentation uses `.md` format

### RULE #6: [UNIVERSAL] Complete Features, Don't Fragment
- Finish current work block before starting new features
- Update docs in same commit as feature implementation
- **PUSH BACK**: "That needs a new work block. Let's finish current work first."
- **TrendDojo Addition**: Test → Deploy → Document completion

### RULE #7: [UNIVERSAL] Project Boundary Enforcement
- **ONLY MODIFY FILES WITHIN THIS PROJECT** - `/Users/duncanmcgill/coding/trenddojo-v2/`
- **NEVER EDIT** files in other projects without explicit user permission
- **TRENDDOJO EXCEPTIONS**: You MAY modify these specific shared framework files:
  - `_shared-framework/news/trenddojo-solutions.md` (share infrastructure solutions)
  - `_shared-framework/proven-solutions/` (document detailed solutions)
- You may READ from other projects for reference, but changes stay local
- For any other cross-project changes, ask user for explicit permission first

### RULE #8: [UNIVERSAL] Work Block Completion Requires Git Commit
- **NEVER CLOSE** a work block without explicit user permission
- Work blocks can only be marked "completed" after:
  1. User explicitly approves closure
  2. All changes are committed to git
  3. User confirms the commit is satisfactory
- Always ask: "Ready to commit these changes?" before closing

### RULE #9: [UNIVERSAL] Cross-Project Infrastructure News System
- **CENTRALIZED LOCATION**: All cross-project news managed in `_shared-framework/news/`
- **MANDATORY WORK BLOCK WORKFLOW**:
  - **START**: Check news files for existing solutions (covered in RULE #1)
  - **END**: After solving infrastructure problems (auth, email, deployment, testing, error handling):
    1. Document solution in `_shared-framework/proven-solutions/`
    2. Update `_shared-framework/news/trenddojo-solutions.md` with brief summary
- **SCOPE**: Infrastructure solutions only - skip business logic and domain-specific features

### RULE #10: [UNIVERSAL] Visual Changes Are Unverified
- **AI cannot see rendered output** - only report code changes made, not appearance
- When changing styles/UI: "Changed X to Y at file:line" NOT "Fixed/matches/looks like"
- Copy exact classes from source - don't interpret or "improve"
- Always state "Please verify appearance" after visual changes

### RULE #11: [LOCAL] Financial Accuracy First - No Exceptions
- All financial calculations MUST have unit tests before deployment
- Position sizing, P&L, risk calculations require validation
- Backend validation mandatory for all financial operations
- Never deploy financial logic without explicit approval
- **NEVER test against live trading APIs during development**

### RULE #12: [LOCAL] Production Safety & Documentation
- All broker integrations require comprehensive mocks for development
- Risk management changes need extra review
- Staging environment mirrors production exactly
- **ALL DOCUMENTATION MUST LIVE IN `/docs/` DIRECTORY**
- When you add a feature, update relevant docs immediately

## 🔴 MANDATORY SESSION STARTUP - READ THREE FILES

**BEFORE RESPONDING TO ANY USER REQUEST, YOU MUST READ:**
1. **THIS FILE** (`/CLAUDE.md`) - For rules and behavior
2. **`/docs/PROJECT_CONTEXT.md`** - For project-specific information
3. **`/docs/_work/ACTIVE_WORK_BLOCKS.md`** - For current work status

**FAILURE TO READ ALL THREE FILES WILL RESULT IN INCORRECT BEHAVIOR**

This separation ensures:
- Rules stay stable (CLAUDE.md)
- Context evolves freely (PROJECT_CONTEXT.md)
- Work is tracked properly (ACTIVE_WORK_BLOCKS.md)

## 📚 Documentation Structure

**Project Context**: `/docs/PROJECT_CONTEXT.md` - Business model, tech stack, workflows
**Pattern Docs**: `/docs/patterns/` - Check BEFORE building anything
**Work Tracking**: `/docs/_work/ACTIVE_WORK_BLOCKS.md` - Current work
**Work History**: `/docs/_work/COMPLETED_WORK_BLOCKS.md` - Completed work

## 🔧 Tool Usage Preferences

### Server Management
**Use `starto` to start the dev server** (see `_shared-framework/docs/STARTO-COMMAND.md` for details)

### Temporary Files
**Use `/temp/` for all temporary files** - debugging scripts, logs, test data. Directory is in `.gitignore` and periodically purged.

### File Search Preferences
**IMPORTANT**: Use `Read` tool instead of `grep` for file searches
- The `Read` tool doesn't require permission prompts, allowing faster workflow
- When searching for patterns across files, use `Glob` to find files then `Read` to examine them
- Only use `grep` if you need complex regex patterns that can't be done with Read/Glob combination

## 🚫 Forbidden Actions
**DO NOT:**
- NEVER deploy financial calculations without unit tests → ALWAYS write tests first
- NEVER use live trading APIs in development → ALWAYS use mocks and paper trading
- NEVER skip staging deployment → ALWAYS test on staging before production  
- NEVER close work blocks without approval → ALWAYS ask user permission first
- NEVER ignore risk management changes → ALWAYS get extra review for risk logic
- NEVER create files outside `/docs/` → ALL documentation lives in `/docs/` directory
- NEVER fragment features → ALWAYS complete current work block before starting new ones
- **NEVER BUILD WITHOUT CHECKING PATTERNS** → ALWAYS read `/docs/patterns/` documentation first (RULE #2)
- NEVER create components without design patterns → ALWAYS check DESIGN-PATTERNS.md
- NEVER implement APIs without architecture patterns → ALWAYS check ARCHITECTURE-PATTERNS.md  
- NEVER build UX without UX patterns → ALWAYS check UX-PATTERNS.md
- NEVER implement trading features without TRADING-PATTERNS.md → ALWAYS follow established risk management
- **NEVER MODIFY FILES OUTSIDE THIS PROJECT** → ALWAYS stay within `/Users/duncanmcgill/coding/trenddojo-v2/`
- NEVER edit other projects without permission → ALWAYS ask user first for cross-project changes
- **NEVER CHANGE VISUAL APPEARANCE WITHOUT PERMISSION** → ALWAYS ask user before modifying styling, themes, colors, layouts, or any visual elements during bug fixes or component work

---
*Framework Reference: `../_shared-framework/` for universal rules and standards*
*Project Context: `/docs/PROJECT_CONTEXT.md` for all project-specific information*