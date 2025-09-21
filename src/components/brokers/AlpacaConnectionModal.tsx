"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { FormField, Input } from "@/components/ui/FormField";
import { Alert } from "@/components/ui/Panel";
import { ExternalLink } from "lucide-react";

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

  const handleConnect = async () => {
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
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isPaperTrading ? "Connect to Alpaca Paper Trading" : "Connect to Alpaca Live Trading"}
      size="lg"
    >
      <div className="space-y-6">
        {/* Trading Mode Indicator */}
        <div className={`p-4 rounded-lg ${
          isPaperTrading ? 'bg-info/10' : 'bg-warning/10'
        }`}>
          <h3 className={`font-medium mb-1 ${
            isPaperTrading ? 'text-info' : 'text-warning'
          }`}>
            {isPaperTrading ? '📝 Paper Trading Mode' : '⚠️ LIVE Trading Mode'}
          </h3>
          <p className={`text-sm ${
            isPaperTrading ? 'text-info/80' : 'text-warning/80'
          }`}>
            {isPaperTrading
              ? "Using simulated trading environment - perfect for testing strategies"
              : "Using LIVE trading environment - real money at risk!"}
          </p>
        </div>

        {/* API Credentials */}
        <div className="space-y-4">
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
        </div>

        {/* How to Get API Keys */}
        <div className="p-4 dark:bg-slate-800 bg-gray-50 rounded-lg">
          <h4 className="font-medium dark:text-gray-300 text-gray-700 mb-2">
            How to Get Your API Keys
          </h4>
          <ol className="text-sm dark:text-gray-400 text-gray-600 space-y-2">
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
        </div>

        {/* Error Display */}
        {error && (
          <Alert intent="error">
            {error}
          </Alert>
        )}

        {/* Security Notice */}
        <Alert intent="info">
          <p className="text-sm">
            Your API credentials will be encrypted before storage. We never store
            plain text credentials. {isPaperTrading
              ? "Paper trading uses simulated money only."
              : "LIVE TRADING - Real money at risk!"}
          </p>
        </Alert>

        {/* Live Trading Warning */}
        {!isPaperTrading && (
          <Alert intent="warning">
            <p className="font-semibold mb-2">⚠️ LIVE TRADING MODE</p>
            <p className="text-sm">
              You are about to connect to your LIVE Alpaca account. Real money
              will be at risk. All trades executed will use actual funds. Please
              ensure you understand the risks before proceeding.
            </p>
          </Alert>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 justify-end">
          <Button
            variant="ghost"
            onClick={handleClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            variant={isPaperTrading ? "primary" : "danger"}
            onClick={handleConnect}
            loading={loading}
            disabled={loading || !credentials.apiKeyId || !credentials.secretKey}
          >
            {loading
              ? "Connecting..."
              : isPaperTrading
              ? "Connect Paper Account"
              : "Connect LIVE Account"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}