'use client'

import React, { useState } from 'react'
import { Play, Pause, Plus, ChevronDown, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { NewStrategyModal } from './NewStrategyModal'
import { cn } from '@/lib/utils'

// Mock data for MVP
const mockStrategies = [
  {
    id: '1',
    name: 'Breakout-2R',
    status: 'active',
    pnl: 450,
    winRate: 60,
    totalTrades: 10,
    winningTrades: 6,
    positions: [
      { symbol: 'AAPL', entry: 150, current: 155, pnl: 125 },
      { symbol: 'MSFT', entry: 300, current: 298, pnl: -50 }
    ]
  },
  {
    id: '2',
    name: 'Pullback-MA',
    status: 'paused',
    pnl: 230,
    winRate: 55,
    totalTrades: 20,
    winningTrades: 11,
    positions: []
  },
  {
    id: '3',
    name: 'Manual-2R',
    status: 'active',
    pnl: -120,
    winRate: 40,
    totalTrades: 5,
    winningTrades: 2,
    positions: [
      { symbol: 'GOOGL', entry: 140, current: 138, pnl: -120 }
    ]
  }
]

export function StrategiesTab() {
  const [strategies, setStrategies] = useState(mockStrategies)
  const [showNewModal, setShowNewModal] = useState(false)
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())

  const toggleStrategy = (id: string) => {
    setStrategies(prev =>
      prev.map(s =>
        s.id === id
          ? { ...s, status: s.status === 'active' ? 'paused' : 'active' }
          : s
      )
    )
  }

  const toggleRowExpansion = (id: string) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  const activeCount = strategies.filter(s => s.status === 'active').length
  const totalPnL = strategies.reduce((sum, s) => sum + s.pnl, 0)

  return (
    <>
      {/* Summary Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-8">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Active Strategies</p>
            <p className="text-2xl font-bold dark:text-white">{activeCount}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Total P&L</p>
            <p className={cn(
              "text-2xl font-bold",
              totalPnL >= 0 ? "text-success" : "text-danger"
            )}>
              ${totalPnL >= 0 ? '+' : ''}{totalPnL.toLocaleString()}
            </p>
          </div>
        </div>
        <Button variant="primary" onClick={() => setShowNewModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Strategy
        </Button>
      </div>

      {/* Strategies Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border dark:border-slate-700 border-gray-200">
        <table className="w-full">
          <thead>
            <tr className="border-b dark:border-slate-700 border-gray-200">
              <th className="text-left py-4 px-6 font-medium text-gray-700 dark:text-gray-300">

              </th>
              <th className="text-left py-4 px-6 font-medium text-gray-700 dark:text-gray-300">
                Name
              </th>
              <th className="text-center py-4 px-6 font-medium text-gray-700 dark:text-gray-300">
                Status
              </th>
              <th className="text-right py-4 px-6 font-medium text-gray-700 dark:text-gray-300">
                P&L
              </th>
              <th className="text-right py-4 px-6 font-medium text-gray-700 dark:text-gray-300">
                Win Rate
              </th>
              <th className="text-center py-4 px-6 font-medium text-gray-700 dark:text-gray-300">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y dark:divide-slate-700 divide-gray-200">
            {strategies.map(strategy => (
              <React.Fragment key={strategy.id}>
                <tr className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                  <td className="py-4 px-6">
                    {strategy.positions.length > 0 && (
                      <button
                        onClick={() => toggleRowExpansion(strategy.id)}
                        className="p-1 hover:bg-gray-200 dark:hover:bg-slate-600 rounded"
                      >
                        {expandedRows.has(strategy.id) ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </button>
                    )}
                  </td>
                  <td className="py-4 px-6">
                    <p className="font-medium dark:text-white">{strategy.name}</p>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <span className={cn(
                      "inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium",
                      strategy.status === 'active'
                        ? "bg-success/20 text-success"
                        : "bg-warning/20 text-warning"
                    )}>
                      {strategy.status === 'active' ? (
                        <Play className="w-3 h-3" />
                      ) : (
                        <Pause className="w-3 h-3" />
                      )}
                      {strategy.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <p className={cn(
                      "font-medium",
                      strategy.pnl >= 0
                        ? "text-success"
                        : "text-danger"
                    )}>
                      ${strategy.pnl >= 0 ? '+' : ''}{strategy.pnl.toLocaleString()}
                    </p>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div>
                      <p className="font-medium dark:text-white">{strategy.winRate}%</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {strategy.winningTrades}W / {strategy.totalTrades - strategy.winningTrades}L
                      </p>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <button
                      onClick={() => toggleStrategy(strategy.id)}
                      className={cn(
                        "px-3 py-1 rounded text-sm font-medium transition-colors",
                        strategy.status === 'active'
                          ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 hover:bg-amber-200 dark:hover:bg-amber-900/50"
                          : "bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 hover:bg-teal-200 dark:hover:bg-teal-900/50"
                      )}
                    >
                      {strategy.status === 'active' ? 'Pause' : 'Resume'}
                    </button>
                  </td>
                </tr>

                {/* Expandable Positions Row */}
                {expandedRows.has(strategy.id) && strategy.positions.length > 0 && (
                  <tr>
                    <td colSpan={6} className="bg-gray-50 dark:bg-slate-900/50 px-12 py-4">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                        Open Positions
                      </p>
                      <div className="space-y-2">
                        {strategy.positions.map((position, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between text-sm"
                          >
                            <span className="font-medium dark:text-white">
                              {position.symbol}
                            </span>
                            <span className="text-gray-500 dark:text-gray-400">
                              Entry: ${position.entry}
                            </span>
                            <span className="text-gray-500 dark:text-gray-400">
                              Current: ${position.current}
                            </span>
                            <span className={cn(
                              "font-medium",
                              position.pnl >= 0
                                ? "text-success"
                                : "text-danger"
                            )}>
                              ${position.pnl >= 0 ? '+' : ''}{position.pnl}
                            </span>
                          </div>
                        ))}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* New Strategy Modal */}
      {showNewModal && (
        <NewStrategyModal
          onClose={() => setShowNewModal(false)}
          onCreate={(newStrategy) => {
            setStrategies(prev => [...prev, {
              id: Date.now().toString(),
              name: newStrategy.name,
              status: 'active',
              pnl: 0,
              winRate: 0,
              totalTrades: 0,
              winningTrades: 0,
              positions: []
            }])
            setShowNewModal(false)
          }}
        />
      )}
    </>
  )
}