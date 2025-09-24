/**
 * Centralized Panel & Card Styling System
 *
 * This file defines all panel, card, and alert styles in one place.
 * Changes here will automatically update all panels across the app.
 */

import { cn } from "@/lib/utils";

// ============================================
// PANEL STYLES
// ============================================

export const panelStyles = {
  // Base styles
  base: "transition-all duration-200",

  // Visual variants
  variant: {
    default: "bg-transparent",
    subtle: "bg-transparent",
    ghost: "bg-transparent",
    solid: "border dark:border-slate-700 border-gray-200",
    glass: "bg-transparent",
  },

  // Semantic intents
  intent: {
    neutral: "",
    primary: "dark:bg-blue-900/30 bg-blue-50/70",
    success: "dark:bg-green-900/30 bg-green-50/70",
    warning: "dark:bg-yellow-900/30 bg-yellow-50/70",
    danger: "dark:bg-red-900/30 bg-red-50/70",
    info: "dark:bg-cyan-900/30 bg-cyan-50/70",
  },

  // Padding presets
  padding: {
    none: "",
    sm: "p-3",
    md: "p-4",
    lg: "p-6",
    xl: "p-8",
  },

  // Border radius
  rounded: {
    none: "",
    sm: "rounded",
    md: "rounded-md",
    lg: "rounded-lg",
    xl: "rounded-xl",
    full: "rounded-full",
  },

  // Interaction states
  hoverable: "dark:hover:bg-slate-700/50 hover:bg-gray-100",
  clickable: "cursor-pointer active:scale-[0.99]",
  disabled: "opacity-50 cursor-not-allowed",
} as const;

// ============================================
// CARD STYLES
// ============================================

export const cardStyles = {
  // Default card (most common usage)
  default: cn(
    panelStyles.base,
    panelStyles.variant.ghost,
    panelStyles.padding.none,
    panelStyles.rounded.none
  ),

  // Section card (for page sections)
  section: cn(
    panelStyles.base,
    panelStyles.variant.subtle,
    panelStyles.padding.lg,
    panelStyles.rounded.lg
  ),

  // Glass card (glassmorphic effect)
  glass: cn(
    panelStyles.base,
    panelStyles.variant.glass,
    panelStyles.padding.lg,
    panelStyles.rounded.xl,
    panelStyles.hoverable
  ),

  // Common card variations
  bordered: "border dark:border-slate-700 border-gray-200",
  elevated: "shadow-lg",
  gradient: "dark:bg-gradient-to-br dark:from-slate-800 dark:to-slate-900 bg-gradient-to-br from-gray-100 to-gray-200",
} as const;

// ============================================
// ALERT STYLES
// ============================================

export const alertStyles = {
  // Base alert styles
  base: "rounded-lg p-4 flex gap-3",

  // Alert backgrounds
  background: {
    info: "bg-alert-info",
    warning: "bg-alert-warning",
    error: "bg-alert-danger",
    success: "bg-alert-success",
  },

  // Icon styles
  icon: {
    base: "w-7 h-7 flex-shrink-0",
    colors: {
      info: "text-blue-600 dark:text-blue-400",
      warning: "text-warning",
      error: "text-danger",
      success: "text-success",
    },
  },

  // Content styles
  content: {
    container: "flex-1",
    title: "font-semibold mb-1",
    body: "text-sm",
    bodyWithTitle: "dark:text-gray-300 text-gray-700",
  },
} as const;

// ============================================
// MODAL STYLES
// ============================================

export const modalStyles = {
  // Overlay
  overlay: "fixed inset-0 bg-black/50 flex items-center justify-center z-50",

  // Modal container
  container: {
    base: "dark:bg-slate-800 bg-white rounded-lg w-full max-w-[90%]",
    sizes: {
      sm: "max-w-sm",
      md: "max-w-lg",
      lg: "max-w-2xl",
      xl: "max-w-4xl",
      full: "max-w-7xl",
    },
  },

  // Modal sections
  header: "p-6 border-b dark:border-slate-700 border-gray-200",
  body: "p-6",
  footer: "p-6 border-t dark:border-slate-700 border-gray-200",

  // Title and description
  title: "text-lg font-semibold dark:text-white text-gray-900",
  description: "text-sm dark:text-gray-400 text-gray-600 mt-1",
} as const;

// ============================================
// TOAST STYLES
// ============================================

export const toastStyles = {
  // Container
  container: "fixed bottom-4 right-4 z-50 animate-slide-in",

  // Toast item
  item: {
    base: "px-4 py-3 rounded-lg shadow-xl flex items-center gap-2",
    success: "bg-success text-white",
    error: "bg-danger text-white",
    warning: "bg-warning text-white",
    info: "bg-indigo-600 text-white",
  },

  // Icon
  icon: "w-5 h-5",
} as const;

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get panel classes
 */
export function getPanelClasses(
  variant: keyof typeof panelStyles.variant = 'default',
  options?: {
    intent?: keyof typeof panelStyles.intent;
    padding?: keyof typeof panelStyles.padding;
    rounded?: keyof typeof panelStyles.rounded;
    hoverable?: boolean;
    clickable?: boolean;
    disabled?: boolean;
    className?: string;
  }
) {
  const classes: string[] = [
    panelStyles.base,
    panelStyles.variant[variant],
  ];

  if (options?.intent && options.intent !== 'neutral') {
    classes.push(panelStyles.intent[options.intent]);
  }
  if (options?.padding) {
    classes.push(panelStyles.padding[options.padding]);
  }
  if (options?.rounded) {
    classes.push(panelStyles.rounded[options.rounded]);
  }
  if (options?.hoverable && !options?.disabled) {
    classes.push(panelStyles.hoverable);
  }
  if (options?.clickable && !options?.disabled) {
    classes.push(panelStyles.clickable);
  }
  if (options?.disabled) {
    classes.push(panelStyles.disabled);
  }
  if (options?.className) {
    classes.push(options.className);
  }

  return classes.join(' ');
}

/**
 * Get alert classes
 */
export function getAlertClasses(
  intent: keyof typeof alertStyles.background = 'info'
) {
  return cn(alertStyles.base, alertStyles.background[intent]);
}

/**
 * Get alert icon classes
 */
export function getAlertIconClasses(
  intent: keyof typeof alertStyles.icon.colors = 'info'
) {
  return cn(alertStyles.icon.base, alertStyles.icon.colors[intent]);
}

/**
 * Get modal container classes
 */
export function getModalClasses(
  size: keyof typeof modalStyles.container.sizes = 'md'
) {
  return cn(modalStyles.container.base, modalStyles.container.sizes[size]);
}

/**
 * Get toast classes
 */
export function getToastClasses(
  type: keyof typeof toastStyles.item = 'info'
) {
  return cn(toastStyles.container, toastStyles.item.base, toastStyles.item[type]);
}