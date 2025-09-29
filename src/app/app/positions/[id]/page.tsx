"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageContent } from "@/components/layout/PageContent";
import { Button } from "@/components/ui/Button";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { ChevronLeft, TrendingUp, TrendingDown, DollarSign, Activity, Calendar, Target, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { tableStyles, getTableRow } from "@/lib/tableStyles";

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

  const position = mockPosition; // In real app, fetch based on params.id

  return (
    
      <PageContent>
        {/* Breadcrumb */}
        <div className="mb-8">
          <Breadcrumb
            items={[
              { label: "Positions", href: "/positions" },
              { label: position.symbol }
            ]}
          />
        </div>

        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
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
                  ? "bg-success/20 text-success"
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
              position.unrealizedPnl >= 0 ? "text-success" : "text-danger"
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

        {/* Overview Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Risk Management */}
          <div>
            <h3 className="text-lg font-semibold dark:text-white text-gray-900 mb-4">
              Risk Management
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="dark:text-gray-400 text-gray-600">Stop Loss</span>
                <span className="font-medium text-danger">
                  ${position.stopLoss.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="dark:text-gray-400 text-gray-600">Take Profit</span>
                <span className="font-medium text-success">
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
                <span className="font-medium text-success">
                  +{position.maxGainPercent.toFixed(2)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="dark:text-gray-400 text-gray-600">Max Loss</span>
                <span className="font-medium text-danger">
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

        {/* Combined Activity Table - Executions and Notes */}
        <div>
          <h3 className="text-lg font-semibold dark:text-white text-gray-900 mb-4">
            Activity History
          </h3>
          <div className={tableStyles.wrapper}>
            <div className="overflow-x-auto">
              <table className={tableStyles.table}>
              <thead className={tableStyles.thead}>
                <tr className={tableStyles.headerRow}>
                  <th className={tableStyles.th}>
                    Date
                  </th>
                  <th className={tableStyles.th}>
                    Type
                  </th>
                  <th className={tableStyles.th}>
                    Details
                  </th>
                  <th className={tableStyles.thRight}>
                    Quantity
                  </th>
                  <th className={tableStyles.thRight}>
                    Price
                  </th>
                  <th className={tableStyles.thRight}>
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className={tableStyles.tbody}>
                {/* Combine executions and notes and sort by date */}
                {[
                  ...position.executions.map(exec => ({
                    date: exec.date,
                    type: 'execution',
                    subType: exec.type,
                    quantity: exec.quantity,
                    price: exec.price,
                    fees: exec.fees,
                    total: exec.quantity * exec.price + exec.fees
                  })),
                  ...position.notes.map(note => ({
                    date: note.date,
                    type: 'note',
                    content: note.content
                  }))
                ]
                  .sort((a, b) => b.date.getTime() - a.date.getTime())
                  .map((item, idx) => (
                    <tr key={idx} className={getTableRow(idx)}>
                      <td className={tableStyles.td}>
                        {item.date.toLocaleDateString()}
                      </td>
                      <td className={tableStyles.td}>
                        {item.type === 'execution' ? (
                          <span className={cn(
                            "px-2 py-1 rounded text-xs font-medium",
                            'subType' in item && item.subType === "buy"
                              ? "bg-success/20 text-success"
                              : "bg-danger/20 text-danger"
                          )}>
                            {'subType' in item ? item.subType?.toUpperCase() : ''}
                          </span>
                        ) : (
                          <span className="px-2 py-1 rounded text-xs font-medium bg-blue-500/20 text-blue-600 dark:text-blue-400">
                            NOTE
                          </span>
                        )}
                      </td>
                      <td className={tableStyles.td}>
                        {item.type === 'note' ? ('content' in item ? item.content : '') : ('fees' in item && item.fees ? `Fees: $${item.fees.toFixed(2)}` : '—')}
                      </td>
                      <td className={tableStyles.tdRight}>
                        {item.type === 'execution' ? ('quantity' in item ? item.quantity : '') : '—'}
                      </td>
                      <td className={tableStyles.tdRight}>
                        {item.type === 'execution' ? ('price' in item && item.price ? `$${item.price.toFixed(2)}` : '') : '—'}
                      </td>
                      <td className="py-3 px-4 text-right font-medium dark:text-white text-gray-900">
                        {item.type === 'execution' ? ('total' in item && item.total ? `$${item.total.toFixed(2)}` : '') : '—'}
                      </td>
                    </tr>
                  ))}
              </tbody>
              </table>
            </div>
          </div>
          <div className="mt-4">
            <Button variant="secondary" size="sm">
              Add Note
            </Button>
          </div>
        </div>
      </PageContent>
    
  );
}