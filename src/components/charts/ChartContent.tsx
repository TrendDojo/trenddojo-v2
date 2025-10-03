"use client";

import { useEffect, useRef } from 'react';
import * as LightweightCharts from 'lightweight-charts';

export default function ChartContent({ symbol }: { symbol: string }) {
  const chartContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadChart = async () => {
      if (!chartContainerRef.current) return;

      // Import our theme configuration
      const { getCandlestickConfig, getHistogramConfig } = await import('@/lib/chartStyles');

      // Detect dark mode
      const isDarkMode = document.documentElement.classList.contains('dark');

      // DEBUG: console.log('LightweightCharts module:', LightweightCharts);

      const chart = LightweightCharts.createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 400,
      layout: {
        background: { type: LightweightCharts.ColorType.Solid, color: 'transparent' },
        textColor: '#9CA3AF',
      },
      grid: {
        vertLines: { color: 'rgba(156, 163, 175, 0.1)' },
        horzLines: { color: 'rgba(156, 163, 175, 0.1)' },
      },
      timeScale: {
        barSpacing: 12,        // Default spacing between candles
        minBarSpacing: 6,      // Minimum spacing (prevents overcrowding)
        maxBarSpacing: 16,     // Maximum spacing (prevents spreading too far)
        rightOffset: 80,       // Space on the right side
      },
    });

    // Add candlestick series with theme colors
    const candlestickConfig = getCandlestickConfig(isDarkMode);
    const candlestickSeries = (chart as any).addCandlestickSeries(candlestickConfig);

    // Sample data
    const data = [
      { time: '2024-01-01', open: 100, high: 110, low: 90, close: 105 },
      { time: '2024-01-02', open: 105, high: 115, low: 100, close: 110 },
      { time: '2024-01-03', open: 110, high: 120, low: 105, close: 115 },
      { time: '2024-01-04', open: 115, high: 125, low: 110, close: 120 },
      { time: '2024-01-05', open: 120, high: 130, low: 115, close: 125 },
      { time: '2024-01-06', open: 125, high: 135, low: 120, close: 130 },
      { time: '2024-01-07', open: 130, high: 140, low: 125, close: 135 },
      { time: '2024-01-08', open: 135, high: 145, low: 130, close: 140 },
      { time: '2024-01-09', open: 140, high: 150, low: 135, close: 145 },
      { time: '2024-01-10', open: 145, high: 155, low: 140, close: 150 },
    ];

    candlestickSeries.setData(data);

    // Add volume with theme colors
    const volumeConfig = getHistogramConfig(isDarkMode);
    const volumeSeries = (chart as any).addHistogramSeries({
      ...volumeConfig,
      priceScaleId: 'volume',
    });

    (chart as any).priceScale('volume').applyOptions({
      scaleMargins: {
        top: 0.8,
        bottom: 0,
      },
    });

    const volumeData = data.map((d, i) => ({
      time: d.time,
      value: Math.random() * 1000000 + 500000,
      color: d.close >= d.open ? volumeConfig.upColor : volumeConfig.downColor,
    }));

    volumeSeries.setData(volumeData);

    // Don't call fitContent() as it resets rightOffset

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
    };

    loadChart();
  }, [symbol]);

  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold mb-2">Chart for {symbol}</h3>
      <div ref={chartContainerRef} className="w-full" style={{ height: '400px' }} />
    </div>
  );
}