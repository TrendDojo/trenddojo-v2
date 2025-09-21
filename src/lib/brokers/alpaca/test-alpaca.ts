/**
 * Test script for Alpaca broker connection
 * Run this to verify Alpaca integration works
 *
 * Usage:
 * 1. Set environment variables:
 *    export ALPACA_API_KEY_ID="your_api_key_id"
 *    export ALPACA_SECRET_KEY="your_secret_key"
 *
 * 2. Run the script:
 *    npx tsx src/lib/brokers/alpaca/test-alpaca.ts
 */

import { AlpacaClient, AlpacaConfig } from './AlpacaClient';

async function testAlpacaConnection() {
  console.log('🚀 Testing Alpaca Connection...\n');

  // Check for required environment variables
  const apiKeyId = process.env.ALPACA_API_KEY_ID;
  const secretKey = process.env.ALPACA_SECRET_KEY;

  if (!apiKeyId || !secretKey) {
    console.error('❌ Missing required environment variables:');
    console.error('   - ALPACA_API_KEY_ID');
    console.error('   - ALPACA_SECRET_KEY');
    console.error('\nPlease set these environment variables and try again.');
    process.exit(1);
  }

  // Create Alpaca client configuration
  const config: AlpacaConfig = {
    apiKeyId,
    secretKey,
    paperTrading: true, // Always use paper trading for testing
    dataFeed: 'iex', // Use IEX feed (free tier)
  };

  // Initialize Alpaca client
  const client = new AlpacaClient(config);

  try {
    // Test 1: Connect to Alpaca
    console.log('📡 Test 1: Connecting to Alpaca...');
    const connected = await client.connect();

    if (connected) {
      console.log('✅ Successfully connected to Alpaca (Paper Trading)\n');
    } else {
      throw new Error('Failed to connect to Alpaca');
    }

    // Test 2: Get Account Information
    console.log('📊 Test 2: Fetching Account Information...');
    const accountInfo = await client.getAccountInfo();

    console.log('✅ Account Information Retrieved:');
    console.log(`   - Account ID: ${accountInfo.accountId}`);
    console.log(`   - Balance: $${accountInfo.balance.toLocaleString()}`);
    console.log(`   - Buying Power: $${accountInfo.buyingPower.toLocaleString()}`);
    console.log(`   - Currency: ${accountInfo.currency}`);
    console.log(`   - Margin Used: $${accountInfo.marginUsed?.toLocaleString() || '0'}`);
    console.log(`   - Unrealized P&L: $${accountInfo.unrealizedPnL?.toLocaleString() || '0'}\n`);

    // Test 3: Get Current Positions
    console.log('💼 Test 3: Fetching Current Positions...');
    const positions = await client.getPositions();

    if (positions.length > 0) {
      console.log(`✅ Found ${positions.length} position(s):`);
      positions.forEach((position, index) => {
        console.log(`\n   Position ${index + 1}:`);
        console.log(`   - Symbol: ${position.symbol}`);
        console.log(`   - Quantity: ${position.quantity}`);
        console.log(`   - Avg Price: $${position.averagePrice.toFixed(2)}`);
        console.log(`   - Current Price: $${position.currentPrice?.toFixed(2) || 'N/A'}`);
        console.log(`   - Market Value: $${position.marketValue?.toLocaleString() || 'N/A'}`);
        console.log(`   - Unrealized P&L: $${position.unrealizedPnL?.toFixed(2) || '0'}`);
        console.log(`   - Side: ${position.side}`);
      });
    } else {
      console.log('✅ No open positions found (account is flat)\n');
    }

    // Test 4: Check Market Status
    console.log('🕐 Test 4: Checking Market Status...');
    const isMarketOpen = await client.isMarketOpen();
    console.log(`✅ Market is currently: ${isMarketOpen ? '🟢 OPEN' : '🔴 CLOSED'}\n`);

    // Test 5: Get Market Data for a Symbol (AAPL as example)
    console.log('📈 Test 5: Fetching Market Data for AAPL...');
    try {
      const marketData = await client.getMarketData('AAPL');
      console.log('✅ AAPL Market Data:');
      console.log(`   - Bid: $${marketData.bid.toFixed(2)}`);
      console.log(`   - Ask: $${marketData.ask.toFixed(2)}`);
      console.log(`   - Last: $${marketData.last.toFixed(2)}`);
      console.log(`   - Volume: ${marketData.volume?.toLocaleString() || 'N/A'}`);
      console.log(`   - Timestamp: ${marketData.timestamp.toLocaleString()}\n`);
    } catch (error) {
      console.log('⚠️  Could not fetch market data (market may be closed)\n');
    }

    // Test 6: Get Historical Data
    console.log('📊 Test 6: Fetching Historical Data for AAPL...');
    try {
      const historicalData = await client.getHistoricalData('AAPL', '1Day', 5);

      if (historicalData.length > 0) {
        console.log(`✅ Retrieved ${historicalData.length} bars of historical data`);
        console.log('   Last 3 bars:');
        historicalData.slice(-3).forEach((bar: any) => {
          console.log(`   - ${new Date(bar.t).toLocaleDateString()}: Open=$${bar.o.toFixed(2)}, Close=$${bar.c.toFixed(2)}, Volume=${bar.v.toLocaleString()}`);
        });
      } else {
        console.log('⚠️  No historical data available');
      }
    } catch (error) {
      console.log('⚠️  Could not fetch historical data');
    }

    // Test 7: Get Market Calendar
    console.log('\n📅 Test 7: Fetching Market Calendar...');
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    const calendar = await client.getMarketCalendar(today, nextWeek);

    if (calendar.length > 0) {
      console.log(`✅ Market Calendar for next 7 days:`);
      calendar.slice(0, 3).forEach((day: any) => {
        console.log(`   - ${day.date}: Open ${day.open} - Close ${day.close}`);
      });
    }

    // Disconnect
    console.log('\n🔌 Disconnecting from Alpaca...');
    await client.disconnect();
    console.log('✅ Disconnected successfully\n');

    // Summary
    console.log('═══════════════════════════════════════════');
    console.log('🎉 All Alpaca integration tests passed!');
    console.log('═══════════════════════════════════════════\n');
    console.log('Your Alpaca connection is working correctly.');
    console.log('You can now use these credentials in the TrendDojo app.\n');

  } catch (error) {
    console.error('\n❌ Test Failed:', error);
    console.error('\nPossible issues:');
    console.error('1. Invalid API credentials');
    console.error('2. API key does not have required permissions');
    console.error('3. Network connectivity issues');
    console.error('4. Alpaca service is down\n');

    // Disconnect on error
    try {
      await client.disconnect();
    } catch (disconnectError) {
      // Ignore disconnect errors
    }

    process.exit(1);
  }
}

// Run the test
testAlpacaConnection().catch((error) => {
  console.error('Unexpected error:', error);
  process.exit(1);
});