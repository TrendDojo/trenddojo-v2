"use client";

import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageContent } from "@/components/layout/PageContent";
import { Card } from "@/components/ui/Panel";
import { Button } from "@/components/ui/Button";
import { ScreenerFilterService, DEFAULT_FILTERS, type ScreenerFilter } from "@/lib/screener-filters";

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
    filter?: Partial<typeof filters>;
  }>>([]);
  const [showPresetsDropdown, setShowPresetsDropdown] = useState(false);
  const [showCustomDropdown, setShowCustomDropdown] = useState(false);
  const [showProviderDropdown, setShowProviderDropdown] = useState(false);

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
      
      const response = await fetch('/api/market-data/screener');
      if (!response.ok) {
        throw new Error(`Failed to fetch market data: ${response.statusText}`);
      }
      
      const data = await response.json();
      setStocks(data.stocks || []);
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
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold dark:text-white text-gray-900">Stock Screener</h1>
              
              {/* Data Source Selector - Inline with title */}
              <div className="relative dropdown-container">
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
                {showProviderDropdown && (
                  <div className="absolute top-full right-0 mt-1 w-48 py-1 bg-white dark:bg-slate-800 rounded-lg shadow-lg border dark:border-slate-700 border-gray-200 z-10">
                    <button className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M18.6 3L12 13.5L5.4 3H0L9.3 16.5L6 21H11.4L12 20.1L12.6 21H18L14.7 16.5L24 3H18.6Z" fill="#7B3FF2"/>
                      </svg>
                      <span className="text-sm dark:text-gray-300 text-gray-700">Yahoo Finance</span>
                      <span className="ml-auto text-xs dark:text-gray-500 text-gray-500">Free</span>
                    </button>
                    
                    <button className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors opacity-50 cursor-not-allowed">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="#FF5722"/>
                        <path d="M2 17L12 22L22 17" stroke="#FF5722" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M2 12L12 17L22 12" stroke="#FF5722" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span className="text-sm dark:text-gray-300 text-gray-700">Polygon.io</span>
                      <span className="ml-auto text-xs bg-indigo-500/20 text-indigo-400 px-1.5 py-0.5 rounded">Pro</span>
                    </button>
                    
                    <button className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors opacity-50 cursor-not-allowed">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM11 19.93C7.05 19.44 4 16.08 4 12C4 11.38 4.08 10.79 4.21 10.21L9 15V16C9 17.1 9.9 18 11 18V19.93ZM17.9 17.39C17.64 16.58 16.9 16 16 16H15V13C15 12.45 14.55 12 14 12H8V10H10C10.55 10 11 9.55 11 9V7H13C14.1 7 15 6.1 15 5V4.59C17.93 5.78 20 8.65 20 12C20 14.08 19.2 15.97 17.9 17.39Z" fill="#00ACC1"/>
                      </svg>
                      <span className="text-sm dark:text-gray-300 text-gray-700">Alpha Vantage</span>
                      <span className="ml-auto text-xs dark:text-gray-500 text-gray-500">Free</span>
                    </button>
                    
                    <button className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors opacity-50 cursor-not-allowed">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="12" cy="12" r="10" fill="#4CAF50"/>
                        <path d="M8 12L11 15L16 9" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span className="text-sm dark:text-gray-300 text-gray-700">Mock Data</span>
                      <span className="ml-auto text-xs dark:text-gray-500 text-gray-500">Dev</span>
                    </button>
                    
                    <div className="border-t dark:border-slate-700 border-gray-200 mt-1 pt-1">
                      <div className="px-3 py-2">
                        <p className="text-xs dark:text-gray-500 text-gray-500">More sources coming soon</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <Button
              variant="secondary"
              size="sm"
              onClick={fetchMarketData}
              loading={loading}
            >
              Refresh
            </Button>
          </div>
          
          {/* Description line */}
          <p className="text-sm dark:text-gray-400 text-gray-600 -mt-4">
            Find trading opportunities with advanced filters
            {lastUpdate && (
              <span className="ml-2">
                • Last updated: {lastUpdate.toLocaleTimeString()}
              </span>
            )}
            {error && <span className="ml-2 text-amber-500">• Using mock data</span>}
          </p>

          {/* Filter Dropdowns */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex gap-3">
              {/* Presets Dropdown */}
              <div className="relative dropdown-container">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setShowPresetsDropdown(!showPresetsDropdown);
                    setShowCustomDropdown(false);
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
                
                {showPresetsDropdown && (
                  <div className="absolute top-full left-0 mt-2 w-80 max-h-96 overflow-y-auto bg-white dark:bg-slate-800 rounded-lg shadow-lg border dark:border-slate-700 border-gray-200 z-20">
                    {savedFilters.map((preset) => (
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
                  </div>
                )}
              </div>
              
              {/* Custom Filters Dropdown */}
              <div className="relative dropdown-container">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setShowCustomDropdown(!showCustomDropdown);
                    setShowPresetsDropdown(false);
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
                
                {showCustomDropdown && (
                  <div className="absolute top-full left-0 mt-2 w-96 max-h-[600px] overflow-y-auto bg-white dark:bg-slate-800 rounded-lg shadow-xl border dark:border-slate-700 border-gray-200 z-20">
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

                    {/* Price Change Section */}
                    <div className="border-b dark:border-slate-700 border-gray-200 p-4">
                      <h4 className="text-sm font-semibold dark:text-white text-gray-900 mb-3">Price Change %</h4>
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          onClick={() => addCustomFilter('minChange', 'Up > 2%', '2')}
                          className="px-3 py-2 text-sm bg-green-50 dark:bg-green-950/30 hover:bg-green-100 dark:hover:bg-green-900/40 text-green-700 dark:text-green-400 rounded-lg transition-colors"
                        >
                          +2%
                        </button>
                        <button
                          onClick={() => addCustomFilter('minChange', 'Up > 5%', '5')}
                          className="px-3 py-2 text-sm bg-green-50 dark:bg-green-950/30 hover:bg-green-100 dark:hover:bg-green-900/40 text-green-700 dark:text-green-400 rounded-lg transition-colors"
                        >
                          +5%
                        </button>
                        <button
                          onClick={() => addCustomFilter('minChange', 'Up > 10%', '10')}
                          className="px-3 py-2 text-sm bg-green-50 dark:bg-green-950/30 hover:bg-green-100 dark:hover:bg-green-900/40 text-green-700 dark:text-green-400 rounded-lg transition-colors"
                        >
                          +10%
                        </button>
                        <button
                          onClick={() => addCustomFilter('maxChange', 'Down > 2%', '-2')}
                          className="px-3 py-2 text-sm bg-red-50 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-900/40 text-red-700 dark:text-red-400 rounded-lg transition-colors"
                        >
                          -2%
                        </button>
                        <button
                          onClick={() => addCustomFilter('maxChange', 'Down > 5%', '-5')}
                          className="px-3 py-2 text-sm bg-red-50 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-900/40 text-red-700 dark:text-red-400 rounded-lg transition-colors"
                        >
                          -5%
                        </button>
                        <button
                          onClick={() => addCustomFilter('maxChange', 'Down > 10%', '-10')}
                          className="px-3 py-2 text-sm bg-red-50 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-900/40 text-red-700 dark:text-red-400 rounded-lg transition-colors"
                        >
                          -10%
                        </button>
                      </div>
                    </div>

                    {/* Sector Selection */}
                    <div className="border-b dark:border-slate-700 border-gray-200 p-4">
                      <h4 className="text-sm font-semibold dark:text-white text-gray-900 mb-3">Sector</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          'Technology', 'Healthcare', 'Financial', 'Consumer',
                          'Industrial', 'Energy', 'Materials', 'Real Estate',
                          'Utilities', 'Communications', 'Basic Materials', 'Services'
                        ].map((sector) => (
                          <button
                            key={sector}
                            onClick={() => addCustomFilter('sector', sector, sector)}
                            className="px-3 py-2 text-sm text-left bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-lg transition-colors dark:text-white text-gray-900"
                          >
                            {sector}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Market Cap Section */}
                    <div className="border-b dark:border-slate-700 border-gray-200 p-4">
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

                    {/* Technical Signals */}
                    <div className="border-b dark:border-slate-700 border-gray-200 p-4">
                      <h4 className="text-sm font-semibold dark:text-white text-gray-900 mb-3">Technical Signals</h4>
                      <div className="space-y-2">
                        <button
                          onClick={() => addCustomFilter('signal', 'Bullish', 'bullish')}
                          className="w-full px-3 py-2 text-sm text-left bg-green-50 dark:bg-green-950/30 hover:bg-green-100 dark:hover:bg-green-900/40 text-green-700 dark:text-green-400 rounded-lg transition-colors"
                        >
                          🟢 Bullish Signal
                        </button>
                        <button
                          onClick={() => addCustomFilter('signal', 'Bearish', 'bearish')}
                          className="w-full px-3 py-2 text-sm text-left bg-red-50 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-900/40 text-red-700 dark:text-red-400 rounded-lg transition-colors"
                        >
                          🔴 Bearish Signal
                        </button>
                        <button
                          onClick={() => addCustomFilter('signal', 'Oversold', 'oversold')}
                          className="w-full px-3 py-2 text-sm text-left bg-purple-50 dark:bg-purple-950/30 hover:bg-purple-100 dark:hover:bg-purple-900/40 text-purple-700 dark:text-purple-400 rounded-lg transition-colors"
                        >
                          📉 Oversold (RSI &lt; 30)
                        </button>
                        <button
                          onClick={() => addCustomFilter('signal', 'Overbought', 'overbought')}
                          className="w-full px-3 py-2 text-sm text-left bg-orange-50 dark:bg-orange-950/30 hover:bg-orange-100 dark:hover:bg-orange-900/40 text-orange-700 dark:text-orange-400 rounded-lg transition-colors"
                        >
                          📈 Overbought (RSI &gt; 70)
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
                  </div>
                )}
              </div>
            </div>
            
            {/* Actions */}
            <div className="flex gap-2">
              {activeFilters.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllFilters}
                  className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30"
                >
                  Clear All
                </Button>
              )}
              <Button
                variant="primary"
                size="sm"
                onClick={() => setShowSaveDialog(true)}
                disabled={activeFilters.length === 0}
              >
                Save Current
              </Button>
            </div>
          </div>

          {/* Active Filters Panel */}
          <Card>
            <div className="space-y-4">
              {/* Active Filters Display */}
              {activeFilters.length > 0 ? (
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    Active filters:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {activeFilters.map((filter) => (
                      <div
                        key={filter.id}
                        className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 rounded-lg group"
                      >
                        <span className="text-sm font-medium text-indigo-700 dark:text-indigo-300">
                          {filter.label}
                        </span>
                        <button
                          onClick={() => removeFilter(filter.id)}
                          className="ml-1 p-0.5 hover:bg-indigo-200 dark:hover:bg-indigo-800 rounded transition-colors"
                        >
                          <svg className="w-3 h-3 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                /* Empty State */
                <div className="text-center py-8">
                  <svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                  <p className="text-gray-600 dark:text-gray-400 mb-2">
                    No filters applied
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-500">
                    Use the dropdowns above to add presets or custom filters
                  </p>
                </div>
              )}

              {/* Results Count and Actions - Always visible */}
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
                        className="rounded dark:bg-slate-700 bg-white border-gray-300"
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
                          className="rounded dark:bg-slate-700 bg-white border-gray-300"
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
                  Save Current Filter
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