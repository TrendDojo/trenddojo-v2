/**
 * Centralized Dropdown & Filter Styling System
 *
 * Standard styles for all dropdowns, filters, and selections
 * Used across screeners, tables, and filter interfaces
 */

import { cn } from "@/lib/utils";

// ============================================
// DROPDOWN STYLES
// ============================================

export const dropdownStyles = {
  // Trigger Button
  trigger: {
    base: "px-4 py-2 dark:bg-slate-800 bg-white border dark:border-slate-700 border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-2",
    active: "bg-gray-50 dark:bg-slate-700",
    icon: "w-4 h-4",
    chevron: "w-4 h-4 transition-transform",
    chevronOpen: "rotate-180",
  },

  // Dropdown Container
  container: {
    base: "absolute top-full mt-1 bg-white dark:bg-slate-800 border dark:border-slate-700 border-gray-200 rounded-lg shadow-lg z-10",
    left: "left-0",
    right: "right-0",
  },

  // Dropdown Content
  content: {
    wrapper: "p-2",
    section: "py-2",
    divider: "border-t dark:border-slate-700 border-gray-200 my-2",
  },

  // Section Headers
  header: {
    base: "text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase px-3 py-2",
  },

  // Menu Items
  item: {
    base: "w-full px-3 py-2 text-left text-sm rounded hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors cursor-pointer",
    selected: "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-medium",
    disabled: "opacity-50 cursor-not-allowed",
    withIcon: "flex items-center gap-3",
  },

  // Filter Pills (Active Filters)
  filterPill: {
    base: "inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm",
    default: "bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300",
    primary: "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400",
    success: "bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400",
    warning: "bg-yellow-50 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400",
    danger: "bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400",
    closeButton: "ml-1 hover:opacity-70 transition-opacity",
  },

  // Sizes
  size: {
    sm: "w-48",
    md: "w-64",
    lg: "w-80",
    xl: "w-96",
    full: "w-full",
  },
} as const;

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get dropdown trigger classes
 */
export function getDropdownTriggerClasses(
  isOpen: boolean = false,
  isActive: boolean = false,
  className?: string
) {
  return cn(
    dropdownStyles.trigger.base,
    isActive && dropdownStyles.trigger.active,
    className
  );
}

/**
 * Get dropdown container classes
 */
export function getDropdownContainerClasses(
  size: keyof typeof dropdownStyles.size = 'md',
  position: 'left' | 'right' = 'left',
  className?: string
) {
  return cn(
    dropdownStyles.container.base,
    dropdownStyles.size[size],
    dropdownStyles.container[position],
    className
  );
}

/**
 * Get dropdown item classes
 */
export function getDropdownItemClasses(
  isSelected: boolean = false,
  isDisabled: boolean = false,
  hasIcon: boolean = false,
  className?: string
) {
  return cn(
    dropdownStyles.item.base,
    isSelected && dropdownStyles.item.selected,
    isDisabled && dropdownStyles.item.disabled,
    hasIcon && dropdownStyles.item.withIcon,
    className
  );
}

/**
 * Get filter pill classes
 */
export function getFilterPillClasses(
  variant: 'default' | 'primary' | 'success' | 'warning' | 'danger' = 'default',
  className?: string
) {
  return cn(
    dropdownStyles.filterPill.base,
    dropdownStyles.filterPill[variant],
    className
  );
}

// ============================================
// SCREENER-SPECIFIC STYLES
// ============================================

export const screenerDropdownStyles = {
  // Sector/Category Item
  sectorItem: {
    wrapper: "border-b dark:border-slate-700 border-gray-100 last:border-0",
    container: "flex items-center px-4 py-4 transition-colors",
    selected: "bg-gray-50 dark:bg-slate-700 border-t border-b dark:border-slate-600 border-gray-200",
    hover: "hover:bg-gray-50 dark:hover:bg-slate-700",
    icon: {
      default: "text-gray-500 dark:text-gray-400",
      selected: "text-purple-600",
    },
    text: {
      default: "font-medium text-gray-700 dark:text-gray-300",
      selected: "font-bold text-gray-900 dark:text-white",
      disabled: "font-medium text-gray-500 dark:text-gray-400",
    },
    expandButton: "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300",
  },

  // Subcategory Item
  subcategoryItem: {
    wrapper: "pl-12 pr-4 py-2",
    checkbox: "w-4 h-4 text-purple-600",
    label: "text-sm text-gray-600 dark:text-gray-400",
    selectedLabel: "font-medium text-gray-900 dark:text-white",
  },

  // Tab Styles
  tabs: {
    container: "flex gap-4 px-4 py-3 border-b dark:border-slate-700 border-gray-200",
    tab: "text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors",
    activeTab: "text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400",
  },
};

// ============================================
// PRESET COMPONENTS
// ============================================

/**
 * Standard filter dropdown button props
 */
export interface FilterDropdownButtonProps {
  label: string;
  icon?: React.ReactNode;
  isOpen: boolean;
  onClick: () => void;
  className?: string;
}

/**
 * Standard filter pill props
 */
export interface FilterPillProps {
  label: string;
  onRemove: () => void;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
  className?: string;
}