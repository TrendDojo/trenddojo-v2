"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageContent } from "@/components/layout/PageContent";
import { Button } from "@/components/ui/Button";
import { ChevronLeft, TrendingUp, TrendingDown, DollarSign, Activity, Calendar, Target, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

// Mock data for a single position
const mockPosition = {
  id: "1",
  symbol: "AAPL",
  name: "Apple Inc.",
  strategy: "Momentum Strategy",
  direction: "long",
  status: "open",
  currentQuantity: 100,
  avgEntryPrice: 175.50,
  currentPrice: 182.45,
  stopLoss: 170.00,
  takeProfit: 190.00,
  unrealizedPnl: 695.00,
  unrealizedPnlPercent: 3.96,
  realizedPnl: 0,
  totalFees: 12.50,
  openedAt: new Date("2024-01-15"),
  lastExecutionAt: new Date("2024-01-16"),
  holdingDays: 8,
  maxGainPercent: 5.2,
  maxLossPercent: -2.1,
  rMultiple: 1.8,
  executions: [
    { date: new Date("2024-01-15"), type: "buy", quantity: 50, price: 174.00, fees: 6.25 },
    { date: new Date("2024-01-16"), type: "buy", quantity: 50, price: 177.00, fees: 6.25 },
  ],
  notes: [
    { date: new Date("2024-01-15"), content: "Initial entry on breakout above resistance" },
    { date: new Date("2024-01-17"), content: "Strong momentum, considering adding to position" },
  ]
};

export default function PositionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"overview" | "executions" | "notes">("overview");

  const position = mockPosition; // In real app, fetch based on params.id

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
                {position.symbol}
              </h1>
              <span className="text-lg dark:text-gray-400 text-gray-600">
                {position.name}
              </span>
              <span className={cn(
                "px-2 py-1 rounded text-xs font-medium",
                position.status === "open"
                  ? "bg-up/20 text-up"
                  : "dark:bg-slate-700 bg-gray-200 dark:text-gray-300 text-gray-700"
              )}>
                {position.status.toUpperCase()}
              </span>
            </div>
            <div className="flex items-center gap-4 mt-1">
              <span className="text-sm dark:text-gray-400 text-gray-600">
                Strategy: {position.strategy}
              </span>
              <span className="text-sm dark:text-gray-400 text-gray-600">
                Direction: {position.direction.toUpperCase()}
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm">
              Edit Position
            </Button>
            <Button variant="danger" size="sm">
              Close Position
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="flex gap-16 mb-8">
          <div>
            <p className="text-sm dark:text-gray-400 text-gray-600 mb-1">Current Price</p>
            <p className="text-2xl font-bold dark:text-white text-gray-900">
              ${position.currentPrice.toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-sm dark:text-gray-400 text-gray-600 mb-1">Unrealized P&L</p>
            <p className={cn(
              "text-2xl font-bold",
              position.unrealizedPnl >= 0 ? "text-up" : "text-down"
            )}>
              ${position.unrealizedPnl.toFixed(2)}
              <span className="text-sm ml-2">
                ({position.unrealizedPnlPercent >= 0 ? "+" : ""}{position.unrealizedPnlPercent.toFixed(2)}%)
              </span>
            </p>
          </div>
          <div>
            <p className="text-sm dark:text-gray-400 text-gray-600 mb-1">Position Size</p>
            <p className="text-2xl font-bold dark:text-white text-gray-900">
              {position.currentQuantity} shares
            </p>
          </div>
          <div>
            <p className="text-sm dark:text-gray-400 text-gray-600 mb-1">Avg Entry</p>
            <p className="text-2xl font-bold dark:text-white text-gray-900">
              ${position.avgEntryPrice.toFixed(2)}
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
            onClick={() => setActiveTab("executions")}
            className={cn(
              "pb-3 px-1 font-medium transition-colors",
              activeTab === "executions"
                ? "text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400"
                : "dark:text-gray-400 text-gray-600 hover:text-gray-900 dark:hover:text-white"
            )}
          >
            Executions
          </button>
          <button
            onClick={() => setActiveTab("notes")}
            className={cn(
              "pb-3 px-1 font-medium transition-colors",
              activeTab === "notes"
                ? "text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400"
                : "dark:text-gray-400 text-gray-600 hover:text-gray-900 dark:hover:text-white"
            )}
          >
            Notes
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Risk Management */}
            <div>
              <h3 className="text-lg font-semibold dark:text-white text-gray-900 mb-4">
                Risk Management
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="dark:text-gray-400 text-gray-600">Stop Loss</span>
                  <span className="font-medium text-down">
                    ${position.stopLoss.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="dark:text-gray-400 text-gray-600">Take Profit</span>
                  <span className="font-medium text-up">
                    ${position.takeProfit.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="dark:text-gray-400 text-gray-600">Risk Multiple</span>
                  <span className="font-medium dark:text-white text-gray-900">
                    {position.rMultiple.toFixed(1)}R
                  </span>
                </div>
              </div>
            </div>

            {/* Performance */}
            <div>
              <h3 className="text-lg font-semibold dark:text-white text-gray-900 mb-4">
                Performance
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="dark:text-gray-400 text-gray-600">Max Gain</span>
                  <span className="font-medium text-up">
                    +{position.maxGainPercent.toFixed(2)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="dark:text-gray-400 text-gray-600">Max Loss</span>
                  <span className="font-medium text-down">
                    {position.maxLossPercent.toFixed(2)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="dark:text-gray-400 text-gray-600">Holding Days</span>
                  <span className="font-medium dark:text-white text-gray-900">
                    {position.holdingDays} days
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "executions" && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b dark:border-slate-700 border-gray-200">
                  <th className="text-left py-3 px-4 font-medium dark:text-gray-300 text-gray-700">
                    Date
                  </th>
                  <th className="text-left py-3 px-4 font-medium dark:text-gray-300 text-gray-700">
                    Type
                  </th>
                  <th className="text-right py-3 px-4 font-medium dark:text-gray-300 text-gray-700">
                    Quantity
                  </th>
                  <th className="text-right py-3 px-4 font-medium dark:text-gray-300 text-gray-700">
                    Price
                  </th>
                  <th className="text-right py-3 px-4 font-medium dark:text-gray-300 text-gray-700">
                    Fees
                  </th>
                  <th className="text-right py-3 px-4 font-medium dark:text-gray-300 text-gray-700">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {position.executions.map((execution, idx) => (
                  <tr key={idx} className="border-b dark:border-slate-800 border-gray-100">
                    <td className="py-3 px-4 dark:text-gray-300 text-gray-700">
                      {execution.date.toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <span className={cn(
                        "px-2 py-1 rounded text-xs font-medium",
                        execution.type === "buy"
                          ? "bg-up/20 text-up"
                          : "bg-down/20 text-down"
                      )}>
                        {execution.type.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right dark:text-gray-300 text-gray-700">
                      {execution.quantity}
                    </td>
                    <td className="py-3 px-4 text-right dark:text-gray-300 text-gray-700">
                      ${execution.price.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-right dark:text-gray-300 text-gray-700">
                      ${execution.fees.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-right font-medium dark:text-white text-gray-900">
                      ${(execution.quantity * execution.price + execution.fees).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "notes" && (
          <div className="space-y-4">
            {position.notes.map((note, idx) => (
              <div key={idx} className="border-b dark:border-slate-800 border-gray-100 pb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 dark:text-gray-400 text-gray-600" />
                  <span className="text-sm dark:text-gray-400 text-gray-600">
                    {note.date.toLocaleDateString()}
                  </span>
                </div>
                <p className="dark:text-gray-300 text-gray-700">
                  {note.content}
                </p>
              </div>
            ))}
            <Button variant="secondary" size="sm">
              Add Note
            </Button>
          </div>
        )}
      </PageContent>
    </AppLayout>
  );
}