/**
 * Centralized Button Styling System
 *
 * This file defines all button styles in one place.
 * Changes here will automatically update all buttons across the app.
 *
 * Primary buttons use indigo (indigo-600/700) as the main CTA color.
 */

// ============================================
// BUTTON STYLES
// ============================================

export const buttonStyles = {
  // Base styles for all buttons
  base: "font-semibold transition-all duration-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-900 focus:ring-offset-gray-50 disabled:opacity-50 disabled:cursor-not-allowed",

  // Variant styles
  variant: {
    primary: "bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white focus:ring-indigo-500",
    secondary: "dark:bg-transparent bg-transparent border dark:border-slate-700 border-gray-300 dark:hover:bg-slate-800 hover:bg-gray-100 dark:text-white text-gray-900 focus:ring-slate-500",
    ghost: "bg-transparent dark:hover:bg-slate-700/30 hover:bg-gray-100 dark:text-white text-gray-900 focus:ring-slate-500",
    danger: "bg-danger hover:opacity-90 text-white focus:ring-red-500",
    success: "bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-400 text-white focus:ring-teal-500",
  },

  // Size styles
  size: {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3",
  },

  // State styles
  fullWidth: "w-full",
  loading: "cursor-wait",

  // Icon button styles
  iconOnly: {
    sm: "p-2",
    md: "p-3",
  },

  // Loading spinner
  loadingSpinner: "animate-spin -ml-1 mr-3 h-5 w-5 text-current",
  loadingContainer: "flex items-center justify-center",
} as const;

// ============================================
// ICON BUTTON STYLES
// ============================================

export const iconButtonStyles = {
  // Base for icon-only buttons
  base: "transition-all duration-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-900 focus:ring-offset-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center",

  // Variants for icon buttons
  variant: {
    primary: buttonStyles.variant.primary,
    secondary: buttonStyles.variant.secondary,
    ghost: buttonStyles.variant.ghost,
    danger: buttonStyles.variant.danger,
    success: buttonStyles.variant.success,
  },

  // Size for icon buttons
  size: {
    sm: "p-1.5 w-8 h-8",
    md: "p-2 w-10 h-10",
    lg: "p-3 w-12 h-12",
  },
} as const;

// ============================================
// BUTTON GROUP STYLES
// ============================================

export const buttonGroupStyles = {
  // Container for button groups
  container: "flex",

  // Orientation
  horizontal: "flex-row",
  vertical: "flex-col",

  // Spacing
  gap: {
    none: "",
    sm: "gap-1",
    md: "gap-2",
    lg: "gap-4",
  },

  // Connected buttons (no gap, shared borders)
  connected: {
    container: "flex -space-x-px",
    firstButton: "rounded-r-none",
    middleButton: "rounded-none",
    lastButton: "rounded-l-none",
  },
} as const;

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get button classes
 */
export function getButtonClasses(
  variant: keyof typeof buttonStyles.variant = 'primary',
  size: keyof typeof buttonStyles.size = 'md',
  options?: {
    fullWidth?: boolean;
    loading?: boolean;
    className?: string;
  }
) {
  const classes: string[] = [
    buttonStyles.base,
    buttonStyles.variant[variant],
    buttonStyles.size[size],
  ];

  if (options?.fullWidth) classes.push(buttonStyles.fullWidth);
  if (options?.loading) classes.push(buttonStyles.loading);
  if (options?.className) classes.push(options.className);

  return classes.join(' ');
}

/**
 * Get icon button classes
 */
export function getIconButtonClasses(
  variant: keyof typeof iconButtonStyles.variant = 'primary',
  size: keyof typeof iconButtonStyles.size = 'md',
  options?: {
    className?: string;
  }
) {
  const classes: string[] = [
    iconButtonStyles.base,
    iconButtonStyles.variant[variant],
    iconButtonStyles.size[size],
  ];

  if (options?.className) classes.push(options.className);

  return classes.join(' ');
}

/**
 * Get button group container classes
 */
export function getButtonGroupClasses(
  orientation: 'horizontal' | 'vertical' = 'horizontal',
  gap: keyof typeof buttonGroupStyles.gap = 'md'
) {
  return [
    buttonGroupStyles.container,
    orientation === 'horizontal' ? buttonGroupStyles.horizontal : buttonGroupStyles.vertical,
    buttonGroupStyles.gap[gap],
  ].join(' ');
}