"use client";

import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageContent } from "@/components/layout/PageContent";
import { Card } from "@/components/ui/Panel";
import { Button } from "@/components/ui/Button";
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
  stopLoss?: number;
  takeProfit?: number;
  scalingLevels?: ScalingLevel[];
  pnl: number;
  pnlPercent: number;
  value: number;
  openDate: string;
  strategy: string;
  status: "active" | "pending" | "closing";
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
  const [selectedPositions, setSelectedPositions] = useState<string[]>([]);
  const [filterView, setFilterView] = useState<"all" | "active" | "pending" | "closing">("all");
  
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
      pnl: 450.00,
      pnlPercent: 1.88,
      value: 24330.00,
      openDate: "2024-01-26",
      strategy: "Growth",
      status: "closing"
    }
  ];

  const filteredPositions = positions.filter(p => 
    filterView === "all" || p.status === filterView
  );

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

  return (
    <AppLayout>
      <PageContent>
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold dark:text-white text-gray-900">Positions</h1>
            <p className="text-sm dark:text-gray-400 text-gray-600 mt-1">
              Manage your active trading positions
            </p>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Card className="p-4">
              <p className="text-sm dark:text-gray-400 text-gray-600">Positions</p>
              <p className="text-2xl font-bold dark:text-white text-gray-900 mt-1">
                {filteredPositions.length}
              </p>
            </Card>
            <Card className="p-4">
              <p className="text-sm dark:text-gray-400 text-gray-600">Total Value</p>
              <p className="text-2xl font-bold dark:text-white text-gray-900 mt-1">
                ${totalValue.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </p>
            </Card>
            <Card className="p-4 border-2 border-rose-500/20 dark:border-rose-400/20">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-rose-500 dark:text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <p className="text-sm dark:text-gray-400 text-gray-600">Total Risk</p>
              </div>
              <p className={cn(
                "text-2xl font-bold mt-1",
                totalRisk === 0 ? "text-teal-500" : "text-rose-500 dark:text-rose-400"
              )}>
                ${totalRisk.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </p>
              <p className="text-xs dark:text-gray-500 text-gray-500 mt-1">
                {totalValue > 0 ? `${((totalRisk / totalValue) * 100).toFixed(1)}% of portfolio` : '0%'}
              </p>
            </Card>
            <Card className="p-4">
              <p className="text-sm dark:text-gray-400 text-gray-600">Total P&L</p>
              <p className={cn(
                "text-2xl font-bold mt-1",
                totalPnL >= 0 ? "text-teal-500" : "text-purple-500"
              )}>
                {totalPnL >= 0 ? "+" : ""}${Math.abs(totalPnL).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </p>
            </Card>
            <Card className="p-4">
              <p className="text-sm dark:text-gray-400 text-gray-600">Win Rate</p>
              <p className="text-2xl font-bold dark:text-white text-gray-900 mt-1">
                {((filteredPositions.filter(p => p.pnl > 0).length / filteredPositions.length) * 100).toFixed(0)}%
              </p>
            </Card>
          </div>

          {/* Filter and Actions Bar */}
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <Button
                variant={filterView === "all" ? "primary" : "secondary"}
                size="sm"
                onClick={() => setFilterView("all")}
              >
                All ({positions.length})
              </Button>
              <Button
                variant={filterView === "active" ? "primary" : "secondary"}
                size="sm"
                onClick={() => setFilterView("active")}
              >
                Active ({positions.filter(p => p.status === "active").length})
              </Button>
              <Button
                variant={filterView === "pending" ? "primary" : "secondary"}
                size="sm"
                onClick={() => setFilterView("pending")}
              >
                Pending ({positions.filter(p => p.status === "pending").length})
              </Button>
              <Button
                variant={filterView === "closing" ? "primary" : "secondary"}
                size="sm"
                onClick={() => setFilterView("closing")}
              >
                Closing ({positions.filter(p => p.status === "closing").length})
              </Button>
            </div>

            <div className="flex gap-2">
              {selectedPositions.length > 0 && (
                <>
                  <Button variant="secondary" size="sm">
                    Close {selectedPositions.length} Position{selectedPositions.length > 1 ? 's' : ''}
                  </Button>
                  <Button variant="secondary" size="sm">
                    Edit Stops
                  </Button>
                </>
              )}
              <Button variant="primary" size="sm" className="flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                New Position
              </Button>
            </div>
          </div>

          {/* Positions Table */}
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b dark:border-slate-700 border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider dark:text-gray-400 text-gray-600">
                      Symbol
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider dark:text-gray-400 text-gray-600">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider dark:text-gray-400 text-gray-600">
                      Entry
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider dark:text-gray-400 text-gray-600">
                      Current
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider dark:text-gray-400 text-gray-600">
                      P&L
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider dark:text-gray-400 text-gray-600">
                      Risk
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider dark:text-gray-400 text-gray-600">
                      Value
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider dark:text-gray-400 text-gray-600">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y dark:divide-slate-700 divide-gray-200">
                  {filteredPositions.map((position) => (
                    <tr 
                      key={position.id}
                      className={cn(
                        "hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors",
                        selectedPositions.includes(position.id) && "bg-indigo-50 dark:bg-indigo-950/20"
                      )}
                    >
                      <td className="px-4 py-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-lg font-bold dark:text-white text-gray-900">{position.symbol}</p>
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
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <span 
                            className={cn(
                              "inline-flex items-center justify-center w-8 h-8 text-xs font-bold rounded-lg flex-shrink-0",
                              STRATEGIES[position.strategy as keyof typeof STRATEGIES]?.bgColor || "bg-gray-200 dark:bg-gray-700",
                              STRATEGIES[position.strategy as keyof typeof STRATEGIES]?.textColor || "text-gray-700 dark:text-gray-300"
                            )}
                            title={position.strategy}
                          >
                            {STRATEGIES[position.strategy as keyof typeof STRATEGIES]?.id || position.strategy.substring(0, 2).toUpperCase()}
                          </span>
                          <div className="space-y-1 flex-1">
                            {position.scalingLevels ? (
                              <div className="space-y-1">
                                <div className="flex items-center gap-0.5 relative">
                                  {/* Stop Loss segment */}
                                  {position.stopLoss && (
                                    <div
                                      className="h-2 rounded-l-full bg-amber-500 dark:bg-amber-400 cursor-help"
                                      style={{ width: "15px" }}
                                      title={`Stop Loss: $${position.stopLoss}`}
                                    />
                                  )}
                                  
                                  {/* Entry price marker */}
                                  <div className="relative">
                                    <div className="w-0.5 h-4 bg-gray-400 dark:bg-gray-500" />
                                    <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] dark:text-gray-400 text-gray-500 whitespace-nowrap">
                                      ${position.entryPrice.toFixed(2)}
                                    </span>
                                  </div>
                                  
                                  {/* Position segments */}
                                  {position.scalingLevels.map((level, idx) => {
                                    const widthPercent = (level.quantity / position.originalQuantity) * 100;
                                    return (
                                      <div
                                        key={idx}
                                        className={cn(
                                          "h-2 transition-all relative group cursor-help",
                                          idx === position.scalingLevels!.length - 1 && "rounded-r-full",
                                          level.executed 
                                            ? "bg-gray-300 dark:bg-gray-600" 
                                            : idx === 0 && position.side === "long" && position.currentPrice >= level.targetPrice
                                              ? "bg-teal-400 dark:bg-teal-500 animate-pulse"
                                              : idx === 0 && position.side === "short" && position.currentPrice <= level.targetPrice
                                                ? "bg-teal-400 dark:bg-teal-500 animate-pulse"
                                                : "bg-indigo-500 dark:bg-indigo-400"
                                        )}
                                        style={{ width: `${Math.min(widthPercent * 0.8, 30)}px` }}
                                        title={level.executed 
                                          ? `Sold ${level.quantity} @ $${level.executedPrice}` 
                                          : `Target: ${level.quantity} @ $${level.targetPrice}`}
                                      />
                                    );
                                  })}
                                  <span className="text-xs dark:text-gray-500 text-gray-500 ml-2">
                                    {Math.round((position.quantity / position.originalQuantity) * 100)}%
                                  </span>
                                </div>
                              <div className="flex items-center gap-1 text-xs dark:text-gray-500 text-gray-500">
                                {position.stopLoss && (
                                  <span className="text-purple-500 dark:text-purple-400">
                                    SL: ${position.stopLoss}
                                  </span>
                                )}
                                {position.scalingLevels.filter(l => !l.executed).length > 0 && (
                                  <>
                                    <span className="mx-1">→</span>
                                    <span className="text-teal-500 dark:text-teal-400">
                                      Next: ${position.scalingLevels.find(l => !l.executed)?.targetPrice}
                                    </span>
                                  </>
                                )}
                              </div>
                              </div>
                            ) : (
                              <div className="flex items-center gap-0.5 relative">
                                {/* Stop Loss segment */}
                                {position.stopLoss && (
                                  <div
                                    className="h-2 rounded-l-full bg-amber-500 dark:bg-amber-400 cursor-help"
                                    style={{ width: "15px" }}
                                    title={`Stop Loss: $${position.stopLoss}`}
                                  />
                                )}
                                
                                {/* Entry price marker */}
                                <div className="relative">
                                  <div className="w-0.5 h-4 bg-gray-400 dark:bg-gray-500" />
                                  <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] dark:text-gray-400 text-gray-500 whitespace-nowrap">
                                    ${position.entryPrice.toFixed(2)}
                                  </span>
                                </div>
                                
                                {/* Single position bar */}
                                <div className="flex items-center gap-0">
                                  {position.quantity < position.originalQuantity ? (
                                    <>
                                      <div 
                                        className="h-2 bg-indigo-500 dark:bg-indigo-400"
                                        style={{ width: `${(position.quantity / position.originalQuantity) * 60}px` }}
                                        title={`Remaining: ${position.quantity} shares`}
                                      />
                                      <div 
                                        className="h-2 bg-gray-300 dark:bg-gray-600 rounded-r-full"
                                        style={{ width: `${((position.originalQuantity - position.quantity) / position.originalQuantity) * 60}px` }}
                                        title={`Sold: ${position.originalQuantity - position.quantity} shares`}
                                      />
                                    </>
                                  ) : (
                                    <div 
                                      className="h-2 bg-indigo-500 dark:bg-indigo-400 rounded-r-full"
                                      style={{ width: "60px" }}
                                      title={`Full position: ${position.quantity} shares`}
                                    />
                                  )}
                                </div>
                                <span className="text-xs dark:text-gray-500 text-gray-500 ml-2">
                                  {Math.round((position.quantity / position.originalQuantity) * 100)}%
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 dark:text-gray-300 text-gray-700">
                        ${position.entryPrice.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 dark:text-gray-300 text-gray-700">
                        ${position.currentPrice.toFixed(2)}
                      </td>
                      <td className="px-4 py-3">
                        <div className={cn(
                          position.pnl >= 0 ? "text-teal-500" : "text-purple-500"
                        )}>
                          <p className="font-medium">
                            {position.pnl >= 0 ? "+" : ""}${Math.abs(position.pnl).toFixed(2)}
                          </p>
                          <p className="text-xs">
                            {position.pnlPercent >= 0 ? "+" : ""}{position.pnlPercent.toFixed(2)}%
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {(() => {
                          const risk = calculateRisk(position);
                          const riskPercent = position.value > 0 ? (Math.abs(risk) / position.value) * 100 : 0;
                          const isProtected = risk <= 0;
                          
                          return (
                            <div className={cn(
                              "font-semibold",
                              isProtected 
                                ? "text-teal-600 dark:text-teal-400" 
                                : riskPercent > 5 
                                  ? "text-rose-600 dark:text-rose-400"
                                  : "text-amber-600 dark:text-amber-400"
                            )}>
                              <p className="text-sm">
                                {isProtected ? (
                                  <span className="flex items-center gap-1">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                    </svg>
                                    Protected
                                  </span>
                                ) : (
                                  <>
                                    ${Math.abs(risk).toFixed(0)}
                                    <span className="text-xs ml-1">
                                      ({riskPercent.toFixed(1)}%)
                                    </span>
                                  </>
                                )}
                              </p>
                            </div>
                          );
                        })()}
                      </td>
                      <td className="px-4 py-3 dark:text-gray-300 text-gray-700">
                        ${position.value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-3">
                        <button className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">
                          <svg className="w-5 h-5 dark:text-gray-400 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                            <circle cx="12" cy="5" r="2" />
                            <circle cx="12" cy="12" r="2" />
                            <circle cx="12" cy="19" r="2" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </PageContent>
    </AppLayout>
  );
}