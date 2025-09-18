"use client";

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import {
  Gauge,
  MapPin,
  ArrowUpWideNarrow,
  Atom,
  ArrowRightLeft,
  Plus
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  isCollapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
}

const navigationItems = [
  { href: "/dashboard", label: "Dashboard", icon: () => <Gauge className="w-6 h-6 flex-shrink-0" /> },
  { href: "/screener", label: "Screener", icon: () => <ArrowUpWideNarrow className="w-6 h-6 flex-shrink-0" /> },
  { href: "/positions", label: "Positions", icon: () => <MapPin className="w-6 h-6 flex-shrink-0" /> },
  { href: "/strategies", label: "Strategies", icon: () => <Atom className="w-6 h-6 flex-shrink-0" /> },
  { href: "/brokers", label: "Brokers", icon: () => <ArrowRightLeft className="w-6 h-6 flex-shrink-0" /> },
];

interface NavItemProps {
  href: string;
  label: string;
  icon: React.ComponentType;
  isActive?: boolean;
  isCollapsed?: boolean;
  onClick?: () => void;
}

function NavItem({
  href,
  label,
  icon: Icon,
  isActive = false,
  isCollapsed = false,
  onClick
}: NavItemProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 transition-all duration-200",
        "font-medium relative group",
        isCollapsed
          ? "py-3.5 mx-2 justify-center rounded-lg"
          : "px-5 py-3.5 mx-2 rounded-lg",
        isActive
          ? "text-white dark:text-gray-900 bg-gray-900 dark:bg-gray-100"
          : "dark:text-gray-400 text-gray-600 dark:hover:text-white hover:text-gray-900 dark:hover:bg-slate-800/50 hover:bg-gray-100"
      )}
      title={isCollapsed ? label : undefined}
    >
      <Icon />
      {!isCollapsed && <span className="truncate">{label}</span>}

      {/* Tooltip for collapsed state */}
      {isCollapsed && (
        <div className="absolute left-full ml-6 px-2 py-1 bg-gray-900 text-white text-sm rounded whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 hidden lg:block">
          {label}
        </div>
      )}
    </Link>
  );
}

export function Sidebar({
  isOpen,
  onToggle,
  isCollapsed = false,
  onCollapsedChange
}: SidebarProps) {
  const pathname = usePathname();
  const [localCollapsed, setLocalCollapsed] = useState(isCollapsed);

  // Use prop if provided, otherwise use local state
  const collapsed = onCollapsedChange ? isCollapsed : localCollapsed;
  const setCollapsed = onCollapsedChange || setLocalCollapsed;

  return (
    <>
      {/* Mobile overlay backdrop */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-30 z-40"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "h-full dark:bg-slate-950 bg-white z-50",
          "transform transition-all duration-200 ease-in-out",
          "flex flex-col flex-shrink-0",
          // Desktop: Always visible with collapsible width
          "hidden lg:block",
          collapsed ? "w-20" : "w-64",
          // Mobile overlay positioning - 70% width
          isOpen && "!block fixed top-0 left-0 bottom-0 !w-[70%] min-w-[240px]"
        )}
      >
        {/* Close button - Mobile only */}
        <div className="lg:hidden flex justify-end pr-4 pt-4">
          <button
            onClick={onToggle}
            className="p-2 rounded-lg dark:hover:bg-slate-800 hover:bg-gray-100 transition-colors"
          >
            <svg
              className="w-6 h-6 dark:text-gray-400 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Logo - Mobile only */}
        <div className="lg:hidden pl-2 pb-12 flex justify-start">
          <div className="pl-5">
            <img
              src="/assets/logos/td-logo-s.svg"
              alt="TrendDojo"
              className="h-8 w-auto"
            />
          </div>
        </div>


        {/* Collapse/Expand Button - Desktop only */}
        <div className="hidden lg:flex px-2 pb-4">
          {collapsed ? (
            <button
              onClick={() => setCollapsed(false)}
              className="p-2 rounded-lg bg-gray-100 dark:bg-slate-800/50 hover:bg-gray-200 dark:hover:bg-slate-800 transition-colors"
              style={{ marginLeft: '0.9rem' }}
              title="Expand sidebar"
            >
              <svg
                className="w-5 h-5 dark:text-gray-400 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          ) : (
            <button
              onClick={() => setCollapsed(true)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 dark:bg-slate-800/50 hover:bg-gray-200 dark:hover:bg-slate-800 transition-colors"
              style={{ marginLeft: '0.9rem' }}
              title="Collapse sidebar"
            >
              <svg
                className="w-5 h-5 dark:text-gray-400 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              <span className="text-sm dark:text-gray-400 text-gray-600 font-medium">close</span>
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 pb-6 overflow-y-auto">
          <div className="space-y-2">
            {/* Main navigation items */}
            {navigationItems.map((item) => {
              // Check if current path starts with the item's href (for sub-pages)
              // Special case for dashboard - only exact match
              const isActive = item.href === '/dashboard'
                ? pathname === item.href
                : pathname.startsWith(item.href);

              return (
                <NavItem
                  key={item.href}
                  href={item.href}
                  label={item.label}
                  icon={item.icon}
                  isActive={isActive}
                  isCollapsed={collapsed}
                  onClick={() => {
                    if (window.innerWidth < 1024) {
                      onToggle();
                    }
                  }}
                />
              );
            })}
          </div>
        </nav>
      </aside>
    </>
  );
}