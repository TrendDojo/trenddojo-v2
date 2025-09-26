"use client";

import { useEffect, useRef, useState } from 'react';
import { Maximize2, TrendingUp, BarChart2, Settings } from 'lucide-react';
import { Button } from '@/components/ui/Button';

declare global {
  interface Window {
    LightweightCharts: any;
  }
}

export function CDNChart({ symbol }: { symbol: string }) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chartType, setChartType] = useState<'candles' | 'line'>('candles');
  const [timeframe, setTimeframe] = useState('1Y');
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Track loaded data range
  const loadedDataRef = useRef<{
    earliest: string | null;
    latest: string | null;
    allData: any[];
  }>({ earliest: null, latest: null, allData: [] });

  const handleFullscreen = () => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(err => {
        // DEBUG: console.log(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  // Function to load more data for a specific date range
  const loadMoreData = async (fromDate: string, toDate: string, chart: any, series: any, volumeSeries?: any) => {
    if (isLoadingMore) return;

    try {
      setIsLoadingMore(true);
    // DEBUG: console.log(`Loading more data from ${fromDate} to ${toDate}`);

      const response = await fetch(`/api/market-data/history/${symbol}?from=${fromDate}&to=${toDate}`);
      if (!response.ok) throw new Error('Failed to fetch additional market data');

      const marketData = await response.json();

      if (marketData.data && marketData.data.length > 0) {
        // Merge with existing data
        const newData = marketData.data
          .map((item: any) => ({
            time: item.time,
            open: item.open,
            high: item.high,
            low: item.low,
            close: item.close || item.value,
            volume: item.volume || 0
          }));

        // Update our stored data
        loadedDataRef.current.allData = [...loadedDataRef.current.allData, ...newData]
          .sort((a, b) => a.time.localeCompare(b.time))
          // Remove duplicates
          .filter((item, index, self) =>
            index === self.findIndex(t => t.time === item.time)
          );

        // Update earliest/latest dates
        const sortedDates = loadedDataRef.current.allData.map(d => d.time).sort();
        loadedDataRef.current.earliest = sortedDates[0];
        loadedDataRef.current.latest = sortedDates[sortedDates.length - 1];

        // Update chart with merged data
        if (chartType === 'candles') {
          series.setData(loadedDataRef.current.allData);
        } else {
          const lineData = loadedDataRef.current.allData.map(item => ({
            time: item.time,
            value: item.close
          }));
          series.setData(lineData);
        }

        // Update volume data if volume series exists
        if (volumeSeries && loadedDataRef.current.allData.some(item => item.volume)) {
          const volumeData = loadedDataRef.current.allData.map(item => ({
            time: item.time,
            value: item.volume,
            color: item.close >= item.open ? '#2dd4bf66' : '#fb718566'  // 40% opacity
          }));
          volumeSeries.setData(volumeData);
        }

    // DEBUG: console.log(`Loaded ${newData.length} new data points. Total: ${loadedDataRef.current.allData.length}`);
      }
    } catch (error) {
      console.error('Failed to load more data:', error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  // First useEffect: Load the script once
  useEffect(() => {
    if (!window.LightweightCharts && !isScriptLoaded) {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/lightweight-charts@4.1.0/dist/lightweight-charts.standalone.production.js';
      script.async = true;
      script.onload = () => {
    // DEBUG: console.log('Script loaded, LightweightCharts available');
        setIsScriptLoaded(true);
      };
      script.onerror = () => {
        console.error('Failed to load script');
        setError('Failed to load chart library');
      };

      // Check if script already exists
      const existing = document.querySelector('script[src*="lightweight-charts"]');
      if (!existing) {
        document.head.appendChild(script);
      } else {
        // Script already in DOM, check if loaded
        if (window.LightweightCharts) {
          setIsScriptLoaded(true);
        }
      }
    } else if (window.LightweightCharts) {
      setIsScriptLoaded(true);
    }
  }, []);

  // Second useEffect: Create chart when script is loaded
  useEffect(() => {
    if (!isScriptLoaded) {
    // DEBUG: console.log('Waiting for script to load...');
      return;
    }

    let chartInstance: any = null;
    let isSubscribed = true;
    let resizeHandler: (() => void) | null = null;
    let resizeObserver: ResizeObserver | null = null;
    let visibleRangeHandler: ((range: any) => void) | null = null;

    // Reset loaded data when symbol or timeframe changes
    loadedDataRef.current = { earliest: null, latest: null, allData: [] };

    // Store chart instance at component level for proper cleanup
    const cleanupChart = () => {
      if (resizeHandler) {
        window.removeEventListener('resize', resizeHandler);
        resizeHandler = null;
      }
      if (resizeObserver) {
        resizeObserver.disconnect();
        resizeObserver = null;
      }
      if (chartInstance) {
        try {
          if (visibleRangeHandler && chartInstance.timeScale) {
            chartInstance.timeScale().unsubscribeVisibleLogicalRangeChange(visibleRangeHandler);
          }
          chartInstance.remove();
        } catch (e) {
    // DEBUG: console.log('Chart cleanup error:', e);
        }
        chartInstance = null;
      }
    };

    // Set loading state when starting to load new data
    setIsLoading(true);
    setError(null);

    const loadAndCreateChart = async () => {
    // DEBUG: console.log('loadAndCreateChart called', {
        // hasLightweightCharts: !!window.LightweightCharts,
        // hasContainer: !!chartContainerRef.current
      // });

      if (!window.LightweightCharts || !chartContainerRef.current) {
    // DEBUG: console.log('Missing requirements:', {
          // LightweightCharts: !!window.LightweightCharts,
          // container: !!chartContainerRef.current
        // });
        return;
      }

      // Wait a tick to ensure the container has dimensions
      await new Promise(resolve => setTimeout(resolve, 0));

      // Get theme colors based on dark/light mode
      const isDarkMode = document.documentElement.classList.contains('dark');

      // Create a temporary element to get computed styles
      const tempEl = document.createElement('div');
      tempEl.className = isDarkMode ? 'dark:text-gray-400 text-gray-600' : 'text-gray-600';
      document.body.appendChild(tempEl);
      const computedStyle = window.getComputedStyle(tempEl);
      const textColor = computedStyle.color;
      document.body.removeChild(tempEl);

      const themeColors = {
        // Buy/Long colors (success - teal)
        buyColor: isDarkMode ? '#2dd4bf' : '#14b8a6', // teal-400 : teal-500
        buyBorderColor: isDarkMode ? '#2dd4bf' : '#14b8a6',

        // Sell/Short colors (danger - rose)
        sellColor: isDarkMode ? '#fb7185' : '#f43f5e', // rose-400 : rose-500
        sellBorderColor: isDarkMode ? '#fb7185' : '#f43f5e',

        // Chart background and text - inverted approach for better contrast
        backgroundColor: isDarkMode ? 'rgba(148, 163, 184, 0.03)' : 'rgba(15, 23, 42, 0.03)', // Light tint in dark, dark tint in light
        textColor: textColor, // Inherited from theme

        // Grid and border colors - minimal approach
        gridColor: 'transparent', // No grid lines - we have crosshairs for exact values
        borderColor: isDarkMode ? 'rgba(51, 65, 85, 0.3)' : 'rgba(209, 213, 219, 0.4)', // Very subtle axis lines

        // Volume colors - more visible
        volumeColor: isDarkMode ? '#818cf8' : '#6366f1', // indigo-400 : indigo-500

        // Line chart color
        lineColor: isDarkMode ? '#6366f1' : '#4f46e5', // indigo-500 : indigo-600
      };

      // Get the actual width of the container
      const containerWidth = chartContainerRef.current.clientWidth || chartContainerRef.current.offsetWidth || 600;

      // If container has no width, use parent width or default
      if (containerWidth === 0) {
    // DEBUG: console.log('Container has no width, using default or retrying...');
        const parentWidth = chartContainerRef.current.parentElement?.clientWidth || 600;
        if (parentWidth > 0) {
    // DEBUG: console.log(`Using parent width: ${parentWidth}px`);
        } else if (isSubscribed) {
          setTimeout(() => loadAndCreateChart(), 100);
          return;
        }
      }

    // DEBUG: console.log(`Creating chart with width: ${containerWidth}px`);

      if (!isSubscribed) return;

      try {
        // Calculate date range based on selected timeframe
        // Use a fixed end date of 2024-12-31 since we have historical data up to end of 2024
        const endDate = new Date('2024-12-31');
        let startDate = new Date('2024-12-31');

        switch (timeframe) {
          case '1M':
            startDate.setMonth(endDate.getMonth() - 1);
            break;
          case '3M':
            startDate.setMonth(endDate.getMonth() - 3);
            break;
          case '6M':
            startDate.setMonth(endDate.getMonth() - 6);
            break;
          case '1Y':
            startDate.setFullYear(endDate.getFullYear() - 1);
            break;
          case '3Y':
            startDate.setFullYear(endDate.getFullYear() - 3);
            break;
          case 'ALL':
            startDate.setFullYear(endDate.getFullYear() - 10); // Up to 10 years of data
            break;
          default:
            startDate.setFullYear(endDate.getFullYear() - 1);
        }

        const endDateStr = endDate.toISOString().split('T')[0];
        const startDateStr = startDate.toISOString().split('T')[0];

    // DEBUG: console.log(`Fetching data for ${symbol} from ${startDateStr} to ${endDateStr} (${timeframe})`);

        const response = await fetch(`/api/market-data/history/${symbol}?from=${startDateStr}&to=${endDateStr}`);
        if (!response.ok) throw new Error('Failed to fetch market data');

        const marketData = await response.json();
    // DEBUG: console.log(`Received ${marketData.data?.length || 0} data points for ${timeframe}`);

        if (!isSubscribed) return;

        if (!marketData.data || marketData.data.length === 0) {
          setError('No data available for this symbol');
          setIsLoading(false);
          return;
        }

        // Store the initial loaded data
        loadedDataRef.current.allData = marketData.data
          .map((item: any) => ({
            time: item.time,
            open: item.open,
            high: item.high,
            low: item.low,
            close: item.close || item.value,
            volume: item.volume || 0
          }))
          .sort((a: any, b: any) => a.time.localeCompare(b.time));

        const sortedDates = loadedDataRef.current.allData.map(d => d.time).sort();
        loadedDataRef.current.earliest = sortedDates[0];
        loadedDataRef.current.latest = sortedDates[sortedDates.length - 1];

        // Clear any existing chart before creating a new one
        cleanupChart();

        const chart = window.LightweightCharts.createChart(chartContainerRef.current, {
          width: containerWidth,
          height: 400,
          layout: {
            background: { type: window.LightweightCharts.ColorType.Solid, color: themeColors.backgroundColor },
            textColor: themeColors.textColor,
            fontSize: 14, // Matches text-sm size for better readability
          },
          grid: {
            vertLines: { color: themeColors.gridColor },
            horzLines: { color: themeColors.gridColor },
          },
          rightPriceScale: {
            borderColor: themeColors.borderColor,
            scaleMargins: {
              top: 0.1,
              bottom: 0.2,
            },
          },
          timeScale: {
            borderColor: themeColors.borderColor,
            timeVisible: true,
            secondsVisible: false,
          },
        });

        // Create either candlestick or line series based on chart type
        let mainSeries: any;
        let volumeSeries: any = null;

        if (chartType === 'candles') {
          // Candlestick chart with theme colors
          mainSeries = chart.addCandlestickSeries({
            upColor: themeColors.buyColor,
            downColor: themeColors.sellColor,
            borderUpColor: themeColors.buyBorderColor,
            borderDownColor: themeColors.sellBorderColor,
            wickUpColor: themeColors.buyColor,
            wickDownColor: themeColors.sellColor,
          });

          // Transform data for candlestick chart - use stored data
          const chartData = loadedDataRef.current.allData.map(item => ({
            time: item.time,
            open: item.open,
            high: item.high,
            low: item.low,
            close: item.close
          }));

          mainSeries.setData(chartData);
        } else {
          // Line chart with theme color
          mainSeries = chart.addLineSeries({
            color: themeColors.lineColor,
            lineWidth: 2,
            priceLineVisible: false,
            lastValueVisible: true,
            crosshairMarkerVisible: true,
          });

          // Transform data for line chart - use stored data
          const chartData = loadedDataRef.current.allData.map(item => ({
            time: item.time,
            value: item.close
          }));

          mainSeries.setData(chartData);
        }

        // Add volume histogram if volume data exists
        if (loadedDataRef.current.allData.some(item => item.volume)) {
          volumeSeries = chart.addHistogramSeries({
            color: themeColors.volumeColor,
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

          const volumeData = loadedDataRef.current.allData.map(item => ({
            time: item.time,
            value: item.volume,
            // Use theme colors with better visibility (40% opacity)
            color: item.close >= item.open
              ? `${themeColors.buyColor}66`  // 66 = 40% opacity
              : `${themeColors.sellColor}66`,
          }));

          volumeSeries.setData(volumeData);
        }

        // Fit content and adjust time scale
        chart.timeScale().applyOptions({
          timeVisible: true,
          secondsVisible: false,
          rightOffset: 2,
          barSpacing: 6,
          minBarSpacing: 2,
          fixLeftEdge: false,
          fixRightEdge: false,
        });

        // Ensure the chart uses full width
        chart.timeScale().fitContent();

        // Volume series is already defined above and available here

        // Subscribe to visible range changes for dynamic data loading
        visibleRangeHandler = (range) => {
          if (!range || isLoadingMore) return;

          // Only auto-load for 1M timeframe, or if user explicitly pans beyond loaded data
          const barsInfo = mainSeries.barsInLogicalRange(range);

          if (barsInfo && barsInfo.barsBefore < 20 && loadedDataRef.current.earliest) {
            // User is near the left edge, load earlier data
            const earliestDate = new Date(loadedDataRef.current.earliest);
            if (!isNaN(earliestDate.getTime())) {
              const newStartDate = new Date(earliestDate);

              // Load different amounts based on timeframe
              if (timeframe === '1M') {
                newStartDate.setMonth(newStartDate.getMonth() - 3);
              } else if (timeframe === '3M') {
                newStartDate.setMonth(newStartDate.getMonth() - 6);
              } else if (timeframe === '6M' || timeframe === '1Y') {
                newStartDate.setFullYear(newStartDate.getFullYear() - 1);
              } else {
                return; // Don't auto-load for longer timeframes
              }

              const newEndDate = new Date(earliestDate);
              newEndDate.setDate(newEndDate.getDate() - 1);

              // Ensure dates are valid and in correct order
              if (newStartDate < newEndDate && !isNaN(newStartDate.getTime())) {
                loadMoreData(
                  newStartDate.toISOString().split('T')[0],
                  newEndDate.toISOString().split('T')[0],
                  chart,
                  mainSeries,
                  volumeSeries
                );
              }
            }
          }
        };

        chart.timeScale().subscribeVisibleLogicalRangeChange(visibleRangeHandler);

        // Handle window resize
        resizeHandler = () => {
          if (chartContainerRef.current && chart) {
            const newWidth = chartContainerRef.current.clientWidth;
    // DEBUG: console.log(`Resizing chart to ${newWidth}px`);
            chart.applyOptions({ width: newWidth });
            chart.timeScale().fitContent();
          }
        };

        window.addEventListener('resize', resizeHandler);

        // Also observe the container element for size changes
        if (chartContainerRef.current) {
          resizeObserver = new ResizeObserver((entries) => {
            for (const entry of entries) {
              if (entry.target === chartContainerRef.current && chart) {
                const newWidth = entry.contentRect.width;
    // DEBUG: console.log(`Container resized to ${newWidth}px`);
                chart.applyOptions({ width: newWidth });
                chart.timeScale().fitContent();
              }
            }
          });
          resizeObserver.observe(chartContainerRef.current);
        }

        setIsLoading(false);
        chartInstance = chart;

        // Store chart instance for cleanup
        return chart;
      } catch (error: any) {
        console.error('Chart setup failed:', error);
        setError(`Failed to load chart: ${error.message}`);
        setIsLoading(false);
      }

    };

    // Create the chart now that script is loaded
    // DEBUG: console.log('Creating chart - script is loaded');
    loadAndCreateChart().then(chart => {
      if (chart) chartInstance = chart;
    });

    // Cleanup
    return () => {
      isSubscribed = false;
      cleanupChart();
    };
  }, [isScriptLoaded, symbol, chartType, timeframe]);

  if (error) {
    return (
      <div className="w-full">
        <h3 className="text-lg font-semibold mb-2">Chart for {symbol}</h3>
        <div className="flex items-center justify-center h-[400px]">
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="w-full">
      {/* Chart Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3 px-2">
        {/* Left side - Timeframe buttons */}
        <div className="flex items-center gap-1">
          {['1M', '3M', '6M', '1Y', '3Y', 'ALL'].map((tf) => (
            <Button
              key={tf}
              variant={timeframe === tf ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setTimeframe(tf)}
              className="px-2 py-1 min-w-[36px]"
            >
              {tf}
            </Button>
          ))}
        </div>

        {/* Right side - Chart controls */}
        <div className="flex items-center gap-1">
          {/* Chart type toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setChartType(chartType === 'candles' ? 'line' : 'candles')}
            className="flex items-center gap-1 px-2 py-1"
            title={`Switch to ${chartType === 'candles' ? 'line' : 'candlestick'} chart`}
          >
            {chartType === 'candles' ? (
              <>
                <BarChart2 className="w-4 h-4" />
                <span className="text-xs hidden sm:inline">Candles</span>
              </>
            ) : (
              <>
                <TrendingUp className="w-4 h-4" />
                <span className="text-xs hidden sm:inline">Line</span>
              </>
            )}
          </Button>

          {/* Settings button */}
          <Button
            variant="ghost"
            size="sm"
            className="p-1.5"
            title="Chart settings"
          >
            <Settings className="w-4 h-4" />
          </Button>

          {/* Fullscreen button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleFullscreen}
            className="p-1.5"
            title="Toggle fullscreen"
          >
            <Maximize2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Chart Container - Always rendered for chart to mount into */}
      <div className="w-full rounded-lg relative" style={{ height: '400px', minWidth: '100%' }}>
        <div ref={chartContainerRef} className="w-full h-full rounded-lg overflow-hidden">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white dark:bg-gray-900">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mx-auto mb-2"></div>
                <p className="text-sm dark:text-gray-400 text-gray-600">Loading chart data...</p>
              </div>
            </div>
          )}
        </div>
        {isLoadingMore && (
          <div className="absolute top-2 left-2 z-10 bg-white/90 dark:bg-gray-800/90 rounded px-2 py-1 flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-500"></div>
            <span className="text-xs dark:text-gray-400 text-gray-600">Loading more data...</span>
          </div>
        )}
      </div>
    </div>
  );
}
