/**
 * Data aggregation utilities for converting daily bars to weekly/monthly
 */

import { DailyPrice } from './database/types';

export interface AggregatedBar {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

/**
 * Aggregates daily data into weekly bars
 * Week starts on Monday, ends on Friday (or last trading day)
 */
export function aggregateToWeekly(dailyData: DailyPrice[]): AggregatedBar[] {
  if (dailyData.length === 0) return [];

  const weeklyBars: AggregatedBar[] = [];
  let currentWeek: DailyPrice[] = [];

  // Sort data by date
  const sorted = [...dailyData].sort((a, b) => a.date.localeCompare(b.date));

  sorted.forEach((bar) => {
    const barDate = new Date(bar.date);
    const dayOfWeek = barDate.getUTCDay(); // 0 = Sunday, 1 = Monday, etc.

    // If it's Monday (1) or the first bar, start a new week
    if (dayOfWeek === 1 || currentWeek.length === 0) {
      // Save previous week if exists
      if (currentWeek.length > 0) {
        weeklyBars.push(createAggregatedBar(currentWeek));
      }
      currentWeek = [bar];
    } else {
      currentWeek.push(bar);
    }
  });

  // Don't forget the last week
  if (currentWeek.length > 0) {
    weeklyBars.push(createAggregatedBar(currentWeek));
  }

  return weeklyBars;
}

/**
 * Aggregates daily data into monthly bars
 * Month is calendar month
 */
export function aggregateToMonthly(dailyData: DailyPrice[]): AggregatedBar[] {
  if (dailyData.length === 0) return [];

  const monthlyBars: AggregatedBar[] = [];
  let currentMonth: DailyPrice[] = [];
  let currentMonthKey = '';

  // Sort data by date
  const sorted = [...dailyData].sort((a, b) => a.date.localeCompare(b.date));

  sorted.forEach((bar) => {
    const barDate = new Date(bar.date);
    const monthKey = `${barDate.getUTCFullYear()}-${String(barDate.getUTCMonth() + 1).padStart(2, '0')}`;

    if (monthKey !== currentMonthKey) {
      // Save previous month if exists
      if (currentMonth.length > 0) {
        monthlyBars.push(createAggregatedBar(currentMonth));
      }
      currentMonth = [bar];
      currentMonthKey = monthKey;
    } else {
      currentMonth.push(bar);
    }
  });

  // Don't forget the last month
  if (currentMonth.length > 0) {
    monthlyBars.push(createAggregatedBar(currentMonth));
  }

  return monthlyBars;
}

/**
 * Creates an aggregated bar from a collection of daily bars
 */
function createAggregatedBar(bars: DailyPrice[]): AggregatedBar {
  if (bars.length === 0) {
    throw new Error('Cannot create aggregated bar from empty array');
  }

  // Sort bars by date to ensure correct open/close
  const sorted = [...bars].sort((a, b) => a.date.localeCompare(b.date));

  return {
    time: sorted[0].date, // Use first day of period as the time
    open: sorted[0].open,
    high: Math.max(...sorted.map(b => b.high)),
    low: Math.min(...sorted.map(b => b.low)),
    close: sorted[sorted.length - 1].close,
    volume: sorted.reduce((sum, b) => sum + b.volume, 0)
  };
}

/**
 * Determines the appropriate aggregation based on interval string
 */
export function aggregateByInterval(dailyData: DailyPrice[], interval: string): AggregatedBar[] {
  switch (interval.toUpperCase()) {
    case '1D':
    case 'DAILY':
      // No aggregation needed, just convert format
      return dailyData.map(bar => ({
        time: bar.date,
        open: bar.open,
        high: bar.high,
        low: bar.low,
        close: bar.close,
        volume: bar.volume
      }));

    case '1W':
    case 'WEEKLY':
      return aggregateToWeekly(dailyData);

    case '1M':
    case 'MONTHLY':
      return aggregateToMonthly(dailyData);

    case '1H':
    case '4H':
      // Intraday intervals not supported with daily data
      // Return daily data as fallback
      console.warn(`Interval ${interval} requires intraday data. Returning daily data instead.`);
      return dailyData.map(bar => ({
        time: bar.date,
        open: bar.open,
        high: bar.high,
        low: bar.low,
        close: bar.close,
        volume: bar.volume
      }));

    default:
      throw new Error(`Unsupported interval: ${interval}`);
  }
}