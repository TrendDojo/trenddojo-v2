"use client";

import { useEffect, useRef, useState } from 'react';
import { createChart, ColorType, LineStyle } from 'lightweight-charts';
import type { IChartApi, ISeriesApi, Time } from 'lightweight-charts';
import { Button } from '@/components/ui/Button';
import { TrendingUp, CandlestickChart, Maximize2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PriceChartProps {
  symbol: string;
  mode?: 'view' | 'edit';
  className?: string;
  height?: number;
  position?: {
    entry?: number;
    stopLoss?: number;
    takeProfit?: number;
    quantity?: number;
  };
  onPositionChange?: (position: any) => void;
  onFullScreen?: () => void;
}

type ChartData = {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  value: number;
  volume: number;
}[];

export function PriceChart({
  symbol,
  mode = 'view',
  className,
  height = 400,
  position,
  onPositionChange,
  onFullScreen
}: PriceChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<any>(null);
  const seriesRef = useRef<any>(null);
  const volumeSeriesRef = useRef<any>(null);

  const [chartType, setChartType] = useState<'candles' | 'line'>('candles');
  const [timeframe, setTimeframe] = useState('1Y');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ChartData>([]);
  const [currentPrice, setCurrentPrice] = useState<number>(0);

  // Fetch price data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Calculate date range based on timeframe
        const to = new Date();
        const from = new Date();

        switch(timeframe) {
          case '1D': from.setDate(to.getDate() - 1); break;
          case '1W': from.setDate(to.getDate() - 7); break;
          case '1M': from.setMonth(to.getMonth() - 1); break;
          case '3M': from.setMonth(to.getMonth() - 3); break;
          case '1Y': from.setFullYear(to.getFullYear() - 1); break;
          case '5Y': from.setFullYear(to.getFullYear() - 5); break;
          case 'ALL': from.setFullYear(to.getFullYear() - 10); break;
        }

        const response = await fetch(
          `/api/market-data/history/${symbol}?from=${from.toISOString().split('T')[0]}&to=${to.toISOString().split('T')[0]}`
        );

        if (response.ok) {
          const result = await response.json();
    // DEBUG: console.log('Chart data received:', result);
          setData(result.data || []);
          if (result.data && result.data.length > 0) {
            setCurrentPrice(result.data[result.data.length - 1].close);
          }
        } else {
          console.error('Failed to fetch data:', response.status, response.statusText);
        }
      } catch (error) {
        console.error('Failed to fetch chart data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (symbol) {
      fetchData();
    }
  }, [symbol, timeframe]);

  // Initialize chart
  useEffect(() => {
    if (!chartContainerRef.current || loading || !data.length) return;

    // Clean up existing chart
    if (chartRef.current) {
      try {
        chartRef.current.remove();
      } catch (e) {
        console.error('Error removing chart:', e);
      }
      chartRef.current = null;
      seriesRef.current = null;
      volumeSeriesRef.current = null;
    }

    // Create new chart
    const containerWidth = chartContainerRef.current!.clientWidth || chartContainerRef.current!.offsetWidth || 800;
    // DEBUG: console.log('Creating chart with dimensions:', { width: containerWidth, height });

    const chart = createChart(chartContainerRef.current!, {
      width: containerWidth,
      height: height,
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: '#9CA3AF',
      },
      grid: {
        vertLines: { color: 'rgba(156, 163, 175, 0.1)' },
        horzLines: { color: 'rgba(156, 163, 175, 0.1)' },
      },
      crosshair: {
        mode: 1,
        vertLine: {
          width: 1,
          color: 'rgba(156, 163, 175, 0.5)',
          style: LineStyle.Dashed,
        },
        horzLine: {
          width: 1,
          color: 'rgba(156, 163, 175, 0.5)',
          style: LineStyle.Dashed,
        },
      },
      rightPriceScale: {
        borderColor: 'rgba(156, 163, 175, 0.2)',
        scaleMargins: {
          top: 0.1,
          bottom: 0.25,
        },
      },
      timeScale: {
        borderColor: 'rgba(156, 163, 175, 0.2)',
        timeVisible: true,
        secondsVisible: false,
      },
    });

    chartRef.current = chart;
    // DEBUG: console.log('Chart created:', chart);

    // Add main price series
    if (chartType === 'candles') {
      const candleSeries = (chart as any).addCandlestickSeries({
        upColor: '#10B981',
        downColor: '#EF4444',
        borderUpColor: '#10B981',
        borderDownColor: '#EF4444',
        wickUpColor: '#10B981',
        wickDownColor: '#EF4444',
      });

    // DEBUG: console.log('Setting candle data:', data.length, 'items');
      candleSeries.setData(data as any);
      seriesRef.current = candleSeries;
    } else {
      const lineSeries = (chart as any).addLineSeries({
        color: '#6366F1',
        lineWidth: 2,
      });

      const lineData = data.map(d => ({ time: d.time, value: d.close }));
      lineSeries.setData(lineData as any);
      seriesRef.current = lineSeries;
    }

    // Add volume series
    const volumeSeries = (chart as any).addHistogramSeries({
      color: '#6366F1',
      priceFormat: {
        type: 'volume',
      },
      priceScaleId: 'volume',
    });

    (chart as any).priceScale('volume').applyOptions({
      scaleMargins: {
        top: 0.8,
        bottom: 0,
      },
    });

    const volumeData = data.map(d => ({
      time: d.time,
      value: d.volume,
      color: d.close >= d.open ? '#10B98120' : '#EF444420'
    }));
    volumeSeries.setData(volumeData);
    volumeSeriesRef.current = volumeSeries;

    // Add position lines if in edit mode
    if (mode === 'edit' && seriesRef.current && position) {
      // Entry line
      if (position.entry) {
        seriesRef.current.createPriceLine({
          price: position.entry,
          color: '#6366F1',
          lineWidth: 2,
          lineStyle: LineStyle.Solid,
          axisLabelVisible: true,
          title: 'Entry',
        });
      }

      // Stop loss line
      if (position.stopLoss) {
        seriesRef.current.createPriceLine({
          price: position.stopLoss,
          color: '#EF4444',
          lineWidth: 2,
          lineStyle: LineStyle.Solid,
          axisLabelVisible: true,
          title: 'Stop Loss',
        });
      }

      // Take profit line
      if (position.takeProfit) {
        seriesRef.current.createPriceLine({
          price: position.takeProfit,
          color: '#10B981',
          lineWidth: 2,
          lineStyle: LineStyle.Solid,
          axisLabelVisible: true,
          title: 'Take Profit',
        });
      }
    }

    // Fit content
    chart.timeScale().fitContent();

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        const newWidth = chartContainerRef.current.clientWidth || chartContainerRef.current.offsetWidth;
    // DEBUG: console.log('Resizing chart to:', newWidth);
        chartRef.current.applyOptions({
          width: newWidth,
        });
      }
    };

    window.addEventListener('resize', handleResize);

    // Force a resize after a brief delay to ensure proper rendering
    setTimeout(() => {
      handleResize();
      if (chartRef.current) {
        chartRef.current.timeScale().fitContent();
      }
    }, 100);

    // Cleanup function
    return () => {
      window.removeEventListener('resize', handleResize);
      if (chartRef.current) {
        try {
          chartRef.current.remove();
        } catch (e) {
          console.error('Error during cleanup:', e);
        }
        chartRef.current = null;
      }
    };

  }, [data, chartType, mode, position, height, loading]);

  const timeframes = ['1D', '1W', '1M', '3M', '1Y', '5Y', 'ALL'];

  return (
    <div className={cn("w-full", className)}>
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

        {/* Chart type and actions */}
        <div className="flex items-center gap-2">
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

          {/* Full screen button */}
          {onFullScreen && (
            <Button
              variant="secondary"
              size="sm"
              onClick={onFullScreen}
            >
              <Maximize2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Chart container */}
      <div className="relative rounded-lg dark:bg-slate-900 bg-white border dark:border-slate-700 border-gray-200">
        {loading ? (
          <div className="flex items-center justify-center" style={{ height }}>
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mx-auto mb-2"></div>
              <p className="text-sm dark:text-gray-400 text-gray-600">Loading chart data...</p>
            </div>
          </div>
        ) : data.length === 0 ? (
          <div className="flex items-center justify-center" style={{ height }}>
            <div className="text-center">
              <p className="text-sm dark:text-gray-400 text-gray-600">No data available for {symbol}</p>
            </div>
          </div>
        ) : (
          <div ref={chartContainerRef} style={{ height, minWidth: '100%', width: '100%' }} />
        )}

        {/* Position info overlay (if in edit mode) */}
        {mode === 'edit' && position && currentPrice > 0 && (
          <div className="absolute top-4 left-4 dark:bg-slate-800/90 bg-white/90 backdrop-blur-sm rounded-lg p-3 text-xs">
            <div className="space-y-1">
              {position.entry && (
                <div className="flex justify-between gap-4">
                  <span className="dark:text-gray-400 text-gray-600">Entry:</span>
                  <span className="font-medium text-indigo-500">${position.entry.toFixed(2)}</span>
                </div>
              )}
              {position.stopLoss && (
                <div className="flex justify-between gap-4">
                  <span className="dark:text-gray-400 text-gray-600">Stop:</span>
                  <span className="font-medium text-red-500">
                    ${position.stopLoss.toFixed(2)} ({((position.stopLoss - (position.entry || currentPrice)) / (position.entry || currentPrice) * 100).toFixed(1)}%)
                  </span>
                </div>
              )}
              {position.takeProfit && (
                <div className="flex justify-between gap-4">
                  <span className="dark:text-gray-400 text-gray-600">Target:</span>
                  <span className="font-medium text-green-500">
                    ${position.takeProfit.toFixed(2)} ({((position.takeProfit - (position.entry || currentPrice)) / (position.entry || currentPrice) * 100).toFixed(1)}%)
                  </span>
                </div>
              )}
              {position.entry && position.stopLoss && position.takeProfit && (
                <div className="flex justify-between gap-4 pt-1 border-t dark:border-slate-700 border-gray-200">
                  <span className="dark:text-gray-400 text-gray-600">R:R</span>
                  <span className="font-medium dark:text-white text-gray-900">
                    1:{((position.takeProfit - position.entry) / (position.entry - position.stopLoss)).toFixed(1)}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}