#!/usr/bin/env tsx
/**
 * Test Market Data Sync
 * Tests the complete download pipeline with real Polygon API
 */

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { SymbolUniverseManager } from '../src/lib/market-data/services/SymbolUniverseManager';
import { PriceDownloader } from '../src/lib/market-data/services/PriceDownloader';

async function testSmallSync() {
  console.log('🧪 Testing Small Sync (5 symbols, last 30 days)');
  console.log('━'.repeat(60));

  const testSymbols = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA'];

  // Calculate date range - use actual current date (Jan 2025 in system)
  const endDate = new Date('2025-01-25'); // Use known working date
  const startDate = new Date('2025-01-25');
  startDate.setDate(endDate.getDate() - 30);

  const fromStr = startDate.toISOString().split('T')[0];
  const toStr = endDate.toISOString().split('T')[0];

  const downloader = new PriceDownloader();

  // Track progress
  downloader.onProgress((progress) => {
    process.stdout.write(
      `\r⚙️  Progress: ${progress.percentComplete.toFixed(1)}% | ` +
      `Current: ${progress.currentSymbol} | ` +
      `Completed: ${progress.completed}/${progress.total}`
    );
  });

  const result = await downloader.downloadHistorical({
    symbols: testSymbols,
    startDate: fromStr,
    endDate: toStr,
    batchSize: 5,
    delayMs: 100
  });

  console.log('\n');
  console.log('━'.repeat(60));
  console.log('📊 Test Results:');
  console.log(`   ✅ Success: ${result.success}/${testSymbols.length}`);
  console.log(`   ❌ Failed: ${result.failed}`);
  console.log(`   📈 Total Records: ${result.totalRecords}`);
  console.log(`   ⏱️  Duration: ${(result.duration / 1000).toFixed(2)}s`);

  if (result.errors.length > 0) {
    console.log('\n⚠️  Errors:');
    result.errors.forEach(err => {
      console.log(`   ${err.symbol}: ${err.error}`);
    });
  }

  if (result.success === testSymbols.length) {
    console.log('\n✅ ALL TESTS PASSED!');
    return true;
  } else {
    console.log('\n❌ SOME TESTS FAILED');
    return false;
  }
}

async function testSymbolFetch() {
  console.log('\n🧪 Testing Symbol Universe Fetch');
  console.log('━'.repeat(60));

  const manager = new SymbolUniverseManager();
  const symbols = await manager.getAllSymbols();

  console.log(`✅ Fetched ${symbols.length} symbols`);
  console.log(`📋 Sample symbols: ${symbols.slice(0, 10).join(', ')}`);

  return symbols.length > 0;
}

async function main() {
  console.log('\n🚀 Market Data Sync Test Suite');
  console.log('═'.repeat(60));

  const tests = [
    { name: 'Symbol Fetch', fn: testSymbolFetch },
    { name: 'Small Data Sync', fn: testSmallSync }
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      const result = await test.fn();
      if (result) {
        passed++;
        console.log(`\n✅ ${test.name}: PASSED\n`);
      } else {
        failed++;
        console.log(`\n❌ ${test.name}: FAILED\n`);
      }
    } catch (error) {
      failed++;
      console.error(`\n❌ ${test.name}: ERROR`, error);
    }
  }

  console.log('\n═'.repeat(60));
  console.log('📊 Final Results:');
  console.log(`   ✅ Passed: ${passed}/${tests.length}`);
  console.log(`   ❌ Failed: ${failed}/${tests.length}`);
  console.log('═'.repeat(60));

  process.exit(failed > 0 ? 1 : 0);
}

main().catch(console.error);
