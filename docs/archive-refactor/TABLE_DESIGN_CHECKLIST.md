# Table Design Consistency Checklist

## ✅ Standard Table Structure (from tableStyles.ts)

### Container Elements
- [ ] **Wrapper**: `tableStyles.wrapper` = `"border dark:border-slate-700 border-gray-200 rounded-lg overflow-hidden"`
- [ ] **Overflow Container**: `<div className="overflow-x-auto">` for horizontal scroll
- [ ] **Table**: `tableStyles.table` = `"w-full"`

### Header Elements
- [ ] **thead**: `tableStyles.thead` = `"bg-gray-50 dark:bg-slate-800"`
- [ ] **Header Row**: `tableStyles.headerRow` = `"border-b dark:border-slate-700 border-gray-200"`
- [ ] **th**: `tableStyles.th` = `"text-left px-6 py-3 text-xs font-medium uppercase tracking-wider dark:text-gray-400 text-gray-600"`
- [ ] **th (center)**: `tableStyles.thCenter` for centered headers
- [ ] **th (right)**: `tableStyles.thRight` for right-aligned headers

### Body Elements
- [ ] **tbody**: `tableStyles.tbody` = `"divide-y dark:divide-slate-700 divide-gray-200"`
- [ ] **tr**: `tableStyles.tr` = `"hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"`
- [ ] **tr (clickable)**: `tableStyles.trClickable` = adds `"cursor-pointer"`

### Cell Elements
- [ ] **td (default)**: `tableStyles.td` = `"px-6 py-4 dark:text-gray-300 text-gray-700"`
- [ ] **td (bold)**: `tableStyles.tdBold` = `"px-6 py-4 dark:text-white text-gray-900 font-medium"`
- [ ] **td (center)**: `tableStyles.tdCenter` = centered text
- [ ] **td (right)**: `tableStyles.tdRight` = right-aligned text
- [ ] **td (success)**: `tableStyles.tdSuccess` = `"px-6 py-4 text-success"`
- [ ] **td (danger)**: `tableStyles.tdDanger` = `"px-6 py-4 text-danger"`
- [ ] **td (warning)**: `tableStyles.tdWarning` = `"px-6 py-4 text-warning"`
- [ ] **td (muted)**: `tableStyles.tdMuted` = `"px-6 py-4 dark:text-gray-400 text-gray-600"`

## 🔍 Current Inconsistencies Found

### Padding Inconsistencies
- **Standard**: `px-6 py-3` (headers) and `px-6 py-4` (cells)
- **Found**: `px-4 py-3` in positions, strategies, screener tables
- **Action**: Replace all with standard padding

### Hover Effects Inconsistencies
- **Standard**: `hover:bg-gray-50 dark:hover:bg-slate-800`
- **Found**: Various including `dark:hover:bg-slate-800/50`, `dark:hover:bg-slate-800/30`
- **Action**: Use standard hover without opacity variants

### Header Styling Inconsistencies
- **Standard**: `text-xs font-medium uppercase tracking-wider`
- **Found**: Some tables missing uppercase or tracking-wider
- **Action**: Apply standard header classes

### Container Inconsistencies
- **Standard**: Wrapped with border and rounded corners
- **Found**: Some tables have no wrapper, others use Card component
- **Action**: Use tableStyles.wrapper or Card consistently

## 📋 Tables to Update

1. **Positions Table** (`/src/app/positions/page.tsx`)
   - Lines: 796-900+
   - Status: ❌ Using hardcoded styles
   - Needs: Complete refactor to use tableStyles

2. **Strategies Table** (`/src/components/strategies/StrategiesTab.tsx`)
   - Lines: 105-236
   - Status: ❌ Using hardcoded styles
   - Needs: Complete refactor, maintain expandable functionality

3. **Screener Table** (`/src/app/screener/page.tsx`)
   - Lines: 1351-1400+
   - Status: ❌ Using hardcoded styles
   - Needs: Complete refactor, maintain sorting functionality

4. **Strategy Positions** (`/src/app/strategies/[id]/page.tsx`)
   - Lines: 278-320+
   - Status: ❌ Using hardcoded styles
   - Needs: Complete refactor

5. **Position Activity** (`/src/app/positions/[id]/page.tsx`)
   - Lines: 199-240+
   - Status: ❌ Using hardcoded styles
   - Needs: Complete refactor

6. **Billing History** (`/src/app/subscription/page.tsx`)
   - Lines: 253-290+
   - Status: ❌ Using hardcoded styles
   - Needs: Complete refactor

7. **Theme Demo** (`/src/app/theme/page.tsx`)
   - Lines: 548-577
   - Status: ✅ Already using tableStyles
   - Needs: Nothing - this is the reference

## 🎯 Implementation Strategy

1. **Import tableStyles** in each file
2. **Replace hardcoded wrapper** with `tableStyles.wrapper`
3. **Replace table classes** with `tableStyles.table`
4. **Replace thead/tbody** with appropriate styles
5. **Replace all th elements** with correct alignment variants
6. **Replace all td elements** with appropriate content variants
7. **Test hover effects** work correctly
8. **Verify responsive behavior** with overflow container

## 🔄 Verification Steps

After each table update:
1. Visual comparison with theme page table
2. Check all hover states work
3. Verify dark mode consistency
4. Test responsive behavior
5. Ensure special features (sorting, expanding) still work

## Helper Functions Available

```typescript
// For dynamic styling
getTableWrapper(options)
getFilterButton(isActive)
getTabButton(isActive, style)
getTableCell(type, align)
```

## Final Check
- [ ] All tables import tableStyles
- [ ] No hardcoded Tailwind table styles remain
- [ ] All tables visually match theme page
- [ ] Dark mode consistent across all tables
- [ ] Hover effects work uniformly
- [ ] Padding is consistent (px-6 py-3/4)
- [ ] Borders use standard colors
- [ ] Text colors follow semantic system