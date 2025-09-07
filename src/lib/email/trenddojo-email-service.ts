/**
 * TrendDojo Email Service
 * Trading-specific email service extending the base multi-app service
 */

import { BaseEmailService, type EmailTemplate } from './base-email-service'

export class TrendDojoEmailService extends BaseEmailService {
  constructor() {
    super({
      appName: 'TRENDDOJO',
      defaultFromEmail: 'noreply@trenddojo.com',
      defaultFromName: 'TrendDojo',
      defaultLocale: 'en'
    })
  }

  /**
   * Get HTML templates for TrendDojo-specific emails
   */
  protected async getHtmlTemplate(
    templateType: string, 
    locale: string, 
    data?: Record<string, any>
  ): Promise<EmailTemplate | null> {
    
    const baseData = {
      appName: 'TrendDojo',
      baseUrl: this.getEnvironment().baseUrl,
      supportEmail: 'support@trenddojo.com',
      year: new Date().getFullYear(),
      ...data
    }

    switch (templateType) {
      case 'welcome':
        return {
          subject: 'Welcome to TrendDojo - Your Trading Journey Begins!',
          text: `Welcome to TrendDojo, ${baseData.firstName || 'Trader'}!\n\nYour account has been created successfully. Start exploring our trading tools and educational resources.\n\nBest regards,\nThe TrendDojo Team`,
          html: this.getWelcomeEmailHtml(baseData)
        }

      case 'trade-confirmation':
        return {
          subject: `${baseData.realMoneyMode ? 'Trade Confirmation' : 'Paper Trade Confirmation'} - ${baseData.symbol}`,
          text: this.getTradeConfirmationText(baseData),
          html: this.getTradeConfirmationHtml(baseData)
        }

      case 'trading-alert-price':
        return {
          subject: `Price Alert: ${baseData.symbol} - ${baseData.alertType}`,
          text: `Price Alert: ${baseData.symbol} has ${baseData.alertType} your target price of ${baseData.targetPrice}.`,
          html: this.getPriceAlertHtml(baseData)
        }

      case 'trading-alert-portfolio':
        return {
          subject: 'Portfolio Alert - Action Required',
          text: `Portfolio Alert: ${baseData.message}`,
          html: this.getPortfolioAlertHtml(baseData)
        }

      case 'password-reset':
        return {
          subject: 'Reset Your TrendDojo Password',
          text: `Reset your password by clicking this link: ${baseData.resetUrl}`,
          html: this.getPasswordResetHtml(baseData)
        }

      case 'email-verification':
        return {
          subject: 'Verify Your TrendDojo Email Address',
          text: `Please verify your email by clicking: ${baseData.verificationUrl}`,
          html: this.getEmailVerificationHtml(baseData)
        }

      default:
        console.warn(`No HTML template found for ${templateType} in ${locale}`)
        return null
    }
  }

  private getWelcomeEmailHtml(data: any): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Welcome to TrendDojo</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: white; padding: 30px 20px; border-radius: 0 0 8px 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
            .button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📈 Welcome to TrendDojo!</h1>
            </div>
            <div class="content">
              <p>Hello ${data.firstName || 'Trader'},</p>
              
              <p>Welcome to TrendDojo, where your trading journey begins! We're excited to have you as part of our community of traders.</p>
              
              <p><strong>What's next?</strong></p>
              <ul>
                <li>📊 Explore our trading dashboard</li>
                <li>📚 Check out our educational resources</li>
                <li>🎯 Set up your first price alerts</li>
                <li>💼 Practice with paper trading</li>
              </ul>
              
              <p style="text-align: center; margin: 30px 0;">
                <a href="${data.baseUrl}/dashboard" class="button">Get Started</a>
              </p>
              
              <p>If you have any questions, our support team is here to help at ${data.supportEmail}.</p>
              
              <p>Happy trading!<br>The TrendDojo Team</p>
            </div>
            <div class="footer">
              <p>&copy; ${data.year} TrendDojo. All rights reserved.</p>
              ${!this.getEnvironment().isProduction ? `<p style="color: #f59e0b;">⚠️ This is a ${this.getEnvironment().environment} environment email</p>` : ''}
            </div>
          </div>
        </body>
      </html>
    `
  }

  private getTradeConfirmationText(data: any): string {
    return `
Trade Confirmation - ${data.symbol}

${data.realMoneyMode ? 'REAL MONEY TRADE' : 'PAPER TRADE'}

Order Type: ${data.orderType}
Symbol: ${data.symbol}
Quantity: ${data.quantity}
Price: $${data.price}
Total Value: $${data.totalValue}
Timestamp: ${data.timestamp}

${data.paperTradingDisclaimer ? 'Note: This was a paper trade. No real money was involved.' : ''}

View full details at: ${data.baseUrl}/trades/${data.tradeId}
    `.trim()
  }

  private getTradeConfirmationHtml(data: any): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Trade Confirmation</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: ${data.realMoneyMode ? '#dc2626' : '#16a34a'}; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: white; padding: 30px 20px; border-radius: 0 0 8px 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
            .trade-details { background: #f8fafc; padding: 20px; border-radius: 6px; margin: 20px 0; }
            .detail-row { display: flex; justify-content: space-between; margin: 10px 0; }
            .label { font-weight: bold; color: #374151; }
            .value { color: #1f2937; }
            .button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; }
            .disclaimer { background: #fef3c7; color: #92400e; padding: 15px; border-radius: 6px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>${data.realMoneyMode ? '💰' : '📊'} Trade Confirmation</h1>
              <p style="margin: 0; font-size: 14px; opacity: 0.9;">
                ${data.realMoneyMode ? 'Real Money Trade' : 'Paper Trade'}
              </p>
            </div>
            <div class="content">
              <div class="trade-details">
                <div class="detail-row">
                  <span class="label">Symbol:</span>
                  <span class="value">${data.symbol}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Order Type:</span>
                  <span class="value">${data.orderType}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Quantity:</span>
                  <span class="value">${data.quantity}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Price:</span>
                  <span class="value">$${data.price}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Total Value:</span>
                  <span class="value">$${data.totalValue}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Timestamp:</span>
                  <span class="value">${data.timestamp}</span>
                </div>
              </div>
              
              ${data.paperTradingDisclaimer ? '<div class="disclaimer"><strong>Paper Trading:</strong> This was a simulated trade. No real money was involved.</div>' : ''}
              
              <p style="text-align: center; margin: 30px 0;">
                <a href="${data.baseUrl}/trades/${data.tradeId}" class="button">View Trade Details</a>
              </p>
            </div>
            <div class="footer">
              <p>&copy; ${data.year} TrendDojo. All rights reserved.</p>
              ${!this.getEnvironment().isProduction ? `<p style="color: #f59e0b;">⚠️ ${this.getEnvironment().environment.toUpperCase()} environment</p>` : ''}
            </div>
          </div>
        </body>
      </html>
    `
  }

  private getPriceAlertHtml(data: any): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Price Alert</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #f59e0b; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: white; padding: 30px 20px; border-radius: 0 0 8px 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
            .alert-box { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; margin: 20px 0; }
            .button { display: inline-block; background: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🚨 Price Alert</h1>
            </div>
            <div class="content">
              <div class="alert-box">
                <h3 style="margin-top: 0;">Alert Triggered: ${data.symbol}</h3>
                <p><strong>${data.symbol}</strong> has ${data.alertType} your target price of <strong>$${data.targetPrice}</strong>.</p>
                <p>Current Price: <strong>$${data.currentPrice}</strong></p>
                <p>Time: ${data.timestamp}</p>
              </div>
              
              <p style="text-align: center; margin: 30px 0;">
                <a href="${data.baseUrl}/trading/${data.symbol}" class="button">View ${data.symbol}</a>
              </p>
            </div>
          </div>
        </body>
      </html>
    `
  }

  private getPortfolioAlertHtml(data: any): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Portfolio Alert</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #dc2626; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: white; padding: 30px 20px; border-radius: 0 0 8px 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
            .alert-box { background: #fef2f2; border-left: 4px solid #dc2626; padding: 20px; margin: 20px 0; }
            .button { display: inline-block; background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>⚠️ Portfolio Alert</h1>
            </div>
            <div class="content">
              <div class="alert-box">
                <h3 style="margin-top: 0;">Action Required</h3>
                <p>${data.message}</p>
                <p>Time: ${data.timestamp}</p>
              </div>
              
              <p style="text-align: center; margin: 30px 0;">
                <a href="${data.baseUrl}/portfolio" class="button">View Portfolio</a>
              </p>
            </div>
          </div>
        </body>
      </html>
    `
  }

  private getPasswordResetHtml(data: any): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Reset Your Password</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #667eea; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: white; padding: 30px 20px; border-radius: 0 0 8px 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
            .button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; }
            .warning { background: #fef3c7; color: #92400e; padding: 15px; border-radius: 6px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 Reset Your Password</h1>
            </div>
            <div class="content">
              <p>You requested to reset your TrendDojo password.</p>
              
              <p style="text-align: center; margin: 30px 0;">
                <a href="${data.resetUrl}" class="button">Reset Password</a>
              </p>
              
              <div class="warning">
                <strong>Security Note:</strong> This link will expire in 1 hour. If you didn't request this reset, please ignore this email.
              </div>
            </div>
          </div>
        </body>
      </html>
    `
  }

  private getEmailVerificationHtml(data: any): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Verify Your Email</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #16a34a; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: white; padding: 30px 20px; border-radius: 0 0 8px 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
            .button { display: inline-block; background: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✉️ Verify Your Email</h1>
            </div>
            <div class="content">
              <p>Please verify your email address to complete your TrendDojo account setup.</p>
              
              <p style="text-align: center; margin: 30px 0;">
                <a href="${data.verificationUrl}" class="button">Verify Email</a>
              </p>
              
              <p>This verification link will expire in 24 hours.</p>
            </div>
          </div>
        </body>
      </html>
    `
  }
}

// Export a singleton instance
export const trendDojoEmailService = new TrendDojoEmailService()