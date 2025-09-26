"use client";

import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Unified Data Refresh Framework
 * @business-critical: Ensures data consistency across the application
 *
 * This framework provides a consistent way to refresh data from any source
 * with support for multiple triggers, retry logic, and stale data detection.
 */

export type RefreshTrigger =
  | 'mount'        // When component mounts
  | 'focus'        // When window/tab gains focus
  | 'visible'      // When document becomes visible
  | 'interval'     // At regular intervals
  | 'manual'       // User-triggered
  | 'navigation'   // Route change
  | 'connection';  // When connection status changes

export type DataStatus =
  | 'idle'
  | 'fetching'
  | 'success'
  | 'error'
  | 'stale';

export interface RefreshConfig<T> {
  // Data fetching
  fetcher: () => Promise<T>;

  // Trigger configuration
  triggers?: RefreshTrigger[];
  intervalMs?: number;
  staleAfterMs?: number;

  // Retry configuration
  retryCount?: number;
  retryDelayMs?: number;

  // Callbacks
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;

  // Options
  enabled?: boolean;
  dedupingInterval?: number; // Prevent duplicate requests within this window
  refreshOnWindowFocus?: boolean; // Subset of 'focus' trigger
  refreshOnReconnect?: boolean;
}

const DEFAULT_CONFIG = {
  triggers: ['mount'] as RefreshTrigger[],
  intervalMs: 0,
  staleAfterMs: 60000, // 1 minute
  retryCount: 3,
  retryDelayMs: 1000,
  enabled: true,
  dedupingInterval: 2000, // 2 seconds
  refreshOnWindowFocus: true,
  refreshOnReconnect: true,
};

export function useDataRefresh<T>(config: RefreshConfig<T>) {
  const opts = { ...DEFAULT_CONFIG, ...config };
  const [data, setData] = useState<T | null>(null);
  const [status, setStatus] = useState<DataStatus>('idle');
  const [error, setError] = useState<Error | null>(null);
  const [lastFetchTime, setLastFetchTime] = useState<Date | null>(null);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const retryCountRef = useRef(0);
  const lastFetchAttemptRef = useRef<number>(0);
  const isMountedRef = useRef(true);

  // Check if we should dedupe this request
  const shouldDedupe = useCallback(() => {
    const now = Date.now();
    const timeSinceLastAttempt = now - lastFetchAttemptRef.current;
    return timeSinceLastAttempt < opts.dedupingInterval!;
  }, [opts.dedupingInterval]);

  // Main refresh function
  const refresh = useCallback(async (force: boolean = false) => {
    // DEBUG: console.log('[DataRefresh] refresh called, force:', force, 'enabled:', opts.enabled, 'status:', status);

    // Don't refresh if disabled
    if (!opts.enabled) {
    // DEBUG: console.log('[DataRefresh] Skipping - disabled');
      return;
    }

    // Don't refresh if already fetching (unless forced)
    if (status === 'fetching' && !force) {
    // DEBUG: console.log('[DataRefresh] Skipping - already fetching');
      return;
    }

    // Check deduping (unless forced)
    if (!force && shouldDedupe()) {
    // DEBUG: console.log('[DataRefresh] Skipping due to deduping interval');
      return;
    }

    // DEBUG: console.log('[DataRefresh] Starting fetch...');
    lastFetchAttemptRef.current = Date.now();
    setStatus('fetching');
    setError(null);

    try {
      const result = await opts.fetcher();

      // Check if component is still mounted
      if (!isMountedRef.current) return;

      setData(result);
      setStatus('success');
      setLastFetchTime(new Date());
      retryCountRef.current = 0;

      opts.onSuccess?.(result);
    } catch (err) {
      // Check if component is still mounted
      if (!isMountedRef.current) return;

      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      setStatus('error');

      // Retry logic
      if (retryCountRef.current < opts.retryCount!) {
        retryCountRef.current++;
    // DEBUG: console.log(`[DataRefresh] Retrying (${retryCountRef.current}/${opts.retryCount})...`);

        retryTimeoutRef.current = setTimeout(() => {
          refresh(true);
        }, opts.retryDelayMs! * Math.pow(2, retryCountRef.current - 1)); // Exponential backoff
      } else {
        opts.onError?.(error);
        retryCountRef.current = 0;
      }
    }
  }, [opts, status, shouldDedupe]);

  // Check if data is stale
  const isStale = useCallback(() => {
    if (!lastFetchTime || !opts.staleAfterMs) return false;
    const now = new Date();
    const timeSinceLastFetch = now.getTime() - lastFetchTime.getTime();
    return timeSinceLastFetch > opts.staleAfterMs;
  }, [lastFetchTime, opts.staleAfterMs]);

  // Mount trigger
  useEffect(() => {
    // DEBUG: console.log('[DataRefresh] Mount effect triggered, triggers:', opts.triggers);
    if (opts.triggers?.includes('mount')) {
    // DEBUG: console.log('[DataRefresh] Calling refresh on mount');
      refresh();
    }
    return () => {
      isMountedRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only on mount

  // Focus trigger
  useEffect(() => {
    if (!opts.triggers?.includes('focus') && !opts.refreshOnWindowFocus) return;

    const handleFocus = () => {
      if (isStale() || status === 'error') {
    // DEBUG: console.log('[DataRefresh] Window focused, refreshing stale data...');
        refresh();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [opts.triggers, opts.refreshOnWindowFocus, refresh, isStale, status]);

  // Visible trigger (for tab visibility)
  useEffect(() => {
    if (!opts.triggers?.includes('visible')) return;

    const handleVisibilityChange = () => {
      if (!document.hidden && (isStale() || status === 'error')) {
    // DEBUG: console.log('[DataRefresh] Tab became visible, refreshing...');
        refresh();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [opts.triggers, refresh, isStale, status]);

  // Interval trigger
  useEffect(() => {
    if (!opts.triggers?.includes('interval') || !opts.intervalMs) return;

    intervalRef.current = setInterval(() => {
      // Only refresh if document is visible
      if (!document.hidden) {
    // DEBUG: console.log('[DataRefresh] Interval refresh triggered');
        refresh();
      }
    }, opts.intervalMs);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [opts.triggers, opts.intervalMs, refresh]);

  // Connection trigger (online/offline)
  useEffect(() => {
    if (!opts.triggers?.includes('connection') && !opts.refreshOnReconnect) return;

    const handleOnline = () => {
    // DEBUG: console.log('[DataRefresh] Connection restored, refreshing...');
      refresh();
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [opts.triggers, opts.refreshOnReconnect, refresh]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Update status to stale when appropriate
  useEffect(() => {
    if (status === 'success' && isStale()) {
      setStatus('stale');
    }
  }, [status, isStale, lastFetchTime]);

  return {
    data,
    status,
    error,
    lastFetchTime,
    refresh: () => refresh(true), // Manual refresh always forces
    isStale: isStale(),
    isLoading: status === 'fetching',
    isError: status === 'error',
    isSuccess: status === 'success',
    mutate: setData, // Allow manual data updates
  };
}

/**
 * Preset configurations for common use cases
 */
export const RefreshPresets = {
  // Real-time market data (aggressive)
  marketData: {
    triggers: ['mount', 'focus', 'visible', 'interval'] as RefreshTrigger[],
    intervalMs: 30000, // 30 seconds
    staleAfterMs: 60000, // 1 minute
    retryCount: 3,
    dedupingInterval: 5000,
  },

  // Broker connections (moderate)
  brokerData: {
    triggers: ['mount', 'focus', 'connection'] as RefreshTrigger[],
    staleAfterMs: 300000, // 5 minutes
    retryCount: 2,
    dedupingInterval: 10000,
  },

  // Portfolio positions (conservative)
  positions: {
    triggers: ['mount', 'focus'] as RefreshTrigger[],
    intervalMs: 60000, // 1 minute
    staleAfterMs: 120000, // 2 minutes
    retryCount: 1,
    dedupingInterval: 15000,
  },

  // User profile (minimal)
  userProfile: {
    triggers: ['mount'] as RefreshTrigger[],
    staleAfterMs: 600000, // 10 minutes
    retryCount: 1,
    dedupingInterval: 30000,
  },

  // Strategy performance (periodic)
  performance: {
    triggers: ['mount', 'interval'] as RefreshTrigger[],
    intervalMs: 300000, // 5 minutes
    staleAfterMs: 600000, // 10 minutes
    retryCount: 1,
    dedupingInterval: 60000,
  },
};