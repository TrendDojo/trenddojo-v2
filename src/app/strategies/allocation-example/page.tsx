"use client";

import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageContent } from "@/components/layout/PageContent";
import { Button } from "@/components/ui/Button";
import { AllocationModal } from "@/components/modals/AllocationModal";
import { DollarSign, TrendingUp } from "lucide-react";

// Mock sample data for demonstration
const sampleData = {
  strategies: [
    {
      id: "strat_1",
      name: "Trend Momentum Pro",
      status: "active",
      description: "Captures medium-term price momentum across major indices",
      winRate: 68.5,
      sharpeRatio: 1.82,
      maxDrawdown: -12.3,
      netPnl: 45000
    },
    {
      id: "strat_2",
      name: "Mean Reversion Alpha",
      status: "active",
      description: "Exploits short-term price dislocations in liquid stocks",
      winRate: 72.3,
      sharpeRatio: 2.15,
      maxDrawdown: -8.7,
      netPnl: 32000
    },
    {
      id: "strat_3",
      name: "Volatility Harvester",
      status: "paused",
      description: "Options-based strategy that profits from volatility spikes",
      winRate: 61.2,
      sharpeRatio: 1.45,
      maxDrawdown: -15.8,
      netPnl: 18500
    }
  ]
};

export default function AllocationExamplePage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStrategy, setSelectedStrategy] = useState(sampleData.strategies[0]);

  // Mock portfolio data
  const portfolio = {
    totalValue: 112500,
    availableCash: 35000,
    currentAllocations: [
      { strategyId: "strat_1", amount: 50000, percentage: 44.4 },
      { strategyId: "strat_2", amount: 30000, percentage: 26.7 },
    ]
  };

  const handleAllocation = (allocation: { strategyId: string; amount: number; percentage: number }) => {
    // DEBUG: console.log("Allocation confirmed:", allocation);
    // In a real app, this would update the database and refresh the UI
    alert(`Allocated ${allocation.percentage.toFixed(1)}% ($${allocation.amount.toLocaleString()}) to ${selectedStrategy.name}`);
  };

  return (
    <AppLayout>
      <PageContent>
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold dark:text-white text-gray-900 mb-8">
            Strategy Allocation Example
          </h1>

          {/* Portfolio Overview */}
          <div className="mb-8 p-6 border dark:border-slate-700 border-gray-200 rounded-xl">
            <h2 className="text-lg font-semibold dark:text-white text-gray-900 mb-4">
              Portfolio Overview
            </h2>
            <div className="grid grid-cols-3 gap-6">
              <div>
                <p className="text-sm dark:text-gray-400 text-gray-600 mb-1">Total Value</p>
                <p className="text-2xl font-bold dark:text-white text-gray-900">
                  ${portfolio.totalValue.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm dark:text-gray-400 text-gray-600 mb-1">Available Cash</p>
                <p className="text-2xl font-bold dark:text-white text-gray-900">
                  ${portfolio.availableCash.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm dark:text-gray-400 text-gray-600 mb-1">Allocated</p>
                <p className="text-2xl font-bold dark:text-white text-gray-900">
                  {portfolio.currentAllocations.reduce((sum, a) => sum + a.percentage, 0).toFixed(1)}%
                </p>
              </div>
            </div>
          </div>

          {/* Strategies List */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold dark:text-white text-gray-900">
              Available Strategies
            </h2>
            {sampleData.strategies.map((strategy) => {
              const currentAllocation = portfolio.currentAllocations.find(
                a => a.strategyId === strategy.id
              );

              return (
                <div
                  key={strategy.id}
                  className="p-6 border dark:border-slate-700 border-gray-200 rounded-xl"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold dark:text-white text-gray-900">
                          {strategy.name}
                        </h3>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          strategy.status === "active"
                            ? "bg-success/20 text-success"
                            : "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400"
                        }`}>
                          {strategy.status.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm dark:text-gray-400 text-gray-600 mb-3">
                        {strategy.description}
                      </p>
                      <div className="flex items-center gap-6 text-sm">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-success" />
                          <span className="dark:text-gray-300 text-gray-700">
                            Win Rate: <span className="font-medium">{strategy.winRate.toFixed(1)}%</span>
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-indigo-500" />
                          <span className="dark:text-gray-300 text-gray-700">
                            Current: <span className="font-medium">
                              {currentAllocation
                                ? `$${currentAllocation.amount.toLocaleString()} (${currentAllocation.percentage.toFixed(1)}%)`
                                : "Not allocated"
                              }
                            </span>
                          </span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => {
                          setSelectedStrategy(strategy);
                          setIsModalOpen(true);
                        }}
                      >
                        {currentAllocation ? "Adjust" : "Allocate"}
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Usage Instructions */}
          <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
            <h3 className="font-semibold dark:text-blue-400 text-blue-800 mb-2">
              How to Use the Allocation Modal
            </h3>
            <ul className="text-sm dark:text-blue-400 text-blue-700 space-y-1 list-disc list-inside">
              <li>Click "Allocate" or "Adjust" on any strategy</li>
              <li>Choose between percentage or dollar amount input</li>
              <li>Use quick allocation buttons for common percentages</li>
              <li>Drag the slider for visual allocation</li>
              <li>The modal validates available cash and total allocations</li>
              <li>Warnings appear for high-risk allocations (&gt;50%)</li>
            </ul>
          </div>
        </div>

        {/* Allocation Modal */}
        <AllocationModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onConfirm={handleAllocation}
          strategy={{
            id: selectedStrategy.id,
            name: selectedStrategy.name,
            currentAllocation: portfolio.currentAllocations.find(
              a => a.strategyId === selectedStrategy.id
            )?.percentage,
            performance: {
              winRate: selectedStrategy.winRate,
              sharpeRatio: selectedStrategy.sharpeRatio,
              maxDrawdown: selectedStrategy.maxDrawdown
            }
          }}
          portfolio={portfolio}
        />
      </PageContent>
    </AppLayout>
  );
}