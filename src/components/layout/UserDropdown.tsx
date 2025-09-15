"use client";

import { useState, useRef, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/contexts/ThemeContext";

interface UserDropdownProps {
  className?: string;
}

export function UserDropdown({ className }: UserDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { data: session } = useSession();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);


  return (
    <div className={cn("relative", className)} ref={dropdownRef}>
      {/* User Avatar Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-2 rounded-lg dark:hover:bg-slate-800 hover:bg-gray-100 transition-colors"
      >
        <div className="w-9 h-9 dark:bg-slate-700 bg-gray-200 rounded-full flex items-center justify-center">
          <svg className="w-6 h-6 dark:text-gray-400 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <svg 
          className={cn(
            "w-6 h-6 dark:text-gray-400 text-gray-600 transition-transform duration-200",
            isOpen && "rotate-180"
          )}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 dark:bg-slate-800 bg-white rounded-lg shadow-2xl dark:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.8)] border dark:border-slate-600 border-gray-200 ring-1 ring-black/5 dark:ring-white/10 overflow-hidden z-[9999]">
          {/* User Info */}
          <div className="px-4 py-3 border-b dark:border-slate-700 border-gray-200">
            <p className="font-medium dark:text-white text-gray-900">
              {session?.user?.email || 'User'}
            </p>
            <p className="text-xs dark:text-gray-400 text-gray-600 mt-1">
              UID: 47233462
            </p>
            <p className="text-xs dark:text-gray-400 text-gray-600">
              VIP Level: Regular User
            </p>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            {/* Settings */}
            <a
              href="/settings"
              className="w-full px-4 py-2 text-left dark:text-gray-300 text-gray-700 dark:hover:bg-slate-700 hover:bg-gray-100 dark:hover:text-white hover:text-gray-900 transition-colors flex items-center gap-3"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>Settings</span>
            </a>

            {/* API Management */}
            <a
              href="/api-management"
              className="w-full px-4 py-2 text-left dark:text-gray-300 text-gray-700 dark:hover:bg-slate-700 hover:bg-gray-100 dark:hover:text-white hover:text-gray-900 transition-colors flex items-center gap-3"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
              <span>API Management</span>
            </a>
          </div>

          {/* Logout */}
          <div className="border-t dark:border-slate-700 border-gray-200">
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="w-full px-4 py-3 text-left text-red-400 dark:hover:bg-red-900/20 hover:bg-red-50 hover:text-red-300 transition-colors flex items-center gap-3"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Log Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}