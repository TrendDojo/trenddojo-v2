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
}

export function AlpacaConnectionModal({
  isOpen,
  onClose,
  onConnect,
}: AlpacaConnectionModalProps) {
  const [credentials, setCredentials] = useState<AlpacaCredentials>({
    apiKeyId: "",
    secretKey: "",
    paperTrading: true, // Default to paper trading for safety
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
      setCredentials({ apiKeyId: "", secretKey: "", paperTrading: true });
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
      setCredentials({ apiKeyId: "", secretKey: "", paperTrading: true });
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Connect to Alpaca"
      size="lg"
    >
      <div className="space-y-6">
        {/* Paper Trading Toggle */}
        <div className="flex items-center justify-between p-4 dark:bg-amber-900/20 bg-amber-50 rounded-lg border dark:border-amber-800 border-amber-200">
          <div className="flex-1">
            <h3 className="font-medium dark:text-amber-300 text-amber-900 mb-1">
              Paper Trading Mode
            </h3>
            <p className="text-sm dark:text-amber-300/80 text-amber-700">
              {credentials.paperTrading
                ? "Using simulated trading environment (recommended for testing)"
                : "Using LIVE trading environment (real money at risk!)"}
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={credentials.paperTrading}
              onChange={(e) =>
                setCredentials({ ...credentials, paperTrading: e.target.checked })
              }
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-amber-600"></div>
          </label>
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
                    credentials.paperTrading
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
                {credentials.paperTrading
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
            plain text credentials. {credentials.paperTrading
              ? "Paper trading uses simulated money only."
              : "LIVE TRADING - Real money at risk!"}
          </p>
        </Alert>

        {/* Live Trading Warning */}
        {!credentials.paperTrading && (
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
            variant={credentials.paperTrading ? "primary" : "danger"}
            onClick={handleConnect}
            loading={loading}
            disabled={loading || !credentials.apiKeyId || !credentials.secretKey}
          >
            {loading
              ? "Connecting..."
              : credentials.paperTrading
              ? "Connect Paper Account"
              : "Connect LIVE Account"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}