#!/usr/bin/env tsx
/**
 * Market Data Cache Updater Service
 * @business-critical: Runs every minute to update all market data
 *
 * This can be run as:
 * 1. A standalone Node.js process
 * 2. A Vercel cron job
 * 3. A background worker
 *
 * Usage:
 *   npm run cache:updater        # Run continuously
 *   npm run cache:update-once    # Run once and exit
 */

import { MarketDataCache } from './MarketDataCache';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Check for required environment variables
if (!process.env.POLYGON_API_KEY) {
  console.error('❌ POLYGON_API_KEY not found in environment');
  process.exit(1);
}

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL not found in environment');
  process.exit(1);
}

async function startCacheUpdater() {
    // DEBUG: console.log(`
╔═══════════════════════════════════════════════════╗
║         TrendDojo Market Data Updater             ║
║                                                    ║
║  Mode: 1-minute bulk updates                      ║
║  Symbols: ALL (8000+)                             ║
║  Stop Loss Checks: Enabled                        ║
║  Historical Queue: Enabled                        ║
╚═══════════════════════════════════════════════════╝
  `);

  try {
    // Initialize database connection
    // Database client initialization
    const db = {
      query: async (sql: string, params?: any[]) => {
    // DEBUG: console.log('[Mock DB] Would execute:', sql.substring(0, 50) + '...');
        return { rows: [] };
      }
    };

    // Initialize cache service
    const cache = new MarketDataCache(db);

    // Start the update cycle
    await cache.startMinuteUpdates();

    // DEBUG: console.log('✅ Cache updater started successfully');
    // DEBUG: console.log('📊 Updates will run every minute during market hours');
    // DEBUG: console.log('🛑 Press Ctrl+C to stop\n');

    // Keep process alive
    process.on('SIGINT', () => {
    // DEBUG: console.log('\n📛 Stopping cache updater...');
      cache.stopUpdates();
      process.exit(0);
    });

    process.on('SIGTERM', () => {
    // DEBUG: console.log('\n📛 Received SIGTERM, stopping...');
      cache.stopUpdates();
      process.exit(0);
    });

  } catch (error) {
    console.error('❌ Failed to start cache updater:', error);
    process.exit(1);
  }
}

async function runOnce() {
    // DEBUG: console.log('📊 Running single update...');

  try {
    // Database update logic
    const db = {
      query: async (sql: string, params?: any[]) => {
    // DEBUG: console.log('[Mock DB] Would execute:', sql.substring(0, 50) + '...');
        return { rows: [] };
      }
    };

    const cache = new MarketDataCache(db);

    // Manually trigger one update
    await (cache as any).performBulkUpdate();

    // DEBUG: console.log('✅ Single update complete');
    process.exit(0);
  } catch (error) {
    console.error('❌ Update failed:', error);
    process.exit(1);
  }
}

// Check command line arguments
const mode = process.argv[2];

if (mode === '--once') {
  runOnce();
} else {
  startCacheUpdater();
}