/**
 * Test Market Data Cron Sync
 *
 * Tests the exact same code path as the Vercel cron job.
 * Uses a small subset of symbols for fast feedback.
 *
 * Usage:
 *   npm run test:cron                    # Test with default 5 symbols
 *   tsx scripts/test-cron-sync.ts AAPL  # Test with specific symbols
 */

import { PriceDownloader } from '../src/lib/market-data/services/PriceDownloader';

const DEFAULT_TEST_SYMBOLS = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA'];

async function testCronSync() {
  console.log('🧪 Testing Cron Sync (Small Dataset)');
  console.log('━'.repeat(60));

  // Use command line args or defaults
  const symbols = process.argv.slice(2).length > 0
    ? process.argv.slice(2)
    : DEFAULT_TEST_SYMBOLS;

  console.log(`📊 Testing with ${symbols.length} symbols: ${symbols.join(', ')}`);
  console.log(`🔗 Database: ${process.env.DATABASE_URL?.split('@')[1]?.split(':')[0] || 'Unknown'}`);
  console.log('');

  const startTime = Date.now();

  try {
    const downloader = new PriceDownloader(process.env.POLYGON_API_KEY);
    const result = await downloader.downloadLatest(symbols);

    const duration = Date.now() - startTime;

    console.log('\n✅ Test Complete!');
    console.log('━'.repeat(60));
    console.log(`⏱️  Duration: ${(duration / 1000).toFixed(2)}s`);
    console.log(`✅ Success: ${result.success}/${symbols.length} symbols`);
    console.log(`❌ Failed: ${result.failed}/${symbols.length} symbols`);
    console.log(`📈 Records: ${result.totalRecords}`);

    if (result.errors.length > 0) {
      console.log('\n⚠️  Errors:');
      result.errors.forEach(err => {
        console.log(`   ${err.symbol}: ${err.error}`);
      });
    }

    console.log('\n📝 This is exactly what the Vercel cron will do (but with 8000+ symbols)');

    process.exit(result.failed > 0 ? 1 : 0);
  } catch (error) {
    console.error('\n❌ Test Failed:', error);
    process.exit(1);
  }
}

testCronSync();
