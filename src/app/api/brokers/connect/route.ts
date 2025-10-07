import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getBrokerManager, SupportedBroker } from '@/lib/brokers/BrokerManager';
import { getEncryption } from '@/lib/security/encryption';
import { prisma } from '@/lib/db';
import crypto from 'crypto';

export async function GET() {
  try {
    // Check authentication
    const session = await auth();
    if (!session || !(session as any)?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all active broker connections for the user
    const connections = await prisma.broker_connections.findMany({
      where: {
        userId: (session as any).user.id,
        isActive: true
      },
      select: {
        broker: true,
        isPaper: true,
        lastSync: true,
        createdAt: true,
        credentials: true
      }
    });

    // Decrypt and reconnect to get account info
    const encryption = getEncryption();
    const brokerManager = getBrokerManager();

    const connectionDetails = await Promise.all(
      connections.map(async (conn) => {
        try {
          // Decrypt credentials
          const decryptedConfig = encryption.decryptObject(conn.credentials);

          // Add paperTrading flag for Alpaca
          if (conn.broker === 'alpaca_paper' || conn.broker === 'alpaca_live') {
            decryptedConfig.paperTrading = conn.broker === 'alpaca_paper';
          }

          // Connect to broker temporarily to get account info
          const connected = await brokerManager.connectBroker(
            conn.broker as SupportedBroker,
            decryptedConfig,
            false // Don't set as primary
          );

          const brokerClient = brokerManager.getBroker(conn.broker as SupportedBroker);

          let accountInfo = null;
          let connectionStatus: 'connected' | 'error' = connected ? 'connected' : 'error';

          // Only fetch account info if connection succeeded
          if (connected && brokerClient) {
            try {
              accountInfo = await brokerClient.getAccountInfo();
              console.log(`[BROKER API] Successfully fetched account info for ${conn.broker}:`, {
                accountId: accountInfo?.accountId,
                balance: accountInfo?.balance,
                fullAccountInfo: accountInfo
              });
            } catch (error: any) {
              console.error(`Failed to get account info for ${conn.broker}:`, error);
              // If we can't fetch account info, credentials are likely invalid
              if (error.message?.includes('401') || error.message?.includes('unauthorized')) {
                connectionStatus = 'error';
                console.log(`→ Credentials appear invalid (401)`);
              }
            }
          }

          return {
            broker: conn.broker,
            isPaper: conn.isPaper,
            accountInfo,
            lastSync: conn.lastSync,
            status: connectionStatus
          };
        } catch (error) {
          console.error(`Failed to reconnect to ${conn.broker}:`, error);
          return {
            broker: conn.broker,
            isPaper: conn.isPaper,
            accountInfo: null,
            lastSync: conn.lastSync,
            status: 'error'
          };
        }
      })
    );

    return NextResponse.json({ connections: connectionDetails });
  } catch (error) {
    console.error('Failed to fetch broker connections:', error);
    return NextResponse.json(
      { error: 'Failed to fetch connections' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    // Check authentication
    const session = await auth();
    if (!session || !(session as any)?.user) {
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

    // Determine if this is paper trading based on broker type
    const isPaperTrading = broker === 'alpaca_paper' || broker === 'interactive_brokers_paper';

    // Add paperTrading flag to config for Alpaca
    if (broker === 'alpaca_paper' || broker === 'alpaca_live') {
      config.paperTrading = broker === 'alpaca_paper';
    }

    // Clean up conflicting Alpaca connections (old "alpaca" vs new "alpaca_paper"/"alpaca_live")
    if (broker === 'alpaca_paper' || broker === 'alpaca_live') {
      await prisma.broker_connections.updateMany({
        where: {
          userId: (session as any).user.id,
          broker: {
            in: ['alpaca', 'alpaca_paper', 'alpaca_live']
          },
          NOT: {
            broker: broker // Keep the one we're about to create/update
          }
        },
        data: {
          isActive: false
        }
      });
    }

    // Store or update broker connection
    await prisma.broker_connections.upsert({
      where: {
        userId_broker: {
          userId: (session as any).user.id,
          broker: broker
        }
      },
      update: {
        credentials: encryptedCredentials,
        isPaper: isPaperTrading,
        isActive: true,
        lastSync: new Date()
      },
      create: {
        id: crypto.randomUUID(),
        userId: (session as any).user.id,
        broker: broker,
        credentials: encryptedCredentials,
        isPaper: isPaperTrading,
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


export async function DELETE(request: Request) {
  try {
    // Check authentication
    const session = await auth();
    if (!session || !(session as any)?.user) {
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