/**
 * Centralized Table & Filter Styling System
 *
 * This file defines all table and filter styles in one place.
 * Changes here will automatically update all tables across the app.
 */

// ============================================
// TABLE STYLES
// ============================================

export const tableStyles = {
  // Container wrapper for tables - no border by default
  wrapper: "rounded-lg overflow-hidden",

  // Table element
  table: "w-full",

  // Table sections - subtle header background
  thead: "bg-gray-100/70 dark:bg-slate-800/70",
  tbody: "",  // No dividers between rows

  // Header row - no border
  headerRow: "",

  // Header cells - black and bold
  th: "text-left px-6 py-3 text-xs font-bold uppercase tracking-wider dark:text-white text-black",
  thCenter: "text-center px-6 py-3 text-xs font-bold uppercase tracking-wider dark:text-white text-black",
  thRight: "text-right px-6 py-3 text-xs font-bold uppercase tracking-wider dark:text-white text-black",

  // Body rows - with alternating backgrounds
  tr: "hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors",
  trClickable: "hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors cursor-pointer",

  // Alternating row backgrounds (even rows get visible bg)
  trOdd: "hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors",
  trEven: "bg-gray-50 dark:bg-slate-800/50 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors",

  // Body cells
  td: "px-6 py-4 dark:text-gray-300 text-gray-700",
  tdBold: "px-6 py-4 dark:text-white text-gray-900 font-medium",
  tdCenter: "px-6 py-4 text-center dark:text-gray-300 text-gray-700",
  tdRight: "px-6 py-4 text-right dark:text-gray-300 text-gray-700",

  // Cell content variations
  tdSuccess: "px-6 py-4 text-success",
  tdDanger: "px-6 py-4 text-danger",
  tdWarning: "px-6 py-4 text-warning",
  tdMuted: "px-6 py-4 dark:text-gray-400 text-gray-600",
} as const;

// ============================================
// FILTER STYLES
// ============================================

export const filterStyles = {
  // Filter container (the background pill)
  container: "flex gap-1 p-1 bg-gray-100 dark:bg-slate-800 rounded-lg w-fit",

  // Individual filter buttons
  button: "px-3 py-2 text-sm font-semibold rounded-lg transition-all",

  // Active filter button
  buttonActive: "bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900",

  // Inactive filter button
  buttonInactive: "bg-transparent text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700",

  // Dropdown container
  dropdown: "relative",

  // Dropdown trigger button
  dropdownTrigger: "flex items-center gap-2 px-3 py-2 text-sm font-semibold rounded-lg transition-all bg-transparent text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700",

  // Dropdown menu
  dropdownMenu: "absolute top-full left-0 mt-1 w-56 bg-white dark:bg-slate-800 border dark:border-slate-700 border-gray-200 rounded-lg shadow-lg z-10",

  // Dropdown item
  dropdownItem: "px-4 py-2 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors cursor-pointer",

  // Checkbox in dropdown
  checkbox: "mr-2 w-4 h-4 dark:bg-slate-700 bg-white dark:border-gray-600 border-gray-300 rounded dark:checked:bg-indigo-600 checked:bg-indigo-600 accent-indigo-600",
} as const;

// ============================================
// TAB STYLES (like the ones on theme page)
// ============================================

export const tabStyles = {
  // Tab container
  container: "border-b dark:border-slate-700 border-gray-200",

  // Tab navigation
  nav: "-mb-px flex space-x-8",

  // Tab button base
  button: "py-2 px-1 border-b-2 font-medium text-sm transition-colors",

  // Active tab
  buttonActive: "border-indigo-500 text-indigo-600 dark:text-indigo-400",

  // Inactive tab
  buttonInactive: "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300",

  // Pill-style tabs
  pillContainer: "flex space-x-2",
  pillButton: "px-4 py-2 text-sm font-medium rounded-full transition-colors",
  pillActive: "bg-indigo-600 text-white",
  pillInactive: "bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-slate-600",

  // Modern fixed-width tabs with thick border
  modernContainer: "flex items-center gap-0 border-b-2 dark:border-slate-700 border-gray-200",
  modernButton: "w-24 py-2 text-center text-sm font-semibold transition-all relative",
  modernButtonActive: "text-gray-900 dark:text-white after:absolute after:bottom-[-2px] after:left-0 after:right-0 after:h-[3px] after:bg-indigo-600 dark:after:bg-indigo-500",
  modernButtonInactive: "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200",
} as const;

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get table wrapper classes
 */
export function getTableWrapper(options?: { noBorder?: boolean; noRounded?: boolean }) {
  if (options?.noBorder && options?.noRounded) return "";
  if (options?.noBorder) return "rounded-lg overflow-hidden";
  if (options?.noRounded) return "border dark:border-slate-700 border-gray-200 overflow-hidden";
  return tableStyles.wrapper;
}

/**
 * Get filter button classes
 */
export function getFilterButton(isActive: boolean) {
  return `${filterStyles.button} ${isActive ? filterStyles.buttonActive : filterStyles.buttonInactive}`;
}

/**
 * Get tab button classes
 */
export function getTabButton(isActive: boolean, style: 'default' | 'pill' = 'default') {
  if (style === 'pill') {
    return `${tabStyles.pillButton} ${isActive ? tabStyles.pillActive : tabStyles.pillInactive}`;
  }
  return `${tabStyles.button} ${isActive ? tabStyles.buttonActive : tabStyles.buttonInactive}`;
}

/**
 * Get table row classes with alternating backgrounds
 */
export function getTableRow(index: number, clickable: boolean = false) {
  const isEven = index % 2 === 0;
  if (clickable) {
    return isEven ? `${tableStyles.trEven} cursor-pointer` : `${tableStyles.trOdd} cursor-pointer`;
  }
  return isEven ? tableStyles.trEven : tableStyles.trOdd;
}

/**
 * Get table cell classes based on content type
 */
export function getTableCell(type?: 'default' | 'bold' | 'success' | 'danger' | 'warning' | 'muted', align?: 'left' | 'center' | 'right') {
  const alignClass = align === 'center' ? tableStyles.tdCenter : align === 'right' ? tableStyles.tdRight : tableStyles.td;

  switch (type) {
    case 'bold':
      return tableStyles.tdBold;
    case 'success':
      return tableStyles.tdSuccess;
    case 'danger':
      return tableStyles.tdDanger;
    case 'warning':
      return tableStyles.tdWarning;
    case 'muted':
      return tableStyles.tdMuted;
    default:
      return alignClass;
  }
}