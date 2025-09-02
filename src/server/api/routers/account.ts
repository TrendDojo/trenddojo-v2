import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

export const accountRouter = createTRPCRouter({
  // Get all accounts for current user
  getAll: protectedProcedure.query(async ({ ctx }) => {
    // Graceful degradation: return mock data if database is unavailable
    if (!ctx.db) {
      console.log('📱 Returning mock accounts for preview deployment')
      return [{
        id: 'mock-account-1',
        userId: ctx.session.user.id,
        name: 'Demo Account',
        broker: 'manual' as const,
        accountType: 'paper' as const,
        baseCurrency: 'USD',
        startingBalance: 10000,
        currentBalance: 10500,
        riskSettings: {
          id: 'mock-risk-1',
          maxRiskPerTrade: 0.02,
          maxDrawdown: 0.15,
        },
        trades: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      }]
    }

    return ctx.db.account.findMany({
      where: { userId: ctx.session.user.id },
      include: {
        riskSettings: true,
        trades: {
          where: { status: "active" },
          select: { id: true, symbol: true, positionSizeUsd: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }),

  // Create new account
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        broker: z.enum(["alpaca", "ibkr", "manual"]).optional(),
        accountType: z.enum(["live", "paper", "tracking"]).optional(),
        baseCurrency: z.string().length(3).default("USD"),
        startingBalance: z.number().positive().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Graceful degradation: return mock account creation
      if (!ctx.db) {
        console.log('📱 Mock account creation for preview deployment:', input)
        return {
          id: `mock-account-${Date.now()}`,
          userId: ctx.session.user.id,
          name: input.name,
          broker: input.broker,
          accountType: input.accountType,
          baseCurrency: input.baseCurrency,
          startingBalance: input.startingBalance,
          currentBalance: input.startingBalance,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      }

      // Check subscription limits
      const user = await ctx.db.user.findUnique({
        where: { id: ctx.session.user.id },
        select: { subscriptionTier: true },
      });

      if (!user) {
        throw new Error("User not found");
      }

      const limits = await ctx.db.subscriptionLimit.findUnique({
        where: { tier: user.subscriptionTier },
      });

      if (!limits) {
        throw new Error("Invalid subscription tier");
      }

      const accountCount = await ctx.db.account.count({
        where: { userId: ctx.session.user.id },
      });

      if (accountCount >= limits.maxAccounts) {
        throw new Error(`Account limit reached. Upgrade to create more accounts.`);
      }

      // Create account
      const account = await ctx.db.account.create({
        data: {
          userId: ctx.session.user.id,
          name: input.name,
          broker: input.broker,
          accountType: input.accountType,
          baseCurrency: input.baseCurrency,
          startingBalance: input.startingBalance,
          currentBalance: input.startingBalance,
        },
      });

      // Create default risk settings
      await ctx.db.riskSettings.create({
        data: {
          userId: ctx.session.user.id,
          accountId: account.id,
          // Defaults are set in schema
        },
      });

      return account;
    }),

  // Update account
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).optional(),
        currentBalance: z.number().positive().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Graceful degradation: return mock update
      if (!ctx.db) {
        console.log('📱 Mock account update for preview deployment:', input)
        return {
          id: input.id,
          userId: ctx.session.user.id,
          name: input.name || 'Updated Account',
          currentBalance: input.currentBalance || 10000,
          updatedAt: new Date(),
        }
      }

      return ctx.db.account.update({
        where: { 
          id: input.id,
          userId: ctx.session.user.id, // Ensure user owns this account
        },
        data: {
          name: input.name,
          currentBalance: input.currentBalance,
        },
      });
    }),

  // Delete account
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Graceful degradation: return mock deletion
      if (!ctx.db) {
        console.log('📱 Mock account deletion for preview deployment:', input)
        return {
          id: input.id,
          userId: ctx.session.user.id,
          name: 'Deleted Account',
          deletedAt: new Date(),
        }
      }

      // Check if account has active trades
      const activeTrades = await ctx.db.trade.count({
        where: {
          accountId: input.id,
          status: "active",
        },
      });

      if (activeTrades > 0) {
        throw new Error("Cannot delete account with active trades");
      }

      return ctx.db.account.delete({
        where: { 
          id: input.id,
          userId: ctx.session.user.id, // Ensure user owns this account
        },
      });
    }),
});