"use client";

import { useState } from "react";
import { BrokerConnectionForm } from "./BrokerConnectionForm";
import { FormField, Input } from "@/components/ui/FormField";
import { Alert } from "@/components/ui/Panel";
import { ExternalLink, Zap, Layers } from "lucide-react";

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
      submitVariant="primary"
      tradingModeAlert={{
        intent: isPaperTrading ? "success" : "error",
        title: isPaperTrading ? "Paper Trading Mode" : "LIVE Trading Mode",
        message: isPaperTrading
          ? "Using simulated trading environment - perfect for testing strategies"
          : "You are about to connect to your LIVE account. Real money will be at risk. All trades executed will use actual funds. Please ensure you understand the risks before proceeding.",
        icon: isPaperTrading ? Layers : Zap,
      }}
      liveWarning={false}
    >
      {/* API Key ID Field */}
      <FormField
        label="API Key ID"
        required
        helper={isPaperTrading ? "This starts with 'PK' for paper trading" : "This starts with 'AK' for live trading"}
      >
        <Input
          placeholder={isPaperTrading ? "PKXXXXXXXXXXXXXXXX (starts with PK)" : "AKXXXXXXXXXXXXXXXX (starts with AK)"}
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
        helper="This is your private secret key - keep it secure"
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

      {/* Security Notice */}
      <Alert intent="warning" title="Security Notice">
        <p className="text-sm">
          Your API credentials will be encrypted before storage. We never store
          plain text credentials. {isPaperTrading
            ? "Paper trading uses simulated money only."
            : "LIVE TRADING - Real money at risk!"}
        </p>
      </Alert>

      {/* How to Get API Keys */}
      <Alert intent="info" title="How to Get Your API Keys">
        <ol className="text-sm space-y-2">
          <li className="flex items-start gap-2">
            <span className="font-semibold">1.</span>
            <span>Log in to your Alpaca account</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-semibold">2.</span>
            <span>Navigate to <strong>Profile Settings → Manage Accounts</strong></span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-semibold">3.</span>
            <span>Click <strong>Generate New Key</strong></span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-semibold">4.</span>
            <span>
              Copy both values immediately:
              <br />
              • <strong>Key ID</strong>: {isPaperTrading ? 'Starts with "PK"' : 'Starts with "AK"'} (this is your API Key ID)
              <br />
              • <strong>Secret Key</strong>: Longer private key - save this now as it won't be shown again!
            </span>
          </li>
        </ol>
      </Alert>
    </BrokerConnectionForm>
  );
}