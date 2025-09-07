/**
 * Environment Configuration Module for TrendDojo
 * Trading-specific environment detection with safety features
 * Adapted from Controlla infrastructure patterns
 */

export type EnvironmentType = 'development' | 'staging' | 'production' | 'test'

export interface Environment {
  environment: EnvironmentType
  isProduction: boolean
  isDevelopment: boolean
  isStaging: boolean
  environmentLabel: string
  environmentColor: string
  baseUrl: string
  // Trading-specific safety features
  tradingEnabled: boolean
  realMoneyMode: boolean
  paperTradingMode: boolean
}

// Cache the configuration to avoid repeated calculations
let cachedConfig: Environment | null = null

/**
 * Detects the current environment from NODE_ENV and VERCEL_ENV
 * Priority: VERCEL_ENV > NODE_ENV
 */
function detectEnvironment(): EnvironmentType {
  // In Vercel, use VERCEL_ENV which is more accurate
  if (process.env.VERCEL_ENV) {
    switch (process.env.VERCEL_ENV) {
      case 'production':
        return 'production'
      case 'preview':
        return 'staging' // Preview deployments are our staging
      case 'development':
        return 'development'
      default:
        return 'development'
    }
  }

  // Fallback to NODE_ENV
  const nodeEnv = process.env.NODE_ENV?.toLowerCase()
  
  switch (nodeEnv) {
    case 'production':
      return 'production'
    case 'staging':
      return 'staging'
    case 'development':
      return 'development'
    case 'test':
      return 'test'
    default:
      // Default to development for safety in unknown environments
      return 'development'
  }
}

/**
 * Gets the base URL for the current environment
 */
function getBaseUrl(environment: EnvironmentType): string {
  // Use explicit URL if provided
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL
  }

  // Use Vercel URL if available
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }

  // Default URLs by environment
  switch (environment) {
    case 'production':
      return 'https://trenddojo.com'
    case 'staging':
      return 'https://staging.trenddojo.com'
    case 'test':
      return 'http://localhost:3000'
    case 'development':
    default:
      return 'http://localhost:3000'
  }
}

/**
 * Determines trading safety settings based on environment
 */
function getTradingSafetyConfig(environment: EnvironmentType) {
  const realMoneyEnabled = process.env.NEXT_PUBLIC_REAL_MONEY_ENABLED === 'true'
  
  switch (environment) {
    case 'production':
      return {
        tradingEnabled: realMoneyEnabled,
        realMoneyMode: realMoneyEnabled,
        paperTradingMode: true
      }
    case 'staging':
      return {
        tradingEnabled: true,
        realMoneyMode: false,
        paperTradingMode: true
      }
    case 'development':
    case 'test':
    default:
      return {
        tradingEnabled: true,
        realMoneyMode: false,
        paperTradingMode: true
      }
  }
}

/**
 * Gets the current environment configuration
 * Cached for performance
 */
export function getEnvironmentConfig(): Environment {
  // Return cached config if available
  if (cachedConfig) {
    return cachedConfig
  }

  const environment = detectEnvironment()
  const tradingConfig = getTradingSafetyConfig(environment)
  
  cachedConfig = {
    environment,
    isProduction: environment === 'production',
    isDevelopment: environment === 'development',
    isStaging: environment === 'staging',
    environmentLabel: environment === 'production' ? '' : environment.toUpperCase(),
    environmentColor: {
      production: '',
      staging: 'bg-yellow-500 border-yellow-400',
      development: 'bg-blue-500 border-blue-400',
      test: 'bg-purple-500 border-purple-400'
    }[environment] || '',
    baseUrl: getBaseUrl(environment),
    ...tradingConfig
  }

  return cachedConfig
}

/**
 * Clears the cached configuration (useful for testing)
 */
export function clearEnvironmentCache(): void {
  cachedConfig = null
}

/**
 * Helper to check if we're in any non-production environment
 */
export function isNonProduction(): boolean {
  const config = getEnvironmentConfig()
  return !config.isProduction
}

/**
 * Trading-specific environment features
 */
export function getTradingFeatureFlags() {
  const config = getEnvironmentConfig()
  
  return {
    showDebugInfo: !config.isProduction,
    enableMockData: config.isDevelopment,
    showEnvironmentBadge: !config.isProduction,
    verboseLogging: !config.isProduction,
    enableTestEndpoints: config.isDevelopment || config.isStaging,
    // Trading-specific flags
    allowRealTrades: config.realMoneyMode,
    showTradingSafetyWarnings: !config.isProduction,
    enablePaperTrading: config.paperTradingMode,
    requireTradingConfirmation: config.realMoneyMode,
    showRiskWarnings: true // Always show risk warnings for trading
  }
}

/**
 * Get trading environment safety warnings
 */
export function getTradingSafetyWarnings(): string[] {
  const config = getEnvironmentConfig()
  const warnings: string[] = []
  
  if (!config.isProduction) {
    warnings.push(`TRADING IN ${config.environment.toUpperCase()} MODE`)
  }
  
  if (config.realMoneyMode) {
    warnings.push('REAL MONEY TRADING ENABLED')
    warnings.push('TRADES WILL USE ACTUAL FUNDS')
  } else {
    warnings.push('PAPER TRADING MODE')
    warnings.push('NO REAL MONEY AT RISK')
  }
  
  return warnings
}

/**
 * Check if real money trading is allowed
 */
export function isRealTradingAllowed(): boolean {
  const config = getEnvironmentConfig()
  return config.realMoneyMode && config.tradingEnabled
}

/**
 * Get environment-specific API endpoints
 */
export function getApiConfig() {
  const config = getEnvironmentConfig()
  
  return {
    apiBaseUrl: config.baseUrl + '/api',
    websocketUrl: config.baseUrl.replace('http', 'ws') + '/api/ws',
    tradingApiUrl: config.isProduction 
      ? process.env.NEXT_PUBLIC_TRADING_API_URL || `${config.baseUrl}/api/trading`
      : `${config.baseUrl}/api/trading`,
    // Use sandbox endpoints in non-production
    useSandbox: !config.isProduction
  }
}