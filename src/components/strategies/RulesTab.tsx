'use client'

import { ChevronDown, ChevronRight, CheckCircle, Circle } from 'lucide-react'
import { useState } from 'react'

// Fixed rules for MVP
const rules = {
  entry: [
    { id: 'e1', name: 'Breakout', description: 'Enter on break above resistance', inUse: true },
    { id: 'e2', name: 'Pullback', description: 'Enter on pullback to moving average', inUse: true },
    { id: 'e3', name: 'Manual', description: 'Manual entry based on discretion', inUse: true }
  ],
  position: [
    { id: 'p1', name: '2% Risk', description: 'Risk 2% of account per trade', inUse: true }
  ],
  exit: [
    { id: 'x1', name: '2R Target', description: 'Exit at 2x risk reward', inUse: true },
    { id: 'x2', name: 'Trail 20MA', description: 'Trail stop at 20-day moving average', inUse: true },
    { id: 'x3', name: 'Manual', description: 'Manual exit based on discretion', inUse: true }
  ]
}

export function RulesTab() {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['entry', 'position', 'exit'])
  )

  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev)
      if (newSet.has(section)) {
        newSet.delete(section)
      } else {
        newSet.add(section)
      }
      return newSet
    })
  }

  return (
    <div className="space-y-4">
      {/* Entry Rules Section */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border dark:border-slate-700 border-gray-200">
        <button
          onClick={() => toggleSection('entry')}
          className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            {expandedSections.has('entry') ? (
              <ChevronDown className="w-5 h-5 text-gray-500" />
            ) : (
              <ChevronRight className="w-5 h-5 text-gray-500" />
            )}
            <h3 className="text-lg font-medium dark:text-white">Entry Rules</h3>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              ({rules.entry.length} rules)
            </span>
          </div>
        </button>

        {expandedSections.has('entry') && (
          <div className="border-t dark:border-slate-700 border-gray-200">
            <div className="divide-y dark:divide-slate-700 divide-gray-200">
              {rules.entry.map(rule => (
                <div key={rule.id} className="px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {rule.inUse ? (
                      <CheckCircle className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                    ) : (
                      <Circle className="w-5 h-5 text-gray-400" />
                    )}
                    <div>
                      <p className="font-medium dark:text-white">{rule.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {rule.description}
                      </p>
                    </div>
                  </div>
                  <span className={`text-sm font-medium ${
                    rule.inUse
                      ? 'text-teal-600 dark:text-teal-400'
                      : 'text-gray-400 dark:text-gray-500'
                  }`}>
                    {rule.inUse ? 'In Use' : 'Not Used'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Position Rules Section */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border dark:border-slate-700 border-gray-200">
        <button
          onClick={() => toggleSection('position')}
          className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            {expandedSections.has('position') ? (
              <ChevronDown className="w-5 h-5 text-gray-500" />
            ) : (
              <ChevronRight className="w-5 h-5 text-gray-500" />
            )}
            <h3 className="text-lg font-medium dark:text-white">Position Rules</h3>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              ({rules.position.length} rule)
            </span>
          </div>
        </button>

        {expandedSections.has('position') && (
          <div className="border-t dark:border-slate-700 border-gray-200">
            <div className="divide-y dark:divide-slate-700 divide-gray-200">
              {rules.position.map(rule => (
                <div key={rule.id} className="px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {rule.inUse ? (
                      <CheckCircle className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                    ) : (
                      <Circle className="w-5 h-5 text-gray-400" />
                    )}
                    <div>
                      <p className="font-medium dark:text-white">{rule.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {rule.description}
                      </p>
                    </div>
                  </div>
                  <span className={`text-sm font-medium ${
                    rule.inUse
                      ? 'text-teal-600 dark:text-teal-400'
                      : 'text-gray-400 dark:text-gray-500'
                  }`}>
                    {rule.inUse ? 'In Use' : 'Not Used'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Exit Rules Section */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border dark:border-slate-700 border-gray-200">
        <button
          onClick={() => toggleSection('exit')}
          className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            {expandedSections.has('exit') ? (
              <ChevronDown className="w-5 h-5 text-gray-500" />
            ) : (
              <ChevronRight className="w-5 h-5 text-gray-500" />
            )}
            <h3 className="text-lg font-medium dark:text-white">Exit Rules</h3>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              ({rules.exit.length} rules)
            </span>
          </div>
        </button>

        {expandedSections.has('exit') && (
          <div className="border-t dark:border-slate-700 border-gray-200">
            <div className="divide-y dark:divide-slate-700 divide-gray-200">
              {rules.exit.map(rule => (
                <div key={rule.id} className="px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {rule.inUse ? (
                      <CheckCircle className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                    ) : (
                      <Circle className="w-5 h-5 text-gray-400" />
                    )}
                    <div>
                      <p className="font-medium dark:text-white">{rule.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {rule.description}
                      </p>
                    </div>
                  </div>
                  <span className={`text-sm font-medium ${
                    rule.inUse
                      ? 'text-teal-600 dark:text-teal-400'
                      : 'text-gray-400 dark:text-gray-500'
                  }`}>
                    {rule.inUse ? 'In Use' : 'Not Used'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
        <p className="text-sm text-blue-700 dark:text-blue-300">
          <strong>Note:</strong> These are the available rules for creating strategies.
          Each strategy must have exactly one rule from each category.
          Rules cannot be edited or deleted in the MVP version.
        </p>
      </div>
    </div>
  )
}