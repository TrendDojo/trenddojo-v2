"use client";

import { useState, useEffect, useCallback, useRef } from 'react';

export type RefreshTrigger =
  | 'mount'        // When component mounts
  | 'focus'        // When window/tab gains focus
  | 'interval'     // At regular intervals
  | 'manual'       // User-triggered
  | 'navigation'   // Route change
  | 'login';       // After successful login

export type DataStatus =
  | 'idle'
  | 'fetching'
  | 'success'
  | 'error'
  | 'stale';

export interface BrokerData {
  brokerId: string;
  isConnected: boolean;
  accountId?: string;
  balance?: number;
  buyingPower?: number;
  positions?: number;
  lastUpdated?: Date;
  error?: string;
}

export interface RefreshOptions {
  triggers?: RefreshTrigger[];
  intervalMs?: number;
  staleAfterMs?: number;
  onSuccess?: (data: BrokerData[]) => void;
  onError?: (error: Error) => void;
  retryCount?: number;
  retryDelayMs?: number;
  brokerIds?: string[];  // Filter to specific brokers
}

const DEFAULT_OPTIONS: RefreshOptions = {
  triggers: ['mount'],
  intervalMs: 0, // No interval by default
  staleAfterMs: 60000, // Consider data stale after 1 minute
  retryCount: 1,
  retryDelayMs: 1000,
};

export function useBrokerDataRefresh(options: RefreshOptions = {}) {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const [data, setData] = useState<BrokerData[]>([]);
  const [status, setStatus] = useState<DataStatus>('idle');
  const [error, setError] = useState<Error | null>(null);
  const [lastFetchTime, setLastFetchTime] = useState<Date | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const retryCountRef = useRef(0);

  // Fetch broker data from API
  const fetchBrokerData = useCallback(async (): Promise<BrokerData[]> => {
    // Build URL with optional broker filter
    const url = new URL('/api/brokers/connect', window.location.origin);
    if (opts.brokerIds && opts.brokerIds.length > 0) {
      opts.brokerIds.forEach(id => url.searchParams.append('brokerId', id));
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch broker data: ${response.statusText}`);
    }

    const data = await response.json();

    // Handle the response structure - it returns { connections: [...] }
    const connections = data.connections || [];

    // Transform API response to our BrokerData format
    let brokerData = connections.map((conn: any) => ({
      brokerId: conn.broker,
      isConnected: conn.status === 'connected' && conn.accountInfo !== null,
      accountId: conn.accountInfo?.accountId,
      balance: conn.accountInfo?.balance,
      buyingPower: conn.accountInfo?.buyingPower,
      positions: conn.accountInfo?.positionCount,
      lastUpdated: new Date(),
      error: conn.status === 'error' ? 'Connection failed' : undefined,
    }));

    // Apply client-side filter as fallback if API doesn't support filtering
    if (opts.brokerIds && opts.brokerIds.length > 0) {
      brokerData = brokerData.filter(b => opts.brokerIds!.includes(b.brokerId));
    }

    return brokerData;
  }, [opts.brokerIds]);

  // Main refresh function
  const refresh = useCallback(async (isRetry = false) => {
    // Don't refresh if already fetching (unless it's a retry)
    if (status === 'fetching' && !isRetry) {
      console.log('Already fetching, skipping refresh');
      return;
    }

    setStatus('fetching');
    setError(null);

    try {
      const brokerData = await fetchBrokerData();

      setData(brokerData);
      setStatus('success');
      setLastFetchTime(new Date());
      retryCountRef.current = 0; // Reset retry count on success

      // Call success callback if provided
      opts.onSuccess?.(brokerData);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      setStatus('error');

      // Retry logic
      if (retryCountRef.current < opts.retryCount!) {
        retryCountRef.current++;
        console.log(`Retrying fetch (${retryCountRef.current}/${opts.retryCount})...`);

        retryTimeoutRef.current = setTimeout(() => {
          refresh(true);
        }, opts.retryDelayMs);
      } else {
        // Call error callback if provided
        opts.onError?.(error);
        retryCountRef.current = 0;
      }
    }
  }, [status, fetchBrokerData, opts]);

  // Check if data is stale
  const isStale = useCallback(() => {
    if (!lastFetchTime || !opts.staleAfterMs) return false;

    const now = new Date();
    const timeSinceLastFetch = now.getTime() - lastFetchTime.getTime();
    return timeSinceLastFetch > opts.staleAfterMs;
  }, [lastFetchTime, opts.staleAfterMs]);

  // Handle mount trigger
  useEffect(() => {
    if (opts.triggers?.includes('mount')) {
      refresh();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only on mount - intentionally ignoring refresh dependency

  // Handle focus trigger
  useEffect(() => {
    if (!opts.triggers?.includes('focus')) return;

    const handleFocus = () => {
      // Only refresh if data is stale or error
      if (isStale() || status === 'error') {
        console.log('Window focused, refreshing stale data...');
        refresh();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [opts.triggers, refresh, isStale, status]);

  // Handle interval trigger
  useEffect(() => {
    if (!opts.triggers?.includes('interval') || !opts.intervalMs) return;

    intervalRef.current = setInterval(() => {
      console.log('Interval refresh triggered');
      refresh();
    }, opts.intervalMs);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [opts.triggers, opts.intervalMs, refresh]);

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
    refresh: () => refresh(false), // Manual refresh
    isStale: isStale(),
    isLoading: status === 'fetching',
    isError: status === 'error',
    isSuccess: status === 'success',
  };
}