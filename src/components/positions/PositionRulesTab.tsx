'use client'

import { CheckCircle, Percent, AlertTriangle } from 'lucide-react'

// Position rules for MVP
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

export function PositionRulesTab() {
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
                    <div className="p-2 bg-warning/20 rounded-lg">
                      <Icon className="w-5 h-5 text-warning" />
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
                  <span className="text-xs text-warning font-medium">
                    Default for all strategies (MVP)
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Warning Box */}
      <div className="bg-warning/10 rounded-xl p-4">
        <div className="flex gap-3">
          <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-warning mb-1">
              Important: Position Sizing in MVP
            </h3>
            <p className="text-sm text-warning/80">
              In the current MVP version, the 2% risk rule is the default position sizing method.
              More advanced position sizing rules will be added in future versions. Always ensure
              you have set appropriate stop losses to enable proper position size calculation.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}