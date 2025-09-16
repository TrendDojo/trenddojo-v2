"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageContent } from "@/components/layout/PageContent";
import { Button } from "@/components/ui/Button";
import { ChevronLeft, TrendingUp, DollarSign, Activity, Target, Pause, Play, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

// Mock data for a single strategy
const mockStrategy = {
  id: "1",
  name: "Momentum Strategy",
  description: "Captures strong upward price movements in trending stocks",
  status: "active",
  type: "momentum",
  allocatedCapital: 50000,
  currentValue: 52500,
  maxPositions: 5,
  maxRiskPercent: 2.0,
  maxDrawdown: 10.0,

  // Performance metrics
  totalPositions: 47,
  openPositions: 3,
  closedPositions: 44,
  winningPositions: 28,
  losingPositions: 16,
  winRate: 63.64,

  totalPnl: 12500,
  totalFees: 450,
  netPnl: 12050,

  avgWin: 850,
  avgLoss: -425,
  profitFactor: 2.1,
  sharpeRatio: 1.8,

  // Current positions
  positions: [
    { symbol: "AAPL", quantity: 100, entryPrice: 175.50, currentPrice: 182.45, pnl: 695, pnlPercent: 3.96 },
    { symbol: "MSFT", quantity: 50, entryPrice: 420.00, currentPrice: 415.30, pnl: -235, pnlPercent: -1.12 },
    { symbol: "NVDA", quantity: 30, entryPrice: 880.00, currentPrice: 925.50, pnl: 1365, pnlPercent: 5.17 },
  ],

  // Recent trades
  recentTrades: [
    { date: new Date("2024-01-20"), symbol: "TSLA", side: "sell", pnl: 450, pnlPercent: 2.8 },
    { date: new Date("2024-01-19"), symbol: "AMD", side: "sell", pnl: -180, pnlPercent: -1.5 },
    { date: new Date("2024-01-18"), symbol: "META", side: "sell", pnl: 320, pnlPercent: 1.9 },
    { date: new Date("2024-01-17"), symbol: "GOOGL", side: "sell", pnl: 580, pnlPercent: 3.2 },
  ]
};

export default function StrategyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"overview" | "positions" | "history" | "settings">("overview");

  const strategy = mockStrategy; // In real app, fetch based on params.id

  return (
    <AppLayout>
      <PageContent>
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800/50 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 dark:text-gray-400 text-gray-600" />
          </button>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold dark:text-white text-gray-900">
                {strategy.name}
              </h1>
              <span className={cn(
                "px-2 py-1 rounded text-xs font-medium",
                strategy.status === "active"
                  ? "bg-up/20 text-up"
                  : strategy.status === "paused"
                  ? "bg-amber-500/20 text-amber-600 dark:text-amber-400"
                  : "dark:bg-slate-700 bg-gray-200 dark:text-gray-300 text-gray-700"
              )}>
                {strategy.status.toUpperCase()}
              </span>
            </div>
            <p className="text-sm dark:text-gray-400 text-gray-600 mt-1">
              {strategy.description}
            </p>
          </div>
          <div className="flex gap-2">
            {strategy.status === "active" ? (
              <Button variant="secondary" size="sm">
                <Pause className="w-4 h-4 mr-2" />
                Pause Strategy
              </Button>
            ) : (
              <Button variant="primary" size="sm">
                <Play className="w-4 h-4 mr-2" />
                Activate Strategy
              </Button>
            )}
            <Button variant="secondary" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="flex gap-16 mb-8">
          <div>
            <p className="text-sm dark:text-gray-400 text-gray-600 mb-1">Net P&L</p>
            <p className={cn(
              "text-2xl font-bold",
              strategy.netPnl >= 0 ? "text-up" : "text-down"
            )}>
              ${strategy.netPnl.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-sm dark:text-gray-400 text-gray-600 mb-1">Win Rate</p>
            <p className="text-2xl font-bold dark:text-white text-gray-900">
              {strategy.winRate.toFixed(1)}%
            </p>
          </div>
          <div>
            <p className="text-sm dark:text-gray-400 text-gray-600 mb-1">Profit Factor</p>
            <p className="text-2xl font-bold dark:text-white text-gray-900">
              {strategy.profitFactor.toFixed(1)}
            </p>
          </div>
          <div>
            <p className="text-sm dark:text-gray-400 text-gray-600 mb-1">Sharpe Ratio</p>
            <p className="text-2xl font-bold dark:text-white text-gray-900">
              {strategy.sharpeRatio.toFixed(1)}
            </p>
          </div>
          <div>
            <p className="text-sm dark:text-gray-400 text-gray-600 mb-1">Open Positions</p>
            <p className="text-2xl font-bold dark:text-white text-gray-900">
              {strategy.openPositions} / {strategy.maxPositions}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b dark:border-slate-700 border-gray-200">
          <button
            onClick={() => setActiveTab("overview")}
            className={cn(
              "pb-3 px-1 font-medium transition-colors",
              activeTab === "overview"
                ? "text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400"
                : "dark:text-gray-400 text-gray-600 hover:text-gray-900 dark:hover:text-white"
            )}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("positions")}
            className={cn(
              "pb-3 px-1 font-medium transition-colors",
              activeTab === "positions"
                ? "text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400"
                : "dark:text-gray-400 text-gray-600 hover:text-gray-900 dark:hover:text-white"
            )}
          >
            Current Positions
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={cn(
              "pb-3 px-1 font-medium transition-colors",
              activeTab === "history"
                ? "text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400"
                : "dark:text-gray-400 text-gray-600 hover:text-gray-900 dark:hover:text-white"
            )}
          >
            Trade History
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={cn(
              "pb-3 px-1 font-medium transition-colors",
              activeTab === "settings"
                ? "text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400"
                : "dark:text-gray-400 text-gray-600 hover:text-gray-900 dark:hover:text-white"
            )}
          >
            Settings
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Performance Stats */}
            <div>
              <h3 className="text-lg font-semibold dark:text-white text-gray-900 mb-4">
                Performance Statistics
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="dark:text-gray-400 text-gray-600">Total Trades</span>
                  <span className="font-medium dark:text-white text-gray-900">
                    {strategy.totalPositions}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="dark:text-gray-400 text-gray-600">Winning Trades</span>
                  <span className="font-medium text-up">
                    {strategy.winningPositions}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="dark:text-gray-400 text-gray-600">Losing Trades</span>
                  <span className="font-medium text-down">
                    {strategy.losingPositions}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="dark:text-gray-400 text-gray-600">Average Win</span>
                  <span className="font-medium text-up">
                    ${strategy.avgWin.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="dark:text-gray-400 text-gray-600">Average Loss</span>
                  <span className="font-medium text-down">
                    ${Math.abs(strategy.avgLoss).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Risk Management */}
            <div>
              <h3 className="text-lg font-semibold dark:text-white text-gray-900 mb-4">
                Risk Management
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="dark:text-gray-400 text-gray-600">Allocated Capital</span>
                  <span className="font-medium dark:text-white text-gray-900">
                    ${strategy.allocatedCapital.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="dark:text-gray-400 text-gray-600">Current Value</span>
                  <span className="font-medium dark:text-white text-gray-900">
                    ${strategy.currentValue.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="dark:text-gray-400 text-gray-600">Max Risk per Trade</span>
                  <span className="font-medium dark:text-white text-gray-900">
                    {strategy.maxRiskPercent}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="dark:text-gray-400 text-gray-600">Max Drawdown Limit</span>
                  <span className="font-medium dark:text-white text-gray-900">
                    {strategy.maxDrawdown}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "positions" && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b dark:border-slate-700 border-gray-200">
                  <th className="text-left py-3 px-4 font-medium dark:text-gray-300 text-gray-700">
                    Symbol
                  </th>
                  <th className="text-right py-3 px-4 font-medium dark:text-gray-300 text-gray-700">
                    Quantity
                  </th>
                  <th className="text-right py-3 px-4 font-medium dark:text-gray-300 text-gray-700">
                    Entry Price
                  </th>
                  <th className="text-right py-3 px-4 font-medium dark:text-gray-300 text-gray-700">
                    Current Price
                  </th>
                  <th className="text-right py-3 px-4 font-medium dark:text-gray-300 text-gray-700">
                    P&L
                  </th>
                  <th className="text-right py-3 px-4 font-medium dark:text-gray-300 text-gray-700">
                    P&L %
                  </th>
                </tr>
              </thead>
              <tbody>
                {strategy.positions.map((position, idx) => (
                  <tr key={idx} className="border-b dark:border-slate-800 border-gray-100 hover:bg-gray-50 dark:hover:bg-slate-800/30 cursor-pointer">
                    <td className="py-3 px-4 font-medium dark:text-white text-gray-900">
                      {position.symbol}
                    </td>
                    <td className="py-3 px-4 text-right dark:text-gray-300 text-gray-700">
                      {position.quantity}
                    </td>
                    <td className="py-3 px-4 text-right dark:text-gray-300 text-gray-700">
                      ${position.entryPrice.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-right dark:text-gray-300 text-gray-700">
                      ${position.currentPrice.toFixed(2)}
                    </td>
                    <td className={cn(
                      "py-3 px-4 text-right font-medium",
                      position.pnl >= 0 ? "text-up" : "text-down"
                    )}>
                      ${position.pnl >= 0 ? "+" : ""}{position.pnl.toFixed(2)}
                    </td>
                    <td className={cn(
                      "py-3 px-4 text-right font-medium",
                      position.pnlPercent >= 0 ? "text-up" : "text-down"
                    )}>
                      {position.pnlPercent >= 0 ? "+" : ""}{position.pnlPercent.toFixed(2)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "history" && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b dark:border-slate-700 border-gray-200">
                  <th className="text-left py-3 px-4 font-medium dark:text-gray-300 text-gray-700">
                    Date
                  </th>
                  <th className="text-left py-3 px-4 font-medium dark:text-gray-300 text-gray-700">
                    Symbol
                  </th>
                  <th className="text-left py-3 px-4 font-medium dark:text-gray-300 text-gray-700">
                    Side
                  </th>
                  <th className="text-right py-3 px-4 font-medium dark:text-gray-300 text-gray-700">
                    P&L
                  </th>
                  <th className="text-right py-3 px-4 font-medium dark:text-gray-300 text-gray-700">
                    P&L %
                  </th>
                </tr>
              </thead>
              <tbody>
                {strategy.recentTrades.map((trade, idx) => (
                  <tr key={idx} className="border-b dark:border-slate-800 border-gray-100">
                    <td className="py-3 px-4 dark:text-gray-300 text-gray-700">
                      {trade.date.toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 font-medium dark:text-white text-gray-900">
                      {trade.symbol}
                    </td>
                    <td className="py-3 px-4">
                      <span className={cn(
                        "px-2 py-1 rounded text-xs font-medium",
                        "bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300"
                      )}>
                        {trade.side.toUpperCase()}
                      </span>
                    </td>
                    <td className={cn(
                      "py-3 px-4 text-right font-medium",
                      trade.pnl >= 0 ? "text-up" : "text-down"
                    )}>
                      ${trade.pnl >= 0 ? "+" : ""}{trade.pnl.toFixed(2)}
                    </td>
                    <td className={cn(
                      "py-3 px-4 text-right font-medium",
                      trade.pnlPercent >= 0 ? "text-up" : "text-down"
                    )}>
                      {trade.pnlPercent >= 0 ? "+" : ""}{trade.pnlPercent.toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "settings" && (
          <div className="max-w-2xl">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium dark:text-gray-300 text-gray-700 mb-2">
                  Strategy Name
                </label>
                <input
                  type="text"
                  defaultValue={strategy.name}
                  className="w-full px-3 py-2 border dark:border-slate-700 border-gray-300 rounded-lg dark:bg-slate-800 bg-white dark:text-white text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium dark:text-gray-300 text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  defaultValue={strategy.description}
                  rows={3}
                  className="w-full px-3 py-2 border dark:border-slate-700 border-gray-300 rounded-lg dark:bg-slate-800 bg-white dark:text-white text-gray-900"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium dark:text-gray-300 text-gray-700 mb-2">
                    Allocated Capital
                  </label>
                  <input
                    type="number"
                    defaultValue={strategy.allocatedCapital}
                    className="w-full px-3 py-2 border dark:border-slate-700 border-gray-300 rounded-lg dark:bg-slate-800 bg-white dark:text-white text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium dark:text-gray-300 text-gray-700 mb-2">
                    Max Positions
                  </label>
                  <input
                    type="number"
                    defaultValue={strategy.maxPositions}
                    className="w-full px-3 py-2 border dark:border-slate-700 border-gray-300 rounded-lg dark:bg-slate-800 bg-white dark:text-white text-gray-900"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium dark:text-gray-300 text-gray-700 mb-2">
                    Max Risk per Trade (%)
                  </label>
                  <input
                    type="number"
                    defaultValue={strategy.maxRiskPercent}
                    step="0.1"
                    className="w-full px-3 py-2 border dark:border-slate-700 border-gray-300 rounded-lg dark:bg-slate-800 bg-white dark:text-white text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium dark:text-gray-300 text-gray-700 mb-2">
                    Max Drawdown (%)
                  </label>
                  <input
                    type="number"
                    defaultValue={strategy.maxDrawdown}
                    step="0.1"
                    className="w-full px-3 py-2 border dark:border-slate-700 border-gray-300 rounded-lg dark:bg-slate-800 bg-white dark:text-white text-gray-900"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="primary">
                  Save Changes
                </Button>
                <Button variant="secondary">
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}
      </PageContent>
    </AppLayout>
  );
}