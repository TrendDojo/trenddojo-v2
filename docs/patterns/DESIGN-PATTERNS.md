# Design Patterns - TrendDojo

*Quick reference for component selection and visual design decisions*
*Last Updated: 2025-09-15*

## Component Selection Rules

### Before Creating Any Component
1. Run `ls components/ui/` - check what exists
2. Similar component exists? Extend it, don't duplicate
3. Creating new? Add to this doc immediately

### Core UI Components (Updated Design System)

#### Shared Components (`/src/components/ui/`)
**ALWAYS USE THESE SHARED COMPONENTS - DO NOT CREATE INLINE STYLES**

- **Panels/Cards**: `<Card>` from `/components/ui/Panel.tsx`
  - Default rounded: `rounded-xl`
  - Default padding: `p-6` (use `padding` prop to override)
  - Use for all content containers
  
- **Buttons**: `<Button>` from `/components/ui/Button.tsx`
  - Variants: `primary`, `secondary`, `ghost`, `danger`, `success`
  - Sizes: `sm`, `md`, `lg`
  - Props: `loading`, `fullWidth`, `disabled`
  - NEVER use inline button styles
  
- **Alerts**: `<Alert>` from `/components/ui/Panel.tsx`
  - Intents: `info`, `warning`, `error`, `success`
  - Includes icon by default (use `icon={false}` to hide)
  - Use for all notification/message boxes
  
- **Forms**: Components from `/components/ui/FormField.tsx`
  - `<FormField>` - Wrapper with label, helper, error
  - `<Input>` - Text inputs with error state
  - `<Textarea>` - Multi-line text
  - `<Select>` - Dropdowns
  - `<Checkbox>` - Checkbox with label
  - `<Radio>` - Radio button with label
  
- **Modals**: `<Modal>` from `/components/ui/Modal.tsx`
  - Sizes: `sm`, `md`, `lg`, `xl`, `full`
  - Built-in header, footer, close button
  - `<ConfirmModal>` for confirmations
  - `<ModalFooter>` for standard button layout

#### Component Rules
1. **Check theme page first**: `/app/theme/page.tsx` is the source of truth
2. **Never duplicate**: If a similar component exists, extend it
3. **Consistent spacing**: Use Tailwind spacing scale (p-2, p-4, p-6, p-8)
4. **Consistent rounding**: Default to `rounded-xl` for cards, `rounded-lg` for buttons

## Color Hierarchy

### Brand Colors - Updated Standardized System

#### Primary Colors
- **Primary (Indigo-600)**: Main brand color, primary actions, CTAs
- **Teal-500**: Positive values, gains, upward trends, profits
- **Purple-600**: Negative values, losses, downward trends
- **Amber-500**: Warnings, alerts (NOT yellow)
- **Rose-500**: Danger, errors, destructive actions
- **Emerald-500**: Success states, confirmations
- **Blue-500**: Information, help (NOT cyan)

#### Background Colors
- **Dark Mode Panels**: `bg-slate-800/50` (default), `bg-slate-800/30` (subtle)
- **Light Mode Panels**: `bg-white` (default), `bg-gray-50` (subtle)
- **Page Background**: `bg-slate-900` (dark), `bg-gray-50` (light)

### Critical Rules
- **TEAL = PROFIT, PURPLE = LOSS** (TrendDojo convention)
- **NEVER** mix teal/purple with non-financial elements
- **CONSISTENCY**: Use amber (not yellow) for warnings, rose (not red) for errors
- **ALWAYS** include dark mode variants
- All financial data must use semantic color classes

### Text Colors - Semantic System

#### Text Hierarchy (Neutral)
- **Primary**: `text-slate-900 dark:text-slate-100` - Main content, headings
- **Secondary**: `text-slate-600 dark:text-slate-400` - Labels, descriptions  
- **Muted**: `text-slate-400 dark:text-slate-600` - Disabled, subtle text

#### Financial Status Colors
- **Profit**: `text-green-600 dark:text-green-400` - Positive P&L, gains
- **Loss**: `text-red-600 dark:text-red-400` - Negative P&L, losses
- **Neutral**: `text-slate-600 dark:text-slate-400` - Break-even, unchanged
- **Warning**: `text-amber-600 dark:text-amber-400` - Risk alerts, cautions
- **Info**: `text-blue-600 dark:text-blue-400` - Analysis, information

#### Links
- **Primary**: `text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300`

## Trading-Specific Patterns

### Financial Data Display
- **Always use monospace fonts** for numbers: `font-mono`
- **Consistent decimal places**: 2 for currency, 4 for percentages
- **Color coding**: Green for positive, red for negative, gray for neutral
- **Prefix symbols**: + for gains, - for losses, % for percentages

### Risk Indicators
- **Position Size**: Display as percentage of portfolio
- **Risk Level**: Color-coded (green=low, amber=medium, red=high)
- **Stop Loss**: Always visible when position is open

### Performance Metrics
- **P&L**: Show both absolute and percentage returns
- **Win Rate**: Percentage with context (X wins / Y total trades)
- **Drawdown**: Maximum adverse excursion highlighted

## Naming Conventions

### Components
- PascalCase for components: `PositionCard`, `TradingChart`
- Trading-specific prefixes: `Position*`, `Trade*`, `Portfolio*`
- Group by feature: `/components/trading/`, `/components/portfolio/`

### Files
- kebab-case for files: `position-card.tsx`, `trading-chart.tsx`
- No version numbers in filenames (use git)
- Test then replace when refactoring

## Dark Mode

### Requirements
- Trading platforms typically use dark themes
- Every background needs dark mode variant
- Financial data must be readable in both modes
- Charts and visualizations optimized for dark theme

### Trading-Specific Dark Mode
- Dark backgrounds reduce eye strain during long trading sessions
- Green/red contrast must be maintained in dark mode
- Chart backgrounds: dark gray/black, not pure black

## Design System Enforcement

### Implementation Process
1. **Audit Phase**: Review all pages for inconsistencies
2. **Component Creation**: Build shared UI components
3. **Migration**: Update all pages to use shared components
4. **Documentation**: Update theme page as source of truth
5. **Enforcement**: All new features must use shared components

### Maintenance Rules
- **Theme page (`/app/theme/page.tsx`)** is the source of truth
- Check theme page before creating any new UI element
- If not on theme page, don't use it
- If needed but missing, add to theme page first
- Regular audits to catch drift (monthly)

## Usage History
<!-- Add entries when this doc contributes to completing a task -->
<!-- Format: - YYYY-MM-DD: Used for WB-XXXX-XX-XXX (Brief description) -->
- 2025-09-05: Created for documentation harmonization (Trading-specific design patterns)
- 2025-09-15: Updated with standardized design system and shared components (WB-2025-09-15-002)