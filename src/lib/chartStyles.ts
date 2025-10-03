/**
 * Centralized Chart Styling System
 *
 * This file defines all chart styles and colors in one place.
 * Changes here will automatically update all charts across the app.
 */

// ============================================
// CHART COLOR PALETTE
// ============================================

export const chartColors = {
  // Buy/Long colors (teal - one step less saturated)
  buy: {
    light: '#14b8a6',  // teal-500 - one step less saturated for light mode
    dark: '#14b8a6',   // teal-500 - one step less saturated for dark mode
  },

  // Sell/Short colors (rose - one step less saturated)
  sell: {
    light: '#f43f5e',  // rose-500 - one step less saturated for light mode
    dark: '#f43f5e',   // rose-500 - one step less saturated for dark mode
  },

  // Neutral/baseline color
  neutral: {
    light: '#64748b',  // slate-500
    dark: '#94a3b8',   // slate-400
  },

  // Volume colors (with opacity)
  volume: {
    up: '#14b8a666',   // teal-500 with 40% opacity
    down: '#f43f5e66', // rose-500 with 40% opacity
  },
} as const;

// ============================================
// CHART THEME CONFIGURATION
// ============================================

export const chartTheme = {
  // Background colors
  background: {
    light: 'rgba(15, 23, 42, 0.03)',    // Dark tint in light mode
    dark: 'rgba(148, 163, 184, 0.03)',  // Light tint in dark mode
  },

  // Grid colors
  grid: {
    light: 'transparent',
    dark: 'transparent',
  },

  // Border colors
  border: {
    light: '#e2e8f0',  // slate-200
    dark: '#334155',   // slate-700
  },

  // Crosshair colors
  crosshair: {
    light: '#94a3b8',  // slate-400
    dark: '#64748b',   // slate-500
  },
} as const;

// ============================================
// CHART SERIES CONFIGURATION
// ============================================

/**
 * Get candlestick series configuration
 */
export function getCandlestickConfig(isDarkMode: boolean) {
  const buyColor = isDarkMode ? chartColors.buy.dark : chartColors.buy.light;
  const sellColor = isDarkMode ? chartColors.sell.dark : chartColors.sell.light;

  return {
    upColor: buyColor,
    downColor: sellColor,
    borderUpColor: buyColor,
    borderDownColor: sellColor,
    wickUpColor: buyColor,
    wickDownColor: sellColor,
  };
}

/**
 * Get line series configuration
 */
export function getLineSeriesConfig(isDarkMode: boolean, type: 'buy' | 'sell' | 'neutral' = 'neutral') {
  let color: string;

  if (type === 'buy') {
    color = isDarkMode ? chartColors.buy.dark : chartColors.buy.light;
  } else if (type === 'sell') {
    color = isDarkMode ? chartColors.sell.dark : chartColors.sell.light;
  } else {
    color = isDarkMode ? chartColors.neutral.dark : chartColors.neutral.light;
  }

  return {
    color,
    lineWidth: 2,
  };
}

/**
 * Get histogram (volume) series configuration
 */
export function getHistogramConfig(isDarkMode: boolean) {
  return {
    upColor: chartColors.volume.up,
    downColor: chartColors.volume.down,
    priceFormat: {
      type: 'volume',
    },
    priceScaleId: '',
  };
}

/**
 * Get chart layout configuration
 */
export function getChartLayout(isDarkMode: boolean, textColor: string) {
  return {
    background: {
      color: isDarkMode ? chartTheme.background.dark : chartTheme.background.light,
    },
    textColor: textColor,
  };
}

/**
 * Get chart grid configuration
 */
export function getChartGrid(isDarkMode: boolean) {
  return {
    vertLines: {
      color: isDarkMode ? chartTheme.grid.dark : chartTheme.grid.light,
    },
    horzLines: {
      color: isDarkMode ? chartTheme.grid.dark : chartTheme.grid.light,
    },
  };
}

/**
 * Get crosshair configuration
 */
export function getCrosshairConfig(isDarkMode: boolean) {
  const crosshairColor = isDarkMode ? chartTheme.crosshair.dark : chartTheme.crosshair.light;

  return {
    mode: 1, // CrosshairMode.Normal
    vertLine: {
      color: crosshairColor,
      width: 1,
      style: 0, // LineStyle.Solid
      labelBackgroundColor: crosshairColor,
    },
    horzLine: {
      color: crosshairColor,
      width: 1,
      style: 0, // LineStyle.Solid
      labelBackgroundColor: crosshairColor,
    },
  };
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Get complete chart configuration
 * Combines all configuration helpers into a single object
 */
export function getChartConfig(isDarkMode: boolean, textColor: string) {
  return {
    layout: getChartLayout(isDarkMode, textColor),
    grid: getChartGrid(isDarkMode),
    crosshair: getCrosshairConfig(isDarkMode),
    rightPriceScale: {
      borderColor: isDarkMode ? chartTheme.border.dark : chartTheme.border.light,
    },
    timeScale: {
      borderColor: isDarkMode ? chartTheme.border.dark : chartTheme.border.light,
      timeVisible: true,
      secondsVisible: false,
      // Candle width constraints
      barSpacing: 12,        // Default spacing between candles
      minBarSpacing: 6,      // Minimum spacing (prevents overcrowding)
      maxBarSpacing: 16,     // Maximum spacing (prevents spreading too far)
      rightOffset: 5,        // Space on the right side
      fixLeftEdge: false,
      fixRightEdge: false,
    },
  };
}
