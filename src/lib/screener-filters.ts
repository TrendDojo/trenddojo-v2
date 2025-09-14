// Screener filter management system

export interface ScreenerFilter {
  id?: string;
  name: string;
  description?: string;
  filters: {
    search?: string;
    sector?: string;
    minPrice?: string;
    maxPrice?: string;
    minVolume?: string;
    minMarketCap?: string;
    minChange?: string;
    maxPE?: string;
    signal?: string;
    // Technical indicators
    rsiMin?: string;
    rsiMax?: string;
    above50MA?: boolean;
    above200MA?: boolean;
    // Volume filters
    volumeAboveAvg?: boolean;
    // Custom criteria
    customCriteria?: Record<string, any>;
  };
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  isDefault?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

// Predefined filter templates
export const DEFAULT_FILTERS: ScreenerFilter[] = [
  {
    id: 'momentum',
    name: 'Momentum Stocks',
    description: 'Stocks with strong upward momentum',
    filters: {
      minChange: '2',
      signal: 'bullish',
      above50MA: true,
      volumeAboveAvg: true,
    },
    sortBy: 'changePercent',
    sortOrder: 'desc',
    isDefault: true,
  },
  {
    id: 'oversold',
    name: 'Oversold Bounce',
    description: 'Potentially oversold stocks for reversal',
    filters: {
      signal: 'oversold',
      rsiMax: '30',
      maxPrice: '100',
    },
    sortBy: 'rsi',
    sortOrder: 'asc',
    isDefault: true,
  },
  {
    id: 'breakout',
    name: 'Breakout Candidates',
    description: 'High volume stocks near 52-week highs',
    filters: {
      minVolume: '1000000',
      minChange: '1',
      above50MA: true,
      above200MA: true,
    },
    sortBy: 'volume',
    sortOrder: 'desc',
    isDefault: true,
  },
  {
    id: 'value',
    name: 'Value Picks',
    description: 'Undervalued stocks with low P/E',
    filters: {
      maxPE: '15',
      minMarketCap: '10', // In billions
      sector: 'all',
    },
    sortBy: 'pe',
    sortOrder: 'asc',
    isDefault: true,
  },
  {
    id: 'tech-growth',
    name: 'Tech Growth',
    description: 'Technology sector growth stocks',
    filters: {
      sector: 'Technology',
      minChange: '0',
      minMarketCap: '1',
    },
    sortBy: 'marketCap',
    sortOrder: 'desc',
    isDefault: true,
  },
  {
    id: 'penny-stocks',
    name: 'Penny Stocks',
    description: 'Low-priced high-volatility stocks',
    filters: {
      maxPrice: '5',
      minVolume: '500000',
    },
    sortBy: 'changePercent',
    sortOrder: 'desc',
    isDefault: true,
  },
  {
    id: 'large-cap-safe',
    name: 'Large Cap Safe',
    description: 'Stable large-cap stocks',
    filters: {
      minMarketCap: '100', // 100B+
      maxPE: '30',
      signal: 'all',
    },
    sortBy: 'marketCap',
    sortOrder: 'desc',
    isDefault: true,
  },
];

// Local storage key
const STORAGE_KEY = 'trenddojo_screener_filters';
const RECENT_FILTERS_KEY = 'trenddojo_recent_filters';

export class ScreenerFilterService {
  // Save filter to local storage
  static saveToLocal(filter: ScreenerFilter): void {
    const filters = this.getLocalFilters();
    
    if (filter.id) {
      // Update existing filter
      const index = filters.findIndex(f => f.id === filter.id);
      if (index !== -1) {
        filters[index] = { ...filter, updatedAt: new Date() };
      } else {
        filters.push({ ...filter, createdAt: new Date(), updatedAt: new Date() });
      }
    } else {
      // Create new filter with generated ID
      const newFilter = {
        ...filter,
        id: `custom_${Date.now()}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      filters.push(newFilter);
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filters));
  }

  // Get all saved filters from local storage
  static getLocalFilters(): ScreenerFilter[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const filters = JSON.parse(stored);
        // Merge with default filters
        return [...DEFAULT_FILTERS, ...filters];
      }
    } catch (error) {
      console.error('Error loading saved filters:', error);
    }
    return DEFAULT_FILTERS;
  }

  // Delete a saved filter
  static deleteFilter(filterId: string): void {
    // Can't delete default filters
    if (DEFAULT_FILTERS.some(f => f.id === filterId)) {
      console.warn('Cannot delete default filter');
      return;
    }
    
    const filters = this.getLocalFilters()
      .filter(f => f.id !== filterId && !f.isDefault);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filters));
  }

  // Save recently used filter
  static saveRecentFilter(filter: ScreenerFilter): void {
    try {
      const recent = this.getRecentFilters();
      // Remove if already exists
      const filtered = recent.filter(f => f.name !== filter.name);
      // Add to beginning
      filtered.unshift(filter);
      // Keep only last 5
      const toSave = filtered.slice(0, 5);
      localStorage.setItem(RECENT_FILTERS_KEY, JSON.stringify(toSave));
    } catch (error) {
      console.error('Error saving recent filter:', error);
    }
  }

  // Get recently used filters
  static getRecentFilters(): ScreenerFilter[] {
    try {
      const stored = localStorage.getItem(RECENT_FILTERS_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading recent filters:', error);
    }
    return [];
  }

  // Export filters as JSON
  static exportFilters(): string {
    const filters = this.getLocalFilters().filter(f => !f.isDefault);
    return JSON.stringify(filters, null, 2);
  }

  // Import filters from JSON
  static importFilters(jsonString: string): void {
    try {
      const imported = JSON.parse(jsonString);
      if (Array.isArray(imported)) {
        imported.forEach(filter => {
          this.saveToLocal({
            ...filter,
            id: undefined, // Generate new ID
            isDefault: false,
          });
        });
      }
    } catch (error) {
      console.error('Error importing filters:', error);
      throw new Error('Invalid filter format');
    }
  }

  // Apply filter to current screen
  static applyFilter(filter: ScreenerFilter): void {
    // This will be called from the UI component
    // The component will use these values to update its state
    this.saveRecentFilter(filter);
  }
}

// Database operations (for future implementation)
export class ScreenerFilterDB {
  // Save filter to database (when user is logged in)
  static async saveToDatabase(filter: ScreenerFilter, userId: string): Promise<void> {
    const response = await fetch('/api/screener/filters', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...filter, userId }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to save filter');
    }
  }

  // Get user's saved filters from database
  static async getUserFilters(userId: string): Promise<ScreenerFilter[]> {
    const response = await fetch(`/api/screener/filters?userId=${userId}`);
    
    if (!response.ok) {
      throw new Error('Failed to load filters');
    }
    
    return response.json();
  }

  // Sync local filters with database
  static async syncFilters(userId: string): Promise<void> {
    const localFilters = ScreenerFilterService.getLocalFilters()
      .filter(f => !f.isDefault);
    
    for (const filter of localFilters) {
      await this.saveToDatabase(filter, userId);
    }
  }
}