import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getBrokerManager } from '@/lib/brokers/BrokerManager';
import { getEncryption } from '@/lib/security/encryption';
import { prisma } from '@/lib/db';

export async function POST(request: Request) {
  try {
    // Check authentication
    const session = await auth();
    if (!session || !(session as any)?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      symbol,
      side,
      orderType,
      quantity,
      limitPrice,
      stopPrice,
      stopLoss,
      takeProfit,
      timeInForce,
      accountType
    } = body;

    // Validate required fields
    if (!symbol || !side || !orderType || !quantity || !accountType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate order type and prices
    if ((orderType === 'limit' || orderType === 'stop_limit') && !limitPrice) {
      return NextResponse.json(
        { error: 'Limit price required for limit orders' },
        { status: 400 }
      );
    }

    if ((orderType === 'stop' || orderType === 'stop_limit') && !stopPrice) {
      return NextResponse.json(
        { error: 'Stop price required for stop orders' },
        { status: 400 }
      );
    }

    // Handle dev mode - just return success
    if (accountType === 'dev') {
      return NextResponse.json({
        success: true,
        message: 'Dev mode: Order simulated successfully',
        order: {
          id: `dev-${Date.now()}`,
          symbol,
          side,
          quantity,
          orderType,
          status: 'filled',
          filledPrice: limitPrice || 150.00,
          filledAt: new Date().toISOString()
        }
      });
    }

    // Map account type to broker IDs
    let brokerFilter: string[] = [];
    if (accountType === 'live') {
      brokerFilter = ['alpaca_live', 'interactive_brokers_live'];
    } else if (accountType === 'paper') {
      brokerFilter = ['alpaca_paper', 'interactive_brokers_paper'];
    }

    // Get active broker connection for the user
    const connection = await prisma.broker_connections.findFirst({
      where: {
        userId: (session as any).user.id,
        isActive: true,
        broker: { in: brokerFilter }
      }
    });

    if (!connection) {
      return NextResponse.json(
        { error: `No ${accountType} broker account connected` },
        { status: 400 }
      );
    }

    // Decrypt credentials and connect to broker
    const encryption = getEncryption();
    const decryptedConfig = encryption.decryptObject(connection.credentials);

    // Add paperTrading flag for Alpaca
    if (connection.broker === 'alpaca_paper' || connection.broker === 'alpaca_live') {
      decryptedConfig.paperTrading = connection.broker === 'alpaca_paper';
    }

    // Connect to broker
    const brokerManager = getBrokerManager();
    await brokerManager.connectBroker(
      connection.broker as any,
      decryptedConfig,
      false
    );

    // Get broker client and place order
    const brokerClient = brokerManager.getBroker(connection.broker as any);
    if (!brokerClient) {
      return NextResponse.json(
        { error: 'Failed to connect to broker' },
        { status: 500 }
      );
    }

    // Create order request
    const orderRequest: any = {
      symbol,
      side: side as 'buy' | 'sell',
      type: orderType as 'market' | 'limit' | 'stop' | 'stop_limit',
      quantity,
      timeInForce: timeInForce as 'day' | 'gtc' | 'ioc' | 'fok',
      price: limitPrice,
      stopPrice
    };

    // Place the order
    const orderResponse = await brokerClient.placeOrder(orderRequest);

    // If stop loss or take profit are specified, create OCO (One-Cancels-Other) orders
    const bracketOrders = [];

    if (stopLoss && side === 'buy') {
      // For a buy order, stop loss is a sell stop order
      const stopLossOrder = await brokerClient.placeOrder({
        symbol,
        side: 'sell',
        type: 'stop',
        quantity,
        timeInForce: 'gtc',
        stopPrice: stopLoss
      });
      bracketOrders.push({ type: 'stopLoss', order: stopLossOrder });
    }

    if (takeProfit && side === 'buy') {
      // For a buy order, take profit is a sell limit order
      const takeProfitOrder = await brokerClient.placeOrder({
        symbol,
        side: 'sell',
        type: 'limit',
        quantity,
        timeInForce: 'gtc',
        price: takeProfit
      });
      bracketOrders.push({ type: 'takeProfit', order: takeProfitOrder });
    }

    // TODO: Log the trade in database for tracking when trades table is created
    // await prisma.trades.create({
    //   data: {
    //     id: crypto.randomUUID(),
    //     userId: (session as any).user.id,
    //     broker: connection.broker,
    //     symbol,
    //     side,
    //     quantity,
    //     orderType,
    //     limitPrice,
    //     stopPrice,
    //     stopLoss,
    //     takeProfit,
    //     status: 'pending',
    //     orderId: orderResponse.orderId,
    //     createdAt: new Date()
    //   }
    // });

    return NextResponse.json({
      success: true,
      message: 'Order placed successfully',
      order: orderResponse,
      bracketOrders
    });

  } catch (error) {
    console.error('Failed to place order:', error);
    return NextResponse.json(
      { error: 'Failed to place order', details: (error as any).message },
      { status: 500 }
    );
  }
}