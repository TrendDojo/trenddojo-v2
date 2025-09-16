"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageContent } from "@/components/layout/PageContent";
import { Button } from "@/components/ui/Button";
import { Atom, TrendingUp, TrendingDown, Pause, Play, Plus, MoreVertical, Copy, Archive, History, Ban } from "lucide-react";
import { cn } from "@/lib/utils";
import sampleData from "../../../temp/sampleData.json";

export default function StrategiesPage() {
  const router = useRouter();
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const strategies = sampleData.strategies;

  const handleCloneStrategy = (strategyId: string) => {
    // In real app, this would call API to clone strategy
    console.log("Clone strategy:", strategyId);
    setOpenMenuId(null);
  };

  const handleArchiveStrategy = (strategyId: string) => {
    // In real app, this would check for open positions first
    console.log("Archive strategy:", strategyId);
    setOpenMenuId(null);
  };

  return (
    <AppLayout>
      <PageContent>
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold dark:text-white text-gray-900 mb-2">
              Trading Strategies
            </h1>
            <p className="text-sm dark:text-gray-400 text-gray-600">
              Manage and monitor your automated trading strategies
            </p>
          </div>
          <Button variant="primary">
            <Plus className="w-4 h-4 mr-2" />
            New Strategy
          </Button>
        </div>

        {/* Summary Stats */}
        <div className="flex gap-16 mb-8">
          <div>
            <p className="text-sm dark:text-gray-400 text-gray-600 mb-1">Active Strategies</p>
            <p className="text-2xl font-bold dark:text-white text-gray-900">
              {strategies.filter(s => s.status === "active").length}
            </p>
          </div>
          <div>
            <p className="text-sm dark:text-gray-400 text-gray-600 mb-1">Total Allocated</p>
            <p className="text-2xl font-bold dark:text-white text-gray-900">
              ${strategies.reduce((sum, s) => sum + s.allocatedCapital, 0).toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-sm dark:text-gray-400 text-gray-600 mb-1">Total Net P&L</p>
            <p className={cn(
              "text-2xl font-bold",
              strategies.reduce((sum, s) => sum + s.netPnl, 0) >= 0 ? "text-up" : "text-down"
            )}>
              ${strategies.reduce((sum, s) => sum + s.netPnl, 0).toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-sm dark:text-gray-400 text-gray-600 mb-1">Avg Win Rate</p>
            <p className="text-2xl font-bold dark:text-white text-gray-900">
              {(strategies.reduce((sum, s) => sum + s.winRate, 0) / strategies.length).toFixed(1)}%
            </p>
          </div>
        </div>

        {/* Strategies Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b dark:border-slate-700 border-gray-200">
                <th className="text-left py-3 px-4 font-medium dark:text-gray-300 text-gray-700">
                  Strategy
                </th>
                <th className="text-center py-3 px-4 font-medium dark:text-gray-300 text-gray-700">
                  Status
                </th>
                <th className="text-right py-3 px-4 font-medium dark:text-gray-300 text-gray-700">
                  Positions
                </th>
                <th className="text-right py-3 px-4 font-medium dark:text-gray-300 text-gray-700">
                  Win Rate
                </th>
                <th className="text-right py-3 px-4 font-medium dark:text-gray-300 text-gray-700">
                  Net P&L
                </th>
                <th className="text-right py-3 px-4 font-medium dark:text-gray-300 text-gray-700">
                  Profit Factor
                </th>
                <th className="text-right py-3 px-4 font-medium dark:text-gray-300 text-gray-700">
                  Sharpe
                </th>
                <th className="text-right py-3 px-4 font-medium dark:text-gray-300 text-gray-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-slate-700 divide-gray-200">
              {strategies.map((strategy, index) => (
                <tr
                  key={strategy.id}
                  className={cn(
                    "hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors",
                    index === 0 && "cursor-pointer"
                  )}
                  onClick={index === 0 ? () => router.push(`/strategies/${strategy.id}`) : undefined}
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <Atom className="w-5 h-5 text-indigo-500" />
                      <div>
                        {index === 0 ? (
                          <Link
                            href={`/strategies/${strategy.id}`}
                            className="font-medium dark:text-white text-gray-900 hover:text-indigo-600 dark:hover:text-indigo-400"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {strategy.name}
                          </Link>
                        ) : (
                          <p className="font-medium dark:text-white text-gray-900">{strategy.name}</p>
                        )}
                        <p className="text-xs dark:text-gray-400 text-gray-600">{strategy.description}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={cn(
                      "px-2 py-1 rounded text-xs font-medium inline-flex items-center gap-1",
                      strategy.status === "active"
                        ? "bg-up/20 text-up"
                        : strategy.status === "paused"
                        ? "bg-amber-500/20 text-amber-600 dark:text-amber-400"
                        : strategy.status === "blocked"
                        ? "bg-red-500/20 text-red-600 dark:text-red-400"
                        : strategy.status === "closed"
                        ? "dark:bg-slate-700 bg-gray-200 dark:text-gray-300 text-gray-700"
                        : "dark:bg-slate-700 bg-gray-200 dark:text-gray-300 text-gray-700"
                    )}>
                      {strategy.status === "active" && <Play className="w-3 h-3" />}
                      {strategy.status === "paused" && <Pause className="w-3 h-3" />}
                      {strategy.status === "blocked" && <Ban className="w-3 h-3" />}
                      {strategy.status === "closed" && <Archive className="w-3 h-3" />}
                      {strategy.status.toUpperCase()}
                    </span>
                    {strategy.status === "blocked" && (strategy as any).blockedReason && (
                      <p className="text-xs dark:text-gray-400 text-gray-600 mt-1" title={(strategy as any).blockedReason}>
                        {(strategy as any).blockedReason.length > 20
                          ? (strategy as any).blockedReason.substring(0, 20) + "..."
                          : (strategy as any).blockedReason}
                      </p>
                    )}
                    {(strategy as any).parentStrategyId && (
                      <p className="text-xs dark:text-gray-400 text-gray-600 mt-1 italic">
                        v{(strategy as any).version || 2}
                      </p>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div>
                      <p className="font-medium dark:text-white text-gray-900">
                        {strategy.openPositions} / {strategy.maxPositions}
                      </p>
                      <p className="text-xs dark:text-gray-400 text-gray-600">
                        {strategy.totalPositions} total
                      </p>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div>
                      <p className="font-medium dark:text-white text-gray-900">
                        {strategy.winRate.toFixed(1)}%
                      </p>
                      <p className="text-xs dark:text-gray-400 text-gray-600">
                        {strategy.winningPositions}W / {strategy.losingPositions}L
                      </p>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className={cn(
                      "font-medium",
                      strategy.netPnl >= 0 ? "text-up" : "text-down"
                    )}>
                      <p>
                        ${strategy.netPnl >= 0 ? "+" : ""}{strategy.netPnl.toLocaleString()}
                      </p>
                      <p className="text-xs">
                        {((strategy.netPnl / strategy.allocatedCapital) * 100).toFixed(1)}%
                      </p>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <p className={cn(
                      "font-medium",
                      strategy.profitFactor >= 1 ? "text-up" : "text-down"
                    )}>
                      {strategy.profitFactor.toFixed(1)}
                    </p>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <p className={cn(
                      "font-medium",
                      strategy.sharpeRatio > 0 ? "dark:text-white text-gray-900" : "text-down"
                    )}>
                      {strategy.sharpeRatio.toFixed(1)}
                    </p>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {strategy.status === "active" ? (
                        <button
                          className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                          title="Pause Strategy"
                        >
                          <Pause className="w-4 h-4 dark:text-gray-400 text-gray-600" />
                        </button>
                      ) : strategy.status === "paused" ? (
                        <button
                          className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                          title="Resume Strategy"
                        >
                          <Play className="w-4 h-4 dark:text-gray-400 text-gray-600" />
                        </button>
                      ) : null}

                      {/* Three dot menu */}
                      <div className="relative">
                        <button
                          className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenuId(openMenuId === strategy.id ? null : strategy.id);
                          }}
                        >
                          <MoreVertical className="w-4 h-4 dark:text-gray-400 text-gray-600" />
                        </button>

                        {openMenuId === strategy.id && (
                          <div className="absolute right-0 top-8 z-50 w-48 bg-white dark:bg-slate-800 border dark:border-slate-700 border-gray-200 rounded-lg shadow-lg py-1">
                            <button
                              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-slate-700 flex items-center gap-2"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCloneStrategy(strategy.id);
                              }}
                            >
                              <Copy className="w-4 h-4" />
                              Clone Strategy
                            </button>

                            {strategy.status === "active" || strategy.status === "paused" ? (
                              <button
                                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-slate-700 flex items-center gap-2"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  console.log("Pause/Resume", strategy.id);
                                  setOpenMenuId(null);
                                }}
                              >
                                {strategy.status === "active" ? (
                                  <><Pause className="w-4 h-4" /> Pause</>
                                ) : (
                                  <><Play className="w-4 h-4" /> Resume</>
                                )}
                              </button>
                            ) : null}

                            <button
                              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-slate-700 flex items-center gap-2"
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push(`/strategies/${strategy.id}/history`);
                              }}
                            >
                              <History className="w-4 h-4" />
                              View History
                            </button>

                            {strategy.openPositions === 0 && (
                              <button
                                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-slate-700 flex items-center gap-2 text-red-600 dark:text-red-400"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleArchiveStrategy(strategy.id);
                                }}
                              >
                                <Archive className="w-4 h-4" />
                                Archive
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </PageContent>
    </AppLayout>
  );
}