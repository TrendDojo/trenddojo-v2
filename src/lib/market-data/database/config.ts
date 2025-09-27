/**
 * Market Data Database Configuration
 * Handles environment-specific database connections
 */

import { PrismaClient } from '@prisma/client';

export interface MarketDbConfig {
  isProduction: boolean;
  useSharedMarketData: boolean;
  marketDbUrl?: string;
  localDbUrl: string;
}

/**
 * Get database configuration based on environment
 */
export function getMarketDbConfig(): MarketDbConfig {
  const env = process.env.NODE_ENV || 'development';

  return {
    isProduction: env === 'production',
    useSharedMarketData: env !== 'development', // Staging and prod use shared
    marketDbUrl: process.env.MARKET_DATABASE_URL, // Read-only connection to production
    localDbUrl: process.env.DATABASE_URL || '',
  };
}

/**
 * Create a Prisma client for market data access
 * In production: writes to market schema
 * In staging: reads from production market schema (read-only)
 * In development: uses local database
 */
export function createMarketDataClient(): PrismaClient {
  const config = getMarketDbConfig();

  if (config.useSharedMarketData && config.marketDbUrl) {
    // Staging/Production: Use shared market database
    return new PrismaClient({
      datasources: {
        db: {
          url: config.marketDbUrl
        }
      },
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });
  }

  // Development: Use local database
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });
}

/**
 * Check if current environment has write access to market data
 */
export function hasMarketDataWriteAccess(): boolean {
  const env = process.env.NODE_ENV || 'development';
  // Only production can write to market schema
  return env === 'production';
}

/**
 * Get appropriate table prefix based on environment
 */
export function getTablePrefix(): string {
  const config = getMarketDbConfig();

  if (config.useSharedMarketData) {
    return 'market.'; // Use market schema
  }

  return ''; // Use default public schema in development
}

// Singleton instance
let marketDataClient: PrismaClient | null = null;

export function getMarketDataClient(): PrismaClient {
  if (!marketDataClient) {
    marketDataClient = createMarketDataClient();
  }
  return marketDataClient;
}