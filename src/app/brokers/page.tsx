"use client";

import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageContent } from "@/components/layout/PageContent";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { IBConnectionModal, IBCredentials } from "@/components/brokers/IBConnectionModal";
import { AlpacaConnectionModal, AlpacaCredentials } from "@/components/brokers/AlpacaConnectionModal";
import { Card } from "@/components/ui/Panel";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Panel";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/FormField";
import { Shield } from "lucide-react";

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
  const [showAlpacaModal, setShowAlpacaModal] = useState(false);
  const [selectedAlpacaBroker, setSelectedAlpacaBroker] = useState<string | null>(null);
  const [showLegalModal, setShowLegalModal] = useState(false);
  const [agreementText, setAgreementText] = useState("");
  const [hasAgreed, setHasAgreed] = useState(false);
  const [pendingBrokerId, setPendingBrokerId] = useState<string | null>(null);
  const [brokers, setBrokers] = useState<BrokerCard[]>([
    {
      id: 'alpaca_paper',
      name: 'Alpaca Paper Trading',
      description: 'Practice with Alpaca using virtual money - perfect for testing strategies',
      status: 'disconnected',
      isSupported: true,
    },
    {
      id: 'alpaca_live',
      name: 'Alpaca Live Trading',
      description: 'Real money trading with commission-free stock and crypto execution',
      status: 'disconnected',
      isSupported: true,
    },
    {
      id: 'td_ameritrade',
      name: 'TD Ameritrade',
      description: 'Full-service broker with comprehensive research tools',
      status: 'disconnected',
      isSupported: false,
    },
    {
      id: 'interactive_brokers',
      name: 'Interactive Brokers',
      description: 'Connect your Interactive Brokers account to execute trades directly through TrendDojo',
      status: 'disconnected',
      isSupported: false,
    },
  ]);

  const getStatusColor = (status: ConnectionStatus) => {
    switch (status) {
      case 'connected':
        return 'text-success';
      case 'connecting':
        return 'text-warning';
      case 'error':
        return 'text-danger';
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

  const handleAlpacaConnect = async (credentials: AlpacaCredentials) => {
    if (!selectedAlpacaBroker) return;

    // Update status to connecting
    setBrokers(prev => prev.map(broker =>
      broker.id === selectedAlpacaBroker
        ? { ...broker, status: 'connecting' as ConnectionStatus }
        : broker
    ));

    try {
      // Call the API to connect to Alpaca
      const response = await fetch('/api/brokers/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          broker: selectedAlpacaBroker,
          config: credentials,
          setPrimary: true,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to connect');
      }

      const data = await response.json();

      // Update broker status with account info
      setBrokers(prev => prev.map(broker =>
        broker.id === selectedAlpacaBroker
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
        broker.id === selectedAlpacaBroker
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

  const handleLegalAgreement = () => {
    if (agreementText.toLowerCase() === "i agree") {
      setHasAgreed(true);
      setShowLegalModal(false);

      // Open the appropriate broker modal after agreement
      if (pendingBrokerId) {
        if (pendingBrokerId === 'interactive_brokers') {
          setShowIBModal(true);
        } else if (pendingBrokerId === 'alpaca_paper' || pendingBrokerId === 'alpaca_live') {
          setSelectedAlpacaBroker(pendingBrokerId);
          setShowAlpacaModal(true);
        }
        setPendingBrokerId(null);
      }
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


        {/* Information Grid Container */}
        <div className="w-full mb-12">
          <div className="flex flex-col lg:flex-row lg:justify-between gap-8">
            {/* Getting Started Section */}
            <Card className="w-full lg:w-1/2">
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
                      Select from our supported brokers - Alpaca offers commission-free trading with paper and live options.
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
                      Execute trades, monitor positions, and access real-time market data.
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Security Information */}
            <div className="w-full lg:w-1/3 self-start rounded-lg p-4 pb-6 flex gap-3 dark:bg-blue-900/20 bg-blue-50">
              <span className="text-blue-600 dark:text-blue-400">
                <Shield className="w-5 h-5 flex-shrink-0" />
              </span>
              <div className="flex-1">
                <h3 className="font-semibold mb-1 text-blue-600 dark:text-blue-400">
                  Security & Technology
                </h3>
                <div className="text-sm dark:text-gray-300 text-gray-700">
                  <ul className="text-sm space-y-1">
                    <li>• All credentials are encrypted using AES-256 encryption</li>
                    <li>• We NEVER store plain text passwords or access codes</li>
                    <li>• We use official broker APIs with industry-standard security</li>
                    <li>• We NEVER handle your funds and will NEVER ask you to fund your account with us</li>
                    <li>• All trading happens directly through your broker's official systems</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Broker Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-16">
          {brokers.map((broker) => (
            <div
              key={broker.id}
              className="bg-gray-100 dark:bg-slate-800 rounded-lg p-6 hover:shadow-lg transition-all duration-200 hover:bg-gray-50 dark:hover:bg-slate-700"
            >
              <Card
                className="bg-transparent"
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
                    Connected to {broker.name}
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm dark:text-gray-400 text-gray-600">Account</span>
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
                      if (!hasAgreed) {
                        setPendingBrokerId(broker.id);
                        setShowLegalModal(true);
                        return;
                      }
                      if (broker.id === 'interactive_brokers') {
                        setShowIBModal(true);
                      } else if (broker.id === 'alpaca_paper' || broker.id === 'alpaca_live') {
                        setSelectedAlpacaBroker(broker.id);
                        setShowAlpacaModal(true);
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
                      if (!hasAgreed) {
                        setPendingBrokerId(broker.id);
                        setShowLegalModal(true);
                        return;
                      }
                      if (broker.id === 'interactive_brokers') {
                        setShowIBModal(true);
                      } else if (broker.id === 'alpaca_paper' || broker.id === 'alpaca_live') {
                        setSelectedAlpacaBroker(broker.id);
                        setShowAlpacaModal(true);
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
            </div>
          ))}
        </div>

        {/* IB Connection Modal */}
        <IBConnectionModal
          isOpen={showIBModal}
          onClose={() => setShowIBModal(false)}
          onConnect={handleIBConnect}
        />

        {/* Alpaca Connection Modal */}
        <AlpacaConnectionModal
          isOpen={showAlpacaModal}
          onClose={() => {
            setShowAlpacaModal(false);
            setSelectedAlpacaBroker(null);
          }}
          onConnect={handleAlpacaConnect}
          isPaperTrading={selectedAlpacaBroker === 'alpaca_paper'}
        />

        {/* Legal Agreement Modal */}
        <Modal
          isOpen={showLegalModal && !hasAgreed}
          onClose={() => setShowLegalModal(false)}
          title="Important Legal Notice"
          size="lg"
        >
          <div className="space-y-6">
            <Alert intent="warning" title="Legal Disclaimer">
              <p className="mb-2">
                <strong>Always confirm all trades in your brokerage account directly.</strong>
                TrendDojo accepts no responsibility for trades made or not made on your account at any time.
              </p>
              <p className="text-xs opacity-90">
                TrendDojo is a third-party software tool that connects to your broker via their official APIs.
                Your funds remain with your broker. TrendDojo is not affiliated with any broker and does not hold customer funds.
              </p>
            </Alert>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (agreementText.toLowerCase() === "i agree") {
                  handleLegalAgreement();
                }
              }}
              className="space-y-4"
            >
              <p className="text-sm dark:text-gray-300 text-gray-700">
                Type <strong>"I agree"</strong> to acknowledge and accept these terms:
              </p>

              <Input
                placeholder="Type 'I agree' to continue"
                value={agreementText}
                onChange={(e) => setAgreementText(e.target.value)}
              />

              <div className="flex gap-3">
                <Button
                  type="button"
                  onClick={() => setShowLegalModal(false)}
                  variant="secondary"
                  fullWidth
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={agreementText.toLowerCase() !== "i agree"}
                  variant="primary"
                  fullWidth
                >
                  I Agree
                </Button>
              </div>
            </form>
          </div>
        </Modal>
      </PageContent>
    </AppLayout>
  );
}