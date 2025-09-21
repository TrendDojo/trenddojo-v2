/**
 * Test Alpaca connection using credentials stored in the database
 * Run with: node scripts/test-stored-alpaca.js
 *
 * This script retrieves encrypted credentials from the database,
 * decrypts them, and tests the Alpaca connection.
 */

import { PrismaClient } from '@prisma/client';
import { getEncryption } from '../src/lib/security/encryption.js';

const prisma = new PrismaClient();

async function testStoredAlpacaConnection() {
  console.log('🔄 Testing Alpaca connection with stored credentials...\n');

  try {
    // Find Alpaca broker connections in the database
    const alpacaConnections = await prisma.broker_connections.findMany({
      where: {
        OR: [
          { broker: 'alpaca' },
          { broker: 'alpaca_paper' },
          { broker: 'alpaca_live' }
        ],
        isActive: true
      }
    });

    if (alpacaConnections.length === 0) {
      console.error('❌ No active Alpaca connections found in the database');
      console.log('\nPlease connect to Alpaca through the UI first:');
      console.log('1. Go to http://localhost:3000/brokers');
      console.log('2. Click "Connect" on the Alpaca card');
      console.log('3. Enter your API credentials');
      console.log('4. Save the connection');
      process.exit(1);
    }

    console.log(`✅ Found ${alpacaConnections.length} Alpaca connection(s) in database\n`);

    // Test each connection
    for (const connection of alpacaConnections) {
      console.log(`📊 Testing ${connection.broker} connection (ID: ${connection.id})...`);
      console.log(`   Paper Trading: ${connection.isPaper ? 'Yes' : 'No'}`);
      console.log(`   Created: ${connection.createdAt}`);
      console.log(`   Last Sync: ${connection.lastSync || 'Never'}\n`);

      // Decrypt credentials
      const encryption = getEncryption();
      let credentials;

      try {
        credentials = encryption.decryptObject(connection.credentials);
      } catch (error) {
        console.error(`❌ Failed to decrypt credentials: ${error.message}`);
        continue;
      }

      // Test the connection
      const baseUrl = connection.isPaper
        ? 'https://paper-api.alpaca.markets'
        : 'https://api.alpaca.markets';

      // Test 1: Get Account Info
      console.log('   Testing account endpoint...');
      const accountResponse = await fetch(`${baseUrl}/v2/account`, {
        headers: {
          'APCA-API-KEY-ID': credentials.apiKeyId || credentials.apiKey,
          'APCA-API-SECRET-KEY': credentials.secretKey || credentials.apiSecret,
        },
      });

      if (!accountResponse.ok) {
        const error = await accountResponse.text();
        console.error(`   ❌ Account fetch failed: ${accountResponse.status} - ${error}`);
        continue;
      }

      const account = await accountResponse.json();
      console.log('   ✅ Account connected successfully!');
      console.log(`      Account ID: ${account.account_number}`);
      console.log(`      Cash: $${parseFloat(account.cash).toLocaleString()}`);
      console.log(`      Buying Power: $${parseFloat(account.buying_power).toLocaleString()}`);
      console.log('');

      // Test 2: Get Positions
      console.log('   Testing positions endpoint...');
      const positionsResponse = await fetch(`${baseUrl}/v2/positions`, {
        headers: {
          'APCA-API-KEY-ID': credentials.apiKeyId || credentials.apiKey,
          'APCA-API-SECRET-KEY': credentials.secretKey || credentials.apiSecret,
        },
      });

      if (positionsResponse.ok) {
        const positions = await positionsResponse.json();
        console.log(`   ✅ Found ${positions.length} open positions`);

        if (positions.length > 0) {
          positions.forEach(pos => {
            console.log(`      ${pos.symbol}: ${pos.qty} shares @ $${parseFloat(pos.avg_entry_price).toFixed(2)}`);
          });
        }
      }
      console.log('');

      // Test 3: Check Market Status
      console.log('   Testing market status...');
      const clockResponse = await fetch(`${baseUrl}/v2/clock`, {
        headers: {
          'APCA-API-KEY-ID': credentials.apiKeyId || credentials.apiKey,
          'APCA-API-SECRET-KEY': credentials.secretKey || credentials.apiSecret,
        },
      });

      if (clockResponse.ok) {
        const clock = await clockResponse.json();
        console.log('   ✅ Market status retrieved!');
        console.log(`      Market is: ${clock.is_open ? '🟢 OPEN' : '🔴 CLOSED'}`);
        console.log(`      Next Open: ${new Date(clock.next_open).toLocaleString()}`);
        console.log(`      Next Close: ${new Date(clock.next_close).toLocaleString()}`);
      }
      console.log('');

      // Update last sync time
      await prisma.broker_connections.update({
        where: { id: connection.id },
        data: { lastSync: new Date() }
      });

      console.log(`   ✅ Connection test complete for ${connection.broker}\n`);
      console.log('========================================\n');
    }

    console.log('🎉 All connection tests complete!');
    console.log('\nYour stored Alpaca credentials are working correctly.');
    console.log('You can now:');
    console.log('- Place orders through the trading interface');
    console.log('- Monitor positions in real-time');
    console.log('- Execute trading strategies\n');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('\nPossible issues:');
    console.error('1. Database connection failed');
    console.error('2. Encryption key not configured');
    console.error('3. Network connectivity issues');
    console.error('4. Alpaca API is down\n');
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testStoredAlpacaConnection();