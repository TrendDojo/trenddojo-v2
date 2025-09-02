import { createTRPCRouter } from "@/server/api/trpc";
import { userRouter } from "@/server/api/routers/user";
import { accountRouter } from "@/server/api/routers/account";
import { tradeRouter } from "@/server/api/routers/trade";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  user: userRouter,
  account: accountRouter,
  trade: tradeRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;