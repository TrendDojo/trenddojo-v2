"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Sidebar } from "./Sidebar";
import { Button } from "@/components/ui/Button";
import { UserDropdown } from "./UserDropdown";
import { DevDropdown } from "./DevDropdown";
import { useTheme } from "@/contexts/ThemeContext";

interface AppLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export function AppLayout({ children, title }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { data: session } = useSession();
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();
  const router = useRouter();
  
  // Determine page title based on route if not provided
  const pageTitle = title || (() => {
    switch(pathname) {
      case '/app/dashboard': return 'Dashboard';
      case '/app/screener': return 'Screener';
      case '/app/positions': return 'Positions';
      case '/app/portfolios': return 'Portfolios';
      case '/app/exchanges': return 'Exchanges';
      case '/app/settings': return 'Settings';
      case '/app/strategies': return 'Strategies';
      case '/app/brokers': return 'Brokers';
      case '/app/profile': return 'Profile';
      case '/app/subscription': return 'Subscription';
      default: return 'Dashboard';
    }
  })();

  // Load collapsed state from localStorage after mount
  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('sidebarCollapsed');
    if (saved === 'true') {
      setSidebarCollapsed(true);
    }
  }, []);

  // Save collapsed state to localStorage whenever it changes
  useEffect(() => {
    if (mounted) {
      localStorage.setItem('sidebarCollapsed', sidebarCollapsed.toString());
    }
  }, [sidebarCollapsed, mounted]);

  // Close sidebar on window resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Prevent body scroll when mobile sidebar is open
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [sidebarOpen]);

  return (
    <div className="min-h-screen dark:bg-slate-950 bg-white">
      {/* Grid-based layout for proper alignment */}
      <div className={cn(
        "lg:grid lg:gap-0",
        sidebarCollapsed ? "lg:grid-cols-[64px_1fr]" : "lg:grid-cols-[256px_1fr]"
      )}>
        {/* Header - spans full width */}
        <header className="lg:col-span-2 dark:bg-slate-950 bg-white py-6">
          <div className={cn(
            "lg:grid lg:gap-0",
            sidebarCollapsed ? "lg:grid-cols-[64px_1fr]" : "lg:grid-cols-[256px_1fr]"
          )}>
            {/* Logo Section - Desktop only */}
            <div className={cn(
              "hidden lg:flex items-center justify-start"
            )} style={{ paddingLeft: '1.25rem' }}>
              <Link href="/app/dashboard" title="Dashboard">
                <img
                  src={sidebarCollapsed ? "/assets/icons/trenddojo-plain-icon.svg" : "/assets/logos/td-logo-s.svg"}
                  alt="TrendDojo"
                  className={sidebarCollapsed ? "h-10 w-10" : "h-10 w-auto"}
                  style={sidebarCollapsed ? { objectFit: 'contain' } : {}}
                />
              </Link>
            </div>

            {/* Header Content - Aligned with main content */}
            <div className="w-full">
              <div className="px-8">
                <div className="max-w-[1300px] mx-auto flex items-center gap-4">
                  {/* Search Bar */}
                  <div className="flex-1 flex items-center">
                    <div className="w-full lg:max-w-md">
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Search symbols, positions..."
                          className="w-full px-5 py-3 pl-12 dark:bg-slate-800 bg-gray-100 rounded-xl dark:text-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <svg
                          className="absolute left-4 top-3.5 w-5 h-5 dark:text-gray-400 text-gray-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                
                {/* Right side actions */}
                <div className="flex items-center gap-2">
                  {/* Dev features - development only, desktop only */}
                  {process.env.NODE_ENV === 'development' && (
                    <div className="hidden lg:flex items-center">
                      <DevDropdown />
                    </div>
                  )}

                  {/* Theme toggle button - desktop only */}
                  <button
                    onClick={toggleTheme}
                    className="hidden lg:block p-2 rounded dark:hover:bg-slate-800 hover:bg-gray-100 transition-colors"
                    aria-label="Toggle theme"
                  >
                    {theme === 'dark' ? (
                      <svg className="w-6 h-6 dark:text-gray-400 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    ) : (
                      <svg className="w-6 h-6 dark:text-gray-400 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                      </svg>
                    )}
                  </button>

                  {/* Notifications - desktop only */}
                  <button className="hidden lg:block p-2 rounded dark:hover:bg-slate-800 hover:bg-gray-100 transition-colors">
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
                        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                      />
                    </svg>
                  </button>

                  {/* User dropdown - desktop only */}
                  <div className="hidden lg:block pl-2 border-l dark:border-slate-800 border-gray-200">
                    <UserDropdown />
                  </div>
                  
                  {/* Mobile menu button - bigger and bolder */}
                  <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="lg:hidden p-3 rounded-lg dark:hover:bg-slate-800 hover:bg-gray-100 transition-colors"
                  >
                    <svg
                      className="w-7 h-7 dark:text-gray-300 text-gray-700"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M4 6h16M4 12h16M4 18h16"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

        {/* Sidebar - fixed width column */}
        <Sidebar
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
          isCollapsed={sidebarCollapsed}
          onCollapsedChange={setSidebarCollapsed}
        />

        {/* Main Content - fluid column */}
        <main className="overflow-visible">
          <div className="h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

// Responsive layout hook for components that need to know sidebar state
export function useLayout() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    return () => {
      window.removeEventListener('resize', checkScreenSize);
    };
  }, []);

  return { isMobile };
}