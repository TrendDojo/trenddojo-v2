"use client";

import { cn } from "@/lib/utils";
import { AlertTriangle, Shield, TrendingDown, Lock } from "lucide-react";

interface AccountStatusBarProps {
  accountStatus: 'active' | 'warning' | 'recovery' | 'locked';
  currentDrawdown: number;
  portfolioName?: string;
  className?: string;
}

export function AccountStatusBar({
  accountStatus,
  currentDrawdown,
  portfolioName = "Main Portfolio",
  className
}: AccountStatusBarProps) {
  const getStatusConfig = () => {
    switch (accountStatus) {
      case 'active':
        return {
          icon: Shield,
          label: 'Active',
          color: 'text-success bg-alert-success',
          message: 'All systems normal'
        };
      case 'warning':
        return {
          icon: AlertTriangle,
          label: 'Warning',
          color: 'text-warning bg-alert-warning',
          message: 'Approaching risk limits'
        };
      case 'recovery':
        return {
          icon: TrendingDown,
          label: 'Recovery Mode',
          color: 'text-warning bg-alert-warning',
          message: 'Position sizes reduced'
        };
      case 'locked':
        return {
          icon: Lock,
          label: 'Locked',
          color: 'text-danger bg-alert-danger',
          message: 'Trading suspended - circuit breaker activated'
        };
      default:
        return {
          icon: Shield,
          label: 'Unknown',
          color: 'text-gray-600 dark:text-gray-400 bg-gray-500/10',
          message: ''
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  // Drawdown color based on severity
  const getDrawdownColor = (drawdown: number) => {
    if (drawdown >= -5) return 'text-gray-600 dark:text-gray-400';
    if (drawdown >= -10) return 'text-warning';
    if (drawdown >= -15) return 'text-warning';
    return 'text-danger';
  };

  return (
    <div className={cn(
      "flex items-center justify-between px-4 py-3 rounded-lg",
      config.color,
      className
    )}>
      <div className="flex items-center gap-3">
        <Icon className="w-5 h-5" />
        <div className="flex items-center gap-6">
          <div>
            <p className="text-xs opacity-75">Portfolio Status</p>
            <p className="text-sm font-semibold">{config.label}</p>
          </div>
          <div>
            <p className="text-xs opacity-75">Current Drawdown</p>
            <p className={cn("text-sm font-semibold", getDrawdownColor(currentDrawdown))}>
              {currentDrawdown.toFixed(1)}%
            </p>
          </div>
          {config.message && (
            <p className="text-sm italic opacity-75">
              {config.message}
            </p>
          )}
        </div>
      </div>

      {/* Drawdown progress bar */}
      <div className="w-48">
        <div className="flex justify-between text-xs opacity-75 mb-1">
          <span>0%</span>
          <span>Max Drawdown</span>
          <span>-30%</span>
        </div>
        <div className="h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full transition-all",
              currentDrawdown >= -5 && "bg-gray-500",
              currentDrawdown < -5 && currentDrawdown >= -10 && "bg-warning",
              currentDrawdown < -10 && currentDrawdown >= -15 && "bg-warning",
              currentDrawdown < -15 && "bg-danger"
            )}
            style={{ width: `${Math.min(100, Math.abs(currentDrawdown) * (100 / 30))}%` }}
          />
        </div>
        {/* Tier markers */}
        <div className="relative h-1 mt-1">
          <div className="absolute left-[16.7%] w-px h-full bg-gray-400" title="-5%" />
          <div className="absolute left-[33.3%] w-px h-full bg-warning" title="-10%" />
          <div className="absolute left-[50%] w-px h-full bg-warning" title="-15%" />
          <div className="absolute left-[66.7%] w-px h-full bg-danger" title="-20%" />
        </div>
      </div>
    </div>
  );
}