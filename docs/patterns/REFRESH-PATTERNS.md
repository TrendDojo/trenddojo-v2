# Refresh Patterns

*Last updated: 2025-09-26*

## Overview

TrendDojo uses a unified refresh system that coordinates all data updates through a central RefreshCoordinator. This ensures consistency, prevents excessive API calls, and provides enhanced visibility in development.

## Architecture

### Core Components

1. **RefreshCoordinator** (`/src/lib/refresh/RefreshCoordinator.ts`)
   - Singleton pattern for global coordination
   - Event-based refresh triggers
   - Built-in cooldowns and rate limiting
   - Queue management for sequential processing

2. **GlobalRefreshIndicator** (`/src/components/ui/GlobalRefreshIndicator.tsx`)
   - Visual feedback for refresh activity
   - Multiple display variants (minimal, compact, detailed, dev)
   - Dev mode with enhanced debugging features

3. **Data Refresh Hooks** (`/src/hooks/`)
   - `useDataRefresh` - Base hook with triggers
   - `useCoordinatedRefresh` - Integrates with coordinator
   - `useMarketDataRefresh` - Market data specific preset

## Refresh Event Types

```typescript
type RefreshEventType =
  | 'global'        // Refresh everything
  | 'market-data'   // Market prices, quotes
  | 'broker-data'   // Broker connections, account info
  | 'positions'     // Trading positions
  | 'strategies'    // Strategy performance
  | 'user-data'     // User profile, settings
```

## Usage Patterns

### 1. Subscribe to Refresh Events

```typescript
import { refreshCoordinator } from '@/lib/refresh/RefreshCoordinator';

// In your component
useEffect(() => {
  const unsubscribe = refreshCoordinator.subscribe('market-data', async () => {
    console.log('[Component] Refreshing market data');
    await fetchData();
  });

  return unsubscribe; // Clean up on unmount
}, []);
```

### 2. Trigger Manual Refresh

```typescript
// Trigger specific type
refreshCoordinator.triggerRefresh('market-data');

// Force global refresh (bypasses cooldowns)
await refreshCoordinator.forceRefreshAll();
```

### 3. Add Visual Indicator

```tsx
import { GlobalRefreshIndicator } from '@/components/ui/GlobalRefreshIndicator';

// Minimal (production)
<GlobalRefreshIndicator variant="minimal" />

// Compact with controls
<GlobalRefreshIndicator variant="compact" />

// Detailed with all refresh types
<GlobalRefreshIndicator variant="detailed" showDetails={true} />

// Dev mode with full debugging
<GlobalRefreshIndicator variant="dev" />
```

### 4. Automatic Interval Refresh

```typescript
// Set up periodic refresh through coordinator
useEffect(() => {
  const interval = setInterval(() => {
    refreshCoordinator.triggerRefresh('market-data');
  }, 60000); // Every 60 seconds

  return () => clearInterval(interval);
}, []);
```

## Implementation Examples

### Screener Page Integration

```typescript
// src/app/screener/page.tsx
useEffect(() => {
  // Initial load
  fetchMarketData();

  // Subscribe to refresh events
  const unsubscribe = refreshCoordinator.subscribe('market-data', async () => {
    await fetchMarketData();
  });

  // Periodic refresh
  const interval = setInterval(() => {
    refreshCoordinator.triggerRefresh('market-data');
  }, 60000);

  return () => {
    clearInterval(interval);
    unsubscribe();
  };
}, []);
```

### Symbol Page Integration

```typescript
// src/app/symbol/[symbol]/page.tsx
useEffect(() => {
  if (!symbol) return;

  // Initial load
  fetchData();

  // Subscribe to market-data events
  const unsubscribe = refreshCoordinator.subscribe('market-data', async () => {
    console.log(`[Symbol ${symbol}] Refreshing via coordinator`);
    await fetchData();
  });

  return unsubscribe;
}, [symbol]);
```

## Cooldown Configuration

Each refresh type has a minimum time between refreshes:

```typescript
private cooldowns: Record<RefreshEventType, number> = {
  'global': 10000,       // 10 seconds
  'market-data': 5000,   // 5 seconds
  'broker-data': 10000,  // 10 seconds
  'positions': 5000,     // 5 seconds
  'strategies': 30000,   // 30 seconds
  'user-data': 60000,    // 1 minute
};
```

## Dev Mode Features

In development, the GlobalRefreshIndicator provides:

- **API Call Counter** - Track total API calls made
- **Error Counter** - Monitor failed refreshes
- **Active Refresh Types** - See what's currently refreshing
- **Refresh History** - Last 10 refresh events with timestamps
- **Listener Count** - Number of subscribers per event type
- **Manual Controls** - Force refresh and clear stats

## Best Practices

1. **Use Event Types Correctly**
   - `market-data` for price/quote updates
   - `positions` for portfolio changes
   - `broker-data` for account/connection updates
   - `global` sparingly for full app refresh

2. **Avoid Direct Fetching**
   - Subscribe to coordinator events instead of polling
   - Let coordinator handle rate limiting

3. **Clean Up Subscriptions**
   - Always return unsubscribe function in useEffect
   - Prevents memory leaks and duplicate handlers

4. **Respect Cooldowns**
   - Don't bypass cooldowns unless absolutely necessary
   - Use `forceRefreshAll()` only for user-initiated actions

5. **Dev Mode Visibility**
   - Check dev indicator for excessive refreshing
   - Monitor API call counts
   - Review error patterns

## Migration Guide

### From Direct Fetching

Before:
```typescript
useEffect(() => {
  fetchData();
  const interval = setInterval(fetchData, 60000);
  return () => clearInterval(interval);
}, []);
```

After:
```typescript
useEffect(() => {
  fetchData();

  const unsubscribe = refreshCoordinator.subscribe('market-data', fetchData);

  const interval = setInterval(() => {
    refreshCoordinator.triggerRefresh('market-data');
  }, 60000);

  return () => {
    clearInterval(interval);
    unsubscribe();
  };
}, []);
```

### Benefits
- Coordinated refreshes prevent duplicate API calls
- Built-in rate limiting
- Visibility into refresh activity
- Centralized error handling potential
- Easy to add global refresh features

## Future Enhancements

1. **WebSocket Integration** - Real-time updates instead of polling
2. **Smart Scheduling** - Adjust frequency based on market hours
3. **Batch Updates** - Combine multiple refresh types
4. **Error Recovery** - Automatic retry with backoff
5. **Analytics** - Track refresh patterns and optimize