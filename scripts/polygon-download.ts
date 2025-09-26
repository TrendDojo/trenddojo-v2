#!/usr/bin/env tsx
/**
 * Polygon Data Download Script
 * Downloads historical market data from Polygon.io
 */

import { PolygonProvider } from '../src/lib/market-data/providers/PolygonProvider';
import { MarketDatabase } from '../src/lib/market-data/database/MarketDatabase';
import { DailyPrice } from '../src/lib/market-data/database/types';

// Load environment variables
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function downloadDailyData(symbols: string[], years: number = 5) {
  console.log(`\n📊 Polygon Daily Data Download`);
  console.log('━'.repeat(50));
  console.log(`📈 Symbols: ${symbols.length}`);
  console.log(`📅 Years: ${years}`);
  console.log('');

  const provider = new PolygonProvider();
  const db = new MarketDatabase();
  await db.initialize();

  // Use actual current date (Jan 2025) not system date
  const endDate = new Date('2025-01-25');
  const startDate = new Date('2025-01-25');
  startDate.setFullYear(endDate.getFullYear() - years);

  const fromStr = startDate.toISOString().split('T')[0];
  const toStr = endDate.toISOString().split('T')[0];

  let successCount = 0;
  let failCount = 0;
  let totalRecords = 0;

  for (let i = 0; i < symbols.length; i++) {
    const symbol = symbols[i];
    const progress = ((i + 1) / symbols.length * 100).toFixed(1);

    process.stdout.write(
      `\r⚙️  [${i + 1}/${symbols.length}] ${progress}% | ` +
      `Current: ${symbol} | Success: ${successCount} | Failed: ${failCount}`
    );

    try {
      const bars = await provider.getDailyBars(symbol, fromStr, toStr);

      if (bars.length > 0) {
        db.insertPrices(bars, { skipDuplicates: true });
        totalRecords += bars.length;
        successCount++;

        // Update sync status
        db.updateSyncStatus({
          symbol,
          earliestDate: bars[0].date,
          latestDate: bars[bars.length - 1].date,
          recordCount: bars.length,
          syncStatus: 'complete',
          dataSource: 'polygon'
        });
      } else {
        failCount++;
      }

      // Small delay to be nice to servers (even with unlimited)
      await new Promise(resolve => setTimeout(resolve, 100));

    } catch (error) {
      console.error(`\n❌ Error downloading ${symbol}:`, error);
      failCount++;
    }
  }

  console.log('\n\n✅ Download Complete!');
  console.log(`📊 Statistics:`);
  console.log(`   Successful: ${successCount} symbols`);
  console.log(`   Failed: ${failCount} symbols`);
  console.log(`   Total Records: ${totalRecords.toLocaleString()}`);

  const stats = db.getStats();
  console.log(`\n📈 Database Status:`);
  console.log(`   Total Symbols: ${stats.totalSymbols.toLocaleString()}`);
  console.log(`   Total Records: ${stats.totalRecords.toLocaleString()}`);
  console.log(`   Date Range: ${stats.earliestDate} to ${stats.latestDate}`);

  db.close();
}

async function downloadIntradayData(symbols: string[], multiplier: number = 4, timespan: 'hour' | 'minute' = 'hour') {
  console.log(`\n📊 Polygon Intraday Data Download`);
  console.log('━'.repeat(50));
  console.log(`📈 Symbols: ${symbols.length}`);
  console.log(`⏰ Timeframe: ${multiplier} ${timespan}(s)`);
  console.log('');

  const provider = new PolygonProvider();

  // For intraday, we get 2 years max on Starter plan
  // Use actual current date (Jan 2025) not system date
  const endDate = new Date('2025-01-25');
  const startDate = new Date('2025-01-25');
  startDate.setFullYear(endDate.getFullYear() - 2);

  const fromStr = startDate.toISOString().split('T')[0];
  const toStr = endDate.toISOString().split('T')[0];

  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < symbols.length; i++) {
    const symbol = symbols[i];
    const progress = ((i + 1) / symbols.length * 100).toFixed(1);

    process.stdout.write(
      `\r⚙️  [${i + 1}/${symbols.length}] ${progress}% | ` +
      `Current: ${symbol} | Success: ${successCount} | Failed: ${failCount}`
    );

    try {
      const bars = await provider.getIntradayBars(symbol, multiplier, timespan, fromStr, toStr);

      if (bars.length > 0) {
        // For now, log to console - you'd store these in a separate table
        console.log(`\n✓ ${symbol}: ${bars.length} ${multiplier}-${timespan} bars`);
        successCount++;
      } else {
        failCount++;
      }

      await new Promise(resolve => setTimeout(resolve, 100));

    } catch (error) {
      console.error(`\n❌ Error downloading ${symbol}:`, error);
      failCount++;
    }
  }

  console.log('\n\n✅ Intraday Download Complete!');
  console.log(`   Successful: ${successCount} symbols`);
  console.log(`   Failed: ${failCount} symbols`);
}

async function getAllSymbols() {
  console.log(`\n📊 Fetching All Active Symbols from Polygon`);
  console.log('━'.repeat(50));

  const provider = new PolygonProvider();
  const symbols = await provider.getAllTickers();

  console.log(`✅ Found ${symbols.length} active symbols`);

  // Save to file for reference
  const fs = require('fs');
  const path = require('path');
  const outputPath = path.join(process.cwd(), 'temp', 'all-symbols.json');

  fs.writeFileSync(outputPath, JSON.stringify(symbols, null, 2));
  console.log(`📁 Saved to: ${outputPath}`);

  return symbols;
}

// Main CLI handler
async function main() {
  const command = process.argv[2];

  switch (command) {
    case 'daily-sp500':
      await downloadDailyData(PolygonProvider.getSP500Symbols());
      break;

    case 'daily-all':
      const allSymbols = await getAllSymbols();
      await downloadDailyData(allSymbols);
      break;

    case 'intraday-sp500':
      await downloadIntradayData(PolygonProvider.getSP500Symbols(), 4, 'hour');
      break;

    case 'test':
      // Test with just AAPL
      await downloadDailyData(['AAPL'], 1);
      break;

    default:
      console.log(`
Polygon Data Downloader

Usage:
  npm run polygon-download <command>

Commands:
  daily-sp500      Download 5 years daily for S&P 500
  daily-all        Download 5 years daily for all stocks
  intraday-sp500   Download 2 years 4-hour bars for S&P 500
  test             Test download with AAPL

Examples:
  npm run polygon-download test
  npm run polygon-download daily-sp500
      `);
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}