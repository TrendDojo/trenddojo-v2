"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useTheme } from "@/contexts/ThemeContext";

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

// Single-color SVG icons - Larger size (w-6 h-6)
const DashboardIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);

const ScreenerIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const PositionsIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
  </svg>
);

const PortfoliosIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
  </svg>
);

const BrokersIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
  </svg>
);

const SettingsIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const ProfileIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const LogoutIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
);

const ThemeIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
  </svg>
);


const navigationItems = [
  { href: "/dashboard", label: "Dashboard", icon: DashboardIcon },
  { href: "/screener", label: "Screener", icon: ScreenerIcon },
  { href: "/positions", label: "Positions", icon: PositionsIcon },
  { 
    href: "/portfolios", 
    label: "Strategies", 
    icon: PortfoliosIcon,
    hasDropdown: true,
    subItems: [
      { href: "/portfolios/1", label: "Strategy #1" },
      { href: "/portfolios/add", label: "Add Strategy" }
    ]
  },
  { 
    href: "/brokers", 
    label: "Brokers", 
    icon: BrokersIcon,
    hasDropdown: true,
    subItems: [
      { href: "/brokers", label: "Connect Broker" },
      { href: "/brokers/interactive-brokers", label: "Interactive Brokers" }
    ]
  },
  { href: "/settings", label: "Settings", icon: SettingsIcon },
];

// Development-only navigation items
const devNavigationItems = process.env.NODE_ENV === 'development' ? [
  { href: "/theme", label: "Theme", icon: ThemeIcon, isDev: true },
] : [];

interface SubItem {
  href: string;
  label: string;
}

interface NavItemProps {
  href: string;
  label: string;
  icon: React.ComponentType;
  isActive?: boolean;
  onClick?: () => void;
  isDev?: boolean;
  hasDropdown?: boolean;
  subItems?: SubItem[];
  isOpen?: boolean;
  onToggleDropdown?: () => void;
}

interface ExtendedNavItemProps extends NavItemProps {
  isDev?: boolean;
}

function NavItem({ 
  href, 
  label, 
  icon: Icon, 
  isActive, 
  onClick, 
  isDev,
  hasDropdown,
  subItems,
  isOpen,
  onToggleDropdown
}: ExtendedNavItemProps) {
  const pathname = usePathname();
  
  if (hasDropdown && subItems) {
    return (
      <div>
        <button
          onClick={onToggleDropdown}
          className={cn(
            "w-full flex items-center gap-3 px-5 py-3.5 ml-2 rounded-lg transition-all duration-200",
            "font-medium relative group",
            isActive
              ? "dark:text-white text-gray-900 dark:bg-slate-800 bg-gray-200"
              : "dark:text-gray-400 text-gray-600 dark:hover:text-white hover:text-gray-900 dark:hover:bg-slate-800/50 hover:bg-gray-100"
          )}
        >
          <Icon />
          <div className="flex items-center gap-2 flex-1">
            <span className="truncate">{label}</span>
          </div>
          <svg 
            className={cn(
              "w-4 h-4 transition-transform",
              isOpen ? "rotate-180" : ""
            )}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {isOpen && (
          <div className="ml-8 mt-1 space-y-1">
            {subItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClick}
                className={cn(
                  "flex items-center gap-3 px-5 py-2 rounded-lg transition-all duration-200",
                  "text-sm",
                  pathname === item.href
                    ? "dark:text-white text-gray-900 dark:bg-slate-800/50 bg-gray-200/50"
                    : "dark:text-gray-400 text-gray-600 dark:hover:text-white hover:text-gray-900 dark:hover:bg-slate-800/30 hover:bg-gray-100/50"
                )}
              >
                {(item.label === "Add Strategy" || item.label === "Connect Broker") ? (
                  <>
                    <span className="flex-1">{item.label}</span>
                    <svg className="w-4 h-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </>
                ) : (
                  <>
                    <span className="w-2 h-2 rounded-full bg-current opacity-30"></span>
                    <span>{item.label}</span>
                  </>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  }
  
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 px-5 py-3.5 ml-2 rounded-lg transition-all duration-200",
        "font-medium relative group",
        isActive
          ? "dark:text-white text-gray-900 dark:bg-slate-800 bg-gray-200"
          : "dark:text-gray-400 text-gray-600 dark:hover:text-white hover:text-gray-900 dark:hover:bg-slate-800/50 hover:bg-gray-100"
      )}
    >
      <Icon />
      <div className="flex items-center gap-2 flex-1">
        <span className="truncate">{label}</span>
        {isDev && (
          <span className="text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-600 dark:text-amber-400 font-normal">
            DEV
          </span>
        )}
      </div>
    </Link>
  );
}

export function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [strategiesOpen, setStrategiesOpen] = useState(false);
  const [brokersOpen, setBrokersOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  
  const userEmail = session?.user?.email || "user@example.com";
  const userInitial = userEmail.charAt(0).toUpperCase();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "h-full w-64 lg:w-64 dark:bg-slate-900 bg-gray-100 z-50",
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
            {/* Main navigation items (excluding Settings) */}
            {navigationItems.filter(item => item.label !== "Settings").map((item) => (
              <NavItem
                key={item.href}
                href={item.href}
                label={item.label}
                icon={item.icon}
                isActive={pathname === item.href || item.subItems?.some(sub => pathname === sub.href)}
                hasDropdown={item.hasDropdown}
                subItems={item.subItems}
                isOpen={
                  item.label === "Strategies" ? strategiesOpen : 
                  item.label === "Brokers" ? brokersOpen : 
                  false
                }
                onToggleDropdown={
                  item.label === "Strategies" ? () => setStrategiesOpen(!strategiesOpen) : 
                  item.label === "Brokers" ? () => setBrokersOpen(!brokersOpen) :
                  undefined
                }
                onClick={() => {
                  if (!item.hasDropdown && window.innerWidth < 1024) {
                    onToggle();
                  }
                }}
              />
            ))}
            
            {/* Divider before bottom section */}
            <div className="my-4 mx-4 border-t dark:border-slate-700/50 border-gray-200" />
            
            {/* Theme Toggle */}
            <div className="px-5 py-3.5 ml-2 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {theme === 'dark' ? (
                  <svg className="w-6 h-6 dark:text-gray-400 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6 dark:text-gray-400 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                )}
                <span className="font-medium dark:text-gray-400 text-gray-600">Theme</span>
              </div>
              <button
                onClick={toggleTheme}
                className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 dark:bg-slate-700 transition-colors"
              >
                <span className={cn(
                  "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                  theme === 'dark' ? 'translate-x-6' : 'translate-x-1'
                )} />
              </button>
            </div>
            
            {/* Settings */}
            <NavItem
              href="/settings"
              label="Settings"
              icon={SettingsIcon}
              isActive={pathname === "/settings"}
              onClick={() => {
                if (window.innerWidth < 1024) {
                  onToggle();
                }
              }}
            />
            
            {/* Account Link */}
            <NavItem
              href="/profile"
              label="Account"
              icon={ProfileIcon}
              isActive={pathname === "/profile"}
              onClick={() => {
                if (window.innerWidth < 1024) {
                  onToggle();
                }
              }}
            />
            
            {/* Divider before Logout */}
            <div className="my-4 mx-4 border-t dark:border-slate-700/50 border-gray-200" />
            
            {/* Logout Link */}
            <button
              onClick={() => {
                signOut({ callbackUrl: '/login' });
                onToggle();
              }}
              className="w-full flex items-center gap-3 px-5 py-3.5 ml-2 rounded-lg transition-all duration-200 font-medium dark:text-gray-400 text-gray-600 dark:hover:text-white hover:text-gray-900 dark:hover:bg-slate-800/50 hover:bg-gray-100"
            >
              <LogoutIcon />
              <span>Logout</span>
            </button>
            
            {/* Theme Link - Development only, at the very bottom */}
            {devNavigationItems.length > 0 && (
              <>
                <div className="my-4 mx-4 border-t dark:border-slate-700/50 border-gray-200" />
                {devNavigationItems.map((item) => (
                  <NavItem
                    key={item.href}
                    href={item.href}
                    label={item.label}
                    icon={item.icon}
                    isActive={pathname === item.href}
                    isDev={item.isDev}
                    onClick={() => {
                      if (window.innerWidth < 1024) {
                        onToggle();
                      }
                    }}
                  />
                ))}
              </>
            )}
            
          </div>
        </nav>

      </aside>
    </>
  );
}