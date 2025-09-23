import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useBrokerDataRefresh } from '@/hooks/useBrokerDataRefresh';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('useBrokerDataRefresh Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers({ shouldAdvanceTime: true });

    // Default successful response
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        connections: [
          {
            broker: 'alpaca_paper',
            status: 'connected',
            accountInfo: {
              accountId: 'TEST123',
              balance: 50000,
              buyingPower: 25000,
              positionCount: 5
            }
          }
        ]
      })
    });
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  describe('Core Functionality', () => {
    it('should fetch data on mount when mount trigger is enabled', async () => {
      const { result } = renderHook(() =>
        useBrokerDataRefresh({ triggers: ['mount'] })
      );

      expect(result.current.status).toBe('fetching');

      await waitFor(() => {
        expect(result.current.status).toBe('success');
      });

      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/brokers/connect'),
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include'
        }
      );
    });

    it('should not fetch on mount when mount trigger is disabled', async () => {
      renderHook(() =>
        useBrokerDataRefresh({ triggers: [] })
      );

      await act(async () => {
        await vi.advanceTimersByTimeAsync(100);
      });

      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('should transform API response correctly', async () => {
      const { result } = renderHook(() =>
        useBrokerDataRefresh({ triggers: ['mount'] })
      );

      await waitFor(() => {
        expect(result.current.status).toBe('success');
      });

      expect(result.current.data).toHaveLength(1);
      expect(result.current.data[0]).toMatchObject({
        brokerId: 'alpaca_paper',
        isConnected: true,
        accountId: 'TEST123',
        balance: 50000,
        buyingPower: 25000,
        positions: 5
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const onError = vi.fn();
      const { result } = renderHook(() =>
        useBrokerDataRefresh({
          triggers: ['mount'],
          onError,
          retryCount: 0
        })
      );

      await waitFor(() => {
        expect(result.current.status).toBe('error');
      });

      expect(result.current.error?.message).toBe('Network error');
      expect(onError).toHaveBeenCalledWith(expect.any(Error));
    });

    it('should retry on error with exponential backoff', async () => {
      mockFetch
        .mockRejectedValueOnce(new Error('First failure'))
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ connections: [] })
        });

      const { result } = renderHook(() =>
        useBrokerDataRefresh({
          triggers: ['mount'],
          retryCount: 1,
          retryDelayMs: 100
        })
      );

      // First attempt fails
      await waitFor(() => {
        expect(result.current.status).toBe('error');
      });

      // Advance time for retry
      await act(async () => {
        await vi.advanceTimersByTimeAsync(100);
      });

      // Retry succeeds
      await waitFor(() => {
        expect(result.current.status).toBe('success');
      });

      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it('should handle non-ok responses', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        statusText: 'Unauthorized'
      });

      const { result } = renderHook(() =>
        useBrokerDataRefresh({
          triggers: ['mount'],
          retryCount: 0
        })
      );

      await waitFor(() => {
        expect(result.current.status).toBe('error');
      });

      expect(result.current.error?.message).toContain('Unauthorized');
    });
  });

  describe('Trigger Behaviors', () => {
    describe('Focus Trigger', () => {
      it('should refresh on focus when data is stale', async () => {
        const { result } = renderHook(() =>
          useBrokerDataRefresh({
            triggers: ['mount', 'focus'],
            staleAfterMs: 100
          })
        );

        // Initial fetch on mount
        await waitFor(() => {
          expect(result.current.status).toBe('success');
        });
        expect(mockFetch).toHaveBeenCalledTimes(1);

        // Make data stale
        await act(async () => {
          await vi.advanceTimersByTimeAsync(150);
        });

        // Simulate focus event
        await act(async () => {
          window.dispatchEvent(new Event('focus'));
        });

        // Should trigger another fetch
        await waitFor(() => {
          expect(mockFetch).toHaveBeenCalledTimes(2);
        });
      });

      it('should not refresh on focus when data is fresh', async () => {
        const { result } = renderHook(() =>
          useBrokerDataRefresh({
            triggers: ['mount', 'focus'],
            staleAfterMs: 10000
          })
        );

        await waitFor(() => {
          expect(result.current.status).toBe('success');
        });
        expect(mockFetch).toHaveBeenCalledTimes(1);

        // Data is still fresh
        await act(async () => {
          window.dispatchEvent(new Event('focus'));
        });

        // Should NOT trigger another fetch
        expect(mockFetch).toHaveBeenCalledTimes(1);
      });
    });

    describe('Interval Trigger', () => {
      it('should refresh at specified intervals', async () => {
        renderHook(() =>
          useBrokerDataRefresh({
            triggers: ['interval'],
            intervalMs: 1000
          })
        );

        // No initial fetch (no mount trigger)
        expect(mockFetch).toHaveBeenCalledTimes(0);

        // First interval
        await act(async () => {
          await vi.advanceTimersByTimeAsync(1000);
        });
        expect(mockFetch).toHaveBeenCalledTimes(1);

        // Second interval
        await act(async () => {
          await vi.advanceTimersByTimeAsync(1000);
        });
        expect(mockFetch).toHaveBeenCalledTimes(2);

        // Third interval
        await act(async () => {
          await vi.advanceTimersByTimeAsync(1000);
        });
        expect(mockFetch).toHaveBeenCalledTimes(3);
      });
    });

    describe('Manual Trigger', () => {
      it('should allow manual refresh via returned function', async () => {
        const { result } = renderHook(() =>
          useBrokerDataRefresh({ triggers: [] })
        );

        // No automatic fetch
        expect(mockFetch).toHaveBeenCalledTimes(0);

        // Manual refresh
        await act(async () => {
          result.current.refresh();
        });

        await waitFor(() => {
          expect(result.current.status).toBe('success');
        });
        expect(mockFetch).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Concurrent Fetch Prevention', () => {
    it('should prevent multiple simultaneous fetches', async () => {
      const { result } = renderHook(() =>
        useBrokerDataRefresh({ triggers: [] })
      );

      // Start first refresh
      act(() => {
        result.current.refresh();
      });

      // Try to start more while first is in progress
      act(() => {
        result.current.refresh();
        result.current.refresh();
      });

      // Only one fetch should occur
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledTimes(1);
      });
    });

    it('should allow new fetch after previous completes', async () => {
      const { result } = renderHook(() =>
        useBrokerDataRefresh({ triggers: [] })
      );

      // First refresh
      await act(async () => {
        result.current.refresh();
      });
      await waitFor(() => {
        expect(result.current.status).toBe('success');
      });
      expect(mockFetch).toHaveBeenCalledTimes(1);

      // Second refresh (after first completes)
      await act(async () => {
        result.current.refresh();
      });
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('Staleness Detection', () => {
    it('should mark data as stale after specified time', async () => {
      const { result, rerender } = renderHook(() =>
        useBrokerDataRefresh({
          triggers: ['mount'],
          staleAfterMs: 1000
        })
      );

      await waitFor(() => {
        expect(result.current.status).toBe('success');
      });
      expect(result.current.isStale).toBe(false);

      // Advance time past stale threshold
      await act(async () => {
        await vi.advanceTimersByTimeAsync(1100);
      });

      // Force re-render to recalculate isStale
      rerender();

      // Now check staleness - the isStale flag should be true
      expect(result.current.isStale).toBe(true);

      // The status remains 'success' but isStale indicates staleness
      // This is the actual behavior - status only changes to 'stale'
      // when the effect runs, which requires another render cycle
      expect(result.current.status).toBe('success');
    });
  });

  describe('Callbacks', () => {
    it('should call onSuccess callback with data', async () => {
      const onSuccess = vi.fn();

      renderHook(() =>
        useBrokerDataRefresh({
          triggers: ['mount'],
          onSuccess
        })
      );

      await waitFor(() => {
        expect(onSuccess).toHaveBeenCalledWith(expect.arrayContaining([
          expect.objectContaining({
            brokerId: 'alpaca_paper'
          })
        ]));
      });
    });

    it('should call onError callback on failure', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Test error'));
      const onError = vi.fn();

      renderHook(() =>
        useBrokerDataRefresh({
          triggers: ['mount'],
          onError,
          retryCount: 0
        })
      );

      await waitFor(() => {
        expect(onError).toHaveBeenCalledWith(expect.any(Error));
      });
    });
  });

  describe('Broker ID Filtering', () => {
    it('should filter to specific broker IDs when provided', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          connections: [
            {
              broker: 'alpaca_paper',
              status: 'connected',
              accountInfo: { accountId: 'PAPER123', balance: 50000, buyingPower: 25000, positionCount: 5 }
            },
            {
              broker: 'alpaca_live',
              status: 'connected',
              accountInfo: { accountId: 'LIVE456', balance: 100000, buyingPower: 50000, positionCount: 10 }
            },
            {
              broker: 'ibkr_live',
              status: 'connected',
              accountInfo: { accountId: 'IBKR789', balance: 75000, buyingPower: 35000, positionCount: 7 }
            }
          ]
        })
      });

      const { result } = renderHook(() =>
        useBrokerDataRefresh({
          triggers: ['mount'],
          brokerIds: ['alpaca_paper', 'ibkr_live']
        })
      );

      await waitFor(() => {
        expect(result.current.status).toBe('success');
      });

      // Should only have 2 brokers (filtered)
      expect(result.current.data).toHaveLength(2);
      expect(result.current.data.map(b => b.brokerId)).toEqual(['alpaca_paper', 'ibkr_live']);

      // Verify URL was built with broker filters
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('brokerId=alpaca_paper'),
        expect.any(Object)
      );
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('brokerId=ibkr_live'),
        expect.any(Object)
      );
    });

    it('should handle single broker ID filter', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          connections: [
            {
              broker: 'alpaca_paper',
              status: 'connected',
              accountInfo: { accountId: 'PAPER123', balance: 50000, buyingPower: 25000, positionCount: 5 }
            }
          ]
        })
      });

      const { result } = renderHook(() =>
        useBrokerDataRefresh({
          triggers: ['mount'],
          brokerIds: ['alpaca_paper']
        })
      );

      await waitFor(() => {
        expect(result.current.status).toBe('success');
      });

      expect(result.current.data).toHaveLength(1);
      expect(result.current.data[0].brokerId).toBe('alpaca_paper');
    });

    it('should return empty array when filtered broker not found', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          connections: [
            {
              broker: 'alpaca_live',
              status: 'connected',
              accountInfo: { accountId: 'LIVE456', balance: 100000, buyingPower: 50000, positionCount: 10 }
            }
          ]
        })
      });

      const { result } = renderHook(() =>
        useBrokerDataRefresh({
          triggers: ['mount'],
          brokerIds: ['nonexistent_broker']
        })
      );

      await waitFor(() => {
        expect(result.current.status).toBe('success');
      });

      expect(result.current.data).toHaveLength(0);
    });

    it('should fetch all brokers when brokerIds is empty array', async () => {
      const { result } = renderHook(() =>
        useBrokerDataRefresh({
          triggers: ['mount'],
          brokerIds: []
        })
      );

      await waitFor(() => {
        expect(result.current.status).toBe('success');
      });

      // Should get all brokers (default mock has 1)
      expect(result.current.data).toHaveLength(1);

      // URL should not have broker filter params
      expect(mockFetch).toHaveBeenCalledWith(
        expect.not.stringContaining('brokerId='),
        expect.any(Object)
      );
    });

    it('should fetch all brokers when brokerIds is undefined', async () => {
      const { result } = renderHook(() =>
        useBrokerDataRefresh({
          triggers: ['mount']
          // brokerIds not provided
        })
      );

      await waitFor(() => {
        expect(result.current.status).toBe('success');
      });

      expect(result.current.data).toHaveLength(1);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.not.stringContaining('brokerId='),
        expect.any(Object)
      );
    });

    it('should apply filter on manual refresh with brokerIds', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          connections: [
            {
              broker: 'alpaca_paper',
              status: 'connected',
              accountInfo: { accountId: 'PAPER123', balance: 50000, buyingPower: 25000, positionCount: 5 }
            },
            {
              broker: 'alpaca_live',
              status: 'connected',
              accountInfo: { accountId: 'LIVE456', balance: 100000, buyingPower: 50000, positionCount: 10 }
            }
          ]
        })
      });

      const { result } = renderHook(() =>
        useBrokerDataRefresh({
          triggers: [],
          brokerIds: ['alpaca_paper']
        })
      );

      // Manual refresh
      await act(async () => {
        result.current.refresh();
      });

      await waitFor(() => {
        expect(result.current.status).toBe('success');
      });

      expect(result.current.data).toHaveLength(1);
      expect(result.current.data[0].brokerId).toBe('alpaca_paper');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty connections array', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ connections: [] })
      });

      const { result } = renderHook(() =>
        useBrokerDataRefresh({ triggers: ['mount'] })
      );

      await waitFor(() => {
        expect(result.current.status).toBe('success');
      });
      expect(result.current.data).toEqual([]);
    });

    it('should handle missing connections property', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({})
      });

      const { result } = renderHook(() =>
        useBrokerDataRefresh({ triggers: ['mount'] })
      );

      await waitFor(() => {
        expect(result.current.status).toBe('success');
      });
      expect(result.current.data).toEqual([]);
    });

    it('should cleanup intervals on unmount', () => {
      const { unmount } = renderHook(() =>
        useBrokerDataRefresh({
          triggers: ['interval'],
          intervalMs: 1000
        })
      );

      const clearIntervalSpy = vi.spyOn(global, 'clearInterval');
      unmount();
      expect(clearIntervalSpy).toHaveBeenCalled();
    });

    it('should cleanup event listeners on unmount', () => {
      const { unmount } = renderHook(() =>
        useBrokerDataRefresh({ triggers: ['focus'] })
      );

      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
      unmount();
      expect(removeEventListenerSpy).toHaveBeenCalledWith('focus', expect.any(Function));
    });
  });
});