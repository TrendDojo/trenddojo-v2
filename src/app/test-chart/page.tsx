'use client';

import { LocalChart } from '@/components/charts/LocalChart';
import { useState } from 'react';

export default function TestChartPage() {
  const [symbol, setSymbol] = useState('AAPL');
  const [inputValue, setInputValue] = useState('AAPL');

  const testSymbols = ['AAPL', 'GOOGL', 'MSFT', 'TSLA', 'AMZN'];

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Chart Test Page</h1>

      <div className="mb-6 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Test Symbol:</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value.toUpperCase())}
              className="px-3 py-2 border rounded-md"
              placeholder="Enter symbol"
            />
            <button
              onClick={() => setSymbol(inputValue)}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Load Chart
            </button>
          </div>
        </div>

        <div className="flex gap-2">
          {testSymbols.map((sym) => (
            <button
              key={sym}
              onClick={() => {
                setSymbol(sym);
                setInputValue(sym);
              }}
              className={`px-3 py-1 rounded ${
                symbol === sym
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              {sym}
            </button>
          ))}
        </div>
      </div>

      <div className="border rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-4">
          Chart for: {symbol}
        </h2>
        <div className="h-[500px]">
          <LocalChart symbol={symbol} />
        </div>
      </div>

      <div className="mt-6 p-4 bg-gray-100 rounded">
        <h3 className="font-semibold mb-2">Debug Info:</h3>
        <ul className="text-sm space-y-1">
          <li>Current Symbol: {symbol}</li>
          <li>API Endpoint: /api/market-data/history/{symbol}</li>
          <li>Date Range: Dynamic based on timeframe selection</li>
        </ul>
      </div>
    </div>
  );
}