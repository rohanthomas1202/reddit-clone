import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// ============================================================
// REDIS CLIENT SINGLETON
// ============================================================

function createRedisClient(): Redis {
  const url = process.env["UPSTASH_REDIS_REST_URL"];
  const token = process.env["UPSTASH_REDIS_REST_TOKEN"];

  if (!url || !token) {
    throw new Error(
      "[Redis] Missing UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN environment variables",
    );
  }

  return new Redis({
    url,
    token,
    retry: {
      retries: 3,
      backoff: (retryCount) => Math.exp(retryCount) * 50,
    },
  });
}

// Singleton pattern — safe in both Edge and Node.js runtimes
const globalForRedis = globalThis as unknown as {
  redis: Redis | undefined;
};

export const redis: Redis =
  globalForRedis.redis ?? createRedisClient();

if (process.env["NODE_ENV"] !== "production") {
  globalForRedis.redis = redis;
}

// ============================================================
// RATE LIMITERS
// ============================================================

/**
 * General API rate limiter — 100 requests per 60 seconds per IP
 */
export const apiRateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(100, "60 s"),
  analytics: true,
  prefix: "rl:api",
});

/**
 * Auth rate limiter — 5 attempts per 15 minutes per IP
 * Protects login, register, password reset endpoints
 */
export const authRateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "15 m"),
  analytics: true,
  prefix: "rl:auth",
});

/**
 * Post creation rate limiter — 10 posts per hour per user
 */
export const postRateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "1 h"),
  analytics: true,
  prefix: "rl:post",
});

/**
 * Comment creation rate limiter — 30 comments per hour per user
 */
export const commentRateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(30, "1 h"),
  analytics: true,
  prefix: "rl:comment",
});

/**
 * Vote rate limiter — 300 votes per hour per user
 */
export const voteRateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(300, "1 h"),
  analytics: true,
  prefix: "rl:vote",
});

/**
 * Search rate limiter — 30 searches per minute per IP
 */
export const searchRateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(30, "1 m"),
  analytics: true,
  prefix: "rl:search",
});

/**
 * Upload rate limiter — 20 uploads per hour per user
 */
export const uploadRateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(20, "1 h"),
  analytics: true,
  prefix: "rl:upload",
});

// ============================================================
// REDIS KEY HELPERS
// ============================================================

export const RedisKeys = {
  // Session cache
  sessionUser: (userId: string) => `session:user:${userId}`,

  // Feed cache
  feedHome: (userId: string, sort: string) => `feed:home:${userId}:${sort}`,
  feedPopular: (sort: string) => `feed:popular:${sort}`,
  feedCommunity: (communityId: string, sort: string) =>
    `feed:community:${communityId}:${sort}`,

  // Hot scores (sorted set)
  hotScores: "scores:hot",
  communityHotScores: (communityId: string) =>
    `scores:hot:community:${communityId}`,

  // Vote counters
  postVotes: (postId: string) => `votes:post:${postId}`,
  commentVotes: (commentId: string) => `votes:comment:${commentId}`,

  // User karma (real-time counter)
  userKarma: (userId: string) => `karma:${userId}`,

  // Notification queue
  notificationQueue: (userId: string) => `notifications:queue:${userId}`,
  notificationUnread: (userId: string) => `notifications:unread:${userId}`,

  // Online presence
  userOnline: (userId: string) => `presence:${userId}`,
  communityOnline: (communityId: string) =>
    `presence:community:${communityId}`,

  // Email verification tokens
  emailVerification: (token: string) => `verify:email:${token}`,

  // Password reset tokens
  passwordReset: (token: string) => `reset:password:${token}`,

  // Rate limit identifiers
  rateLimitAuth: (identifier: string) => `rl:auth:${identifier}`,
  rateLimitApi: (identifier: string) => `rl:api:${identifier}`,

  // Trending cache
  trending: "trending:communities",
  trendingPosts: "trending:posts",
} as const;

// ============================================================
// TYPED REDIS HELPERS
// ============================================================

/**
 * Set a value with optional TTL (seconds)
 */
export async function redisSet<T>(
  key: string,
  value: T,
  ttl?: number,
): Promise<void> {
  if (ttl) {
    await redis.set(key, JSON.stringify(value), { ex: ttl });
  } else {
    await redis.set(key, JSON.stringify(value));
  }
}

/**
 * Get and parse a typed value from Redis
 */
export async function redisGet<T>(key: string): Promise<T | null> {
  const raw = await redis.get<T>(key);
  return raw;
}

/**
 * Delete one or more keys
 */
export async function redisDel(...keys: string[]): Promise<void> {
  if (keys.length === 0) return;
  await redis.del(...keys);
}

/**
 * Increment a counter atomically
 */
export async function redisIncr(key: string, ttl?: number): Promise<number> {
  const count = await redis.incr(key);
  if (ttl && count === 1) {
    await redis.expire(key, ttl);
  }
  return count;
}

/**
 * Decrement a counter atomically
 */
export async function redisDecr(key: string): Promise<number> {
  return await redis.decr(key);
}

/**
 * Check if a key exists
 */
export async function redisExists(key: string): Promise<boolean> {
  const result = await redis.exists(key);
  return result === 1;
}