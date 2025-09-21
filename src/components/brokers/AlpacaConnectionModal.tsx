"use client";

import { useState } from "react";
import { BrokerConnectionForm } from "./BrokerConnectionForm";
import { FormField, Input } from "@/components/ui/FormField";
import { Alert } from "@/components/ui/Panel";
import { ExternalLink, AlertTriangle } from "lucide-react";

export interface AlpacaCredentials {
  apiKeyId: string;
  secretKey: string;
  paperTrading: boolean;
}

interface AlpacaConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect: (credentials: AlpacaCredentials) => Promise<void>;
  isPaperTrading?: boolean;
}

export function AlpacaConnectionModal({
  isOpen,
  onClose,
  onConnect,
  isPaperTrading = true,
}: AlpacaConnectionModalProps) {
  const [credentials, setCredentials] = useState<AlpacaCredentials>({
    apiKeyId: "",
    secretKey: "",
    paperTrading: isPaperTrading,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!credentials.apiKeyId || !credentials.secretKey) {
      setError("Please enter both API Key ID and Secret Key");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await onConnect(credentials);
      onClose();
      // Clear credentials after successful connection
      setCredentials({ apiKeyId: "", secretKey: "", paperTrading: isPaperTrading });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to connect to Alpaca"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
      setError(null);
      // Clear credentials when closing
      setCredentials({ apiKeyId: "", secretKey: "", paperTrading: isPaperTrading });
    }
  };

  return (
    <BrokerConnectionForm
      isOpen={isOpen}
      onClose={handleClose}
      onSubmit={handleSubmit}
      title={isPaperTrading ? "Connect to Alpaca Paper Trading" : "Connect to Alpaca Live Trading"}
      loading={loading}
      error={error}
      submitText={isPaperTrading ? "Connect Paper Account" : "Connect LIVE Account"}
      submitVariant={isPaperTrading ? "primary" : "danger"}
      tradingModeAlert={{
        intent: "warning",
        title: isPaperTrading ? "Paper Trading Mode" : "LIVE Trading Mode",
        message: isPaperTrading
          ? "Using simulated trading environment - perfect for testing strategies"
          : "Using LIVE trading environment - real money at risk!",
        icon: AlertTriangle,
      }}
      securityNotice={{
        message: "Your API credentials will be encrypted before storage. We never store plain text credentials.",
        details: isPaperTrading
          ? "Paper trading uses simulated money only."
          : "LIVE TRADING - Real money at risk!",
      }}
      liveWarning={!isPaperTrading}
    >
      {/* API Key ID Field */}
      <FormField
        label="API Key ID"
        required
        helpText="This starts with 'PK' and is your public key identifier"
      >
        <Input
          placeholder="PKXXXXXXXXXXXXXXXX (starts with PK)"
          value={credentials.apiKeyId}
          onChange={(e) =>
            setCredentials({ ...credentials, apiKeyId: e.target.value })
          }
          disabled={loading}
          autoComplete="off"
          className="font-mono"
        />
      </FormField>

      {/* Secret Key Field */}
      <FormField
        label="Secret Key"
        required
        helpText="This is your private secret key - keep it secure"
      >
        <Input
          type="password"
          placeholder="Enter your secret key (hidden for security)"
          value={credentials.secretKey}
          onChange={(e) =>
            setCredentials({ ...credentials, secretKey: e.target.value })
          }
          disabled={loading}
          autoComplete="off"
          className="font-mono"
        />
      </FormField>

      {/* How to Get API Keys */}
      <Alert intent="info" title="How to Get Your API Keys">
        <ol className="text-sm space-y-2">
          <li className="flex items-start gap-2">
            <span className="font-semibold">1.</span>
            <span>
              Go to{" "}
              <a
                href={
                  isPaperTrading
                    ? "https://app.alpaca.markets/paper/dashboard/overview"
                    : "https://app.alpaca.markets/brokerage/dashboard/overview"
                }
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1"
              >
                Alpaca Dashboard
                <ExternalLink className="w-3 h-3" />
              </a>
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-semibold">2.</span>
            <span>Navigate to "API Keys" in the left sidebar</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-semibold">3.</span>
            <span>
              {isPaperTrading
                ? "Make sure you're in Paper Trading mode (toggle at top)"
                : "Make sure you're in Live Trading mode (toggle at top)"}
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-semibold">4.</span>
            <span>Generate a new API key or use an existing one</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-semibold">5.</span>
            <span>
              Copy both values:
              <br />
              • <strong>Key ID</strong>: Starts with "PK" (this is your API Key ID)
              <br />
              • <strong>Secret Key</strong>: Longer private key for authentication
            </span>
          </li>
        </ol>
      </Alert>
    </BrokerConnectionForm>
  );
}