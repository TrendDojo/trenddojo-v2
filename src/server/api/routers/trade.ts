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
      // Verify account ownership
      const account = await ctx.db.account.findFirst({
        where: {
          id: input.accountId,
          userId: ctx.session.user.id,
        },
        include: {
          riskSettings: true,
        },
      });

      if (!account) {
        throw new Error("Account not found");
      }

      if (!account.riskSettings.length) {
        throw new Error("Risk settings not configured for this account");
      }

      const riskSettings = account.riskSettings[0]!;

      // Check position limits
      const activePositions = await ctx.db.trade.count({
        where: {
          accountId: input.accountId,
          status: "active",
        },
      });

      if (activePositions >= riskSettings.maxOpenPositions) {
        throw new Error("Maximum open positions reached");
      }

      // Calculate position size based on risk amount and stop loss
      const riskPerShare = Math.abs(input.plannedEntry - input.stopLoss);
      const quantity = input.riskAmount / riskPerShare;
      const positionSizeUsd = quantity * input.plannedEntry;

      // Calculate risk percentage
      const riskPercent = account.currentBalance 
        ? (input.riskAmount / Number(account.currentBalance)) * 100
        : 0;

      // Check risk limits
      if (riskPercent > Number(riskSettings.maxRiskPerTrade)) {
        throw new Error(`Risk per trade exceeds limit of ${riskSettings.maxRiskPerTrade}%`);
      }

      // Calculate risk/reward ratio
      const riskRewardRatio = input.targetPrice 
        ? Math.abs(input.targetPrice - input.plannedEntry) / riskPerShare
        : null;

      return ctx.db.trade.create({
        data: {
          accountId: input.accountId,
          symbol: input.symbol.toUpperCase(),
          direction: input.direction,
          plannedEntry: input.plannedEntry,
          stopLoss: input.stopLoss,
          initialStop: input.stopLoss,
          targetPrice: input.targetPrice,
          riskAmount: input.riskAmount,
          riskPercent: riskPercent,
          riskRewardRatio: riskRewardRatio,
          quantity: quantity,
          originalQuantity: quantity,
          positionSizeUsd: positionSizeUsd,
          positionLabel: input.positionLabel,
          strategyType: input.strategyType,
          setupQuality: input.setupQuality,
          status: "planning",
        },
      });
    }),

  // Update trade
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        actualEntry: z.number().positive().optional(),
        exitPrice: z.number().positive().optional(),
        exitReason: z.enum(["stop_loss", "target", "manual", "trailing_stop"]).optional(),
        status: z.enum(["planning", "pending", "active", "closed"]).optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify trade ownership through account
      const trade = await ctx.db.trade.findFirst({
        where: {
          id: input.id,
          account: {
            userId: ctx.session.user.id,
          },
        },
      });

      if (!trade) {
        throw new Error("Trade not found");
      }

      // Calculate P&L if exiting
      let pnlAmount = null;
      let pnlPercent = null;
      let rMultiple = null;

      if (input.exitPrice && trade.actualEntry) {
        const entryPrice = Number(trade.actualEntry);
        const exitPrice = input.exitPrice;
        const quantity = Number(trade.quantity || 0);

        if (trade.direction === "long") {
          pnlAmount = (exitPrice - entryPrice) * quantity;
        } else {
          pnlAmount = (entryPrice - exitPrice) * quantity;
        }

        pnlPercent = (pnlAmount / Number(trade.positionSizeUsd || 1)) * 100;
        rMultiple = pnlAmount / Number(trade.riskAmount || 1);
      }

      const updatedTrade = await ctx.db.trade.update({
        where: { id: input.id },
        data: {
          actualEntry: input.actualEntry,
          exitPrice: input.exitPrice,
          exitReason: input.exitReason,
          exitDate: input.exitPrice ? new Date() : undefined,
          status: input.status,
          pnlAmount: pnlAmount,
          pnlPercent: pnlPercent,
          rMultiple: rMultiple,
        },
      });

      // Add note if provided
      if (input.notes) {
        await ctx.db.tradeNote.create({
          data: {
            tradeId: input.id,
            noteType: input.status === "closed" ? "exit" : "management",
            content: input.notes,
          },
        });
      }

      return updatedTrade;
    }),

  // Get trade by ID
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.trade.findFirst({
        where: {
          id: input.id,
          account: {
            userId: ctx.session.user.id,
          },
        },
        include: {
          account: {
            select: { name: true, baseCurrency: true },
          },
          tradeNotes: {
            orderBy: { createdAt: "desc" },
          },
          tradeChecklistResponses: {
            include: {
              checklistItem: true,
            },
          },
        },
      });
    }),
});