import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

export const tradeRouter = createTRPCRouter({
  // Get all trades for user's accounts
  getAll: protectedProcedure
    .input(
      z.object({
        accountId: z.string().optional(),
        status: z.enum(["planning", "pending", "active", "closed"]).optional(),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      // Graceful degradation: return mock trades for preview
      if (!ctx.db) {
        console.log('📱 Returning mock trades for preview deployment')
        return [{
          id: 'mock-trade-1',
          symbol: 'AAPL',
          direction: 'long' as const,
          status: 'active' as const,
          plannedEntry: 150.00,
          actualEntry: 150.25,
          stopLoss: 145.00,
          targetPrice: 165.00,
          positionSize: 100,
          positionSizeUsd: 15025,
          account: {
            name: 'Demo Account',
            baseCurrency: 'USD',
          },
          tradeNotes: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        }]
      }

      // Get user's account IDs
      const userAccounts = await ctx.db.account.findMany({
        where: { userId: ctx.session.user.id },
        select: { id: true },
      });

      const accountIds = userAccounts.map((acc: { id: string }) => acc.id);

      return ctx.db.trade.findMany({
        where: {
          accountId: input.accountId ? input.accountId : { in: accountIds },
          status: input.status,
        },
        include: {
          account: {
            select: { name: true, baseCurrency: true },
          },
          tradeNotes: true,
        },
        orderBy: { createdAt: "desc" },
        take: input.limit,
        skip: input.offset,
      });
    }),

  // Create new trade
  create: protectedProcedure
    .input(
      z.object({
        accountId: z.string(),
        symbol: z.string().min(1).max(20),
        direction: z.enum(["long", "short"]),
        plannedEntry: z.number().positive(),
        stopLoss: z.number().positive(),
        targetPrice: z.number().positive().optional(),
        riskAmount: z.number().positive(),
        positionLabel: z.string().optional(),
        strategyType: z.string().optional(),
        setupQuality: z.number().min(1).max(5).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Graceful degradation: return mock trade creation
      if (!ctx.db) {
        console.log('📱 Mock trade creation for preview deployment:', input)
        return {
          id: `mock-trade-${Date.now()}`,
          accountId: input.accountId,
          symbol: input.symbol.toUpperCase(),
          direction: input.direction,
          plannedEntry: input.plannedEntry,
          stopLoss: input.stopLoss,
          targetPrice: input.targetPrice,
          riskAmount: input.riskAmount,
          status: 'planning' as const,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      }

      // Original implementation would go here...
      // For now, let's throw a "not implemented" error for database version
      throw new Error('Trade creation not fully implemented yet')
    }),
});