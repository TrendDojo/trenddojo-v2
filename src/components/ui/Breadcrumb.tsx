"use client";

import React from 'react';
import Link from 'next/link';
import { Home, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumb({ items, className }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className={cn("flex items-center gap-2 text-sm", className)}>
      {/* Dashboard/Home Icon */}
      <Link
        href="/app/dashboard"
        className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800/50 transition-colors"
        title="Dashboard"
      >
        <Home className="w-4 h-4 dark:text-gray-400 text-gray-600" />
      </Link>

      {/* Breadcrumb Items */}
      {items.map((item, index) => (
        <React.Fragment key={index}>
          {item.href && index < items.length - 1 ? (
            <Link
              href={item.href}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800/50 transition-colors"
              title={`Go to ${item.label}`}
            >
              <ChevronRight className="w-4 h-4 dark:text-gray-500 text-gray-400" />
            </Link>
          ) : (
            <ChevronRight className="w-4 h-4 dark:text-gray-500 text-gray-400" />
          )}
          {item.href ? (
            <Link
              href={item.href}
              className="dark:text-gray-400 text-gray-600 hover:text-gray-900 dark:hover:text-white transition-colors underline underline-offset-2"
            >
              {item.label}
            </Link>
          ) : (
            <span className="dark:text-white text-gray-900 font-medium">
              {item.label}
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}