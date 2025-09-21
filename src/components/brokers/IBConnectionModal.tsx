"use client";

import { useState } from "react";
import { BrokerConnectionForm } from "./BrokerConnectionForm";
import { FormField, Input } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Panel";
import { AlertTriangle, FileText } from "lucide-react";

export interface IBCredentials {
  host: string;
  port: number;
  clientId: number;
  paperTrading: boolean;
}

interface IBConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect: (credentials: IBCredentials) => Promise<void>;
}

export function IBConnectionModal({ isOpen, onClose, onConnect }: IBConnectionModalProps) {
  const [credentials, setCredentials] = useState<IBCredentials>({
    host: "localhost",
    port: 7497, // Default to paper trading port
    clientId: 1,
    paperTrading: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setError(null);
    setLoading(true);

    try {
      await onConnect(credentials);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Connection failed");
    } finally {
      setLoading(false);
    }
  };

  const handlePortChange = (paperTrading: boolean) => {
    setCredentials({
      ...credentials,
      paperTrading,
      port: paperTrading ? 7497 : 7496,
    });
  };

  return (
    <BrokerConnectionForm
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleSubmit}
      title="Connect Your Interactive Brokers Account"
      description="Connect to IB Gateway or TWS to start trading"
      loading={loading}
      error={error}
      submitText={credentials.paperTrading ? "Connect Paper Account" : "Connect LIVE Account"}
      submitVariant={credentials.paperTrading ? "primary" : "danger"}
      tradingModeAlert={{
        intent: credentials.paperTrading ? "info" : "warning",
        title: credentials.paperTrading ? "Paper Trading Mode" : "LIVE Trading Mode",
        message: credentials.paperTrading
          ? "Trade with virtual money for practice"
          : "Trade with real money - use caution",
        icon: credentials.paperTrading ? FileText : AlertTriangle,
      }}
      liveWarning={!credentials.paperTrading}
    >
      {/* Trading Mode Selection */}
      <div>
        <label className="block text-sm font-medium dark:text-gray-300 text-gray-700 mb-2">
          Trading Mode
        </label>
        <div className="grid grid-cols-2 gap-2">
          <Button
            type="button"
            onClick={() => handlePortChange(true)}
            variant={credentials.paperTrading ? "primary" : "secondary"}
            fullWidth
          >
            Paper Trading
          </Button>
          <Button
            type="button"
            onClick={() => handlePortChange(false)}
            variant={!credentials.paperTrading ? "primary" : "secondary"}
            fullWidth
          >
            Live Trading
          </Button>
        </div>
      </div>

      {/* Host Input */}
      <FormField
        label="Gateway Host"
        helpText='Usually "localhost" if IB Gateway is on this machine'
        required
      >
        <Input
          id="host"
          type="text"
          value={credentials.host}
          onChange={(e) => setCredentials({ ...credentials, host: e.target.value })}
          placeholder="localhost"
          required
        />
      </FormField>

      {/* Port Input */}
      <FormField
        label="Gateway Port"
        helpText="Paper: 7497, Live: 7496 (default IB Gateway ports)"
        required
      >
        <Input
          id="port"
          type="number"
          value={credentials.port}
          onChange={(e) => setCredentials({ ...credentials, port: parseInt(e.target.value) })}
          min="1"
          max="65535"
          required
        />
      </FormField>

      {/* Client ID Input */}
      <FormField
        label="Client ID"
        helpText="Unique ID for this connection (usually 1)"
        required
      >
        <Input
          id="clientId"
          type="number"
          value={credentials.clientId}
          onChange={(e) => setCredentials({ ...credentials, clientId: parseInt(e.target.value) })}
          min="0"
          max="999"
          required
        />
      </FormField>

      {/* Important Disclaimer */}
      <Alert intent="warning" title="Important Notice">
        <p className="text-xs">
          Always confirm all trades in your Interactive Brokers account directly.
          TrendDojo accepts no responsibility for trades made or not made on your account at any time.
        </p>
      </Alert>

      {/* Prerequisites Info */}
      <Alert intent="info" title="Prerequisites">
        <ul className="space-y-1 text-xs">
          <li>• IB Gateway or TWS must be running</li>
          <li>• API connections must be enabled in IB Gateway settings</li>
          <li>• "Allow connections from localhost only" should be checked</li>
          <li>• Your funds remain with Interactive Brokers at all times</li>
        </ul>
      </Alert>
    </BrokerConnectionForm>
  );
}