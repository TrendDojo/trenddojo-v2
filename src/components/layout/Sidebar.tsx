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
}

const navigationItems = [
  { href: "/dashboard", label: "Dashboard", icon: () => <Gauge className="w-6 h-6" /> },
  { href: "/screener", label: "Screener", icon: () => <ArrowUpWideNarrow className="w-6 h-6" /> },
  { href: "/positions", label: "Positions", icon: () => <MapPin className="w-6 h-6" /> },
  { href: "/strategies", label: "Strategies", icon: () => <Atom className="w-6 h-6" /> },
  { href: "/brokers", label: "Brokers", icon: () => <ArrowRightLeft className="w-6 h-6" /> },
];

interface NavItemProps {
  href: string;
  label: string;
  icon: React.ComponentType;
  isActive?: boolean;
  onClick?: () => void;
}

function NavItem({
  href,
  label,
  icon: Icon,
  isActive = false,
  onClick
}: NavItemProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 px-5 py-3.5 ml-2 rounded-lg transition-all duration-200",
        "font-medium relative group",
        isActive
          ? "dark:text-white text-gray-900 dark:bg-slate-800/30 bg-gray-100"
          : "dark:text-gray-400 text-gray-600 dark:hover:text-white hover:text-gray-900 dark:hover:bg-slate-800/50 hover:bg-gray-100"
      )}
    >
      <Icon />
      <span className="truncate">{label}</span>
    </Link>
  );
}

export function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const pathname = usePathname();

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
          "h-full w-64 lg:w-64 dark:bg-slate-950 bg-white z-50",
          "transform transition-transform duration-200 ease-in-out",
          "flex flex-col flex-shrink-0",
          // Desktop: Always visible, Mobile: Hidden by default with slide animation
          "hidden lg:block",
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

        {/* Navigation */}
        <nav className="flex-1 px-2 pb-6 overflow-y-auto">
          <div className="space-y-2">
            {/* Main navigation items */}
            {navigationItems.map((item) => (
              <NavItem
                key={item.href}
                href={item.href}
                label={item.label}
                icon={item.icon}
                isActive={pathname === item.href}
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