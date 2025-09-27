/**
 * Health Check Endpoint
 * @business-critical: Validates system components are operational
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  environment: string;
  checks: {
    database: CheckResult;
    marketSchema: CheckResult;
    auth: CheckResult;
    marketData: CheckResult;
    cronJobs: CheckResult;
  };
  version: string;
  uptime: number;
}

interface CheckResult {
  status: 'pass' | 'fail' | 'warn';
  message?: string;
  responseTime?: number;
}

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  const result: HealthCheckResult = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.VERCEL_ENV || 'development',
    checks: {
      database: { status: 'fail' },
      marketSchema: { status: 'fail' },
      auth: { status: 'fail' },
      marketData: { status: 'fail' },
      cronJobs: { status: 'fail' },
    },
    version: process.env.VERCEL_GIT_COMMIT_SHA || 'unknown',
    uptime: process.uptime(),
  };

  // 1. Database connectivity
  try {
    const dbStart = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    result.checks.database = {
      status: 'pass',
      responseTime: Date.now() - dbStart,
    };
  } catch (error) {
    result.checks.database = {
      status: 'fail',
      message: 'Database connection failed',
    };
    result.status = 'unhealthy';
  }

  // 2. Market schema check
  try {
    const marketStart = Date.now();
    const tables = await prisma.$queryRaw<{count: bigint}[]>`
      SELECT COUNT(*) as count
      FROM information_schema.tables
      WHERE table_schema = 'market'
    `;

    if (tables[0]?.count > 0) {
      result.checks.marketSchema = {
        status: 'pass',
        responseTime: Date.now() - marketStart,
        message: `${tables[0].count} market tables found`,
      };
    } else {
      result.checks.marketSchema = {
        status: 'warn',
        message: 'Market schema not initialized',
      };
      if (result.status === 'healthy') result.status = 'degraded';
    }
  } catch (error) {
    result.checks.marketSchema = {
      status: 'warn',
      message: 'Market schema not accessible',
    };
    if (result.status === 'healthy') result.status = 'degraded';
  }

  // 3. Auth configuration
  try {
    const hasAuthSecret = !!process.env.NEXTAUTH_SECRET;
    const hasAuthUrl = !!process.env.NEXTAUTH_URL;

    if (hasAuthSecret && hasAuthUrl) {
      result.checks.auth = {
        status: 'pass',
        message: 'Auth configured',
      };
    } else {
      result.checks.auth = {
        status: 'warn',
        message: `Missing: ${!hasAuthSecret ? 'NEXTAUTH_SECRET ' : ''}${!hasAuthUrl ? 'NEXTAUTH_URL' : ''}`,
      };
      if (result.status === 'healthy') result.status = 'degraded';
    }
  } catch (error) {
    result.checks.auth = {
      status: 'fail',
      message: 'Auth check failed',
    };
    result.status = 'unhealthy';
  }

  // 4. Market data API configuration
  try {
    const hasPolygonKey = !!process.env.POLYGON_API_KEY;

    if (hasPolygonKey) {
      result.checks.marketData = {
        status: 'pass',
        message: 'Market data API configured',
      };
    } else {
      result.checks.marketData = {
        status: 'warn',
        message: 'No market data API keys configured',
      };
      if (result.status === 'healthy') result.status = 'degraded';
    }
  } catch (error) {
    result.checks.marketData = {
      status: 'fail',
      message: 'Market data check failed',
    };
  }

  // 5. Cron job configuration
  try {
    const hasCronSecret = !!process.env.CRON_SECRET;
    const isProduction = process.env.VERCEL_ENV === 'production';

    if (!isProduction || hasCronSecret) {
      result.checks.cronJobs = {
        status: 'pass',
        message: isProduction ? 'Cron jobs configured' : 'Cron jobs not required (non-production)',
      };
    } else {
      result.checks.cronJobs = {
        status: 'fail',
        message: 'CRON_SECRET not configured for production',
      };
      result.status = 'unhealthy';
    }
  } catch (error) {
    result.checks.cronJobs = {
      status: 'fail',
      message: 'Cron job check failed',
    };
  }

  // Set appropriate HTTP status code
  const httpStatus =
    result.status === 'healthy' ? 200 :
    result.status === 'degraded' ? 200 : // Still return 200 for degraded
    503; // Service unavailable for unhealthy

  // Add response headers for monitoring
  const response = NextResponse.json(result, { status: httpStatus });
  response.headers.set('X-Health-Status', result.status);
  response.headers.set('X-Response-Time', `${Date.now() - startTime}ms`);

  return response;
}