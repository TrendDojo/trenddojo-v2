import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth'
import { z } from 'zod'

const prisma = new PrismaClient()

// Strategy creation schema
const CreateStrategySchema = z.object({
  portfolioId: z.string(),
  name: z.string().min(1),
  description: z.string().optional(),
  type: z.enum(['momentum', 'mean_reversion', 'breakout', 'swing', 'scalp']).optional(),
  allocatedCapital: z.number().positive().optional(),
  maxPositions: z.number().int().positive().default(5),
  maxRiskPercent: z.number().min(0).max(100).default(2),
  maxDrawdown: z.number().min(0).max(100).default(10),
  entryRules: z.record(z.any()).optional(),
  exitRules: z.record(z.any()).optional(),
})

// GET /api/strategies - List strategies for a portfolio
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const portfolioId = searchParams.get('portfolioId')
    
    if (!portfolioId) {
      return NextResponse.json(
        { error: 'Portfolio ID required' },
        { status: 400 }
      )
    }

    const strategies = await prisma.strategy.findMany({
      where: { portfolioId },
      include: {
        positions: {
          where: { status: 'open' },
          select: {
            id: true,
            symbol: true,
            currentQuantity: true,
            unrealizedPnl: true,
          },
        },
        _count: {
          select: {
            positions: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(strategies)
  } catch (error) {
    console.error('Error fetching strategies:', error)
    return NextResponse.json(
      { error: 'Failed to fetch strategies' },
      { status: 500 }
    )
  }
}

// POST /api/strategies - Create new strategy
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validated = CreateStrategySchema.parse(body)

    // Verify portfolio ownership (in production, check session)
    const portfolio = await prisma.portfolio.findUnique({
      where: { id: validated.portfolioId },
    })

    if (!portfolio) {
      return NextResponse.json(
        { error: 'Portfolio not found' },
        { status: 404 }
      )
    }

    const strategy = await prisma.strategy.create({
      data: validated,
    })

    return NextResponse.json(strategy, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }
    
    console.error('Error creating strategy:', error)
    return NextResponse.json(
      { error: 'Failed to create strategy' },
      { status: 500 }
    )
  }
}

// PATCH /api/strategies - Update strategy
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Strategy ID required' },
        { status: 400 }
      )
    }

    const strategy = await prisma.strategy.update({
      where: { id },
      data: updates,
    })

    return NextResponse.json(strategy)
  } catch (error) {
    console.error('Error updating strategy:', error)
    return NextResponse.json(
      { error: 'Failed to update strategy' },
      { status: 500 }
    )
  }
}

// DELETE /api/strategies - Close/delete strategy
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Strategy ID required' },
        { status: 400 }
      )
    }

    // Check for open positions
    const openPositions = await prisma.position.count({
      where: {
        strategyId: id,
        status: 'open',
      },
    })

    if (openPositions > 0) {
      return NextResponse.json(
        { error: `Cannot delete strategy with ${openPositions} open positions` },
        { status: 400 }
      )
    }

    // Soft delete by updating status
    const strategy = await prisma.strategy.update({
      where: { id },
      data: {
        status: 'closed',
        closedAt: new Date(),
      },
    })

    return NextResponse.json(strategy)
  } catch (error) {
    console.error('Error deleting strategy:', error)
    return NextResponse.json(
      { error: 'Failed to delete strategy' },
      { status: 500 }
    )
  }
}