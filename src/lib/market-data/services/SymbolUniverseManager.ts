/**
 * Symbol Universe Manager
 * @business-critical: Manages the complete universe of tradeable symbols
 *
 * Responsibilities:
 * - Fetch all active US stock symbols from Polygon
 * - Store symbol metadata (name, exchange, type)
 * - Provide symbol search and validation
 * - Track symbol status (active, delisted, suspended)
 */

import { PolygonProvider } from '../providers/PolygonProvider';
import { StockMetadata } from '../database/types';

export interface SymbolTier {
  name: string;
  symbols: string[];
  updateFrequency: number; // seconds
  priority: number;
}

export interface SymbolUniverseStats {
  totalSymbols: number;
  activeSymbols: number;
  inactiveSymbols: number;
  lastUpdated: Date;
  tiers: {
    [key: string]: number; // tier name -> symbol count
  };
}

export class SymbolUniverseManager {
  private provider: PolygonProvider;
  private symbolCache: Map<string, StockMetadata> = new Map();
  private lastFetchTime: Date | null = null;

  constructor(apiKey?: string) {
    this.provider = new PolygonProvider(apiKey);
  }

  /**
   * Fetch all active symbols from Polygon and store in database
   * This is a one-time setup or periodic refresh (weekly/monthly)
   */
  async refreshSymbolUniverse(): Promise<{
    success: number;
    failed: number;
    total: number;
  }> {
    console.log('🔄 Refreshing symbol universe from Polygon...');

    try {
      // Get all tickers from Polygon (stocks only, active)
      const tickers = await this.provider.getAllTickers('stocks', true);
      console.log(`✅ Found ${tickers.length} active stock symbols`);

      let success = 0;
      let failed = 0;

      // Process in batches to avoid overwhelming the API
      const batchSize = 50;
      for (let i = 0; i < tickers.length; i += batchSize) {
        const batch = tickers.slice(i, i + batchSize);

        for (const symbol of batch) {
          try {
            // Get detailed metadata for each symbol
            const metadata = await this.provider.getTickerDetails(symbol);

            if (metadata) {
              this.symbolCache.set(symbol, metadata);
              success++;
            } else {
              failed++;
            }

            // Small delay to be respectful (even with unlimited API)
            await new Promise(resolve => setTimeout(resolve, 50));
          } catch (error) {
            console.error(`❌ Failed to fetch metadata for ${symbol}:`, error);
            failed++;
          }
        }

        // Progress update
        const progress = ((i + batchSize) / tickers.length * 100).toFixed(1);
        console.log(`⚙️  Progress: ${progress}% (${success} success, ${failed} failed)`);
      }

      this.lastFetchTime = new Date();

      console.log('\n✅ Symbol universe refresh complete!');
      console.log(`   Success: ${success}`);
      console.log(`   Failed: ${failed}`);
      console.log(`   Total: ${success + failed}`);

      return { success, failed, total: success + failed };
    } catch (error) {
      console.error('❌ Failed to refresh symbol universe:', error);
      throw error;
    }
  }

  /**
   * Get all symbols (from cache or fetch if needed)
   */
  async getAllSymbols(): Promise<string[]> {
    if (this.symbolCache.size === 0) {
      // Cache is empty, fetch from Polygon
      const tickers = await this.provider.getAllTickers('stocks', true);
      return tickers;
    }

    return Array.from(this.symbolCache.keys());
  }

  /**
   * Get symbol metadata
   */
  getSymbolMetadata(symbol: string): StockMetadata | undefined {
    return this.symbolCache.get(symbol);
  }

  /**
   * Search symbols by name or ticker
   */
  searchSymbols(query: string, limit: number = 20): StockMetadata[] {
    const queryLower = query.toLowerCase();
    const results: StockMetadata[] = [];

    for (const [symbol, metadata] of this.symbolCache.entries()) {
      if (results.length >= limit) break;

      const symbolMatch = symbol.toLowerCase().includes(queryLower);
      const nameMatch = metadata.companyName?.toLowerCase().includes(queryLower);

      if (symbolMatch || nameMatch) {
        results.push(metadata);
      }
    }

    return results;
  }

  /**
   * Validate if a symbol exists and is active
   */
  async isSymbolValid(symbol: string): Promise<boolean> {
    // Check cache first
    const cached = this.symbolCache.get(symbol);
    if (cached) {
      return cached.isActive || false;
    }

    // Fetch from API if not in cache
    try {
      const metadata = await this.provider.getTickerDetails(symbol);
      if (metadata) {
        this.symbolCache.set(symbol, metadata);
        return metadata.isActive || false;
      }
    } catch (error) {
      console.error(`Failed to validate symbol ${symbol}:`, error);
    }

    return false;
  }

  /**
   * Get symbol universe statistics
   */
  getStats(): SymbolUniverseStats {
    let activeCount = 0;
    let inactiveCount = 0;

    for (const metadata of this.symbolCache.values()) {
      if (metadata.isActive) {
        activeCount++;
      } else {
        inactiveCount++;
      }
    }

    return {
      totalSymbols: this.symbolCache.size,
      activeSymbols: activeCount,
      inactiveSymbols: inactiveCount,
      lastUpdated: this.lastFetchTime || new Date(0),
      tiers: {
        // Future: categorize by market cap, liquidity, etc.
      }
    };
  }

  /**
   * Get tiered symbol lists for progressive updates
   */
  getSymbolTiers(): SymbolTier[] {
    // Start simple: all symbols get hourly updates
    // Future: implement smart tiering based on user watchlists, liquidity, etc.
    const allSymbols = Array.from(this.symbolCache.keys());

    return [
      {
        name: 'all_stocks',
        symbols: allSymbols,
        updateFrequency: 3600, // 1 hour
        priority: 1
      }
    ];
  }

  /**
   * Clear the cache (useful for testing)
   */
  clearCache(): void {
    this.symbolCache.clear();
    this.lastFetchTime = null;
  }
}
