import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

export const userRouter = createTRPCRouter({
  // Get current user profile
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    // Graceful degradation: return mock data if database is unavailable
    if (!ctx.db) {
      console.log('📱 Returning mock user profile for preview deployment')
      return {
        id: ctx.session.user.id,
        name: ctx.session.user.name || 'Preview User',
        email: ctx.session.user.email || 'preview@trenddojo.com',
        image: ctx.session.user.image,
        subscriptionTier: 'free' as const,
        subscriptionStatus: 'active' as const,
        accounts: [],
        riskSettings: null,
        brokerConnections: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    }

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
      // Graceful degradation: return success response without database
      if (!ctx.db) {
        console.log('📱 Mock subscription update for preview deployment:', input)
        return {
          id: ctx.session.user.id,
          subscriptionTier: input.tier,
          subscriptionStatus: input.status ?? "active",
          subscriptionExpiresAt: input.status === "cancelled" 
            ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            : null,
        }
      }

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
    // Graceful degradation: return default limits for preview
    if (!ctx.db) {
      console.log('📱 Returning mock subscription limits for preview deployment')
      return {
        tier: 'free' as const,
        maxPositions: 5,
        maxStrategies: 1,
        maxBacktests: 10,
        advancedFeatures: false,
        prioritySupport: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    }

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