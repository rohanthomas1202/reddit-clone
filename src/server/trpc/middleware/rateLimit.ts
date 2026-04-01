import { TRPCError } from "@trpc/server";
import { Ratelimit } from "@upstash/ratelimit";
import { middleware } from "../trpc";
import { redis } from "@/server/db/redis";

// ============================================================
// RATE LIMITERS
// ============================================================

const rateLimiters = {
  // General API: 60 requests per minute
  general: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(60, "1 m"),
    prefix: "rl:general",
    analytics: true,
  }),

  // Post creation: 5 posts per 10 minutes
  postCreate: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, "10 m"),
    prefix: "rl:post:create",
    analytics: true,
  }),

  // Comment creation: 20 comments per 5 minutes
  commentCreate: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(20, "5 m"),
    prefix: "rl:comment:create",
    analytics: true,
  }),

  // Vote: 100 votes per minute
  vote: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(100, "1 m"),
    prefix: "rl:vote",
    analytics: true,
  }),

  // Search: 30 searches per minute
  search: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(30, "1 m"),
    prefix: "rl:search",
    analytics: true,
  }),

  // Message: 30 messages per minute
  message: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(30, "1 m"),
    prefix: "rl:message",
    analytics: true,
  }),

  // Auth: 10 attempts per 15 minutes
  auth: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, "15 m"),
    prefix: "rl:auth",
    analytics: true,
  }),

  // Report: 10 reports per 10 minutes
  report: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, "10 m"),
    prefix: "rl:report",
    analytics: true,
  }),
} as const;

type RateLimiterKey = keyof typeof rateLimiters;

// ============================================================
// RATE LIMIT MIDDLEWARE FACTORY
// ============================================================

/**
 * Creates a rate limiting middleware for a specific limiter.
 */
export function createRateLimitMiddleware(limiterKey: RateLimiterKey = "general") {
  return middleware(async ({ ctx, next }) => {
    // Use user ID if authenticated, otherwise fall back to IP
    const identifier =
      ctx.session?.user?.id ??
      ctx.req.headers.get("x-forwarded-for") ??
      ctx.req.headers.get("x-real-ip") ??
      "anonymous";

    const limiter = rateLimiters[limiterKey];
    const { success, limit, reset, remaining } = await limiter.limit(identifier);

    if (!success) {
      throw new TRPCError({
        code: "TOO_MANY_REQUESTS",
        message: `Rate limit exceeded. Try again in ${Math.ceil((reset - Date.now()) / 1000)} seconds.`,
      });
    }

    return next({
      ctx: {
        ...ctx,
        rateLimit: { limit, reset, remaining },
      },
    });
  });
}

// ============================================================
// PRE-BUILT MIDDLEWARES
// ============================================================

export const rateLimitGeneral = createRateLimitMiddleware("general");
export const rateLimitPostCreate = createRateLimitMiddleware("postCreate");
export const rateLimitCommentCreate = createRateLimitMiddleware("commentCreate");
export const rateLimitVote = createRateLimitMiddleware("vote");
export const rateLimitSearch = createRateLimitMiddleware("search");
export const rateLimitMessage = createRateLimitMiddleware("message");
export const rateLimitAuth = createRateLimitMiddleware("auth");
export const rateLimitReport = createRateLimitMiddleware("report");