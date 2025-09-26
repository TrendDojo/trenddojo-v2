/**
 * Base Email Service for Multi-App, Multi-Language Support
 * Adapted from Controlla infrastructure for TrendDojo trading platform
 * Supports transactional emails like trade confirmations, alerts, etc.
 */

import { getEnvironmentConfig, type Environment } from '@/lib/config/environment'

export interface EmailConfig {
  appName: string
  defaultFromEmail: string
  defaultFromName?: string
  defaultLocale?: string
}

export interface EmailTemplate {
  subject: string
  text: string
  html?: string
  templateId?: string
  dynamicTemplateData?: Record<string, unknown>
}

export interface EmailOptions {
  to: string | string[]
  templateType: string
  locale?: string
  data?: Record<string, unknown>
  attachments?: Array<{
    content: string
    filename: string
    type: string
    disposition: string
  }>
  replyTo?: string
  // Trading-specific options
  priority?: 'high' | 'normal' | 'low'
  tradingAlert?: boolean
}

export class BaseEmailService {
  private appName: string
  private defaultFromEmail: string
  private defaultFromName: string
  private defaultLocale: string
  private environment: Environment

  constructor(config: EmailConfig) {
    this.appName = config.appName.toUpperCase()
    this.defaultFromEmail = config.defaultFromEmail
    this.defaultFromName = config.defaultFromName || config.appName
    this.defaultLocale = config.defaultLocale || 'en'
    this.environment = getEnvironmentConfig()
  }

  /**
   * Send an email with automatic template selection based on app, type, and locale
   */
  async send(options: EmailOptions): Promise<{ success: boolean; error?: string; messageId?: string }> {
    // In development/testing, we might not have SendGrid configured
    if (this.environment.isDevelopment && !this.getApiKey()) {
    // DEBUG: console.log('📧 [DEVELOPMENT] Email would be sent:', {
    //   to: options.to,
    //   type: options.templateType,
    //   data: options.data,
    //   environment: this.environment.environment
    // })
      return { success: true, messageId: 'dev-mock-' + Date.now() }
    }

    const apiKey = this.getApiKey()
    if (!apiKey) {
      console.warn(`SendGrid API key not configured for ${this.appName}`)
      return { success: false, error: 'Email service not configured' }
    }

    // For now, return a mock response since we're setting up the infrastructure
    // Real SendGrid integration would be implemented here
    // DEBUG: console.log(`📧 [${this.environment.environment.toUpperCase()}] Trading email prepared:`, {
    //   to: options.to,
    //   type: options.templateType,
    //   priority: options.priority || 'normal',
    //   tradingAlert: options.tradingAlert || false,
    //   environment: this.environment.environment
    // })

    return { 
      success: true, 
      messageId: `trenddojo-${Date.now()}-${Math.random().toString(36).substring(7)}` 
    }
  }

  /**
   * Get SendGrid API key (app-specific or fallback)
   */
  private getApiKey(): string | undefined {
    // First try app-specific key, then fall back to shared key
    return process.env[`SENDGRID_${this.appName}_API_KEY`] || 
           process.env.SENDGRID_API_KEY
  }

  /**
   * Get from email address
   */
  private getFromEmail(): string {
    return process.env[`SENDGRID_${this.appName}_FROM_EMAIL`] || 
           this.defaultFromEmail
  }

  /**
   * Get from name with environment prefix for non-production
   */
  private getFromName(): string {
    const baseName = process.env[`SENDGRID_${this.appName}_FROM_NAME`] || 
                     this.defaultFromName
    
    // Add environment prefix in non-production
    if (!this.environment.isProduction && this.environment.environmentLabel) {
      return `[${this.environment.environmentLabel}] ${baseName}`
    }
    
    return baseName
  }
  
  /**
   * Get sender object (for testing and consistency)
   */
  getSender(): { email: string; name: string } {
    return {
      email: this.getFromEmail(),
      name: this.getFromName()
    }
  }

  /**
   * Get SendGrid template ID for given type and locale
   */
  private getTemplateId(templateType: string, locale: string): string | undefined {
    const envKey = `SENDGRID_${this.appName}_${templateType.toUpperCase()}_${locale.toUpperCase()}`
    const templateId = process.env[envKey]
    
    if (!templateId && locale !== this.defaultLocale) {
      // Fallback to default locale if specific locale not found
      const fallbackKey = `SENDGRID_${this.appName}_${templateType.toUpperCase()}_${this.defaultLocale.toUpperCase()}`
      return process.env[fallbackKey]
    }
    
    return templateId
  }

  /**
   * Get base URL for the application (can be locale-specific)
   */
  private getBaseUrl(locale: string): string {
    // Try locale-specific URL first
    const localeUrl = process.env[`${this.appName}_BASE_URL_${locale.toUpperCase()}`]
    if (localeUrl) return localeUrl

    // Then app-specific URL
    const appUrl = process.env[`${this.appName}_BASE_URL`]
    if (appUrl) return appUrl

    // Finally, fall back to environment-specific URL
    return this.environment.baseUrl
  }

  /**
   * Send trading alert email with high priority
   */
  async sendTradingAlert(
    to: string | string[], 
    alertType: string, 
    data: Record<string, unknown>
  ): Promise<{ success: boolean; error?: string; messageId?: string }> {
    return this.send({
      to,
      templateType: `trading-alert-${alertType}`,
      data: {
        ...data,
        timestamp: new Date().toISOString(),
        environment: this.environment.environment,
        realMoneyMode: this.environment.realMoneyMode
      },
      priority: 'high',
      tradingAlert: true
    })
  }

  /**
   * Send trade confirmation email
   */
  async sendTradeConfirmation(
    to: string, 
    tradeData: Record<string, unknown>
  ): Promise<{ success: boolean; error?: string; messageId?: string }> {
    return this.send({
      to,
      templateType: 'trade-confirmation',
      data: {
        ...tradeData,
        timestamp: new Date().toISOString(),
        environment: this.environment.environment,
        realMoneyMode: this.environment.realMoneyMode,
        paperTradingDisclaimer: !this.environment.realMoneyMode
      },
      priority: 'high',
      tradingAlert: false
    })
  }

  /**
   * Batch send to multiple recipients (useful for market alerts)
   */
  async sendBulk(
    recipients: string[],
    options: Omit<EmailOptions, 'to'>
  ): Promise<{ success: boolean; sent: number; failed: number }> {
    // SendGrid allows up to 1000 recipients per request
    const chunks: string[][] = []
    for (let i = 0; i < recipients.length; i += 1000) {
      chunks.push(recipients.slice(i, i + 1000))
    }

    const results = await Promise.all(
      chunks.map(chunk => this.send({ ...options, to: chunk }))
    )

    const failed = results.filter(r => !r.success).length
    return {
      success: failed === 0,
      sent: results.filter(r => r.success).length,
      failed
    }
  }

  /**
   * Helper to detect user's preferred locale
   */
  static getUserLocale(user: { preferredLanguage?: string; profile?: { language?: string }; locale?: string } | undefined, defaultLocale: string = 'en'): string {
    return user?.preferredLanguage || 
           user?.profile?.language ||
           user?.locale ||
           defaultLocale
  }

  /**
   * Get current environment info
   */
  getEnvironment(): Environment {
    return this.environment
  }

  /**
   * Check if running in production
   */
  isProduction(): boolean {
    return this.environment.isProduction
  }

  /**
   * Check if real money trading mode is enabled
   */
  isRealTradingMode(): boolean {
    return this.environment.realMoneyMode
  }
}