/**
 * Spinner Styles - Living Theme System
 * Universal loading spinner component styles
 */

export const spinnerStyles = {
  // Base spinner container
  container: "flex flex-col items-center justify-center",

  // Spinner SVG sizes
  size: {
    xs: "w-4 h-4",
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-12 h-12",
    xl: "w-16 h-16",
  },

  // Spinner colors (semantic)
  color: {
    primary: "text-indigo-500",
    secondary: "text-gray-500 dark:text-gray-400",
    success: "text-success",
    warning: "text-warning",
    danger: "text-danger",
    white: "text-white",
  },

  // Spacing below spinner (when text follows)
  spacing: {
    none: "",
    sm: "mb-2",
    md: "mb-3",
    lg: "mb-4",
  },

  // Text styles
  text: {
    base: "text-sm text-gray-600 dark:text-gray-400",
    muted: "text-xs text-gray-500 dark:text-gray-500",
  },

  // Animation
  animation: "animate-spin",
} as const;

export type SpinnerSize = keyof typeof spinnerStyles.size;
export type SpinnerColor = keyof typeof spinnerStyles.color;
export type SpinnerSpacing = keyof typeof spinnerStyles.spacing;
