"use client";

import { useState, useRef, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/contexts/ThemeContext";
import { CircleUser, LogOut, User, Settings, CreditCard } from "lucide-react";

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
        <CircleUser className="w-8 h-8 dark:text-gray-400 text-gray-600" />
        <svg
          className={cn(
            "w-5 h-5 dark:text-gray-400 text-gray-600 transition-transform duration-200",
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
          <div className="px-4 py-4 border-b dark:border-slate-700 border-gray-200">
            <div className="flex flex-col items-center text-center">
              <CircleUser className="w-12 h-12 dark:text-gray-400 text-gray-600 mb-2" />
              <p className="font-semibold text-base dark:text-white text-gray-900">
                {session?.user?.name || 'John Doe'}
              </p>
              <p className="text-sm dark:text-gray-400 text-gray-600 mt-1">
                {session?.user?.email || 'user@example.com'}
              </p>
            </div>
          </div>

          {/* Menu Links */}
          <div className="py-2">
            <a
              href="/profile"
              className="w-full px-4 py-2 text-left dark:text-gray-300 text-gray-700 dark:hover:bg-slate-700 hover:bg-gray-100 dark:hover:text-white hover:text-gray-900 transition-colors flex items-center gap-3"
            >
              <User className="w-5 h-5" />
              <span>Profile Settings</span>
            </a>
            <a
              href="/settings"
              className="w-full px-4 py-2 text-left dark:text-gray-300 text-gray-700 dark:hover:bg-slate-700 hover:bg-gray-100 dark:hover:text-white hover:text-gray-900 transition-colors flex items-center gap-3"
            >
              <Settings className="w-5 h-5" />
              <span>Account Settings</span>
            </a>
            <a
              href="/subscription"
              className="w-full px-4 py-2 text-left dark:text-gray-300 text-gray-700 dark:hover:bg-slate-700 hover:bg-gray-100 dark:hover:text-white hover:text-gray-900 transition-colors flex items-center gap-3"
            >
              <CreditCard className="w-5 h-5" />
              <span>Subscription</span>
            </a>
          </div>

          {/* Logout */}
          <div className="border-t dark:border-slate-700 border-gray-200 py-2">
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="w-full px-4 py-2 text-left dark:text-gray-300 text-gray-700 dark:hover:bg-slate-700 hover:bg-gray-100 dark:hover:text-white hover:text-gray-900 transition-colors flex items-center gap-3"
            >
              <LogOut className="w-5 h-5" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}