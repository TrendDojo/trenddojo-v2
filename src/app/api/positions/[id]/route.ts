import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { auth } from '@/lib/auth'

const prisma = new PrismaClient()

// GET /api/positions/[id] - Get single position with all details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session: any = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const userId = session.user.id

    const position = await prisma.positions.findFirst({
      where: {
        id: params.id,
        strategies: {
          portfolios: {
            userId: userId,
          },
        },
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
        { error: 'Position not found or access denied' },
        { status: 404 }
      )
    }

    // Calculate current metrics
    const avgEntry = Number(position.avgEntryPrice || 0)
    const quantity = Number(position.currentQuantity || 0)
    const unrealizedPnl = Number(position.unrealizedPnl || 0)

    // Calculate current price from unrealized P&L if available, otherwise use entry price
    let currentPrice = avgEntry
    if (quantity > 0 && unrealizedPnl !== 0) {
      // Reverse calculate: currentPrice = avgEntry + (unrealizedPnl / quantity)
      if (position.direction === 'long') {
        currentPrice = avgEntry + (unrealizedPnl / quantity)
      } else {
        currentPrice = avgEntry - (unrealizedPnl / quantity)
      }
    }

    const currentValue = currentPrice * quantity
    const costBasis = avgEntry * quantity
    const unrealizedPnlPercent = costBasis > 0 ? (unrealizedPnl / costBasis) * 100 : 0

    // Calculate holding days
    const holdingDays = Math.floor(
      (new Date().getTime() - new Date(position.openedAt).getTime()) / (1000 * 60 * 60 * 24)
    )

    // Format response
    const response = {
      id: position.id,
      symbol: position.symbol,
      name: position.symbol, // Use symbol as name if name doesn't exist
      strategy: position.strategies?.name || 'Manual Entry',
      strategyId: position.strategyId,
      direction: position.direction,
      status: position.status,
      currentQuantity: Number(position.currentQuantity),
      avgEntryPrice: avgEntry,
      currentPrice: currentPrice,
      stopLoss: position.stopLoss ? Number(position.stopLoss) : null,
      takeProfit: position.takeProfit ? Number(position.takeProfit) : null,
      unrealizedPnl: unrealizedPnl,
      unrealizedPnlPercent: unrealizedPnlPercent,
      realizedPnl: Number(position.realizedPnl || 0),
      totalFees: Number(position.totalFees || 0),
      openedAt: position.openedAt,
      closedAt: position.closedAt,
      lastExecutionAt: position.executions?.[0]?.executedAt || position.openedAt,
      holdingDays: holdingDays,
      maxGainPercent: position.maxGainPercent ? Number(position.maxGainPercent) : 0,
      maxLossPercent: position.maxLossPercent ? Number(position.maxLossPercent) : 0,
      rMultiple: position.rMultiple ? Number(position.rMultiple) : 0,
      source: position.broker || 'manual',
      brokerAccountId: position.brokerPositionId || null,
      executions: position.executions.map(exec => ({
        id: exec.id,
        date: exec.executedAt,
        type: exec.type, // Field is 'type' not 'executionType'
        quantity: Number(exec.quantity),
        price: Number(exec.price),
        fees: Number(exec.totalFees || 0), // Field is 'totalFees' not 'fees'
        notes: null, // Notes are in position_notes table
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
