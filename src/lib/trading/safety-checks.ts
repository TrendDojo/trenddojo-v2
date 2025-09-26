/**
 * Trading Safety Checks for TrendDojo
 * Critical safety measures for trading operations
 * Prevents accidental real money trades in non-production environments
 */

import { getEnvironmentConfig, getTradingFeatureFlags, isRealTradingAllowed } from '@/lib/config/environment'
import { getServerSession } from 'next-auth'
import { authConfig } from '@/lib/auth'

export interface TradeRequest {
  symbol: string
  quantity: number
  price?: number
  orderType: 'market' | 'limit' | 'stop' | 'stop-limit'
  side: 'buy' | 'sell'
  timeInForce?: 'day' | 'gtc' | 'ioc' | 'fok'
  realMoney?: boolean
}

export interface SafetyCheckResult {
  allowed: boolean
  reasons: string[]
  warnings: string[]
  requiresConfirmation: boolean
  confirmationMessage?: string
}

export interface TradingLimits {
  maxOrderValue: number
  maxDailyVolume: number
  maxPositionSize: number
  allowedSymbols: string[]
  restrictedSymbols: string[]
}

/**
 * Comprehensive safety check before executing any trade
 */
export async function performTradeSafetyCheck(
  request: TradeRequest,
  userId?: string
): Promise<SafetyCheckResult> {
  const environment = getEnvironmentConfig()
  const featureFlags = getTradingFeatureFlags()
  
  const result: SafetyCheckResult = {
    allowed: false,
    reasons: [],
    warnings: [],
    requiresConfirmation: false
  }

  // 1. Environment Safety Checks
  if (request.realMoney && !environment.isProduction) {
    result.reasons.push(`Real money trading not allowed in ${environment.environment} environment`)
    return result
  }

  if (request.realMoney && !environment.realMoneyMode) {
    result.reasons.push('Real money mode is disabled')
    return result
  }

  if (request.realMoney && !isRealTradingAllowed()) {
    result.reasons.push('Real trading not permitted in current configuration')
    return result
  }

  // 2. User Authentication & Authorization
  if (userId) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const session = await getServerSession(authConfig as any) as any
    if (!session?.user || session.user.id !== userId) {
      result.reasons.push('User not authenticated or session mismatch')
      return result
    }

    if (request.realMoney && !session.user.realTradingEnabled) {
      result.reasons.push('User not authorized for real money trading')
      return result
    }

    if (!session.user.tradingEnabled) {
      result.reasons.push('Trading disabled for user account')
      return result
    }
  }

  // 3. Trading Parameter Validation
  const parameterValidation = validateTradingParameters(request)
  if (!parameterValidation.valid) {
    result.reasons.push(...parameterValidation.errors)
    return result
  }

  // 4. Position Size & Risk Limits
  const riskCheck = await checkRiskLimits(request, userId)
  if (!riskCheck.withinLimits) {
    result.reasons.push(...riskCheck.violations)
    return result
  }
  
  // Add warnings even if risk check passes
  if (riskCheck.warnings.length > 0) {
    result.warnings.push(...riskCheck.warnings)
  }

  // 5. Market Hours & Symbol Availability
  const marketCheck = checkMarketAvailability(request.symbol)
  if (!marketCheck.available) {
    result.reasons.push(marketCheck.reason || 'Market unavailable')
    return result
  }

  // 6. Real Money Confirmation Requirements
  if (request.realMoney && featureFlags.requireTradingConfirmation) {
    result.requiresConfirmation = true
    result.confirmationMessage = `You are about to execute a REAL MONEY trade for ${request.quantity} shares of ${request.symbol}. This will use actual funds from your account. Are you sure you want to proceed?`
  }

  // Add warnings for non-production environments
  if (!environment.isProduction) {
    result.warnings.push(`Trading in ${environment.environment} environment`)
  }

  if (!request.realMoney) {
    result.warnings.push('This is a paper trade - no real money will be used')
  }

  // All checks passed
  result.allowed = true
  return result
}

/**
 * Validate basic trading parameters
 */
function validateTradingParameters(request: TradeRequest): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  // Symbol validation
  if (!request.symbol || request.symbol.length === 0) {
    errors.push('Symbol is required')
  } else if (!/^[A-Z]{1,10}$/.test(request.symbol)) {
    errors.push('Invalid symbol format')
  }

  // Quantity validation
  if (!request.quantity || request.quantity <= 0) {
    errors.push('Quantity must be greater than zero')
  } else if (!Number.isInteger(request.quantity)) {
    errors.push('Quantity must be a whole number')
  } else if (request.quantity > 10000) {
    errors.push('Quantity exceeds maximum limit of 10,000 shares')
  }

  // Price validation for limit orders
  if ((request.orderType === 'limit' || request.orderType === 'stop-limit') && !request.price) {
    errors.push('Price is required for limit orders')
  } else if (request.price && (request.price <= 0 || request.price > 100000)) {
    errors.push('Price must be between $0.01 and $100,000')
  }

  return { valid: errors.length === 0, errors }
}

/**
 * Check risk limits and position sizing
 */
async function checkRiskLimits(
  request: TradeRequest, 
  userId?: string
): Promise<{ withinLimits: boolean; violations: string[]; warnings: string[] }> {
  const violations: string[] = []
  const warnings: string[] = []

  // Get user's trading limits (this would come from database in real implementation)
  const limits = await getTradingLimits(userId)
  
  // Calculate estimated order value
  const estimatedPrice = request.price || 100 // Use a default if market order
  const orderValue = request.quantity * estimatedPrice

  // Check maximum order value
  if (orderValue > limits.maxOrderValue) {
    violations.push(`Order value ($${orderValue.toFixed(2)}) exceeds limit ($${limits.maxOrderValue.toFixed(2)})`)
  }

  // Check if symbol is restricted
  if (limits.restrictedSymbols.includes(request.symbol)) {
    violations.push(`Symbol ${request.symbol} is on the restricted list`)
  }

  // Warning for large orders
  if (orderValue >= limits.maxOrderValue * 0.8) {
    warnings.push('Large order detected - please review carefully')
  }

  // Warning for volatile stocks (simplified check)
  if (['TSLA', 'GME', 'AMC', 'MEME'].includes(request.symbol)) {
    warnings.push('High volatility stock - exercise extra caution')
  }

  return {
    withinLimits: violations.length === 0,
    violations,
    warnings
  }
}

/**
 * Check if market is open and symbol is tradeable
 */
function checkMarketAvailability(_symbol: string): { available: boolean; reason?: string } {
  // Simplified market hours check (in production, this would be more sophisticated)
  const now = new Date()
  const day = now.getDay()
  const hour = now.getHours()

  // Basic check: weekdays 9:30 AM - 4:00 PM EST
  const isWeekday = day >= 1 && day <= 5
  const isMarketHours = hour >= 9 && hour < 16

  // Allow trading outside market hours in non-production (for testing)
  const environment = getEnvironmentConfig()
  if (!environment.isProduction) {
    return { available: true }
  }

  if (!isWeekday) {
    return { available: false, reason: 'Market is closed on weekends' }
  }

  if (!isMarketHours) {
    return { available: false, reason: 'Market is closed outside trading hours (9:30 AM - 4:00 PM EST)' }
  }

  return { available: true }
}

/**
 * Get trading limits for a user (mock implementation)
 */
async function getTradingLimits(_userId?: string): Promise<TradingLimits> {
  // In production, this would fetch from database based on user's subscription tier
  // For now, return default limits
  return {
    maxOrderValue: 10000, // $10,000 per order
    maxDailyVolume: 50000, // $50,000 per day
    maxPositionSize: 25000, // $25,000 per position
    allowedSymbols: [], // Empty = all symbols allowed
    restrictedSymbols: ['OTCBB', 'PINK'] // Restricted symbols
  }
}

/**
 * Create a safe trading context with all necessary checks
 */
export class TradingSafetyContext {
  private environment = getEnvironmentConfig()
  private featureFlags = getTradingFeatureFlags()

  constructor(private userId?: string) {}

  /**
   * Execute a trade with full safety checks
   */
  async executeTrade(request: TradeRequest): Promise<{ success: boolean; result?: unknown; error?: string }> {
    try {
      // Perform safety checks
      const safetyCheck = await performTradeSafetyCheck(request, this.userId)
      
      if (!safetyCheck.allowed) {
        return {
          success: false,
          error: `Trade blocked: ${safetyCheck.reasons.join(', ')}`
        }
      }

      // Log the trade attempt
    // DEBUG: console.log(`[TRADING] ${request.realMoney ? 'REAL' : 'PAPER'} trade attempt:`, {
        symbol: request.symbol,
        quantity: request.quantity,
        side: request.side,
        orderType: request.orderType,
        environment: this.environment.environment,
        userId: this.userId
      })

      // In production, this would call the actual trading API
      // For now, return a mock result
      const mockResult = {
        tradeId: `trade_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        symbol: request.symbol,
        quantity: request.quantity,
        side: request.side,
        status: 'filled',
        executedPrice: request.price || 100,
        executedAt: new Date().toISOString(),
        paperTrade: !request.realMoney
      }

      // Send confirmation email
      if (!this.environment.isDevelopment) {
        try {
          const { trendDojoEmailService } = await import('@/lib/email/trenddojo-email-service')
          
          if (this.userId) {
            // In production, get user email from database
            const userEmail = 'user@example.com' // Mock email
            
            await trendDojoEmailService.sendTradeConfirmation(userEmail, {
              ...mockResult,
              totalValue: mockResult.quantity * mockResult.executedPrice
            })
          }
        } catch (error) {
          console.error('[TRADING] Failed to send trade confirmation email:', error)
        }
      }

      return { success: true, result: mockResult }
      
    } catch (error) {
      console.error('[TRADING] Trade execution error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown trading error'
      }
    }
  }

  /**
   * Check if a trade request would be allowed
   */
  async canExecuteTrade(request: TradeRequest): Promise<SafetyCheckResult> {
    return await performTradeSafetyCheck(request, this.userId)
  }
}