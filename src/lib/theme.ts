/**
 * TrendDojo Theme Configuration
 * 
 * Centralized design tokens for consistent theming across the application.
 * Flat, modern design with subtle depth through opacity and blur effects.
 */

export const theme = {
  // Color palette with opacity variants
  colors: {
    // Base colors
    background: {
      primary: 'bg-slate-900',
      secondary: 'bg-slate-800',
      tertiary: 'bg-slate-700',
      
      // Flat panel backgrounds (with opacity)
      panel: 'bg-slate-800/50',
      panelSubtle: 'bg-slate-800/30',
      panelSolid: 'bg-slate-800',
      glass: 'bg-white/5',
    },
    
    // Semantic colors (flat, no borders)
    status: {
      info: 'bg-blue-900/30',
      success: 'bg-green-900/30',
      warning: 'bg-yellow-900/30',
      danger: 'bg-red-900/30',
    },
    
    // Text colors
    text: {
      primary: 'text-white',
      secondary: 'text-gray-300',
      muted: 'text-gray-400',
      inverse: 'text-slate-900',
    },
    
    // Interactive elements
    interactive: {
      primary: 'bg-blue-600 hover:bg-blue-700',
      primarySubtle: 'bg-blue-600/20 hover:bg-blue-600/30',
      secondary: 'bg-slate-600 hover:bg-slate-700',
      secondarySubtle: 'bg-slate-600/20 hover:bg-slate-600/30',
    },
  },
  
  // Spacing scale
  spacing: {
    xs: 'p-2',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
    xl: 'p-8',
    '2xl': 'p-10',
  },
  
  // Border radius (for flat design with subtle rounding)
  radius: {
    none: 'rounded-none',
    sm: 'rounded',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    '2xl': 'rounded-2xl',
    full: 'rounded-full',
  },
  
  // Effects for depth without borders
  effects: {
    // Backdrop blur for glass morphism
    blur: {
      sm: 'backdrop-blur-sm',
      md: 'backdrop-blur-md',
      lg: 'backdrop-blur-lg',
    },
    
    // Shadows (subtle, for depth)
    shadow: {
      none: '',
      sm: 'shadow-sm',
      md: 'shadow-md',
      lg: 'shadow-lg shadow-black/20',
      xl: 'shadow-xl shadow-black/25',
    },
    
    // Transitions
    transition: {
      fast: 'transition-all duration-150',
      base: 'transition-all duration-200',
      slow: 'transition-all duration-300',
    },
  },
  
  // Input styles (flat, no borders)
  inputs: {
    base: 'w-full px-4 py-3 dark:bg-slate-700/50 bg-gray-100 rounded-lg dark:text-white text-gray-900 dark:placeholder-gray-400 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50',
    solid: 'w-full px-4 py-3 dark:bg-slate-700 bg-white rounded-lg dark:text-white text-gray-900 dark:placeholder-gray-400 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 border dark:border-slate-700 border-gray-200',
    ghost: 'w-full px-4 py-3 bg-transparent rounded-lg dark:text-white text-gray-900 dark:placeholder-gray-400 placeholder-gray-500 focus:outline-none dark:focus:bg-slate-700/30 focus:bg-gray-100/50 focus:ring-2 focus:ring-blue-500 disabled:opacity-50',
  },
  
  // Button styles (flat design)
  buttons: {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-semibold transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed',
    secondary: 'dark:bg-slate-700/50 bg-gray-200 dark:hover:bg-slate-700 hover:bg-gray-300 dark:text-white text-gray-900 px-4 py-3 rounded-lg font-semibold transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed',
    ghost: 'bg-transparent dark:hover:bg-slate-700/30 hover:bg-gray-100 dark:text-white text-gray-900 px-4 py-3 rounded-lg font-semibold transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed',
    danger: 'bg-red-600/80 hover:bg-red-600 text-white px-4 py-3 rounded-lg font-semibold transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed',
  },
};

// Helper function to get consistent panel styles
export function getPanelClass(
  variant: 'default' | 'subtle' | 'solid' | 'glass' = 'default',
  options?: {
    padding?: keyof typeof theme.spacing;
    rounded?: keyof typeof theme.radius;
    hoverable?: boolean;
    clickable?: boolean;
  }
) {
  const variantMap = {
    default: theme.colors.background.panel,
    subtle: theme.colors.background.panelSubtle,
    solid: theme.colors.background.panelSolid,
    glass: `${theme.colors.background.glass} ${theme.effects.blur.md}`,
  };
  
  const classes = [
    variantMap[variant],
    theme.effects.transition.base,
    options?.padding ? theme.spacing[options.padding] : theme.spacing.md,
    options?.rounded ? theme.radius[options.rounded] : theme.radius.lg,
    options?.hoverable && 'hover:bg-slate-700/50',
    options?.clickable && 'cursor-pointer active:scale-[0.99]',
  ];
  
  return classes.filter(Boolean).join(' ');
}

// Semantic panel presets
export const panelPresets = {
  card: getPanelClass('default', { padding: 'lg', rounded: 'xl' }),
  section: getPanelClass('subtle', { padding: 'lg', rounded: 'lg' }),
  alert: getPanelClass('subtle', { padding: 'md', rounded: 'lg' }),
  glass: getPanelClass('glass', { padding: 'lg', rounded: 'xl', hoverable: true }),
  form: getPanelClass('default', { padding: 'xl', rounded: 'xl' }),
};