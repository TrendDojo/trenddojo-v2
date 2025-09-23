"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface NewPositionModalProps {
  isOpen: boolean;
  onClose: () => void;
  accountType: 'live' | 'paper' | 'dev';
  onSubmit: (position: NewPositionData) => void;
}

export interface NewPositionData {
  symbol: string;
  side: 'buy' | 'sell';
  orderType: 'market' | 'limit' | 'stop' | 'stop_limit';
  quantity: number;
  limitPrice?: number;
  stopPrice?: number;
  stopLoss?: number;
  takeProfit?: number;
  timeInForce: 'day' | 'gtc' | 'ioc' | 'fok';
}

export function NewPositionModal({ isOpen, onClose, accountType, onSubmit }: NewPositionModalProps) {
  const [formData, setFormData] = useState<NewPositionData>({
    symbol: '',
    side: 'buy',
    orderType: 'market',
    quantity: 0,
    timeInForce: 'day'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await onSubmit(formData);
      // Reset form
      setFormData({
        symbol: '',
        side: 'buy',
        orderType: 'market',
        quantity: 0,
        timeInForce: 'day'
      });
      onClose();
    } catch (error) {
      console.error('Failed to create position:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold dark:text-white text-gray-900">
              New Position
            </h2>
            <p className="text-sm dark:text-gray-400 text-gray-600 mt-1">
              {accountType === 'live' ? '🔴 Live Trading' : accountType === 'paper' ? '📝 Paper Trading' : '🧪 Dev Mode'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
          >
            <svg className="w-5 h-5 dark:text-gray-400 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Symbol */}
          <div>
            <label className="block text-sm font-medium dark:text-gray-300 text-gray-700 mb-1">
              Symbol
            </label>
            <input
              type="text"
              value={formData.symbol}
              onChange={(e) => setFormData({ ...formData, symbol: e.target.value.toUpperCase() })}
              placeholder="AAPL"
              required
              className="w-full px-3 py-2 rounded-lg border dark:border-slate-600 border-gray-300 dark:bg-slate-700 bg-white dark:text-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Buy/Sell Toggle */}
          <div>
            <label className="block text-sm font-medium dark:text-gray-300 text-gray-700 mb-1">
              Side
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, side: 'buy' })}
                className={cn(
                  "py-2 px-4 rounded-lg font-medium transition-colors",
                  formData.side === 'buy'
                    ? "bg-success text-white"
                    : "dark:bg-slate-700 bg-gray-100 dark:text-gray-300 text-gray-700 hover:bg-gray-200 dark:hover:bg-slate-600"
                )}
              >
                Buy
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, side: 'sell' })}
                className={cn(
                  "py-2 px-4 rounded-lg font-medium transition-colors",
                  formData.side === 'sell'
                    ? "bg-danger text-white"
                    : "dark:bg-slate-700 bg-gray-100 dark:text-gray-300 text-gray-700 hover:bg-gray-200 dark:hover:bg-slate-600"
                )}
              >
                Sell
              </button>
            </div>
          </div>

          {/* Order Type */}
          <div>
            <label className="block text-sm font-medium dark:text-gray-300 text-gray-700 mb-1">
              Order Type
            </label>
            <select
              value={formData.orderType}
              onChange={(e) => setFormData({ ...formData, orderType: e.target.value as any })}
              className="w-full px-3 py-2 rounded-lg border dark:border-slate-600 border-gray-300 dark:bg-slate-700 bg-white dark:text-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="market">Market</option>
              <option value="limit">Limit</option>
              <option value="stop">Stop</option>
              <option value="stop_limit">Stop Limit</option>
            </select>
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-sm font-medium dark:text-gray-300 text-gray-700 mb-1">
              Quantity
            </label>
            <input
              type="number"
              value={formData.quantity || ''}
              onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
              placeholder="100"
              min="1"
              required
              className="w-full px-3 py-2 rounded-lg border dark:border-slate-600 border-gray-300 dark:bg-slate-700 bg-white dark:text-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Limit Price (for limit orders) */}
          {(formData.orderType === 'limit' || formData.orderType === 'stop_limit') && (
            <div>
              <label className="block text-sm font-medium dark:text-gray-300 text-gray-700 mb-1">
                Limit Price
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.limitPrice || ''}
                onChange={(e) => setFormData({ ...formData, limitPrice: parseFloat(e.target.value) || undefined })}
                placeholder="150.00"
                required
                className="w-full px-3 py-2 rounded-lg border dark:border-slate-600 border-gray-300 dark:bg-slate-700 bg-white dark:text-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          )}

          {/* Stop Price (for stop orders) */}
          {(formData.orderType === 'stop' || formData.orderType === 'stop_limit') && (
            <div>
              <label className="block text-sm font-medium dark:text-gray-300 text-gray-700 mb-1">
                Stop Price
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.stopPrice || ''}
                onChange={(e) => setFormData({ ...formData, stopPrice: parseFloat(e.target.value) || undefined })}
                placeholder="145.00"
                required
                className="w-full px-3 py-2 rounded-lg border dark:border-slate-600 border-gray-300 dark:bg-slate-700 bg-white dark:text-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          )}

          {/* Risk Management Section */}
          <div className="border-t dark:border-slate-600 border-gray-200 pt-4">
            <h3 className="text-sm font-medium dark:text-gray-300 text-gray-700 mb-3">
              Risk Management (Optional)
            </h3>

            {/* Stop Loss */}
            <div className="mb-3">
              <label className="block text-sm dark:text-gray-400 text-gray-600 mb-1">
                Stop Loss Price
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.stopLoss || ''}
                onChange={(e) => setFormData({ ...formData, stopLoss: parseFloat(e.target.value) || undefined })}
                placeholder="140.00"
                className="w-full px-3 py-2 rounded-lg border dark:border-slate-600 border-gray-300 dark:bg-slate-700 bg-white dark:text-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Take Profit */}
            <div>
              <label className="block text-sm dark:text-gray-400 text-gray-600 mb-1">
                Take Profit Price
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.takeProfit || ''}
                onChange={(e) => setFormData({ ...formData, takeProfit: parseFloat(e.target.value) || undefined })}
                placeholder="160.00"
                className="w-full px-3 py-2 rounded-lg border dark:border-slate-600 border-gray-300 dark:bg-slate-700 bg-white dark:text-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Time in Force */}
          <div>
            <label className="block text-sm font-medium dark:text-gray-300 text-gray-700 mb-1">
              Time in Force
            </label>
            <select
              value={formData.timeInForce}
              onChange={(e) => setFormData({ ...formData, timeInForce: e.target.value as any })}
              className="w-full px-3 py-2 rounded-lg border dark:border-slate-600 border-gray-300 dark:bg-slate-700 bg-white dark:text-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="day">Day</option>
              <option value="gtc">Good Till Canceled</option>
              <option value="ioc">Immediate or Cancel</option>
              <option value="fok">Fill or Kill</option>
            </select>
          </div>

          {/* Warning for Live Trading */}
          {accountType === 'live' && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400 font-medium">
                ⚠️ Live Trading: Real money will be used for this order.
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant={formData.side === 'buy' ? 'success' : 'danger'}
              disabled={isSubmitting || !formData.symbol || !formData.quantity}
              className="flex-1"
            >
              {isSubmitting ? 'Placing Order...' : `${formData.side === 'buy' ? 'Buy' : 'Sell'} ${formData.symbol || 'Symbol'}`}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}