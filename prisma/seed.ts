import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'
import { generateId, now, withIdAndTimestamps, withId } from './seed-helpers'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed with new Portfolio > Strategy > Position > Execution structure...')

  // Clean database
  await prisma.executions.deleteMany()
  await prisma.position_notes.deleteMany()
  await prisma.positions.deleteMany()
  await prisma.trade_plan_notes.deleteMany()
  await prisma.trade_plans.deleteMany()
  await prisma.strategies.deleteMany()
  await prisma.risk_settings.deleteMany()
  await prisma.portfolios.deleteMany()
  await prisma.users.deleteMany()

  // Create test users
  const users = await Promise.all([
    prisma.users.create({
      data: withIdAndTimestamps({
        email: 'pro@trader.com',
        name: 'Pro Trader',
        subscriptionTier: 'pro',
        subscriptionStatus: 'active',
      }),
    }),
    prisma.users.create({
      data: withIdAndTimestamps({
        email: 'swing@trader.com',
        name: 'Swing Trader',
        subscriptionTier: 'basic',
        subscriptionStatus: 'active',
      }),
    }),
  ])

  const [proUser, swingUser] = users

  // Create portfolios
  const proPortfolio = await prisma.portfolios.create({
    data: withIdAndTimestamps({
      userId: proUser.id,
      name: 'Pro Trading Account',
      broker: 'alpaca',
      accountType: 'live',
      baseCurrency: 'USD',
      startingBalance: 100000,
      currentBalance: 125000,
    }),
  })

  const swingPortfolio = await prisma.portfolios.create({
    data: withIdAndTimestamps({
      userId: swingUser.id,
      name: 'Swing Trading Account',
      broker: 'manual',
      accountType: 'paper',
      baseCurrency: 'USD',
      startingBalance: 50000,
      currentBalance: 52500,
    }),
  })

  // Create strategies
  const momentumStrategy = await prisma.strategies.create({
    data: withIdAndTimestamps({
      portfolioId: proPortfolio.id,
      name: 'Momentum Breakout',
      description: 'Trade breakouts on high volume with strong momentum indicators',
      status: 'active',
      type: 'momentum',
      allocatedCapital: 50000,
      maxPositions: 5,
      maxRiskPercent: 2.0,
      maxDrawdown: 10.0,
      entryRules: {
        minVolume: 1000000,
        minPrice: 10,
        breakoutPeriod: 20,
        rsiThreshold: 70,
      },
      exitRules: {
        stopLoss: 0.02,
        trailingStop: 0.03,
        profitTarget: 0.10,
      },
    }),
  })

  const meanReversionStrategy = await prisma.strategies.create({
    data: withIdAndTimestamps({
      portfolioId: proPortfolio.id,
      name: 'Mean Reversion',
      description: 'Buy oversold conditions in quality stocks',
      status: 'active',
      type: 'mean_reversion',
      allocatedCapital: 30000,
      maxPositions: 3,
      maxRiskPercent: 1.5,
      entryRules: {
        rsiOversold: 30,
        bollingerBandTouch: true,
        minMarketCap: 1000000000,
      },
      exitRules: {
        rsiTarget: 50,
        stopLoss: 0.03,
      },
    }),
  })

  const swingStrategy = await prisma.strategies.create({
    data: withIdAndTimestamps({
      portfolioId: swingPortfolio.id,
      name: 'Weekly Swing',
      description: 'Capture multi-day moves using daily charts',
      status: 'active',
      type: 'swing',
      allocatedCapital: 25000,
      maxPositions: 4,
      maxRiskPercent: 2.5,
    }),
  })

  // Create positions with executions

  // Position 1: NVDA - Winning momentum trade (closed)
  const nvdaPosition = await prisma.positions.create({
    data: withId({
      strategyId: momentumStrategy.id,
      symbol: 'NVDA',
      assetType: 'stock',
      direction: 'long',
      status: 'closed',
      currentQuantity: 0,
      avgEntryPrice: 450.00,
      avgExitPrice: 495.00,
      stopLoss: 440.00,
      takeProfit: 500.00,
      realizedPnl: 4455.00,
      totalFees: 45.00,
      netPnl: 4410.00,
      maxGainPercent: 11.11,
      maxLossPercent: -1.5,
      holdingDays: 15,
      rMultiple: 4.5,
      openedAt: new Date('2024-08-15T09:30:00Z'),
      closedAt: new Date('2024-08-30T15:45:00Z'),
    }),
  })

  // NVDA executions
  await prisma.executions.createMany({
    data: [
      withId({
        positionId: nvdaPosition.id,
        type: 'buy',
        quantity: 50,
        price: 448.50,
        commission: 5.00,
        exchangeFees: 2.50,
        secFees: 0.50,
        totalFees: 8.00,
        grossValue: 22425.00,
        netValue: 22433.00,
        executedAt: new Date('2024-08-15T09:30:00Z'),
      }),
      withId({
        positionId: nvdaPosition.id,
        type: 'buy',
        quantity: 50,
        price: 451.50,
        commission: 5.00,
        exchangeFees: 2.50,
        secFees: 0.50,
        totalFees: 8.00,
        grossValue: 22575.00,
        netValue: 22583.00,
        executedAt: new Date('2024-08-15T10:15:00Z'),
      }),
      withId({
        positionId: nvdaPosition.id,
        type: 'sell',
        quantity: 50,
        price: 492.00,
        commission: 5.00,
        exchangeFees: 2.50,
        secFees: 0.75,
        totalFees: 8.25,
        grossValue: 24600.00,
        netValue: 24591.75,
        executedAt: new Date('2024-08-30T14:00:00Z'),
      }),
      withId({
        positionId: nvdaPosition.id,
        type: 'sell',
        quantity: 50,
        price: 498.00,
        commission: 5.00,
        exchangeFees: 2.50,
        secFees: 0.75,
        totalFees: 8.25,
        grossValue: 24900.00,
        netValue: 24891.75,
        executedAt: new Date('2024-08-30T15:45:00Z'),
      }),
    ],
  })

  // Position 2: AAPL - Open position with partial exit
  const aaplPosition = await prisma.positions.create({
    data: withId({
      strategyId: meanReversionStrategy.id,
      symbol: 'AAPL',
      assetType: 'stock',
      direction: 'long',
      status: 'open',
      currentQuantity: 150,
      avgEntryPrice: 175.00,
      stopLoss: 170.00,
      takeProfit: 185.00,
      realizedPnl: 500.00,
      unrealizedPnl: 750.00,
      totalFees: 35.00,
      netPnl: 1215.00,
      openedAt: new Date('2024-09-01T09:30:00Z'),
    }),
  })

  await prisma.executions.createMany({
    data: [
      withId({
        positionId: aaplPosition.id,
        type: 'buy',
        quantity: 100,
        price: 174.50,
        commission: 5.00,
        totalFees: 5.00,
        grossValue: 17450.00,
        netValue: 17455.00,
        executedAt: new Date('2024-09-01T09:30:00Z'),
      }),
      withId({
        positionId: aaplPosition.id,
        type: 'buy',
        quantity: 100,
        price: 175.50,
        commission: 5.00,
        totalFees: 5.00,
        grossValue: 17550.00,
        netValue: 17555.00,
        executedAt: new Date('2024-09-02T10:00:00Z'),
      }),
      withId({
        positionId: aaplPosition.id,
        type: 'sell',
        quantity: 50,
        price: 180.00,
        commission: 5.00,
        secFees: 0.25,
        totalFees: 5.25,
        grossValue: 9000.00,
        netValue: 8994.75,
        executedAt: new Date('2024-09-05T14:30:00Z'),
      }),
    ],
  })

  // Position 3: TSLA - Losing trade (closed)
  const tslaPosition = await prisma.positions.create({
    data: withId({
      strategyId: momentumStrategy.id,
      symbol: 'TSLA',
      assetType: 'stock',
      direction: 'long',
      status: 'closed',
      currentQuantity: 0,
      avgEntryPrice: 250.00,
      avgExitPrice: 242.00,
      stopLoss: 240.00,
      realizedPnl: -800.00,
      totalFees: 20.00,
      netPnl: -820.00,
      maxGainPercent: 2.0,
      maxLossPercent: -3.2,
      holdingDays: 5,
      rMultiple: -0.8,
      openedAt: new Date('2024-08-20T09:30:00Z'),
      closedAt: new Date('2024-08-25T09:35:00Z'),
    }),
  })

  // Position 4: SPY - Swing trade (open)
  const spyPosition = await prisma.positions.create({
    data: withId({
      strategyId: swingStrategy.id,
      symbol: 'SPY',
      assetType: 'etf',
      direction: 'long',
      status: 'open',
      currentQuantity: 50,
      avgEntryPrice: 440.00,
      stopLoss: 430.00,
      takeProfit: 460.00,
      unrealizedPnl: 250.00,
      totalFees: 10.00,
      netPnl: 240.00,
      openedAt: new Date('2024-09-08T09:30:00Z'),
    }),
  })

  // Create trade plans
  const tradePlans = await prisma.trade_plans.createMany({
    data: [
      withIdAndTimestamps({
        portfolioId: proPortfolio.id,
        positionId: nvdaPosition.id,
        symbol: 'NVDA',
        direction: 'long',
        thesis: 'AI momentum continues with earnings beat. Breaking out of consolidation.',
        setupType: 'breakout',
        plannedEntry: 445.00,
        plannedStop: 435.00,
        plannedTarget: 500.00,
        plannedRiskAmount: 1000.00,
        plannedRiskPercent: 1.0,
        riskRewardRatio: 5.5,
        setupQuality: 5,
        confidence: 9,
        status: 'executed',
        outcome: 'win',
        executionQuality: 4,
        lessons: 'Good entry timing, could have held longer for full target',
        executedAt: new Date('2024-08-15T09:30:00Z'),
        reviewedAt: new Date('2024-09-01T10:00:00Z'),
      }),
      withIdAndTimestamps({
        portfolioId: proPortfolio.id,
        symbol: 'META',
        direction: 'long',
        thesis: 'Reels monetization improving, VR investments starting to pay off',
        setupType: 'pullback',
        plannedEntry: 500.00,
        plannedStop: 485.00,
        plannedTarget: 530.00,
        plannedRiskAmount: 1500.00,
        plannedRiskPercent: 1.5,
        riskRewardRatio: 2.0,
        setupQuality: 4,
        confidence: 7,
        status: 'pending',
      }),
      withIdAndTimestamps({
        portfolioId: swingPortfolio.id,
        symbol: 'QQQ',
        direction: 'short',
        thesis: 'Tech overbought, expecting pullback to 50MA',
        setupType: 'reversal',
        plannedEntry: 380.00,
        plannedStop: 385.00,
        plannedTarget: 365.00,
        plannedRiskAmount: 500.00,
        riskRewardRatio: 3.0,
        setupQuality: 3,
        confidence: 6,
        status: 'idea',
      }),
    ],
  })

  // Add position notes
  await prisma.position_notes.createMany({
    data: [
      withId({
        positionId: aaplPosition.id,
        noteType: 'management',
        content: 'Took partial profits at 180, letting rest run with trailing stop',
      }),
      withId({
        positionId: nvdaPosition.id,
        noteType: 'observation',
        content: 'Strong volume on breakout, institutional buying evident',
      }),
    ],
  })

  // Update strategy performance metrics
  await prisma.strategies.update({
    where: { id: momentumStrategy.id },
    data: {
      totalPositions: 2,
      closedPositions: 2,
      winningPositions: 1,
      losingPositions: 1,
      totalPnl: 3655.00,
      totalFees: 65.00,
      netPnl: 3590.00,
      winRate: 50.00,
      avgWin: 4455.00,
      avgLoss: 800.00,
      profitFactor: 5.57,
      lastCalculated: new Date(),
    },
  })

  await prisma.strategies.update({
    where: { id: meanReversionStrategy.id },
    data: {
      totalPositions: 1,
      openPositions: 1,
      totalPnl: 1250.00,
      totalFees: 35.00,
      netPnl: 1215.00,
      lastCalculated: new Date(),
    },
  })

  // Create risk settings
  await prisma.risk_settings.createMany({
    data: [
      withIdAndTimestamps({
        userId: proUser.id,
        portfolioId: proPortfolio.id,
        maxRiskPerTrade: 2.0,
        maxDailyRisk: 6.0,
        maxWeeklyRisk: 10.0,
        maxOpenPositions: 10,
        maxCorrelatedPositions: 4,
        positionSizingMethod: 'fixed_risk',
      }),
      withIdAndTimestamps({
        userId: swingUser.id,
        portfolioId: swingPortfolio.id,
        maxRiskPerTrade: 2.5,
        maxDailyRisk: 5.0,
        maxWeeklyRisk: 8.0,
        maxOpenPositions: 5,
        maxCorrelatedPositions: 2,
        positionSizingMethod: 'fixed_units',
      }),
    ],
  })

  console.log('✅ Seed completed successfully!')
  console.log(`Created:
  - ${users.length} users
  - 2 portfolios
  - 3 strategies
  - 4 positions
  - Multiple executions with detailed fees
  - Trade plans and notes`)
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })