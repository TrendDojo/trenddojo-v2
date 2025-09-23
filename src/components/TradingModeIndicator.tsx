"use client";

import { cn } from "@/lib/utils";
import { TrendingUp, TestTube, Code, AlertCircle } from "lucide-react";

export type TradingMode = 'live' | 'paper' | 'dev';
export type BrokerId = 'alpaca_live' | 'alpaca_paper' | 'ibkr_live' | 'ibkr_paper' | 'dev_mock';

interface TradingModeIndicatorProps {
  mode: TradingMode;
  broker?: string; // e.g., "Alpaca", "IBKR", "TD Ameritrade"
  accountId?: string; // e.g., "****1234"
  variant?: 'inline' | 'badge' | 'card' | 'warning';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showIcon?: boolean;
  showBroker?: boolean;
  showAccount?: boolean;
}

const modeConfig = {
  live: {
    label: 'LIVE',
    color: 'bg-red-600',
    lightColor: 'bg-red-50 dark:bg-red-950/30',
    textColor: 'text-white',
    lightTextColor: 'text-red-700 dark:text-red-400',
    borderColor: 'border-red-500',
    ringColor: 'ring-red-500',
    icon: TrendingUp,
    description: 'Real money'
  },
  paper: {
    label: 'PAPER',
    color: 'bg-teal-600',
    lightColor: 'bg-teal-50 dark:bg-teal-950/30',
    textColor: 'text-white',
    lightTextColor: 'text-teal-700 dark:text-teal-400',
    borderColor: 'border-teal-500',
    ringColor: 'ring-teal-500',
    icon: TestTube,
    description: 'Simulated'
  },
  dev: {
    label: 'DEV',
    color: 'bg-gray-600',
    lightColor: 'bg-gray-50 dark:bg-gray-950/30',
    textColor: 'text-white',
    lightTextColor: 'text-gray-700 dark:text-gray-400',
    borderColor: 'border-gray-500',
    ringColor: 'ring-gray-500',
    icon: Code,
    description: 'Mock data'
  }
};

const sizeConfig = {
  sm: {
    padding: 'px-2 py-0.5',
    text: 'text-xs',
    icon: 'w-3 h-3',
    gap: 'gap-1'
  },
  md: {
    padding: 'px-3 py-1',
    text: 'text-sm',
    icon: 'w-4 h-4',
    gap: 'gap-1.5'
  },
  lg: {
    padding: 'px-4 py-1.5',
    text: 'text-base',
    icon: 'w-5 h-5',
    gap: 'gap-2'
  }
};

export function TradingModeIndicator({
  mode,
  broker,
  accountId,
  variant = 'inline',
  size = 'md',
  className = '',
  showIcon = true,
  showBroker = true,
  showAccount = false
}: TradingModeIndicatorProps) {
  const config = modeConfig[mode];
  const sizeStyles = sizeConfig[size];
  const Icon = config.icon;

  // Format the label
  const getLabel = () => {
    const parts = [];

    if (showBroker && broker) {
      parts.push(broker);
    }

    parts.push(config.label);

    if (showAccount && accountId) {
      parts.push(accountId);
    }

    return parts.join(' • ');
  };

  if (variant === 'card') {
    // Full card variant for headers/sections
    return (
      <div className={cn(
        "flex items-center gap-2 rounded-lg p-2",
        config.lightColor,
        "border",
        config.borderColor,
        className
      )}>
        {showIcon && (
          <div className={cn(
            "rounded-full p-1.5",
            config.color,
            config.textColor
          )}>
            <Icon className="w-4 h-4" />
          </div>
        )}
        <div className="flex flex-col">
          <div className={cn(
            "font-semibold",
            config.lightTextColor,
            "text-sm"
          )}>
            {getLabel()}
          </div>
          {config.description && (
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {config.description}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (variant === 'warning') {
    // Warning strip for live trading
    return (
      <div className={cn(
        "flex items-center justify-center",
        sizeStyles.gap,
        sizeStyles.padding,
        config.color,
        config.textColor,
        "font-bold",
        sizeStyles.text,
        className
      )}>
        {showIcon && <AlertCircle className={sizeStyles.icon} />}
        <span>{getLabel()} - {config.description}</span>
      </div>
    );
  }

  // Default inline/badge variants
  return (
    <div className={cn(
      "inline-flex items-center rounded-full font-medium",
      sizeStyles.padding,
      sizeStyles.text,
      sizeStyles.gap,
      variant === 'badge' ? cn(
        config.lightColor,
        config.lightTextColor,
        "border",
        config.borderColor
      ) : cn(
        config.color,
        config.textColor
      ),
      className
    )}>
      {showIcon && (
        <Icon className={sizeStyles.icon} />
      )}
      <span>{getLabel()}</span>
    </div>
  );
}

// Helper component for positions/orders pages
export function BrokerTradingMode({ brokerId }: { brokerId: BrokerId }) {
  const brokerConfig: Record<BrokerId, { mode: TradingMode; broker: string }> = {
    'alpaca_live': { mode: 'live', broker: 'Alpaca' },
    'alpaca_paper': { mode: 'paper', broker: 'Alpaca' },
    'ibkr_live': { mode: 'live', broker: 'IBKR' },
    'ibkr_paper': { mode: 'paper', broker: 'IBKR' },
    'dev_mock': { mode: 'dev', broker: 'Mock' }
  };

  const config = brokerConfig[brokerId] || { mode: 'dev', broker: 'Unknown' };

  return (
    <TradingModeIndicator
      mode={config.mode}
      broker={config.broker}
      variant="badge"
      size="sm"
    />
  );
}

// Legacy component for backward compatibility
export function PaperTradingIndicator() {
  // No longer fixed position - should be placed contextually
  return <TradingModeIndicator mode="paper" variant="badge" showBroker={false} />;
}