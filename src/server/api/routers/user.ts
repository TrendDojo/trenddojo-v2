import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "@/server/api/trpc";

export const userRouter = createTRPCRouter({
  // Get current user profile
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.user.findUnique({
      where: { id: ctx.session.user.id },
      include: {
        accounts: true,
        riskSettings: true,
        brokerConnections: true,
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    return user;
  }),

  // Update user subscription tier
  updateSubscription: protectedProcedure
    .input(
      z.object({
        tier: z.enum(["free", "starter", "basic", "pro"]),
        status: z.enum(["active", "cancelled", "past_due"]).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.user.update({
        where: { id: ctx.session.user.id },
        data: {
          subscriptionTier: input.tier,
          subscriptionStatus: input.status ?? "active",
          subscriptionExpiresAt: input.status === "cancelled" 
            ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
            : null,
        },
      });
    }),

  // Get subscription limits for current user
  getSubscriptionLimits: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.user.findUnique({
      where: { id: ctx.session.user.id },
      select: { subscriptionTier: true },
    });

    if (!user) {
      throw new Error("User not found");
    }

    return ctx.db.subscriptionLimit.findUnique({
      where: { tier: user.subscriptionTier },
    });
  }),
});