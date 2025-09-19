'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface NewStrategyModalProps {
  onClose: () => void
  onCreate: (strategy: { name: string; entryRule: string; positionRule: string; exitRule: string }) => void
}

export function NewStrategyModal({ onClose, onCreate }: NewStrategyModalProps) {
  const [entryRule, setEntryRule] = useState('')
  const [positionRule, setPositionRule] = useState('2% Risk') // Only one option for MVP
  const [exitRule, setExitRule] = useState('')

  const handleCreate = () => {
    if (!entryRule || !exitRule) return

    const strategyName = `${entryRule}-${exitRule.replace(' ', '')}`
    onCreate({
      name: strategyName,
      entryRule,
      positionRule,
      exitRule
    })
  }

  const isValid = entryRule && exitRule

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b dark:border-slate-700 border-gray-200">
          <h2 className="text-xl font-semibold dark:text-white">New Strategy</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Entry Rule Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Entry Rule
            </label>
            <select
              value={entryRule}
              onChange={(e) => setEntryRule(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border dark:border-slate-600 border-gray-300
                       bg-white dark:bg-slate-700 text-gray-900 dark:text-white
                       focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent"
            >
              <option value="">Select entry rule...</option>
              <option value="Breakout">Breakout - Enter on break above resistance</option>
              <option value="Pullback">Pullback - Enter on pullback to moving average</option>
              <option value="Manual">Manual - Manual entry based on discretion</option>
            </select>
          </div>

          {/* Position Rule Dropdown (Only one option) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Position Rule
            </label>
            <select
              value={positionRule}
              disabled
              className="w-full px-3 py-2 rounded-lg border dark:border-slate-600 border-gray-300
                       bg-gray-50 dark:bg-slate-700/50 text-gray-900 dark:text-white
                       cursor-not-allowed opacity-75"
            >
              <option value="2% Risk">2% Risk - Risk 2% of account per trade</option>
            </select>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Only 2% Risk available in MVP
            </p>
          </div>

          {/* Exit Rule Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Exit Rule
            </label>
            <select
              value={exitRule}
              onChange={(e) => setExitRule(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border dark:border-slate-600 border-gray-300
                       bg-white dark:bg-slate-700 text-gray-900 dark:text-white
                       focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent"
            >
              <option value="">Select exit rule...</option>
              <option value="2R Target">2R Target - Exit at 2x risk reward</option>
              <option value="Trail 20MA">Trail 20MA - Trail stop at 20-day moving average</option>
              <option value="Manual">Manual - Manual exit based on discretion</option>
            </select>
          </div>

          {/* Strategy Name Preview */}
          {entryRule && exitRule && (
            <div className="p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">Strategy Name:</p>
              <p className="font-medium dark:text-white">
                {entryRule}-{exitRule.replace(' ', '')}
              </p>
            </div>
          )}

          {/* Info Box */}
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Strategies cannot be edited after creation. You can pause or resume them at any time.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t dark:border-slate-700 border-gray-200">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleCreate}
            disabled={!isValid}
          >
            Create Strategy
          </Button>
        </div>
      </div>
    </div>
  )
}