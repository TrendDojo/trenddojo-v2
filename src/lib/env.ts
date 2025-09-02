/**
 * Environment detection and configuration utilities
 */

export const isProduction = process.env.NODE_ENV === 'production'
export const isDevelopment = process.env.NODE_ENV === 'development'
export const isPreview = process.env.VERCEL_ENV === 'preview'
export const isVercel = !!process.env.VERCEL

/**
 * Check if we're in a preview deployment environment
 */
export const isPreviewDeployment = isVercel && isPreview

/**
 * Check if database is available
 */
export const hasDatabaseUrl = !!process.env.DATABASE_URL

/**
 * Determine if we should use graceful degradation
 * (preview deployments without database setup)
 */
export const useGracefulDegradation = isPreviewDeployment && !hasDatabaseUrl

/**
 * Environment info for debugging
 */
export const envInfo = {
  NODE_ENV: process.env.NODE_ENV,
  VERCEL_ENV: process.env.VERCEL_ENV,
  VERCEL: process.env.VERCEL,
  DATABASE_URL: process.env.DATABASE_URL ? '[SET]' : '[NOT SET]',
  isProduction,
  isDevelopment,
  isPreview,
  isVercel,
  isPreviewDeployment,
  hasDatabaseUrl,
  useGracefulDegradation,
}