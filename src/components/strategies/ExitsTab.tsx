'use client'

import { CheckCircle, Circle, Target, TrendingUp, Hand, Percent, Shield, AlertTriangle } from 'lucide-react'

// Position and Exit rules for MVP
const positionRules = [
  {
    id: 'p1',
    name: '2% Risk',
    icon: Percent,
    description: 'Risk 2% of account balance per trade',
    details: 'Calculates position size so that if stop loss is hit, you lose exactly 2% of your account. Standard risk management approach.',
    inUse: true,
    usedByStrategies: ['All strategies'] // All strategies use this in MVP
  }
]

const exitRules = [
  {
    id: 'x1',
    name: '2R Target',
    icon: Target,
    description: 'Exit at 2x risk reward ratio',
    details: 'Automatically closes position when profit reaches 2x the initial risk. If risking $100, target is $200 profit.',
    inUse: true,
    usedByStrategies: ['Breakout-2R', 'Pullback-2R', 'Manual-2R']
  },
  {
    id: 'x2',
    name: 'Trail 20MA',
    icon: TrendingUp,
    description: 'Trail stop at 20-day moving average',
    details: 'Moves stop loss up to the 20-day MA as price rises. Allows profits to run while protecting gains.',
    inUse: true,
    usedByStrategies: ['Breakout-Trail20MA', 'Pullback-MA']
  },
  {
    id: 'x3',
    name: 'Manual',
    icon: Hand,
    description: 'Manual exit based on discretion',
    details: 'Exit when you decide based on your analysis. No automated exit rules.',
    inUse: true,
    usedByStrategies: ['Manual-Manual']
  }
]

// Stop loss rules (not implemented in MVP but shown for completeness)
const stopLossRules = [
  {
    id: 's1',
    name: 'ATR Stop',
    icon: Shield,
    description: '2x ATR below entry (Coming Soon)',
    details: 'Places stop loss at 2x Average True Range below entry for volatility-based stops.',
    inUse: false,
    comingSoon: true
  },
  {
    id: 's2',
    name: 'Swing Low',
    icon: Shield,
    description: 'Below recent swing low (Coming Soon)',
    details: 'Places stop below the most recent swing low for technical-based stops.',
    inUse: false,
    comingSoon: true
  }
]

export function ExitsTab() {
  return (
    <div className="space-y-8">
      {/* Position Rules Section */}
      <div>
        <h2 className="text-xl font-semibold dark:text-white mb-2">Position Rules</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Define how much capital to allocate per trade based on risk tolerance.
        </p>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {positionRules.map(rule => {
            const Icon = rule.icon
            return (
              <div
                key={rule.id}
                className="bg-white dark:bg-slate-800 rounded-xl border dark:border-slate-700 border-gray-200 p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                      <Icon className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold dark:text-white">{rule.name}</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Position Rule
                      </p>
                    </div>
                  </div>
                  <CheckCircle className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  {rule.description}
                </p>

                <p className="text-xs text-gray-500 dark:text-gray-500 mb-4">
                  {rule.details}
                </p>

                <div className="pt-4 border-t dark:border-slate-700 border-gray-200">
                  <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                    Default for all strategies (MVP)
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Exit Rules Section */}
      <div>
        <h2 className="text-xl font-semibold dark:text-white mb-2">Exit Rules</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Define when and how to close positions for profit or loss management.
        </p>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {exitRules.map(rule => {
            const Icon = rule.icon
            return (
              <div
                key={rule.id}
                className="bg-white dark:bg-slate-800 rounded-xl border dark:border-slate-700 border-gray-200 p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-teal-100 dark:bg-teal-900/30 rounded-lg">
                      <Icon className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold dark:text-white">{rule.name}</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Exit Rule
                      </p>
                    </div>
                  </div>
                  <CheckCircle className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  {rule.description}
                </p>

                <p className="text-xs text-gray-500 dark:text-gray-500 mb-4">
                  {rule.details}
                </p>

                <div className="pt-4 border-t dark:border-slate-700 border-gray-200">
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
              </div>
            )
          })}
        </div>
      </div>

      {/* Stop Loss Rules (Coming Soon) */}
      <div>
        <h2 className="text-xl font-semibold dark:text-white mb-2">Stop Loss Rules</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Define where to place initial stop loss orders to limit risk.
        </p>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {stopLossRules.map(rule => {
            const Icon = rule.icon
            return (
              <div
                key={rule.id}
                className="bg-gray-50 dark:bg-slate-800/50 rounded-xl border dark:border-slate-700 border-gray-200 p-6 opacity-60"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 dark:bg-slate-700 rounded-lg">
                      <Icon className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold dark:text-gray-400 text-gray-600">
                        {rule.name}
                      </h3>
                      <p className="text-xs text-gray-400 dark:text-gray-500">
                        Stop Loss Rule
                      </p>
                    </div>
                  </div>
                  <Circle className="w-5 h-5 text-gray-400" />
                </div>

                <p className="text-sm text-gray-500 dark:text-gray-500 mb-3">
                  {rule.description}
                </p>

                <p className="text-xs text-gray-400 dark:text-gray-600 mb-4">
                  {rule.details}
                </p>

                <div className="pt-4 border-t dark:border-slate-700 border-gray-300">
                  <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                    Coming in Next Version
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Warning Box */}
      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
        <div className="flex gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-amber-900 dark:text-amber-300 mb-1">
              Important: Stop Loss in MVP
            </h3>
            <p className="text-sm text-amber-700 dark:text-amber-300">
              In the current MVP version, stop losses must be set manually for each trade.
              Automated stop loss rules will be added in the next version. Always set a stop loss
              before entering a position to properly calculate position size using the 2% risk rule.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}