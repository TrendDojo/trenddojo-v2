"use client";

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { TrendingUp, CandlestickChart, Maximize2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function WorkingChart({ symbol }: { symbol: string }) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const [chartType, setChartType] = useState<'candles' | 'line'>('candles');
  const [timeframe, setTimeframe] = useState('1Y');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    let chart: any = null;

    // Dynamically import the entire library
    const loadChart = async () => {
      try {
        setLoading(true);
        setError(null);

        // Import the library
        const LightweightCharts = await import('lightweight-charts');
    // DEBUG: console.log('Library loaded:', LightweightCharts);

        // Clean up any existing chart
        const existingCanvas = chartContainerRef.current?.querySelector('canvas');
        if (existingCanvas) {
          existingCanvas.remove();
        }

        // Create the chart
        chart = LightweightCharts.createChart(chartContainerRef.current!, {
          width: chartContainerRef.current!.clientWidth,
          height: 400,
          layout: {
            background: { type: LightweightCharts.ColorType.Solid, color: 'transparent' },
            textColor: '#9CA3AF',
          },
          grid: {
            vertLines: { color: 'rgba(156, 163, 175, 0.1)' },
            horzLines: { color: 'rgba(156, 163, 175, 0.1)' },
          },
        });

    // DEBUG: console.log('Chart created:', chart);

        // Add price series based on chart type
        let priceSeries: any;
        if (chartType === 'candles') {
          priceSeries = chart.addCandlestickSeries({
            upColor: '#10B981',
            downColor: '#EF4444',
            borderUpColor: '#10B981',
            borderDownColor: '#EF4444',
            wickUpColor: '#10B981',
            wickDownColor: '#EF4444',
          });

          // Set sample data
          const candleData = [
            { time: '2024-01-01', open: 100, high: 110, low: 90, close: 105 },
            { time: '2024-01-02', open: 105, high: 115, low: 100, close: 110 },
            { time: '2024-01-03', open: 110, high: 120, low: 105, close: 115 },
            { time: '2024-01-04', open: 115, high: 125, low: 110, close: 120 },
            { time: '2024-01-05', open: 120, high: 130, low: 115, close: 125 },
          ];
          priceSeries.setData(candleData);
        } else {
          priceSeries = chart.addLineSeries({
            color: '#6366F1',
            lineWidth: 2,
          });

          // Set sample data
          const lineData = [
            { time: '2024-01-01', value: 100 },
            { time: '2024-01-02', value: 105 },
            { time: '2024-01-03', value: 110 },
            { time: '2024-01-04', value: 115 },
            { time: '2024-01-05', value: 120 },
          ];
          priceSeries.setData(lineData);
        }

        // Add volume
        const volumeSeries = chart.addHistogramSeries({
          color: '#6366F1',
          priceFormat: {
            type: 'volume',
          },
          priceScaleId: 'volume',
        });

        chart.priceScale('volume').applyOptions({
          scaleMargins: {
            top: 0.8,
            bottom: 0,
          },
        });

        const volumeData = [
          { time: '2024-01-01', value: 1000000, color: '#10B98120' },
          { time: '2024-01-02', value: 1500000, color: '#10B98120' },
          { time: '2024-01-03', value: 1200000, color: '#10B98120' },
          { time: '2024-01-04', value: 1800000, color: '#10B98120' },
          { time: '2024-01-05', value: 2000000, color: '#10B98120' },
        ];
        volumeSeries.setData(volumeData);

        chart.timeScale().fitContent();
        setLoading(false);
      } catch (err) {
        console.error('Chart error:', err);
        setError(String(err));
        setLoading(false);
      }
    };

    loadChart();

    // Cleanup
    return () => {
      if (chart) {
        try {
          chart.remove();
        } catch (e) {
          console.error('Cleanup error:', e);
        }
      }
    };
  }, [chartType, symbol]);

  const timeframes = ['1D', '1W', '1M', '3M', '1Y', '5Y', 'ALL'];

  return (
    <div className="w-full">
      {/* Controls */}
      <div className="flex items-center justify-between mb-4">
        {/* Timeframe selector */}
        <div className="flex gap-1">
          {timeframes.map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={cn(
                "px-3 py-1.5 text-sm font-medium rounded-lg transition-colors",
                timeframe === tf
                  ? "bg-indigo-500 text-white"
                  : "dark:bg-slate-700 bg-gray-100 dark:text-gray-300 text-gray-700 hover:bg-gray-200 dark:hover:bg-slate-600"
              )}
            >
              {tf}
            </button>
          ))}
        </div>

        {/* Chart type toggle */}
        <div className="flex rounded-lg dark:bg-slate-800 bg-gray-100 p-0.5">
          <button
            onClick={() => setChartType('candles')}
            className={cn(
              "p-1.5 rounded-md transition-colors",
              chartType === 'candles'
                ? "dark:bg-slate-700 bg-white dark:text-white text-gray-900"
                : "dark:text-gray-400 text-gray-600"
            )}
            title="Candlestick chart"
          >
            <CandlestickChart className="w-4 h-4" />
          </button>
          <button
            onClick={() => setChartType('line')}
            className={cn(
              "p-1.5 rounded-md transition-colors",
              chartType === 'line'
                ? "dark:bg-slate-700 bg-white dark:text-white text-gray-900"
                : "dark:text-gray-400 text-gray-600"
            )}
            title="Line chart"
          >
            <TrendingUp className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Chart container */}
      <div className="relative rounded-lg dark:bg-slate-900 bg-white border dark:border-slate-700 border-gray-200">
        {loading ? (
          <div className="flex items-center justify-center h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mx-auto mb-2"></div>
              <p className="text-sm dark:text-gray-400 text-gray-600">Loading chart...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-[400px]">
            <div className="text-center">
              <p className="text-sm text-red-500">Error loading chart: {error}</p>
            </div>
          </div>
        ) : (
          <div ref={chartContainerRef} style={{ height: '400px' }} />
        )}
      </div>
    </div>
  );
}