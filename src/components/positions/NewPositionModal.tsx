"use client";

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { Search, TrendingUp, Clock, Plus, Layers, Building2 } from 'lucide-react';

interface NewPositionModalProps {
  isOpen: boolean;
  onClose: () => void;
  accountType: 'live' | 'paper' | 'dev';
  onSubmit: (position: NewPositionData) => void;
  prefilledSymbol?: string;
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
  strategyId?: string;
  source: 'broker_api' | 'manual' | 'external';
  externalBroker?: string;
  entryFee?: number;
  entryCommission?: number;
  notes?: string;
}

// Mock strategies - in production, these would come from your API
const mockStrategies = [
  { id: '1', name: 'Breakout-2R', status: 'active' },
  { id: '2', name: 'Pullback-MA', status: 'active' },
  { id: '3', name: 'Manual-2R', status: 'active' },
  { id: '4', name: 'Swing-Momentum', status: 'paused' },
];

// Mock symbol suggestions - in production, these would come from your API
const mockSymbolSuggestions = [
  { symbol: 'AAPL', name: 'Apple Inc.', exchange: 'NASDAQ' },
  { symbol: 'MSFT', name: 'Microsoft Corporation', exchange: 'NASDAQ' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', exchange: 'NASDAQ' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', exchange: 'NASDAQ' },
  { symbol: 'TSLA', name: 'Tesla Inc.', exchange: 'NASDAQ' },
  { symbol: 'META', name: 'Meta Platforms Inc.', exchange: 'NASDAQ' },
  { symbol: 'NVDA', name: 'NVIDIA Corporation', exchange: 'NASDAQ' },
  { symbol: 'JPM', name: 'JPMorgan Chase & Co.', exchange: 'NYSE' },
  { symbol: 'V', name: 'Visa Inc.', exchange: 'NYSE' },
  { symbol: 'JNJ', name: 'Johnson & Johnson', exchange: 'NYSE' },
];

const recentSymbols = ['AAPL', 'MSFT', 'TSLA']; // Mock recent symbols
const popularSymbols = ['SPY', 'QQQ', 'AAPL', 'MSFT', 'NVDA']; // Mock popular symbols

export function NewPositionModal({ isOpen, onClose, accountType, onSubmit, prefilledSymbol }: NewPositionModalProps) {
  const [entryMode, setEntryMode] = useState<'quick' | 'detailed'>('quick');
  const [formData, setFormData] = useState<NewPositionData>({
    symbol: prefilledSymbol || '',
    side: 'buy',
    orderType: 'market',
    quantity: 0,
    timeInForce: 'day',
    source: 'broker_api'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [symbolSearch, setSymbolSearch] = useState(prefilledSymbol || '');
  const [showSymbolSuggestions, setShowSymbolSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState(mockSymbolSuggestions);
  const searchRef = useRef<HTMLDivElement>(null);
  const [showCreateStrategy, setShowCreateStrategy] = useState(false);
  const [newStrategyName, setNewStrategyName] = useState('');

  // Update symbol search when modal opens with prefilled symbol
  useEffect(() => {
    if (prefilledSymbol) {
      setSymbolSearch(prefilledSymbol);
      setFormData(prev => ({ ...prev, symbol: prefilledSymbol }));
    }
  }, [prefilledSymbol]);

  // Filter symbol suggestions based on search
  useEffect(() => {
    if (symbolSearch && symbolSearch.length > 0) {
      const filtered = mockSymbolSuggestions.filter(
        item =>
          item.symbol.toUpperCase().includes(symbolSearch.toUpperCase()) ||
          item.name.toLowerCase().includes(symbolSearch.toLowerCase())
      );
      setFilteredSuggestions(filtered);
    } else {
      setFilteredSuggestions(mockSymbolSuggestions);
    }
  }, [symbolSearch]);

  // Click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSymbolSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // If creating a new strategy on the fly
      if (showCreateStrategy && newStrategyName) {
        // In production, this would create the strategy via API and get the ID
        const newStrategyId = `new_${Date.now()}`;
        formData.strategyId = newStrategyId;
      }

      await onSubmit(formData);
      // Reset form
      setFormData({
        symbol: '',
        side: 'buy',
        orderType: 'market',
        quantity: 0,
        timeInForce: 'day',
        source: 'broker_api'
      });
      setSymbolSearch('');
      setNewStrategyName('');
      setShowCreateStrategy(false);
      setEntryMode('quick');
      onClose();
    } catch (error) {
      console.error('Failed to create position:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSymbolSelect = (symbol: string) => {
    setSymbolSearch(symbol);
    setFormData({ ...formData, symbol });
    setShowSymbolSuggestions(false);
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

        {/* Entry Mode Toggle */}
        <div className="flex gap-2 mb-6">
          <button
            type="button"
            onClick={() => setEntryMode('quick')}
            className={cn(
              "flex-1 py-2 px-4 rounded-lg font-medium transition-colors",
              entryMode === 'quick'
                ? "bg-indigo-500 text-white"
                : "dark:bg-slate-700 bg-gray-100 dark:text-gray-300 text-gray-700 hover:bg-gray-200 dark:hover:bg-slate-600"
            )}
          >
            Quick Entry
          </button>
          <button
            type="button"
            onClick={() => setEntryMode('detailed')}
            className={cn(
              "flex-1 py-2 px-4 rounded-lg font-medium transition-colors",
              entryMode === 'detailed'
                ? "bg-indigo-500 text-white"
                : "dark:bg-slate-700 bg-gray-100 dark:text-gray-300 text-gray-700 hover:bg-gray-200 dark:hover:bg-slate-600"
            )}
          >
            Detailed Entry
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Symbol with Search */}
          <div className="relative" ref={searchRef}>
            <label className="block text-sm font-medium dark:text-gray-300 text-gray-700 mb-1">
              Symbol {!prefilledSymbol && <span className="text-red-500">*</span>}
            </label>
            <div className="relative">
              <input
                type="text"
                value={symbolSearch}
                onChange={(e) => {
                  setSymbolSearch(e.target.value.toUpperCase());
                  setFormData({ ...formData, symbol: e.target.value.toUpperCase() });
                  setShowSymbolSuggestions(true);
                }}
                onFocus={() => !prefilledSymbol && setShowSymbolSuggestions(true)}
                placeholder="Search for symbol..."
                required
                className="w-full px-3 py-2 pl-9 rounded-lg border dark:border-slate-600 border-gray-300 dark:bg-slate-700 bg-white dark:text-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            </div>

            {/* Symbol Suggestions Dropdown */}
            {showSymbolSuggestions && !prefilledSymbol && (
              <div className="absolute z-10 w-full mt-1 bg-white dark:bg-slate-800 border dark:border-slate-600 border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {/* Recent Symbols */}
                {recentSymbols.length > 0 && (
                  <>
                    <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      Recent
                    </div>
                    {recentSymbols.map(symbol => (
                      <button
                        key={`recent-${symbol}`}
                        type="button"
                        onClick={() => handleSymbolSelect(symbol)}
                        className="w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-slate-700 text-sm"
                      >
                        <span className="font-medium dark:text-white">{symbol}</span>
                      </button>
                    ))}
                  </>
                )}

                {/* Popular Symbols */}
                <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 flex items-center border-t dark:border-slate-600 border-gray-200">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  Popular
                </div>
                {popularSymbols.map(symbol => (
                  <button
                    key={`popular-${symbol}`}
                    type="button"
                    onClick={() => handleSymbolSelect(symbol)}
                    className="w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-slate-700 text-sm"
                  >
                    <span className="font-medium dark:text-white">{symbol}</span>
                  </button>
                ))}

                {/* Search Results */}
                {symbolSearch && (
                  <>
                    <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 border-t dark:border-slate-600 border-gray-200">
                      Search Results
                    </div>
                    {filteredSuggestions.length > 0 ? (
                      filteredSuggestions.map(item => (
                        <button
                          key={item.symbol}
                          type="button"
                          onClick={() => handleSymbolSelect(item.symbol)}
                          className="w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-slate-700"
                        >
                          <div className="flex justify-between">
                            <div>
                              <span className="font-medium dark:text-white">{item.symbol}</span>
                              <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">{item.name}</span>
                            </div>
                            <span className="text-xs text-gray-400">{item.exchange}</span>
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                        No results found
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          {/* Strategy Selection */}
          <div>
            <label className="block text-sm font-medium dark:text-gray-300 text-gray-700 mb-1">
              Strategy <span className="text-gray-400">(Optional)</span>
            </label>
            {!showCreateStrategy ? (
              <div className="space-y-2">
                <select
                  value={formData.strategyId || ''}
                  onChange={(e) => setFormData({ ...formData, strategyId: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border dark:border-slate-600 border-gray-300 dark:bg-slate-700 bg-white dark:text-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">No Strategy (Unassigned)</option>
                  {mockStrategies
                    .filter(s => s.status === 'active')
                    .map(strategy => (
                      <option key={strategy.id} value={strategy.id}>
                        {strategy.name}
                      </option>
                    ))}
                </select>
                <button
                  type="button"
                  onClick={() => setShowCreateStrategy(true)}
                  className="w-full py-2 px-3 text-sm text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors flex items-center justify-center"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Create New Strategy
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <input
                  type="text"
                  value={newStrategyName}
                  onChange={(e) => setNewStrategyName(e.target.value)}
                  placeholder="Enter strategy name..."
                  className="w-full px-3 py-2 rounded-lg border dark:border-slate-600 border-gray-300 dark:bg-slate-700 bg-white dark:text-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateStrategy(false);
                    setNewStrategyName('');
                  }}
                  className="w-full py-2 px-3 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}
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
              Quantity <span className="text-red-500">*</span>
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

          {/* Position Source - Only in Detailed Mode */}
          {entryMode === 'detailed' && (
            <div>
              <label className="block text-sm font-medium dark:text-gray-300 text-gray-700 mb-1">
                Position Source
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="broker_api"
                    checked={formData.source === 'broker_api'}
                    onChange={(e) => setFormData({ ...formData, source: e.target.value as any })}
                    className="mr-2"
                  />
                  <Layers className="w-4 h-4 mr-1 text-indigo-500" />
                  <span>Broker API (Automated)</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="manual"
                    checked={formData.source === 'manual'}
                    onChange={(e) => setFormData({ ...formData, source: e.target.value as any })}
                    className="mr-2"
                  />
                  <span>Manual Entry</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="external"
                    checked={formData.source === 'external'}
                    onChange={(e) => setFormData({ ...formData, source: e.target.value as any })}
                    className="mr-2"
                  />
                  <Building2 className="w-4 h-4 mr-1 text-orange-500" />
                  <span>External Broker</span>
                </label>
              </div>

              {/* External Broker Name */}
              {formData.source === 'external' && (
                <input
                  type="text"
                  value={formData.externalBroker || ''}
                  onChange={(e) => setFormData({ ...formData, externalBroker: e.target.value })}
                  placeholder="E.g., TD Ameritrade, E*TRADE, Robinhood..."
                  className="mt-2 w-full px-3 py-2 rounded-lg border dark:border-slate-600 border-gray-300 dark:bg-slate-700 bg-white dark:text-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              )}
            </div>
          )}

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

          {/* Fees and Commissions - Only in Detailed Mode */}
          {entryMode === 'detailed' && (formData.source === 'manual' || formData.source === 'external') && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm dark:text-gray-400 text-gray-600 mb-1">
                  Entry Fee ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.entryFee || ''}
                  onChange={(e) => setFormData({ ...formData, entryFee: parseFloat(e.target.value) || undefined })}
                  placeholder="0.00"
                  className="w-full px-3 py-2 rounded-lg border dark:border-slate-600 border-gray-300 dark:bg-slate-700 bg-white dark:text-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm dark:text-gray-400 text-gray-600 mb-1">
                  Commission ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.entryCommission || ''}
                  onChange={(e) => setFormData({ ...formData, entryCommission: parseFloat(e.target.value) || undefined })}
                  placeholder="0.00"
                  className="w-full px-3 py-2 rounded-lg border dark:border-slate-600 border-gray-300 dark:bg-slate-700 bg-white dark:text-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
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

          {/* Notes - Only in Detailed Mode */}
          {entryMode === 'detailed' && (
            <div>
              <label className="block text-sm font-medium dark:text-gray-300 text-gray-700 mb-1">
                Notes <span className="text-gray-400">(Optional)</span>
              </label>
              <textarea
                value={formData.notes || ''}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Trade reasoning, market conditions, strategy notes..."
                rows={3}
                className="w-full px-3 py-2 rounded-lg border dark:border-slate-600 border-gray-300 dark:bg-slate-700 bg-white dark:text-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              />
            </div>
          )}

          {/* Warnings */}
          {accountType === 'live' && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400 font-medium">
                ⚠️ Live Trading: Real money will be used for this order.
              </p>
            </div>
          )}

          {formData.source === 'manual' && (
            <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
              <p className="text-sm text-amber-600 dark:text-amber-400">
                📝 Manual position: All updates and executions must be entered manually
              </p>
            </div>
          )}

          {formData.source === 'external' && (
            <div className="p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
              <p className="text-sm text-orange-600 dark:text-orange-400">
                🏦 External broker: Track positions executed at {formData.externalBroker || 'another broker'}
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