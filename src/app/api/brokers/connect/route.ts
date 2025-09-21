import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getBrokerManager, SupportedBroker } from '@/lib/brokers/BrokerManager';
import { getEncryption } from '@/lib/security/encryption';
import { prisma } from '@/lib/db';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await request.json();
    const { broker, config, setPrimary } = body;
    
    if (!broker || !config) {
      return NextResponse.json(
        { error: 'Missing broker or config' },
        { status: 400 }
      );
    }
    
    // Validate broker type
    const supportedBrokers: SupportedBroker[] = [
      'interactive_brokers',
      'alpaca',
      'alpaca_paper',
      'alpaca_live',
      'td_ameritrade',
    ];
    
    if (!supportedBrokers.includes(broker)) {
      return NextResponse.json(
        { error: `Unsupported broker: ${broker}` },
        { status: 400 }
      );
    }
    
    // Store encrypted credentials in database (paper trading only for now)
    const encryption = getEncryption();

    // @business-critical: Credential encryption for broker API keys
    // MUST have unit tests before deployment
    const encryptedCredentials = encryption.encryptObject(config);

    // Store or update broker connection
    await prisma.broker_connections.upsert({
      where: {
        userId_broker: {
          userId: session.user.id,
          broker: broker
        }
      },
      update: {
        credentials: encryptedCredentials,
        isPaper: true, // ALWAYS paper trading for initial launch
        isActive: true,
        lastSync: new Date()
      },
      create: {
        id: crypto.randomUUID(),
        userId: session.user.id,
        broker: broker,
        credentials: encryptedCredentials,
        isPaper: true, // ALWAYS paper trading for initial launch
        isActive: true,
        createdAt: new Date()
      }
    });

    // Connect to broker
    const brokerManager = getBrokerManager();
    const success = await brokerManager.connectBroker(
      broker as SupportedBroker,
      config,
      setPrimary
    );
    
    if (success) {
      // Get account info
      const brokerClient = brokerManager.getBroker(broker);
      const accountInfo = brokerClient ? await brokerClient.getAccountInfo() : null;
      
      return NextResponse.json({
        success: true,
        broker,
        accountInfo,
        connectedBrokers: brokerManager.getConnectedBrokers(),
      });
    } else {
      return NextResponse.json(
        { error: 'Failed to connect to broker' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Broker connection error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Connection failed' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const brokerManager = getBrokerManager();
    const connectedBrokers = brokerManager.getConnectedBrokers();
    
    // Get account info for each connected broker
    const accounts = await brokerManager.getAggregatedAccountInfo();
    
    return NextResponse.json({
      connectedBrokers,
      totalBalance: accounts.totalBalance,
      totalBuyingPower: accounts.totalBuyingPower,
      accounts: Array.from(accounts.accounts.entries()).map(([broker, info]) => ({
        broker,
        ...info,
      })),
    });
  } catch (error) {
    console.error('Error fetching broker info:', error);
    return NextResponse.json(
      { error: 'Failed to fetch broker information' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { searchParams } = new URL(request.url);
    const broker = searchParams.get('broker');
    
    if (!broker) {
      return NextResponse.json(
        { error: 'Missing broker parameter' },
        { status: 400 }
      );
    }
    
    const brokerManager = getBrokerManager();
    await brokerManager.disconnectBroker(broker);
    
    return NextResponse.json({
      success: true,
      disconnected: broker,
      connectedBrokers: brokerManager.getConnectedBrokers(),
    });
  } catch (error) {
    console.error('Broker disconnection error:', error);
    return NextResponse.json(
      { error: 'Failed to disconnect broker' },
      { status: 500 }
    );
  }
}