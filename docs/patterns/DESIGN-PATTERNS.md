# Design Patterns - TrendDojo

*Quick reference for component selection and visual design decisions*
*Last Updated: 2025-09-05*

## Component Selection Rules

### Before Creating Any Component
1. Run `ls components/ui/` - check what exists
2. Similar component exists? Extend it, don't duplicate
3. Creating new? Add to this doc immediately

### Core UI Components
- **Modals**: Use Shadcn/ui Dialog components for overlays
- **Forms**: Use React Hook Form with tRPC integration
- **Tables**: Use Shadcn/ui Table with built-in sorting/filtering
- **Buttons**: Use Shadcn/ui Button component with variants
- **Inputs**: Use Shadcn/ui form components (Input, Select, TextArea)

## Color Hierarchy

### Brand Colors - Trading Theme
- **Green (#22c55e)**: Profitable trades, positive P&L, buy signals
- **Red (#ef4444)**: Losing trades, negative P&L, sell signals
- **Blue (#3b82f6)**: Information, neutral analysis, settings
- **Gold (#f59e0b)**: Premium features, alerts, important metrics
- **Gray**: Secondary UI elements, disabled states

### Critical Rules
- **GREEN = PROFIT, RED = LOSS** (universal trading convention)
- **NEVER** use red/green for non-financial elements
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

## Usage History
<!-- Add entries when this doc contributes to completing a task -->
<!-- Format: - YYYY-MM-DD: Used for WB-XXXX-XX-XXX (Brief description) -->
- 2025-09-05: Created for documentation harmonization (Trading-specific design patterns)