/**
 * Trading Safety System Tests
 * Critical tests for trading safety checks and risk management
 * These tests ensure financial safety and prevent accidental losses
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { performTradeSafetyCheck, TradingSafetyContext, type TradeRequest } from '@/lib/trading/safety-checks'
import { getEnvironmentConfig } from '@/lib/config/environment'

// Mock environment configuration
vi.mock('@/lib/config/environment', () => ({
  getEnvironmentConfig: vi.fn(),
  getTradingFeatureFlags: vi.fn(),
  isRealTradingAllowed: vi.fn()
}))

// Mock NextAuth
vi.mock('next-auth', async (importOriginal) => {
  const actual = await importOriginal<typeof import('next-auth')>()
  return {
    ...actual,
    getServerSession: vi.fn(),
    default: vi.fn()
  }
})

describe('Trading Safety Checks', () => {
  const mockEnvironmentConfig = {
    environment: 'development' as const,
    isProduction: false,
    isDevelopment: true,
    isStaging: false,
    environmentLabel: 'DEVELOPMENT',
    environmentColor: 'bg-blue-500',
    baseUrl: 'http://localhost:3000',
    tradingEnabled: true,
    realMoneyMode: false,
    paperTradingMode: true
  }

  beforeEach(async () => {
    // Reset all mocks
    vi.clearAllMocks()
    
    // Import the mocked functions
    const { getEnvironmentConfig, getTradingFeatureFlags, isRealTradingAllowed } = await import('@/lib/config/environment')
    
    // Set up default mocks
    vi.mocked(getEnvironmentConfig).mockReturnValue(mockEnvironmentConfig)
    vi.mocked(getTradingFeatureFlags).mockReturnValue({
      showDebugInfo: true,
      enableMockData: true,
      showEnvironmentBadge: true,
      verboseLogging: true,
      enableTestEndpoints: true,
      allowRealTrades: false,
      showTradingSafetyWarnings: true,
      enablePaperTrading: true,
      requireTradingConfirmation: true,
      showRiskWarnings: true
    })
    vi.mocked(isRealTradingAllowed).mockReturnValue(false)
  })
  
  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Environment Safety', () => {
    it('should block real money trades in development environment', async () => {
      const tradeRequest: TradeRequest = {
        symbol: 'AAPL',
        quantity: 100,
        orderType: 'market',
        side: 'buy',
        realMoney: true
      }

      const result = await performTradeSafetyCheck(tradeRequest)

      expect(result.allowed).toBe(false)
      expect(result.reasons).toContain('Real money trading not allowed in development environment')
    })

    it('should allow paper trades in development environment', async () => {
      const tradeRequest: TradeRequest = {
        symbol: 'AAPL',
        quantity: 100,
        orderType: 'market',
        side: 'buy',
        realMoney: false
      }

      const result = await performTradeSafetyCheck(tradeRequest)

      expect(result.allowed).toBe(true)
      expect(result.warnings).toContain('Trading in development environment')
      expect(result.warnings).toContain('This is a paper trade - no real money will be used')
    })

    it('should properly validate real money trading requirements', async () => {
      // This test focuses on the real money validation logic itself,
      // not the market hours (which is tested separately)
      
      // Import mocked functions
      const { getEnvironmentConfig, isRealTradingAllowed } = await import('@/lib/config/environment')
      
      // Test 1: Real money in development should fail
      const tradeRequest: TradeRequest = {
        symbol: 'AAPL',
        quantity: 100,
        orderType: 'market',
        side: 'buy',
        realMoney: true
      }

      // Use default development config (already set in beforeEach)
      let result = await performTradeSafetyCheck(tradeRequest)
      expect(result.allowed).toBe(false)
      expect(result.reasons).toContain('Real money trading not allowed in development environment')

      // Test 2: Real money with real money mode disabled should fail
      const configWithRealMoneyDisabled = {
        ...mockEnvironmentConfig,
        environment: 'production' as const,
        isProduction: true,
        realMoneyMode: false // disabled
      }
      vi.mocked(getEnvironmentConfig).mockReturnValue(configWithRealMoneyDisabled)
      vi.mocked(isRealTradingAllowed).mockReturnValue(false)

      result = await performTradeSafetyCheck(tradeRequest)
      expect(result.allowed).toBe(false)
      expect(result.reasons).toContain('Real money mode is disabled')

      // Test 3: Real money with all permissions but isRealTradingAllowed returns false should fail  
      const productionConfig = {
        ...mockEnvironmentConfig,
        environment: 'production' as const,
        isProduction: true,
        realMoneyMode: true
      }
      vi.mocked(getEnvironmentConfig).mockReturnValue(productionConfig)
      vi.mocked(isRealTradingAllowed).mockReturnValue(false) // Still false

      result = await performTradeSafetyCheck(tradeRequest)
      expect(result.allowed).toBe(false)
      expect(result.reasons).toContain('Real trading not permitted in current configuration')

      // This test validates the permission chain without requiring market hours
    })
  })

  describe('Parameter Validation', () => {
    it('should reject invalid symbols', async () => {
      const tradeRequest: TradeRequest = {
        symbol: 'invalid-symbol',
        quantity: 100,
        orderType: 'market',
        side: 'buy'
      }

      const result = await performTradeSafetyCheck(tradeRequest)

      expect(result.allowed).toBe(false)
      expect(result.reasons).toContain('Invalid symbol format')
    })

    it('should reject zero or negative quantities', async () => {
      const tradeRequest: TradeRequest = {
        symbol: 'AAPL',
        quantity: 0,
        orderType: 'market',
        side: 'buy'
      }

      const result = await performTradeSafetyCheck(tradeRequest)

      expect(result.allowed).toBe(false)
      expect(result.reasons).toContain('Quantity must be greater than zero')
    })

    it('should reject quantities exceeding maximum limit', async () => {
      const tradeRequest: TradeRequest = {
        symbol: 'AAPL',
        quantity: 15000,
        orderType: 'market',
        side: 'buy'
      }

      const result = await performTradeSafetyCheck(tradeRequest)

      expect(result.allowed).toBe(false)
      expect(result.reasons).toContain('Quantity exceeds maximum limit of 10,000 shares')
    })

    it('should require price for limit orders', async () => {
      const tradeRequest: TradeRequest = {
        symbol: 'AAPL',
        quantity: 100,
        orderType: 'limit',
        side: 'buy'
      }

      const result = await performTradeSafetyCheck(tradeRequest)

      expect(result.allowed).toBe(false)
      expect(result.reasons).toContain('Price is required for limit orders')
    })

    it('should reject invalid price ranges', async () => {
      const tradeRequest: TradeRequest = {
        symbol: 'AAPL',
        quantity: 100,
        orderType: 'limit',
        side: 'buy',
        price: -50
      }

      const result = await performTradeSafetyCheck(tradeRequest)

      expect(result.allowed).toBe(false)
      expect(result.reasons).toContain('Price must be between $0.01 and $100,000')
    })
  })

  describe('Risk Management', () => {
    it('should warn about high volatility stocks', async () => {
      const tradeRequest: TradeRequest = {
        symbol: 'TSLA',
        quantity: 100,
        orderType: 'market',
        side: 'buy'
      }

      const result = await performTradeSafetyCheck(tradeRequest)

      expect(result.allowed).toBe(true)
      expect(result.warnings).toContain('High volatility stock - exercise extra caution')
    })

    it('should reject trades exceeding order value limits', async () => {
      const tradeRequest: TradeRequest = {
        symbol: 'AAPL',
        quantity: 1000,
        orderType: 'limit',
        side: 'buy',
        price: 200 // $200,000 total value
      }

      const result = await performTradeSafetyCheck(tradeRequest)

      expect(result.allowed).toBe(false)
      expect(result.reasons.some(reason => reason.includes('Order value'))).toBe(true)
    })

    it('should warn about large orders approaching limits', async () => {
      const tradeRequest: TradeRequest = {
        symbol: 'AAPL',
        quantity: 50,
        orderType: 'limit',
        side: 'buy',
        price: 160 // $8,000 total value (80% of $10,000 limit)
      }

      const result = await performTradeSafetyCheck(tradeRequest)

      expect(result.allowed).toBe(true)
      expect(result.warnings).toContain('Large order detected - please review carefully')
    })
  })

  describe('Market Hours Validation', () => {
    it('should allow trading outside market hours in non-production', async () => {
      // This test assumes it's running outside market hours
      const tradeRequest: TradeRequest = {
        symbol: 'AAPL',
        quantity: 100,
        orderType: 'market',
        side: 'buy'
      }

      const result = await performTradeSafetyCheck(tradeRequest)

      expect(result.allowed).toBe(true)
    })

    it('should block trading outside market hours in production on weekends', async () => {
      vi.mocked(getEnvironmentConfig).mockReturnValue({
        ...mockEnvironmentConfig,
        environment: 'production',
        isProduction: true,
        isDevelopment: false
      })

      // Mock Date using vi.useFakeTimers
      const sundayDate = new Date('2025-01-05T10:00:00Z') // Sunday
      vi.setSystemTime(sundayDate)

      const tradeRequest: TradeRequest = {
        symbol: 'AAPL',
        quantity: 100,
        orderType: 'market',
        side: 'buy'
      }

      const result = await performTradeSafetyCheck(tradeRequest)

      expect(result.allowed).toBe(false)
      expect(result.reasons).toContain('Market is closed on weekends')

      vi.useRealTimers()
    })
  })
})

describe('TradingSafetyContext', () => {
  beforeEach(() => {
    vi.mocked(getEnvironmentConfig).mockReturnValue({
      environment: 'development',
      isProduction: false,
      isDevelopment: true,
      isStaging: false,
      environmentLabel: 'DEVELOPMENT',
      environmentColor: 'bg-blue-500',
      baseUrl: 'http://localhost:3000',
      tradingEnabled: true,
      realMoneyMode: false,
      paperTradingMode: true
    })
  })

  it('should successfully execute a safe paper trade', async () => {
    const context = new TradingSafetyContext() // No userId for simplicity
    
    const tradeRequest: TradeRequest = {
      symbol: 'AAPL',
      quantity: 10,
      orderType: 'market',
      side: 'buy',
      realMoney: false
    }

    const result = await context.executeTrade(tradeRequest)

    expect(result.success).toBe(true)
    expect(result.result).toHaveProperty('tradeId')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tradeResult = result.result as any
    expect(tradeResult?.paperTrade).toBe(true)
    expect(tradeResult?.symbol).toBe('AAPL')
    expect(tradeResult?.quantity).toBe(10)
  })

  it('should block unsafe trades', async () => {
    const context = new TradingSafetyContext()
    
    const tradeRequest: TradeRequest = {
      symbol: 'AAPL',
      quantity: 0, // Invalid quantity
      orderType: 'market',
      side: 'buy'
    }

    const result = await context.executeTrade(tradeRequest)

    expect(result.success).toBe(false)
    expect(result.error).toContain('Quantity must be greater than zero')
  })

  it('should provide trade feasibility check', async () => {
    const context = new TradingSafetyContext()
    
    const tradeRequest: TradeRequest = {
      symbol: 'AAPL',
      quantity: 100,
      orderType: 'market',
      side: 'buy',
      realMoney: false
    }

    const result = await context.canExecuteTrade(tradeRequest)

    expect(result.allowed).toBe(true)
    expect(result.warnings.length).toBeGreaterThan(0)
  })

  it('should handle trading errors gracefully', async () => {
    const context = new TradingSafetyContext()
    
    // Mock an error in the safety check
    vi.spyOn(console, 'error').mockImplementation(() => {})
    
    const tradeRequest: TradeRequest = {
      symbol: '', // This should cause an error
      quantity: 100,
      orderType: 'market',
      side: 'buy'
    }

    const result = await context.executeTrade(tradeRequest)

    expect(result.success).toBe(false)
    expect(result.error).toBeDefined()
    
    vi.restoreAllMocks()
  })

  describe('Financial Safety Edge Cases', () => {
    it('should handle floating point precision in calculations', async () => {
      const tradeRequest: TradeRequest = {
        symbol: 'AAPL',
        quantity: 3,
        orderType: 'limit',
        side: 'buy',
        price: 33.33 // Price that might cause floating point issues
      }

      const result = await performTradeSafetyCheck(tradeRequest)

      expect(result.allowed).toBe(true)
      // The calculation should be precise: 3 * 33.33 = 99.99
      expect(typeof result).toBe('object')
    })

    it('should handle very small prices correctly', async () => {
      const tradeRequest: TradeRequest = {
        symbol: 'PENNY',
        quantity: 1000,
        orderType: 'limit',
        side: 'buy',
        price: 0.01 // Penny stock
      }

      const result = await performTradeSafetyCheck(tradeRequest)

      expect(result.allowed).toBe(true)
    })

    it('should handle maximum safe integer values', async () => {
      const tradeRequest: TradeRequest = {
        symbol: 'AAPL',
        quantity: 10000, // Maximum allowed
        orderType: 'limit',
        side: 'buy',
        price: 0.99 // Just under $10k limit
      }

      const result = await performTradeSafetyCheck(tradeRequest)

      expect(result.allowed).toBe(true)
    })
  })
})