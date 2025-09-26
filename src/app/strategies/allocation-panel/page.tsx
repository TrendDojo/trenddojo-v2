"use client";

import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageContent } from "@/components/layout/PageContent";
import { AllocationPanel } from "@/components/panels/AllocationPanel";
import sampleData from "../../../../temp/sampleData.json";

export default function AllocationPanelPage() {
  // Transform sample data to match the panel's expected format
  const strategies = sampleData.strategies.map((strategy, index) => ({
    id: strategy.id,
    name: strategy.name,
    status: strategy.status,
    winRate: strategy.winRate,
    netPnl: strategy.netPnl,
    sharpeRatio: strategy.sharpeRatio,
    // Start with example allocations
    currentAllocation: index === 0 ? 50 : index === 1 ? 35 : 15,
    minAllocation: 0,
    maxAllocation: 100,
    locked: false
  }));

  const portfolioValue = 112500;
  const availableCash = 35000;

  const handleSaveAllocations = (allocations: any[]) => {
    // DEBUG: console.log("Saving allocations:", allocations);
    // In a real app, this would update the database

    // Show a simple confirmation
    const message = allocations
      .map(a => `${a.strategyId}: ${a.percentage.toFixed(1)}% ($${a.amount.toLocaleString()})`)
      .join('\\n');

    alert(`Allocations saved:\\n\\n${message}`);
  };

  return (
    <AppLayout>
      <PageContent>
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold dark:text-white text-gray-900 mb-2">
              Portfolio Allocation Management
            </h1>
            <p className="text-sm dark:text-gray-400 text-gray-600">
              Adjust capital allocation across all your active strategies
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Panel */}
            <div className="lg:col-span-2">
              <div className="border dark:border-slate-700 border-gray-200 rounded-xl p-6">
                <AllocationPanel
                  strategies={strategies}
                  portfolioValue={portfolioValue}
                  availableCash={availableCash}
                  onSave={handleSaveAllocations}
                />
              </div>
            </div>

            {/* Side Information */}
            <div className="space-y-6">
              {/* Current Allocation Summary */}
              <div className="border dark:border-slate-700 border-gray-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold dark:text-white text-gray-900 mb-4">
                  Current Allocations
                </h3>
                <div className="space-y-3">
                  {strategies.map((strategy) => {
                    const amount = (portfolioValue * strategy.currentAllocation) / 100;
                    return (
                      <div key={strategy.id} className="flex justify-between items-center">
                        <div>
                          <p className="text-sm font-medium dark:text-white text-gray-900">
                            {strategy.name}
                          </p>
                          <p className="text-xs dark:text-gray-400 text-gray-600">
                            {strategy.status === "active" ? "Active" : "Paused"}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium dark:text-white text-gray-900">
                            {strategy.currentAllocation.toFixed(1)}%
                          </p>
                          <p className="text-xs dark:text-gray-400 text-gray-600">
                            ${amount.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Features */}
              <div className="border dark:border-slate-700 border-gray-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold dark:text-white text-gray-900 mb-4">
                  Features
                </h3>
                <ul className="space-y-2 text-sm dark:text-gray-300 text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-success mt-0.5">✓</span>
                    <span>Interactive sliders for each strategy</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-success mt-0.5">✓</span>
                    <span>Auto-balance to maintain 100% allocation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-success mt-0.5">✓</span>
                    <span>Lock strategies to prevent changes</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-success mt-0.5">✓</span>
                    <span>Quick actions: Equalize, Optimize, Reset</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-success mt-0.5">✓</span>
                    <span>Toggle between % and $ display</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-success mt-0.5">✓</span>
                    <span>Performance-based optimization</span>
                  </li>
                </ul>
              </div>

              {/* Usage Tips */}
              <div className="border dark:border-slate-700 border-gray-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold dark:text-white text-gray-900 mb-4">
                  Usage Tips
                </h3>
                <ul className="space-y-2 text-sm dark:text-gray-300 text-gray-700">
                  <li>• Drag sliders to adjust allocations</li>
                  <li>• Click the lock icon to prevent changes</li>
                  <li>• Use "Optimize" for automatic allocation based on performance</li>
                  <li>• Enable auto-balance to keep total at 100%</li>
                  <li>• Click % / $ to switch display modes</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </PageContent>
    </AppLayout>
  );
}