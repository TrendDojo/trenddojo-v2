"use client";

import React from 'react';
import { RefreshCw, CheckCircle, AlertCircle, Clock, Loader2 } from 'lucide-react';
import { useBrokerDataRefresh, RefreshOptions } from '@/hooks/useBrokerDataRefresh';
import { cn } from '@/lib/utils';

interface BrokerDataRefreshIndicatorProps {
  refreshOptions?: RefreshOptions;
  showStatus?: boolean;
  showLastUpdate?: boolean;
  showManualRefresh?: boolean;
  className?: string;
  onDataUpdate?: (data: any) => void;
}

export function BrokerDataRefreshIndicator({
  refreshOptions = {
    triggers: ['mount', 'focus'],
    staleAfterMs: 60000, // 1 minute
  },
  showStatus = true,
  showLastUpdate = true,
  showManualRefresh = true,
  className = '',
  onDataUpdate,
}: BrokerDataRefreshIndicatorProps) {
  const {
    data,
    status,
    error,
    lastFetchTime,
    refresh,
    isStale,
    isLoading,
  } = useBrokerDataRefresh({
    ...refreshOptions,
    onSuccess: (data) => {
      refreshOptions?.onSuccess?.(data);
      onDataUpdate?.(data);
    },
  });

  // Format relative time
  const getRelativeTime = () => {
    if (!lastFetchTime) return 'Never';

    const now = new Date();
    const diffMs = now.getTime() - lastFetchTime.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);

    if (diffSecs < 10) return 'Just now';
    if (diffSecs < 60) return `${diffSecs}s ago`;
    if (diffMins < 60) return `${diffMins}m ago`;
    return 'Over an hour ago';
  };

  // Get status icon
  const getStatusIcon = () => {
    if (isLoading) {
      return <Loader2 className="w-4 h-4 animate-spin" />;
    }
    if (status === 'error') {
      return <AlertCircle className="w-4 h-4 text-red-500" />;
    }
    if (isStale) {
      return <Clock className="w-4 h-4 text-yellow-500" />;
    }
    if (status === 'success') {
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    }
    return <RefreshCw className="w-4 h-4 text-gray-400" />;
  };

  // Get status text
  const getStatusText = () => {
    if (isLoading) return 'Refreshing...';
    if (status === 'error') return error?.message || 'Error fetching data';
    if (isStale) return 'Data may be stale';
    if (status === 'success') {
      const connectedCount = data.filter(b => b.isConnected).length;
      const totalCount = data.length;
      if (connectedCount === 0) {
        return 'No brokers connected';
      }
      return `${connectedCount} of ${totalCount} broker${totalCount !== 1 ? 's' : ''} connected`;
    }
    return 'Not loaded';
  };

  return (
    <div className={cn(
      "flex items-center gap-3 px-3 py-2 rounded-lg",
      "bg-gray-50 dark:bg-slate-800/50",
      "border border-gray-200 dark:border-slate-700",
      className
    )}>
      {/* Status Indicator */}
      {showStatus && (
        <div className="flex items-center gap-2">
          {getStatusIcon()}
          <span className={cn(
            "text-sm",
            status === 'error' && "text-red-600 dark:text-red-400",
            isStale && "text-yellow-600 dark:text-yellow-400",
            status === 'success' && !isStale && "text-green-600 dark:text-green-400",
            status === 'idle' && "text-gray-500 dark:text-gray-400"
          )}>
            {getStatusText()}
          </span>
        </div>
      )}

      {/* Last Update Time */}
      {showLastUpdate && lastFetchTime && (
        <div className="text-xs text-gray-500 dark:text-gray-400">
          Updated {getRelativeTime()}
        </div>
      )}

      {/* Manual Refresh Button */}
      {showManualRefresh && (
        <button
          onClick={() => refresh()}
          disabled={isLoading}
          className={cn(
            "ml-auto p-1 rounded hover:bg-gray-200 dark:hover:bg-slate-700",
            "transition-colors",
            isLoading && "cursor-not-allowed opacity-50"
          )}
          title="Refresh broker data"
        >
          <RefreshCw className={cn(
            "w-4 h-4 text-gray-600 dark:text-gray-400",
            isLoading && "animate-spin"
          )} />
        </button>
      )}
    </div>
  );
}