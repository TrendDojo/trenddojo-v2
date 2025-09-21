import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient, Prisma } from '@prisma/client'
import { z } from 'zod'
import crypto from 'crypto'

const prisma = new PrismaClient()

// Execution creation schema
const CreateExecutionSchema = z.object({
  positionId: z.string(),
  type: z.enum(['buy', 'sell', 'dividend', 'interest', 'fee_only']),
  quantity: z.number().positive(),
  price: z.number().positive(),
  commission: z.number().min(0).default(0),
  exchangeFees: z.number().min(0).default(0),
  secFees: z.number().min(0).default(0),
  tafFees: z.number().min(0).default(0),
  clearingFees: z.number().min(0).default(0),
  otherFees: z.number().min(0).default(0),
  brokerName: z.string().optional(),
  brokerExecId: z.string().optional(),
  brokerOrderId: z.string().optional(),
  executedAt: z.string().transform(str => new Date(str)),
  settlementDate: z.string().transform(str => new Date(str)).optional(),
})

// GET /api/executions - List executions
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const positionId = searchParams.get('positionId')
    const strategyId = searchParams.get('strategyId')
    const portfolioId = searchParams.get('portfolioId')
    const limit = parseInt(searchParams.get('limit') || '50')

    const where: Record<string, any> = {}
    
    if (positionId) {
      where.positionId = positionId
    }
    
    if (strategyId) {
      where.position = {
        strategyId,
      }
    }
    
    if (portfolioId) {
      where.position = {
        strategies: {
          portfolioId,
        },
      }
    }

    const executions = await prisma.executions.findMany({
      where,
      include: {
        positions: {
          select: {
            symbol: true,
            assetType: true,
            strategies: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: { executedAt: 'desc' },
      take: limit,
    })

    return NextResponse.json(executions)
  } catch (error) {
    console.error('Error fetching executions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch executions' },
      { status: 500 }
    )
  }
}

// POST /api/executions - Record new execution
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validated = CreateExecutionSchema.parse(body)

    // Calculate total fees and net value
    const totalFees = 
      validated.commission +
      validated.exchangeFees +
      validated.secFees +
      validated.tafFees +
      validated.clearingFees +
      validated.otherFees

    const grossValue = validated.quantity * validated.price
    const netValue = validated.type === 'buy' 
      ? grossValue + totalFees  // Add fees for buys
      : grossValue - totalFees  // Subtract fees for sells

    // Create execution
    const execution = await prisma.executions.create({
      data: {
        id: crypto.randomUUID(),
        ...validated,
        totalFees,
        grossValue,
        netValue,
        createdAt: new Date(),
      },
    })

    // Update position metrics
    await updatePositionFromExecution(validated.positionId)

    return NextResponse.json(execution, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.issues },
        { status: 400 }
      )
    }
    
    console.error('Error creating execution:', error)
    return NextResponse.json(
      { error: 'Failed to create execution' },
      { status: 500 }
    )
  }
}

// Bulk create endpoint would go here if needed
// Currently handled via POST with multiple executions

// Helper function to update position metrics from executions
async function updatePositionFromExecution(positionId: string) {
  const executions = await prisma.executions.findMany({
    where: { positionId },
    orderBy: { executedAt: 'asc' },
  })

  if (executions.length === 0) return

  // Calculate current quantity
  let currentQuantity = new Prisma.Decimal(0)
  let totalBuyQuantity = new Prisma.Decimal(0)
  let totalBuyValue = new Prisma.Decimal(0)
  let totalSellQuantity = new Prisma.Decimal(0)
  let totalSellValue = new Prisma.Decimal(0)
  let totalFees = new Prisma.Decimal(0)

  for (const exec of executions) {
    totalFees = totalFees.add(exec.totalFees)
    
    if (exec.type === 'buy') {
      currentQuantity = currentQuantity.add(exec.quantity)
      totalBuyQuantity = totalBuyQuantity.add(exec.quantity)
      totalBuyValue = totalBuyValue.add(exec.netValue)
    } else if (exec.type === 'sell') {
      currentQuantity = currentQuantity.sub(exec.quantity)
      totalSellQuantity = totalSellQuantity.add(exec.quantity)
      totalSellValue = totalSellValue.add(exec.netValue)
    }
  }

  // Calculate average prices
  const avgEntryPrice = totalBuyQuantity.gt(0) 
    ? totalBuyValue.div(totalBuyQuantity)
    : new Prisma.Decimal(0)
  
  const avgExitPrice = totalSellQuantity.gt(0)
    ? totalSellValue.div(totalSellQuantity)
    : null

  // Calculate P&L
  const realizedPnl = totalSellValue.sub(
    totalBuyValue.mul(totalSellQuantity).div(totalBuyQuantity.gt(0) ? totalBuyQuantity : 1)
  )

  // Update position
  await prisma.positions.update({
    where: { id: positionId },
    data: {
      currentQuantity,
      avgEntryPrice,
      avgExitPrice,
      totalFees,
      realizedPnl,
      netPnl: realizedPnl.sub(totalFees),
      lastExecutionAt: executions[executions.length - 1].executedAt,
      status: currentQuantity.eq(0) ? 'closed' : 'open',
      closedAt: currentQuantity.eq(0) ? executions[executions.length - 1].executedAt : null,
    },
  })
}

// DELETE /api/executions - Delete execution
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Execution ID required' },
        { status: 400 }
      )
    }

    const execution = await prisma.executions.findUnique({
      where: { id },
    })

    if (!execution) {
      return NextResponse.json(
        { error: 'Execution not found' },
        { status: 404 }
      )
    }

    await prisma.executions.delete({
      where: { id },
    })

    // Recalculate position metrics
    await updatePositionFromExecution(execution.positionId)

    return NextResponse.json({ message: 'Execution deleted' })
  } catch (error) {
    console.error('Error deleting execution:', error)
    return NextResponse.json(
      { error: 'Failed to delete execution' },
      { status: 500 }
    )
  }
}