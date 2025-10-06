import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import Alpaca from '@alpacahq/alpaca-trade-api';
import crypto from 'crypto';

interface CreatePositionRequest {
  symbol: string;
  side: 'buy' | 'sell';
  orderType: 'market' | 'limit' | 'stop' | 'stop_limit';
  quantity: number;
  limitPrice?: number;
  stopPrice?: number;
  stopLoss?: number;
  takeProfit?: number;
  timeInForce: 'day' | 'gtc' | 'ioc' | 'fok';
  strategyId: string;
  source: 'alpaca_live' | 'alpaca_paper' | 'external';
  externalBroker?: string;
  entryFee?: number;
  entryCommission?: number;
  notes?: string;
}

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const session: any = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Parse request body
    const data: CreatePositionRequest = await request.json();

    // Validate required fields
    if (!data.symbol || !data.quantity || !data.strategyId || !data.source) {
      return NextResponse.json(
        { error: 'Missing required fields: symbol, quantity, strategyId, source' },
        { status: 400 }
      );
    }

    // Verify strategy exists
    const strategy = await prisma.strategies.findFirst({
      where: {
        id: data.strategyId
      }
    });

    if (!strategy) {
      return NextResponse.json(
        { error: 'Strategy not found' },
        { status: 404 }
      );
    }

    let brokerOrderId: string | null = null;
    let fillPrice: number | null = null;
    let status: string = 'pending';

    // Handle Alpaca execution
    if (data.source === 'alpaca_live' || data.source === 'alpaca_paper') {
      // Get broker connection
      const brokerConnection = await prisma.broker_connections.findFirst({
        where: {
          userId: userId,
          broker: 'alpaca',
          isActive: true
        }
      });

      if (!brokerConnection) {
        return NextResponse.json(
          { error: `Alpaca ${data.source === 'alpaca_paper' ? 'Paper' : 'Live'} account not connected` },
          { status: 400 }
        );
      }

      // Parse credentials
      let credentials;
      try {
        credentials = JSON.parse(brokerConnection.credentials);
      } catch {
        const parts = brokerConnection.credentials.split(':');
        if (parts.length >= 2) {
          credentials = {
            apiKeyId: parts[0],
            secretKey: parts[1]
          };
        } else {
          return NextResponse.json(
            { error: 'Invalid Alpaca credentials format' },
            { status: 400 }
          );
        }
      }

      // Initialize Alpaca client
      const alpaca = new Alpaca({
        keyId: credentials.apiKeyId,
        secretKey: credentials.secretKey,
        paper: data.source === 'alpaca_paper',
        usePolygon: false
      });

      try {
        // Place order with Alpaca
        const orderParams: any = {
          symbol: data.symbol,
          qty: data.quantity,
          side: data.side,
          type: data.orderType,
          time_in_force: data.timeInForce
        };

        if (data.orderType === 'limit' || data.orderType === 'stop_limit') {
          orderParams.limit_price = data.limitPrice;
        }

        if (data.orderType === 'stop' || data.orderType === 'stop_limit') {
          orderParams.stop_price = data.stopPrice;
        }

        const order = await alpaca.createOrder(orderParams);
        brokerOrderId = order.id;
        status = order.status === 'filled' ? 'open' : 'pending';
        fillPrice = order.filled_avg_price ? parseFloat(order.filled_avg_price) : null;
      } catch (error: any) {
        console.error('Alpaca order error:', error);

        // Provide helpful error messages
        let errorMessage = `Failed to place order with Alpaca: ${error.message}`;
        if (error.message.includes('401') || error.message.includes('unauthorized')) {
          errorMessage = 'Alpaca credentials are invalid. Paper trading keys should start with "PK...". Visit /app/brokers to update your credentials, or use "External Broker" to test without Alpaca.';
        }

        return NextResponse.json(
          { error: errorMessage },
          { status: 500 }
        );
      }
    } else if (data.source === 'external') {
      // For external positions, mark as open immediately with limit price or stop loss
      status = 'open';
      fillPrice = data.limitPrice || null;
    }

    // Create position in database (schema: id, strategyId, symbol, assetType, direction, status, currentQuantity, avgEntryPrice, etc.)
    const position = await prisma.positions.create({
      data: {
        id: crypto.randomUUID(),
        strategyId: data.strategyId,
        symbol: data.symbol,
        assetType: 'stock',
        direction: data.side === 'buy' ? 'long' : 'short',
        status: status,
        currentQuantity: data.quantity,
        avgEntryPrice: fillPrice || data.limitPrice || 0,
        stopLoss: data.stopLoss,
        takeProfit: data.takeProfit,
        realizedPnl: 0,
        unrealizedPnl: 0,
        totalFees: 0,
        netPnl: 0,
        openedAt: new Date()
      }
    });

    // Create note if provided (notes are in a separate table)
    if (data.notes) {
      await prisma.position_notes.create({
        data: {
          id: crypto.randomUUID(),
          positionId: position.id,
          noteType: 'entry',
          content: data.notes,
          createdAt: new Date()
        }
      });
    }

    // Create execution record (schema: id, positionId, type, quantity, price, commission, etc.)
    const execution = await prisma.executions.create({
      data: {
        id: crypto.randomUUID(),
        positionId: position.id,
        type: data.side, // 'buy' or 'sell'
        quantity: data.quantity,
        price: fillPrice || data.limitPrice || 0,
        commission: data.entryCommission || 0,
        exchangeFees: 0,
        secFees: 0,
        tafFees: 0,
        clearingFees: 0,
        otherFees: data.entryFee || 0,
        totalFees: (data.entryFee || 0) + (data.entryCommission || 0),
        grossValue: (fillPrice || data.limitPrice || 0) * data.quantity,
        netValue: (fillPrice || data.limitPrice || 0) * data.quantity - ((data.entryFee || 0) + (data.entryCommission || 0)),
        brokerName: data.source === 'external' ? data.externalBroker || 'external' : 'alpaca',
        brokerOrderId: brokerOrderId,
        brokerExecId: brokerOrderId, // Same for now
        executedAt: status === 'open' ? new Date() : new Date() // Set to now even for pending
      }
    });

    return NextResponse.json({
      success: true,
      position: {
        id: position.id,
        symbol: position.symbol,
        direction: position.direction,
        quantity: position.currentQuantity,
        status: position.status,
        brokerOrderId: brokerOrderId
      }
    });

  } catch (error) {
    console.error('Position creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create position' },
      { status: 500 }
    );
  }
}
