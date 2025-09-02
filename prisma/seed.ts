import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

type SeedType = 'empty' | 'dev' | 'demo' | 'test' | 'staging';

async function main() {
  const typeArgIndex = process.argv.findIndex(arg => arg === '--type');
  const seedType = (typeArgIndex !== -1 && process.argv[typeArgIndex + 1] ? process.argv[typeArgIndex + 1] : 'dev') as SeedType;
  
  console.log(`🌱 Seeding database with ${seedType} data...`);

  // Always create subscription limits first
  await seedSubscriptionLimits();

  switch (seedType) {
    case 'empty':
      console.log('✅ Empty seed complete - only subscription limits created');
      break;
    case 'dev':
      await seedDevelopmentData();
      break;
    case 'demo':
      await seedDemoData();
      break;
    case 'test':
      await seedTestData();
      break;
    case 'staging':
      await seedStagingData();
      break;
    default:
      throw new Error(`Unknown seed type: ${seedType}`);
  }
}

async function seedSubscriptionLimits() {
  console.log('📊 Creating subscription limits...');
  
  await prisma.subscriptionLimit.createMany({
    data: [
      {
        tier: 'free',
        maxAccounts: 1,
        maxPositions: 1,
        maxScreenerResults: 5,
        screenerRefreshSeconds: 900,
        hasFundamentals: false,
        hasRealtimeData: false,
        hasApiAccess: false,
        hasBrokerIntegration: false,
        monthlyPrice: 0,
      },
      {
        tier: 'starter',
        maxAccounts: 2,
        maxPositions: 5,
        maxScreenerResults: 25,
        screenerRefreshSeconds: 300,
        hasFundamentals: false,
        hasRealtimeData: false,
        hasApiAccess: false,
        hasBrokerIntegration: true,
        monthlyPrice: 4.99,
      },
      {
        tier: 'basic',
        maxAccounts: 3,
        maxPositions: 15,
        maxScreenerResults: 50,
        screenerRefreshSeconds: 60,
        hasFundamentals: true,
        hasRealtimeData: false,
        hasApiAccess: false,
        hasBrokerIntegration: true,
        monthlyPrice: 14.99,
      },
      {
        tier: 'pro',
        maxAccounts: 10,
        maxPositions: 100,
        maxScreenerResults: 200,
        screenerRefreshSeconds: 5,
        hasFundamentals: true,
        hasRealtimeData: true,
        hasApiAccess: true,
        hasBrokerIntegration: true,
        monthlyPrice: 39.99,
      },
    ],
    skipDuplicates: true,
  });
}

async function seedDevelopmentData() {
  console.log('🔧 Creating development data...');

  // Create test users
  const users = await createTestUsers();
  
  // Create accounts and trades for each user
  for (const user of users) {
    await createAccountsForUser(user.id, user.subscriptionTier);
  }

  // Add some market data
  await seedMarketData();

  console.log('✅ Development seed complete');
}

async function seedDemoData() {
  console.log('🎪 Creating demo data...');

  // Create impressive demo user
  const demoUser = await prisma.user.create({
    data: {
      email: 'demo@trenddojo.com',
      name: 'Demo Trader',
      subscriptionTier: 'pro',
      subscriptionStatus: 'active',
    },
  });

  // Create successful demo account
  const demoAccount = await prisma.account.create({
    data: {
      userId: demoUser.id,
      name: 'Demo Portfolio',
      broker: 'alpaca',
      accountType: 'paper',
      baseCurrency: 'USD',
      startingBalance: 100000,
      currentBalance: 125000, // 25% gain
    },
  });

  // Create risk settings
  await prisma.riskSettings.create({
    data: {
      userId: demoUser.id,
      accountId: demoAccount.id,
      maxRiskPerTrade: 2.0,
      maxDailyRisk: 5.0,
      maxWeeklyRisk: 10.0,
      maxOpenPositions: 8,
      positionSizingMethod: 'fixed_risk',
    },
  });

  // Create impressive winning trades
  await createDemoTrades(demoAccount.id);

  console.log('✅ Demo seed complete');
}

async function seedTestData() {
  console.log('🧪 Creating test data...');

  // Create edge case scenarios for testing
  const testUser = await prisma.user.create({
    data: {
      email: 'test@test.com',
      name: 'Test User',
      subscriptionTier: 'free',
    },
  });

  const testAccount = await prisma.account.create({
    data: {
      userId: testUser.id,
      name: 'Test Account',
      accountType: 'tracking',
      baseCurrency: 'USD',
      startingBalance: 10000,
      currentBalance: 9500,
    },
  });

  // Create edge case trades for testing
  await createTestCaseTrades(testAccount.id);

  console.log('✅ Test seed complete');
}

async function seedStagingData() {
  console.log('🚀 Creating staging data...');
  
  // Similar to dev but with more realistic data volumes
  await seedDevelopmentData();
  
  console.log('✅ Staging seed complete');
}

async function createTestUsers() {
  console.log('👥 Creating test users...');

  const users = [
    {
      email: 'empty@demo.test',
      name: 'Empty User',
      subscriptionTier: 'free' as const,
    },
    {
      email: 'basic@demo.test', 
      name: 'Basic User',
      subscriptionTier: 'basic' as const,
    },
    {
      email: 'pro@demo.test',
      name: 'Pro User', 
      subscriptionTier: 'pro' as const,
    },
  ];

  const createdUsers = [];
  for (const userData of users) {
    const user = await prisma.user.create({ data: userData });
    createdUsers.push(user);
  }

  return createdUsers;
}

async function createAccountsForUser(userId: string, tier: string) {
  console.log(`💼 Creating accounts for ${tier} user...`);

  const accountsToCreate = tier === 'free' ? 1 : tier === 'basic' ? 2 : 3;

  for (let i = 0; i < accountsToCreate; i++) {
    const account = await prisma.account.create({
      data: {
        userId,
        name: `Trading Account ${i + 1}`,
        broker: i === 0 ? 'alpaca' : 'manual',
        accountType: 'paper',
        baseCurrency: 'USD',
        startingBalance: 50000 + (i * 25000),
        currentBalance: 50000 + (i * 25000) + Math.random() * 10000 - 5000,
      },
    });

    // Create risk settings
    await prisma.riskSettings.create({
      data: {
        userId,
        accountId: account.id,
        maxRiskPerTrade: 1.0 + (i * 0.5),
        maxDailyRisk: 3.0 + (i * 1.0),
        maxWeeklyRisk: 6.0 + (i * 2.0),
        maxOpenPositions: tier === 'free' ? 1 : tier === 'basic' ? 5 : 10,
        positionSizingMethod: 'fixed_risk',
      },
    });

    // Create some sample trades
    await createSampleTrades(account.id, tier === 'free' ? 5 : 15);
  }
}

async function createSampleTrades(accountId: string, count: number) {
  const symbols = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'META', 'NVDA', 'NFLX'];
  
  for (let i = 0; i < count; i++) {
    const symbol = symbols[Math.floor(Math.random() * symbols.length)];
    const entryPrice = 100 + Math.random() * 200;
    const stopLoss = entryPrice * (0.95 + Math.random() * 0.05);
    const targetPrice = entryPrice * (1.05 + Math.random() * 0.15);
    const riskAmount = 500 + Math.random() * 1000;
    
    const isWinner = Math.random() > 0.4; // 60% winners
    const exitPrice = isWinner ? 
      targetPrice * (0.8 + Math.random() * 0.4) : 
      stopLoss * (0.95 + Math.random() * 0.1);

    const quantity = riskAmount / Math.abs(entryPrice - stopLoss);
    const positionSizeUsd = quantity * entryPrice;

    await prisma.trade.create({
      data: {
        accountId,
        symbol,
        direction: 'long',
        plannedEntry: entryPrice,
        actualEntry: entryPrice * (0.995 + Math.random() * 0.01),
        entryDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        quantity,
        positionSizeUsd,
        stopLoss,
        initialStop: stopLoss,
        targetPrice,
        riskAmount,
        riskPercent: 2.0,
        riskRewardRatio: Math.min(Math.abs(targetPrice - entryPrice) / Math.abs(entryPrice - stopLoss), 99.99),
        exitPrice: Math.random() > 0.3 ? exitPrice : null, // 70% closed
        exitDate: Math.random() > 0.3 ? new Date() : null,
        exitReason: isWinner ? 'target' : 'stop_loss',
        status: Math.random() > 0.3 ? 'closed' : 'active',
        strategyType: 'momentum',
        setupQuality: Math.floor(Math.random() * 5) + 1,
        marketCondition: ['trending', 'ranging', 'volatile'][Math.floor(Math.random() * 3)],
      },
    });
  }
}

async function createDemoTrades(accountId: string) {
  // Create impressive winning trades for demos
  const winningTrades = [
    { symbol: 'AAPL', entry: 150, exit: 165, risk: 1000 },
    { symbol: 'MSFT', entry: 300, exit: 320, risk: 1200 },
    { symbol: 'GOOGL', entry: 2500, exit: 2650, risk: 1500 },
  ];

  for (const trade of winningTrades) {
    const stopLoss = trade.entry * 0.95;
    const quantity = trade.risk / (trade.entry - stopLoss);
    const pnlAmount = (trade.exit - trade.entry) * quantity;

    await prisma.trade.create({
      data: {
        accountId,
        symbol: trade.symbol,
        direction: 'long',
        plannedEntry: trade.entry,
        actualEntry: trade.entry,
        entryDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        quantity,
        positionSizeUsd: quantity * trade.entry,
        stopLoss,
        initialStop: stopLoss,
        targetPrice: trade.exit,
        riskAmount: trade.risk,
        riskPercent: 2.0,
        exitPrice: trade.exit,
        exitDate: new Date(),
        exitReason: 'target',
        pnlAmount,
        pnlPercent: (pnlAmount / (quantity * trade.entry)) * 100,
        rMultiple: pnlAmount / trade.risk,
        status: 'closed',
        strategyType: 'momentum',
        setupQuality: 5,
        marketCondition: 'trending',
      },
    });
  }
}

async function createTestCaseTrades(accountId: string) {
  // Create specific edge cases for testing
  await prisma.trade.create({
    data: {
      accountId,
      symbol: 'TEST',
      direction: 'long',
      plannedEntry: 100,
      actualEntry: 100,
      quantity: 10,
      positionSizeUsd: 1000,
      stopLoss: 95,
      initialStop: 95,
      targetPrice: 110,
      riskAmount: 50,
      riskPercent: 0.5,
      riskRewardRatio: 2.0,
      status: 'planning',
      strategyType: 'test',
      setupQuality: 3,
    },
  });
}

async function seedMarketData() {
  console.log('📈 Creating market data cache...');

  const symbols = ['AAPL', 'MSFT', 'GOOGL', 'TSLA'];
  const timeframes = ['1d', '1h', '15m'];
  
  for (const symbol of symbols) {
    for (const timeframe of timeframes) {
      // Create last 30 days of data
      for (let i = 0; i < 30; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        
        const basePrice = 100 + Math.random() * 200;
        const high = basePrice + Math.random() * 10;
        const low = basePrice - Math.random() * 10;
        const close = low + Math.random() * (high - low);
        
        await prisma.marketDataCache.create({
          data: {
            symbol,
            timeframe,
            timestamp: date,
            open: basePrice,
            high,
            low,
            close,
            volume: BigInt(Math.floor(Math.random() * 1000000)),
          },
        });
      }
    }
  }
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });