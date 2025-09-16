"use client";

import { useState, useEffect } from "react";
import { X, Info, TrendingUp, AlertTriangle, DollarSign, Percent, Activity } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface AllocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (allocation: AllocationData) => void;
  strategy: {
    id: string;
    name: string;
    currentAllocation?: number;
    performance?: {
      winRate: number;
      sharpeRatio: number;
      maxDrawdown: number;
    };
  };
  portfolio: {
    totalValue: number;
    availableCash: number;
    currentAllocations: {
      strategyId: string;
      amount: number;
      percentage: number;
    }[];
  };
}

interface AllocationData {
  strategyId: string;
  amount: number;
  percentage: number;
}

export function AllocationModal({
  isOpen,
  onClose,
  onConfirm,
  strategy,
  portfolio
}: AllocationModalProps) {
  const [percentage, setPercentage] = useState<number>(
    strategy.currentAllocation || 10
  );
  const [amount, setAmount] = useState<number>(0);
  const [inputMode, setInputMode] = useState<"percentage" | "amount">("percentage");
  const [error, setError] = useState<string>("");

  // Calculate amount based on percentage
  useEffect(() => {
    if (inputMode === "percentage") {
      const calculatedAmount = (portfolio.totalValue * percentage) / 100;
      setAmount(Math.round(calculatedAmount * 100) / 100);
    }
  }, [percentage, portfolio.totalValue, inputMode]);

  // Calculate percentage based on amount
  useEffect(() => {
    if (inputMode === "amount") {
      const calculatedPercentage = (amount / portfolio.totalValue) * 100;
      setPercentage(Math.round(calculatedPercentage * 100) / 100);
    }
  }, [amount, portfolio.totalValue, inputMode]);

  // Validate allocation
  useEffect(() => {
    setError("");

    if (amount > portfolio.availableCash) {
      setError(`Insufficient cash. Available: $${portfolio.availableCash.toLocaleString()}`);
    } else if (percentage > 50) {
      setError("Warning: Allocating more than 50% to a single strategy is high risk");
    } else if (percentage < 1) {
      setError("Allocation must be at least 1%");
    }

    // Check total allocations
    const otherAllocations = portfolio.currentAllocations
      .filter(a => a.strategyId !== strategy.id)
      .reduce((sum, a) => sum + a.percentage, 0);

    if (otherAllocations + percentage > 100) {
      setError(`Total allocations would exceed 100% (Current: ${otherAllocations.toFixed(1)}%)`);
    }
  }, [amount, percentage, portfolio, strategy.id]);

  const handleConfirm = () => {
    if (!error || error.startsWith("Warning:")) {
      onConfirm({
        strategyId: strategy.id,
        amount,
        percentage
      });
      onClose();
    }
  };

  const quickAllocationOptions = [5, 10, 20, 30, 40, 50];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl mx-4 bg-white dark:bg-slate-800 rounded-xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b dark:border-slate-700 border-gray-200">
          <div>
            <h2 className="text-xl font-semibold dark:text-white text-gray-900">
              Allocate Capital to Strategy
            </h2>
            <p className="text-sm dark:text-gray-400 text-gray-600 mt-1">
              {strategy.name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5 dark:text-gray-400 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Portfolio Overview */}
          <div className="bg-gray-50 dark:bg-slate-900 rounded-lg p-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm dark:text-gray-400 text-gray-600">Portfolio Value</p>
                <p className="text-lg font-bold dark:text-white text-gray-900">
                  ${portfolio.totalValue.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm dark:text-gray-400 text-gray-600">Available Cash</p>
                <p className="text-lg font-bold dark:text-white text-gray-900">
                  ${portfolio.availableCash.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm dark:text-gray-400 text-gray-600">Current Allocation</p>
                <p className="text-lg font-bold dark:text-white text-gray-900">
                  {strategy.currentAllocation || 0}%
                </p>
              </div>
            </div>
          </div>

          {/* Strategy Performance */}
          {strategy.performance && (
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-up" />
                <span className="text-sm dark:text-gray-300 text-gray-700">
                  Win Rate: <span className="font-medium">{strategy.performance.winRate.toFixed(1)}%</span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-indigo-500" />
                <span className="text-sm dark:text-gray-300 text-gray-700">
                  Sharpe: <span className="font-medium">{strategy.performance.sharpeRatio.toFixed(1)}</span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span className="text-sm dark:text-gray-300 text-gray-700">
                  Max DD: <span className="font-medium">{strategy.performance.maxDrawdown.toFixed(1)}%</span>
                </span>
              </div>
            </div>
          )}

          {/* Allocation Input */}
          <div className="space-y-4">
            {/* Input Mode Toggle */}
            <div className="flex gap-2">
              <button
                onClick={() => setInputMode("percentage")}
                className={cn(
                  "flex-1 py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2",
                  inputMode === "percentage"
                    ? "bg-indigo-600 text-white"
                    : "dark:bg-slate-700 bg-gray-100 dark:text-gray-300 text-gray-700"
                )}
              >
                <Percent className="w-4 h-4" />
                Percentage
              </button>
              <button
                onClick={() => setInputMode("amount")}
                className={cn(
                  "flex-1 py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2",
                  inputMode === "amount"
                    ? "bg-indigo-600 text-white"
                    : "dark:bg-slate-700 bg-gray-100 dark:text-gray-300 text-gray-700"
                )}
              >
                <DollarSign className="w-4 h-4" />
                Amount
              </button>
            </div>

            {/* Percentage Input */}
            {inputMode === "percentage" && (
              <div>
                <label className="block text-sm font-medium dark:text-gray-300 text-gray-700 mb-2">
                  Allocation Percentage
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={percentage}
                    onChange={(e) => setPercentage(Math.max(0, Math.min(100, parseFloat(e.target.value) || 0)))}
                    className="w-full px-4 py-3 pr-12 border dark:border-slate-700 border-gray-300 rounded-lg dark:bg-slate-900 bg-white dark:text-white text-gray-900 text-lg font-medium"
                    min="0"
                    max="100"
                    step="1"
                  />
                  <span className="absolute right-4 top-3.5 text-lg font-medium dark:text-gray-400 text-gray-600">
                    %
                  </span>
                </div>
              </div>
            )}

            {/* Amount Input */}
            {inputMode === "amount" && (
              <div>
                <label className="block text-sm font-medium dark:text-gray-300 text-gray-700 mb-2">
                  Allocation Amount
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-3.5 text-lg font-medium dark:text-gray-400 text-gray-600">
                    $
                  </span>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(Math.max(0, Math.min(portfolio.totalValue, parseFloat(e.target.value) || 0)))}
                    className="w-full px-4 py-3 pl-10 border dark:border-slate-700 border-gray-300 rounded-lg dark:bg-slate-900 bg-white dark:text-white text-gray-900 text-lg font-medium"
                    min="0"
                    max={portfolio.totalValue}
                    step="100"
                  />
                </div>
              </div>
            )}

            {/* Quick Allocation Buttons */}
            <div className="space-y-2">
              <p className="text-sm dark:text-gray-400 text-gray-600">Quick allocation:</p>
              <div className="flex gap-2">
                {quickAllocationOptions.map((pct) => (
                  <button
                    key={pct}
                    onClick={() => {
                      setInputMode("percentage");
                      setPercentage(pct);
                    }}
                    className="flex-1 py-2 px-3 rounded-lg dark:bg-slate-700 bg-gray-100 dark:hover:bg-slate-600 hover:bg-gray-200 dark:text-gray-300 text-gray-700 transition-colors text-sm font-medium"
                  >
                    {pct}%
                  </button>
                ))}
              </div>
            </div>

            {/* Allocation Slider */}
            <div className="space-y-2">
              <input
                type="range"
                min="0"
                max="100"
                value={percentage}
                onChange={(e) => {
                  setInputMode("percentage");
                  setPercentage(parseFloat(e.target.value));
                }}
                className="w-full h-2 bg-gray-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer slider"
                style={{
                  background: `linear-gradient(to right, rgb(99, 102, 241) 0%, rgb(99, 102, 241) ${percentage}%, rgb(229, 231, 235) ${percentage}%, rgb(229, 231, 235) 100%)`
                }}
              />
              <div className="flex justify-between text-xs dark:text-gray-400 text-gray-600">
                <span>0%</span>
                <span>25%</span>
                <span>50%</span>
                <span>75%</span>
                <span>100%</span>
              </div>
            </div>

            {/* Result Display */}
            <div className="bg-indigo-50 dark:bg-indigo-950/30 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm dark:text-gray-300 text-gray-700">
                  Allocation Amount:
                </span>
                <span className="text-xl font-bold dark:text-white text-gray-900">
                  ${amount.toLocaleString()} ({percentage.toFixed(1)}%)
                </span>
              </div>
            </div>

            {/* Error/Warning Message */}
            {error && (
              <div className={cn(
                "flex items-start gap-2 p-3 rounded-lg",
                error.startsWith("Warning:")
                  ? "bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-400"
                  : "bg-red-50 dark:bg-red-950/30 text-red-800 dark:text-red-400"
              )}>
                <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            {/* Info */}
            <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
              <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800 dark:text-blue-400">
                <p>This allocation will be used to:</p>
                <ul className="list-disc list-inside mt-1 space-y-0.5">
                  <li>Set position sizing limits for this strategy</li>
                  <li>Reserve capital from your available cash</li>
                  <li>Calculate risk metrics and exposure</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t dark:border-slate-700 border-gray-200">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleConfirm}
            disabled={!!error && !error.startsWith("Warning:")}
          >
            Confirm Allocation
          </Button>
        </div>
      </div>
    </div>
  );
}