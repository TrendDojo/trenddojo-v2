/**
 * Centralized Form Styling System
 *
 * This file defines all form-related styles in one place.
 * Changes here will automatically update all form elements across the app.
 */

import { cn } from "@/lib/utils";

// ============================================
// FORM FIELD STYLES
// ============================================

export const formFieldStyles = {
  // Container for the entire form field
  container: "space-y-2",

  // Label styles
  label: {
    base: "block text-sm font-medium dark:text-gray-300 text-gray-700",
    required: "after:content-['*'] after:ml-0.5 after:text-red-500",
  },

  // Helper text
  helper: "text-sm dark:text-gray-400 text-gray-600",

  // Error text
  error: "text-sm text-red-600 dark:text-red-400",

  // Description text
  description: "text-xs dark:text-gray-500 text-gray-500",
} as const;

// ============================================
// INPUT STYLES
// ============================================

export const inputStyles = {
  // Base input styles
  base: "w-full px-3 py-2 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-900 focus:ring-offset-gray-50",

  // Border and background
  default: "dark:bg-slate-800 bg-white border dark:border-slate-700 border-gray-300 rounded-lg dark:text-white text-gray-900 placeholder:text-gray-500 dark:placeholder:text-gray-400",

  // Focus state
  focus: "focus:ring-indigo-500 dark:focus:border-indigo-500 focus:border-indigo-500",

  // Error state
  error: "border-red-500 dark:border-red-500 focus:ring-red-500",

  // Disabled state
  disabled: "disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-100 dark:disabled:bg-slate-900",

  // Size variants
  size: {
    sm: "px-2 py-1 text-sm",
    md: "px-3 py-2",
    lg: "px-4 py-3 text-lg",
  },

  // With icon
  withIconLeft: "pl-10",
  withIconRight: "pr-10",

  // Icon container
  iconContainer: "absolute inset-y-0 flex items-center pointer-events-none",
  iconLeft: "left-0 pl-3",
  iconRight: "right-0 pr-3",
  icon: "w-5 h-5 text-gray-400",
} as const;

// ============================================
// TEXTAREA STYLES
// ============================================

export const textareaStyles = {
  // Inherits most from input
  base: cn(inputStyles.base, inputStyles.default, inputStyles.focus),

  // Specific textarea styles
  resize: {
    none: "resize-none",
    vertical: "resize-y",
    horizontal: "resize-x",
    both: "resize",
  },

  // Min height variants
  minHeight: {
    sm: "min-h-[60px]",
    md: "min-h-[100px]",
    lg: "min-h-[150px]",
  },
} as const;

// ============================================
// SELECT STYLES
// ============================================

export const selectStyles = {
  // Base select styles (inherits from input)
  base: cn(inputStyles.base, inputStyles.default, inputStyles.focus),

  // Select-specific styles
  select: "pr-10 appearance-none cursor-pointer",

  // Chevron icon container
  iconContainer: "absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none",
  icon: "w-5 h-5 text-gray-400",
} as const;

// ============================================
// CHECKBOX & RADIO STYLES
// ============================================

export const checkboxStyles = {
  // Container
  container: "flex items-center",

  // Input element
  input: "w-4 h-4 dark:bg-slate-700 bg-white dark:border-gray-600 border-gray-300 rounded dark:checked:bg-indigo-600 checked:bg-indigo-600 accent-indigo-600 mr-2",

  // Label
  label: "dark:text-gray-300 text-gray-700 select-none",

  // Disabled
  disabled: "opacity-50 cursor-not-allowed",
} as const;

export const radioStyles = {
  // Container
  container: "flex items-center",

  // Input element
  input: "w-4 h-4 dark:bg-slate-700 bg-white dark:border-gray-600 border-gray-300 dark:checked:bg-indigo-600 checked:bg-indigo-600 accent-indigo-600 mr-2",

  // Label
  label: "dark:text-gray-300 text-gray-700 select-none",

  // Group container
  group: "space-y-2",

  // Disabled
  disabled: "opacity-50 cursor-not-allowed",
} as const;

// ============================================
// TOGGLE SWITCH STYLES
// ============================================

export const toggleStyles = {
  // Container
  container: "relative inline-flex items-center cursor-pointer",

  // Hidden checkbox
  input: "sr-only peer",

  // Switch track
  track: "w-11 h-6 bg-gray-400 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600",

  // Label
  label: "ml-3 dark:text-gray-300 text-gray-700",

  // Disabled
  disabled: "opacity-50 cursor-not-allowed",
} as const;

// ============================================
// FORM GROUP STYLES
// ============================================

export const formGroupStyles = {
  // Form container
  form: "space-y-6",

  // Form section
  section: "space-y-4",

  // Form row (horizontal layout)
  row: "grid grid-cols-1 md:grid-cols-2 gap-4",

  // Form actions (button group at bottom)
  actions: "flex justify-end gap-3 pt-6 border-t dark:border-slate-700 border-gray-200",
} as const;

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get input classes
 */
export function getInputClasses(options?: {
  size?: keyof typeof inputStyles.size;
  error?: boolean;
  disabled?: boolean;
  withIconLeft?: boolean;
  withIconRight?: boolean;
  className?: string;
}) {
  const classes: (string | false | undefined)[] = [
    inputStyles.base,
    inputStyles.default,
    !options?.error && inputStyles.focus,
    options?.error && inputStyles.error,
    inputStyles.disabled,
  ];

  if (options?.size) {
    classes.push(inputStyles.size[options.size]);
  }
  if (options?.withIconLeft) {
    classes.push(inputStyles.withIconLeft);
  }
  if (options?.withIconRight) {
    classes.push(inputStyles.withIconRight);
  }
  if (options?.className) {
    classes.push(options.className);
  }

  return classes.filter(Boolean).join(' ');
}

/**
 * Get textarea classes
 */
export function getTextareaClasses(options?: {
  resize?: keyof typeof textareaStyles.resize;
  minHeight?: keyof typeof textareaStyles.minHeight;
  error?: boolean;
  className?: string;
}) {
  const classes: (string | false | undefined)[] = [
    textareaStyles.base,
    options?.error && inputStyles.error,
  ];

  if (options?.resize) {
    classes.push(textareaStyles.resize[options.resize]);
  }
  if (options?.minHeight) {
    classes.push(textareaStyles.minHeight[options.minHeight]);
  }
  if (options?.className) {
    classes.push(options.className);
  }

  return classes.filter(Boolean).join(' ');
}

/**
 * Get select classes
 */
export function getSelectClasses(options?: {
  error?: boolean;
  className?: string;
}) {
  const classes: (string | false | undefined)[] = [
    selectStyles.base,
    selectStyles.select,
    options?.error && inputStyles.error,
  ];

  if (options?.className) {
    classes.push(options.className);
  }

  return classes.filter(Boolean).join(' ');
}

/**
 * Get checkbox classes
 */
export function getCheckboxClasses(options?: {
  disabled?: boolean;
  className?: string;
}) {
  const classes: (string | false | undefined)[] = [
    checkboxStyles.input,
    options?.disabled && checkboxStyles.disabled,
  ];

  if (options?.className) {
    classes.push(options.className);
  }

  return classes.filter(Boolean).join(' ');
}

/**
 * Get radio classes
 */
export function getRadioClasses(options?: {
  disabled?: boolean;
  className?: string;
}) {
  const classes: (string | false | undefined)[] = [
    radioStyles.input,
    options?.disabled && radioStyles.disabled,
  ];

  if (options?.className) {
    classes.push(options.className);
  }

  return classes.filter(Boolean).join(' ');
}