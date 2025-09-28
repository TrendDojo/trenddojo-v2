/**
 * Dynamic robots.txt based on environment
 * @business-critical: SEO and security control
 */

import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://trenddojo.com'
  const isProduction = process.env.VERCEL_ENV === 'production'
  const isPreview = process.env.VERCEL_ENV === 'preview'
  const isDevelopment = process.env.VERCEL_ENV === 'development'

  // Block all robots in non-production environments
  if (isPreview || isDevelopment || !isProduction) {
    return {
      rules: {
        userAgent: '*',
        disallow: '/', // Block everything
        crawlDelay: 86400, // 24 hours - slow down any crawlers
      },
      sitemap: undefined, // No sitemap for preview/dev
      host: baseUrl,
    }
  }

  // Production environment rules
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/_next/',
          '/positions/',
          '/portfolios/',
          '/settings/',
          '/strategies/*/edit',
          '/*.json',
          '/temp/',
        ],
      },
      // Block bad bots
      {
        userAgent: ['AhrefsBot', 'SemrushBot', 'DotBot', 'MJ12bot'],
        disallow: '/',
      },
      // Be nice to Google
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/api/', '/_next/', '/admin/'],
        crawlDelay: 0,
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  }
}