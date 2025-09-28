/**
 * Middleware for security and environment protection
 * @business-critical: Security enforcement
 */

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Security headers to add to all responses
const securityHeaders = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
}

export function middleware(request: NextRequest) {
  const response = NextResponse.next()
  const url = request.nextUrl
  const isProduction = process.env.VERCEL_ENV === 'production'
  const isPreview = process.env.VERCEL_ENV === 'preview'

  // Add security headers to all responses
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value)
  })

  // Add CSP header (Content Security Policy)
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline' *.vercel.app",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https: blob:",
    "font-src 'self' data:",
    "connect-src 'self' *.vercel.app wss: https:",
    "frame-ancestors 'none'",
  ].join('; ')

  response.headers.set('Content-Security-Policy', csp)

  // Preview/Staging Protection
  if (isPreview && !isProduction) {
    // Add meta tag to prevent indexing
    response.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive, nosnippet, noimageindex')

    // Basic auth protection (optional - uncomment to enable)
    // const basicAuth = request.headers.get('authorization')
    // const validAuth = 'Basic ' + Buffer.from('preview:trenddojo2024').toString('base64')

    // if (basicAuth !== validAuth) {
    //   return new Response('Authentication required', {
    //     status: 401,
    //     headers: {
    //       'WWW-Authenticate': 'Basic realm="Preview Environment"',
    //     },
    //   })
    // }
  }

  // Production-only security
  if (isProduction) {
    // Strict Transport Security (HTTPS only)
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    )
  }

  // API rate limiting headers (informational)
  if (url.pathname.startsWith('/api/')) {
    response.headers.set('X-RateLimit-Limit', '100')
    response.headers.set('X-RateLimit-Remaining', '99')
    response.headers.set('X-RateLimit-Reset', new Date(Date.now() + 60000).toISOString())
  }

  // CORS for API endpoints (if needed)
  if (url.pathname.startsWith('/api/market-data/')) {
    const origin = request.headers.get('origin')

    // Only allow specific origins
    const allowedOrigins = [
      'https://trenddojo.com',
      'https://preview.trenddojo.com',
      isProduction ? null : 'http://localhost:3011',
    ].filter(Boolean)

    if (origin && allowedOrigins.includes(origin)) {
      response.headers.set('Access-Control-Allow-Origin', origin)
      response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS')
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
      response.headers.set('Access-Control-Max-Age', '86400')
    }
  }

  return response
}

// Configure which paths the middleware runs on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*|public).*)',
  ],
}