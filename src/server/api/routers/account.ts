import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

export const accountRouter = createTRPCRouter({
  // Get all accounts for current user
  getAll: protectedProcedure.query(async ({ ctx }) => {
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