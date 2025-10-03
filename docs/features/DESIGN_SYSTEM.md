# TrendDojo Design System

*Comprehensive design system consolidating AI constraints, theme, components, and guidelines*
*Last Updated: 2025-09-28*

## 🚨 CRITICAL: AI Design System Enforcement

### BEFORE ANY UI WORK - MANDATORY CHECKS
1. **READ** `/src/app/theme/page.tsx` - This is the ONLY source of truth for visual examples
2. **CHECK** existing components in `/src/components/ui/`
3. **NEVER** create inline styles if a shared component exists
4. **ALWAYS** use the shared components
5. **NEVER** change visual appearance without user permission

### AI Enforcement Checklist
Before creating ANY UI element:
```
□ Did I check theme page (/app/theme/page.tsx)?
□ Does a shared component exist for this?
□ Am I using the exact color names (amber not yellow)?
□ Am I using Tailwind spacing (p-4 not padding:16px)?
□ Did I check the Alert has NO border?
```

Before modifying ANY visual element:
```
□ Did I ask user permission for visual changes?
□ Am I maintaining the established patterns?
□ Will this change be reflected in theme page?
```

## 🎨 Color System

### Core Brand Colors
```css
--purple-600: #9333ea     /* Primary purple */
--purple-700: #7c3aed     /* "Discipline" text */
--primary-600: #5b21b6    /* CTA button */
```

### Status Colors (USE THESE EXACT COLORS)
- **Primary/Actions**: `indigo-600`
- **Warning**: `amber-500` (NOT yellow)
- **Error/Danger**: `rose-500` (NOT red)
- **Success**: `emerald-500`
- **Info**: `blue-500` (NOT cyan)

### Financial Colors (NEVER CHANGE)
- **Positive/Gains/Up**: `teal-500` (NOT green)
- **Negative/Losses/Down**: `purple-600` (NOT red)

### Background Colors
```css
--bg-primary: #0f172a     /* Deep navy - main background */
--bg-secondary: #1e293b   /* Card backgrounds */
--bg-tertiary: #334155    /* Borders, dividers */
```

### Text Colors
```css
--text-primary: #ffffff   /* Main headings */
--text-secondary: #e2e8f0 /* Body text, descriptions */
--text-muted: #94a3b8     /* Labels, secondary info */
--text-accent: #8b5cf6    /* Purple accent */
```

### Background Usage
- **Dark panels**: `bg-slate-800/50` or `bg-slate-800/30`
- **Light panels**: `bg-white` or `bg-gray-50`
- **Page background**: `bg-slate-900` (dark), `bg-gray-50` (light)
- **Cards**: `bg-slate-800/50 dark:bg-slate-800/50 bg-white/80 backdrop-blur-sm`

## 🧩 Shared Components (MANDATORY USAGE)

### For Containers/Cards
```tsx
import { Card, Panel, Alert } from '@/components/ui/Panel'

// Use Card for all content containers
<Card>content</Card>

// Use Alert for all message boxes (NO BORDERS)
<Alert intent="info">message</Alert>     // Blue background, no border
<Alert intent="warning">message</Alert>  // Amber background, no border
<Alert intent="error">message</Alert>    // Rose background, no border
<Alert intent="success">message</Alert>  // Emerald background, no border
```

### For Buttons
```tsx
import { Button } from '@/components/ui/Button'

// NEVER use <button> directly, ALWAYS use:
<Button variant="primary">Text</Button>   // Indigo-600
<Button variant="secondary">Text</Button> // Gray/slate
<Button variant="danger">Text</Button>    // Rose-600
<Button variant="success">Text</Button>   // Emerald-600
<Button variant="ghost">Text</Button>     // Transparent
```

### For Forms
```tsx
import { FormField, Input, Select, Textarea, Checkbox, Radio } from '@/components/ui/FormField'

// ALWAYS wrap inputs with FormField
<FormField label="Label" helper="Help text" error="Error message">
  <Input type="text" />
</FormField>

// NEVER use raw <input>, <select>, <textarea>
```

### For Modals
```tsx
import { Modal, ConfirmModal } from '@/components/ui/Modal'

// Use Modal for all overlays
<Modal isOpen={open} onClose={handleClose} title="Title">
  content
</Modal>
```

## 📏 Spacing & Layout Rules

### Padding (USE TAILWIND SCALE)
- Small: `p-2` or `p-3`
- Medium: `p-4` (default for most)
- Large: `p-6` (default for cards)
- Extra: `p-8`

### Standard Spacing Scale
```
p-2 (0.5rem)
p-3 (0.75rem)
p-4 (1rem) - default small
p-6 (1.5rem) - default medium
p-8 (2rem) - large
```

### Border Radius
- Buttons/Inputs: `rounded-lg`
- Cards/Panels: `rounded-xl` (default)
- Small elements: `rounded`

### Border Radius Scale
```
rounded (0.25rem) - small elements
rounded-lg (0.5rem) - medium elements
rounded-xl (0.75rem) - cards/panels (DEFAULT)
```

### Shadows
- Cards: No shadow by default
- Hover: `hover:shadow-lg` only on interactive cards
- Modals: `shadow-xl`

## 📊 Table Design System

### Standard Table Structure (from tableStyles.ts)

#### Container Elements
- **Wrapper**: `tableStyles.wrapper` = `"border dark:border-slate-700 border-gray-200 rounded-lg overflow-hidden"`
- **Overflow Container**: `<div className="overflow-x-auto">` for horizontal scroll
- **Table**: `tableStyles.table` = `"w-full"`

#### Header Elements
- **thead**: `tableStyles.thead` = `"bg-gray-50 dark:bg-slate-800"`
- **Header Row**: `tableStyles.headerRow` = `"border-b dark:border-slate-700 border-gray-200"`
- **th**: `tableStyles.th` = `"text-left px-6 py-3 text-xs font-medium uppercase tracking-wider dark:text-gray-400 text-gray-600"`
- **th (center)**: `tableStyles.thCenter` for centered headers
- **th (right)**: `tableStyles.thRight` for right-aligned headers

#### Body Elements
- **tbody**: `tableStyles.tbody` = `"divide-y dark:divide-slate-700 divide-gray-200"`
- **tr**: `tableStyles.tr` = `"hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"`
- **tr (clickable)**: `tableStyles.trClickable` = adds `"cursor-pointer"`

#### Cell Elements
- **td (default)**: `tableStyles.td` = `"px-6 py-4 dark:text-gray-300 text-gray-700"`
- **td (bold)**: `tableStyles.tdBold` = `"px-6 py-4 dark:text-white text-gray-900 font-medium"`
- **td (center)**: `tableStyles.tdCenter` = centered text
- **td (right)**: `tableStyles.tdRight` = right-aligned text
- **td (success)**: `tableStyles.tdSuccess` = `"px-6 py-4 text-success"`
- **td (danger)**: `tableStyles.tdDanger` = `"px-6 py-4 text-danger"`
- **td (warning)**: `tableStyles.tdWarning` = `"px-6 py-4 text-warning"`
- **td (muted)**: `tableStyles.tdMuted` = `"px-6 py-4 dark:text-gray-400 text-gray-600"`

### Table Padding Standards
- **Headers**: `px-6 py-3`
- **Cells**: `px-6 py-4`
- **NEVER**: Use `px-4 py-3` or other custom padding

### Table Hover Effects
- **Standard**: `hover:bg-gray-50 dark:hover:bg-slate-800`
- **NEVER**: Use opacity variants like `/50` or `/30`

## 🚫 NEVER USE - Violations to Avoid

### Color Violations
- ❌ `yellow` - use `amber`
- ❌ `red` for errors - use `rose`
- ❌ `cyan` - use `blue`
- ❌ `green` for financials - use `teal`
- ❌ Custom colors like `#3498db`

### Styling Violations
- ❌ Custom padding like `padding: 12px`
- ❌ Inline styles when component exists
- ❌ Borders on Alert components
- ❌ `<button>` instead of `<Button>`
- ❌ Raw `<input>` instead of `<FormField>`

### Common AI Violations
```tsx
// ❌ WRONG - Creating inline button styles
<button className="px-4 py-2 bg-indigo-600...">

// ✅ CORRECT - Using shared component
<Button variant="primary">

// ❌ WRONG - Wrong colors
<div className="bg-yellow-500">  // or bg-red-500 for errors

// ✅ CORRECT - Semantic colors
<div className="bg-amber-500">   // or bg-rose-500 for errors

// ❌ WRONG - Borders on alerts
<div className="border border-yellow-200">

// ✅ CORRECT - No borders
<Alert intent="warning">  // No border!
```

## 📚 Reference Hierarchy

When in doubt, check in this order:
1. `/src/app/theme/page.tsx` - Visual examples (SINGLE SOURCE OF TRUTH)
2. `/docs/DESIGN_SYSTEM.md` - This file for comprehensive rules
3. `/src/components/ui/` - Component implementations
4. `/src/lib/*Styles.ts` - Style definitions

## 🚀 Quick Reference Templates

### Creating a new page section
```tsx
import { Card } from '@/components/ui/Panel'

<Card>
  <h2 className="text-xl font-semibold dark:text-white text-gray-900 mb-4">
    Section Title
  </h2>
  {/* content */}
</Card>
```

### Adding a warning message
```tsx
import { Alert } from '@/components/ui/Panel'

<Alert intent="warning" title="Warning Title">
  Warning message text here - NO BORDER!
</Alert>
```

### Creating a form
```tsx
import { FormField, Input, Button } from '@/components/ui/FormField'

<form>
  <FormField label="Email" required>
    <Input type="email" placeholder="user@example.com" />
  </FormField>
  <Button variant="primary" type="submit">Submit</Button>
</form>
```

### Creating a table
```tsx
import { tableStyles } from '@/lib/tableStyles'

<div className={tableStyles.wrapper}>
  <div className="overflow-x-auto">
    <table className={tableStyles.table}>
      <thead className={tableStyles.thead}>
        <tr className={tableStyles.headerRow}>
          <th className={tableStyles.th}>Header</th>
        </tr>
      </thead>
      <tbody className={tableStyles.tbody}>
        <tr className={tableStyles.tr}>
          <td className={tableStyles.td}>Content</td>
        </tr>
      </tbody>
    </table>
  </div>
</div>
```

## 🎯 Design Principles

### Contrast & Readability
- **High contrast text** with drop shadows for visibility
- **Semi-transparent cards** with backdrop blur for depth
- **Bright accent colors** on dark backgrounds

### Visual Hierarchy
- **White text** for primary headings
- **Light gray** for body text
- **Purple accent** for brand highlights
- **Colored shapes** for visual interest

### Interactive Elements
- **Hover effects** with opacity and color changes
- **Backdrop blur** for modern glass effect
- **Subtle animations** for floating shapes

## 🔧 Implementation Guidelines

### Global CSS Variables
```css
:root {
  --color-bg-primary: #0f172a;
  --color-bg-secondary: #1e293b;
  --color-text-primary: #ffffff;
  --color-text-secondary: #e2e8f0;
  --color-accent: #8b5cf6;
}
```

### Environment Indicators
```tsx
// Development
<div className="bg-slate-800 text-amber-500">DEVELOPMENT</div>

// Paper Trading
<div className="bg-emerald-500">📊 PAPER TRADING</div>
```

## ⚠️ REMEMBER - Critical Rules

- **Theme page is law** - If it's not there, don't use it
- **Ask before changing visuals** - User permission required
- **Alerts have no borders** - This is final
- **Use exact color names** - amber not yellow, rose not red
- **Check shared components first** - Don't reinvent
- **Tables use tableStyles.ts** - No hardcoded styles
- **Financial colors are sacred** - teal/purple only

---

*This design system is mandatory for all AI assistants working on TrendDojo UI. No exceptions.*