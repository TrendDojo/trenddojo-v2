import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'

const prisma = new PrismaClient()

// Position creation schema
const CreatePositionSchema = z.object({
  strategyId: z.string(),
  symbol: z.string().min(1),
  assetType: z.enum(['stock', 'crypto', 'forex', 'option', 'future', 'etf']).default('stock'),
  direction: z.enum(['long', 'short']).default('long'),
  stopLoss: z.number().optional(),
  takeProfit: z.number().optional(),
})

// GET /api/positions - List positions
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const strategyId = searchParams.get('strategyId')
    const status = searchParams.get('status')
    const portfolioId = searchParams.get('portfolioId')

    const where: Record<string, any> = {}
    
    if (strategyId) {
      where.strategyId = strategyId
    }
    
    if (status) {
      where.status = status
    }
    
    if (portfolioId) {
      where.strategy = {
        portfolioId,
      }
    }

    const positions = await prisma.position.findMany({
      where,
      include: {
        strategy: {
          select: {
            name: true,
            type: true,
          },
        },
        executions: {
          orderBy: { executedAt: 'desc' },
          take: 5,
        },
        _count: {
          select: {
            executions: true,
            notes: true,
          },
        },
      },
      orderBy: { openedAt: 'desc' },
    })

    // Calculate current P&L for open positions
    const positionsWithPnl = positions.map(position => {
      if (position.status === 'open' && Number(position.currentQuantity) > 0) {
        // In production, fetch current price from market data
        // For now, simulate with random change
        const avgEntry = Number(position.avgEntryPrice)
        const currentPrice = avgEntry * (1 + (Math.random() - 0.5) * 0.1)
        const unrealizedPnl = (currentPrice - avgEntry) * Number(position.currentQuantity)
        
        return {
          ...position,
          currentPrice,
          unrealizedPnl: unrealizedPnl.toFixed(2),
        }
      }
      return position
    })

    return NextResponse.json(positionsWithPnl)
  } catch (error) {
    console.error('Error fetching positions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch positions' },
      { status: 500 }
    )
  }
}

// POST /api/positions - Create new position
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validated = CreatePositionSchema.parse(body)

    // Verify strategy exists and is active
    const strategy = await prisma.strategy.findUnique({
      where: { id: validated.strategyId },
      include: {
        _count: {
          select: { positions: { where: { status: 'open' } } },
        },
      },
    })

    if (!strategy) {
      return NextResponse.json(
        { error: 'Strategy not found' },
        { status: 404 }
      )
    }

    if (strategy.status !== 'active') {
      return NextResponse.json(
        { error: 'Strategy is not active' },
        { status: 400 }
      )
    }

    if (strategy._count.positions >= strategy.maxPositions) {
      return NextResponse.json(
        { error: `Strategy has reached max positions (${strategy.maxPositions})` },
        { status: 400 }
      )
    }

    const position = await prisma.position.create({
      data: {
        ...validated,
        status: 'open',
        currentQuantity: 0,
        openedAt: new Date(),
      },
    })

    return NextResponse.json(position, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.issues },
        { status: 400 }
      )
    }
    
    console.error('Error creating position:', error)
    return NextResponse.json(
      { error: 'Failed to create position' },
      { status: 500 }
    )
  }
}

// PATCH /api/positions - Update position (stop loss, take profit, etc.)
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Position ID required' },
        { status: 400 }
      )
    }

    const position = await prisma.position.update({
      where: { id },
      data: updates,
    })

    return NextResponse.json(position)
  } catch (error) {
    console.error('Error updating position:', error)
    return NextResponse.json(
      { error: 'Failed to update position' },
      { status: 500 }
    )
  }
}

// Close position endpoint would be implemented as a separate route
// e.g., /api/positions/[id]/close

// Helper function to update strategy performance metrics
async function updateStrategyMetrics(strategyId: string) {
  const positions = await prisma.position.findMany({
    where: { strategyId },
  })

  const closedPositions = positions.filter(p => p.status === 'closed')
  const openPositions = positions.filter(p => p.status === 'open')
  const winningPositions = closedPositions.filter(p => Number(p.netPnl) > 0)
  const losingPositions = closedPositions.filter(p => Number(p.netPnl) < 0)

  const totalPnl = positions.reduce((sum, p) => sum + Number(p.netPnl || 0), 0)
  const totalFees = positions.reduce((sum, p) => sum + Number(p.totalFees || 0), 0)
  
  const avgWin = winningPositions.length > 0
    ? winningPositions.reduce((sum, p) => sum + Number(p.netPnl), 0) / winningPositions.length
    : 0
  
  const avgLoss = losingPositions.length > 0
    ? Math.abs(losingPositions.reduce((sum, p) => sum + Number(p.netPnl), 0) / losingPositions.length)
    : 0

  const winRate = closedPositions.length > 0
    ? (winningPositions.length / closedPositions.length) * 100
    : 0

  const profitFactor = avgLoss > 0 ? avgWin / avgLoss : avgWin > 0 ? 999 : 0

  await prisma.strategy.update({
    where: { id: strategyId },
    data: {
      totalPositions: positions.length,
      openPositions: openPositions.length,
      closedPositions: closedPositions.length,
      winningPositions: winningPositions.length,
      losingPositions: losingPositions.length,
      totalPnl,
      totalFees,
      netPnl: totalPnl - totalFees,
      avgWin,
      avgLoss,
      winRate,
      profitFactor,
      lastCalculated: new Date(),
    },
  })
}