/**
 * React hooks for market data
 */

import { useState, useEffect, useCallback } from 'react';
import { marketDataService, StockQuote } from './MarketDataService';
import { DailyPrice } from '../database/types';

/**
 * Hook to get the latest price for a symbol
 */
export function useLatestPrice(symbol: string | null) {
  const [price, setPrice] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!symbol) {
      setPrice(null);
      return;
    }

    let cancelled = false;

    async function fetchPrice() {
      if (!symbol) return; // Type guard

      setLoading(true);
      setError(null);

      try {
        const result = await marketDataService.getLatestPrice(symbol);
        if (!cancelled) {
          setPrice(result);
          if (result === null) {
            setError(`No price data for ${symbol}`);
          }
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to fetch price');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchPrice();

    return () => {
      cancelled = true;
    };
  }, [symbol]);

  return { price, loading, error };
}

/**
 * Hook to get full quote data
 */
export function useStockQuote(symbol: string | null) {
  const [quote, setQuote] = useState<StockQuote | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!symbol) {
      setQuote(null);
      return;
    }

    let cancelled = false;

    async function fetchQuote() {
      if (!symbol) return; // Type guard

      setLoading(true);
      setError(null);

      try {
        const result = await marketDataService.getQuote(symbol);
        if (!cancelled) {
          setQuote(result);
          if (result === null) {
            setError(`No data for ${symbol}`);
          }
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to fetch quote');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchQuote();

    return () => {
      cancelled = true;
    };
  }, [symbol]);

  return { quote, loading, error };
}

/**
 * Hook to search symbols with debouncing
 */
export function useSymbolSearch(delay: number = 300) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query || query.length < 1) {
      setResults([]);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setLoading(true);
      try {
        const symbols = await marketDataService.searchSymbols(query);
        setResults(symbols);
      } catch (error) {
        console.error('Symbol search failed:', error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, delay);

    return () => clearTimeout(timeoutId);
  }, [query, delay]);

  return {
    query,
    setQuery,
    results,
    loading
  };
}

/**
 * Hook to validate a symbol
 */
export function useSymbolValidation(symbol: string | null) {
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!symbol) {
      setIsValid(null);
      return;
    }

    let cancelled = false;

    async function validate() {
      if (!symbol) return; // Type guard

      setLoading(true);
      try {
        const valid = await marketDataService.validateSymbol(symbol);
        if (!cancelled) {
          setIsValid(valid);
        }
      } catch (error) {
        if (!cancelled) {
          setIsValid(false);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    validate();

    return () => {
      cancelled = true;
    };
  }, [symbol]);

  return { isValid, loading };
}

/**
 * Hook to get price history
 */
export function usePriceHistory(
  symbol: string | null,
  from: string | null,
  to: string | null
) {
  const [history, setHistory] = useState<DailyPrice[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!symbol || !from || !to) {
      setHistory([]);
      return;
    }

    let cancelled = false;

    async function fetchHistory() {
      if (!symbol || !from || !to) return; // Type guard

      setLoading(true);
      setError(null);

      try {
        const data = await marketDataService.getPriceHistory(symbol, from, to);
        if (!cancelled) {
          setHistory(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to fetch history');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchHistory();

    return () => {
      cancelled = true;
    };
  }, [symbol, from, to]);

  return { history, loading, error };
}

/**
 * Hook to get price on a specific date
 */
export function usePriceOnDate(symbol: string | null, date: string | null) {
  const [price, setPrice] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!symbol || !date) {
      setPrice(null);
      return;
    }

    let cancelled = false;

    async function fetchPrice() {
      if (!symbol || !date) return; // Type guard

      setLoading(true);
      setError(null);

      try {
        const result = await marketDataService.getPriceOnDate(symbol, date);
        if (!cancelled) {
          setPrice(result);
          if (result === null) {
            setError(`No price data for ${symbol} on ${date}`);
          }
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to fetch price');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchPrice();

    return () => {
      cancelled = true;
    };
  }, [symbol, date]);

  return { price, loading, error };
}