"use client";

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Card } from '@/components/ui/Panel';

// Simplified working chart component
export function ThemeChart() {
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstanceRef = useRef<any>(null);

  const createChart = useCallback(async () => {
    if (!chartRef.current) {
      console.log('ThemeChart: No chart ref');
      return;
    }

    try {
      console.log('ThemeChart: Starting chart creation');

      // Clean up any existing chart
      if (chartInstanceRef.current) {
        try {
          chartInstanceRef.current.remove();
          chartInstanceRef.current = null;
        } catch (e) {
          console.error('ThemeChart: Error cleaning up old chart:', e);
        }
      }

      // Dynamic import with error handling - import the new v5 API components
      const imported = await import('lightweight-charts').catch(err => {
        console.error('ThemeChart: Failed to import library:', err);
        throw new Error('Failed to load chart library');
      });

      console.log('ThemeChart: Library loaded, checking exports:', {
        hasCreateChart: !!imported.createChart,
        hasCandlestickSeries: !!imported.CandlestickSeries,
        hasHistogramSeries: !!imported.HistogramSeries,
        hasColorType: !!imported.ColorType,
        allKeys: Object.keys(imported)
      });

      const { createChart, CandlestickSeries, HistogramSeries, ColorType } = imported;

      // If series types are not defined, throw error
      if (!CandlestickSeries || !HistogramSeries) {
        console.error('ThemeChart: Series types not found in import');
        throw new Error('Series types not found in lightweight-charts import');
      }

      // Import theme configuration
      const { getCandlestickConfig, getHistogramConfig } = await import('@/lib/chartStyles');

      // Detect dark mode
      const isDarkMode = document.documentElement.classList.contains('dark');
      const textColor = isDarkMode ? '#9CA3AF' : '#6B7280';

      // Create chart with minimal configuration using v5 API
      const chart = createChart(chartRef.current, {
        width: chartRef.current.clientWidth || 600,
        height: 400,
        layout: {
          background: { type: ColorType.Solid, color: 'transparent' },
          textColor: textColor,
        },
        grid: {
          vertLines: { color: 'rgba(156, 163, 175, 0.1)' },
          horzLines: { color: 'rgba(156, 163, 175, 0.1)' },
        },
        timeScale: {
          barSpacing: 12,
          minBarSpacing: 6,
          maxBarSpacing: 16,
          rightOffset: 80,
        },
      });

      console.log('ThemeChart: Chart instance created');
      console.log('ThemeChart: Chart methods available:', {
        hasAddSeries: typeof chart.addSeries === 'function',
        hasRemove: typeof chart.remove === 'function',
        hasTimeScale: typeof chart.timeScale === 'function',
        hasPriceScale: typeof chart.priceScale === 'function',
        actualMethods: Object.getOwnPropertyNames(Object.getPrototypeOf(chart))
      });
      chartInstanceRef.current = chart;

      // Get theme colors
      const candlestickConfig = getCandlestickConfig(isDarkMode);
      const volumeConfig = getHistogramConfig(isDarkMode);

      // Add candlestick series using v5 API - addSeries with series type
      console.log('ThemeChart: Adding candlestick series with config:', candlestickConfig);

      let candlestickSeries;
      try {
        candlestickSeries = chart.addSeries(CandlestickSeries, candlestickConfig);
        console.log('ThemeChart: Candlestick series added successfully');
      } catch (err) {
        console.error('ThemeChart: Error adding candlestick series:', err);
        throw err;
      }

      // Generate simple test data
      const basePrice = 100;
      const candleData = [];
      const volumeData = [];

      for (let i = 0; i < 30; i++) {
        const date = new Date(2024, 0, i + 1);
        const time = date.toISOString().split('T')[0];

        const open = basePrice + (Math.random() * 10 - 5);
        const close = open + (Math.random() * 6 - 3);
        const high = Math.max(open, close) + Math.random() * 2;
        const low = Math.min(open, close) - Math.random() * 2;

        candleData.push({ time, open, high, low, close });
        volumeData.push({
          time,
          value: Math.random() * 1000000 + 500000,
          color: close >= open ? volumeConfig.upColor : volumeConfig.downColor,
        });
      }

      console.log('ThemeChart: Setting candle data, count:', candleData.length);
      console.log('ThemeChart: Sample data:', candleData[0]);

      try {
        candlestickSeries.setData(candleData);
        console.log('ThemeChart: Data set successfully');
      } catch (err) {
        console.error('ThemeChart: Error setting data:', err);
        throw err;
      }

      // Add volume using v5 API - addSeries with series type
      const volumeSeries = chart.addSeries(HistogramSeries, {
        ...volumeConfig,
        priceScaleId: 'volume',
      });

      chart.priceScale('volume').applyOptions({
        scaleMargins: {
          top: 0.8,
          bottom: 0,
        },
      });

      console.log('ThemeChart: Setting volume data');
      volumeSeries.setData(volumeData);

      // Don't call fitContent() as it resets rightOffset

      // Handle resize
      const handleResize = () => {
        if (chartRef.current && chartInstanceRef.current) {
          chartInstanceRef.current.applyOptions({
            width: chartRef.current.clientWidth
          });
        }
      };

      window.addEventListener('resize', handleResize);

      console.log('ThemeChart: Chart setup complete');
      setStatus('ready');

      // Return cleanup function
      return () => {
        window.removeEventListener('resize', handleResize);
        if (chartInstanceRef.current) {
          try {
            chartInstanceRef.current.remove();
            chartInstanceRef.current = null;
          } catch (e) {
            console.error('ThemeChart: Cleanup error:', e);
          }
        }
      };

    } catch (error) {
      console.error('ThemeChart: Error creating chart:', error);
      setErrorMsg(String(error));
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    let cleanup: (() => void) | undefined;

    // Small delay to ensure DOM is ready
    const timer = setTimeout(async () => {
      cleanup = await createChart();
    }, 100);

    return () => {
      clearTimeout(timer);
      if (cleanup) cleanup();
    };
  }, [createChart]);

  return (
    <Card>
      <h2 className="text-xl font-semibold dark:text-white text-gray-900 mb-6">
        Chart Theme System
      </h2>
      <p className="text-sm dark:text-gray-400 text-gray-600 mb-4">
        Centralized chart styling - all colors from /src/lib/chartStyles.ts
      </p>

      <div className="relative rounded-lg dark:bg-slate-900 bg-white border dark:border-slate-700 border-gray-200">
        {status === 'loading' && (
          <div className="flex items-center justify-center h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mx-auto mb-2"></div>
              <p className="text-sm dark:text-gray-400 text-gray-600">Loading chart...</p>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="flex items-center justify-center h-[400px]">
            <div className="text-center">
              <p className="text-sm text-red-500">Error: {errorMsg}</p>
              <button
                onClick={() => {
                  setStatus('loading');
                  createChart();
                }}
                className="mt-2 px-3 py-1 bg-indigo-500 text-white rounded hover:bg-indigo-600"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Always render the chart div - visibility controlled by status */}
        <div
          ref={chartRef}
          style={{
            height: '400px',
            display: status === 'ready' ? 'block' : 'none'
          }}
        />
      </div>
    </Card>
  );
}