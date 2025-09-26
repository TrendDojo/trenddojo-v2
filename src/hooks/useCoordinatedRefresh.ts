"use client";

import { useEffect } from 'react';
import { useDataRefresh, RefreshConfig, RefreshPresets } from './useDataRefresh';
import { refreshCoordinator, RefreshEventType } from '@/lib/refresh/RefreshCoordinator';

/**
 * Hook that integrates with the global refresh coordinator
 * This ensures data refreshes are coordinated across the app
 */

interface CoordinatedRefreshConfig<T> extends Omit<RefreshConfig<T>, 'triggers'> {
  refreshType: RefreshEventType;
  preset?: keyof typeof RefreshPresets;
  autoSubscribe?: boolean;
}

export function useCoordinatedRefresh<T>(config: CoordinatedRefreshConfig<T>) {
  const { refreshType, preset, autoSubscribe = true, ...refreshConfig } = config;

  // Use preset if provided, otherwise use custom config
  const presetConfig = preset ? RefreshPresets[preset] : {};
  const finalConfig = {
    ...presetConfig,
    ...refreshConfig,
  };

    // DEBUG: console.log('[useCoordinatedRefresh] Initializing with config:', {
    //   refreshType,
    //   preset,
    //   presetConfig,
    //   finalConfig
    // });

  // Use the base refresh hook
  const refreshState = useDataRefresh<T>(finalConfig);

  // Subscribe to coordinated refresh events
  useEffect(() => {
    if (!autoSubscribe) return;

    const unsubscribe = refreshCoordinator.subscribe(refreshType, async () => {
    // DEBUG: console.log(`[CoordinatedRefresh] Received ${refreshType} refresh event`);
      refreshState.refresh();
    });

    return unsubscribe;
  }, [refreshType, refreshState.refresh, autoSubscribe]);

  return {
    ...refreshState,
    // Additional coordinated methods
    triggerGlobalRefresh: () => refreshCoordinator.triggerRefresh('global'),
    triggerTypeRefresh: () => refreshCoordinator.triggerRefresh(refreshType),
  };
}

/**
 * Example usage for different data types
 */

// Market data hook
export function useMarketDataRefresh<T>(fetcher: () => Promise<T>) {
    // DEBUG: console.log('[useMarketDataRefresh] Initializing with marketData preset');
  return useCoordinatedRefresh<T>({
    fetcher,
    refreshType: 'market-data',
    preset: 'marketData',
  });
}

// Broker data hook
export function useBrokerDataRefreshV2<T>(fetcher: () => Promise<T>) {
  return useCoordinatedRefresh<T>({
    fetcher,
    refreshType: 'broker-data',
    preset: 'brokerData',
  });
}

// Positions hook
export function usePositionsRefresh<T>(fetcher: () => Promise<T>) {
  return useCoordinatedRefresh<T>({
    fetcher,
    refreshType: 'positions',
    preset: 'positions',
  });
}

// Strategy performance hook
export function useStrategyRefresh<T>(fetcher: () => Promise<T>) {
  return useCoordinatedRefresh<T>({
    fetcher,
    refreshType: 'strategies',
    preset: 'performance',
  });
}