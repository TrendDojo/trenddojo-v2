# Living Theme System Usage Guide

*Last updated: 2025-01-26*

## 🎨 The Living Theme Principle

**ALL UI components must source their styles from the centralized theme system.** This ensures consistency across the entire application and allows global style changes from a single location.

## 📍 Where to Find Theme Styles

### 1. Style Files (`/src/lib/*Styles.ts`)
- `buttonStyles.ts` - All button variants
- `tableStyles.ts` - Table components and filters
- `panelStyles.ts` - Panels, cards, and alerts
- `formStyles.ts` - Form inputs and controls
- `badgeStyles.ts` - Badges and tags

### 2. Theme Showcase (`/src/app/dev/theme/page.tsx`)
- Live examples of all components
- Visual reference for available styles
- Copy-paste ready code snippets

## ✅ Correct Usage

```typescript
// GOOD - Using theme styles
import { buttonStyles } from '@/lib/buttonStyles';
import { alertStyles } from '@/lib/panelStyles';

<button className={buttonStyles.primary}>Save</button>
<div className={alertStyles.background.success}>Success!</div>
```

## ❌ Incorrect Usage

```typescript
// BAD - Hardcoded styles
<button className="bg-blue-500 hover:bg-blue-600 px-4 py-2">Save</button>
<div className="bg-green-100 border-green-300">Success!</div>
```

## 🆕 When You Need a New Style

### Step 1: Check if it exists
1. Search `/src/lib/*Styles.ts` files
2. Check `/src/app/dev/theme/page.tsx` for visual reference
3. Look for similar patterns that could be reused

### Step 2: If it doesn't exist, ASK FIRST
**Before creating any new styles:**
1. Ask user: "This style doesn't exist in the theme. Should I add it?"
2. Propose where it should go in the theme system
3. Only proceed with user approval

### Step 3: Add to theme system
```typescript
// Add to appropriate *Styles.ts file
export const newStyles = {
  variant: "bg-new-color text-new-text",
  // ...
};

// Also add example to theme showcase
```

## 🎨 Semantic Colors

Always use semantic color classes:
- `text-success` / `bg-success` - Green, positive actions
- `text-danger` / `bg-danger` - Red, destructive actions
- `text-warning` / `bg-warning` - Yellow, caution
- `text-info` / `bg-info` - Blue, informational
- `text-primary` / `bg-primary` - Indigo, primary brand

## 📏 Spacing

Use theme spacing values:
- `p-1` through `p-8` - Standard padding
- `m-1` through `m-8` - Standard margins
- `gap-1` through `gap-8` - Grid/flex gaps

Never use arbitrary values like `p-[13px]` or `mt-[27px]`.

## 🔄 Benefits

1. **Consistency** - Every button looks the same
2. **Maintainability** - Change once, update everywhere
3. **Discoverability** - All styles in one place
4. **Efficiency** - No duplicate style definitions
5. **Theme Support** - Easy dark/light mode switching

## 📝 Checklist for New Components

- [ ] Check `/src/lib/*Styles.ts` for existing styles
- [ ] Check `/src/app/dev/theme/page.tsx` for examples
- [ ] Use semantic color classes (text-success, not text-green-500)
- [ ] Use theme spacing (p-4, not p-[16px])
- [ ] If new style needed, ask user first
- [ ] Add new styles to theme system, not inline
- [ ] Update theme showcase with example

## 🚨 Red Flags

If you find yourself:
- Writing `className="bg-green-500 ..."` - STOP, use semantic colors
- Adding inline styles - STOP, add to theme system
- Creating similar but slightly different styles - STOP, consolidate
- Not finding what you need - ASK USER before creating

Remember: **The theme system is the single source of truth for ALL UI styles.**