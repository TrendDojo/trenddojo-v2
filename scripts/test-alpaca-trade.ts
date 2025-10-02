#!/usr/bin/env tsx
/**
 * Test Alpaca Paper Trading - Proof of Concept
 * Creates a position and places a buy order
 */

import { PrismaClient } from '@prisma/client';
import { AlpacaClient } from '../src/lib/brokers/alpaca/AlpacaClient';

const prisma = new PrismaClient();

async function main() {
  console.log('🧪 Alpaca Paper Trading Test\n');
  console.log('━'.repeat(60));

  try {
    // Step 1: Find user with Alpaca connection
    console.log('\n📋 Step 1: Finding user with Alpaca connection...');

    const brokerConnection = await prisma.broker_connections.findFirst({
      where: {
        broker: 'alpaca',
        isActive: true
      },
      include: {
        users: true
      }
    });

    if (!brokerConnection) {
      throw new Error('No active Alpaca connection found in database. Please connect your Alpaca account through the app first.');
    }

    const user = brokerConnection.users;
    console.log(`✅ Found user: ${user.email} with Alpaca connection`);

    // Step 2: Get or create portfolio
    console.log('\n📋 Step 2: Setting up portfolio...');
    let portfolio = await prisma.portfolios.findFirst({
      where: { userId: user.id }
    });

    if (!portfolio) {
      portfolio = await prisma.portfolios.create({
        data: {
          id: 'portfolio-' + Date.now(),
          userId: user.id,
          name: 'Test Portfolio',
          startingBalance: 100000,
          currentBalance: 100000,
          baseCurrency: 'USD',
          account_status: 'active',
          current_drawdown: 0,
          updatedAt: new Date()
        }
      });
      console.log('✅ Created portfolio');
    } else {
      console.log('✅ Using existing portfolio');
    }

    // Step 3: Get or create strategy
    console.log('\n📋 Step 3: Setting up strategy...');
    let strategy = await prisma.strategies.findFirst({
      where: { portfolioId: portfolio.id }
    });

    if (!strategy) {
      strategy = await prisma.strategies.create({
        data: {
          id: 'strategy-' + Date.now(),
          portfolioId: portfolio.id,
          name: 'Test Strategy',
          status: 'active',
          totalPositions: 0,
          winningPositions: 0,
          totalFees: 0,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });
      console.log('✅ Created strategy');
    } else {
      console.log('✅ Using existing strategy');
    }

    // Step 4: Get Alpaca credentials
    console.log('\n📋 Step 4: Loading Alpaca credentials...');

    // Parse credentials (may be plain JSON or encrypted)
    let credentials;
    try {
      credentials = JSON.parse(brokerConnection.credentials);
      console.log('✅ Credentials loaded (JSON)');
    } catch {
      // If not JSON, credentials might be encrypted or in different format
      // For now, try to use them as-is (assuming format: "key:secret")
      console.log('ℹ️  Credentials not in JSON format, trying alternate format...');
      const parts = brokerConnection.credentials.split(':');
      if (parts.length >= 2) {
        credentials = {
          apiKeyId: parts[0],
          secretKey: parts[1]
        };
        console.log('✅ Credentials loaded (key:secret format)');
      } else {
        throw new Error('Unable to parse credentials. Format not recognized.');
      }
    }

    // Step 5: Initialize Alpaca client
    console.log('\n📋 Step 5: Connecting to Alpaca (Paper Trading)...');
    const alpaca = new AlpacaClient({
      apiKeyId: credentials.apiKeyId || credentials.apiKey,
      secretKey: credentials.secretKey || credentials.secret,
      paperTrading: brokerConnection.isPaper
    });

    await alpaca.connect();
    console.log('✅ Connected to Alpaca');

    // Get account info
    const accountInfo = await alpaca.getAccountInfo();
    console.log(`   Account Balance: $${accountInfo.balance.toFixed(2)}`);
    console.log(`   Buying Power: $${accountInfo.buyingPower.toFixed(2)}`);

    // Step 6: Create position in database
    console.log('\n📋 Step 6: Creating position in database...');
    const symbol = 'AAPL';
    const quantity = 1; // Buy 1 share for testing

    const position = await prisma.positions.create({
      data: {
        id: 'position-' + Date.now(),
        strategyId: strategy.id,
        symbol,
        assetType: 'stock',
        direction: 'long',
        status: 'open',
        currentQuantity: 0, // Will update after order fills
        avgEntryPrice: null,
        stopLoss: null,
        takeProfit: null,
        realizedPnl: 0,
        unrealizedPnl: 0,
        totalFees: 0,
        netPnl: 0,
        openedAt: new Date()
      }
    });
    console.log(`✅ Position created: ${position.id}`);

    // Step 7: Place buy order via Alpaca
    console.log('\n📋 Step 7: Placing buy order...');
    console.log(`   Symbol: ${symbol}`);
    console.log(`   Quantity: ${quantity}`);
    console.log(`   Type: Market`);

    const orderResponse = await alpaca.placeOrder({
      symbol,
      quantity,
      side: 'buy',
      type: 'market',
      timeInForce: 'day'
    });

    console.log(`✅ Order placed!`);
    console.log(`   Order ID: ${orderResponse.orderId}`);
    console.log(`   Status: ${orderResponse.status}`);
    console.log(`   Message: ${orderResponse.message}`);

    // Step 8: Create execution record
    console.log('\n📋 Step 8: Recording execution...');
    const execution = await prisma.executions.create({
      data: {
        id: 'exec-' + Date.now(),
        positionId: position.id,
        type: 'buy',
        symbol,
        quantity,
        price: orderResponse.executedPrice || 0,
        totalValue: (orderResponse.executedPrice || 0) * quantity,
        fees: orderResponse.commission || 0,
        executedAt: new Date(),
        broker: 'alpaca',
        orderId: orderResponse.orderId,
        notes: 'Paper trading test order'
      }
    });
    console.log(`✅ Execution recorded: ${execution.id}`);

    // Step 9: Update position with execution data
    if (orderResponse.executedPrice) {
      console.log('\n📋 Step 9: Updating position...');
      await prisma.positions.update({
        where: { id: position.id },
        data: {
          currentQuantity: quantity,
          avgEntryPrice: orderResponse.executedPrice,
          lastExecutionAt: new Date()
        }
      });
      console.log('✅ Position updated with execution data');
    }

    // Step 10: Summary
    console.log('\n' + '━'.repeat(60));
    console.log('✅ PROOF OF CONCEPT COMPLETE!\n');
    console.log('📊 Summary:');
    console.log(`   Portfolio: ${portfolio.name}`);
    console.log(`   Strategy: ${strategy.name}`);
    console.log(`   Position: ${symbol} x${quantity}`);
    console.log(`   Order ID: ${orderResponse.orderId}`);
    console.log(`   Status: ${orderResponse.status}`);
    if (orderResponse.executedPrice) {
      console.log(`   Execution Price: $${orderResponse.executedPrice.toFixed(2)}`);
      console.log(`   Total Cost: $${(orderResponse.executedPrice * quantity).toFixed(2)}`);
    }
    console.log('━'.repeat(60));

    // Cleanup connection
    await alpaca.disconnect();

  } catch (error) {
    console.error('\n❌ Error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(console.error);
