import { TRPCError, initTRPC } from "@trpc/server";
import superjson from "superjson";
import { ZodError } from "zod";
import type { TRPCContext } from "./context";

// ============================================================
// tRPC INITIALIZATION
// ============================================================

const t = initTRPC.context<TRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

// ============================================================
// ROUTER & PROCEDURE BUILDERS
// ============================================================

export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;

/**
 * Public procedure — no authentication required
 */
export const publicProcedure = t.procedure;

/**
 * Protected procedure — requires authenticated session
 */
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You must be logged in to perform this action.",
    });
  }
  return next({
    ctx: {
      ...ctx,
      session: ctx.session,
    },
  });
});

/**
 * Middleware builder for re-use
 */
export const middleware = t.middleware;

export { t };