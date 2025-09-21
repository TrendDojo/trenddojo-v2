/**
 * Test script for Alpaca connection
 * Run with: node scripts/test-alpaca.js
 *
 * You'll need to set these environment variables first:
 * export ALPACA_API_KEY_ID="your_key_id"
 * export ALPACA_SECRET_KEY="your_secret_key"
 */

const ALPACA_API_KEY_ID = process.env.ALPACA_API_KEY_ID;
const ALPACA_SECRET_KEY = process.env.ALPACA_SECRET_KEY;

if (!ALPACA_API_KEY_ID || !ALPACA_SECRET_KEY) {
  console.error('❌ Please set ALPACA_API_KEY_ID and ALPACA_SECRET_KEY environment variables');
  console.log('\nExample:');
  console.log('export ALPACA_API_KEY_ID="your_key_id"');
  console.log('export ALPACA_SECRET_KEY="your_secret_key"');
  console.log('node scripts/test-alpaca.js');
  process.exit(1);
}

// Test Alpaca connection
async function testAlpacaConnection() {
  console.log('🔄 Testing Alpaca Paper Trading connection...\n');

  const baseUrl = 'https://paper-api.alpaca.markets';

  try {
    // Test 1: Get Account Info
    console.log('📊 Fetching account information...');
    const accountResponse = await fetch(`${baseUrl}/v2/account`, {
      headers: {
        'APCA-API-KEY-ID': ALPACA_API_KEY_ID,
        'APCA-API-SECRET-KEY': ALPACA_SECRET_KEY,
      },
    });

    if (!accountResponse.ok) {
      const error = await accountResponse.text();
      throw new Error(`Account fetch failed: ${accountResponse.status} - ${error}`);
    }

    const account = await accountResponse.json();
    console.log('✅ Account connected successfully!');
    console.log('   Account ID:', account.account_number);
    console.log('   Cash:', `$${parseFloat(account.cash).toLocaleString()}`);
    console.log('   Buying Power:', `$${parseFloat(account.buying_power).toLocaleString()}`);
    console.log('   Pattern Day Trader:', account.pattern_day_trader);
    console.log('');

    // Test 2: Get Positions
    console.log('📈 Fetching positions...');
    const positionsResponse = await fetch(`${baseUrl}/v2/positions`, {
      headers: {
        'APCA-API-KEY-ID': ALPACA_API_KEY_ID,
        'APCA-API-SECRET-KEY': ALPACA_SECRET_KEY,
      },
    });

    if (!positionsResponse.ok) {
      throw new Error(`Positions fetch failed: ${positionsResponse.status}`);
    }

    const positions = await positionsResponse.json();
    console.log(`✅ Found ${positions.length} open positions`);

    if (positions.length > 0) {
      positions.forEach(pos => {
        console.log(`   ${pos.symbol}: ${pos.qty} shares @ $${parseFloat(pos.avg_entry_price).toFixed(2)}`);
      });
    }
    console.log('');

    // Test 3: Check Market Status
    console.log('🕐 Checking market status...');
    const clockResponse = await fetch(`${baseUrl}/v2/clock`, {
      headers: {
        'APCA-API-KEY-ID': ALPACA_API_KEY_ID,
        'APCA-API-SECRET-KEY': ALPACA_SECRET_KEY,
      },
    });

    if (!clockResponse.ok) {
      throw new Error(`Clock fetch failed: ${clockResponse.status}`);
    }

    const clock = await clockResponse.json();
    console.log('✅ Market status retrieved!');
    console.log('   Market is:', clock.is_open ? '🟢 OPEN' : '🔴 CLOSED');
    console.log('   Next Open:', new Date(clock.next_open).toLocaleString());
    console.log('   Next Close:', new Date(clock.next_close).toLocaleString());
    console.log('');

    // Test 4: Get a sample quote (AAPL)
    console.log('💹 Fetching sample market data (AAPL)...');
    const quoteResponse = await fetch(`https://data.alpaca.markets/v2/stocks/AAPL/quotes/latest`, {
      headers: {
        'APCA-API-KEY-ID': ALPACA_API_KEY_ID,
        'APCA-API-SECRET-KEY': ALPACA_SECRET_KEY,
      },
    });

    if (!quoteResponse.ok) {
      throw new Error(`Quote fetch failed: ${quoteResponse.status}`);
    }

    const quoteData = await quoteResponse.json();
    if (quoteData.quote) {
      console.log('✅ Market data accessible!');
      console.log('   AAPL Bid:', `$${quoteData.quote.bp}`);
      console.log('   AAPL Ask:', `$${quoteData.quote.ap}`);
    }
    console.log('');

    // Success summary
    console.log('========================================');
    console.log('🎉 All tests passed successfully!');
    console.log('========================================');
    console.log('\nYour Alpaca Paper Trading account is ready to use.');
    console.log('You can now connect through the TrendDojo UI.\n');

  } catch (error) {
    console.error('\n❌ Connection failed:', error.message);
    console.error('\nPossible issues:');
    console.error('1. Invalid API credentials');
    console.error('2. Make sure you\'re using Paper Trading API keys');
    console.error('3. Check your internet connection');
    console.error('4. Verify API keys are not expired\n');
    process.exit(1);
  }
}

// Run the test
testAlpacaConnection();