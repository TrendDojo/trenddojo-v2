"use client";

import { useState, useEffect, useCallback } from "react";
import { Info, AlertTriangle, Lock, Unlock, TrendingUp, DollarSign, Percent } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface Strategy {
  id: string;
  name: string;
  status: string;
  winRate: number;
  netPnl: number;
  sharpeRatio: number;
  currentAllocation: number; // Percentage
  minAllocation?: number;
  maxAllocation?: number;
  locked?: boolean;
}

interface AllocationPanelProps {
  strategies: Strategy[];
  portfolioValue: number;
  availableCash: number;
  onSave?: (allocations: { strategyId: string; percentage: number; amount: number }[]) => void;
  className?: string;
}

export function AllocationPanel({
  strategies: initialStrategies,
  portfolioValue,
  availableCash,
  onSave,
  className
}: AllocationPanelProps) {
  const [strategies, setStrategies] = useState<Strategy[]>(
    initialStrategies.map(s => ({
      ...s,
      locked: false,
      minAllocation: 0,
      maxAllocation: 100
    }))
  );
  const [displayMode, setDisplayMode] = useState<"percentage" | "amount">("percentage");
  const [totalAllocation, setTotalAllocation] = useState(0);
  const [isDirty, setIsDirty] = useState(false);
  const [autoBalance, setAutoBalance] = useState(true);

  // Calculate total allocation
  useEffect(() => {
    const total = strategies.reduce((sum, s) => sum + s.currentAllocation, 0);
    setTotalAllocation(total);
  }, [strategies]);

  // Handle allocation change for a strategy
  const handleAllocationChange = useCallback((strategyId: string, newValue: number) => {
    setIsDirty(true);

    setStrategies(prev => {
      const updatedStrategies = [...prev];
      const strategyIndex = updatedStrategies.findIndex(s => s.id === strategyId);
      const oldValue = updatedStrategies[strategyIndex].currentAllocation;

      // Apply the new value
      updatedStrategies[strategyIndex].currentAllocation = newValue;

      if (autoBalance) {
        // Calculate the difference
        const diff = newValue - oldValue;

        // Get unlocked strategies (excluding the one being changed)
        const unlockedStrategies = updatedStrategies.filter(
          s => s.id !== strategyId && !s.locked && s.currentAllocation > 0
        );

        if (unlockedStrategies.length > 0 && diff !== 0) {
          // Distribute the difference proportionally among unlocked strategies
          const totalUnlockedAllocation = unlockedStrategies.reduce(
            (sum, s) => sum + s.currentAllocation,
            0
          );

          unlockedStrategies.forEach(strategy => {
            const stratIdx = updatedStrategies.findIndex(s => s.id === strategy.id);
            const proportion = strategy.currentAllocation / totalUnlockedAllocation;
            const adjustment = diff * proportion;

            updatedStrategies[stratIdx].currentAllocation = Math.max(
              0,
              Math.min(100, strategy.currentAllocation - adjustment)
            );
          });
        }
      }

      // Normalize to ensure total is exactly 100% if auto-balance is on
      if (autoBalance) {
        const currentTotal = updatedStrategies.reduce((sum, s) => sum + s.currentAllocation, 0);
        if (currentTotal !== 100 && currentTotal > 0) {
          const scale = 100 / currentTotal;
          updatedStrategies.forEach(s => {
            if (!s.locked) {
              s.currentAllocation = s.currentAllocation * scale;
            }
          });
        }
      }

      return updatedStrategies;
    });
  }, [autoBalance]);

  // Toggle lock status
  const toggleLock = (strategyId: string) => {
    setStrategies(prev =>
      prev.map(s =>
        s.id === strategyId ? { ...s, locked: !s.locked } : s
      )
    );
  };

  // Reset allocations
  const handleReset = () => {
    setStrategies(initialStrategies.map(s => ({
      ...s,
      locked: false,
      minAllocation: 0,
      maxAllocation: 100
    })));
    setIsDirty(false);
  };

  // Equalize allocations
  const handleEqualize = () => {
    setIsDirty(true);
    const activeStrategies = strategies.filter(s => s.status === "active");
    const equalAllocation = 100 / activeStrategies.length;

    setStrategies(prev =>
      prev.map(s => ({
        ...s,
        currentAllocation: s.status === "active" ? equalAllocation : 0
      }))
    );
  };

  // Optimize by performance
  const handleOptimize = () => {
    setIsDirty(true);
    const activeStrategies = strategies.filter(s => s.status === "active");

    // Score each strategy based on multiple factors
    const scoredStrategies = activeStrategies.map(s => ({
      ...s,
      score: (s.winRate / 100) * 0.4 +
             (Math.max(0, s.sharpeRatio) / 3) * 0.4 +
             (s.netPnl > 0 ? 0.2 : 0)
    }));

    const totalScore = scoredStrategies.reduce((sum, s) => sum + s.score, 0);

    setStrategies(prev =>
      prev.map(s => {
        const scored = scoredStrategies.find(sc => sc.id === s.id);
        if (scored && totalScore > 0) {
          return {
            ...s,
            currentAllocation: (scored.score / totalScore) * 100
          };
        }
        return { ...s, currentAllocation: 0 };
      })
    );
  };

  // Save allocations
  const handleSave = () => {
    if (onSave) {
      const allocations = strategies.map(s => ({
        strategyId: s.id,
        percentage: s.currentAllocation,
        amount: (portfolioValue * s.currentAllocation) / 100
      }));
      onSave(allocations);
      setIsDirty(false);
    }
  };

  const isValid = totalAllocation >= 99 && totalAllocation <= 101;

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold dark:text-white text-gray-900">
            Strategy Allocation
          </h3>
          <p className="text-sm dark:text-gray-400 text-gray-600 mt-1">
            Adjust capital allocation across your strategies
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setDisplayMode(displayMode === "percentage" ? "amount" : "percentage")}
            className="p-2 rounded-lg dark:bg-slate-700 bg-gray-100 dark:hover:bg-slate-600 hover:bg-gray-200 transition-colors"
            title="Toggle display mode"
          >
            {displayMode === "percentage" ? (
              <Percent className="w-4 h-4 dark:text-gray-400 text-gray-600" />
            ) : (
              <DollarSign className="w-4 h-4 dark:text-gray-400 text-gray-600" />
            )}
          </button>
          <label className="flex items-center gap-2 px-3 py-2 rounded-lg dark:bg-slate-700 bg-gray-100 cursor-pointer">
            <input
              type="checkbox"
              checked={autoBalance}
              onChange={(e) => setAutoBalance(e.target.checked)}
              className="rounded"
            />
            <span className="text-sm dark:text-gray-300 text-gray-700">Auto-balance</span>
          </label>
        </div>
      </div>

      {/* Portfolio Summary */}
      <div className="grid grid-cols-3 gap-4 p-4 dark:bg-slate-900 bg-gray-50 rounded-lg">
        <div>
          <p className="text-xs dark:text-gray-400 text-gray-600">Portfolio Value</p>
          <p className="text-lg font-bold dark:text-white text-gray-900">
            ${portfolioValue.toLocaleString()}
          </p>
        </div>
        <div>
          <p className="text-xs dark:text-gray-400 text-gray-600">Total Allocated</p>
          <p className={cn(
            "text-lg font-bold",
            isValid ? "dark:text-white text-gray-900" : "text-down"
          )}>
            {totalAllocation.toFixed(1)}%
          </p>
        </div>
        <div>
          <p className="text-xs dark:text-gray-400 text-gray-600">Available Cash</p>
          <p className="text-lg font-bold dark:text-white text-gray-900">
            ${availableCash.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={handleEqualize}
        >
          Equalize
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={handleOptimize}
        >
          Optimize
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={handleReset}
          disabled={!isDirty}
        >
          Reset
        </Button>
      </div>

      {/* Strategy Sliders */}
      <div className="space-y-4">
        {strategies.map((strategy) => {
          const amount = (portfolioValue * strategy.currentAllocation) / 100;
          const isActive = strategy.status === "active";

          return (
            <div
              key={strategy.id}
              className={cn(
                "p-4 border rounded-lg space-y-3",
                isActive
                  ? "dark:border-slate-700 border-gray-200"
                  : "dark:border-slate-800 border-gray-100 opacity-60"
              )}
            >
              {/* Strategy Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => toggleLock(strategy.id)}
                    className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                    disabled={!isActive}
                  >
                    {strategy.locked ? (
                      <Lock className="w-4 h-4 text-amber-500" />
                    ) : (
                      <Unlock className="w-4 h-4 dark:text-gray-400 text-gray-600" />
                    )}
                  </button>
                  <div>
                    <p className="font-medium dark:text-white text-gray-900">
                      {strategy.name}
                    </p>
                    <div className="flex items-center gap-4 text-xs dark:text-gray-400 text-gray-600">
                      <span>Win: {strategy.winRate.toFixed(1)}%</span>
                      <span>Sharpe: {strategy.sharpeRatio.toFixed(1)}</span>
                      <span className={cn(
                        strategy.netPnl >= 0 ? "text-up" : "text-down"
                      )}>
                        P&L: ${strategy.netPnl.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold dark:text-white text-gray-900">
                    {displayMode === "percentage"
                      ? `${strategy.currentAllocation.toFixed(1)}%`
                      : `$${amount.toLocaleString()}`
                    }
                  </p>
                </div>
              </div>

              {/* Slider */}
              {isActive && (
                <div className="space-y-2">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="0.5"
                    value={strategy.currentAllocation}
                    onChange={(e) => handleAllocationChange(strategy.id, parseFloat(e.target.value))}
                    disabled={strategy.locked}
                    className={cn(
                      "w-full h-2 rounded-lg appearance-none cursor-pointer",
                      strategy.locked && "opacity-50 cursor-not-allowed"
                    )}
                    style={{
                      background: `linear-gradient(to right, rgb(99, 102, 241) 0%, rgb(99, 102, 241) ${strategy.currentAllocation}%, rgb(148, 163, 184) ${strategy.currentAllocation}%, rgb(148, 163, 184) 100%)`
                    }}
                  />
                  <div className="flex justify-between text-xs dark:text-gray-500 text-gray-500">
                    <span>0%</span>
                    <span>25%</span>
                    <span>50%</span>
                    <span>75%</span>
                    <span>100%</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Validation Message */}
      {!isValid && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30">
          <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-amber-800 dark:text-amber-400">
            <p className="font-medium">Allocation must total 100%</p>
            <p>Current total: {totalAllocation.toFixed(1)}%</p>
          </div>
        </div>
      )}

      {/* Info */}
      <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30">
        <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-800 dark:text-blue-400">
          <p className="font-medium">Tips:</p>
          <ul className="list-disc list-inside mt-1 space-y-0.5">
            <li>Lock strategies to prevent their allocation from changing</li>
            <li>Use "Optimize" to allocate based on performance metrics</li>
            <li>Enable auto-balance to maintain 100% total allocation</li>
            <li>Click the % / $ icon to switch between views</li>
          </ul>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <Button
          variant="secondary"
          onClick={handleReset}
          disabled={!isDirty}
        >
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={handleSave}
          disabled={!isValid || !isDirty}
        >
          Save Allocation
        </Button>
      </div>
    </div>
  );
}