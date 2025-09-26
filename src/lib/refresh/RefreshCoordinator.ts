/**
 * Global Refresh Coordinator
 * @business-critical: Coordinates data refresh across the entire application
 *
 * This singleton manages refresh events to prevent thundering herd problems
 * and ensures efficient data fetching across components.
 */

type RefreshEventType =
  | 'global'          // Refresh everything
  | 'market-data'     // Market prices, quotes
  | 'broker-data'     // Broker connections, account info
  | 'positions'       // Trading positions
  | 'strategies'      // Strategy performance
  | 'user-data';      // User profile, settings

type RefreshListener = (type: RefreshEventType) => void | Promise<void>;

class RefreshCoordinator {
  private static instance: RefreshCoordinator;
  private listeners: Map<RefreshEventType, Set<RefreshListener>>;
  private lastRefreshTime: Map<RefreshEventType, number>;
  private refreshQueue: Set<RefreshEventType>;
  private isProcessing: boolean;

  // Minimum time between refreshes for each type (in ms)
  private cooldowns: Record<RefreshEventType, number> = {
    'global': 10000,       // 10 seconds
    'market-data': 5000,   // 5 seconds
    'broker-data': 10000,  // 10 seconds
    'positions': 5000,     // 5 seconds
    'strategies': 30000,   // 30 seconds
    'user-data': 60000,    // 1 minute
  };

  private constructor() {
    this.listeners = new Map();
    this.lastRefreshTime = new Map();
    this.refreshQueue = new Set();
    this.isProcessing = false;

    // Initialize listener sets
    Object.keys(this.cooldowns).forEach(type => {
      this.listeners.set(type as RefreshEventType, new Set());
    });

    // Listen for global events
    if (typeof window !== 'undefined') {
      this.setupGlobalListeners();
    }
  }

  public static getInstance(): RefreshCoordinator {
    if (!RefreshCoordinator.instance) {
      RefreshCoordinator.instance = new RefreshCoordinator();
    }
    return RefreshCoordinator.instance;
  }

  private setupGlobalListeners() {
    // Refresh on window focus
    window.addEventListener('focus', () => {
      this.scheduleRefresh('global');
    });

    // Refresh on reconnection
    window.addEventListener('online', () => {
    // DEBUG: console.log('[RefreshCoordinator] Network reconnected, scheduling global refresh');
      this.scheduleRefresh('global');
    });

    // Listen for visibility changes
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        this.scheduleRefresh('market-data');
      }
    });

    // Listen for user activity after idle
    let idleTimer: NodeJS.Timeout;
    const resetIdleTimer = () => {
      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
        // User has been idle for 5 minutes
    // DEBUG: console.log('[RefreshCoordinator] User idle detected');
      }, 300000);
    };

    ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(event => {
      document.addEventListener(event, resetIdleTimer, true);
    });
  }

  /**
   * Subscribe to refresh events
   */
  public subscribe(type: RefreshEventType, listener: RefreshListener): () => void {
    const listeners = this.listeners.get(type);
    if (listeners) {
      listeners.add(listener);
    }

    // Return unsubscribe function
    return () => {
      const listeners = this.listeners.get(type);
      if (listeners) {
        listeners.delete(listener);
      }
    };
  }

  /**
   * Trigger a refresh for specific data type
   */
  public async triggerRefresh(type: RefreshEventType): Promise<void> {
    // Check cooldown
    const lastRefresh = this.lastRefreshTime.get(type) || 0;
    const cooldown = this.cooldowns[type];
    const now = Date.now();

    if (now - lastRefresh < cooldown) {
    // DEBUG: console.log(`[RefreshCoordinator] Skipping ${type} refresh (cooldown active)`);
      return;
    }

    // DEBUG: console.log(`[RefreshCoordinator] Triggering ${type} refresh`);
    this.lastRefreshTime.set(type, now);

    // If global refresh, trigger all types
    if (type === 'global') {
      const allTypes: RefreshEventType[] = ['market-data', 'broker-data', 'positions', 'strategies', 'user-data'];
      await Promise.all(allTypes.map(t => this.notifyListeners(t)));
    } else {
      await this.notifyListeners(type);
    }
  }

  /**
   * Schedule a refresh (adds to queue and processes)
   */
  public scheduleRefresh(type: RefreshEventType): void {
    this.refreshQueue.add(type);
    this.processQueue();
  }

  /**
   * Process the refresh queue with rate limiting
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.refreshQueue.size === 0) {
      return;
    }

    this.isProcessing = true;

    while (this.refreshQueue.size > 0) {
      const type = this.refreshQueue.values().next().value;
      if (!type) break;
      this.refreshQueue.delete(type);

      try {
        await this.triggerRefresh(type);
        // Small delay between different refresh types
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`[RefreshCoordinator] Error refreshing ${type}:`, error);
      }
    }

    this.isProcessing = false;
  }

  /**
   * Notify all listeners for a specific type
   */
  private async notifyListeners(type: RefreshEventType): Promise<void> {
    const listeners = this.listeners.get(type);
    if (!listeners || listeners.size === 0) {
      return;
    }

    const promises = Array.from(listeners).map(listener => {
      try {
        const result = listener(type);
        return result instanceof Promise ? result : Promise.resolve();
      } catch (error) {
        console.error('[RefreshCoordinator] Listener error:', error);
        return Promise.resolve();
      }
    });

    await Promise.all(promises);
  }

  /**
   * Get status information
   */
  public getStatus(): Record<RefreshEventType, { lastRefresh: Date | null; listenerCount: number }> {
    const status: any = {};

    for (const [type, listeners] of this.listeners.entries()) {
      const lastRefreshTime = this.lastRefreshTime.get(type);
      status[type] = {
        lastRefresh: lastRefreshTime ? new Date(lastRefreshTime) : null,
        listenerCount: listeners.size,
      };
    }

    return status;
  }

  /**
   * Force refresh all data (bypasses cooldowns)
   */
  public async forceRefreshAll(): Promise<void> {
    // DEBUG: console.log('[RefreshCoordinator] Force refreshing all data');

    // Clear cooldowns temporarily
    this.lastRefreshTime.clear();

    await this.triggerRefresh('global');
  }
}

// Export singleton instance
export const refreshCoordinator = RefreshCoordinator.getInstance();

// Export types
export type { RefreshEventType, RefreshListener };