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
          color: 'text-up bg-up/10 border-up/20',
          message: 'All systems normal'
        };
      case 'warning':
        return {
          icon: AlertTriangle,
          label: 'Warning',
          color: 'text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20',
          message: 'Approaching risk limits'
        };
      case 'recovery':
        return {
          icon: TrendingDown,
          label: 'Recovery Mode',
          color: 'text-orange-600 dark:text-orange-400 bg-orange-500/10 border-orange-500/20',
          message: 'Position sizes reduced'
        };
      case 'locked':
        return {
          icon: Lock,
          label: 'Locked',
          color: 'text-red-600 dark:text-red-400 bg-red-500/10 border-red-500/20',
          message: 'Trading suspended - circuit breaker activated'
        };
      default:
        return {
          icon: Shield,
          label: 'Unknown',
          color: 'text-gray-600 dark:text-gray-400 bg-gray-500/10 border-gray-500/20',
          message: ''
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  // Drawdown color based on severity
  const getDrawdownColor = (drawdown: number) => {
    if (drawdown >= -5) return 'text-gray-600 dark:text-gray-400';
    if (drawdown >= -10) return 'text-amber-600 dark:text-amber-400';
    if (drawdown >= -15) return 'text-orange-600 dark:text-orange-400';
    return 'text-red-600 dark:text-red-400';
  };

  return (
    <div className={cn(
      "flex items-center justify-between px-4 py-2 border rounded-lg",
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
              currentDrawdown < -5 && currentDrawdown >= -10 && "bg-amber-500",
              currentDrawdown < -10 && currentDrawdown >= -15 && "bg-orange-500",
              currentDrawdown < -15 && "bg-red-500"
            )}
            style={{ width: `${Math.min(100, Math.abs(currentDrawdown) * (100 / 30))}%` }}
          />
        </div>
        {/* Tier markers */}
        <div className="relative h-1 mt-1">
          <div className="absolute left-[16.7%] w-px h-full bg-gray-400" title="-5%" />
          <div className="absolute left-[33.3%] w-px h-full bg-amber-500" title="-10%" />
          <div className="absolute left-[50%] w-px h-full bg-orange-500" title="-15%" />
          <div className="absolute left-[66.7%] w-px h-full bg-red-500" title="-20%" />
        </div>
      </div>
    </div>
  );
}