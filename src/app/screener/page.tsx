"use client";

import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageContent } from "@/components/layout/PageContent";
import { Card } from "@/components/ui/Panel";
import { Button } from "@/components/ui/Button";
import { Dropdown } from "@/components/ui/Dropdown";
import { Pill } from "@/components/ui/Pill";
import { ScreenerFilterService, DEFAULT_FILTERS, type ScreenerFilter } from "@/lib/screener-filters";
import { YahooFinanceService, type StockQuote } from "@/lib/market-data/yahoo-finance";

interface Stock {
  symbol: string;
  name: string;
  sector: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number;
  pe: number;
  weekHigh52: number;
  weekLow52: number;
  avgVolume: number;
  rsi: number;
  movingAvg50: number;
  movingAvg200: number;
  signal?: string;
}

// Helper to check if filter has property
function hasFilterProperty(filter: any, prop: string): boolean {
  return filter && prop in filter;
}

// Helper function to format time ago
function getTimeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  
  if (seconds < 60) {
    return 'just now';
  } else if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60);
    return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
  } else if (seconds < 86400) {
    const hours = Math.floor(seconds / 3600);
    return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
  } else {
    const days = Math.floor(seconds / 86400);
    return `${days} ${days === 1 ? 'day' : 'days'} ago`;
  }
}

export default function ScreenerPage() {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [filteredStocks, setFilteredStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [filters, setFilters] = useState({
    search: "",
    sector: "all",
    minPrice: "",
    maxPrice: "",
    minVolume: "",
    minMarketCap: "",
    minChange: "",
    maxPE: "",
    signal: "all", // all, bullish, bearish, overbought, oversold
  });
  const [sortBy, setSortBy] = useState("changePercent");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [selectedStocks, setSelectedStocks] = useState<Set<string>>(new Set());
  const [savedFilters, setSavedFilters] = useState<ScreenerFilter[]>([]);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [filterName, setFilterName] = useState("");
  const [filterDescription, setFilterDescription] = useState("");
  const [activeFilters, setActiveFilters] = useState<Array<{
    id: string;
    type: 'preset' | 'custom';
    label: string;
    value?: any;
    filter?: Partial<typeof filters> | { subsector: string };
  }>>([]);
  const [showPresetsDropdown, setShowPresetsDropdown] = useState(false);
  const [showCustomDropdown, setShowCustomDropdown] = useState(false);
  const [showProviderDropdown, setShowProviderDropdown] = useState(false);
  const [showMarketsDropdown, setShowMarketsDropdown] = useState(false);
  const [expandedSectors, setExpandedSectors] = useState<Set<string>>(new Set());
  const [selectedSectors, setSelectedSectors] = useState<Set<string>>(new Set());
  const [presetsTab, setPresetsTab] = useState<'custom' | 'library'>('library');
  const [filtersTab, setFiltersTab] = useState<'price-volume' | 'technical' | 'fundamentals'>('price-volume');

  // Fetch market data and load saved filters on component mount
  useEffect(() => {
    fetchMarketData();
    loadSavedFilters();
    
    // Refresh data every 60 seconds
    const interval = setInterval(fetchMarketData, 60000);
    
    return () => clearInterval(interval);
  }, []);

  const loadSavedFilters = () => {
    const filters = ScreenerFilterService.getLocalFilters();
    setSavedFilters(filters);
  };

  const applyPreset = (preset: ScreenerFilter) => {
    const presetId = `preset-${preset.id || preset.name}-${Date.now()}`;
    const newFilter = {
      id: presetId,
      type: 'preset' as const,
      label: preset.name,
      filter: preset.filters
    };
    
    setActiveFilters([...activeFilters, newFilter]);
    
    // Apply the preset's filters
    const newFilters = { ...filters };
    if (preset.filters.search) newFilters.search = preset.filters.search;
    if (preset.filters.sector && preset.filters.sector !== 'all') newFilters.sector = preset.filters.sector;
    if (preset.filters.minPrice) newFilters.minPrice = preset.filters.minPrice;
    if (preset.filters.maxPrice) newFilters.maxPrice = preset.filters.maxPrice;
    if (preset.filters.minVolume) newFilters.minVolume = preset.filters.minVolume;
    if (preset.filters.minMarketCap) newFilters.minMarketCap = preset.filters.minMarketCap;
    if (preset.filters.minChange) newFilters.minChange = preset.filters.minChange;
    if (preset.filters.maxPE) newFilters.maxPE = preset.filters.maxPE;
    if (preset.filters.signal && preset.filters.signal !== 'all') newFilters.signal = preset.filters.signal;
    
    setFilters(newFilters);
    
    if (preset.sortBy) setSortBy(preset.sortBy);
    if (preset.sortOrder) setSortOrder(preset.sortOrder);
    
    ScreenerFilterService.saveRecentFilter(preset);
    setShowPresetsDropdown(false);
  };
  
  const addCustomFilter = (type: string, label: string, value: any) => {
    const filterId = `custom-${type}-${Date.now()}`;
    
    // Handle complex filter objects (like price ranges and market cap)
    let filterUpdate = {};
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      // For objects, spread the properties into the filters
      filterUpdate = { ...value };
    } else {
      // For simple values, use the type as key
      filterUpdate = { [type]: value };
    }
    
    const newFilter = {
      id: filterId,
      type: 'custom' as const,
      label,
      value,
      filter: filterUpdate
    };
    
    setActiveFilters([...activeFilters, newFilter]);
    setFilters({ ...filters, ...filterUpdate });
    setShowCustomDropdown(false);
  };
  
  const removeFilter = (filterId: string) => {
    const filterToRemove = activeFilters.find(f => f.id === filterId);
    if (!filterToRemove) return;
    
    setActiveFilters(activeFilters.filter(f => f.id !== filterId));
    
    // Reset the specific filter values
    if (filterToRemove.filter) {
      const resetFilters = { ...filters };
      Object.keys(filterToRemove.filter).forEach(key => {
        if (key === 'search') resetFilters.search = '';
        else if (key === 'sector' || key === 'signal') resetFilters[key as keyof typeof filters] = 'all';
        else resetFilters[key as keyof typeof filters] = '';
      });
      setFilters(resetFilters);
    }
  };
  
  const clearAllFilters = () => {
    setActiveFilters([]);
    setFilters({
      search: "",
      sector: "all",
      minPrice: "",
      maxPrice: "",
      minVolume: "",
      minMarketCap: "",
      minChange: "",
      maxPE: "",
      signal: "all",
    });
  };

  const saveCurrentFilter = () => {
    if (!filterName.trim()) return;
    
    const newFilter: ScreenerFilter = {
      name: filterName,
      description: filterDescription,
      filters: { ...filters },
      sortBy,
      sortOrder,
    };
    
    ScreenerFilterService.saveToLocal(newFilter);
    loadSavedFilters();
    setShowSaveDialog(false);
    setFilterName("");
    setFilterDescription("");
  };

  const deleteFilter = (filterId: string) => {
    ScreenerFilterService.deleteFilter(filterId);
    loadSavedFilters();
  };

  const fetchMarketData = async () => {
    const startTime = Date.now();
    try {
      setLoading(true);
      setError(null);
      
      // For now, use mock data from Yahoo Finance service
      // In production, this would fetch real data from Yahoo Finance API
      const mockQuotes = YahooFinanceService.getMockQuotes();
      
      // Convert StockQuote to Stock interface
      const stockData: Stock[] = mockQuotes.map(quote => ({
        symbol: quote.symbol,
        name: quote.name,
        sector: quote.sector || 'Unknown',
        price: quote.price,
        change: quote.change,
        changePercent: quote.changePercent,
        volume: quote.volume,
        marketCap: quote.marketCap || 0,
        pe: quote.pe || 0,
        weekHigh52: quote.fiftyTwoWeekHigh || quote.price * 1.2,
        weekLow52: quote.fiftyTwoWeekLow || quote.price * 0.8,
        avgVolume: quote.volume || 0,
        rsi: Math.floor(Math.random() * 70) + 15, // Random RSI between 15-85
        movingAvg50: quote.price * (0.95 + Math.random() * 0.1), // Random MA50 near price
        movingAvg200: quote.price * (0.9 + Math.random() * 0.2), // Random MA200 near price
        signal: Math.random() > 0.5 ? 'Buy' : Math.random() > 0.5 ? 'Hold' : 'Sell',
      }));
      
      setStocks(stockData);
      setLastUpdate(new Date());
    } catch (err) {
      console.error('Error fetching market data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch market data');
      // Keep existing data if fetch fails
    } finally {
      // Ensure minimum loading time of 350ms for better UX
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 350 - elapsed);
      
      setTimeout(() => {
        setLoading(false);
      }, remaining);
    }
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.dropdown-container')) {
        setShowPresetsDropdown(false);
        setShowCustomDropdown(false);
        setShowProviderDropdown(false);
        setShowMarketsDropdown(false);
      }
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Apply filters and sorting
  useEffect(() => {
    let filtered = [...stocks];

    // Search filter
    if (filters.search) {
      filtered = filtered.filter(stock => 
        stock.symbol.toLowerCase().includes(filters.search.toLowerCase()) ||
        stock.name.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    // Sector filter
    if (filters.sector !== "all") {
      filtered = filtered.filter(stock => stock.sector === filters.sector);
    }

    // Price filters
    if (filters.minPrice) {
      filtered = filtered.filter(stock => stock.price >= parseFloat(filters.minPrice));
    }
    if (filters.maxPrice) {
      filtered = filtered.filter(stock => stock.price <= parseFloat(filters.maxPrice));
    }

    // Volume filter
    if (filters.minVolume) {
      filtered = filtered.filter(stock => stock.volume >= parseFloat(filters.minVolume));
    }

    // Market cap filter
    if (filters.minMarketCap) {
      filtered = filtered.filter(stock => stock.marketCap >= parseFloat(filters.minMarketCap) * 1000000000);
    }

    // Change filter
    if (filters.minChange) {
      filtered = filtered.filter(stock => stock.changePercent >= parseFloat(filters.minChange));
    }

    // PE filter
    if (filters.maxPE) {
      filtered = filtered.filter(stock => stock.pe <= parseFloat(filters.maxPE));
    }

    // Technical signals
    if (filters.signal !== "all") {
      switch (filters.signal) {
        case "bullish":
          filtered = filtered.filter(stock => stock.price > stock.movingAvg50);
          break;
        case "bearish":
          filtered = filtered.filter(stock => stock.price < stock.movingAvg50);
          break;
        case "overbought":
          filtered = filtered.filter(stock => stock.rsi > 70);
          break;
        case "oversold":
          filtered = filtered.filter(stock => stock.rsi < 30);
          break;
      }
    }

    // Sorting
    filtered.sort((a, b) => {
      const aVal = a[sortBy as keyof typeof a] as number;
      const bVal = b[sortBy as keyof typeof b] as number;
      return sortOrder === "asc" ? aVal - bVal : bVal - aVal;
    });

    setFilteredStocks(filtered);
  }, [stocks, filters, sortBy, sortOrder]);

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
  };

  const toggleStockSelection = (symbol: string) => {
    const newSelected = new Set(selectedStocks);
    if (newSelected.has(symbol)) {
      newSelected.delete(symbol);
    } else {
      newSelected.add(symbol);
    }
    setSelectedStocks(newSelected);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000000) return `${(num / 1000000000).toFixed(1)}B`;
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toFixed(0);
  };

  return (
    <AppLayout>
      <PageContent>
        <div className="space-y-6 relative">
          {/* Header */}
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold dark:text-white text-gray-900">Stock Screener</h1>
              
              {/* Data Source Selector - Inline with title */}
              <div className="relative dropdown-container z-[80]">
                <Button 
                  variant="secondary" 
                  size="sm" 
                  className="flex items-center gap-2"
                  onClick={() => {
                    setShowProviderDropdown(!showProviderDropdown);
                    setShowPresetsDropdown(false);
                    setShowCustomDropdown(false);
                  }}
                >
                  {/* Yahoo Finance Logo */}
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18.6 3L12 13.5L5.4 3H0L9.3 16.5L6 21H11.4L12 20.1L12.6 21H18L14.7 16.5L24 3H18.6Z" fill="#7B3FF2"/>
                  </svg>
                  <span>Yahoo Finance</span>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </Button>
                
                {/* Dropdown Menu */}
                <Dropdown
                  isOpen={showProviderDropdown}
                  onClose={() => setShowProviderDropdown(false)}
                  width="md"
                  position="left"
                  className="py-2"
                >
                    <button className="w-full flex items-center gap-3 px-4 py-3 pr-6 bg-indigo-50 dark:bg-indigo-950/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M18.6 3L12 13.5L5.4 3H0L9.3 16.5L6 21H11.4L12 20.1L12.6 21H18L14.7 16.5L24 3H18.6Z" fill="#7B3FF2"/>
                      </svg>
                      <span className="text-base font-bold dark:text-white text-gray-900">Yahoo Finance</span>
                      <div className="ml-auto flex items-center gap-1">
                        <svg className="w-5 h-5 text-gray-900 dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-xs dark:text-gray-400 text-gray-600">Free</span>
                      </div>
                    </button>
                    
                    <button className="w-full flex items-center gap-3 px-4 py-3 pr-6 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors opacity-50 cursor-not-allowed">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="#FF5722"/>
                        <path d="M2 17L12 22L22 17" stroke="#FF5722" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M2 12L12 17L22 12" stroke="#FF5722" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span className="text-base font-bold dark:text-gray-400 text-gray-600">Polygon.io</span>
                      <span className="ml-auto text-xs bg-indigo-500/20 text-indigo-400 px-2 py-1 rounded">Pro</span>
                    </button>
                    
                    <button className="w-full flex items-center gap-3 px-4 py-3 pr-6 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors opacity-50 cursor-not-allowed">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM11 19.93C7.05 19.44 4 16.08 4 12C4 11.38 4.08 10.79 4.21 10.21L9 15V16C9 17.1 9.9 18 11 18V19.93ZM17.9 17.39C17.64 16.58 16.9 16 16 16H15V13C15 12.45 14.55 12 14 12H8V10H10C10.55 10 11 9.55 11 9V7H13C14.1 7 15 6.1 15 5V4.59C17.93 5.78 20 8.65 20 12C20 14.08 19.2 15.97 17.9 17.39Z" fill="#00ACC1"/>
                      </svg>
                      <span className="text-base font-bold dark:text-gray-400 text-gray-600 whitespace-nowrap">Alpha Vantage</span>
                      <span className="ml-auto text-xs dark:text-gray-500 text-gray-500">Free</span>
                    </button>
                    
                    <button className="w-full flex items-center gap-3 px-4 py-3 pr-6 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors opacity-50 cursor-not-allowed">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="12" cy="12" r="10" fill="#4CAF50"/>
                        <path d="M8 12L11 15L16 9" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span className="text-base font-bold dark:text-gray-400 text-gray-600">Mock Data</span>
                      <span className="ml-auto text-xs dark:text-gray-500 text-gray-500">Dev</span>
                    </button>
                    
                    <div className="border-t dark:border-slate-700 border-gray-200 mt-2 pt-2">
                      <div className="px-4 py-2">
                        <p className="text-xs dark:text-gray-500 text-gray-500">More sources coming soon</p>
                      </div>
                    </div>
                </Dropdown>
              </div>
            </div>
          </div>
          
          {/* Description line with refresh button */}
          <p className="text-sm dark:text-gray-400 text-gray-600 -mt-4">
            Find trading opportunities with advanced filters
            {lastUpdate && (
              <>
                <span className="ml-2">
                  • Last updated: <span className="font-semibold">{getTimeAgo(lastUpdate)}</span>
                </span>
                <button
                  onClick={fetchMarketData}
                  disabled={loading}
                  className="ml-2 p-1 rounded hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center"
                  title="Refresh data"
                >
                  {loading ? (
                    <svg className="animate-spin h-3.5 w-3.5 text-gray-500 dark:text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <svg className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  )}
                </button>
                <button
                  onClick={fetchMarketData}
                  disabled={loading}
                  className="ml-1 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 underline disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  refresh
                </button>
              </>
            )}
            {error && <span className="ml-2 text-amber-500">• Using mock data</span>}
          </p>

          {/* Filter Dropdowns */}
          <div className="flex items-center justify-between mb-4 relative z-[60]">
            <div className="flex gap-3">
              {/* Presets Dropdown */}
              <div className="relative dropdown-container z-[60]">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setShowPresetsDropdown(!showPresetsDropdown);
                    setShowCustomDropdown(false);
                    setShowMarketsDropdown(false);
                  }}
                  className="flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                  </svg>
                  <span>Presets</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </Button>
                
                <Dropdown
                  isOpen={showPresetsDropdown}
                  onClose={() => setShowPresetsDropdown(false)}
                  width="lg"
                  position="left"
                >
                    {/* Tabs */}
                    <div className="flex bg-gray-100 dark:bg-slate-700 border-b dark:border-slate-600 border-gray-200">
                      <button
                        onClick={() => setPresetsTab('library')}
                        className={`flex-1 px-4 py-2.5 text-sm font-medium transition-all relative ${
                          presetsTab === 'library'
                            ? 'bg-white dark:bg-slate-800 text-gray-900 dark:text-white shadow-sm -mb-[1px] border-b-2 border-indigo-500 rounded-t-md'
                            : 'bg-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                        }`}
                      >
                        Library
                      </button>
                      <button
                        onClick={() => setPresetsTab('custom')}
                        className={`flex-1 px-4 py-2.5 text-sm font-medium transition-all relative ${
                          presetsTab === 'custom'
                            ? 'bg-white dark:bg-slate-800 text-gray-900 dark:text-white shadow-sm -mb-[1px] border-b-2 border-indigo-500 rounded-t-md'
                            : 'bg-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                        }`}
                      >
                        Custom
                      </button>
                    </div>
                    
                    {/* Content */}
                    <div className="max-h-80 overflow-y-auto">
                      {presetsTab === 'library' ? (
                        <>
                          {DEFAULT_FILTERS.map((preset) => (
                            <button
                              key={preset.id || preset.name}
                              onClick={() => applyPreset(preset)}
                              className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors border-b dark:border-slate-700 border-gray-100 last:border-0"
                            >
                              <div className="font-medium dark:text-white text-gray-900">{preset.name}</div>
                              {preset.description && (
                                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">{preset.description}</div>
                              )}
                            </button>
                          ))}
                        </>
                      ) : (
                        <>
                          {savedFilters.filter(f => !f.isDefault).length > 0 ? (
                            savedFilters.filter(f => !f.isDefault).map((preset) => (
                              <button
                                key={preset.id || preset.name}
                                onClick={() => applyPreset(preset)}
                                className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors border-b dark:border-slate-700 border-gray-100 last:border-0"
                              >
                                <div className="flex justify-between items-start">
                                  <div className="flex-1">
                                    <div className="font-medium dark:text-white text-gray-900">{preset.name}</div>
                                    {preset.description && (
                                      <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">{preset.description}</div>
                                    )}
                                  </div>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      ScreenerFilterService.deleteFilter(preset.id!);
                                      setSavedFilters(ScreenerFilterService.getLocalFilters());
                                    }}
                                    className="ml-2 p-1 hover:bg-red-100 dark:hover:bg-red-950/30 rounded transition-colors"
                                  >
                                    <svg className="w-4 h-4 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                  </button>
                                </div>
                              </button>
                            ))
                          ) : (
                            <div className="px-4 py-8 text-center">
                              <p className="text-sm text-gray-500 dark:text-gray-400">No custom filters saved yet</p>
                              <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">Use "Save Filter" to create custom filters</p>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                </Dropdown>
              </div>
              
              {/* Markets Dropdown */}
              <div className="relative dropdown-container z-[60]">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setShowMarketsDropdown(!showMarketsDropdown);
                    setShowPresetsDropdown(false);
                    setShowCustomDropdown(false);
                  }}
                  className="flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                  <span>Markets</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </Button>
                
                <Dropdown
                  isOpen={showMarketsDropdown}
                  onClose={() => {
                    setShowMarketsDropdown(false);
                    // Reset expanded sectors when closing, but only if no subcategories are selected
                    const hasAnySubcategorySelected = activeFilters.some(f => 
                      f.label?.includes('›')
                    );
                    if (!hasAnySubcategorySelected) {
                      setExpandedSectors(new Set());
                    }
                  }}
                  width="lg"
                  position="left"
                >
                  <div className="py-2">
                      {[
                        {
                          name: 'Technology',
                          icon: (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                          ),
                          subcategories: ['Software', 'Hardware', 'Semiconductors', 'Internet Services', 'Cloud Computing', 'Cybersecurity']
                        },
                        {
                          name: 'Healthcare',
                          icon: (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                          ),
                          subcategories: ['Biotech', 'Pharmaceuticals', 'Medical Devices', 'Healthcare Services', 'Diagnostics', 'Health Tech']
                        },
                        {
                          name: 'Financial',
                          icon: (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                            </svg>
                          ),
                          subcategories: ['Banks', 'Insurance', 'Asset Management', 'Fintech', 'Payment Processing', 'REITs']
                        },
                        {
                          name: 'Consumer',
                          icon: (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                          ),
                          subcategories: ['Retail', 'E-commerce', 'Food & Beverage', 'Apparel', 'Entertainment', 'Travel & Leisure']
                        },
                        {
                          name: 'Industrial',
                          icon: (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                          ),
                          subcategories: ['Aerospace & Defense', 'Machinery', 'Transportation', 'Construction', 'Logistics', 'Manufacturing']
                        },
                        {
                          name: 'Energy',
                          icon: (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                          ),
                          subcategories: ['Oil & Gas', 'Renewable Energy', 'Utilities', 'Solar', 'Wind', 'Nuclear']
                        },
                        {
                          name: 'Materials',
                          icon: (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                          ),
                          subcategories: ['Chemicals', 'Mining', 'Steel', 'Paper & Forest', 'Packaging', 'Construction Materials']
                        },
                        {
                          name: 'Real Estate',
                          icon: (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                          ),
                          subcategories: ['REITs', 'Residential', 'Commercial', 'Industrial', 'Retail Properties', 'Real Estate Services']
                        },
                        {
                          name: 'Communications',
                          icon: (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.288 15.038a5.25 5.25 0 017.424 0M5.106 11.856c3.807-3.808 9.98-3.808 13.788 0M1.924 8.674c5.565-5.565 14.587-5.565 20.152 0M12.53 18.22l-.53.53-.53-.53a.75.75 0 011.06 0z" />
                            </svg>
                          ),
                          subcategories: ['Telecom', 'Media', 'Entertainment', 'Publishing', 'Broadcasting', 'Internet Media']
                        },
                        {
                          name: 'Utilities',
                          icon: (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                          ),
                          subcategories: ['Electric', 'Gas', 'Water', 'Multi-Utilities', 'Independent Power', 'Renewable Utilities']
                        }
                      ].map((sector) => {
                        const isSelected = activeFilters.some(f =>
                          f.filter && 'sector' in f.filter && f.filter.sector === sector.name
                        );
                        const hasSubcategorySelected = activeFilters.some(f => f.label?.startsWith(`${sector.name} ›`));
                        
                        return (
                          <div key={sector.name} className={`${
                            isSelected || hasSubcategorySelected
                              ? ""
                              : "border-b dark:border-slate-700 border-gray-100 last:border-0"
                          }`}>
                            <div className={`flex items-center px-4 py-4 transition-colors ${
                              isSelected || hasSubcategorySelected 
                                ? "bg-gray-50 dark:bg-slate-700 border-t border-b dark:border-slate-600 border-gray-200" 
                                : "hover:bg-gray-50 dark:hover:bg-slate-700"
                            }`}>
                              <div
                                onClick={() => {
                                  // If subcategories are selected, don't allow parent selection
                                  if (hasSubcategorySelected) return;
                                  
                                  if (isSelected) {
                                    // Remove the filter
                                    const filterToRemove = activeFilters.find(f =>
                                      f.filter && 'sector' in f.filter && f.filter.sector === sector.name
                                    );
                                    if (filterToRemove) removeFilter(filterToRemove.id);
                                  } else {
                                    // Add the filter
                                    addCustomFilter('sector', sector.name, sector.name);
                                  }
                                }}
                                className="flex-1 flex items-center gap-3 text-left cursor-pointer"
                              >
                                <div className={
                                  isSelected 
                                    ? "text-indigo-500" 
                                    : hasSubcategorySelected 
                                      ? "text-gray-500 dark:text-gray-400"
                                      : "text-gray-500 dark:text-gray-400"
                                }>
                                  {sector.icon}
                                </div>
                                <span className={`text-base ${
                                  isSelected 
                                    ? "font-bold text-gray-900 dark:text-white" 
                                    : hasSubcategorySelected
                                      ? "font-medium text-gray-500 dark:text-gray-400"
                                      : "font-medium text-gray-700 dark:text-gray-300"
                                }`}>
                                  {sector.name}
                                </span>
                              </div>
                              {(isSelected || hasSubcategorySelected) && sector.subcategories.length > 0 && !hasSubcategorySelected && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    const newExpanded = new Set(expandedSectors);
                                    if (expandedSectors.has(sector.name)) {
                                      newExpanded.delete(sector.name);
                                    } else {
                                      newExpanded.add(sector.name);
                                    }
                                    setExpandedSectors(newExpanded);
                                  }}
                                  className="mr-3 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 underline"
                                >
                                  {expandedSectors.has(sector.name) ? 'hide' : 'refine'}
                                </button>
                              )}
                              <input
                                type="checkbox"
                                checked={isSelected && !hasSubcategorySelected}
                                disabled={hasSubcategorySelected}
                                onChange={() => {
                                  // If subcategories are selected, don't allow changes
                                  if (hasSubcategorySelected) return;
                                  
                                  if (isSelected) {
                                    // Remove the filter
                                    const filterToRemove = activeFilters.find(f =>
                                      f.filter && 'sector' in f.filter && f.filter.sector === sector.name
                                    );
                                    if (filterToRemove) removeFilter(filterToRemove.id);
                                  } else {
                                    // Add the filter
                                    addCustomFilter('sector', sector.name, sector.name);
                                  }
                                }}
                                onClick={(e) => e.stopPropagation()}
                                className={`rounded border-gray-300 dark:border-gray-600 dark:bg-slate-700 text-indigo-600 focus:ring-indigo-500 ${
                                  hasSubcategorySelected ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                              />
                            </div>
                            {(expandedSectors.has(sector.name) || hasSubcategorySelected) && sector.subcategories.length > 0 && (
                              <div className="px-4 py-3 bg-gray-100 dark:bg-slate-900/50">
                                <div className="flex flex-wrap gap-2">
                                  <button
                                    onClick={() => {
                                      // Remove ALL subcategory filters for this sector and add parent
                                      const filtersToKeep = activeFilters.filter(f => 
                                        !f.label?.includes(`${sector.name} ›`)
                                      );
                                      
                                      // Check if parent sector is already selected
                                      const parentExists = filtersToKeep.some(f =>
                                        f.filter && 'sector' in f.filter && f.filter.sector === sector.name
                                      );
                                      
                                      if (!parentExists) {
                                        // Create the new parent sector filter
                                        const filterId = `custom-sector-${Date.now()}`;
                                        const newFilter = {
                                          id: filterId,
                                          type: 'custom' as const,
                                          label: sector.name,
                                          value: sector.name,
                                          filter: { sector: sector.name }
                                        };
                                        setActiveFilters([...filtersToKeep, newFilter]);
                                      } else {
                                        setActiveFilters(filtersToKeep);
                                      }
                                      
                                      setFilters({ ...filters, sector: sector.name });
                                    }}
                                  >
                                    <Pill
                                      size="sm"
                                      selected={activeFilters.some(f =>
                                        f.filter && 'sector' in f.filter && f.filter.sector === sector.name
                                      )}
                                    >
                                      All
                                    </Pill>
                                  </button>
                                  {sector.subcategories.map((sub) => {
                                    const isSubSelected = activeFilters.some(f => f.label === `${sector.name} › ${sub}`);
                                    return (
                                      <button
                                        key={sub}
                                        onClick={() => {
                                          if (isSubSelected) {
                                            // Remove this subcategory filter
                                            const filterToRemove = activeFilters.find(f => f.label === `${sector.name} › ${sub}`);
                                            if (filterToRemove) removeFilter(filterToRemove.id);
                                          } else {
                                            // Remove parent sector filter if it exists
                                            const filtersToKeep = activeFilters.filter(f => 
                                              !(f.filter && 'sector' in f.filter && f.filter.sector === sector.name)
                                            );
                                            
                                            // Create the new subcategory filter
                                            const filterId = `custom-subsector-${Date.now()}`;
                                            const newFilter = {
                                              id: filterId,
                                              type: 'custom' as const,
                                              label: `${sector.name} › ${sub}`,
                                              value: sub,
                                              filter: { subsector: sub }
                                            };
                                            
                                            // Add the new subcategory (allowing multiple)
                                            setActiveFilters([...filtersToKeep, newFilter]);
                                            setFilters({ ...filters, sector: 'all' });
                                          }
                                        }}
                                      >
                                        <Pill
                                          size="sm"
                                          selected={isSubSelected}
                                        >
                                          {sub}
                                        </Pill>
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                  </div>
                </Dropdown>
              </div>
              
              {/* Custom Filters Dropdown */}
              <div className="relative dropdown-container z-[60]">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setShowCustomDropdown(!showCustomDropdown);
                    setShowPresetsDropdown(false);
                    setShowMarketsDropdown(false);
                  }}
                  className="flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                  </svg>
                  <span>Custom Filters</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </Button>
                
                <Dropdown
                  isOpen={showCustomDropdown}
                  onClose={() => setShowCustomDropdown(false)}
                  width="xl"
                  position="left"
                >
                    {/* Tabs */}
                    <div className="flex bg-gray-100 dark:bg-slate-700 border-b dark:border-slate-600 border-gray-200">
                      <button
                        onClick={() => setFiltersTab('price-volume')}
                        className={`flex-1 px-3 py-2.5 text-sm font-medium transition-all relative ${
                          filtersTab === 'price-volume'
                            ? 'bg-white dark:bg-slate-800 text-gray-900 dark:text-white shadow-sm -mb-[1px] border-b-2 border-indigo-500 rounded-t-md'
                            : 'bg-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                        }`}
                      >
                        Price & Volume
                      </button>
                      <button
                        onClick={() => setFiltersTab('technical')}
                        className={`flex-1 px-3 py-2.5 text-sm font-medium transition-all relative ${
                          filtersTab === 'technical'
                            ? 'bg-white dark:bg-slate-800 text-gray-900 dark:text-white shadow-sm -mb-[1px] border-b-2 border-indigo-500 rounded-t-md'
                            : 'bg-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                        }`}
                      >
                        Technical
                      </button>
                      <button
                        onClick={() => setFiltersTab('fundamentals')}
                        className={`flex-1 px-3 py-2.5 text-sm font-medium transition-all relative ${
                          filtersTab === 'fundamentals'
                            ? 'bg-white dark:bg-slate-800 text-gray-900 dark:text-white shadow-sm -mb-[1px] border-b-2 border-indigo-500 rounded-t-md'
                            : 'bg-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                        }`}
                      >
                        Fundamentals
                      </button>
                    </div>
                    
                    {/* Content */}
                    <div className="max-h-[500px] overflow-y-auto">
                      {filtersTab === 'price-volume' && (
                        <>
                    {/* Price Filters Section */}
                    <div className="border-b dark:border-slate-700 border-gray-200 p-4">
                      <h4 className="text-sm font-semibold dark:text-white text-gray-900 mb-3">Price Range</h4>
                      <div className="space-y-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => addCustomFilter('priceRange', 'Under $10', { maxPrice: '10' })}
                            className="flex-1 px-3 py-2 text-sm bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-lg transition-colors dark:text-white text-gray-900"
                          >
                            &lt; $10
                          </button>
                          <button
                            onClick={() => addCustomFilter('priceRange', '$10-$50', { minPrice: '10', maxPrice: '50' })}
                            className="flex-1 px-3 py-2 text-sm bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-lg transition-colors dark:text-white text-gray-900"
                          >
                            $10-$50
                          </button>
                          <button
                            onClick={() => addCustomFilter('priceRange', '$50-$100', { minPrice: '50', maxPrice: '100' })}
                            className="flex-1 px-3 py-2 text-sm bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-lg transition-colors dark:text-white text-gray-900"
                          >
                            $50-$100
                          </button>
                          <button
                            onClick={() => addCustomFilter('priceRange', 'Over $100', { minPrice: '100' })}
                            className="flex-1 px-3 py-2 text-sm bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-lg transition-colors dark:text-white text-gray-900"
                          >
                            &gt; $100
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Volume Filters Section */}
                    <div className="border-b dark:border-slate-700 border-gray-200 p-4">
                      <h4 className="text-sm font-semibold dark:text-white text-gray-900 mb-3">Volume</h4>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => addCustomFilter('minVolume', 'Vol > 100K', '100000')}
                          className="px-3 py-2 text-sm bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-lg transition-colors dark:text-white text-gray-900"
                        >
                          &gt; 100K
                        </button>
                        <button
                          onClick={() => addCustomFilter('minVolume', 'Vol > 500K', '500000')}
                          className="px-3 py-2 text-sm bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-lg transition-colors dark:text-white text-gray-900"
                        >
                          &gt; 500K
                        </button>
                        <button
                          onClick={() => addCustomFilter('minVolume', 'Vol > 1M', '1000000')}
                          className="px-3 py-2 text-sm bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-lg transition-colors dark:text-white text-gray-900"
                        >
                          &gt; 1M
                        </button>
                        <button
                          onClick={() => addCustomFilter('minVolume', 'Vol > 10M', '10000000')}
                          className="px-3 py-2 text-sm bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-lg transition-colors dark:text-white text-gray-900"
                        >
                          &gt; 10M
                        </button>
                      </div>
                    </div>

                        </>
                      )}
                      
                      {filtersTab === 'technical' && (
                        <>
                    {/* Price Change Section */}
                    <div className="border-b dark:border-slate-700 border-gray-200 p-4">
                      <h4 className="text-sm font-semibold dark:text-white text-gray-900 mb-3">Price Change %</h4>
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          onClick={() => addCustomFilter('minChange', 'Up > 2%', '2')}
                          className="px-3 py-2 text-sm bg-teal-50 dark:bg-teal-950/30 hover:bg-teal-100 dark:hover:bg-teal-900/40 text-teal-700 dark:text-teal-400 rounded-lg transition-colors"
                        >
                          +2%
                        </button>
                        <button
                          onClick={() => addCustomFilter('minChange', 'Up > 5%', '5')}
                          className="px-3 py-2 text-sm bg-teal-50 dark:bg-teal-950/30 hover:bg-teal-100 dark:hover:bg-teal-900/40 text-teal-700 dark:text-teal-400 rounded-lg transition-colors"
                        >
                          +5%
                        </button>
                        <button
                          onClick={() => addCustomFilter('minChange', 'Up > 10%', '10')}
                          className="px-3 py-2 text-sm bg-teal-50 dark:bg-teal-950/30 hover:bg-teal-100 dark:hover:bg-teal-900/40 text-teal-700 dark:text-teal-400 rounded-lg transition-colors"
                        >
                          +10%
                        </button>
                        <button
                          onClick={() => addCustomFilter('maxChange', 'Down > 2%', '-2')}
                          className="px-3 py-2 text-sm bg-purple-50 dark:bg-purple-950/30 hover:bg-purple-100 dark:hover:bg-purple-900/40 text-purple-700 dark:text-purple-400 rounded-lg transition-colors"
                        >
                          -2%
                        </button>
                        <button
                          onClick={() => addCustomFilter('maxChange', 'Down > 5%', '-5')}
                          className="px-3 py-2 text-sm bg-purple-50 dark:bg-purple-950/30 hover:bg-purple-100 dark:hover:bg-purple-900/40 text-purple-700 dark:text-purple-400 rounded-lg transition-colors"
                        >
                          -5%
                        </button>
                        <button
                          onClick={() => addCustomFilter('maxChange', 'Down > 10%', '-10')}
                          className="px-3 py-2 text-sm bg-purple-50 dark:bg-purple-950/30 hover:bg-purple-100 dark:hover:bg-purple-900/40 text-purple-700 dark:text-purple-400 rounded-lg transition-colors"
                        >
                          -10%
                        </button>
                      </div>
                    </div>

                    {/* RSI Conditions */}
                    <div className="border-b dark:border-slate-700 border-gray-200 p-4">
                      <h4 className="text-sm font-semibold dark:text-white text-gray-900 mb-3">RSI Conditions</h4>
                      <div className="space-y-2">
                        <button
                          onClick={() => addCustomFilter('signal', 'Oversold', 'oversold')}
                          className="w-full px-3 py-2 text-sm text-left bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-lg transition-colors dark:text-white text-gray-900 flex items-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                          </svg>
                          Oversold (RSI &lt; 30)
                        </button>
                        <button
                          onClick={() => addCustomFilter('signal', 'Overbought', 'overbought')}
                          className="w-full px-3 py-2 text-sm text-left bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-lg transition-colors dark:text-white text-gray-900 flex items-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                          </svg>
                          Overbought (RSI &gt; 70)
                        </button>
                      </div>
                    </div>

                    {/* Moving Averages */}
                    <div className="p-4">
                      <h4 className="text-sm font-semibold dark:text-white text-gray-900 mb-3">Moving Averages</h4>
                      <div className="space-y-2">
                        <button
                          onClick={() => addCustomFilter('above50MA', 'Above 50-Day MA', true)}
                          className="w-full px-3 py-2 text-sm text-left bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-lg transition-colors dark:text-white text-gray-900"
                        >
                          Above 50-Day MA
                        </button>
                        <button
                          onClick={() => addCustomFilter('above200MA', 'Above 200-Day MA', true)}
                          className="w-full px-3 py-2 text-sm text-left bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-lg transition-colors dark:text-white text-gray-900"
                        >
                          Above 200-Day MA
                        </button>
                        <button
                          onClick={() => addCustomFilter('volumeAboveAvg', 'Volume Above Average', true)}
                          className="w-full px-3 py-2 text-sm text-left bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-lg transition-colors dark:text-white text-gray-900"
                        >
                          Volume Above Average
                        </button>
                      </div>
                    </div>
                        </>
                      )}
                      
                      {filtersTab === 'fundamentals' && (
                        <>

                    {/* Market Cap Section */}
                    <div className="p-4">
                      <h4 className="text-sm font-semibold dark:text-white text-gray-900 mb-3">Market Cap</h4>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => addCustomFilter('marketCap', 'Micro < $300M', { maxMarketCap: '0.3' })}
                          className="px-3 py-2 text-sm bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-lg transition-colors dark:text-white text-gray-900"
                        >
                          Micro (&lt;$300M)
                        </button>
                        <button
                          onClick={() => addCustomFilter('marketCap', 'Small $300M-$2B', { minMarketCap: '0.3', maxMarketCap: '2' })}
                          className="px-3 py-2 text-sm bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-lg transition-colors dark:text-white text-gray-900"
                        >
                          Small ($300M-$2B)
                        </button>
                        <button
                          onClick={() => addCustomFilter('marketCap', 'Mid $2B-$10B', { minMarketCap: '2', maxMarketCap: '10' })}
                          className="px-3 py-2 text-sm bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-lg transition-colors dark:text-white text-gray-900"
                        >
                          Mid ($2B-$10B)
                        </button>
                        <button
                          onClick={() => addCustomFilter('marketCap', 'Large > $10B', { minMarketCap: '10' })}
                          className="px-3 py-2 text-sm bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-lg transition-colors dark:text-white text-gray-900"
                        >
                          Large (&gt;$10B)
                        </button>
                        <button
                          onClick={() => addCustomFilter('marketCap', 'Mega > $200B', { minMarketCap: '200' })}
                          className="px-3 py-2 text-sm bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-lg transition-colors dark:text-white text-gray-900"
                        >
                          Mega (&gt;$200B)
                        </button>
                      </div>
                    </div>
                        </>
                      )}
                    </div>
                </Dropdown>
              </div>
            </div>
            
            {/* Actions */}
            {activeFilters.length > 0 && (
              <div className="flex gap-2">
                <button
                  onClick={clearAllFilters}
                  className="text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 underline"
                >
                  clear all
                </button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setShowSaveDialog(true)}
                >
                  Save Filter
                </Button>
              </div>
            )}
          </div>

          {/* Active Filters Panel - Only show when filters are active */}
          {activeFilters.length > 0 && (
            <Card className="relative z-10">
              <div className="space-y-4">
                {/* Active Filters Display - Grouped by Type */}
                <div className="space-y-3">
                  {/* Market/Sector filters */}
                  {activeFilters.filter(f => (f.filter && 'sector' in f.filter && f.filter.sector) || f.label?.includes('›')).length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {activeFilters.filter(f => (f.filter && 'sector' in f.filter && f.filter.sector) || f.label?.includes('›')).map((filter) => (
                        <Pill
                          key={filter.id}
                          size="md"
                          variant="default"
                          selected={true}
                          onRemove={() => removeFilter(filter.id)}
                        >
                          {filter.label?.includes('›') ? (
                            <>
                              {filter.label.split('›')[0].trim()} › <strong>{filter.label.split('›')[1].trim()}</strong>
                            </>
                          ) : (
                            <strong>{filter.label}</strong>
                          )}
                        </Pill>
                      ))}
                    </div>
                  )}
                  
                  {/* Technical filters */}
                  {activeFilters.filter(f =>
                    hasFilterProperty(f.filter, 'signal') ||
                    hasFilterProperty(f.filter, 'minChange') ||
                    hasFilterProperty(f.filter, 'maxChange') ||
                    f.label?.includes('MA') ||
                    f.label?.includes('RSI') ||
                    f.label?.includes('Volume')
                  ).length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {activeFilters.filter(f =>
                        hasFilterProperty(f.filter, 'signal') ||
                        hasFilterProperty(f.filter, 'minChange') ||
                        hasFilterProperty(f.filter, 'maxChange') ||
                        f.label?.includes('MA') ||
                        f.label?.includes('RSI') ||
                        f.label?.includes('Volume')
                      ).map((filter) => (
                        <Pill
                          key={filter.id}
                          size="md"
                          variant="secondary"
                          selected={true}
                          onRemove={() => removeFilter(filter.id)}
                        >
                          {filter.label}
                        </Pill>
                      ))}
                    </div>
                  )}
                  
                  {/* Other filters (Price, Market Cap, etc) */}
                  {activeFilters.filter(f => 
                    !(f.filter && 'sector' in f.filter && f.filter.sector) && 
                    !f.label?.includes('›') &&
                    !hasFilterProperty(f.filter, 'signal') &&
                    !hasFilterProperty(f.filter, 'minChange') &&
                    !hasFilterProperty(f.filter, 'maxChange') &&
                    !f.label?.includes('MA') &&
                    !f.label?.includes('RSI') &&
                    !f.label?.includes('Volume')
                  ).length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {activeFilters.filter(f => 
                        !(f.filter && 'sector' in f.filter && f.filter.sector) && 
                        !f.label?.includes('›') &&
                        !hasFilterProperty(f.filter, 'signal') &&
                        !hasFilterProperty(f.filter, 'minChange') &&
                        !hasFilterProperty(f.filter, 'maxChange') &&
                        !f.label?.includes('MA') &&
                        !f.label?.includes('RSI') &&
                        !f.label?.includes('Volume')
                      ).map((filter) => (
                        <Pill
                          key={filter.id}
                          size="md"
                          variant="primary"
                          selected={true}
                          onRemove={() => removeFilter(filter.id)}
                        >
                          {filter.label}
                        </Pill>
                      ))}
                    </div>
                  )}
                </div>

                {/* Results Count and Actions */}
                <div className="flex justify-between items-center pt-3 border-t dark:border-slate-700 border-gray-200">
                  <p className="text-sm dark:text-gray-400 text-gray-600">
                    Found {filteredStocks.length} stocks
                    {selectedStocks.size > 0 && ` • ${selectedStocks.size} selected`}
                  </p>
                  <div className="flex gap-2">
                    {selectedStocks.size > 0 && (
                      <>
                        <Button variant="secondary" size="sm">
                          Add to Watchlist
                        </Button>
                        <Button variant="primary" size="sm">
                          Create Trade Plan
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
              <p className="text-red-500 text-sm">{error}</p>
            </div>
          )}

          {/* Results Table */}
          <Card className="overflow-hidden">
            {loading && stocks.length === 0 ? (
              <div className="p-8 text-center">
                <div className="inline-flex items-center gap-2 dark:text-gray-400 text-gray-600">
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Loading market data...
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="dark:bg-slate-800/50 bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left">
                      <input
                        type="checkbox"
                        className="rounded dark:bg-slate-700 bg-white dark:border-gray-600 border-gray-300 dark:checked:bg-indigo-600 checked:bg-indigo-600 accent-indigo-600"
                        checked={selectedStocks.size === filteredStocks.length && filteredStocks.length > 0}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedStocks(new Set(filteredStocks.map(s => s.symbol)));
                          } else {
                            setSelectedStocks(new Set());
                          }
                        }}
                      />
                    </th>
                    <th 
                      className="px-4 py-3 text-left text-xs font-medium dark:text-gray-400 text-gray-600 uppercase tracking-wider cursor-pointer hover:dark:text-white hover:text-gray-900"
                      onClick={() => handleSort("symbol")}
                    >
                      Symbol
                    </th>
                    <th 
                      className="px-4 py-3 text-left text-xs font-medium dark:text-gray-400 text-gray-600 uppercase tracking-wider cursor-pointer hover:dark:text-white hover:text-gray-900"
                      onClick={() => handleSort("price")}
                    >
                      Price
                    </th>
                    <th 
                      className="px-4 py-3 text-left text-xs font-medium dark:text-gray-400 text-gray-600 uppercase tracking-wider cursor-pointer hover:dark:text-white hover:text-gray-900"
                      onClick={() => handleSort("changePercent")}
                    >
                      Change
                    </th>
                    <th 
                      className="px-4 py-3 text-left text-xs font-medium dark:text-gray-400 text-gray-600 uppercase tracking-wider cursor-pointer hover:dark:text-white hover:text-gray-900"
                      onClick={() => handleSort("volume")}
                    >
                      Volume
                    </th>
                    <th 
                      className="px-4 py-3 text-left text-xs font-medium dark:text-gray-400 text-gray-600 uppercase tracking-wider cursor-pointer hover:dark:text-white hover:text-gray-900"
                      onClick={() => handleSort("marketCap")}
                    >
                      Market Cap
                    </th>
                    <th 
                      className="px-4 py-3 text-left text-xs font-medium dark:text-gray-400 text-gray-600 uppercase tracking-wider cursor-pointer hover:dark:text-white hover:text-gray-900"
                      onClick={() => handleSort("pe")}
                    >
                      P/E
                    </th>
                    <th 
                      className="px-4 py-3 text-left text-xs font-medium dark:text-gray-400 text-gray-600 uppercase tracking-wider cursor-pointer hover:dark:text-white hover:text-gray-900"
                      onClick={() => handleSort("rsi")}
                    >
                      RSI
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium dark:text-gray-400 text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y dark:divide-slate-800 divide-gray-200">
                  {filteredStocks.map((stock) => (
                    <tr 
                      key={stock.symbol}
                      className="hover:dark:bg-slate-800/50 hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          className="rounded dark:bg-slate-700 bg-white dark:border-gray-600 border-gray-300 dark:checked:bg-indigo-600 checked:bg-indigo-600 accent-indigo-600"
                          checked={selectedStocks.has(stock.symbol)}
                          onChange={() => toggleStockSelection(stock.symbol)}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <div className="font-medium dark:text-white text-gray-900">{stock.symbol}</div>
                          <div className="text-xs dark:text-gray-400 text-gray-600">{stock.sector}</div>
                        </div>
                      </td>
                      <td className="px-4 py-3 dark:text-white text-gray-900">
                        ${stock.price.toFixed(2)}
                      </td>
                      <td className="px-4 py-3">
                        <div className={stock.changePercent >= 0 ? "text-teal-500" : "text-purple-500"}>
                          <div>{stock.changePercent >= 0 ? "+" : ""}{stock.changePercent.toFixed(2)}%</div>
                          <div className="text-xs">{stock.change >= 0 ? "+" : ""}${stock.change.toFixed(2)}</div>
                        </div>
                      </td>
                      <td className="px-4 py-3 dark:text-gray-300 text-gray-700">
                        {formatNumber(stock.volume)}
                      </td>
                      <td className="px-4 py-3 dark:text-gray-300 text-gray-700">
                        ${formatNumber(stock.marketCap)}
                      </td>
                      <td className="px-4 py-3 dark:text-gray-300 text-gray-700">
                        {stock.pe.toFixed(1)}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          stock.rsi > 70 ? "bg-purple-500/20 text-purple-500" :
                          stock.rsi < 30 ? "bg-teal-500/20 text-teal-500" :
                          "dark:bg-slate-700 bg-gray-200 dark:text-gray-300 text-gray-700"
                        }`}>
                          {stock.rsi.toFixed(0)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button className="text-xs px-2 py-1 rounded dark:bg-slate-700 bg-gray-200 hover:dark:bg-slate-600 hover:bg-gray-300 dark:text-gray-300 text-gray-700">
                            Chart
                          </button>
                          <button className="text-xs px-2 py-1 rounded dark:bg-slate-700 bg-gray-200 hover:dark:bg-slate-600 hover:bg-gray-300 dark:text-gray-300 text-gray-700">
                            Trade
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            )}
          </Card>
        </div>

        {/* Save Filter Dialog */}
        {showSaveDialog && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-md">
              <div className="p-6 space-y-4">
                <h3 className="text-lg font-semibold dark:text-white text-gray-900">
                  Save Filter Filter
                </h3>
                
                <div>
                  <label className="block text-sm font-medium dark:text-gray-300 text-gray-700 mb-1">
                    Filter Name *
                  </label>
                  <input
                    type="text"
                    value={filterName}
                    onChange={(e) => setFilterName(e.target.value)}
                    placeholder="e.g., High Volume Breakouts"
                    className="w-full px-3 py-2 dark:bg-slate-800 bg-gray-100 rounded-lg dark:text-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    autoFocus
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium dark:text-gray-300 text-gray-700 mb-1">
                    Description (optional)
                  </label>
                  <textarea
                    value={filterDescription}
                    onChange={(e) => setFilterDescription(e.target.value)}
                    placeholder="Describe what this filter looks for..."
                    rows={3}
                    className="w-full px-3 py-2 dark:bg-slate-800 bg-gray-100 rounded-lg dark:text-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  />
                </div>
                
                <div className="flex gap-3 pt-2">
                  <Button
                    variant="primary"
                    onClick={saveCurrentFilter}
                    disabled={!filterName.trim()}
                    className="flex-1"
                  >
                    Save Filter
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setShowSaveDialog(false);
                      setFilterName("");
                      setFilterDescription("");
                    }}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}
      </PageContent>
    </AppLayout>
  );
}