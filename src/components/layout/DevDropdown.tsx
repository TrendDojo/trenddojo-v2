"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Palette,
  RefreshCw,
  Code2,
  ChevronDown
} from "lucide-react";
import { cn } from "@/lib/utils";

export function DevDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const menuItems = [
    {
      label: 'Theme Showcase',
      icon: Palette,
      onClick: () => {
        router.push('/dev/theme');
        setIsOpen(false);
      },
      description: 'View all theme components'
    },
    {
      label: 'Broker Refresh Testing',
      icon: RefreshCw,
      onClick: () => {
        router.push('/dev/broker-refresh');
        setIsOpen(false);
      },
      description: 'Test broker data refresh'
    }
  ];

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-lg transition-all",
          "bg-amber-500/20 hover:bg-amber-500/30",
          "border border-amber-500/50",
          "text-amber-600 dark:text-amber-400",
          isOpen && "bg-amber-500/30"
        )}
        aria-label="Development menu"
      >
        <Code2 className="w-5 h-5" />
        <span className="text-sm font-medium">DEV</span>
        <ChevronDown className={cn(
          "w-4 h-4 transition-transform",
          isOpen && "rotate-180"
        )} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className={cn(
          "absolute right-0 mt-2 w-64 rounded-lg shadow-lg",
          "dark:bg-slate-800 bg-white",
          "border dark:border-slate-700 border-gray-200",
          "z-50"
        )}>
          <div className="py-1">
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <button
                  key={index}
                  onClick={item.onClick}
                  className={cn(
                    "w-full px-4 py-2 text-left",
                    "hover:dark:bg-slate-700 hover:bg-gray-100",
                    "transition-colors",
                    "flex items-start gap-3"
                  )}
                >
                  <Icon className="w-5 h-5 mt-0.5 flex-shrink-0 dark:text-gray-400 text-gray-600" />
                  <div className="flex-1">
                    <div className="text-sm font-medium dark:text-white text-gray-900">
                      {item.label}
                    </div>
                    <div className="text-xs dark:text-gray-400 text-gray-600">
                      {item.description}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Footer */}
          <div className="px-4 py-2 border-t dark:border-slate-700 border-gray-200">
            <p className="text-xs dark:text-gray-500 text-gray-400">
              Development tools only
            </p>
          </div>
        </div>
      )}
    </div>
  );
}