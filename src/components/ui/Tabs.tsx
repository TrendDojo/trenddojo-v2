/**
 * Tabs Component - Modern tab navigation
 *
 * A flexible tab component with multiple styles including
 * modern fixed-width tabs with thick borders.
 */

import React from 'react';
import { cn } from '@/lib/utils';

/**
 * Tab item structure
 */
export interface TabItem {
  id: string;
  label: string;
  disabled?: boolean;
}

/**
 * Tabs component props
 */
interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  variant?: 'modern' | 'classic' | 'pills';
  className?: string;
}

/**
 * Modern Tabs Component
 *
 * @example
 * ```tsx
 * <Tabs
 *   tabs={[
 *     { id: 'all', label: 'All' },
 *     { id: 'active', label: 'Active' },
 *     { id: 'closed', label: 'Closed' }
 *   ]}
 *   activeTab="all"
 *   onTabChange={setActiveTab}
 *   variant="modern"
 * />
 * ```
 */
export function Tabs({
  tabs,
  activeTab,
  onTabChange,
  variant = 'modern',
  className
}: TabsProps) {

  if (variant === 'modern') {
    return (
      <div className={cn('flex items-center gap-0 border-b-2 dark:border-slate-700 border-gray-200', className)}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => !tab.disabled && onTabChange(tab.id)}
            disabled={tab.disabled}
            className={cn(
              'w-24 py-2 text-center text-sm font-semibold transition-all relative',
              activeTab === tab.id
                ? 'text-gray-900 dark:text-white after:absolute after:bottom-[-2px] after:left-0 after:right-0 after:h-[3px] after:bg-indigo-600 dark:after:bg-indigo-500'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200',
              tab.disabled && 'opacity-50 cursor-not-allowed hover:text-gray-500 dark:hover:text-gray-400'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
    );
  }

  if (variant === 'classic') {
    return (
      <div className={cn('border-b dark:border-slate-700 border-gray-200', className)}>
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => !tab.disabled && onTabChange(tab.id)}
              disabled={tab.disabled}
              className={cn(
                'py-2 px-1 border-b-2 font-medium text-sm transition-colors',
                activeTab === tab.id
                  ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300',
                tab.disabled && 'opacity-50 cursor-not-allowed hover:text-gray-500 hover:border-transparent dark:hover:text-gray-400'
              )}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
    );
  }

  // Pills variant
  return (
    <div className={cn('flex space-x-2', className)}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => !tab.disabled && onTabChange(tab.id)}
          disabled={tab.disabled}
          className={cn(
            'px-4 py-2 text-sm font-medium rounded-full transition-colors',
            activeTab === tab.id
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-slate-600',
            tab.disabled && 'opacity-50 cursor-not-allowed hover:bg-gray-200 dark:hover:bg-slate-700'
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}