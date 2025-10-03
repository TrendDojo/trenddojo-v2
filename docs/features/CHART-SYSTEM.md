# TrendDojo Chart System Documentation

*Last updated: 2025-01-25*

## Overview

TrendDojo uses a centralized theming system for all charts across the application, ensuring consistent visual design and maintainability. The system is built on TradingView's lightweight-charts library and provides a single source of truth for all chart styling.

## Architecture

### Core Components

1. **Theme System** (`/src/lib/chartStyles.ts`)
   - Central repository for all chart colors and styles
   - Exports configuration functions for different chart types
   - Maintains consistency across light/dark modes

2. **Theme Showcase** (`/src/app/dev/theme/page.tsx`)
   - **Design source of truth** for all charts in the application
   - Live examples showing exactly how charts should look
   - Interactive testing environment for theme changes
   - Charts tab displays both color reference and working examples

3. **Chart Components** (`/src/components/charts/`)
   - `CDNChart.tsx` - Main production chart component
   - `LocalChart.tsx` - Alternative implementation using local imports
   - `PriceChart.tsx` - Trading-specific chart with position lines
   - `WorkingChart.tsx` - Demo chart with chart type toggle
   - `ChartContent.tsx` - Simple wrapper component

## Color System

### Current Palette (v2.0 - Less Saturated)

```typescript
chartColors = {
  // Buy/Long colors (teal-500)
  buy: {
    light: '#14b8a6',  // Medium saturated teal
    dark: '#14b8a6',   // Same for both modes currently
  },

  // Sell/Short colors (rose-500)
  sell: {
    light: '#f43f5e',  // Medium saturated rose
    dark: '#f43f5e',   // Same for both modes currently
  },

  // Neutral colors
  neutral: {
    light: '#64748b',  // slate-500
    dark: '#94a3b8',   // slate-400
  },

  // Volume colors (40% opacity)
  volume: {
    up: '#14b8a666',   // teal-500 with 40% opacity
    down: '#f43f5e66', // rose-500 with 40% opacity
  },
}
```

### Color Usage Guidelines

- **Green/Teal (Buy/Long)**: Used for upward price movements, bullish indicators, long positions
- **Red/Rose (Sell/Short)**: Used for downward price movements, bearish indicators, short positions
- **Neutral (Slate)**: Used for baselines, neutral indicators, and non-directional data
- **Volume**: Always displayed with 40% opacity to avoid overwhelming price data

## Implementation Details

### Library Setup

**Package**: `lightweight-charts` v5.0.8

**Import Method**: Dynamic import to avoid SSR issues and CSP conflicts
```javascript
const { createChart } = await import('lightweight-charts');
```

**Note**: CDN loading (`unpkg.com`) is blocked by Content Security Policy in production. Always use local package imports.

### Configuration Functions

The theme system provides helper functions for consistent chart configuration:

```typescript
// Get candlestick series configuration
getCandlestickConfig(isDarkMode: boolean)

// Get line series configuration
getLineSeriesConfig(isDarkMode: boolean, type: 'buy' | 'sell' | 'neutral')

// Get histogram (volume) configuration
getHistogramConfig(isDarkMode: boolean)

// Get complete chart configuration
getChartConfig(isDarkMode: boolean, textColor: string)

// Individual component configs
getChartLayout(isDarkMode: boolean, textColor: string)
getChartGrid(isDarkMode: boolean)
getCrosshairConfig(isDarkMode: boolean)
```

### Usage Example

```typescript
import { chartColors, getCandlestickConfig } from '@/lib/chartStyles';

// In your component
const isDarkMode = document.documentElement.classList.contains('dark');
const config = getCandlestickConfig(isDarkMode);

const chart = createChart(containerRef.current, {
  width: containerRef.current.clientWidth,
  height: 400,
  layout: {
    background: { type: 0, color: 'transparent' },
    textColor: isDarkMode ? '#9ca3af' : '#4b5563',
  },
  // ... other config
});

const candleSeries = chart.addCandlestickSeries(config);
```

## Theme Development Workflow

### 1. Testing Changes

All chart theme changes should be tested in the theme showcase:

1. Navigate to `/dev/theme`
2. Click on the "Charts" tab
3. Verify changes in both the color reference and live chart examples
4. Test in both light and dark modes

### 2. Making Theme Updates

1. Edit `/src/lib/chartStyles.ts` to update colors or configurations
2. Changes automatically propagate to all chart components
3. Verify in theme showcase before deploying
4. Document significant changes in this file

### 3. Adding New Chart Types

1. Create configuration function in `chartStyles.ts`
2. Add example to theme showcase page
3. Implement in chart component
4. Update this documentation

## Component Integration

### Standard Chart Implementation

All chart components should:

1. Import theme functions from `@/lib/chartStyles`
2. Detect dark mode using `document.documentElement.classList.contains('dark')`
3. Apply theme configuration to chart series
4. Handle cleanup on unmount

### Volume Integration

Volume should always be displayed as a histogram with:
- Separate price scale (`priceScaleId: ''`)
- Scale margins to prevent overlap (`top: 0.8, bottom: 0`)
- Color based on price direction (up = teal, down = rose)
- 40% opacity for visual hierarchy

## Known Issues & Solutions

### Issue: CSP Blocking CDN Scripts
**Problem**: Content Security Policy blocks loading charts from `unpkg.com`
**Solution**: Use dynamic imports of local package instead of CDN

### Issue: SSR Compatibility
**Problem**: lightweight-charts doesn't support server-side rendering
**Solution**: Use dynamic imports with `"use client"` directive

### Issue: Chart Not Displaying
**Debugging Steps**:
1. Check browser console for errors
2. Verify container has width/height
3. Ensure data format matches lightweight-charts requirements
4. Check that theme configuration is applied

## Version History

- **v2.0** (2025-01-25): Reduced color saturation (teal-700→500, rose-700→500)
- **v1.0** (2025-01-24): Initial centralized theme system

## Best Practices

1. **Always use theme system** - Never hardcode colors in components
2. **Test in theme showcase** - Verify all changes in `/dev/theme` Charts tab
3. **Maintain consistency** - All charts should look identical given same data
4. **Document changes** - Update this file when making significant theme updates
5. **Single source of truth** - Theme showcase is the design reference for all charts

## Related Files

- `/src/lib/chartStyles.ts` - Theme system implementation
- `/src/app/dev/theme/page.tsx` - Theme showcase (design source of truth)
- `/src/components/charts/` - Chart component implementations
- `/docs/patterns/DESIGN-PATTERNS.md` - Overall design patterns
- `/docs/API-SPECIFICATION.md` - Market data API documentation