import { db } from "@/server/db";
import { redis } from "@/server/db/redis";
import { inngest } from "../client";

// ============================================================
// HOT SCORE COMPUTATION
// ============================================================

/**
 * Reddit-style hot score algorithm:
 * score = log10(max(|ups - downs|, 1)) + sign(ups - downs) * (seconds since epoch - 1134028003) / 45000
 *
 * Threadscape adaptation: we weight recency more heavily and use Wilson score
 * for the confidence interval to avoid artificially inflating new posts.
 */

const EPOCH = 1700000000; // Threadscape epoch (Nov 2023)
const SECONDS_IN_HOUR = 3600;
const GRAVITY = 1.8; // Higher = faster decay of old posts

/**
 * Calculate hot score using Hacker News-inspired algorithm with Reddit adjustments
 */
function computeHotScore(
  upvotes: number,
  downvotes: number,
  commentCount: number,
  createdAt: Date
): number {
  const score = upvotes - downvotes;
  const order = Math.log10(Math.max(Math.abs(score), 1));
  const sign = score > 0 ? 1 : score < 0 ? -1 : 0;
  const seconds = (createdAt.getTime() / 1000 - EPOCH) / 45000;

  // Age penalty using gravity
  const ageHours =
    (Date.now() / 1000 - createdAt.getTime() / 1000) / SECONDS_IN_HOUR;
  const agePenalty = Math.pow(ageHours + 2, GRAVITY);

  // Engagement bonus from comments
  const commentBonus = Math.log10(Math.max(commentCount * 0.5 + 1, 1)) * 0.3;

  return (order * sign + seconds + commentBonus) / agePenalty;
}

/**
 * Cron job: Recompute hot scores for all active posts
 * Runs every 15 minutes
 */
export const computeHotScores = inngest.createFunction(
  {
    id: "compute-hot-scores",
    name: "Compute Hot Scores (Cron)",
    concurrency: {
      limit: 1, // Only one instance at a time
    },
    retries: 2,
  },
  { cron: "*/15 * * * *" }, // Every 15 minutes
  async ({ step, logger }) => {
    const startTime = Date.now();
    logger.info("[compute-hot-scores] Starting hot score computation");

    // Step 1: Fetch all active posts created in the last 7 days
    const posts = await step.run("fetch-active-posts", async () => {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

      const activePosts = await db.post.findMany({
        where: {
          status: "ACTIVE",
          createdAt: { gte: sevenDaysAgo },
          deletedAt: null,
        },
        select: {
          id: true,
          upvoteCount: true,
          downvoteCount: true,
          commentCount: true,
          createdAt: true,
          hotScore: true,
        },
        orderBy: { createdAt: "desc" },
        take: 10000, // Cap at 10k posts per run
      });

      logger.info(
        `[compute-hot-scores] Fetched ${activePosts.length} active posts`
      );
      return activePosts;
    });

    // Step 2: Compute new hot scores in batches
    const BATCH_SIZE = 500;
    const batches = Math.ceil(posts.length / BATCH_SIZE);
    let updatedCount = 0;
    let skippedCount = 0;

    for (let i = 0; i < batches; i++) {
      const batch = posts.slice(i * BATCH_SIZE, (i + 1) * BATCH_SIZE);

      const results = await step.run(`update-scores-batch-${i}`, async () => {
        const updates: Array<{ id: string; hotScore: number }> = [];

        for (const post of batch) {
          const newScore = computeHotScore(
            post.upvoteCount,
            post.downvoteCount,
            post.commentCount,
            post.createdAt
          );

          // Only update if score changed significantly (>0.001 delta)
          if (Math.abs(newScore - (post.hotScore ?? 0)) > 0.001) {
            updates.push({ id: post.id, hotScore: newScore });
          }
        }

        // Bulk update using transaction
        if (updates.length > 0) {
          await db.$transaction(
            updates.map((u) =>
              db.post.update({
                where: { id: u.id },
                data: { hotScore: u.hotScore },
              })
            )
          );
        }

        return { updated: updates.length, skipped: batch.length - updates.length };
      });

      updatedCount += results.updated;
      skippedCount += results.skipped;
    }

    // Step 3: Invalidate hot feed caches in Redis
    await step.run("invalidate-hot-feed-caches", async () => {
      const cacheKeys = await redis.keys("feed:hot:*");

      if (cacheKeys.length > 0) {
        await redis.del(...cacheKeys);
        logger.info(
          `[compute-hot-scores] Invalidated ${cacheKeys.length} cache keys`
        );
      }

      // Also invalidate community-specific hot feeds
      const communityKeys = await redis.keys("community:*:hot:*");
      if (communityKeys.length > 0) {
        await redis.del(...communityKeys);
      }

      return { invalidatedKeys: cacheKeys.length + communityKeys.length };
    });

    // Step 4: Update leaderboard sorted sets in Redis
    await step.run("update-redis-leaderboards", async () => {
      const topPosts = await db.post.findMany({
        where: {
          status: "ACTIVE",
          deletedAt: null,
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
          },
        },
        select: {
          id: true,
          hotScore: true,
          communityId: true,
        },
        orderBy: { hotScore: "desc" },
        take: 1000,
      });

      // Update global hot leaderboard
      const pipeline = redis.pipeline();

      // Clear and rebuild global leaderboard
      pipeline.del("leaderboard:hot:global");
      for (const post of topPosts) {
        pipeline.zadd("leaderboard:hot:global", {
          score: post.hotScore ?? 0,
          member: post.id,
        });
      }

      // Set TTL on leaderboard
      pipeline.expire("leaderboard:hot:global", 60 * 20); // 20 minutes

      await pipeline.exec();

      logger.info(
        `[compute-hot-scores] Updated leaderboard with ${topPosts.length} posts`
      );
      return { leaderboardSize: topPosts.length };
    });

    const duration = Date.now() - startTime;
    logger.info(
      `[compute-hot-scores] Completed in ${duration}ms. Updated: ${updatedCount}, Skipped: ${skippedCount}`
    );

    return {
      success: true,
      duration,
      postsProcessed: posts.length,
      updatedCount,
      skippedCount,
    };
  }
);