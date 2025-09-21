"use client";

import { ReactNode, FormEvent } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Panel";
import { LucideIcon, AlertTriangle } from "lucide-react";

export interface BrokerConnectionFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: FormEvent) => Promise<void>;
  title: string;
  description?: string;
  loading?: boolean;
  error?: string | null;
  children: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  submitText?: string;
  cancelText?: string;
  submitVariant?: "primary" | "danger" | "secondary";
  tradingModeAlert?: {
    intent: "info" | "warning" | "error" | "success";
    title: string;
    message: string;
    icon?: LucideIcon;
  };
  securityNotice?: {
    message: string;
    details?: string;
  };
  liveWarning?: boolean;
}

export function BrokerConnectionForm({
  isOpen,
  onClose,
  onSubmit,
  title,
  description,
  loading = false,
  error,
  children,
  size = "lg",
  submitText = "Connect",
  cancelText = "Cancel",
  submitVariant = "primary",
  tradingModeAlert,
  securityNotice,
  liveWarning = false,
}: BrokerConnectionFormProps) {
  const handleFormSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await onSubmit(e);
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={title}
      description={description}
      size={size}
    >
      <form onSubmit={handleFormSubmit} className="space-y-6">
        {/* Trading Mode Alert */}
        {tradingModeAlert && (
          <Alert
            intent={tradingModeAlert.intent}
            title={tradingModeAlert.title}
            icon={tradingModeAlert.icon}
          >
            {tradingModeAlert.message}
          </Alert>
        )}

        {/* Form Fields (passed as children) */}
        <div className="space-y-4">
          {children}
        </div>

        {/* Error Display */}
        {error && (
          <Alert intent="error">
            {error}
          </Alert>
        )}

        {/* Security Notice */}
        {securityNotice && (
          <Alert intent="info">
            <p className="text-sm">
              {securityNotice.message}
            </p>
            {securityNotice.details && (
              <p className="text-xs mt-2 opacity-90">
                {securityNotice.details}
              </p>
            )}
          </Alert>
        )}

        {/* Live Trading Warning */}
        {liveWarning && (
          <Alert intent="warning" title="LIVE TRADING MODE" icon={AlertTriangle}>
            <p className="text-sm">
              You are about to connect to your LIVE account. Real money
              will be at risk. All trades executed will use actual funds. Please
              ensure you understand the risks before proceeding.
            </p>
          </Alert>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 justify-end">
          <Button
            type="button"
            variant="ghost"
            onClick={handleClose}
            disabled={loading}
          >
            {cancelText}
          </Button>
          <Button
            type="submit"
            variant={submitVariant}
            loading={loading}
            disabled={loading}
          >
            {loading ? "Connecting..." : submitText}
          </Button>
        </div>
      </form>
    </Modal>
  );
}