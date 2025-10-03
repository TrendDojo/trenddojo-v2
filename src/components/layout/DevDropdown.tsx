"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Palette,
  RefreshCw,
  Code2,
  ChevronDown,
  Activity,
  Clock,
  AlertCircle,
  Database,
  Zap
} from "lucide-react";
import { cn } from "@/lib/utils";
import { refreshCoordinator, RefreshEventType } from '@/lib/refresh/RefreshCoordinator';

export function DevDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Refresh monitor state
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshStatus, setRefreshStatus] = useState<Record<RefreshEventType, { lastRefresh: Date | null; listenerCount: number }> | null>(null);
  const [refreshHistory, setRefreshHistory] = useState<Array<{ type: RefreshEventType; time: Date }>>([]);
  const [activeRefreshTypes, setActiveRefreshTypes] = useState<Set<RefreshEventType>>(new Set());
  const [errorCount, setErrorCount] = useState(0);
  const [apiCallCount, setApiCallCount] = useState(0);

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

  // Subscribe to refresh events
  useEffect(() => {
    const unsubscribes: (() => void)[] = [];
    const refreshTypes: RefreshEventType[] = ['global', 'market-data', 'broker-data', 'positions', 'strategies', 'user-data'];

    refreshTypes.forEach(type => {
      const unsub = refreshCoordinator.subscribe(type, async () => {
        setIsRefreshing(true);
        setLastRefresh(new Date());
        setActiveRefreshTypes(prev => new Set([...prev, type]));
        setRefreshHistory(prev => [...prev.slice(-9), { type, time: new Date() }]);

        if (type === 'market-data' || type === 'broker-data') {
          setApiCallCount(prev => prev + 1);
        }

        setTimeout(() => {
          setRefreshStatus(refreshCoordinator.getStatus());
          setIsRefreshing(false);
          setActiveRefreshTypes(prev => {
            const newSet = new Set(prev);
            newSet.delete(type);
            return newSet;
          });
        }, 500);
      });
      unsubscribes.push(unsub);
    });

    setRefreshStatus(refreshCoordinator.getStatus());

    const interval = setInterval(() => {
      setRefreshStatus(refreshCoordinator.getStatus());
    }, 10000);

    return () => {
      unsubscribes.forEach(unsub => unsub());
      clearInterval(interval);
    };
  }, []);

  const getRelativeTime = (date: Date | null) => {
    if (!date) return 'Never';
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);

    if (diffSecs < 10) return 'Just now';
    if (diffSecs < 60) return `${diffSecs}s ago`;
    if (diffMins < 60) return `${diffMins}m ago`;
    return 'Over an hour ago';
  };

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await refreshCoordinator.forceRefreshAll();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

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
          "relative flex items-center gap-2 px-3 py-2 rounded-lg transition-all",
          "bg-amber-500/20 hover:bg-amber-500/30",
          "border border-amber-500/50",
          "text-amber-600 dark:text-amber-400",
          isOpen && "bg-amber-500/30"
        )}
        aria-label="Development menu"
      >
        <Code2 className="w-5 h-5" />
        <span className="text-sm font-medium">DEV</span>
        {/* Error indicator */}
        {errorCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
          </span>
        )}
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

          {/* Refresh Monitor Section */}
          <div className="border-t dark:border-slate-700 border-gray-200">
            <div className="px-4 py-3 space-y-3">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-600" />
                  <span className="text-sm font-medium text-amber-700 dark:text-amber-400">Refresh Monitor</span>
                  {isRefreshing && (
                    <Activity className="w-3 h-3 animate-pulse text-amber-500" />
                  )}
                </div>
                <button
                  onClick={handleManualRefresh}
                  disabled={isRefreshing}
                  className={cn(
                    "p-1 rounded hover:bg-amber-100 dark:hover:bg-amber-900/30",
                    isRefreshing && "cursor-not-allowed opacity-50"
                  )}
                  title="Force refresh all data"
                >
                  <RefreshCw className={cn(
                    "w-3 h-3",
                    isRefreshing && "animate-spin"
                  )} />
                </button>
              </div>

              {/* Summary Stats */}
              <div className="flex gap-3 text-xs text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-1">
                  <Database className="w-3 h-3" />
                  <span>API: {apiCallCount}</span>
                </div>
                <div className="flex items-center gap-1">
                  {errorCount > 0 ? (
                    <AlertCircle className="w-3 h-3 text-red-500" />
                  ) : (
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                  )}
                  <span>Errors: {errorCount}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{getRelativeTime(lastRefresh)}</span>
                </div>
              </div>

              {/* Active Refreshes */}
              {activeRefreshTypes.size > 0 && (
                <div className="flex flex-wrap gap-1">
                  {Array.from(activeRefreshTypes).map(type => (
                    <span key={type} className="px-2 py-0.5 bg-amber-200 dark:bg-amber-900 rounded text-xs animate-pulse">
                      {type}
                    </span>
                  ))}
                </div>
              )}

              {/* Refresh Status by Type */}
              {refreshStatus && (
                <div className="space-y-1">
                  <div className="text-xs font-medium text-gray-700 dark:text-gray-300">Status by Type</div>
                  {Object.entries(refreshStatus).map(([type, status]) => {
                    if (type === 'global') return null;
                    const typeLabels: Record<string, string> = {
                      'market-data': 'Market',
                      'broker-data': 'Broker',
                      'positions': 'Positions',
                      'strategies': 'Strategies',
                      'user-data': 'Profile'
                    };
                    return (
                      <div key={type} className="flex items-center justify-between text-xs">
                        <span className="text-gray-600 dark:text-gray-400">{typeLabels[type]}:</span>
                        <div className="flex items-center gap-1">
                          <span className="text-gray-500">{getRelativeTime(status.lastRefresh)}</span>
                          {status.listenerCount > 0 && (
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Recent History */}
              {refreshHistory.length > 0 && (
                <div className="space-y-1">
                  <div className="text-xs font-medium text-gray-700 dark:text-gray-300">Recent Activity</div>
                  <div className="max-h-16 overflow-y-auto space-y-0.5">
                    {refreshHistory.slice().reverse().slice(0, 5).map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-[10px] text-gray-500">
                        <span>{item.type}</span>
                        <span>{item.time.toLocaleTimeString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}