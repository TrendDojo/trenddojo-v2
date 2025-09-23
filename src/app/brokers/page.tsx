"use client";

import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageContent } from "@/components/layout/PageContent";
import { AlpacaConnectionModal, AlpacaCredentials } from "@/components/brokers/AlpacaConnectionModal";
import { Card } from "@/components/ui/Panel";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Panel";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/FormField";
import { Shield, Layers, Zap, CheckCircle } from "lucide-react";

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
  const [showAlpacaModal, setShowAlpacaModal] = useState(false);
  const [selectedAlpacaBroker, setSelectedAlpacaBroker] = useState<string | null>(null);
  const [showLegalModal, setShowLegalModal] = useState(false);
  const [agreementText, setAgreementText] = useState("");
  const [hasAgreed, setHasAgreed] = useState(false);
  const [pendingBrokerId, setPendingBrokerId] = useState<string | null>(null);
  const [showDisconnectModal, setShowDisconnectModal] = useState(false);
  const [disconnectBrokerId, setDisconnectBrokerId] = useState<string | null>(null);
  const [disconnectConfirmText, setDisconnectConfirmText] = useState("");
  const [isLoadingConnections, setIsLoadingConnections] = useState(true);
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
    setDisconnectBrokerId(brokerId);
    setDisconnectConfirmText("");
    setShowDisconnectModal(true);
  };

  const confirmDisconnect = async () => {
    if (disconnectConfirmText.toLowerCase() !== 'disconnect' || !disconnectBrokerId) {
      return;
    }

    try {
      const response = await fetch(`/api/brokers/connect?broker=${disconnectBrokerId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setBrokers(prev => prev.map(broker =>
          broker.id === disconnectBrokerId
            ? { ...broker, status: 'disconnected' as ConnectionStatus, accountId: undefined, balance: undefined }
            : broker
        ));
        setShowDisconnectModal(false);
        setDisconnectBrokerId(null);
        setDisconnectConfirmText("");
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
        if (pendingBrokerId === 'alpaca_paper' || pendingBrokerId === 'alpaca_live') {
          setSelectedAlpacaBroker(pendingBrokerId);
          setShowAlpacaModal(true);
        }
        setPendingBrokerId(null);
      }
    }
  };

  // Load broker connections from database on mount
  useEffect(() => {
    const loadConnections = async () => {
      try {
        const response = await fetch('/api/brokers/connect');
        if (response.ok) {
          const data = await response.json();

          // Update broker states based on database connections
          setBrokers(prev => prev.map(broker => {
            const connection = data.connections.find((conn: any) =>
              conn.broker === broker.id
            );

            if (connection) {
              return {
                ...broker,
                status: connection.status as ConnectionStatus,
                accountId: connection.accountInfo?.accountId,
                balance: connection.accountInfo?.balance
              };
            }

            return broker;
          }));
        }
      } catch (error) {
        console.error('Failed to load broker connections:', error);
      } finally {
        setIsLoadingConnections(false);
      }
    };

    loadConnections();
  }, []);

  return (
    <AppLayout>
      <PageContent>

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
          <div className="flex flex-col lg:flex-row lg:justify-start gap-8">
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
            <div className="w-full lg:w-1/3 self-start rounded-lg p-6 flex gap-4 dark:bg-blue-900/20 bg-blue-50">
              <span className="text-blue-600 dark:text-blue-400">
                <Shield className="w-8 h-8 flex-shrink-0" />
              </span>
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-3 text-blue-600 dark:text-blue-400">
                  Security & Technology
                </h3>
                <div className="dark:text-gray-300 text-gray-700">
                  <ul className="text-base space-y-2">
                    <li>• AES-256 encryption</li>
                    <li>• API keys always encrypted</li>
                    <li>• We only use official broker APIs</li>
                    <li>• We never touch your funds</li>
                    <li>• Trades execute at your broker</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Broker Cards Grid */}
        <div className="grid grid-cols-[repeat(auto-fill,minmax(250px,320px))] gap-6">
          {brokers.map((broker) => (
            <div
              key={broker.id}
              className="bg-gray-100 dark:bg-slate-800 rounded-lg overflow-hidden hover:shadow-lg transition-all duration-200 hover:bg-gray-50 dark:hover:bg-slate-700 flex flex-col"
            >
              {/* Status Bar - Full width at top */}
              {!isLoadingConnections && (
                broker.status === 'connected' ? (
                  <div className="bg-success/20 dark:bg-success/10 px-4 py-2">
                    <div className="flex items-center justify-center gap-2">
                      <CheckCircle className="w-4 h-4 text-success" />
                      <span className="text-sm font-semibold text-success">
                        Connected
                      </span>
                    </div>
                  </div>
                ) : broker.status === 'disconnected' ? (
                  <div className="bg-gray-200 dark:bg-gray-700 px-4 py-2">
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                        Ready to connect!
                      </span>
                    </div>
                  </div>
                ) : null
              )}

              <Card
                className="bg-transparent flex flex-col flex-1 rounded-none p-6"
              >
              {/* Content wrapper that grows */}
              <div className="flex-1 flex flex-col">
                {/* Broker Header */}
                <div className="mb-4">
                <div>
                  {/* Logo and Name */}
                  <div className="flex items-center gap-3 mb-3">
                    {/* Alpaca Logo */}
                    <div className="w-10 h-10 flex items-center justify-center">
                      <svg viewBox="0 0 44 44" className="w-full h-full">
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M15.1067 42.9709L16.823 24.641H16.6669C15.2924 24.6412 14.1555 24.1443 13.1094 23.2396C12.0632 22.3349 11.3689 21.0814 11.1511 19.7042L14.3912 17.5785V17.5521C14.3911 16.1033 14.9422 14.7105 15.9294 13.6641C16.9168 12.6176 18.264 11.9985 19.6902 11.9358V11.9299H20.6537V8.50766C21.3367 8.50768 21.9977 8.75318 22.5194 9.20063C23.0411 9.64811 23.3897 10.2686 23.5036 10.9521H23.544V8.50766C24.0575 8.50768 24.5617 8.64649 25.0047 8.90982C25.4478 9.17317 25.8137 9.55152 26.0649 10.006C26.3161 10.4605 26.4434 10.9746 26.434 11.4956C26.4243 12.0166 26.2781 12.5256 26.0106 12.9702C26.8808 13.5474 27.5954 14.3357 28.0902 15.2638C28.5847 16.1918 28.8435 17.2303 28.843 18.2854V40.4075C28.843 40.7318 28.97 41.0427 29.1957 41.2717C29.4217 41.5011 29.728 41.6297 30.0473 41.6297H31.4757C29.4696 42.6632 27.2843 43.3889 24.9791 43.7464C35.3846 42.1329 43.3557 33.0111 43.3557 21.9999C43.3557 9.84971 33.6501 0 21.6778 0C9.70548 0 0 9.84971 0 21.9999C0 31.8255 6.34679 40.1466 15.1067 42.9709ZM17.6563 18.116C17.5323 18.242 17.4625 18.4127 17.4622 18.5908L17.4015 19.2637H18.7262C19.0776 19.2637 19.4146 19.122 19.663 18.8698C19.9114 18.6176 20.051 18.2756 20.051 17.9189H18.1241C17.9486 17.9192 17.7804 17.9901 17.6563 18.116Z"
                          fill="currentColor"
                          className="dark:text-gray-300 text-gray-900"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold dark:text-white text-gray-900">
                        Alpaca
                      </h3>
                      {!broker.isSupported && (
                        <span className="inline-block mt-1 text-xs px-2 py-1 rounded bg-gray-500/20 text-gray-500 dark:text-gray-400">
                          Coming Soon
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Paper/Live Trading Label - Below Logo */}
                  <div className="flex items-center gap-1.5">
                    {broker.id === 'alpaca_paper' ? (
                      <>
                        <Layers className="w-4 h-4 text-success" />
                        <span className="text-sm font-bold text-success">Paper Trading</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4 text-danger" />
                        <span className="text-sm font-bold text-danger">Live Trading</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Status indicators for connecting/error states */}
                {broker.status !== 'disconnected' && broker.status !== 'connected' && (
                  <div className={`flex items-center gap-2 ${getStatusColor(broker.status)}`}>
                    <div className={`w-2 h-2 rounded-full ${
                      broker.status === 'connecting' ? 'bg-yellow-500 animate-pulse' :
                      broker.status === 'error' ? 'bg-red-500' :
                      'bg-gray-400'
                    }`} />
                    <span className="text-sm">{getStatusText(broker.status)}</span>
                  </div>
                )}
              </div>

              {/* Broker Description */}
              <div className="mb-4">
                <p className="dark:text-gray-400 text-gray-600 text-sm">
                  {broker.description}
                </p>
                {(broker.id === 'alpaca_paper' || broker.id === 'alpaca_live') && (
                  <a
                    href="https://alpaca.markets"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-gray-500 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-400 underline mt-2 inline-block transition-colors"
                  >
                    Visit Alpaca →
                  </a>
                )}
              </div>

              {/* Loading Skeleton for Connection Status */}
              {isLoadingConnections && broker.isSupported && (
                <div className="mb-4 animate-pulse">
                  <div className="h-20 dark:bg-slate-900/50 bg-gray-100 rounded"></div>
                </div>
              )}

              {/* Account Info (if connected) */}
              {!isLoadingConnections && broker.status === 'connected' && broker.accountId && (
                <div className="mb-4 p-3 dark:bg-slate-900/50 bg-gray-50 rounded">
                  <div>
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
                </div>
              )}
              </div>

              {/* Action Buttons - Outside flex-1 wrapper to stick to bottom */}
              <div className="flex gap-2 mt-auto">
                {/* Loading Skeleton for Button */}
                {isLoadingConnections && broker.isSupported && (
                  <div className="animate-pulse w-full">
                    <div className="h-10 dark:bg-slate-800 bg-gray-200 rounded-lg"></div>
                  </div>
                )}

                {/* Connect Button */}
                {!isLoadingConnections && broker.status === 'disconnected' && broker.isSupported && (
                  <Button
                    onClick={() => {
                      if (!hasAgreed) {
                        setPendingBrokerId(broker.id);
                        setShowLegalModal(true);
                        return;
                      }
                      if (broker.id === 'alpaca_paper' || broker.id === 'alpaca_live') {
                        setSelectedAlpacaBroker(broker.id);
                        setShowAlpacaModal(true);
                      }
                    }}
                    variant="primary"
                    fullWidth
                  >
                    Connect
                  </Button>
                )}

                {/* Disconnect Button */}
                {!isLoadingConnections && broker.status === 'connected' && (
                  <Button
                    onClick={() => handleDisconnect(broker.id)}
                    variant="secondary"
                    fullWidth
                    className="text-red-600 dark:text-red-400 border-red-600/50 dark:border-red-400/50 hover:bg-red-50 dark:hover:bg-red-950/30"
                  >
                    Disconnect
                  </Button>
                )}

                {/* Connecting State */}
                {!isLoadingConnections && broker.status === 'connecting' && (
                  <Button 
                    variant="primary"
                    loading
                    fullWidth
                    disabled
                  >
                    Connecting...
                  </Button>
                )}

                {/* Error State */}
                {!isLoadingConnections && broker.status === 'error' && (
                  <Button
                    onClick={() => {
                      if (!hasAgreed) {
                        setPendingBrokerId(broker.id);
                        setShowLegalModal(true);
                        return;
                      }
                      if (broker.id === 'alpaca_paper' || broker.id === 'alpaca_live') {
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

                {/* Not Supported */}
                {!isLoadingConnections && !broker.isSupported && (
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
              <p className="text-sm dark:text-gray-300 text-gray-700 text-center">
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

        {/* Disconnect Confirmation Modal */}
        <Modal
          isOpen={showDisconnectModal}
          onClose={() => {
            setShowDisconnectModal(false);
            setDisconnectBrokerId(null);
            setDisconnectConfirmText("");
          }}
          title="Confirm Disconnect"
          size="md"
        >
          <div className="space-y-4">
            <Alert intent="error" title="Danger">
              You are about to disconnect your broker account. This will:
              <ul className="mt-2 list-disc list-inside text-sm">
                <li>Stop all automated trading for this account</li>
                <li>Permanently delete your stored API key for this broker</li>
                <li>Cancel any pending orders from this connection</li>
              </ul>
            </Alert>

            <p className="text-sm dark:text-gray-300 text-gray-700 text-center">
              Type <strong>"disconnect"</strong> to confirm this action:
            </p>

            <Input
              placeholder="Type 'disconnect' to confirm"
              value={disconnectConfirmText}
              onChange={(e) => setDisconnectConfirmText(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && disconnectConfirmText.toLowerCase() === 'disconnect') {
                  confirmDisconnect();
                }
              }}
            />

            <div className="flex gap-3">
              <Button
                type="button"
                onClick={() => {
                  setShowDisconnectModal(false);
                  setDisconnectBrokerId(null);
                  setDisconnectConfirmText("");
                }}
                variant="secondary"
                fullWidth
              >
                Cancel
              </Button>
              <Button
                onClick={confirmDisconnect}
                disabled={disconnectConfirmText.toLowerCase() !== "disconnect"}
                variant="danger"
                fullWidth
              >
                Disconnect
              </Button>
            </div>
          </div>
        </Modal>
      </PageContent>
    </AppLayout>
  );
}