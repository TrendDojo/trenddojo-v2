import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getBrokerManager } from '@/lib/brokers/BrokerManager';
import { getEncryption } from '@/lib/security/encryption';
import { prisma } from '@/lib/db';

export async function GET(request: Request) {
  try {
    // Check authentication
    const session = await auth();
    if (!session || !(session as any)?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get account type from query params
    const { searchParams } = new URL(request.url);
    const accountType = searchParams.get('accountType') || 'paper';

    // Map account type to broker IDs
    let brokerFilter: string[] = [];
    if (accountType === 'live') {
      brokerFilter = ['alpaca_live', 'interactive_brokers_live'];
    } else if (accountType === 'paper') {
      brokerFilter = ['alpaca_paper', 'interactive_brokers_paper'];
    } else if (accountType === 'dev') {
      // Return mock data for dev
      return NextResponse.json({
        positions: getMockPositions()
      });
    }

    // Get active broker connections for the user
    const connections = await prisma.broker_connections.findMany({
      where: {
        userId: (session as any).user.id,
        isActive: true,
        broker: { in: brokerFilter }
      }
    });

    if (connections.length === 0) {
      return NextResponse.json({ positions: [] });
    }

    // Decrypt credentials and fetch positions from each broker
    const encryption = getEncryption();
    const brokerManager = getBrokerManager();
    const allPositions: any[] = [];

    for (const conn of connections) {
      try {
        // Decrypt credentials
        const decryptedConfig = encryption.decryptObject(conn.credentials);

        // Add paperTrading flag for Alpaca
        if (conn.broker === 'alpaca_paper' || conn.broker === 'alpaca_live') {
          decryptedConfig.paperTrading = conn.broker === 'alpaca_paper';
        }

        // Connect to broker
        await brokerManager.connectBroker(
          conn.broker as any,
          decryptedConfig,
          false // Don't set as primary
        );

        // Get broker client and fetch positions
        const brokerClient = brokerManager.getBroker(conn.broker as any);
        if (brokerClient) {
          const positions = await brokerClient.getPositions();

          // Add broker source to each position
          const positionsWithSource = positions.map(pos => ({
            ...pos,
            broker: conn.broker,
            brokerName: brokerClient.name,
            isPaper: conn.isPaper
          }));

          allPositions.push(...positionsWithSource);
        }
      } catch (error) {
        console.error(`Failed to fetch positions from ${conn.broker}:`, error);
        // Continue with other brokers even if one fails
      }
    }

    // Transform positions to match frontend format
    const formattedPositions = allPositions.map((pos, index) => ({
      id: `${pos.broker}-${pos.symbol}-${index}`,
      symbol: pos.symbol,
      name: pos.symbol, // We could enhance this with a symbol lookup service
      side: pos.side,
      quantity: pos.quantity,
      originalQuantity: pos.quantity, // Alpaca doesn't track original
      entryPrice: pos.averagePrice,
      currentPrice: pos.currentPrice,
      stopLoss: undefined, // Would need to fetch open orders
      takeProfit: undefined, // Would need to fetch open orders
      pnl: pos.unrealizedPnL,
      pnlPercent: ((pos.currentPrice - pos.averagePrice) / pos.averagePrice) * 100,
      value: pos.marketValue,
      openDate: pos.openDate.toISOString().split('T')[0],
      strategy: 'Unknown', // Would need to match with strategy records
      status: 'active' as const,
      broker: pos.broker,
      brokerName: pos.brokerName
    }));

    return NextResponse.json({ positions: formattedPositions });
  } catch (error) {
    console.error('Failed to fetch positions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch positions' },
      { status: 500 }
    );
  }
}

// Mock positions for development
function getMockPositions() {
  return [
    {
      id: "dev-1",
      symbol: "AAPL",
      name: "Apple Inc.",
      side: "long",
      quantity: 100,
      originalQuantity: 100,
      entryPrice: 175.50,
      currentPrice: 182.25,
      stopLoss: 170.00,
      takeProfit: 195.00,
      pnl: 675.00,
      pnlPercent: 3.85,
      value: 18225.00,
      openDate: "2024-01-15",
      strategy: "Momentum",
      status: "active",
      broker: "dev",
      brokerName: "Development"
    },
    {
      id: "dev-2",
      symbol: "TSLA",
      name: "Tesla Inc.",
      side: "short",
      quantity: 35,
      originalQuantity: 50,
      entryPrice: 245.00,
      currentPrice: 239.50,
      stopLoss: 250.00,
      takeProfit: 230.00,
      pnl: 192.50,
      pnlPercent: 2.24,
      value: 8382.50,
      openDate: "2024-01-17",
      strategy: "Mean Reversion",
      status: "active",
      broker: "dev",
      brokerName: "Development"
    },
    {
      id: "dev-3",
      symbol: "NVDA",
      name: "NVIDIA Corp.",
      side: "long",
      quantity: 25,
      originalQuantity: 25,
      entryPrice: 680.00,
      currentPrice: 695.50,
      stopLoss: 650.00,
      takeProfit: 750.00,
      pnl: 387.50,
      pnlPercent: 2.28,
      value: 17387.50,
      openDate: "2024-01-20",
      strategy: "Breakout",
      status: "active",
      broker: "dev",
      brokerName: "Development"
    },
    {
      id: "dev-4",
      symbol: "META",
      name: "Meta Platforms",
      side: "long",
      quantity: 60,
      originalQuantity: 75,
      entryPrice: 385.00,
      currentPrice: 378.25,
      stopLoss: 375.00,
      takeProfit: 410.00,
      pnl: -506.25,
      pnlPercent: -1.75,
      value: 22695.00,
      openDate: "2024-01-22",
      strategy: "Value",
      status: "active",
      broker: "dev",
      brokerName: "Development"
    },
    {
      id: "dev-5",
      symbol: "AMZN",
      name: "Amazon.com Inc.",
      side: "long",
      quantity: 150,
      originalQuantity: 150,
      entryPrice: 155.00,
      currentPrice: 158.75,
      stopLoss: 150.00,
      takeProfit: 165.00,
      pnl: 562.50,
      pnlPercent: 2.42,
      value: 23812.50,
      openDate: "2024-01-23",
      strategy: "Swing Trade",
      status: "pending",
      broker: "dev",
      brokerName: "Development"
    },
    {
      id: "dev-6",
      symbol: "GOOGL",
      name: "Alphabet Inc.",
      side: "long",
      quantity: 40,
      originalQuantity: 80,
      entryPrice: 142.50,
      currentPrice: 139.25,
      stopLoss: 138.00,
      takeProfit: 150.00,
      pnl: -260.00,
      pnlPercent: -2.28,
      value: 5570.00,
      openDate: "2024-01-24",
      strategy: "Momentum",
      status: "active",
      broker: "dev",
      brokerName: "Development"
    },
    {
      id: "dev-7",
      symbol: "SPY",
      name: "SPDR S&P 500 ETF",
      side: "long",
      quantity: 200,
      originalQuantity: 200,
      entryPrice: 478.50,
      currentPrice: 482.25,
      stopLoss: 475.00,
      takeProfit: 490.00,
      pnl: 750.00,
      pnlPercent: 0.78,
      value: 96450.00,
      openDate: "2024-01-25",
      strategy: "Core Holding",
      status: "active",
      broker: "dev",
      brokerName: "Development"
    },
    {
      id: "dev-8",
      symbol: "MSFT",
      name: "Microsoft Corp.",
      side: "long",
      quantity: 45,
      originalQuantity: 60,
      entryPrice: 398.00,
      currentPrice: 405.50,
      stopLoss: 390.00,
      takeProfit: 420.00,
      pnl: 337.50,
      pnlPercent: 1.88,
      value: 18247.50,
      openDate: "2024-01-26",
      strategy: "Growth",
      status: "active",
      broker: "dev",
      brokerName: "Development"
    },
    {
      id: "dev-9",
      symbol: "BA",
      name: "Boeing Co.",
      side: "long",
      quantity: 0,
      originalQuantity: 100,
      entryPrice: 220.00,
      currentPrice: 210.00,
      exitPrice: 210.00,
      stopLoss: 210.00,
      takeProfit: 240.00,
      pnl: -1000.00,
      pnlPercent: -4.55,
      value: 0,
      openDate: "2024-01-10",
      closedDate: "2024-01-28",
      strategy: "Breakout",
      status: "closed",
      exitReason: "stop_loss",
      broker: "dev",
      brokerName: "Development"
    },
    {
      id: "dev-10",
      symbol: "NFLX",
      name: "Netflix Inc.",
      side: "long",
      quantity: 0,
      originalQuantity: 50,
      entryPrice: 480.00,
      currentPrice: 520.00,
      exitPrice: 520.00,
      stopLoss: 460.00,
      takeProfit: 520.00,
      pnl: 2000.00,
      pnlPercent: 8.33,
      value: 0,
      openDate: "2024-01-05",
      closedDate: "2024-01-27",
      strategy: "Momentum",
      status: "closed",
      exitReason: "take_profit",
      broker: "dev",
      brokerName: "Development"
    },
    {
      id: "dev-11",
      symbol: "AMD",
      name: "Advanced Micro Devices",
      side: "short",
      quantity: 0,
      originalQuantity: 80,
      entryPrice: 145.00,
      currentPrice: 138.00,
      exitPrice: 138.00,
      stopLoss: 150.00,
      takeProfit: 135.00,
      pnl: 560.00,
      pnlPercent: 4.83,
      value: 0,
      openDate: "2024-01-08",
      closedDate: "2024-01-26",
      strategy: "Mean Reversion",
      status: "closed",
      exitReason: "manual",
      broker: "dev",
      brokerName: "Development"
    },
    {
      id: "dev-12",
      symbol: "CRM",
      name: "Salesforce Inc.",
      side: "long",
      quantity: 0,
      originalQuantity: 100,
      entryPrice: 250.00,
      currentPrice: 265.00,
      exitPrice: 258.00,
      stopLoss: 240.00,
      takeProfit: 280.00,
      pnl: 800.00,
      pnlPercent: 3.20,
      value: 0,
      openDate: "2024-01-12",
      closedDate: "2024-01-25",
      strategy: "Swing Trade",
      status: "closed",
      exitReason: "partial",
      broker: "dev",
      brokerName: "Development"
    }
  ];
}