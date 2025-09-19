'use client'

import { CheckCircle, Circle, TrendingUp, ArrowDownLeft, Hand } from 'lucide-react'

// Entry rules for MVP
const entryRules = [
  {
    id: 'e1',
    name: 'Breakout',
    icon: TrendingUp,
    description: 'Enter on break above resistance level',
    details: 'Triggers when price breaks above a defined resistance level with confirming volume. Best for trending markets.',
    inUse: true,
    usedByStrategies: ['Breakout-2R', 'Breakout-Trail20MA']
  },
  {
    id: 'e2',
    name: 'Pullback',
    icon: ArrowDownLeft,
    description: 'Enter on pullback to moving average',
    details: 'Waits for price to pull back to a key moving average (20MA or 50MA) before entering. Good for trend continuation trades.',
    inUse: true,
    usedByStrategies: ['Pullback-MA', 'Pullback-2R']
  },
  {
    id: 'e3',
    name: 'Manual',
    icon: Hand,
    description: 'Manual entry based on discretion',
    details: 'Allows manual trade entry based on your analysis. No automated signals.',
    inUse: true,
    usedByStrategies: ['Manual-2R']
  }
]

export function EntriesTab() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold dark:text-white mb-2">Entry Rules</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Define how strategies identify trade entry points. Each strategy must have exactly one entry rule.
        </p>
      </div>

      {/* Entry Rules Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {entryRules.map(rule => {
          const Icon = rule.icon
          return (
            <div
              key={rule.id}
              className="bg-white dark:bg-slate-800 rounded-xl border dark:border-slate-700 border-gray-200 p-6 hover:shadow-lg transition-shadow"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                    <Icon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold dark:text-white">{rule.name}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Entry Rule
                    </p>
                  </div>
                </div>
                {rule.inUse ? (
                  <CheckCircle className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                ) : (
                  <Circle className="w-5 h-5 text-gray-400" />
                )}
              </div>

              {/* Description */}
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                {rule.description}
              </p>

              {/* Details */}
              <p className="text-xs text-gray-500 dark:text-gray-500 mb-4">
                {rule.details}
              </p>

              {/* Usage Stats */}
              <div className="pt-4 border-t dark:border-slate-700 border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-500 dark:text-gray-400">Status</span>
                  <span className={`text-xs font-medium ${
                    rule.inUse
                      ? 'text-teal-600 dark:text-teal-400'
                      : 'text-gray-400 dark:text-gray-500'
                  }`}>
                    {rule.inUse ? 'Active' : 'Not Used'}
                  </span>
                </div>
                {rule.usedByStrategies.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                      Used by {rule.usedByStrategies.length} strategies:
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {rule.usedByStrategies.map(strategy => (
                        <span
                          key={strategy}
                          className="px-2 py-0.5 bg-gray-100 dark:bg-slate-700 rounded text-xs dark:text-gray-300"
                        >
                          {strategy}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
        <h3 className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-1">
          How Entry Rules Work
        </h3>
        <p className="text-sm text-blue-700 dark:text-blue-300">
          Entry rules determine when to open a new position. They scan the market for specific conditions
          and generate signals when those conditions are met. In the MVP, these are simplified patterns
          that would need additional configuration for production use (like specific MA periods or resistance levels).
        </p>
      </div>
    </div>
  )
}