import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const prisma = new PrismaClient()

// GET /api/positions/[id] - Get single position with all details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const position = await prisma.positions.findUnique({
      where: {
        id: params.id,
      },
      include: {
        strategies: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
        executions: {
          orderBy: {
            executedAt: 'desc',
          },
        },
        position_notes: {
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    })

    if (!position) {
      return NextResponse.json(
        { error: 'Position not found' },
        { status: 404 }
      )
    }

    // Calculate current metrics
    const currentPrice = position.currentPrice || position.avgEntryPrice
    const currentValue = currentPrice * position.currentQuantity
    const costBasis = position.avgEntryPrice * position.currentQuantity
    const unrealizedPnl = currentValue - costBasis
    const unrealizedPnlPercent = (unrealizedPnl / costBasis) * 100

    // Calculate holding days
    const holdingDays = Math.floor(
      (new Date().getTime() - new Date(position.openedAt).getTime()) / (1000 * 60 * 60 * 24)
    )

    // Format response
    const response = {
      id: position.id,
      symbol: position.symbol,
      name: position.name,
      strategy: position.strategies?.name || 'Manual Entry',
      strategyId: position.strategyId,
      direction: position.direction,
      status: position.status,
      currentQuantity: position.currentQuantity,
      avgEntryPrice: position.avgEntryPrice,
      currentPrice: currentPrice,
      stopLoss: position.stopLoss,
      takeProfit: position.takeProfit,
      unrealizedPnl: unrealizedPnl,
      unrealizedPnlPercent: unrealizedPnlPercent,
      realizedPnl: position.realizedPnl || 0,
      totalFees: position.totalFees || 0,
      openedAt: position.openedAt,
      closedAt: position.closedAt,
      lastExecutionAt: position.executions?.[0]?.executedAt || position.openedAt,
      holdingDays: holdingDays,
      maxGainPercent: position.maxGain || 0,
      maxLossPercent: position.maxLoss || 0,
      rMultiple: position.riskRewardRatio || 0,
      source: position.source,
      brokerAccountId: position.brokerAccountId,
      executions: position.executions.map(exec => ({
        id: exec.id,
        date: exec.executedAt,
        type: exec.executionType,
        quantity: exec.quantity,
        price: exec.price,
        fees: exec.fees || 0,
        notes: exec.notes,
        brokerOrderId: exec.brokerOrderId,
      })),
      notes: position.position_notes.map(note => ({
        id: note.id,
        date: note.createdAt,
        content: note.content,
        noteType: note.noteType,
      })),
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching position:', error)
    return NextResponse.json(
      { error: 'Failed to fetch position' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
