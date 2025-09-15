# AI Design Rules - MANDATORY READING

*This document ensures AI assistants maintain design consistency*
*Last Updated: 2025-09-15*

## 🚨 CRITICAL: Design System Enforcement for AI

### BEFORE ANY UI WORK - MANDATORY CHECKS
1. **READ** `/src/app/theme/page.tsx` - This is the ONLY source of truth
2. **CHECK** existing components in `/src/components/ui/`
3. **NEVER** create inline styles if a shared component exists
4. **ALWAYS** use the shared components

### Shared Components You MUST Use

#### For Containers/Cards
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

#### For Buttons
```tsx
import { Button } from '@/components/ui/Button'

// NEVER use <button> directly, ALWAYS use:
<Button variant="primary">Text</Button>   // Indigo-600
<Button variant="secondary">Text</Button> // Gray/slate
<Button variant="danger">Text</Button>    // Rose-600
<Button variant="success">Text</Button>   // Emerald-600
<Button variant="ghost">Text</Button>     // Transparent
```

#### For Forms
```tsx
import { FormField, Input, Select, Textarea, Checkbox, Radio } from '@/components/ui/FormField'

// ALWAYS wrap inputs with FormField
<FormField label="Label" helper="Help text" error="Error message">
  <Input type="text" />
</FormField>

// NEVER use raw <input>, <select>, <textarea>
```

#### For Modals
```tsx
import { Modal, ConfirmModal } from '@/components/ui/Modal'

// Use Modal for all overlays
<Modal isOpen={open} onClose={handleClose} title="Title">
  content
</Modal>
```

## 🎨 Color Rules - NO EXCEPTIONS

### Financial Colors (NEVER CHANGE)
- **Positive/Gains/Up**: `teal-500` (NOT green)
- **Negative/Losses/Down**: `purple-600` (NOT red)

### Status Colors (USE THESE EXACT COLORS)
- **Primary/Actions**: `indigo-600`
- **Warning**: `amber-500` (NOT yellow)
- **Error/Danger**: `rose-500` (NOT red)
- **Success**: `emerald-500`
- **Info**: `blue-500` (NOT cyan)

### Backgrounds
- **Dark panels**: `bg-slate-800/50` or `bg-slate-800/30`
- **Light panels**: `bg-white` or `bg-gray-50`
- **Page background**: `bg-slate-900` (dark), `bg-gray-50` (light)

## 📏 Spacing & Layout Rules

### Padding (USE TAILWIND SCALE)
- Small: `p-2` or `p-3`
- Medium: `p-4` (default for most)
- Large: `p-6` (default for cards)
- Extra: `p-8`

### Border Radius
- Buttons/Inputs: `rounded-lg`
- Cards/Panels: `rounded-xl` (default)
- Small elements: `rounded`

### NEVER USE
- ❌ Custom padding like `padding: 12px`
- ❌ Custom colors like `#3498db`
- ❌ Inline styles when component exists
- ❌ `yellow` - use `amber`
- ❌ `red` for errors - use `rose`
- ❌ `cyan` - use `blue`
- ❌ Borders on Alert components

## 🛡️ Enforcement Checklist for AI

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

## 🔴 AI VIOLATIONS TO AVOID

These will break design consistency:

1. **Creating inline button styles**
   ```tsx
   // ❌ WRONG
   <button className="px-4 py-2 bg-indigo-600...">
   
   // ✅ CORRECT
   <Button variant="primary">
   ```

2. **Using wrong colors**
   ```tsx
   // ❌ WRONG
   <div className="bg-yellow-500">  // or bg-red-500 for errors
   
   // ✅ CORRECT
   <div className="bg-amber-500">   // or bg-rose-500 for errors
   ```

3. **Adding borders to alerts**
   ```tsx
   // ❌ WRONG
   <div className="border border-yellow-200">
   
   // ✅ CORRECT
   <Alert intent="warning">  // No border!
   ```

4. **Creating new patterns without updating theme page**
   ```tsx
   // ❌ WRONG - Create component in page file
   
   // ✅ CORRECT - Add to theme page first, then use everywhere
   ```

## 📚 Reference Hierarchy

When in doubt, check in this order:
1. `/src/app/theme/page.tsx` - Visual examples
2. `/docs/patterns/DESIGN-PATTERNS.md` - Written rules
3. `/src/components/ui/` - Component implementations
4. This file - AI-specific enforcement

## 🚀 Quick Reference for Common Tasks

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

## ⚠️ REMEMBER

- **Theme page is law** - If it's not there, don't use it
- **Ask before changing visuals** - User permission required
- **Alerts have no borders** - This is final
- **Use exact color names** - amber not yellow, rose not red
- **Check shared components first** - Don't reinvent

---
*This document is mandatory reading for all AI assistants working on TrendDojo UI*