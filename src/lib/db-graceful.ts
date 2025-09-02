/**
 * Graceful database wrapper that handles preview deployments
 * without database connections
 */

import { PrismaClient } from '@prisma/client'
import { useGracefulDegradation, envInfo } from './env'

class GracefulDatabase {
  private client: PrismaClient | null = null
  private isConnected = false
  private connectionError: string | null = null

  constructor() {
    if (useGracefulDegradation) {
      console.log('🔄 Preview deployment detected - running in graceful degradation mode')
      console.log('Environment info:', envInfo)
      return
    }

    try {
      this.client = new PrismaClient({
        log: ['error', 'warn'],
      })
      this.isConnected = true
    } catch (error) {
      this.connectionError = error instanceof Error ? error.message : 'Unknown database error'
      console.error('❌ Database connection failed:', this.connectionError)
    }
  }

  /**
   * Get database client or throw graceful error
   */
  get db(): PrismaClient {
    if (useGracefulDegradation) {
      throw new Error('Database not available in preview mode')
    }

    if (!this.client) {
      throw new Error(`Database not initialized: ${this.connectionError}`)
    }

    return this.client
  }

  /**
   * Check if database is available
   */
  get isAvailable(): boolean {
    return this.isConnected && !useGracefulDegradation
  }

  /**
   * Get connection status for debugging
   */
  get status() {
    return {
      isConnected: this.isConnected,
      connectionError: this.connectionError,
      useGracefulDegradation,
      isAvailable: this.isAvailable,
    }
  }

  /**
   * Safely disconnect database
   */
  async disconnect() {
    if (this.client) {
      await this.client.$disconnect()
    }
  }
}

// Create singleton instance
const gracefulDb = new GracefulDatabase()

// Export the database instance (for compatibility)
export const db = gracefulDb.isAvailable ? gracefulDb.db : null

// Export graceful utilities
export { gracefulDb }
export default gracefulDb