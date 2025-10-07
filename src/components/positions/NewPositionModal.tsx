"use client";

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/Button';
import { Tooltip } from '@/components/ui/Tooltip';
import { cn } from '@/lib/utils';
import { alertStyles } from '@/lib/panelStyles';
import { Search, TrendingUp, Clock, Plus, Zap, Layers, Hand, ChevronRight, ChevronLeft, Check, AlertCircle } from 'lucide-react';
import { useSymbolSearch, useLatestPrice, useSymbolValidation } from '@/lib/market-data/client/useMarketData';
import { useBrokerQuote } from '@/lib/market-data/client/useBrokerQuote';
import { LocalChart } from '@/components/charts/LocalChart';

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
  source: 'alpaca_live' | 'alpaca_paper' | 'external';
  externalBroker?: string;
  entryFee?: number;
  entryCommission?: number;
  notes?: string;
}

interface Strategy {
  id: string;
  name: string;
  status: string;
  type?: string;
}

// Popular symbols for quick access
const recentSymbols = ['AAPL', 'MSFT', 'TSLA']; // Placeholder - will get from user history
const popularSymbols = ['AAPL', 'MSFT', 'NVDA', 'GOOGL', 'AMZN'];

export function NewPositionModal({ isOpen, onClose, accountType, onSubmit, prefilledSymbol }: NewPositionModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<NewPositionData>({
    symbol: prefilledSymbol || '',
    side: 'buy',
    orderType: 'market',
    quantity: 0,
    timeInForce: 'day',
    source: undefined as any // No default - user must select
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [symbolSearch, setSymbolSearch] = useState(prefilledSymbol || '');
  const [showSymbolSuggestions, setShowSymbolSuggestions] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [strategiesLoading, setStrategiesLoading] = useState(true);

  // Use real market data hooks
  const { query: searchQuery, setQuery: setSearchQuery, results: searchResults, loading: searchLoading } = useSymbolSearch();

  // Determine if we should use broker data or general market data
  const useBrokerData = formData.source === 'alpaca_live' || formData.source === 'alpaca_paper';

  // Get general market data (from Polygon) when no broker selected
  const { price: polygonPrice, loading: polygonLoading, error: polygonError } = useLatestPrice(
    !useBrokerData && formData.symbol ? formData.symbol : null
  );

  // Get broker-specific data (from Alpaca) when Alpaca is selected
  const { quote: alpacaQuote, loading: alpacaLoading, error: alpacaError } = useBrokerQuote(
    useBrokerData && formData.symbol ? formData.symbol : null,
    formData.source
  );

  // Determine which price to show
  const currentPrice = useBrokerData ? alpacaQuote?.price : polygonPrice;
  const priceLoading = useBrokerData ? alpacaLoading : polygonLoading;
  const priceError = useBrokerData ? alpacaError : polygonError;
  const bidPrice = useBrokerData ? alpacaQuote?.bid : undefined;
  const askPrice = useBrokerData ? alpacaQuote?.ask : undefined;
  const spread = bidPrice && askPrice ? (askPrice - bidPrice) : undefined;

  const { isValid: symbolValid, loading: validationLoading } = useSymbolValidation(formData.symbol || null);

  // Mock broker connection status - in production, this would come from your API/context
  const brokerConnections = {
    alpaca_live: false, // Not connected for safety in demo
    alpaca_paper: true, // Connected for testing
  };

  // Fetch strategies when modal opens
  useEffect(() => {
    if (isOpen) {
      setStrategiesLoading(true);
      fetch('/api/strategies')
        .then(res => res.json())
        .then(data => {
          setStrategies(data);
          setStrategiesLoading(false);
        })
        .catch(err => {
          console.error('Failed to fetch strategies:', err);
          setStrategiesLoading(false);
        });
    }
  }, [isOpen]);

  // Update symbol search when modal opens with prefilled symbol
  useEffect(() => {
    if (prefilledSymbol) {
      setSymbolSearch(prefilledSymbol);
      setFormData(prev => ({ ...prev, symbol: prefilledSymbol }));
    }
  }, [prefilledSymbol]);

  // Update search query when symbol search changes
  useEffect(() => {
    setSearchQuery(symbolSearch);
  }, [symbolSearch, setSearchQuery]);

  // Auto-fill limit price with current market price
  useEffect(() => {
    if (formData.orderType === 'limit' && currentPrice && !formData.limitPrice) {
      setFormData(prev => ({ ...prev, limitPrice: currentPrice }));
    }
  }, [formData.orderType, currentPrice, formData.limitPrice]);

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

  const handleNextStep = () => {
    if (currentStep === 1) {
      // Validate step 1
      if (!formData.symbol || !formData.strategyId) {
        return; // Show error
      }
      setCurrentStep(2);
    }
  };

  const handlePreviousStep = () => {
    if (currentStep === 2) {
      setCurrentStep(1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // If we're on step 1, move to step 2
    if (currentStep === 1) {
      handleNextStep();
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit(formData);
      // Reset form
      setFormData({
        symbol: '',
        side: 'buy',
        orderType: 'market',
        quantity: 0,
        timeInForce: 'day',
        source: undefined as any
      });
      setSymbolSearch('');
      setCurrentStep(1);
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

  if (!isOpen) return null;

  const canProceedStep1 = formData.symbol && formData.strategyId && formData.source;

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-lg max-w-7xl w-full h-[85vh] overflow-hidden flex flex-col lg:flex-row">
        {/* Left Side - Chart Area (2/3 on desktop, full width on mobile) */}
        <div className="w-full lg:w-2/3 p-6 border-b lg:border-b-0 lg:border-r dark:border-slate-700 border-gray-200 flex flex-col">
          {formData.symbol ? (
            <LocalChart
              symbol={formData.symbol}
              fullHeight={true}
              stopLoss={formData.stopLoss}
              takeProfit={formData.takeProfit}
              onStopLossChange={(price) => setFormData({ ...formData, stopLoss: price })}
              onTakeProfitChange={(price) => setFormData({ ...formData, takeProfit: price })}
            />
          ) : (
            <div
              className="flex-1 min-h-[400px] flex items-center justify-center rounded-lg"
              style={{
                backgroundColor: typeof window !== 'undefined' && document.documentElement.classList.contains('dark')
                  ? 'rgba(148, 163, 184, 0.03)' // Light tint in dark mode (same as chart)
                  : 'rgba(15, 23, 42, 0.03)' // Dark tint in light mode (same as chart)
              }}
            >
              <div className="text-center">
                <svg className="w-20 h-20 mx-auto mb-4 dark:text-gray-600 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <p className="text-lg font-medium dark:text-white text-gray-900 mb-2">
                  Select a Symbol
                </p>
                <p className="text-sm dark:text-gray-400 text-gray-600">
                  Chart will appear once you select a symbol
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Right Side - Form (1/3 on desktop, full width on mobile) */}
        <div className="w-full lg:w-1/3 p-6 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold dark:text-white text-gray-900">
              New Position
            </h2>
            <button
              onClick={onClose}
              className="p-1 rounded hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
            >
              <svg className="w-5 h-5 dark:text-gray-400 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-6">
            <div className="flex items-center gap-3">
              <div className={cn(
                "flex items-center justify-center w-8 h-8 rounded-full font-medium text-sm",
                currentStep >= 1
                  ? "bg-indigo-500 text-white"
                  : "bg-gray-200 dark:bg-slate-700 text-gray-500 dark:text-gray-400"
              )}>
                {currentStep > 1 ? <Check className="w-4 h-4" /> : "1"}
              </div>
              <div className={cn(
                "w-20 h-1 rounded",
                currentStep >= 2
                  ? "bg-indigo-500"
                  : "bg-gray-200 dark:bg-slate-700"
              )} />
              <div className={cn(
                "flex items-center justify-center w-8 h-8 rounded-full font-medium text-sm",
                currentStep >= 2
                  ? "bg-indigo-500 text-white"
                  : "bg-gray-200 dark:bg-slate-700 text-gray-500 dark:text-gray-400"
              )}>
                2
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-y-auto">
          <div className="flex-1 overflow-y-auto">
            {/* Step 1: Source, Symbol, and Strategy */}
            {currentStep === 1 && (
              <div className="space-y-6 pb-4">
              {/* Source Selection Cards - Moved to top */}
              <div>
                <label className="block text-sm font-medium dark:text-gray-300 text-gray-700 mb-3">
                  How will you execute this position?
                </label>
                <div className="grid grid-cols-3 gap-3 items-stretch">
                  {/* Alpaca Live Trading Card */}
                  <Tooltip
                    content={
                      <div>
                        <div className="text-sm font-semibold mb-1">Alpaca Live Trading</div>
                        <div className="text-sm font-normal text-gray-400 dark:text-gray-500">
                          {brokerConnections.alpaca_live ? (
                            <>
                              <span className="text-green-500 dark:text-green-400 font-semibold">✓ Connected</span>
                              <br />
                              TrendDojo creates real trades in your account at this broker
                              <br />
                              using real money.
                            </>
                          ) : (
                            <>
                              <span className="text-amber-500 dark:text-amber-400 font-semibold">⚠ Not connected</span>
                              <br />
                              TrendDojo creates real trades in your account at this broker using real money. Connect your Alpaca account in the Brokers section to enable.
                            </>
                          )}
                        </div>
                      </div>
                    }
                    position="bottom"
                    arrow
                    maxWidth={250}
                    wrapperClassName="block"
                  >
                    <button
                      type="button"
                      onClick={() => brokerConnections.alpaca_live && setFormData({ ...formData, source: 'alpaca_live' })}
                      disabled={!brokerConnections.alpaca_live}
                      className={cn(
                        "p-4 rounded-lg border-2 transition-all text-left relative w-full h-full flex items-center justify-center min-h-[80px]",
                        formData.source === 'alpaca_live'
                          ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20"
                          : !brokerConnections.alpaca_live
                          ? "border-gray-200 dark:border-slate-700 opacity-50 cursor-not-allowed"
                          : "border-gray-200 dark:border-slate-600 hover:border-gray-300 dark:hover:border-slate-500"
                      )}
                    >
                      <div className="flex flex-col items-center text-center space-y-1">
                        <Zap className={cn(
                          "w-6 h-6",
                          formData.source === 'alpaca_live'
                            ? "text-indigo-500"
                            : !brokerConnections.alpaca_live
                            ? "text-gray-400 dark:text-gray-500"
                            : "text-gray-600 dark:text-gray-400"
                        )} />
                        <div>
                          <p className={cn(
                            "font-semibold text-sm",
                            formData.source === 'alpaca_live'
                              ? "text-indigo-600 dark:text-indigo-400"
                              : "dark:text-white text-gray-900"
                          )}>
                            Alpaca Live
                          </p>
                        </div>
                      </div>
                    </button>
                  </Tooltip>

                  {/* Alpaca Paper Trading Card */}
                  <Tooltip
                    content={
                      <div>
                        <div className="text-sm font-semibold mb-1">Alpaca Paper Trading</div>
                        <div className="text-sm font-normal text-gray-400 dark:text-gray-500">
                          {brokerConnections.alpaca_paper ? (
                            <>
                              <span className="text-green-500 dark:text-green-400 font-semibold">✓ Connected</span>
                              <br />
                              TrendDojo creates simulated trades at this broker using real market data. No risk to your capital.
                            </>
                          ) : (
                            <>
                              <span className="text-amber-500 dark:text-amber-400 font-semibold">⚠ Not connected</span>
                              <br />
                              TrendDojo creates simulated trades using real market data. Connect your Alpaca account in the Brokers section to enable.
                            </>
                          )}
                        </div>
                      </div>
                    }
                    position="bottom"
                    arrow
                    maxWidth={250}
                    wrapperClassName="block"
                  >
                    <button
                      type="button"
                      onClick={() => brokerConnections.alpaca_paper && setFormData({ ...formData, source: 'alpaca_paper' })}
                      disabled={!brokerConnections.alpaca_paper}
                      className={cn(
                        "p-4 rounded-lg border-2 transition-all text-left relative w-full h-full flex items-center justify-center min-h-[80px]",
                        formData.source === 'alpaca_paper'
                          ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20"
                          : !brokerConnections.alpaca_paper
                          ? "border-gray-200 dark:border-slate-700 opacity-50 cursor-not-allowed"
                          : "border-gray-200 dark:border-slate-600 hover:border-gray-300 dark:hover:border-slate-500"
                      )}
                    >
                      <div className="flex flex-col items-center text-center space-y-1">
                        <Layers className={cn(
                          "w-6 h-6",
                          formData.source === 'alpaca_paper'
                            ? "text-indigo-500"
                            : !brokerConnections.alpaca_paper
                            ? "text-gray-400 dark:text-gray-500"
                            : "text-gray-600 dark:text-gray-400"
                        )} />
                        <div>
                          <p className={cn(
                            "font-semibold text-sm",
                            formData.source === 'alpaca_paper'
                              ? "text-indigo-600 dark:text-indigo-400"
                              : "dark:text-white text-gray-900"
                          )}>
                            Alpaca Paper
                          </p>
                        </div>
                      </div>
                    </button>
                  </Tooltip>

                  {/* External Broker Card */}
                  <Tooltip
                    content={
                      <div>
                        <div className="text-sm font-semibold mb-1">External Broker Tracking</div>
                        <div className="text-sm font-normal text-gray-400 dark:text-gray-500">Manually record trades made at TD Ameritrade, E*TRADE, Robinhood, or any other broker.</div>
                      </div>
                    }
                    position="bottom"
                    arrow
                    maxWidth={250}
                    wrapperClassName="block"
                  >
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, source: 'external' })}
                      className={cn(
                        "p-4 rounded-lg border-2 transition-all text-left w-full h-full flex items-center justify-center min-h-[80px]",
                        formData.source === 'external'
                          ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20"
                          : "border-gray-200 dark:border-slate-600 hover:border-gray-300 dark:hover:border-slate-500"
                      )}
                    >
                      <div className="flex flex-col items-center text-center space-y-1">
                        <Hand className={cn(
                          "w-6 h-6",
                          formData.source === 'external'
                            ? "text-indigo-500"
                            : "text-gray-600 dark:text-gray-400"
                        )} />
                        <div>
                          <p className={cn(
                            "font-semibold text-sm",
                            formData.source === 'external'
                              ? "text-indigo-600 dark:text-indigo-400"
                              : "dark:text-white text-gray-900"
                          )}>
                            External Broker
                          </p>
                        </div>
                      </div>
                    </button>
                  </Tooltip>
                </div>

                {/* External Broker Name Input */}
                {formData.source === 'external' && (
                  <input
                    type="text"
                    value={formData.externalBroker || ''}
                    onChange={(e) => setFormData({ ...formData, externalBroker: e.target.value })}
                    placeholder="Broker name (e.g., TD Ameritrade, E*TRADE, Robinhood...)"
                    className="mt-3 w-full px-3 py-2 rounded-lg border dark:border-slate-600 border-gray-300 dark:bg-slate-700 bg-white dark:text-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                )}
              </div>

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
                          {searchLoading ? 'Searching...' : 'Search Results'}
                        </div>
                        {searchLoading ? (
                          <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                            Loading...
                          </div>
                        ) : searchResults.length > 0 ? (
                          searchResults.map(symbol => (
                            <button
                              key={symbol}
                              type="button"
                              onClick={() => handleSymbolSelect(symbol)}
                              className="w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-slate-700"
                            >
                              <span className="font-medium dark:text-white">{symbol}</span>
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

              {/* Long/Short Toggle */}
              <div>
                <label className="block text-sm font-medium dark:text-gray-300 text-gray-700 mb-1">
                  Position Direction <span className="text-red-500">*</span>
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
                    Long
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
                    Short
                  </button>
                </div>
              </div>

              {/* Strategy Selection */}
              <div>
                <label className="block text-sm font-medium dark:text-gray-300 text-gray-700 mb-1">
                  Strategy <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.strategyId || ''}
                  onChange={(e) => setFormData({ ...formData, strategyId: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border dark:border-slate-600 border-gray-300 dark:bg-slate-700 bg-white dark:text-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                  disabled={strategiesLoading}
                >
                  <option value="">
                    {strategiesLoading ? 'Loading strategies...' : strategies.length === 0 ? 'No strategies available' : 'Select a strategy...'}
                  </option>
                  {strategies
                    .filter(s => s.status !== 'closed')
                    .map(strategy => (
                      <option key={strategy.id} value={strategy.id}>
                        {strategy.name}
                      </option>
                    ))}
                </select>

                {!strategiesLoading && strategies.length === 0 && (
                  <div className={cn(alertStyles.base, alertStyles.warning, "mt-2")}>
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <div className="text-sm">
                      <p className="font-medium">No strategies found</p>
                      <p className="text-xs mt-1 opacity-90">You need to create a strategy before adding positions. Visit the Strategies page to create one.</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Target Entry and Exit Prices */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium dark:text-gray-300 text-gray-700 mb-1">
                    Target Entry Price
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.limitPrice || ''}
                    onChange={(e) => setFormData({ ...formData, limitPrice: e.target.value ? parseFloat(e.target.value) : undefined })}
                    placeholder="0.00"
                    className="w-full px-3 py-2 rounded-lg border dark:border-slate-600 border-gray-300 dark:bg-slate-700 bg-white dark:text-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium dark:text-gray-300 text-gray-700 mb-1">
                    Target Exit Price
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.takeProfit || ''}
                    onChange={(e) => setFormData({ ...formData, takeProfit: e.target.value ? parseFloat(e.target.value) : undefined })}
                    placeholder="0.00"
                    className="w-full px-3 py-2 rounded-lg border dark:border-slate-600 border-gray-300 dark:bg-slate-700 bg-white dark:text-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              </div>
            )}

            {/* Step 2: Trade Details */}
            {currentStep === 2 && (
              <div className="space-y-4 pb-4">
              {/* Current Market Price Display */}
              {formData.symbol && (
                <div className={cn(
                  alertStyles.base,
                  "mb-4",
                  useBrokerData
                    ? alertStyles.background.success
                    : "bg-gray-50 dark:bg-slate-800"
                )}>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="text-xs uppercase mb-1">
                        {useBrokerData ? (
                          <span className="flex items-center gap-1 text-success">
                            <span className="text-xs">●</span>
                            {formData.source === 'alpaca_paper' ? 'Alpaca Paper Quote' : 'Alpaca Live Quote'}
                          </span>
                        ) : (
                          <span className="text-gray-500 dark:text-gray-400">Market Price (Polygon)</span>
                        )}
                      </div>
                      <div className="text-2xl font-bold dark:text-white text-gray-900">
                        {priceLoading ? (
                          <span className="text-gray-500 text-lg">Loading...</span>
                        ) : currentPrice ? (
                          `$${currentPrice.toFixed(2)}`
                        ) : (
                          <span className="text-gray-500 text-lg">--</span>
                        )}
                      </div>
                      {/* Show bid/ask spread for Alpaca */}
                      {useBrokerData && !priceLoading && bidPrice && askPrice && (
                        <div className="mt-2 grid grid-cols-3 gap-3 text-sm">
                          <div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">Bid</div>
                            <div className="font-semibold text-success">
                              ${bidPrice.toFixed(2)}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">Ask</div>
                            <div className="font-semibold text-danger">
                              ${askPrice.toFixed(2)}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">Spread</div>
                            <div className="font-semibold dark:text-gray-300 text-gray-700">
                              ${spread?.toFixed(2)}
                            </div>
                          </div>
                        </div>
                      )}
                      {!useBrokerData && formData.symbol && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Select Alpaca to see live bid/ask prices
                        </div>
                      )}
                    </div>
                    {!symbolValid && formData.symbol && !validationLoading && (
                      <div className="flex items-center gap-2 text-yellow-500 text-sm">
                        <AlertCircle className="w-4 h-4" />
                        <span>Symbol not found</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

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
                    placeholder={currentPrice ? currentPrice.toFixed(2) : "150.00"}
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

              {/* Fees and Commissions for External Positions */}
              {formData.source === 'external' && (
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

                {/* Target Price */}
                <div>
                  <label className="block text-sm dark:text-gray-400 text-gray-600 mb-1">
                    Target Price
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

              {/* Notes */}
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
              </div>
            )}
          </div>

          {/* Action Buttons - Always at bottom */}
          <div className="flex gap-3 pt-4 mt-auto border-t dark:border-slate-700 border-gray-200">
            {currentStep === 2 && (
              <Button
                type="button"
                variant="secondary"
                onClick={handlePreviousStep}
                className="flex-1 flex items-center justify-center"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                <span>Back</span>
              </Button>
            )}
            {currentStep === 1 && (
              <Button
                type="button"
                variant="secondary"
                onClick={onClose}
                className="flex-1"
              >
                Cancel
              </Button>
            )}
            {currentStep === 1 ? (
              <Button
                type="button"
                variant="primary"
                disabled={!canProceedStep1}
                onClick={handleNextStep}
                className="flex-1 flex items-center justify-center"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Button
                type="submit"
                variant={formData.side === 'buy' ? 'success' : 'danger'}
                disabled={isSubmitting || !formData.symbol || !formData.quantity}
                className="flex-1"
              >
                {isSubmitting ? 'Placing Order...' : `${formData.side === 'buy' ? 'Long' : 'Short'} ${formData.symbol || 'Symbol'}`}
              </Button>
            )}
          </div>
          </form>
        </div>
      </div>
    </div>
  );
}