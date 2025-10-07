"use client";

import { useEffect, useRef, useState } from 'react';
import { TrendingUp, BarChart2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ChartControls, getPresetConfig } from './ChartControls';
import {
  chartControlStyles,
  getCandlestickConfig,
  getLineSeriesConfig,
  getHistogramConfig,
  getChartLayout,
  getChartGrid,
  getCrosshairConfig,
  chartColors,
  chartTheme
} from '@/lib/chartStyles';
import { cn } from '@/lib/utils';
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

export function LocalChart({ symbol, fullHeight = false }: { symbol: string; fullHeight?: boolean }) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chartType, setChartType] = useState<'candles' | 'line'>('candles');
  const [selectedPreset, setSelectedPreset] = useState('3M'); // Default to 3 months
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const lastLoadRequestRef = useRef<string | null>(null);

  // Track loaded data range
  const loadedDataRef = useRef<{
    earliest: string | null;
    latest: string | null;
    allData: ChartData[];
  }>({ earliest: null, latest: null, allData: [] });


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

      // Get the current interval from the preset
      const preset = getPresetConfig(selectedPreset);
      const selectedInterval = preset.interval;

      const response = await fetch(`/api/market-data/history/${symbol}?from=${fromDate}&to=${toDate}&interval=${selectedInterval}`);
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

    // Reset loaded data when symbol, interval or range changes
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
        // Get the preset configuration
        const preset = getPresetConfig(selectedPreset);
        const selectedRange = preset.range;
        const selectedInterval = preset.interval;

        // Calculate date range based on selected range
        // Database has data from Sep 25, 2020 to Jan 24, 2025
        const maxDataDate = new Date('2025-01-24');
        const minDataDate = new Date('2020-09-25');
        const today = new Date();
        const endDate = today > maxDataDate ? maxDataDate : today;
        let startDate = new Date(endDate); // Create a copy of endDate

        switch (selectedRange) {
          case '1w':
            startDate.setDate(endDate.getDate() - 7);
            break;
          case '1m':
            startDate.setMonth(endDate.getMonth() - 1);
            break;
          case '3m':
            startDate.setMonth(endDate.getMonth() - 3);
            break;
          case '1y':
            startDate.setFullYear(endDate.getFullYear() - 1);
            break;
          case 'all':
            startDate = new Date(minDataDate);
            break;
          default:
            startDate.setMonth(endDate.getMonth() - 1); // Default to 1 month
        }

        // CRITICAL: Ensure start date isn't before our earliest data
        // This prevents 404 errors when requesting data before Sept 25, 2020
        if (startDate < minDataDate) {
          console.log(`Adjusting start date from ${startDate.toISOString().split('T')[0]} to ${minDataDate.toISOString().split('T')[0]} (earliest available data)`);
          startDate = new Date(minDataDate);
        }

        const endDateStr = endDate.toISOString().split('T')[0];
        const startDateStr = startDate.toISOString().split('T')[0];

        console.log(`Fetching data for ${symbol} from ${startDateStr} to ${endDateStr} (range: ${selectedRange}, interval: ${selectedInterval})`);

        const response = await fetch(`/api/market-data/history/${symbol}?from=${startDateStr}&to=${endDateStr}&interval=${selectedInterval}`);
        if (!response.ok) {
          console.error(`API returned ${response.status}: ${response.statusText}`);
          const errorText = await response.text();
          console.error('Error response:', errorText);

          // Provide specific error message for common issues
          if (response.status === 404) {
            // Check if it's a date range issue
            if (startDateStr < '2020-09-25') {
              throw new Error(`No data available before September 25, 2020. Please select a more recent date range.`);
            } else if (endDateStr > '2025-01-24') {
              throw new Error(`No data available after January 24, 2025. Please select an earlier date range.`);
            } else {
              throw new Error(`No data available for ${symbol} in the selected date range (${startDateStr} to ${endDateStr})`);
            }
          } else {
            throw new Error(`Failed to fetch market data: ${response.status}`);
          }
        }

        const marketData = await response.json();
        console.log(`Received ${marketData.data?.length || 0} data points for range: ${selectedRange}`);

        if (!isSubscribed) return;

        if (!marketData.data || marketData.data.length === 0) {
          setError('No data available for this symbol');
          setIsLoading(false);
          return;
        }

        // Store the initial loaded data
        const chartData = marketData.data
          .map((item: any) => ({
            time: item.time,
            open: item.open,
            high: item.high,
            low: item.low,
            close: item.close || item.value,
            volume: item.volume || 0
          }))
          .sort((a: any, b: any) => a.time.localeCompare(b.time));

        loadedDataRef.current.allData = chartData;
        const sortedDates = chartData.map((d: any) => d.time).sort();
        loadedDataRef.current.earliest = sortedDates[0];
        loadedDataRef.current.latest = sortedDates[sortedDates.length - 1];

        // Clear any existing chart before creating a new one
        cleanupChart();

        // Get theme configuration from centralized chartStyles
        const isDarkMode = document.documentElement.classList.contains('dark');
        const textColor = isDarkMode ? '#9ca3af' : '#4b5563';

        // Get standardized color configs
        const candlestickConfig = getCandlestickConfig(isDarkMode);
        const lineConfig = getLineSeriesConfig(isDarkMode, 'neutral');
        const chartLayout = getChartLayout(isDarkMode, textColor);
        const chartGrid = getChartGrid(isDarkMode);
        const crosshairConfig = getCrosshairConfig(isDarkMode);

        // Extract colors for volume bars
        const buyColor = isDarkMode ? chartColors.buy.dark : chartColors.buy.light;
        const sellColor = isDarkMode ? chartColors.sell.dark : chartColors.sell.light;
        const borderColor = isDarkMode ? chartTheme.border.dark : chartTheme.border.light;

        // Create the chart with standardized configuration
        const chart = createChart(chartContainerRef.current, {
          width: chartContainerRef.current.clientWidth,
          height: 400,
          layout: {
            background: { type: ColorType.Solid, color: chartLayout.background.color },
            textColor: chartLayout.textColor,
            fontSize: 14,
          },
          grid: {
            vertLines: {
              color: chartGrid.vertLines.color,
              style: 1,  // Dotted
              visible: true
            },
            horzLines: {
              color: chartGrid.horzLines.color,
              style: 1,  // Dotted
              visible: true
            },
          },
          rightPriceScale: {
            borderColor: borderColor,
            borderVisible: true,
            scaleMargins: {
              top: 0.1,
              bottom: 0.2,
            },
            visible: true,
          },
          timeScale: {
            borderColor: borderColor,
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
          // v5 API - uses addSeries with standardized candlestick config
          mainSeries = chart.addSeries(CandlestickSeries, candlestickConfig);

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
          // v5 API - uses addSeries with standardized line config
          mainSeries = chart.addSeries(LineSeries, {
            ...lineConfig,
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
          // v5 API - uses addSeries with standardized histogram config
          const histogramConfig = getHistogramConfig(isDarkMode);
          volumeSeries = chart.addSeries(HistogramSeries, {
            ...histogramConfig,
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
                  ? chartColors.volume.up
                  : chartColors.volume.down
              };
            });

          if (volumeSeries) {
            volumeSeries.setData(volumeData);
          }
        }

        // Configure time scale
        chart.timeScale().applyOptions({
          rightOffset: 80,   // More space on the right side from edge to last candle
          barSpacing: 12,    // Default spacing between candles
          minBarSpacing: 6,  // Minimum spacing (prevents overcrowding)
          maxBarSpacing: 16, // Maximum spacing (prevents spreading too far)
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
        }
        // Don't call fitContent() here as it resets rightOffset

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
                // Don't call fitContent() on resize to preserve rightOffset
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
  }, [symbol, chartType, selectedPreset]);

  if (error) {
    return (
      <div className={`w-full ${fullHeight ? 'h-full flex flex-col' : ''}`}>
        <h3 className="text-lg font-semibold mb-2">Chart for {symbol}</h3>
        <div className={`flex flex-col items-center justify-center space-y-4 ${fullHeight ? 'flex-1' : 'h-[400px]'}`}>
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
    <div ref={containerRef} className={`w-full ${fullHeight ? 'h-full flex flex-col' : ''}`}>
      {/* Chart Toolbar */}
      <div className={chartControlStyles.toolbar}>
        {/* Preset controls */}
        <ChartControls
          selectedPreset={selectedPreset}
          onPresetChange={setSelectedPreset}
          className=""
        />

        {/* Divider */}
        <div className={chartControlStyles.divider} />

        {/* Chart type toggle buttons */}
        <div className={chartControlStyles.chartTypeToggle.container}>
          <button
            onClick={() => setChartType('candles')}
            className={cn(
              chartControlStyles.chartTypeToggle.button,
              chartType === 'candles'
                ? chartControlStyles.chartTypeToggle.active
                : chartControlStyles.chartTypeToggle.inactive
            )}
            title="Candlestick chart"
          >
            <BarChart2 className={chartControlStyles.chartTypeToggle.icon} />
          </button>
          <button
            onClick={() => setChartType('line')}
            className={cn(
              chartControlStyles.chartTypeToggle.button,
              chartType === 'line'
                ? chartControlStyles.chartTypeToggle.active
                : chartControlStyles.chartTypeToggle.inactive
            )}
            title="Line chart"
          >
            <TrendingUp className={chartControlStyles.chartTypeToggle.icon} />
          </button>
        </div>
      </div>

      {/* Chart Container */}
      <div className={`w-full rounded-lg relative ${fullHeight ? 'flex-1' : ''}`} style={fullHeight ? { minWidth: '100%' } : { height: '400px', minWidth: '100%' }}>
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