"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { AppLayout } from "@/components/layout/AppLayout";
import { PageContent } from "@/components/layout/PageContent";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Card } from "@/components/ui/Panel";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

// Mock data - would come from API in production
const mockStockData: Record<string, any> = {
  'AAPL': {
    symbol: 'AAPL',
    name: 'Apple Inc.',
    price: 178.35,
    change: 2.15,
    changePercent: 1.22,
    volume: 52300000,
    avgVolume: 48500000,
    marketCap: 2800000000000,
    pe: 28.5,
    eps: 6.26,
    high52: 199.62,
    low52: 164.08,
    open: 176.50,
    high: 179.20,
    low: 175.80,
    previousClose: 176.20,
    bid: 178.34,
    ask: 178.36,
    bidSize: 100,
    askSize: 200,
    beta: 1.25,
    dividend: 0.96,
    dividendYield: 0.54,
    sector: 'Technology',
    industry: 'Consumer Electronics',
    exchange: 'NASDAQ',
    currency: 'USD'
  },
  'MSFT': {
    symbol: 'MSFT',
    name: 'Microsoft Corporation',
    price: 425.12,
    change: -3.28,
    changePercent: -0.77,
    volume: 23100000,
    avgVolume: 25000000,
    marketCap: 3100000000000,
    pe: 35.2,
    eps: 12.07,
    high52: 450.50,
    low52: 380.25,
    open: 428.00,
    high: 429.50,
    low: 424.00,
    previousClose: 428.40,
    bid: 425.10,
    ask: 425.14,
    bidSize: 150,
    askSize: 175,
    beta: 0.93,
    dividend: 3.00,
    dividendYield: 0.71,
    sector: 'Technology',
    industry: 'Software',
    exchange: 'NASDAQ',
    currency: 'USD'
  },
  'GOOGL': {
    symbol: 'GOOGL',
    name: 'Alphabet Inc.',
    price: 142.85,
    change: 0.95,
    changePercent: 0.67,
    volume: 18900000,
    avgVolume: 20000000,
    marketCap: 1800000000000,
    pe: 25.8,
    eps: 5.54,
    high52: 155.20,
    low52: 128.50,
    open: 141.50,
    high: 143.20,
    low: 141.00,
    previousClose: 141.90,
    bid: 142.84,
    ask: 142.86,
    bidSize: 200,
    askSize: 225,
    beta: 1.05,
    dividend: 0,
    dividendYield: 0,
    sector: 'Technology',
    industry: 'Internet Services',
    exchange: 'NASDAQ',
    currency: 'USD'
  }
};

export default function StockPage() {
  const params = useParams();
  const symbol = params.symbol as string;

  // Initialize with data immediately to avoid hydration mismatch
  const initialData = mockStockData[symbol?.toUpperCase()] || {
    symbol: symbol?.toUpperCase() || 'UNKNOWN',
    name: 'Unknown Stock',
    price: 100.00,
    change: 0,
    changePercent: 0,
    volume: 0,
    avgVolume: 0,
    marketCap: 0,
    pe: 0,
    eps: 0,
    high52: 120.00,
    low52: 80.00,
    open: 100.00,
    high: 100.00,
    low: 100.00,
    previousClose: 100.00,
    bid: 99.99,
    ask: 100.01,
    bidSize: 100,
    askSize: 100,
    beta: 1.0,
    dividend: 0,
    dividendYield: 0,
    sector: 'Unknown',
    industry: 'Unknown',
    exchange: 'Unknown',
    currency: 'USD'
  };

  const [stockData, setStockData] = useState<any>(initialData);
  const [selectedTimeframe, setSelectedTimeframe] = useState('1D');

  useEffect(() => {
    // In production, this would fetch real data from API
    // For now, we already have the data from initialization
    setStockData(initialData);
  }, [symbol]);

  const formatNumber = (num: number) => {
    if (num >= 1000000000000) return `${(num / 1000000000000).toFixed(2)}T`;
    if (num >= 1000000000) return `${(num / 1000000000).toFixed(2)}B`;
    if (num >= 1000000) return `${(num / 1000000).toFixed(2)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toFixed(2);
  };

  const timeframes = ['1D', '1W', '1M', '3M', '1Y', '5Y', 'ALL'];

  return (
    <AppLayout>
      <PageContent>
        {/* Breadcrumb */}
        <div className="mb-6">
          <Breadcrumb
            items={[
              { label: "Screener", href: "/screener" },
              { label: stockData.symbol }
            ]}
          />
        </div>

        {/* Header Section */}
        <div className="mb-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold dark:text-white text-gray-900 mb-2">
                {stockData.symbol}
              </h1>
              <p className="text-lg dark:text-gray-400 text-gray-600">
                {stockData.name}
              </p>
              <p className="text-sm dark:text-gray-500 text-gray-500 mt-1">
                {stockData.exchange} • {stockData.sector} • {stockData.industry}
              </p>
            </div>
            <div className="flex items-start gap-6">
              <div className="text-right">
                <div className="text-3xl font-bold dark:text-white text-gray-900">
                  ${stockData.price.toFixed(2)}
                </div>
                <div className={cn(
                  "text-lg font-medium",
                  stockData.change >= 0 ? "text-success" : "text-danger"
                )}>
                  {stockData.change >= 0 ? '+' : ''}{stockData.change.toFixed(2)} ({stockData.changePercent >= 0 ? '+' : ''}{stockData.changePercent.toFixed(2)}%)
                </div>
              </div>
              <Button variant="primary" size="lg">
                Create Position
              </Button>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mb-8 flex gap-3">
          <Link href="/screener">
            <Button variant="secondary" size="sm">
              ← Back to Screener
            </Button>
          </Link>
          <Button variant="secondary" size="sm">
            Add to Watchlist
          </Button>
          <Button variant="secondary" size="sm">
            Set Alert
          </Button>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Chart and Timeframe */}
          <div className="lg:col-span-2 space-y-6">
            {/* Chart Timeframe Selector */}
            <Card className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex gap-1">
                  {timeframes.map((tf) => (
                    <button
                      key={tf}
                      onClick={() => setSelectedTimeframe(tf)}
                      className={cn(
                        "px-4 py-2 text-sm font-medium rounded-lg transition-colors",
                        selectedTimeframe === tf
                          ? "bg-indigo-500 text-white"
                          : "dark:bg-slate-700 bg-gray-100 dark:text-gray-300 text-gray-700 hover:bg-gray-200 dark:hover:bg-slate-600"
                      )}
                    >
                      {tf}
                    </button>
                  ))}
                </div>
                <Button variant="secondary" size="sm">
                  Full Screen
                </Button>
              </div>

              {/* Chart Placeholder */}
              <div className="h-96 flex items-center justify-center border-2 border-dashed dark:border-slate-600 border-gray-300 rounded-lg">
                <div className="text-center">
                  <svg className="w-20 h-20 mx-auto mb-4 dark:text-gray-600 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <p className="text-lg font-medium dark:text-white text-gray-900 mb-2">
                    {stockData.symbol} Chart - {selectedTimeframe}
                  </p>
                  <p className="text-sm dark:text-gray-400 text-gray-600">
                    Interactive chart will be displayed here
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column - Stock Details */}
          <div className="space-y-6">
            {/* Key Stats */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold dark:text-white text-gray-900 mb-4">Key Statistics</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="dark:text-gray-400 text-gray-600">Open</span>
                  <span className="font-medium dark:text-white text-gray-900">${stockData.open?.toFixed(2) || '0.00'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="dark:text-gray-400 text-gray-600">Day Range</span>
                  <span className="font-medium dark:text-white text-gray-900">${stockData.low?.toFixed(2) || '0.00'} - ${stockData.high?.toFixed(2) || '0.00'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="dark:text-gray-400 text-gray-600">52 Week Range</span>
                  <span className="font-medium dark:text-white text-gray-900">${stockData.low52?.toFixed(2) || '0.00'} - ${stockData.high52?.toFixed(2) || '0.00'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="dark:text-gray-400 text-gray-600">Volume</span>
                  <span className="font-medium dark:text-white text-gray-900">{formatNumber(stockData.volume)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="dark:text-gray-400 text-gray-600">Avg Volume</span>
                  <span className="font-medium dark:text-white text-gray-900">{formatNumber(stockData.avgVolume)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="dark:text-gray-400 text-gray-600">Market Cap</span>
                  <span className="font-medium dark:text-white text-gray-900">${formatNumber(stockData.marketCap)}</span>
                </div>
              </div>
            </Card>

            {/* Fundamentals */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold dark:text-white text-gray-900 mb-4">Fundamentals</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="dark:text-gray-400 text-gray-600">P/E Ratio</span>
                  <span className="font-medium dark:text-white text-gray-900">{stockData.pe?.toFixed(2) || '0.00'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="dark:text-gray-400 text-gray-600">EPS</span>
                  <span className="font-medium dark:text-white text-gray-900">${stockData.eps?.toFixed(2) || '0.00'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="dark:text-gray-400 text-gray-600">Beta</span>
                  <span className="font-medium dark:text-white text-gray-900">{stockData.beta?.toFixed(2) || '1.00'}</span>
                </div>
                {stockData.dividend > 0 && (
                  <>
                    <div className="flex justify-between">
                      <span className="dark:text-gray-400 text-gray-600">Dividend</span>
                      <span className="font-medium dark:text-white text-gray-900">${stockData.dividend?.toFixed(2) || '0.00'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="dark:text-gray-400 text-gray-600">Yield</span>
                      <span className="font-medium dark:text-white text-gray-900">{stockData.dividendYield?.toFixed(2) || '0.00'}%</span>
                    </div>
                  </>
                )}
              </div>
            </Card>

            {/* Order Book */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold dark:text-white text-gray-900 mb-4">Order Book</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-success font-medium">Bid</span>
                    <span className="text-xs dark:text-gray-500 text-gray-500 ml-2">×{stockData.bidSize}</span>
                  </div>
                  <span className="font-medium dark:text-white text-gray-900">${stockData.bid?.toFixed(2) || '0.00'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-danger font-medium">Ask</span>
                    <span className="text-xs dark:text-gray-500 text-gray-500 ml-2">×{stockData.askSize}</span>
                  </div>
                  <span className="font-medium dark:text-white text-gray-900">${stockData.ask?.toFixed(2) || '0.00'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="dark:text-gray-400 text-gray-600">Spread</span>
                  <span className="font-medium dark:text-white text-gray-900">${(stockData.ask - stockData.bid).toFixed(2)}</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </PageContent>
    </AppLayout>
  );
}