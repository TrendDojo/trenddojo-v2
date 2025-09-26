"use client";

import React, { useState, useEffect } from 'react';
import { RefreshCw, Wifi, WifiOff, Clock, Activity, ChevronDown, ChevronUp, Database, Zap, AlertCircle } from 'lucide-react';
import { refreshCoordinator, RefreshEventType } from '@/lib/refresh/RefreshCoordinator';
import { cn } from '@/lib/utils';

interface GlobalRefreshIndicatorProps {
  className?: string;
  showDetails?: boolean;
  position?: 'top-right' | 'bottom-right' | 'bottom-left' | 'inline';
  variant?: 'minimal' | 'compact' | 'detailed' | 'dev';
}

export function GlobalRefreshIndicator({
  className,
  showDetails = false,
  position = 'inline',
  variant = process.env.NODE_ENV === 'development' ? 'dev' : 'minimal'
}: GlobalRefreshIndicatorProps) {
  const [isOnline, setIsOnline] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshStatus, setRefreshStatus] = useState<Record<RefreshEventType, { lastRefresh: Date | null; listenerCount: number }> | null>(null);
  const [expandedDev, setExpandedDev] = useState(false);
  const [refreshHistory, setRefreshHistory] = useState<Array<{ type: RefreshEventType; time: Date }>>([]);
  const [activeRefreshTypes, setActiveRefreshTypes] = useState<Set<RefreshEventType>>(new Set());
  const [errorCount, setErrorCount] = useState(0);
  const [apiCallCount, setApiCallCount] = useState(0);

  useEffect(() => {
    // Monitor online/offline status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial state
    setIsOnline(navigator.onLine);

    // Subscribe to all refresh events
    const unsubscribes: (() => void)[] = [];
    const refreshTypes: RefreshEventType[] = ['global', 'market-data', 'broker-data', 'positions', 'strategies', 'user-data'];

    refreshTypes.forEach(type => {
      const unsub = refreshCoordinator.subscribe(type, async () => {
        setIsRefreshing(true);
        setLastRefresh(new Date());

        // Track active refresh types
        setActiveRefreshTypes(prev => new Set([...prev, type]));

        // Add to history (keep last 10)
        setRefreshHistory(prev => [...prev.slice(-9), { type, time: new Date() }]);

        // Track API calls (simulated)
        if (type === 'market-data' || type === 'broker-data') {
          setApiCallCount(prev => prev + 1);
        }

        // Update status
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

    // Get initial status
    setRefreshStatus(refreshCoordinator.getStatus());

    // Update status periodically
    const interval = setInterval(() => {
      setRefreshStatus(refreshCoordinator.getStatus());
    }, 10000); // Every 10 seconds

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
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

  // Position classes
  const positionClasses = {
    'top-right': 'fixed top-4 right-4 z-50',
    'bottom-right': 'fixed bottom-4 right-4 z-50',
    'bottom-left': 'fixed bottom-4 left-4 z-50',
    'inline': ''
  };

  // Check variant and set styling accordingly
  const isDev = variant === 'dev';
  const isMinimal = variant === 'minimal';
  const isCompact = variant === 'compact';
  const isDetailed = variant === 'detailed' || showDetails;

  const containerClass = cn(
    "rounded-lg shadow-sm transition-all duration-200",
    isDev ? [
      "bg-amber-50 dark:bg-amber-950/30",
      "border border-amber-200 dark:border-amber-800",
      "text-amber-700 dark:text-amber-400"
    ] : [
      "bg-white dark:bg-slate-800",
      "border border-gray-200 dark:border-slate-700"
    ],
    isMinimal && "px-2 py-1",
    isCompact && "px-3 py-2",
    (isDetailed || isDev) && "p-3",
    positionClasses[position],
    className
  );

  // For minimal variant, just show basic status
  if (isMinimal && !isDev) {
    return (
      <div className={cn(containerClass, "flex items-center gap-2")}>
        {isRefreshing ? (
          <Activity className="w-3 h-3 animate-pulse text-blue-500" />
        ) : (
          <Clock className="w-3 h-3 text-gray-400" />
        )}
        <span className="text-xs text-gray-600 dark:text-gray-400">
          {getRelativeTime(lastRefresh)}
        </span>
      </div>
    );
  }

  return (
    <div className={containerClass}>
      {/* Compact/Standard View */}
      {!isDev ? (
        <div className="flex items-center gap-2">
          {/* Connection Status */}
          <div className="flex items-center gap-2">
            {isOnline ? (
              <Wifi className="w-4 h-4 text-green-500" />
            ) : (
              <WifiOff className="w-4 h-4 text-red-500" />
            )}
            {isRefreshing ? (
              <Activity className="w-4 h-4 animate-pulse text-blue-500" />
            ) : (
              <Clock className="w-4 h-4 text-gray-400" />
            )}
          </div>

          {/* Status Text */}
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {isRefreshing ? (
              <span className="text-blue-500">Refreshing...</span>
            ) : (
              <span>Updated {getRelativeTime(lastRefresh)}</span>
            )}
          </div>

          {/* Manual Refresh Button */}
          <button
            onClick={handleManualRefresh}
            disabled={isRefreshing || !isOnline}
            className={cn(
              "p-1 rounded transition-colors hover:bg-gray-100 dark:hover:bg-slate-700",
              (isRefreshing || !isOnline) && "cursor-not-allowed opacity-50"
            )}
            title="Force refresh all data"
          >
            <RefreshCw className={cn(
              "w-4 h-4 text-gray-600 dark:text-gray-400",
              isRefreshing && "animate-spin"
            )} />
          </button>

          {/* Detailed Status (if enabled) */}
          {isDetailed && refreshStatus && (
            <div className="ml-4 pl-4 border-l border-gray-200 dark:border-slate-700 flex gap-4 text-xs">
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
                  <div key={type} className="flex items-center gap-1">
                    <span className="text-gray-500">{typeLabels[type]}:</span>
                    <span className="text-gray-600 dark:text-gray-400">
                      {getRelativeTime(status.lastRefresh)}
                    </span>
                    {status.listenerCount > 0 && (
                      <span className="text-green-500">●</span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* Dev Mode View - Enhanced with more data */
        <div className="space-y-3">
          {/* Header with expand toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-600" />
                <span className="font-medium text-amber-700 dark:text-amber-400">Dev Refresh Monitor</span>
              </div>
              {isRefreshing && (
                <Activity className="w-4 h-4 animate-pulse text-amber-500" />
              )}
            </div>
            <button
              onClick={() => setExpandedDev(!expandedDev)}
              className="p-1 hover:bg-amber-100 dark:hover:bg-amber-900/30 rounded"
            >
              {expandedDev ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>

          {/* Summary Stats */}
          <div className="flex gap-4 text-xs">
            <div className="flex items-center gap-1">
              <Database className="w-3 h-3" />
              <span>API Calls: {apiCallCount}</span>
            </div>
            <div className="flex items-center gap-1">
              {errorCount > 0 ? <AlertCircle className="w-3 h-3 text-red-500" /> : <div className="w-3 h-3 rounded-full bg-green-500" />}
              <span>Errors: {errorCount}</span>
            </div>
            <div>
              Last: {getRelativeTime(lastRefresh)}
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

          {/* Expanded Details */}
          {expandedDev && (
            <div className="space-y-3 pt-3 border-t border-amber-200 dark:border-amber-800">
              {/* Refresh Status by Type */}
              <div className="space-y-1">
                <div className="text-xs font-medium mb-1">Refresh Status</div>
                {refreshStatus && Object.entries(refreshStatus).map(([type, status]) => (
                  <div key={type} className="flex items-center justify-between text-xs">
                    <span className="text-amber-600 dark:text-amber-500">{type}:</span>
                    <div className="flex items-center gap-2">
                      <span>{getRelativeTime(status.lastRefresh)}</span>
                      {status.listenerCount > 0 && (
                        <span className="px-1 bg-green-500 text-white rounded text-[10px]">
                          {status.listenerCount} listeners
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Recent History */}
              {refreshHistory.length > 0 && (
                <div className="space-y-1">
                  <div className="text-xs font-medium mb-1">Recent Activity</div>
                  <div className="max-h-20 overflow-y-auto space-y-0.5">
                    {refreshHistory.slice().reverse().map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-[10px] text-amber-600/70">
                        <span>{item.type}</span>
                        <span>{item.time.toLocaleTimeString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Manual Controls */}
              <div className="flex gap-2">
                <button
                  onClick={handleManualRefresh}
                  disabled={isRefreshing || !isOnline}
                  className="flex-1 px-2 py-1 bg-amber-200 dark:bg-amber-900 hover:bg-amber-300 dark:hover:bg-amber-800 rounded text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Force Global Refresh
                </button>
                <button
                  onClick={() => {
                    setRefreshHistory([]);
                    setApiCallCount(0);
                    setErrorCount(0);
                  }}
                  className="px-2 py-1 bg-amber-100 dark:bg-amber-950 hover:bg-amber-200 dark:hover:bg-amber-900 rounded text-xs"
                >
                  Clear
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}