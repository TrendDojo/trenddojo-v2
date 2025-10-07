"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Card } from "@/components/ui/Panel";
import { Button } from "@/components/ui/Button";
import { PageContent } from "@/components/layout/PageContent";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return; // Still loading
    if (!session) router.push("/login"); // Not logged in
  }, [session, status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen dark:bg-slate-900 bg-gray-50 flex items-center justify-center">
        <div className="dark:text-white text-gray-900">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return null; // Will redirect
  }

  // Mock data for strategies
  const strategies = [
    { name: "Growth Strategy", value: 45234.56, change: 2564.32, percent: 5.67 },
    { name: "Value Strategy", value: 32145.78, change: -876.54, percent: -2.65 },
    { name: "Tech Focus", value: 28456.90, change: 1234.56, percent: 4.34 },
    { name: "Dividend Income", value: 19876.54, change: 234.56, percent: 1.18 },
  ];

  // Mock data for biggest movers
  const biggestGainers = [
    { symbol: "NVDA", name: "NVIDIA Corp", change: 12.34, percent: 8.56, value: 156.78 },
    { symbol: "AAPL", name: "Apple Inc", change: 6.45, percent: 4.23, value: 158.92 },
    { symbol: "GOOGL", name: "Alphabet Inc", change: 8.91, percent: 3.87, value: 238.45 },
    { symbol: "MSFT", name: "Microsoft Corp", change: 7.23, percent: 2.45, value: 302.56 },
    { symbol: "AMZN", name: "Amazon.com", change: 3.45, percent: 1.89, value: 185.67 },
  ];

  const biggestLosers = [
    { symbol: "TSLA", name: "Tesla Inc", change: -15.67, percent: -5.43, value: 273.45 },
    { symbol: "INTC", name: "Intel Corp", change: -2.45, percent: -4.87, value: 47.85 },
    { symbol: "AMD", name: "AMD Inc", change: -5.23, percent: -3.21, value: 158.45 },
    { symbol: "META", name: "Meta Platforms", change: -8.34, percent: -2.56, value: 318.23 },
    { symbol: "NFLX", name: "Netflix Inc", change: -6.78, percent: -1.45, value: 461.32 },
  ];

  const totalValue = strategies.reduce((sum, p) => sum + p.value, 0);
  const totalChange = strategies.reduce((sum, p) => sum + p.change, 0);
  const totalPercent = (totalChange / (totalValue - totalChange)) * 100;

  return (
    <PageContent>

          {/* Main Account Value Card - Full Width */}
          <Card className="mb-6">
            {/* Account Value Section - Responsive */}
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-6 gap-4 lg:gap-0">
              {/* Welcome Message */}
              <div>
                <h2 className="text-xl lg:text-2xl font-semibold dark:text-white text-gray-900">
                  Welcome back, {session.user?.email?.split('@')[0]}!
                </h2>
                <p className="dark:text-gray-400 text-gray-600 mt-1">
                  Here's your portfolio performance overview
                </p>
              </div>

              {/* Total Account Value */}
              <div className="lg:text-right">
                <p className="text-sm dark:text-gray-400 text-gray-600 mb-1">Total Account Value</p>
                <h1 className="text-3xl lg:text-5xl font-bold dark:text-white text-gray-900">
                  ${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </h1>
                <div className="flex items-center gap-2 lg:justify-end mt-2">
                  <span className={totalChange >= 0 ? "text-success text-xl lg:text-2xl font-semibold" : "text-danger text-xl lg:text-2xl font-semibold"}>
                    {totalChange >= 0 ? '+' : ''}{totalChange.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                  <span className={`px-2 py-1 rounded text-sm font-medium ${totalChange >= 0 ? 'bg-success/20 text-success' : 'bg-danger/20 text-danger'}`}>
                    {totalChange >= 0 ? '+' : ''}{totalPercent.toFixed(2)}%
                  </span>
                </div>
                <p className="text-sm dark:text-gray-500 text-gray-500 mt-2">
                  Last updated: {new Date().toLocaleTimeString()}
                </p>
              </div>
            </div>

            {/* Chart and Stats Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Static Chart - Takes 2/3 width */}
              <div className="lg:col-span-2">
                <div className="h-64 dark:bg-slate-800/50 bg-gray-100 rounded-lg p-4">
                  <div className="h-full flex items-end justify-between gap-2">
                    {/* Mock chart bars */}
                    {[65, 72, 68, 85, 74, 89, 92, 78, 95, 88, 92, 98].map((height, i) => (
                      <div key={i} className="flex-1 flex flex-col justify-end">
                        <div 
                          className={`bg-gradient-to-t ${i === 11 ? 'from-teal-600 to-teal-400' : 'from-rose-600 to-rose-400'} rounded-t`}
                          style={{ height: `${height}%` }}
                        />
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between mt-2 text-xs dark:text-gray-500 text-gray-500">
                    <span>Jan</span>
                    <span>Feb</span>
                    <span>Mar</span>
                    <span>Apr</span>
                    <span>May</span>
                    <span>Jun</span>
                    <span>Jul</span>
                    <span>Aug</span>
                    <span>Sep</span>
                    <span>Oct</span>
                    <span>Nov</span>
                    <span>Dec</span>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex gap-3 mt-4">
                  <Button variant="secondary" onClick={() => router.push("/app/positions")}>
                    View Positions
                  </Button>
                  <Button variant="primary" onClick={() => router.push("/app/screener")}>
                    Open Screener
                  </Button>
                </div>
              </div>

              {/* Quick Stats - Vertically Stacked on Right */}
              <div className="space-y-3">
                <div className="p-4 dark:bg-slate-800/50 bg-gray-50 rounded-lg">
                  <p className="text-sm dark:text-gray-400 text-gray-600 mb-1">Day's Gain</p>
                  <p className="text-xl font-semibold text-success">+$1,234.56</p>
                  <p className="text-sm text-success">+2.34%</p>
                </div>
                
                <div className="p-4 dark:bg-slate-800/50 bg-gray-50 rounded-lg">
                  <p className="text-sm dark:text-gray-400 text-gray-600 mb-1">Total Return</p>
                  <p className="text-xl font-semibold text-success">+$8,765.43</p>
                  <p className="text-sm text-success">+12.56%</p>
                </div>
                
                <div className="p-4 dark:bg-slate-800/50 bg-gray-50 rounded-lg">
                  <p className="text-sm dark:text-gray-400 text-gray-600 mb-1">Win Rate</p>
                  <p className="text-xl font-semibold dark:text-white text-gray-900">68%</p>
                  <p className="text-sm dark:text-gray-400 text-gray-600">42 trades</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Strategies Section - Horizontal Layout */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold dark:text-white text-gray-900">
                Strategies
              </h3>
              <button className="px-4 py-2 dark:bg-slate-800/50 bg-gray-100 hover:dark:bg-slate-800 hover:bg-gray-200 rounded-lg transition-colors dark:text-gray-400 text-gray-600 font-medium">
                + Create New Strategy
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {strategies.map((strategy, index) => (
                <Card 
                  key={index}
                  className="hover:dark:bg-slate-800/70 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="font-medium dark:text-white text-gray-900">
                      {strategy.name}
                    </h4>
                    <span className={`text-sm font-medium px-2 py-0.5 rounded ${
                      strategy.change >= 0
                        ? 'bg-success/20 text-success'
                        : 'bg-danger/20 text-danger'
                    }`}>
                      {strategy.change >= 0 ? '+' : ''}{strategy.percent.toFixed(2)}%
                    </span>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-2xl font-semibold dark:text-white text-gray-900">
                      ${strategy.value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                    <p className={strategy.change >= 0 ? "text-success" : "text-danger"}>
                      {strategy.change >= 0 ? '+' : ''}${Math.abs(strategy.change).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Biggest Winners and Losers - Two Columns */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            {/* Gainers Column */}
            <Card>
              <h3 className="text-lg font-semibold dark:text-white text-gray-900 mb-4 text-success">
                Gainers
              </h3>
              
              <div className="space-y-3">
                {biggestGainers.map((stock) => (
                  <div 
                    key={stock.symbol}
                    className="flex items-center justify-between p-3 dark:bg-slate-800/50 bg-gray-50 rounded-lg hover:dark:bg-slate-800 hover:bg-gray-100 transition-colors cursor-pointer"
                  >
                    <div className="flex-1">
                      <div className="font-medium dark:text-white text-gray-900">
                        {stock.symbol}
                      </div>
                      <div className="text-sm dark:text-gray-400 text-gray-600">
                        ${stock.value.toFixed(2)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-success">
                        +${stock.change.toFixed(2)}
                      </div>
                      <div className="text-sm">
                        <span className="px-2 py-0.5 rounded bg-teal-500/20 text-success font-medium">
                          +{stock.percent.toFixed(2)}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Losers Column */}
            <Card>
              <h3 className="text-lg font-semibold dark:text-white text-gray-900 mb-4 text-danger">
                Drawdowns
              </h3>
              
              <div className="space-y-3">
                {biggestLosers.map((stock) => (
                  <div 
                    key={stock.symbol}
                    className="flex items-center justify-between p-3 dark:bg-slate-800/50 bg-gray-50 rounded-lg hover:dark:bg-slate-800 hover:bg-gray-100 transition-colors cursor-pointer"
                  >
                    <div className="flex-1">
                      <div className="font-medium dark:text-white text-gray-900">
                        {stock.symbol}
                      </div>
                      <div className="text-sm dark:text-gray-400 text-gray-600">
                        ${stock.value.toFixed(2)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-danger">
                        ${stock.change.toFixed(2)}
                      </div>
                      <div className="text-sm">
                        <span className="px-2 py-0.5 rounded bg-danger/20 text-danger font-medium">
                          {stock.percent.toFixed(2)}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
    </PageContent>
  );
}