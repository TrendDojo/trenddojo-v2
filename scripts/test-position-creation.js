#!/usr/bin/env node

/**
 * Test script for position creation in dev mode
 * Run with: node scripts/test-position-creation.js
 */

async function testPositionCreation() {
  const baseUrl = 'http://localhost:3011';

  // Test position data
  const positionData = {
    symbol: 'AAPL',
    side: 'buy',
    orderType: 'market',
    quantity: 10,
    timeInForce: 'day',
    accountType: 'dev',
    stopLoss: 145,
    takeProfit: 160
  };

  console.log('🧪 Testing position creation in dev mode...\n');
  console.log('📊 Order details:');
  console.log(`  Symbol: ${positionData.symbol}`);
  console.log(`  Side: ${positionData.side}`);
  console.log(`  Type: ${positionData.orderType}`);
  console.log(`  Quantity: ${positionData.quantity}`);
  console.log(`  Stop Loss: $${positionData.stopLoss}`);
  console.log(`  Take Profit: $${positionData.takeProfit}`);
  console.log(`  Account: ${positionData.accountType}\n`);

  try {
    const response = await fetch(`${baseUrl}/api/brokers/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(positionData)
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('❌ Error:', result.error || 'Unknown error');
      console.error('   Status:', response.status);
      if (result.details) {
        console.error('   Details:', result.details);
      }
      return;
    }

    console.log('✅ Position created successfully!\n');
    console.log('📈 Order details:');
    console.log('  Order ID:', result.order.id);
    console.log('  Symbol:', result.order.symbol);
    console.log('  Side:', result.order.side);
    console.log('  Quantity:', result.order.quantity);
    console.log('  Status:', result.order.status);
    console.log('  Filled Price:', `$${result.order.filledPrice}`);
    console.log('  Filled At:', new Date(result.order.filledAt).toLocaleString());

    if (result.bracketOrders && result.bracketOrders.length > 0) {
      console.log('\n🛡️ Risk Management Orders:');
      result.bracketOrders.forEach(bracket => {
        console.log(`  ${bracket.type}:`, bracket.order);
      });
    }

  } catch (error) {
    console.error('❌ Failed to test position creation:', error.message);
    console.error('   Make sure the dev server is running on port 3011');
  }
}

// Test different order types
async function testLimitOrder() {
  const baseUrl = 'http://localhost:3011';

  const limitOrder = {
    symbol: 'TSLA',
    side: 'buy',
    orderType: 'limit',
    quantity: 5,
    limitPrice: 240.50,
    timeInForce: 'gtc',
    accountType: 'dev'
  };

  console.log('\n📊 Testing limit order...');
  console.log(`  Symbol: ${limitOrder.symbol}`);
  console.log(`  Limit Price: $${limitOrder.limitPrice}\n`);

  try {
    const response = await fetch(`${baseUrl}/api/brokers/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(limitOrder)
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('❌ Limit order failed:', result.error);
      return;
    }

    console.log('✅ Limit order created:', result.order.id);
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run tests
(async () => {
  console.log('========================================');
  console.log('   TrendDojo Position Creation Test    ');
  console.log('========================================\n');

  // Test market order with risk management
  await testPositionCreation();

  // Test limit order
  await testLimitOrder();

  console.log('\n========================================');
  console.log('          Test Complete!                ');
  console.log('========================================');
})();