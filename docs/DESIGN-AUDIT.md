# TrendDojo Design System Audit

*Date: 2025-09-15*

## 🔍 Current State Analysis

### ❌ Inconsistencies Found

#### 1. **Panel/Card Styles**

**Theme Page (SOURCE OF TRUTH):**
- Uses `<Card>` component from `/components/ui/Panel.tsx`
- Style: `bg-slate-800/50 dark:bg-slate-800/50 bg-white/80 backdrop-blur-sm`
- Rounded: `rounded-xl`
- Padding: `p-6`

**Dashboard Page:**
- Inline styles: `dark:bg-slate-800/50 bg-gray-50`
- Different light mode background
- Uses `rounded-lg` instead of `rounded-xl`
- Inconsistent padding (`p-4` vs `p-6`)

**Brokers Page:**
- Style: `dark:bg-slate-800/50 bg-white` with border
- Has `border dark:border-slate-700 border-gray-200`
- Uses `rounded-lg`
- Has hover effect: `hover:shadow-lg`

**Settings Page:**
- Style: `dark:bg-slate-800/50 bg-white`
- Has border like brokers page
- Uses `rounded-lg`

#### 2. **Alert/Message Boxes**

**Current Variations:**
- Brokers page: `dark:bg-yellow-900/20 bg-yellow-50` with border
- IB Modal: Same yellow style for warnings
- Brokers info: `dark:bg-blue-900/20 bg-blue-50` with border
- No consistent component being used

**Should Use:**
- `<Alert>` component from Panel.tsx with intent prop

#### 3. **Button Styles**

**Primary Buttons:**
- Theme: Uses `<Button>` component
- Brokers: Inline `bg-indigo-600 text-white rounded hover:bg-indigo-700`
- Dashboard: Mix of inline styles

**Secondary Buttons:**
- Various implementations: `dark:bg-slate-700 bg-gray-200`
- No consistent hover states

#### 4. **Form Inputs**

**Different styles across:**
- Settings page
- IB Connection Modal
- Screener filters

No shared `<FormField>` component

#### 5. **Color Usage**

**Positive/Negative:**
- ✅ Consistent: `teal-500` for positive, `purple-500/600` for negative

**Status Colors:**
- Warning: Sometimes `yellow`, sometimes `amber`
- Info: Sometimes `blue`, sometimes `cyan`
- Need standardization

## 📋 Required Actions

### 1. Create Missing Shared Components

```typescript
// components/ui/Alert.tsx
export function Alert({ 
  intent: 'info' | 'warning' | 'error' | 'success',
  children 
}) { ... }

// components/ui/Button.tsx  
export function Button({
  variant: 'primary' | 'secondary' | 'danger' | 'ghost',
  size: 'sm' | 'md' | 'lg',
  children
}) { ... }

// components/ui/FormField.tsx
export function FormField({
  label,
  error,
  children
}) { ... }

// components/ui/Modal.tsx
export function Modal({
  isOpen,
  onClose,
  title,
  children
}) { ... }
```

### 2. Refactor Existing Pages

#### Dashboard
- Replace inline panel styles with `<Card>`
- Use `<Button>` for all buttons
- Consistent spacing

#### Brokers
- Use `<Card>` for broker cards
- Use `<Alert>` for warning/info boxes
- Use `<Button>` for all actions

#### Settings
- Use `<Card>` for sections
- Use `<FormField>` for all inputs
- Consistent layout

#### Screener
- Use `<Card>` for filter sections
- Standardize dropdown styles

### 3. Update Theme Page

Add examples of:
- All alert variants
- All button variants  
- Form field states
- Modal example
- Loading states
- Empty states

## 🎨 Design System Rules

### Spacing Scale
```
p-2 (0.5rem)
p-3 (0.75rem) 
p-4 (1rem) - default small
p-6 (1.5rem) - default medium
p-8 (2rem) - large
```

### Border Radius
```
rounded (0.25rem) - small elements
rounded-lg (0.5rem) - medium elements
rounded-xl (0.75rem) - cards/panels (DEFAULT)
```

### Colors
```
Primary: indigo-600
Success: emerald-500
Warning: amber-500 (not yellow)
Danger: rose-500
Info: blue-500 (not cyan)
Positive: teal-500
Negative: purple-600
```

### Shadows
- Cards: No shadow by default
- Hover: `hover:shadow-lg` only on interactive cards
- Modals: `shadow-xl`

### Backgrounds
```
Panels: bg-slate-800/50 dark, bg-white light
Subtle: bg-slate-800/30 dark, bg-gray-50 light
Page: bg-slate-900 dark, bg-gray-50 light
```

## 🚀 Implementation Plan

1. **Phase 1: Create Components** (NOW)
   - [ ] Update Alert component
   - [ ] Enhance Button component
   - [ ] Create FormField component
   - [ ] Create Modal wrapper

2. **Phase 2: Update Theme Page** (NOW)
   - [ ] Add all component examples
   - [ ] Document usage patterns
   - [ ] Add copy-paste examples

3. **Phase 3: Refactor Pages** (NEXT)
   - [ ] Dashboard
   - [ ] Brokers
   - [ ] Settings
   - [ ] Screener

4. **Phase 4: Document** (NEXT)
   - [ ] Create DESIGN-PATTERNS.md
   - [ ] Add to contributing guide
   - [ ] Component usage examples

## 📊 Success Metrics

- Zero inline `bg-*` classes for common patterns
- All panels use `<Card>` or `<Panel>`
- All alerts use `<Alert>`
- All buttons use `<Button>`
- Theme page accurately represents entire app
- New components automatically follow design system