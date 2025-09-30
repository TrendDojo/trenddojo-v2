"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { PageContent } from "@/components/layout/PageContent";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Card } from "@/components/ui/Panel";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { NewPositionModal, type NewPositionData } from "@/components/positions/NewPositionModal";
import { LocalChart } from "@/components/charts/LocalChart";  // Using lightweight-charts v5 local dependency
import { refreshCoordinator } from "@/lib/refresh/RefreshCoordinator";

export default function StockPage() {
  const params = useParams();
  const symbol = params.symbol as string;

  // State for symbol validation
  const [isValidSymbol, setIsValidSymbol] = useState<boolean | null>(null);
  const [suggestedSymbols] = useState(['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'NVDA', 'META', 'BRK.B']);

  // State for symbol data
  const [symbolData, setSymbolData] = useState<any>({
    symbol: symbol?.toUpperCase() || 'LOADING',
    name: undefined,
    price: undefined,
    change: undefined,
    changePercent: undefined,
    volume: undefined,
    avgVolume: undefined,
    marketCap: undefined,
    pe: undefined,
    eps: undefined,
    high52: undefined,
    low52: undefined,
    open: undefined,
    high: undefined,
    low: undefined,
    previousClose: undefined,
    bid: undefined,
    ask: undefined,
    bidSize: undefined,
    askSize: undefined,
    beta: undefined,
    dividend: undefined,
    dividendYield: undefined,
    sector: undefined,
    industry: undefined,
    exchange: undefined,
    currency: 'USD'
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showNewPositionModal, setShowNewPositionModal] = useState(false);

  // Validate symbol first
  const validateSymbol = async () => {
    if (!symbol) return;

    try {
      const response = await fetch(`/api/market-data/validate/${symbol.toUpperCase()}`);
      if (response.ok) {
        setIsValidSymbol(true);
      } else {
        setIsValidSymbol(false);
        setLoading(false);
      }
    } catch (err) {
      console.error('Error validating symbol:', err);
      setIsValidSymbol(false);
      setLoading(false);
    }
  };

  // Define fetchData function outside useEffect so it can be reused
  const fetchData = async () => {
    if (!symbol || isValidSymbol === false) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/market-data/symbol/${symbol.toUpperCase()}`);

      if (!response.ok) {
        throw new Error('Failed to fetch symbol data');
      }

      const data = await response.json();
      setSymbolData(data);
    } catch (err) {
      console.error('Error fetching symbol data:', err);
      setError('Failed to load symbol data');
    } finally {
      setLoading(false);
    }
  };

  // Validate symbol on mount
  useEffect(() => {
    if (!symbol) return;
    validateSymbol();
  }, [symbol]);

  // Integrate with refresh coordinator
  useEffect(() => {
    if (!symbol || isValidSymbol !== true) return;

    // Initial load
    fetchData();

    // Subscribe to market-data refresh events
    const unsubscribe = refreshCoordinator.subscribe('market-data', async () => {
    // DEBUG: console.log(`[Symbol ${symbol}] Refreshing via coordinator`);
      await fetchData();
    });

    return unsubscribe;
  }, [symbol, isValidSymbol]);

  const formatNumber = (num: number | undefined) => {
    if (num === undefined || num === null) return '–';
    if (num >= 1000000000000) return `${(num / 1000000000000).toFixed(2)}T`;
    if (num >= 1000000000) return `${(num / 1000000000).toFixed(2)}B`;
    if (num >= 1000000) return `${(num / 1000000).toFixed(2)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toFixed(2);
  };

  const formatPrice = (price: number | undefined) => {
    if (price === undefined || price === null) return '–';
    return `$${price.toFixed(2)}`;
  };

  const formatPercent = (percent: number | undefined) => {
    if (percent === undefined || percent === null) return '–';
    return `${percent.toFixed(2)}%`;
  };

  // Show invalid symbol message
  if (isValidSymbol === false) {
    return (
      <PageContent>
        <div className="min-h-[70vh] flex items-center justify-center">
          <div className="text-center space-y-6 max-w-md">
            <div className="text-6xl mb-4">📊</div>
            <h2 className="text-2xl font-bold dark:text-white text-gray-900">
              Symbol Not Found
            </h2>
            <p className="text-lg dark:text-gray-400 text-gray-600">
              '{symbol?.toUpperCase()}' is not available in our database.
            </p>
            <p className="text-sm dark:text-gray-500 text-gray-500">
              We currently track S&P 500 symbols with historical data from September 2020.
            </p>
            <div className="pt-4">
              <p className="text-sm font-medium dark:text-gray-400 text-gray-600 mb-3">
                Try one of these symbols:
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {suggestedSymbols.map(s => (
                  <Link
                    key={s}
                    href={`/app/symbol/${s}`}
                    className="px-4 py-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition-colors font-medium"
                  >
                    {s}
                  </Link>
                ))}
              </div>
            </div>
            <div className="pt-4">
              <Link
                href="/app/screener"
                className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                ← Back to Screener
              </Link>
            </div>
          </div>
        </div>
      </PageContent>
    );
  }

  // Show loading while validating
  if (isValidSymbol === null) {
    return (
      <PageContent>
        <div className="min-h-[70vh] flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
            <p className="text-sm dark:text-gray-400 text-gray-600">Validating symbol...</p>
          </div>
        </div>
      </PageContent>
    );
  }

  return (

      <PageContent>
        {/* Breadcrumb */}
        <div className="mb-6">
          <Breadcrumb
            items={[
              { label: "Screener", href: "/app/screener" },
              { label: symbolData.symbol }
            ]}
          />
        </div>

        {/* Header Section */}
        <div className="mb-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold dark:text-white text-gray-900 mb-2">
                {symbolData.symbol}
              </h1>
              <p className="text-lg dark:text-gray-400 text-gray-600">
                {loading ? (
                  <span className="animate-pulse">Loading...</span>
                ) : (
                  symbolData.name || '–'
                )}
              </p>
              <p className="text-sm dark:text-gray-500 text-gray-500 mt-1">
                {loading ? (
                  <span className="animate-pulse">Loading market info...</span>
                ) : (
                  [symbolData.exchange, symbolData.sector, symbolData.industry]
                    .filter(Boolean)
                    .join(' • ') || '–'
                )}
              </p>
            </div>
            <div className="flex items-start gap-6">
              <div className="text-right">
                {loading ? (
                  <div>
                    <div className="text-3xl font-bold dark:text-gray-600 text-gray-400 animate-pulse">
                      Loading...
                    </div>
                    <div className="text-lg dark:text-gray-600 text-gray-400 animate-pulse mt-1">
                      Fetching price...
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="text-3xl font-bold dark:text-white text-gray-900">
                      {formatPrice(symbolData.price)}
                    </div>
                    <div className={cn(
                      "text-lg font-medium",
                      symbolData.change !== undefined && symbolData.change >= 0 ? "text-success" :
                      symbolData.change !== undefined ? "text-danger" : "dark:text-gray-400 text-gray-600"
                    )}>
                      {symbolData.change !== undefined ? (
                        `${symbolData.change >= 0 ? '+' : ''}${symbolData.change.toFixed(2)} (${symbolData.changePercent >= 0 ? '+' : ''}${symbolData.changePercent.toFixed(2)}%)`
                      ) : '–'}
                    </div>
                  </>
                )}
              </div>
              <Button
                variant="primary"
                size="lg"
                onClick={() => setShowNewPositionModal(true)}
                disabled={loading}
              >
                Create Position
              </Button>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-lg">
            <p className="text-red-700 dark:text-red-400 font-medium">{error}</p>
            <p className="text-sm text-red-600 dark:text-red-400/70 mt-1">
              Using cached or placeholder data. Please try refreshing the page.
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mb-8 flex gap-3">
          <Link href="/app/screener">
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
          {/* Left Column - Chart */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-4">
              <LocalChart symbol={symbolData.symbol} />
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
                  <span className="font-medium dark:text-white text-gray-900">{formatPrice(symbolData.open)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="dark:text-gray-400 text-gray-600">Day Range</span>
                  <span className="font-medium dark:text-white text-gray-900">
                    {symbolData.low !== undefined && symbolData.high !== undefined ?
                      `${formatPrice(symbolData.low)} - ${formatPrice(symbolData.high)}` : '–'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="dark:text-gray-400 text-gray-600">52 Week Range</span>
                  <span className="font-medium dark:text-white text-gray-900">
                    {symbolData.low52 !== undefined && symbolData.high52 !== undefined ?
                      `${formatPrice(symbolData.low52)} - ${formatPrice(symbolData.high52)}` : '–'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="dark:text-gray-400 text-gray-600">Volume</span>
                  <span className="font-medium dark:text-white text-gray-900">{formatNumber(symbolData.volume)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="dark:text-gray-400 text-gray-600">Avg Volume</span>
                  <span className="font-medium dark:text-white text-gray-900">{formatNumber(symbolData.avgVolume)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="dark:text-gray-400 text-gray-600">Market Cap</span>
                  <span className="font-medium dark:text-white text-gray-900">
                    {symbolData.marketCap !== undefined ? `$${formatNumber(symbolData.marketCap)}` : '–'}
                  </span>
                </div>
              </div>
            </Card>

            {/* Fundamentals */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold dark:text-white text-gray-900 mb-4">Fundamentals</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="dark:text-gray-400 text-gray-600">P/E Ratio</span>
                  <span className="font-medium dark:text-white text-gray-900">
                    {symbolData.pe !== undefined ? symbolData.pe.toFixed(2) : '–'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="dark:text-gray-400 text-gray-600">EPS</span>
                  <span className="font-medium dark:text-white text-gray-900">{formatPrice(symbolData.eps)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="dark:text-gray-400 text-gray-600">Beta</span>
                  <span className="font-medium dark:text-white text-gray-900">
                    {symbolData.beta !== undefined ? symbolData.beta.toFixed(2) : '–'}
                  </span>
                </div>
                {symbolData.dividend !== undefined && symbolData.dividend > 0 && (
                  <>
                    <div className="flex justify-between">
                      <span className="dark:text-gray-400 text-gray-600">Dividend</span>
                      <span className="font-medium dark:text-white text-gray-900">{formatPrice(symbolData.dividend)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="dark:text-gray-400 text-gray-600">Yield</span>
                      <span className="font-medium dark:text-white text-gray-900">{formatPercent(symbolData.dividendYield)}</span>
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
                    <span className="text-xs dark:text-gray-500 text-gray-500 ml-2">
                      {symbolData.bidSize !== undefined ? `×${symbolData.bidSize}` : ''}
                    </span>
                  </div>
                  <span className="font-medium dark:text-white text-gray-900">{formatPrice(symbolData.bid)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-danger font-medium">Ask</span>
                    <span className="text-xs dark:text-gray-500 text-gray-500 ml-2">
                      {symbolData.askSize !== undefined ? `×${symbolData.askSize}` : ''}
                    </span>
                  </div>
                  <span className="font-medium dark:text-white text-gray-900">{formatPrice(symbolData.ask)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="dark:text-gray-400 text-gray-600">Spread</span>
                  <span className="font-medium dark:text-white text-gray-900">
                    {symbolData.ask !== undefined && symbolData.bid !== undefined ?
                      formatPrice(symbolData.ask - symbolData.bid) : '–'}
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* New Position Modal */}
        <NewPositionModal
          isOpen={showNewPositionModal}
          onClose={() => setShowNewPositionModal(false)}
          accountType="paper" // Default to paper, in production would check user's settings
          prefilledSymbol={symbolData.symbol}
          onSubmit={async (positionData: NewPositionData) => {
            // In production, this would submit to API
    // DEBUG: console.log("Creating position:", positionData);
            // Mock success
            await new Promise(resolve => setTimeout(resolve, 1000));
            // Could navigate to positions page or show success toast
          }}
        />
      </PageContent>
    
  );
}