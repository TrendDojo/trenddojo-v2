"use client";

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Tooltip } from '@/components/ui/Tooltip';
import { LucideIcon, Gauge, ArrowUpWideNarrow, MapPin, Atom, ArrowRightLeft } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  isCollapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
}

const navigationItems = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: Gauge,
    tooltip: "View portfolio performance and key metrics"
  },
  {
    href: "/screener",
    label: "Screener",
    icon: ArrowUpWideNarrow,
    tooltip: "Find trading opportunities with market screeners"
  },
  {
    href: "/positions",
    label: "Positions",
    icon: MapPin,
    tooltip: "Monitor and manage your open positions"
  },
  {
    href: "/strategies",
    label: "Strategies",
    icon: Atom,
    tooltip: "Create and manage automated trading strategies"
  },
  {
    href: "/brokers",
    label: "Brokers",
    icon: ArrowRightLeft,
    tooltip: "Connect and manage broker accounts"
  },
];

interface NavItemProps {
  href: string;
  label: string;
  icon: LucideIcon;
  tooltip?: string;
  isActive?: boolean;
  isCollapsed?: boolean;
  onClick?: () => void;
}

function NavItem({
  href,
  label,
  icon: iconComponent,
  tooltip,
  isActive = false,
  isCollapsed = false,
  onClick
}: NavItemProps) {
  const linkContent = (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 rounded-lg transition-all duration-200",
        "font-medium relative group",
        isCollapsed ? "px-3 py-2.5 mx-2 justify-center" : "px-4 py-2.5 mx-2",
        isActive
          ? "text-white dark:text-gray-900 bg-gray-900 dark:bg-gray-100"
          : "dark:text-gray-400 text-gray-600 dark:hover:text-white hover:text-gray-900 dark:hover:bg-slate-800/50 hover:bg-gray-100"
      )}
    >
      {React.createElement(iconComponent, { className: "w-5 h-5" })}
      {!isCollapsed && <span className="truncate">{label}</span>}
    </Link>
  );

  if (isCollapsed) {
    const tooltipContent = tooltip ? (
      <div>
        <div className="text-sm font-semibold mb-1">{label}</div>
        <div className="text-sm font-normal text-gray-400 dark:text-gray-500">{tooltip}</div>
      </div>
    ) : (
      label
    );

    return (
      <Tooltip
        content={tooltipContent}
        position="right"
        delay={300}
        arrow
        maxWidth={280}
        wrapperClassName=""
      >
        {linkContent}
      </Tooltip>
    );
  }

  return linkContent;
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
        <div className="hidden lg:flex px-2 pt-3 pb-8">
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
          <div className="space-y-4">
            {/* Main navigation items */}
            {navigationItems.map((item) => (
              <NavItem
                key={item.href}
                href={item.href}
                label={item.label}
                icon={item.icon}
                tooltip={item.tooltip}
                isActive={pathname === item.href}
                isCollapsed={collapsed}
                onClick={() => {
                  if (window.innerWidth < 1024) {
                    onToggle();
                  }
                }}
              />
            ))}
          </div>
        </nav>
      </aside>
    </>
  );
}