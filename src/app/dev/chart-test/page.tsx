"use client";

import { useState, useEffect } from 'react';
import { LocalChart } from '@/components/charts/LocalChart';  // Using local dependency

export default function ChartTestPage() {
  const [showChart, setShowChart] = useState(false);
  const [symbol, setSymbol] = useState('AAPL');

  // Auto-show chart after a delay to test initial rendering
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowChart(true);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Chart Debug Test</h1>

      <div className="mb-4 space-x-2">
        <button
          onClick={() => setShowChart(!showChart)}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          {showChart ? 'Hide' : 'Show'} Chart
        </button>

        <button
          onClick={() => setSymbol('MSFT')}
          className="px-4 py-2 bg-green-500 text-white rounded"
        >
          Switch to MSFT
        </button>

        <button
          onClick={() => setSymbol('AAPL')}
          className="px-4 py-2 bg-green-500 text-white rounded"
        >
          Switch to AAPL
        </button>

        <button
          onClick={() => {
            setShowChart(false);
            setTimeout(() => setShowChart(true), 100);
          }}
          className="px-4 py-2 bg-yellow-500 text-white rounded"
        >
          Remount Chart
        </button>
      </div>

      <div className="mb-4 text-sm">
        <p>Current Symbol: {symbol}</p>
        <p>Chart Visible: {showChart ? 'Yes' : 'No'}</p>
        <p>Using local lightweight-charts dependency (always available)</p>
      </div>

      {showChart && (
        <div className="border-2 border-red-500 p-4">
          <LocalChart symbol={symbol} />
        </div>
      )}

      {/* Console output area */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-2">Debug Instructions:</h2>
        <ol className="list-decimal list-inside space-y-1 text-sm">
          <li>Open browser console (F12)</li>
          <li>Look for console.log messages from chart initialization</li>
          <li>Chart should load instantly (no CDN dependency)</li>
          <li>Click "Show Chart" if not auto-shown</li>
          <li>Note any error messages in console</li>
        </ol>
      </div>
    </div>
  );
}