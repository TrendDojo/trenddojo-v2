"use client";

import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageContent } from "@/components/layout/PageContent";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { IBConnectionModal, IBCredentials } from "@/components/brokers/IBConnectionModal";
import { Card } from "@/components/ui/Panel";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Panel";

// Broker status enum
type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

interface BrokerCard {
  id: string;
  name: string;
  description: string;
  logo?: string;
  status: ConnectionStatus;
  accountId?: string;
  balance?: number;
  isSupported: boolean;
}

export default function BrokersPage() {
  const [showIBModal, setShowIBModal] = useState(false);
  const [brokers, setBrokers] = useState<BrokerCard[]>([
    {
      id: 'interactive_brokers',
      name: 'Interactive Brokers',
      description: 'Connect your Interactive Brokers account to execute trades directly through TrendDojo',
      status: 'disconnected',
      isSupported: true,
    },
    {
      id: 'alpaca',
      name: 'Alpaca',
      description: 'Commission-free trading API for stocks and crypto',
      status: 'disconnected',
      isSupported: false,
    },
    {
      id: 'td_ameritrade',
      name: 'TD Ameritrade',
      description: 'Full-service broker with comprehensive research tools',
      status: 'disconnected',
      isSupported: false,
    },
    {
      id: 'paper_trading',
      name: 'Paper Trading',
      description: 'Practice trading with virtual money in a risk-free environment',
      status: 'disconnected',
      isSupported: true,
    },
  ]);

  const getStatusColor = (status: ConnectionStatus) => {
    switch (status) {
      case 'connected':
        return 'text-green-500';
      case 'connecting':
        return 'text-yellow-500';
      case 'error':
        return 'text-red-500';
      default:
        return 'text-gray-400';
    }
  };

  const getStatusText = (status: ConnectionStatus) => {
    switch (status) {
      case 'connected':
        return 'Connected';
      case 'connecting':
        return 'Connecting...';
      case 'error':
        return 'Error';
      default:
        return '';
    }
  };

  const handleIBConnect = async (credentials: IBCredentials) => {
    // Update status to connecting
    setBrokers(prev => prev.map(broker => 
      broker.id === 'interactive_brokers' 
        ? { ...broker, status: 'connecting' as ConnectionStatus }
        : broker
    ));

    try {
      // Call the API to connect to IB
      const response = await fetch('/api/brokers/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          broker: 'interactive_brokers',
          config: credentials,
          setPrimary: true,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to connect');
      }

      const data = await response.json();

      // Update broker status with account info
      setBrokers(prev => prev.map(broker => 
        broker.id === 'interactive_brokers' 
          ? { 
              ...broker, 
              status: 'connected' as ConnectionStatus,
              accountId: data.accountInfo?.accountId,
              balance: data.accountInfo?.balance,
            }
          : broker
      ));
    } catch (error) {
      // Update status to error
      setBrokers(prev => prev.map(broker => 
        broker.id === 'interactive_brokers' 
          ? { ...broker, status: 'error' as ConnectionStatus }
          : broker
      ));
      throw error;
    }
  };

  const handleDisconnect = async (brokerId: string) => {
    try {
      const response = await fetch(`/api/brokers/connect?broker=${brokerId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setBrokers(prev => prev.map(broker => 
          broker.id === brokerId 
            ? { ...broker, status: 'disconnected' as ConnectionStatus, accountId: undefined, balance: undefined }
            : broker
        ));
      }
    } catch (error) {
      console.error('Failed to disconnect:', error);
    }
  };

  return (
    <AppLayout>
      <PageContent>
        {/* Breadcrumb */}
        <div className="mb-8">
          <Breadcrumb
            items={[
              { label: "Brokers" }
            ]}
          />
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold dark:text-white text-gray-900 mb-2">
            Broker Connections
          </h1>
          <p className="dark:text-gray-400 text-gray-600">
            Connect your brokerage accounts to enable live trading and real-time data
          </p>
        </div>

        {/* Broker Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {brokers.map((broker) => (
            <Card
              key={broker.id}
              className="hover:shadow-lg transition-shadow"
            >
              {/* Broker Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold dark:text-white text-gray-900">
                    {broker.name}
                  </h3>
                  {!broker.isSupported && (
                    <span className="inline-block mt-1 text-xs px-2 py-1 rounded bg-gray-500/20 text-gray-500 dark:text-gray-400">
                      Coming Soon
                    </span>
                  )}
                </div>
                {broker.status !== 'disconnected' && (
                  <div className={`flex items-center gap-2 ${getStatusColor(broker.status)}`}>
                    <div className={`w-2 h-2 rounded-full ${
                      broker.status === 'connected' ? 'bg-green-500' :
                      broker.status === 'connecting' ? 'bg-yellow-500 animate-pulse' :
                      broker.status === 'error' ? 'bg-red-500' :
                      'bg-gray-400'
                    }`} />
                    <span className="text-sm">{getStatusText(broker.status)}</span>
                  </div>
                )}
              </div>

              {/* Broker Description */}
              <p className="dark:text-gray-400 text-gray-600 text-sm mb-4">
                {broker.description}
              </p>

              {/* Account Info (if connected) */}
              {broker.status === 'connected' && broker.accountId && (
                <div className="mb-4 p-3 dark:bg-slate-900/50 bg-gray-50 rounded">
                  <div className="text-xs dark:text-gray-500 text-gray-500 mb-2">
                    Connected to Interactive Brokers
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm dark:text-gray-400 text-gray-600">IB Account</span>
                    <span className="text-sm font-mono dark:text-gray-300 text-gray-700">
                      {broker.accountId}
                    </span>
                  </div>
                  {broker.balance !== undefined && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm dark:text-gray-400 text-gray-600">Balance</span>
                      <span className="text-sm font-semibold dark:text-white text-gray-900">
                        ${broker.balance.toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2">
                {broker.status === 'disconnected' && broker.isSupported && (
                  <Button 
                    onClick={() => {
                      if (broker.id === 'interactive_brokers') {
                        setShowIBModal(true);
                      }
                      // Add handlers for other brokers here
                    }}
                    variant="primary"
                    fullWidth
                  >
                    Connect
                  </Button>
                )}
                {broker.status === 'connected' && (
                  <>
                    <Button variant="secondary" fullWidth>
                      Settings
                    </Button>
                    <Button 
                      onClick={() => handleDisconnect(broker.id)}
                      variant="ghost"
                      className="text-red-500 hover:text-red-600"
                    >
                      Disconnect
                    </Button>
                  </>
                )}
                {broker.status === 'connecting' && (
                  <Button 
                    variant="primary"
                    loading
                    fullWidth
                    disabled
                  >
                    Connecting...
                  </Button>
                )}
                {broker.status === 'error' && (
                  <Button 
                    onClick={() => {
                      if (broker.id === 'interactive_brokers') {
                        setShowIBModal(true);
                      }
                    }}
                    variant="danger"
                    fullWidth
                  >
                    Retry Connection
                  </Button>
                )}
                {!broker.isSupported && (
                  <Button 
                    variant="secondary"
                    fullWidth
                    disabled
                  >
                    Not Available
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>

        {/* Information Section */}
        <Card className="mt-12 dark:bg-slate-800/30 bg-gray-50">
          <h2 className="text-lg font-semibold dark:text-white text-gray-900 mb-3">
            Getting Started with Broker Connections
          </h2>
          <div className="space-y-3 dark:text-gray-400 text-gray-600">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-sm font-semibold flex-shrink-0 mt-0.5">
                1
              </div>
              <div>
                <p className="font-medium dark:text-gray-300 text-gray-700 mb-1">
                  Choose Your Broker
                </p>
                <p className="text-sm">
                  Select from our supported brokers. Interactive Brokers offers professional features,
                  while Paper Trading is perfect for practice.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-sm font-semibold flex-shrink-0 mt-0.5">
                2
              </div>
              <div>
                <p className="font-medium dark:text-gray-300 text-gray-700 mb-1">
                  Connect Your Account
                </p>
                <p className="text-sm">
                  Follow the secure authentication process to link your brokerage account.
                  Your credentials are encrypted and never stored in plain text.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-sm font-semibold flex-shrink-0 mt-0.5">
                3
              </div>
              <div>
                <p className="font-medium dark:text-gray-300 text-gray-700 mb-1">
                  Start Trading
                </p>
                <p className="text-sm">
                  Once connected, you can execute trades, monitor positions, and access real-time
                  market data through TrendDojo's unified interface.
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Important Legal Disclaimer */}
        <Alert 
          className="mt-6"
          intent="warning"
          title="Important Legal Notice"
        >
          <p className="mb-2">
            <strong>Always confirm all trades in your Interactive Brokers account directly.</strong> 
            TrendDojo accepts no responsibility for trades made or not made on your account at any time.
          </p>
          <p className="text-xs mt-2 opacity-90">
            TrendDojo is a third-party software tool that connects to Interactive Brokers via their official API. 
            Your funds remain with Interactive Brokers, a registered broker-dealer with SIPC protection. 
            TrendDojo is not affiliated with Interactive Brokers and does not hold customer funds.
          </p>
        </Alert>

        {/* Security Information */}
        <Alert 
          className="mt-4"
          intent="info"
          title="Security & Technology"
        >
          <ul className="text-xs space-y-1">
            <li>• All credentials are encrypted using AES-256 encryption</li>
            <li>• IB Gateway or TWS must be running on your local machine</li>
            <li>• We never store plain text passwords or access codes</li>
            <li>• Connection is made directly between your machine and Interactive Brokers</li>
          </ul>
        </Alert>

        {/* IB Connection Modal */}
        <IBConnectionModal
          isOpen={showIBModal}
          onClose={() => setShowIBModal(false)}
          onConnect={handleIBConnect}
        />
      </PageContent>
    </AppLayout>
  );
}