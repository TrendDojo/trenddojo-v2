// TrendDojo Color Theme
// Based on the homepage design with deep navy background and purple accent colors

export const trendDojoTheme = {
  // Primary Brand Colors
  primary: {
    50: '#f0f4ff',
    100: '#e0e7ff', 
    200: '#c7d2fe',
    300: '#a5b4fc',
    400: '#818cf8',
    500: '#6366f1', // Primary purple-blue
    600: '#5b21b6', // Deep purple (main CTA button)
    700: '#4c1d95',
    800: '#3730a3',
    900: '#312e81',
    950: '#1e1b4b',
  },

  // Background Colors - Deep Navy Theme
  background: {
    primary: '#0f172a',   // slate-950 - main background
    secondary: '#1e293b', // slate-800 - card backgrounds
    tertiary: '#334155',  // slate-600 - borders/dividers
    overlay: '#0f172a99', // Background with transparency
  },

  // Text Colors
  text: {
    primary: '#ffffff',     // Main headings
    secondary: '#e2e8f0',   // Body text, descriptions
    tertiary: '#94a3b8',    // Muted text, labels
    accent: '#8b5cf6',      // Purple accent text ("Discipline")
  },

  // Purple Gradient System (for shapes/accents)
  purple: {
    50: '#faf5ff',
    100: '#f3e8ff',
    200: '#e9d5ff', 
    300: '#d8b4fe',
    400: '#c084fc',
    500: '#a855f7',  // Base purple
    600: '#9333ea',  // Deeper purple
    700: '#7c3aed',  // Primary purple accent
    800: '#6b21a8',
    900: '#581c87',
    950: '#3b0764',
  },

  // Status Colors
  status: {
    success: '#10b981', // Green for paper trading
    warning: '#f59e0b', // Amber for warnings
    error: '#ef4444',   // Red for real money alerts
    info: '#3b82f6',    // Blue for information
  },

  // Card/Surface Colors
  surface: {
    card: '#1e293b99',        // Semi-transparent cards
    cardHover: '#334155',     // Card hover state
    border: '#475569',        // Border color
    borderLight: '#64748b33', // Light borders
  },

  // Animation/Interactive Colors
  interactive: {
    buttonPrimary: '#8b5cf6',      // Primary CTA button
    buttonPrimaryHover: '#7c3aed', // Primary button hover
    buttonSecondary: 'transparent', // Secondary button (View Demo)
    buttonSecondaryBorder: '#e2e8f033', // Secondary button border
    buttonSecondaryHover: '#334155', // Secondary button hover
  },

  // Environment Indicators
  environment: {
    development: '#f59e0b',  // Amber
    staging: '#3b82f6',      // Blue  
    production: '#ef4444',   // Red (should rarely be seen)
    paperTrading: '#10b981', // Green
  },

  // Shadows
  shadows: {
    card: '0 4px 6px -1px rgb(0 0 0 / 0.3)',
    cardLarge: '0 10px 15px -3px rgb(0 0 0 / 0.3)',
    text: '0 2px 4px rgb(0 0 0 / 0.5)', // Text drop shadows
  }
} as const

// Tailwind CSS utility classes based on theme
export const themeClasses = {
  // Backgrounds
  bgPrimary: 'bg-slate-950',
  bgSecondary: 'bg-slate-800/60', 
  bgCard: 'bg-slate-800/40',
  bgOverlay: 'bg-slate-900/70',

  // Text
  textPrimary: 'text-white',
  textSecondary: 'text-slate-200', 
  textMuted: 'text-slate-400',
  textAccent: 'text-purple-400',

  // Borders
  borderPrimary: 'border-slate-600',
  borderLight: 'border-slate-500/20',

  // Buttons
  btnPrimary: 'bg-purple-600 hover:bg-purple-700 text-white',
  btnSecondary: 'border border-slate-300/20 hover:border-slate-300/40 text-white hover:bg-slate-700/50',

  // Cards
  card: 'bg-slate-800/40 backdrop-blur-sm border border-slate-600/20',
  cardHover: 'hover:bg-slate-700/50',

  // Shadows
  shadowCard: 'shadow-lg shadow-black/20',
  shadowText: 'drop-shadow-lg',
} as const

// CSS Custom Properties for dynamic theming (simplified for build stability)
export const cssVariables = `
:root {
  --color-bg-primary: #0f172a;
  --color-bg-secondary: #1e293b;
  --color-text-primary: #ffffff;
  --color-text-secondary: #e2e8f0;
  --color-accent: #8b5cf6;
  --color-purple-600: #9333ea;
  --color-purple-700: #7c3aed;
}
`;