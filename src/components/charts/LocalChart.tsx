"use client";

import { useEffect, useRef, useState } from 'react';
import { Maximize2, TrendingUp, BarChart2, Settings } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import {
  createChart,
  ColorType,
  IChartApi,
  ISeriesApi,
  CandlestickData,
  LineData,
  HistogramData,
  Time,
  // v5 requires importing the series types
  CandlestickSeries,
  LineSeries,
  HistogramSeries
} from 'lightweight-charts';

interface ChartData {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
  value?: number;
}

export function LocalChart({ symbol }: { symbol: string }) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chartType, setChartType] = useState<'candles' | 'line'>('candles');
  const [timeframe, setTimeframe] = useState('1Y');
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const lastLoadRequestRef = useRef<string | null>(null);

  // Track loaded data range
  const loadedDataRef = useRef<{
    earliest: string | null;
    latest: string | null;
    allData: ChartData[];
  }>({ earliest: null, latest: null, allData: [] });

  const handleFullscreen = () => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(err => {
        console.log(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  // Function to load more data for a specific date range
  const loadMoreData = async (
    fromDate: string,
    toDate: string,
    chart: IChartApi,
    series: ISeriesApi<'Candlestick'> | ISeriesApi<'Line'>,
    volumeSeries?: ISeriesApi<'Histogram'> | null
  ) => {
    if (isLoadingMore) return;

    try {
      setIsLoadingMore(true);

      // Store current visible range to restore after data update
      const timeScale = chart.timeScale();
      const currentVisibleRange = timeScale.getVisibleRange();

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
        const previousDataCount = loadedDataRef.current.allData.length;
        loadedDataRef.current.allData = [...newData, ...loadedDataRef.current.allData]
          .sort((a, b) => a.time.localeCompare(b.time))
          // Remove duplicates
          .filter((item, index, self) =>
            index === self.findIndex(t => t.time === item.time)
          );

        const actualNewPoints = loadedDataRef.current.allData.length - previousDataCount;

        // Update earliest/latest dates
        const sortedDates = loadedDataRef.current.allData.map(d => d.time).sort();
        loadedDataRef.current.earliest = sortedDates[0];
        loadedDataRef.current.latest = sortedDates[sortedDates.length - 1];

        // Update chart with merged data
        if (chartType === 'candles') {
          const candleData: CandlestickData<Time>[] = loadedDataRef.current.allData.map(item => {
            // Convert YYYY-MM-DD string to Unix timestamp
            const [year, month, day] = item.time.split('-').map(Number);
            const timestamp = Math.floor(new Date(year, month - 1, day).getTime() / 1000) as Time;
            return {
              time: timestamp,
              open: item.open,
              high: item.high,
              low: item.low,
              close: item.close
            };
          });
          series.setData(candleData);
        } else {
          const lineData: LineData<Time>[] = loadedDataRef.current.allData.map(item => {
            // Convert YYYY-MM-DD string to Unix timestamp
            const [year, month, day] = item.time.split('-').map(Number);
            const timestamp = Math.floor(new Date(year, month - 1, day).getTime() / 1000) as Time;
            return {
              time: timestamp,
              value: item.close
            };
          });
          series.setData(lineData);
        }

        // Update volume data if volume series exists
        if (volumeSeries && loadedDataRef.current.allData.some(item => item.volume)) {
          const volumeData: HistogramData<Time>[] = loadedDataRef.current.allData.map(item => {
            // Convert YYYY-MM-DD string to Unix timestamp
            const [year, month, day] = item.time.split('-').map(Number);
            const timestamp = Math.floor(new Date(year, month - 1, day).getTime() / 1000) as Time;
            return {
              time: timestamp,
              value: item.volume || 0,
              color: item.close >= item.open ? '#2dd4bf66' : '#fb718566'  // 40% opacity
            };
          });
          volumeSeries.setData(volumeData);
        }

        // Restore the visible range to maintain user's view
        if (currentVisibleRange) {
          // Small delay to ensure data is processed
          setTimeout(() => {
            timeScale.setVisibleRange(currentVisibleRange);
          }, 0);
        }

        console.log(`Loaded ${actualNewPoints} new data points. Total: ${loadedDataRef.current.allData.length}`);
      }
    } catch (error) {
      console.error('Failed to load more data:', error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  // Main chart creation and data loading effect
  useEffect(() => {
    let isSubscribed = true;
    let resizeObserver: ResizeObserver | null = null;
    let visibleRangeHandler: ((range: any) => void) | null = null;

    // Reset loaded data when symbol or timeframe changes
    loadedDataRef.current = { earliest: null, latest: null, allData: [] };
    lastLoadRequestRef.current = null;

    const cleanupChart = () => {
      if (resizeObserver) {
        resizeObserver.disconnect();
        resizeObserver = null;
      }
      if (chartRef.current) {
        try {
          if (visibleRangeHandler && chartRef.current.timeScale) {
            chartRef.current.timeScale().unsubscribeVisibleLogicalRangeChange(visibleRangeHandler);
          }
          chartRef.current.remove();
        } catch (e) {
          console.log('Chart cleanup error:', e);
        }
        chartRef.current = null;
      }
    };

    const createAndLoadChart = async () => {
      if (!chartContainerRef.current) return;

      setIsLoading(true);
      setError(null);

      try {
        // Calculate date range based on selected timeframe
        const endDate = new Date(); // Use current date
        let startDate = new Date();

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
            startDate.setFullYear(endDate.getFullYear() - 10);
            break;
          default:
            startDate.setFullYear(endDate.getFullYear() - 1);
        }

        const endDateStr = endDate.toISOString().split('T')[0];
        const startDateStr = startDate.toISOString().split('T')[0];

        console.log(`Fetching data for ${symbol} from ${startDateStr} to ${endDateStr} (${timeframe})`);

        const response = await fetch(`/api/market-data/history/${symbol}?from=${startDateStr}&to=${endDateStr}`);
        if (!response.ok) {
          console.error(`API returned ${response.status}: ${response.statusText}`);
          const errorText = await response.text();
          console.error('Error response:', errorText);
          throw new Error(`Failed to fetch market data: ${response.status}`);
        }

        const marketData = await response.json();
        console.log(`Received ${marketData.data?.length || 0} data points for ${timeframe}`);

        if (!isSubscribed) return;

        if (!marketData.data || marketData.data.length === 0) {
          setError('No data available for this symbol');
          setIsLoading(false);
          return;
        }

        // Store the initial loaded data
        const actualData = marketData.data
          .map((item: any) => ({
            time: item.time,
            open: item.open,
            high: item.high,
            low: item.low,
            close: item.close || item.value,
            volume: item.volume || 0
          }))
          .sort((a: any, b: any) => a.time.localeCompare(b.time));

        // Add placeholder data points to extend the time scale
        // This forces the x-axis to show dates beyond the last data point
        const lastDataPoint = actualData[actualData.length - 1];
        const extendedData = [...actualData];

        if (lastDataPoint) {
          const lastDate = new Date(lastDataPoint.time);
          const maxDate = new Date(); // Use current date
          const currentDate = new Date(lastDate);

          // Add one data point per week up to the max date
          // Using NaN values so they don't display on the chart
          while (currentDate < maxDate) {
            currentDate.setDate(currentDate.getDate() + 7);
            if (currentDate <= maxDate) {
              extendedData.push({
                time: currentDate.toISOString().split('T')[0],
                open: NaN,
                high: NaN,
                low: NaN,
                close: NaN,
                volume: 0
              });
            }
          }
        }

        loadedDataRef.current.allData = extendedData;
        const sortedDates = actualData.map((d: any) => d.time).sort();
        loadedDataRef.current.earliest = sortedDates[0];
        loadedDataRef.current.latest = sortedDates[sortedDates.length - 1];

        // Clear any existing chart before creating a new one
        cleanupChart();

        // Get theme colors
        const isDarkMode = document.documentElement.classList.contains('dark');
        const themeColors = {
          buyColor: isDarkMode ? '#2dd4bf' : '#14b8a6',
          buyBorderColor: isDarkMode ? '#2dd4bf' : '#14b8a6',
          sellColor: isDarkMode ? '#fb7185' : '#f43f5e',
          sellBorderColor: isDarkMode ? '#fb7185' : '#f43f5e',
          backgroundColor: isDarkMode ? 'rgba(148, 163, 184, 0.03)' : 'rgba(15, 23, 42, 0.03)',
          textColor: isDarkMode ? '#9ca3af' : '#4b5563',
          gridColor: 'transparent',
          borderColor: isDarkMode ? 'rgba(51, 65, 85, 0.3)' : 'rgba(209, 213, 219, 0.4)',
          volumeColor: isDarkMode ? '#818cf8' : '#6366f1',
          lineColor: isDarkMode ? '#6366f1' : '#4f46e5',
        };

        // Create the chart
        const chart = createChart(chartContainerRef.current, {
          width: chartContainerRef.current.clientWidth,
          height: 400,
          layout: {
            background: { type: ColorType.Solid, color: themeColors.backgroundColor },
            textColor: themeColors.textColor,
            fontSize: 14,
          },
          grid: {
            vertLines: {
              color: themeColors.borderColor,  // Using theme border color
              style: 1,  // Dotted
              visible: true
            },
            horzLines: {
              color: themeColors.borderColor,  // Using theme border color
              style: 1,  // Dotted
              visible: true
            },
          },
          rightPriceScale: {
            borderColor: themeColors.borderColor,
            borderVisible: true,
            scaleMargins: {
              top: 0.1,
              bottom: 0.2,
            },
            visible: true,
          },
          timeScale: {
            borderColor: themeColors.borderColor,
            borderVisible: true,
            timeVisible: true,
            secondsVisible: false,
            ticksVisible: true,
            visible: true,
          },
        });

        // Create series based on chart type
        let mainSeries: ISeriesApi<'Candlestick'> | ISeriesApi<'Line'>;
        let volumeSeries: ISeriesApi<'Histogram'> | null = null;

        if (chartType === 'candles') {
          // v5 API - uses addSeries with CandlestickSeries type
          mainSeries = chart.addSeries(CandlestickSeries, {
            upColor: themeColors.buyColor,
            downColor: themeColors.sellColor,
            borderUpColor: themeColors.buyBorderColor,
            borderDownColor: themeColors.sellBorderColor,
            wickUpColor: themeColors.buyColor,
            wickDownColor: themeColors.sellColor,
          });

          const chartData: CandlestickData<Time>[] = loadedDataRef.current.allData
            .filter(item => !isNaN(item.open)) // Filter out placeholder points
            .map(item => {
              // Convert YYYY-MM-DD string to Unix timestamp
              const [year, month, day] = item.time.split('-').map(Number);
              const timestamp = Math.floor(new Date(year, month - 1, day).getTime() / 1000) as Time;
              return {
                time: timestamp,
                open: item.open,
                high: item.high,
                low: item.low,
                close: item.close
              };
            });

          mainSeries.setData(chartData);
        } else {
          // v5 API - uses addSeries with LineSeries type
          mainSeries = chart.addSeries(LineSeries, {
            color: themeColors.lineColor,
            lineWidth: 2,
            priceLineVisible: false,
            lastValueVisible: true,
            crosshairMarkerVisible: true,
          });

          const chartData: LineData<Time>[] = loadedDataRef.current.allData
            .filter(item => !isNaN(item.close)) // Filter out placeholder points
            .map(item => {
              // Convert YYYY-MM-DD string to Unix timestamp
              const [year, month, day] = item.time.split('-').map(Number);
              const timestamp = Math.floor(new Date(year, month - 1, day).getTime() / 1000) as Time;
              return {
                time: timestamp,
                value: item.close
              };
            });

          mainSeries.setData(chartData);
        }

        // Add volume histogram if volume data exists
        if (loadedDataRef.current.allData.some(item => item.volume)) {
          // v5 API - uses addSeries with HistogramSeries type
          volumeSeries = chart.addSeries(HistogramSeries, {
            color: themeColors.volumeColor,
            priceFormat: {
              type: 'volume' as const,
            },
            priceScaleId: 'volume',
          });

          chart.priceScale('volume').applyOptions({
            scaleMargins: {
              top: 0.8,
              bottom: 0,
            },
          });

          const volumeData: HistogramData<Time>[] = loadedDataRef.current.allData
            .filter(item => !isNaN(item.close)) // Filter out placeholder points
            .map(item => {
              // Convert YYYY-MM-DD string to Unix timestamp
              const [year, month, day] = item.time.split('-').map(Number);
              const timestamp = Math.floor(new Date(year, month - 1, day).getTime() / 1000) as Time;
              return {
                time: timestamp,
                value: item.volume || 0,
                color: item.close >= item.open
                  ? `${themeColors.buyColor}66`
                  : `${themeColors.sellColor}66`
              };
            });

          if (volumeSeries) {
            volumeSeries.setData(volumeData);
          }
        }

        // Configure time scale
        chart.timeScale().applyOptions({
          rightOffset: 20,  // Even more space on the right to show future dates
          barSpacing: 6,
          minBarSpacing: 2,
          fixLeftEdge: false,
          fixRightEdge: false,
          lockVisibleTimeRangeOnResize: true,
          shiftVisibleRangeOnNewBar: true,
        });

        // Set visible range to include some future dates
        // This ensures the time scale extends beyond the last real data point
        const allTimestamps = loadedDataRef.current.allData.map(item => {
          const [year, month, day] = item.time.split('-').map(Number);
          return Math.floor(new Date(year, month - 1, day).getTime() / 1000);
        });

        if (allTimestamps.length > 0) {
          const firstTimestamp = allTimestamps[0];
          const lastRealDataIndex = loadedDataRef.current.allData.findIndex(item => isNaN(item.close));
          const extendIndex = lastRealDataIndex > 0 ? Math.min(lastRealDataIndex + 5, allTimestamps.length - 1) : allTimestamps.length - 1;
          const extendedTimestamp = allTimestamps[extendIndex];

          chart.timeScale().setVisibleRange({
            from: firstTimestamp as Time,
            to: extendedTimestamp as Time,
          });
        } else {
          chart.timeScale().fitContent();
        }

        // Handle scrolling to load more data
        visibleRangeHandler = (range: any) => {
          if (range === null || isLoadingMore) return;

          const barsInfo = mainSeries.barsInLogicalRange(range);
          if (barsInfo === null) return;

          // Define maximum future date (end of current year)
          const currentYear = new Date().getFullYear();
          const maxFutureDate = new Date(`${currentYear}-12-31`);
          const maxFutureDateStr = maxFutureDate.toISOString().split('T')[0];

          // If user scrolled near the left edge and we have the earliest data
          if (barsInfo.barsBefore < 10 && loadedDataRef.current.earliest) {
            const earliestDate = new Date(loadedDataRef.current.earliest);
            earliestDate.setDate(earliestDate.getDate() - 1); // One day before

            const toDate = new Date(loadedDataRef.current.earliest);
            toDate.setDate(toDate.getDate() - 1); // End one day before current earliest

            const fromDate = new Date(toDate);
            fromDate.setFullYear(fromDate.getFullYear() - 1); // Load one year of older data

            const fromStr = fromDate.toISOString().split('T')[0];
            const toStr = toDate.toISOString().split('T')[0];

            // Prevent duplicate requests for the same date range
            const requestKey = `left-${fromStr}-${toStr}`;
            if (lastLoadRequestRef.current === requestKey) return;
            lastLoadRequestRef.current = requestKey;

            console.log(`Loading historical data: ${fromStr} to ${toStr}`);
            loadMoreData(fromStr, toStr, chart, mainSeries, volumeSeries);
          }
          // If user scrolled near the right edge
          else if (barsInfo.barsAfter < 10 && loadedDataRef.current.latest) {
            const latestDate = new Date(loadedDataRef.current.latest);

            // Don't load beyond max future date
            if (latestDate >= maxFutureDate) {
              console.log('Reached maximum forward date limit');
              return;
            }

            const fromDate = new Date(loadedDataRef.current.latest);
            fromDate.setDate(fromDate.getDate() + 1); // Start one day after current latest

            // Load up to 3 months forward or max future date, whichever is sooner
            const toDate = new Date(fromDate);
            toDate.setMonth(toDate.getMonth() + 3);

            // Cap at max future date
            if (toDate > maxFutureDate) {
              toDate.setTime(maxFutureDate.getTime());
            }

            const fromStr = fromDate.toISOString().split('T')[0];
            const toStr = toDate.toISOString().split('T')[0];

            // Prevent duplicate requests for the same date range
            const requestKey = `right-${fromStr}-${toStr}`;
            if (lastLoadRequestRef.current === requestKey) return;
            lastLoadRequestRef.current = requestKey;

            console.log(`Loading forward data: ${fromStr} to ${toStr}`);
            loadMoreData(fromStr, toStr, chart, mainSeries, volumeSeries);
          }
        };

        chart.timeScale().subscribeVisibleLogicalRangeChange(visibleRangeHandler);

        // Handle window resize
        if (chartContainerRef.current) {
          resizeObserver = new ResizeObserver((entries) => {
            for (const entry of entries) {
              if (entry.target === chartContainerRef.current && chart) {
                const newWidth = entry.contentRect.width;
                chart.applyOptions({ width: newWidth });
                chart.timeScale().fitContent();
              }
            }
          });
          resizeObserver.observe(chartContainerRef.current);
        }

        chartRef.current = chart;
        setIsLoading(false);
      } catch (error: any) {
        console.error('Chart setup failed:', error);
        setError(`Failed to load chart: ${error.message}`);
        setIsLoading(false);
      }
    };

    createAndLoadChart();

    return () => {
      isSubscribed = false;
      cleanupChart();
    };
  }, [symbol, chartType, timeframe]);

  if (error) {
    return (
      <div className="w-full">
        <h3 className="text-lg font-semibold mb-2">Chart for {symbol}</h3>
        <div className="flex flex-col items-center justify-center h-[400px] space-y-4">
          <p className="text-red-500 text-center px-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600 transition-colors"
          >
            Reload Page
          </button>
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

      {/* Chart Container */}
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