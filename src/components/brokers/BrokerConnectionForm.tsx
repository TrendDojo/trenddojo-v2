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
            <span className="text-base font-bold">{error}</span>
          </Alert>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 justify-end">
          <Button
            type="button"
            variant="secondary"
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