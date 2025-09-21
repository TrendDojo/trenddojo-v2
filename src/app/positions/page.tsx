"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Atom } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageContent } from "@/components/layout/PageContent";
import { Card } from "@/components/ui/Panel";
import { Button } from "@/components/ui/Button";
import { tableStyles, filterStyles, getFilterButton } from "@/lib/tableStyles";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Dropdown } from "@/components/ui/Dropdown";
import { AccountStatusBar } from "@/components/portfolio/AccountStatusBar";
import { PositionStatusBar, ClosedPositionStatusBar } from "@/components/positions/PositionStatusBar";
import { cn } from "@/lib/utils";

interface ScalingLevel {
  quantity: number;
  targetPrice: number;
  executed: boolean;
  executedPrice?: number;
  executedDate?: string;
}

interface Position {
  id: string;
  symbol: string;
  name: string;
  side: "long" | "short";
  quantity: number;
  originalQuantity: number;
  entryPrice: number;
  currentPrice: number;
  exitPrice?: number;
  stopLoss?: number;
  takeProfit?: number;
  targetPrice?: number;
  scalingLevels?: ScalingLevel[];
  pnl: number;
  pnlPercent: number;
  value: number;
  openDate: string;
  closedDate?: string;
  strategy: string;
  status: "active" | "pending" | "closed";
  exitReason?: "stop_loss" | "take_profit" | "manual" | "partial";
}

// Strategy mapping with IDs and colors
// Using dark indigo shades and darker greys, all with white text
const STRATEGIES = {
  "Momentum": { 
    id: "MM", 
    bgColor: "bg-indigo-900 dark:bg-indigo-900",
    textColor: "text-white"
  },
  "Mean Reversion": { 
    id: "MR",
    bgColor: "bg-indigo-800 dark:bg-indigo-800",
    textColor: "text-white"
  },
  "Breakout": { 
    id: "BO",
    bgColor: "bg-indigo-700 dark:bg-indigo-700",
    textColor: "text-white"
  },
  "Value": { 
    id: "VL",
    bgColor: "bg-gray-800 dark:bg-gray-800",
    textColor: "text-white"
  },
  "Swing Trade": { 
    id: "SW",
    bgColor: "bg-gray-700 dark:bg-gray-700",
    textColor: "text-white"
  },
  "Growth": { 
    id: "GR",
    bgColor: "bg-gray-600 dark:bg-gray-600",
    textColor: "text-white"
  },
  "Core Holding": { 
    id: "CH",
    bgColor: "bg-indigo-600 dark:bg-indigo-600",
    textColor: "text-white"
  },
  "Scalping": { 
    id: "SC",
    bgColor: "bg-gray-900 dark:bg-gray-900",
    textColor: "text-white"
  },
  "Position Trade": { 
    id: "PT",
    bgColor: "bg-indigo-950 dark:bg-indigo-950",
    textColor: "text-white"
  },
  "Day Trade": { 
    id: "DT",
    bgColor: "bg-slate-800 dark:bg-slate-800",
    textColor: "text-white"
  }
};

export default function PositionsPage() {
  const router = useRouter();
  const [selectedPositions, setSelectedPositions] = useState<string[]>([]);
  const [filterView, setFilterView] = useState<"active" | "pending" | "closed">("active");
  const [filterStrategy, setFilterStrategy] = useState<string>("all");
  const [strategyDropdownOpen, setStrategyDropdownOpen] = useState(false);
  const [columnsDropdownOpen, setColumnsDropdownOpen] = useState(false);
  const [actionDropdownOpen, setActionDropdownOpen] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [visibleColumns, setVisibleColumns] = useState({
    symbol: true,
    strategy: true,
    entry: true,
    status: true,
    risk: true,
    value: true,
    age: true,
    actions: true
  });
  const [showIndicatorKey, setShowIndicatorKey] = useState(false);

  // Hide risk and value columns when viewing closed positions
  const effectiveVisibleColumns = {
    ...visibleColumns,
    risk: filterView === "closed" ? false : visibleColumns.risk,
    value: filterView === "closed" ? false : visibleColumns.value
  };
  
  // Calculate risk for a position
  const calculateRisk = (position: Position): number => {
    if (!position.stopLoss) return 0;
    
    // Calculate risk on remaining position
    const riskPerShare = position.side === "long" 
      ? position.currentPrice - position.stopLoss
      : position.stopLoss - position.currentPrice;
    
    const remainingRisk = riskPerShare * position.quantity;
    
    // Calculate profits already taken
    let profitsTaken = 0;
    if (position.scalingLevels) {
      position.scalingLevels.forEach(level => {
        if (level.executed && level.executedPrice) {
          const profitPerShare = position.side === "long"
            ? level.executedPrice - position.entryPrice
            : position.entryPrice - level.executedPrice;
          profitsTaken += profitPerShare * level.quantity;
        }
      });
    }
    
    // Net risk = remaining risk - profits already taken
    return remainingRisk - profitsTaken;
  };
  
  // Fake positions data
  const positions: Position[] = [
    {
      id: "1",
      symbol: "AAPL",
      name: "Apple Inc.",
      side: "long",
      quantity: 100,
      originalQuantity: 100,
      entryPrice: 175.50,
      currentPrice: 182.30,
      stopLoss: 170.00,
      takeProfit: 190.00,
      targetPrice: 195.00,
      pnl: 680.00,
      pnlPercent: 3.87,
      value: 18230.00,
      openDate: "2024-01-15",
      strategy: "Momentum",
      status: "active"
    },
    {
      id: "2",
      symbol: "TSLA",
      name: "Tesla Inc.",
      side: "short",
      quantity: 35,
      originalQuantity: 50,
      entryPrice: 245.00,
      currentPrice: 238.50,
      stopLoss: 250.00,
      takeProfit: 220.00,
      targetPrice: 215.00,
      scalingLevels: [
        { quantity: 15, targetPrice: 240.00, executed: true, executedPrice: 239.80, executedDate: "2024-01-19" },
        { quantity: 20, targetPrice: 235.00, executed: false },
        { quantity: 15, targetPrice: 230.00, executed: false }
      ],
      pnl: 325.00,
      pnlPercent: 2.65,
      value: 11925.00,
      openDate: "2024-01-18",
      strategy: "Mean Reversion",
      status: "active"
    },
    {
      id: "3",
      symbol: "NVDA",
      name: "NVIDIA Corp.",
      side: "long",
      quantity: 25,
      originalQuantity: 25,
      entryPrice: 680.00,
      currentPrice: 695.50,
      stopLoss: 650.00,
      takeProfit: 750.00,
      targetPrice: 760.00,
      pnl: 387.50,
      pnlPercent: 2.28,
      value: 17387.50,
      openDate: "2024-01-20",
      strategy: "Breakout",
      status: "active"
    },
    {
      id: "4",
      symbol: "META",
      name: "Meta Platforms",
      side: "long",
      quantity: 60,
      originalQuantity: 75,
      entryPrice: 385.00,
      currentPrice: 378.25,
      stopLoss: 375.00,
      takeProfit: 410.00,
      scalingLevels: [
        { quantity: 15, targetPrice: 395.00, executed: true, executedPrice: 394.50, executedDate: "2024-01-23" },
        { quantity: 25, targetPrice: 400.00, executed: false },
        { quantity: 35, targetPrice: 405.00, executed: false }
      ],
      pnl: -506.25,
      pnlPercent: -1.75,
      value: 28368.75,
      openDate: "2024-01-22",
      strategy: "Value",
      status: "active"
    },
    {
      id: "5",
      symbol: "AMZN",
      name: "Amazon.com Inc.",
      side: "long",
      quantity: 150,
      originalQuantity: 150,
      entryPrice: 155.00,
      currentPrice: 158.75,
      stopLoss: 150.00,
      takeProfit: 165.00,
      pnl: 562.50,
      pnlPercent: 2.42,
      value: 23812.50,
      openDate: "2024-01-23",
      strategy: "Swing Trade",
      status: "pending"
    },
    {
      id: "6",
      symbol: "GOOGL",
      name: "Alphabet Inc.",
      side: "long",
      quantity: 40,
      originalQuantity: 80,
      entryPrice: 142.50,
      currentPrice: 139.25,
      stopLoss: 138.00,
      takeProfit: 150.00,
      scalingLevels: [
        { quantity: 40, targetPrice: 146.00, executed: true, executedPrice: 146.25, executedDate: "2024-01-25" },
        { quantity: 40, targetPrice: 150.00, executed: false }
      ],
      pnl: -260.00,
      pnlPercent: -2.28,
      value: 11140.00,
      openDate: "2024-01-24",
      strategy: "Momentum",
      status: "active"
    },
    {
      id: "7",
      symbol: "SPY",
      name: "SPDR S&P 500 ETF",
      side: "long",
      quantity: 200,
      originalQuantity: 200,
      entryPrice: 478.50,
      currentPrice: 482.25,
      stopLoss: 475.00,
      takeProfit: 490.00,
      pnl: 750.00,
      pnlPercent: 0.78,
      value: 96450.00,
      openDate: "2024-01-25",
      strategy: "Core Holding",
      status: "active"
    },
    {
      id: "8",
      symbol: "MSFT",
      name: "Microsoft Corp.",
      side: "long",
      quantity: 45,
      originalQuantity: 60,
      entryPrice: 398.00,
      currentPrice: 405.50,
      stopLoss: 390.00,
      takeProfit: 420.00,
      targetPrice: 425.00,
      pnl: 450.00,
      pnlPercent: 1.88,
      value: 24330.00,
      openDate: "2024-01-26",
      strategy: "Growth",
      status: "active"
    },
    {
      id: "9",
      symbol: "BA",
      name: "Boeing Co.",
      side: "long",
      quantity: 0,
      originalQuantity: 100,
      entryPrice: 220.00,
      currentPrice: 210.00,
      exitPrice: 210.00,
      stopLoss: 210.00,
      takeProfit: 240.00,
      pnl: -1000.00,
      pnlPercent: -4.55,
      value: 0,
      openDate: "2024-01-10",
      closedDate: "2024-01-28",
      strategy: "Breakout",
      status: "closed",
      exitReason: "stop_loss"
    },
    {
      id: "10",
      symbol: "NFLX",
      name: "Netflix Inc.",
      side: "long",
      quantity: 0,
      originalQuantity: 50,
      entryPrice: 480.00,
      currentPrice: 520.00,
      exitPrice: 520.00,
      stopLoss: 460.00,
      takeProfit: 520.00,
      pnl: 2000.00,
      pnlPercent: 8.33,
      value: 0,
      openDate: "2024-01-05",
      closedDate: "2024-01-27",
      strategy: "Momentum",
      status: "closed",
      exitReason: "take_profit"
    },
    {
      id: "11",
      symbol: "AMD",
      name: "Advanced Micro Devices",
      side: "short",
      quantity: 0,
      originalQuantity: 80,
      entryPrice: 145.00,
      currentPrice: 138.00,
      exitPrice: 138.00,
      stopLoss: 150.00,
      takeProfit: 135.00,
      targetPrice: 130.00,
      pnl: 560.00,
      pnlPercent: 4.83,
      value: 0,
      openDate: "2024-01-08",
      closedDate: "2024-01-26",
      strategy: "Mean Reversion",
      status: "closed",
      exitReason: "manual"
    },
    {
      id: "12",
      symbol: "CRM",
      name: "Salesforce Inc.",
      side: "long",
      quantity: 0,
      originalQuantity: 100,
      entryPrice: 250.00,
      currentPrice: 265.00,
      exitPrice: 258.00,
      stopLoss: 240.00,
      takeProfit: 280.00,
      scalingLevels: [
        { quantity: 30, targetPrice: 260.00, executed: true, executedPrice: 261.00, executedDate: "2024-01-20" },
        { quantity: 30, targetPrice: 270.00, executed: true, executedPrice: 269.50, executedDate: "2024-01-22" },
        { quantity: 40, targetPrice: 280.00, executed: false }
      ],
      pnl: 1185.00,
      pnlPercent: 4.74,
      value: 0,
      openDate: "2024-01-12",
      closedDate: "2024-01-25",
      strategy: "Swing Trade",
      status: "closed",
      exitReason: "partial"
    }
  ];

  const filteredPositions = positions.filter(p => {
    const statusMatch = p.status === filterView;
    const strategyMatch = filterStrategy === "all" || p.strategy === filterStrategy;
    return statusMatch && strategyMatch;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredPositions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedPositions = filteredPositions.slice(startIndex, endIndex);

  const togglePositionSelection = (id: string) => {
    setSelectedPositions(prev => 
      prev.includes(id) 
        ? prev.filter(p => p !== id)
        : [...prev, id]
    );
  };

  const selectAllPositions = () => {
    if (selectedPositions.length === filteredPositions.length) {
      setSelectedPositions([]);
    } else {
      setSelectedPositions(filteredPositions.map(p => p.id));
    }
  };

  const totalValue = filteredPositions.reduce((sum, p) => sum + p.value, 0);
  const totalPnL = filteredPositions.reduce((sum, p) => sum + p.pnl, 0);
  const totalRisk = filteredPositions.reduce((sum, p) => sum + Math.max(0, calculateRisk(p)), 0);

  // Mock portfolio status - in real app would come from API
  const portfolioStatus = {
    accountStatus: 'warning' as const,
    currentDrawdown: -7.5
  };

  return (
    <AppLayout>
      <PageContent>
        <div className="space-y-4">
          {/* Breadcrumb */}
          <div className="mb-8">
            <Breadcrumb
              items={[
                { label: "Positions" }
              ]}
            />
          </div>

          {/* Account Status Bar */}
          <AccountStatusBar
            accountStatus={portfolioStatus.accountStatus}
            currentDrawdown={portfolioStatus.currentDrawdown}
            portfolioName="Main Portfolio"
          />

          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold dark:text-white text-gray-900">
                {(() => {
                  const statusPrefix = filterView.charAt(0).toUpperCase() + filterView.slice(1);
                  if (filterStrategy === "all") {
                    return `${statusPrefix} Positions`;
                  } else {
                    return `${statusPrefix} Positions – ${filterStrategy}`;
                  }
                })()}
              </h1>
              <p className="text-sm dark:text-gray-400 text-gray-600 mt-1">
                Manage your active trading positions
              </p>
            </div>
            <Button variant="primary" size="sm" className="flex items-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Position
            </Button>
          </div>

          {/* Summary Cards */}
          <div className="flex flex-wrap gap-16">
            <Card>
              <p className="text-sm dark:text-gray-400 text-gray-600">Positions</p>
              <p className="text-2xl font-bold dark:text-white text-gray-900 mt-1">
                {filteredPositions.length}
              </p>
            </Card>
            <Card>
              <p className="text-sm dark:text-gray-400 text-gray-600">Total Value</p>
              <p className="text-2xl font-bold dark:text-white text-gray-900 mt-1">
                ${totalValue.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </p>
            </Card>
            <Card>
              <p className="text-sm dark:text-gray-400 text-gray-600">Combined Risk</p>
              <p className="text-2xl font-bold mt-1 text-warning">
                ${totalRisk.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                <span className="text-base font-normal ml-2">({totalValue > 0 ? `${((totalRisk / totalValue) * 100).toFixed(1)}%` : '0%'})</span>
              </p>
            </Card>
            <Card>
              <p className="text-sm dark:text-gray-400 text-gray-600">Active P&L</p>
              <p className={cn(
                "text-2xl font-bold mt-1",
                totalPnL >= 0 ? "text-success" : "text-danger"
              )}>
                {totalPnL >= 0 ? "+" : ""}${Math.abs(totalPnL).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </p>
            </Card>
            <Card>
              <p className="text-sm dark:text-gray-400 text-gray-600">Win Rate</p>
              <p className="text-2xl font-bold dark:text-white text-gray-900 mt-1">
                {((filteredPositions.filter(p => p.pnl > 0).length / filteredPositions.length) * 100).toFixed(0)}%
              </p>
            </Card>
          </div>

          {/* Spacer for better visual separation */}
          <div className="pt-2"></div>

          {/* Filter and Actions Bar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              {/* Strategy Dropdown */}
              <div className="flex items-center gap-2">
                <div className="relative dropdown-container">
                  <button
                    onClick={() => setStrategyDropdownOpen(!strategyDropdownOpen)}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 font-semibold transition-all duration-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-900 focus:ring-offset-gray-50 focus:ring-indigo-500 min-w-[160px] border",
                      filterStrategy !== "all"
                        ? "dark:bg-indigo-500 bg-indigo-600 dark:hover:bg-indigo-600 hover:bg-indigo-700 text-white border-transparent"
                        : "dark:bg-transparent bg-transparent dark:border-slate-700 border-gray-300 dark:hover:bg-slate-800 hover:bg-gray-100 dark:text-white text-gray-900"
                    )}
                  >
                    <Atom className="w-4 h-4 flex-shrink-0" />
                    <span className="flex-1 text-left">
                      {filterStrategy === "all" ? "All Strategies" : filterStrategy}
                    </span>
                    <svg
                      className={cn(
                        "w-4 h-4 transition-transform flex-shrink-0",
                        strategyDropdownOpen && "rotate-180"
                      )}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                <Dropdown
                  isOpen={strategyDropdownOpen}
                  onClose={() => setStrategyDropdownOpen(false)}
                  position="left"
                  width="sm"
                >
                  <div className="py-2">
                    <button
                      onClick={() => {
                        setFilterStrategy("all");
                        setStrategyDropdownOpen(false);
                      }}
                      className={cn(
                        "w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors flex items-center justify-between",
                        filterStrategy === "all" && "bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400"
                      )}
                    >
                      <span>All Strategies</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {positions.length}
                      </span>
                    </button>
                    <div className="my-1 border-t dark:border-slate-700 border-gray-200" />
                    {Object.entries(STRATEGIES).map(([name, config]) => {
                      const count = positions.filter(p => p.strategy === name).length;
                      if (count === 0) return null;
                      return (
                        <button
                          key={name}
                          onClick={() => {
                            setFilterStrategy(name);
                            setStrategyDropdownOpen(false);
                          }}
                          className={cn(
                            "w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors flex items-center justify-between",
                            filterStrategy === name && "bg-indigo-50 dark:bg-indigo-950/30"
                          )}
                        >
                            <span className={filterStrategy === name ? "text-indigo-600 dark:text-indigo-400" : "dark:text-gray-300 text-gray-700"}>
                              {name}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {count}
                            </span>
                        </button>
                      );
                    })}
                  </div>
                </Dropdown>
                </div>
                {/* Reset link - only visible when a strategy is selected */}
                {filterStrategy !== "all" && (
                  <button
                    onClick={() => {
                      setFilterStrategy("all");
                      setStrategyDropdownOpen(false);
                    }}
                    className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors underline"
                  >
                    reset
                  </button>
                )}
              </div>

              {/* Vertical Divider */}
              <div className="h-8 w-px bg-gray-500 dark:bg-gray-400 self-end" />

              {/* Status Filters */}
              <div className="flex gap-2 self-end">
                <button
                  className={cn(
                    "px-3 py-2 text-sm font-semibold rounded-lg transition-all",
                    filterView === "active"
                      ? "bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900"
                      : "bg-transparent border border-gray-300 dark:border-slate-700 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-slate-800"
                  )}
                  onClick={() => setFilterView("active")}
                >
                  Active
                </button>
                <button
                  className={cn(
                    "px-3 py-2 text-sm font-semibold rounded-lg transition-all",
                    filterView === "pending"
                      ? "bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900"
                      : "bg-transparent border border-gray-300 dark:border-slate-700 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-slate-800"
                  )}
                  onClick={() => setFilterView("pending")}
                >
                  Pending
                </button>
                <button
                  className={cn(
                    "px-3 py-2 text-sm font-semibold rounded-lg transition-all",
                    filterView === "closed"
                      ? "bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900"
                      : "bg-transparent border border-gray-300 dark:border-slate-700 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-slate-800"
                  )}
                  onClick={() => setFilterView("closed")}
                >
                  Closed
                </button>
              </div>
            </div>

            {/* Right side controls - separate flex container */}
            <div className="flex items-center gap-6">
              {/* Column Selector */}
              <div className="relative">
                <button
                  onClick={() => setColumnsDropdownOpen(!columnsDropdownOpen)}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                  title="Select columns"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                  </svg>
                </button>
                {columnsDropdownOpen && (
                  <Dropdown
                    isOpen={columnsDropdownOpen}
                    onClose={() => setColumnsDropdownOpen(false)}
                    position="right"
                    width="sm"
                  >
                    <div className="py-2">
                      <p className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        Visible Columns
                      </p>
                      {Object.entries(visibleColumns).filter(([key]) => key !== 'actions').map(([key, value]) => (
                        <label
                          key={key}
                          className="flex items-center px-4 py-2 hover:bg-gray-100 dark:hover:bg-slate-700 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={value}
                            onChange={(e) => setVisibleColumns(prev => ({
                              ...prev,
                              [key]: e.target.checked
                            }))}
                            className="mr-3"
                          />
                          <span className="text-sm capitalize dark:text-gray-300 text-gray-700">
                            {key === 'entry' ? 'Entry / Change' : key}
                          </span>
                        </label>
                      ))}
                    </div>
                  </Dropdown>
                )}
              </div>

              {/* Vertical Divider */}
              <div className="h-8 w-px bg-gray-500 dark:bg-gray-400 self-end" />

              {/* Top Pagination Controls - Same format as bottom */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <svg className="w-5 h-5 dark:text-gray-400 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={cn(
                          "px-3 py-1 rounded-lg text-sm font-medium transition-colors",
                          currentPage === pageNum
                            ? "dark:bg-slate-700/50 bg-gray-200 dark:text-white text-gray-900"
                            : "hover:bg-gray-100 dark:hover:bg-slate-700 dark:text-gray-300 text-gray-700"
                        )}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages || totalPages === 0}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <svg className="w-5 h-5 dark:text-gray-400 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Action Buttons Row (when items selected) */}
          {selectedPositions.length > 0 && (
            <div className="flex gap-2 -mt-2">
              <Button variant="secondary" size="sm">
                Close {selectedPositions.length} Position{selectedPositions.length > 1 ? 's' : ''}
              </Button>
              <Button variant="secondary" size="sm">
                Edit Stops
              </Button>
            </div>
          )}

          {/* Positions Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
                <thead className="border-b dark:border-slate-700 border-gray-200">
                  <tr>
                    {effectiveVisibleColumns.symbol && (
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider dark:text-gray-400 text-gray-600">
                        Symbol
                      </th>
                    )}
                    {effectiveVisibleColumns.strategy && (
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider dark:text-gray-400 text-gray-600">
                        Strategy
                      </th>
                    )}
                    {effectiveVisibleColumns.entry && (
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider dark:text-gray-400 text-gray-600">
                        Entry / Change
                      </th>
                    )}
                    {effectiveVisibleColumns.status && (
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider dark:text-gray-400 text-gray-600">
                        <div className="flex items-center gap-1">
                          Status
                          <button
                            onClick={() => setShowIndicatorKey(!showIndicatorKey)}
                            className="p-0.5 rounded hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
                            title="Show indicator key"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </button>
                        </div>
                      </th>
                    )}
                    {effectiveVisibleColumns.risk && (
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider dark:text-gray-400 text-gray-600">
                        Risk
                      </th>
                    )}
                    {effectiveVisibleColumns.value && (
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider dark:text-gray-400 text-gray-600">
                        Value
                      </th>
                    )}
                    {effectiveVisibleColumns.age && (
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider dark:text-gray-400 text-gray-600">
                        Age
                      </th>
                    )}
                    {effectiveVisibleColumns.actions && (
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider dark:text-gray-400 text-gray-600">

                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y dark:divide-slate-700 divide-gray-200">
                  {paginatedPositions.map((position, index) => (
                    <tr
                      key={position.id}
                      className={cn(
                        "hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors",
                        selectedPositions.includes(position.id) && "bg-indigo-50 dark:bg-indigo-950/20",
                        index === 0 && "cursor-pointer"
                      )}
                      onClick={index === 0 ? () => router.push(`/positions/${position.id}`) : undefined}
                    >
                      {effectiveVisibleColumns.symbol && (
                        <td className="px-4 py-3">
                          <div>
                            <div className="flex items-center gap-2">
                              {index === 0 ? (
                                <Link
                                  href={`/positions/${position.id}`}
                                  className="text-lg font-bold dark:text-white text-gray-900 hover:text-indigo-600 dark:hover:text-indigo-400"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {position.symbol}
                                </Link>
                              ) : (
                                <p className="text-lg font-bold dark:text-white text-gray-900">{position.symbol}</p>
                              )}
                              {position.side === "short" && (
                                <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-red-100 dark:bg-red-900/30 text-danger">
                                  SHORT
                                </span>
                              )}
                              <span className="text-gray-400 dark:text-gray-600">|</span>
                              <span className="dark:text-gray-300 text-gray-700 font-medium">
                                {position.quantity}
                              </span>
                              {position.quantity < position.originalQuantity && (
                                <span className="text-xs dark:text-gray-500 text-gray-500">
                                  of {position.originalQuantity}
                                </span>
                              )}
                            </div>
                            <p className="text-xs dark:text-gray-400 text-gray-600">{position.name}</p>
                          </div>
                        </td>
                      )}
                      {effectiveVisibleColumns.strategy && (
                        <td className="px-4 py-3">
                          <span className="text-sm font-semibold dark:text-gray-300 text-gray-700" title={position.strategy}>
                            {STRATEGIES[position.strategy as keyof typeof STRATEGIES]?.id || position.strategy.substring(0, 2).toUpperCase()}
                          </span>
                        </td>
                      )}
                      {effectiveVisibleColumns.entry && (
                        <td className="px-4 py-3">
                          <div>
                            <div className="dark:text-gray-300 text-gray-700 font-medium">
                              ${position.entryPrice.toFixed(2)}
                            </div>
                            <div className={cn(
                              "text-sm font-medium",
                              position.currentPrice > position.entryPrice ? "text-success" : "text-danger"
                            )}>
                              {position.currentPrice > position.entryPrice ? "+" : ""}
                              {(((position.currentPrice - position.entryPrice) / position.entryPrice) * 100).toFixed(2)}%
                            </div>
                          </div>
                        </td>
                      )}
                      {effectiveVisibleColumns.status && (
                        <td className="px-4 py-3">
                          {position.status === "closed" ? (
                            <ClosedPositionStatusBar
                              side={position.side}
                              quantity={position.quantity}
                              originalQuantity={position.originalQuantity}
                              entryPrice={position.entryPrice}
                              currentPrice={position.currentPrice}
                              stopLoss={position.stopLoss}
                              targetPrice={position.targetPrice}
                              scalingLevels={position.scalingLevels}
                              exitReason={position.exitReason}
                              pnl={position.pnl}
                            />
                          ) : (
                            <PositionStatusBar
                              side={position.side}
                              quantity={position.quantity}
                              originalQuantity={position.originalQuantity}
                              entryPrice={position.entryPrice}
                              currentPrice={position.currentPrice}
                              stopLoss={position.stopLoss}
                              targetPrice={position.targetPrice}
                              scalingLevels={position.scalingLevels}
                              status={position.status}
                              pnl={position.pnl}
                            />
                          )}
                        </td>
                      )}
                      {effectiveVisibleColumns.risk && (
                        <td className="px-4 py-3">
                        {position.status === "closed" ? (
                          <span className="text-sm text-gray-400 dark:text-gray-500">–</span>
                        ) : (() => {
                          const netRisk = calculateRisk(position);

                          // Calculate actual remaining risk (what you could still lose)
                          const riskPerShare = position.side === "long"
                            ? position.currentPrice - (position.stopLoss || 0)
                            : (position.stopLoss || 0) - position.currentPrice;
                          const remainingRisk = Math.max(0, riskPerShare * position.quantity);
                          const riskPercent = position.value > 0 ? (remainingRisk / position.value) * 100 : 0;

                          // Check if profits taken exceed remaining risk
                          const isProtected = netRisk <= 0;

                          return (
                            <div className={cn(
                              "text-sm font-semibold",
                              isProtected
                                ? "text-success"  // Green when protected by profits
                                : "text-danger"  // Red when at risk
                            )}>
                              {remainingRisk > 0 ? (
                                <>
                                  {riskPercent.toFixed(1)}%
                                </>
                              ) : (
                                <span className="flex items-center gap-1">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                  </svg>
                                  <span className="text-xs">Locked</span>
                                </span>
                              )}
                            </div>
                          );
                        })()}
                      </td>
                      )}
                      {effectiveVisibleColumns.value && (
                        <td className="px-4 py-3 dark:text-gray-300 text-gray-700">
                          ${position.value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                      )}
                      {effectiveVisibleColumns.age && (
                        <td className="px-4 py-3 text-sm dark:text-gray-400 text-gray-600">
                          {(() => {
                            const openDate = new Date(position.openDate);
                            const closeDate = position.closedDate ? new Date(position.closedDate) : new Date();
                            const days = Math.floor((closeDate.getTime() - openDate.getTime()) / (1000 * 60 * 60 * 24));

                            if (days === 0) return "Today";
                            if (days === 1) return "1 day";
                            if (days < 7) return `${days} days`;
                            if (days < 30) return `${Math.floor(days / 7)}w ${days % 7}d`;
                            if (days < 365) return `${Math.floor(days / 30)}mo`;
                            return `${Math.floor(days / 365)}y ${Math.floor((days % 365) / 30)}mo`;
                          })()}
                        </td>
                      )}
                      {effectiveVisibleColumns.actions && (
                        <td className="px-4 py-3">
                          <div className="relative">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setActionDropdownOpen(actionDropdownOpen === position.id ? null : position.id);
                              }}
                              className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                            >
                              <svg className="w-5 h-5 dark:text-gray-400 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                                <circle cx="12" cy="5" r="2" />
                                <circle cx="12" cy="12" r="2" />
                                <circle cx="12" cy="19" r="2" />
                              </svg>
                            </button>
                            <Dropdown
                              isOpen={actionDropdownOpen === position.id}
                              onClose={() => setActionDropdownOpen(null)}
                              position="right"
                              width="sm"
                            >
                              <div className="py-2">
                                <button
                                  onClick={() => {
                                    router.push(`/positions/${position.id}`);
                                    setActionDropdownOpen(null);
                                  }}
                                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors dark:text-gray-300 text-gray-700"
                                >
                                  View Position
                                </button>
                                <button
                                  onClick={() => {
                                    // Navigate to strategy view - you can update this path as needed
                                    router.push(`/strategies/${position.strategy.toLowerCase().replace(/\s+/g, '-')}`);
                                    setActionDropdownOpen(null);
                                  }}
                                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors dark:text-gray-300 text-gray-700"
                                >
                                  View Strategy
                                </button>
                              </div>
                            </Dropdown>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
          </div>

          {/* Pagination Controls */}
          <div className="flex items-center justify-between py-3">
                <div className="text-sm dark:text-gray-400 text-gray-600">
                  {filteredPositions.length > 0
                    ? `Showing ${startIndex + 1} to ${Math.min(endIndex, filteredPositions.length)} of ${filteredPositions.length} positions`
                    : "No positions to display"
                  }
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <svg className="w-5 h-5 dark:text-gray-400 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={cn(
                            "px-3 py-1 rounded-lg text-sm font-medium transition-colors",
                            currentPage === pageNum
                              ? "dark:bg-slate-700/50 bg-gray-200 dark:text-white text-gray-900"
                              : "hover:bg-gray-100 dark:hover:bg-slate-700 dark:text-gray-300 text-gray-700"
                          )}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <svg className="w-5 h-5 dark:text-gray-400 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
            </div>
        </div>

        {/* Indicator Key Modal */}
        {showIndicatorKey && (
          <div className="fixed inset-0 bg-black/50 dark:bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setShowIndicatorKey(false)}>
            <div className="bg-white dark:bg-slate-800 rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold dark:text-white text-gray-900">Position Status Indicator Key</h2>
                <button
                  onClick={() => setShowIndicatorKey(false)}
                  className="p-1 rounded hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                >
                  <svg className="w-5 h-5 dark:text-gray-400 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                {/* Demo Visualization */}
                <div className="p-4 bg-gray-50 dark:bg-slate-900 rounded-lg">
                  <div className="relative inline-block" style={{ width: '180px', height: '60px', marginLeft: '20px' }}>
                    {/* Current Price Indicator - A */}
                    <div className="absolute -top-1 flex flex-col items-center"
                      style={{ left: '86px' }}
                    >
                      <div className="w-2 h-2 rounded-full bg-white border border-black dark:border-white" />
                      <div className="w-0.5 h-1.5 bg-black dark:bg-white" />
                      <span className="text-xs font-bold mt-1 dark:text-white">A</span>
                    </div>

                    {/* Stop Loss Indicator - B */}
                    <div className="absolute -bottom-1 flex flex-col-reverse items-center"
                      style={{ left: '-4px' }}
                    >
                      <span className="text-xs font-bold mb-1 dark:text-white">B</span>
                      <div className="w-2 h-2 bg-red-500 dark:bg-red-400" />
                      <div className="w-0.5 h-1.5 bg-red-500 dark:bg-red-400" />
                    </div>
                    <span className="absolute text-[10px] dark:text-gray-400 text-gray-600"
                      style={{ bottom: '-2px', left: '8px' }}>
                      240
                    </span>

                    {/* Target Indicator - E */}
                    <div className="absolute -bottom-1 flex flex-col-reverse items-center"
                      style={{ right: '-4px' }}
                    >
                      <span className="text-xs font-bold mb-1 dark:text-white">E</span>
                      <div className="w-2 h-2 rounded-full bg-green-500 dark:bg-green-400" />
                      <div className="w-0.5 h-1.5 bg-green-500 dark:bg-green-400" />
                    </div>
                    <span className="absolute text-[10px] dark:text-gray-400 text-gray-600"
                      style={{ bottom: '-2px', right: '8px' }}>
                      280
                    </span>

                    {/* Middle row: segments */}
                    <div className="absolute top-3 flex items-center" style={{ gap: '3px' }}>
                      {/* Stop loss segment - C */}
                      <div className="relative">
                        <div className="h-2 rounded-full border border-red-500 dark:border-red-400" style={{ width: '50px' }} />
                        <span className="absolute -bottom-5 left-1/2 transform -translate-x-1/2 text-xs font-bold dark:text-white">C</span>
                      </div>
                      {/* Active position segment - D */}
                      <div className="relative">
                        <div className="h-2 rounded-full border border-green-500 dark:border-green-400" style={{ width: '80px' }} />
                        <span className="absolute -bottom-5 left-1/2 transform -translate-x-1/2 text-xs font-bold dark:text-white">D</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Legend */}
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <span className="font-bold text-sm dark:text-white">A:</span>
                    <span className="text-sm dark:text-gray-400 text-gray-600">Current Price</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-bold text-sm dark:text-white">B:</span>
                    <span className="text-sm dark:text-gray-400 text-gray-600">Stop Loss (green for shorts)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-bold text-sm dark:text-white">C:</span>
                    <span className="text-sm dark:text-gray-400 text-gray-600">Risk Segment (green for shorts)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-bold text-sm dark:text-white">D:</span>
                    <span className="text-sm dark:text-gray-400 text-gray-600">Active Position (red for shorts)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-bold text-sm dark:text-white">E:</span>
                    <span className="text-sm dark:text-gray-400 text-gray-600">Target Price (red for shorts)</span>
                  </div>
                </div>

                {/* Segment Types */}
                <div className="border-t dark:border-slate-700 border-gray-200 pt-6">
                  <h3 className="font-semibold dark:text-white text-gray-900 mb-4">Segment Types</h3>

                  <div className="space-y-4">
                    {/* Stop Loss Segment */}
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-16 flex justify-center">
                        <div className="h-2 w-12 rounded-full border border-red-500 dark:border-red-400" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium dark:text-white text-gray-900 mb-1">Stop Loss Segment</h4>
                        <p className="text-sm dark:text-gray-400 text-gray-600">
                          Amount at risk (green for shorts).
                        </p>
                      </div>
                    </div>

                    {/* Active Position Segment */}
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-16 flex justify-center">
                        <div className="h-2 w-12 rounded-full border border-green-500 dark:border-green-400" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium dark:text-white text-gray-900 mb-1">Active Position</h4>
                        <p className="text-sm dark:text-gray-400 text-gray-600">
                          Open position size (red for shorts).
                        </p>
                      </div>
                    </div>

                    {/* Executed Profit Segment */}
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-16 flex justify-center">
                        <div className="h-2 w-12 rounded-full bg-success" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium dark:text-white text-gray-900 mb-1">Executed Profit</h4>
                        <p className="text-sm dark:text-gray-400 text-gray-600">
                          Profits already taken.
                        </p>
                      </div>
                    </div>

                    {/* No Target Indicator */}
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-16 flex justify-center">
                        <div className="h-2 w-12 rounded-l-full border-t border-b border-l border-green-500 dark:border-green-400" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium dark:text-white text-gray-900 mb-1">No Target Price</h4>
                        <p className="text-sm dark:text-gray-400 text-gray-600">
                          Open-ended profit potential.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </PageContent>
    </AppLayout>
  );
}