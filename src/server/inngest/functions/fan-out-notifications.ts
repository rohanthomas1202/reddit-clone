import { db } from "@/server/db";
import { redis } from "@/server/db/redis";
import { inngest } from "../client";

// ============================================================
// NOTIFICATION FAN-OUT
// ============================================================

/**
 * Map event types to human-readable notification messages
 */
function buildNotificationContent(
  type: string,
  actorUsername: string,
  entityType: string,
  metadata?: Record<string, unknown>
): { title: string; body: string; actionUrl: string } {
  const entityLabel = entityType === "post" ? "post" : entityType === "comment" ? "comment" : entityType;

  switch (type) {
    case "post_comment":
      return {
        title: "New comment on your post",
        body: `${actorUsername} commented on your ${entityLabel}`,
        actionUrl: `/posts/${String(metadata?.["postId"] ?? "")}`,
      };
    case "comment_reply":
      return {
        title: "New reply to your comment",
        body: `${actorUsername} replied to your comment`,
        actionUrl: `/posts/${String(metadata?.["postId"] ?? "")}?comment=${String(metadata?.["commentId"] ?? "")}`,
      };
    case "post_upvote":
      return {
        title: "Your post is trending!",
        body: `${actorUsername} and others upvoted your post`,
        actionUrl: `/posts/${String(metadata?.["postId"] ?? "")}`,
      };
    case "comment_upvote":
      return {
        title: "Your comment got an upvote",
        body: `${actorUsername} upvoted your comment`,
        actionUrl: `/posts/${String(metadata?.["postId"] ?? "")}?comment=${String(metadata?.["commentId"] ?? "")}`,
      };
    case "mention":
      return {
        title: `${actorUsername} mentioned you`,
        body: `You were mentioned in a ${entityLabel}`,
        actionUrl:
          entityType === "post"
            ? `/posts/${String(metadata?.["entityId"] ?? "")}`
            : `/posts/${String(metadata?.["postId"] ?? "")}?comment=${String(metadata?.["entityId"] ?? "")}`,
      };
    case "community_invite":
      return {
        title: "Community invitation",
        body: `${actorUsername} invited you to join a community`,
        actionUrl: `/t/${String(metadata?.["communitySlug"] ?? "")}`,
      };
    case "community_approved":
      return {
        title: "Join request approved",
        body: `Your request to join has been approved`,
        actionUrl: `/t/${String(metadata?.["communitySlug"] ?? "")}`,
      };
    case "new_follower":
      return {
        title: "New follower",
        body: `${actorUsername} started following you`,
        actionUrl: `/u/${actorUsername}`,
      };
    case "award_received":
      return {
        title: "You received an award!",
        body: `${actorUsername} gave your ${entityLabel} an award`,
        actionUrl:
          entityType === "post"
            ? `/posts/${String(metadata?.["entityId"] ?? "")}`
            : `/posts/${String(metadata?.["postId"] ?? "")}?comment=${String(metadata?.["entityId"] ?? "")}`,
      };
    case "mod_action":
      return {
        title: "Moderator action",
        body: `A moderator took action on your ${entityLabel}`,
        actionUrl:
          entityType === "post"
            ? `/posts/${String(metadata?.["entityId"] ?? "")}`
            : `/posts/${String(metadata?.["postId"] ?? "")}?comment=${String(metadata?.["entityId"] ?? "")}`,
      };
    case "post_crosspost":
      return {
        title: "Your post was crossposted",
        body: `${actorUsername} crossposted your post to another community`,
        actionUrl: `/posts/${String(metadata?.["newPostId"] ?? "")}`,
      };
    default:
      return {
        title: "New notification",
        body: `${actorUsername} interacted with your content`,
        actionUrl: "/notifications",
      };
  }
}

/**
 * Fan-out notifications to multiple recipients
 * Uses batching to avoid overwhelming the database
 */
export const fanOutNotifications = inngest.createFunction(
  {
    id: "fan-out-notifications",
    name: "Fan-Out Notifications",
    concurrency: {
      limit: 10,
    },
    retries: 3,
    throttle: {
      count: 100,
      period: "1m",
    },
  },
  { event: "notifications/fan-out" },
  async ({ event, step, logger }) => {
    const { type, actorId, recipientIds, entityId, entityType, metadata } =
      event.data;

    logger.info(
      `[fan-out-notifications] Processing ${type} notification for ${recipientIds.length} recipients`
    );

    // Step 1: Fetch actor information
    const actor = await step.run("fetch-actor", async () => {
      const user = await db.user.findUnique({
        where: { id: actorId },
        select: {
          id: true,
          username: true,
          displayName: true,
          image: true,
        },
      });

      if (!user) {
        throw new Error(`Actor user ${actorId} not found`);
      }

      return user;
    });

    // Step 2: Fetch recipients with their notification preferences
    const recipients = await step.run("fetch-recipients", async () => {
      const users = await db.user.findMany({
        where: {
          id: { in: recipientIds },
          status: "ACTIVE",
          deletedAt: null,
        },
        select: {
          id: true,
          username: true,
          email: true,
          notificationFrequency: true,
          settings: true,
        },
      });

      return users;
    });

    if (recipients.length === 0) {
      logger.info("[fan-out-notifications] No valid recipients found, skipping");
      return { success: true, notificationsCreated: 0 };
    }

    // Step 3: Build notification content
    const content = buildNotificationContent(
      type,
      actor.displayName ?? actor.username,
      entityType,
      metadata
    );

    // Step 4: Create notifications in database (batch)
    const BATCH_SIZE = 100;
    const batches = Math.ceil(recipients.length / BATCH_SIZE);
    let totalCreated = 0;

    for (let i = 0; i < batches; i++) {
      const batch = recipients.slice(i * BATCH_SIZE, (i + 1) * BATCH_SIZE);

      const created = await step.run(
        `create-notifications-batch-${i}`,
        async () => {
          // Filter out recipients who have blocked the actor
          const blockedRelations = await db.block.findMany({
            where: {
              blockerId: { in: batch.map((r) => r.id) },
              blockedId: actorId,
            },
            select: { blockerId: true },
          });

          const blockedByUsers = new Set(
            blockedRelations.map((b) => b.blockerId)
          );

          const eligibleRecipients = batch.filter(
            (r) =>
              r.id !== actorId && // Don't notify actor about their own actions
              !blockedByUsers.has(r.id)
          );

          if (eligibleRecipients.length === 0) {
            return 0;
          }

          // Create notifications in bulk
          const result = await db.notification.createMany({
            data: eligibleRecipients.map((recipient) => ({
              userId: recipient.id,
              type: type as string,
              title: content.title,
              body: content.body,
              actionUrl: content.actionUrl,
              actorId: actorId,
              entityId: entityId,
              entityType: entityType,
              metadata: metadata ?? {},
              read: false,
            })),
            skipDuplicates: true,
          });

          return result.count;
        }
      );

      totalCreated += created;
    }

    // Step 5: Update unread notification counts in Redis
    await step.run("update-notification-counts", async () => {
      const pipeline = redis.pipeline();

      for (const recipient of recipients) {
        if (recipient.id !== actorId) {
          pipeline.incr(`notifications:unread:${recipient.id}`);
          // Set max TTL of 30 days
          pipeline.expire(`notifications:unread:${recipient.id}`, 60 * 60 * 24 * 30);
        }
      }

      await pipeline.exec();
    });

    // Step 6: Push real-time notifications via Pusher (fire and forget)
    await step.run("push-realtime-notifications", async () => {
      // Only push to recipients who want real-time notifications
      const realtimeRecipients = recipients.filter(
        (r) =>
          r.notificationFrequency === "REALTIME" && r.id !== actorId
      );

      if (realtimeRecipients.length === 0) {
        return;
      }

      // Batch Pusher triggers (max 10 per request)
      const pusherBatches = Math.ceil(realtimeRecipients.length / 10);

      for (let i = 0; i < pusherBatches; i++) {
        const batchRecipients = realtimeRecipients.slice(i * 10, (i + 1) * 10);

        try {
          const pusherKey = process.env["PUSHER_APP_KEY"];
          const pusherSecret = process.env["PUSHER_APP_SECRET"];
          const pusherAppId = process.env["PUSHER_APP_ID"];
          const pusherCluster = process.env["PUSHER_CLUSTER"] ?? "us2";

          if (!pusherKey || !pusherSecret || !pusherAppId) {
            logger.warn("[fan-out-notifications] Pusher env vars not configured, skipping realtime");
            return;
          }

          // Use Pusher batch events API
          const events = batchRecipients.map((recipient) => ({
            channel: `private-user-${recipient.id}`,
            name: "notification",
            data: JSON.stringify({
              type,
              title: content.title,
              body: content.body,
              actionUrl: content.actionUrl,
              actor: {
                id: actor.id,
                username: actor.username,
                image: actor.image,
              },
              entityId,
              entityType,
              createdAt: new Date().toISOString(),
            }),
          }));

          // Simple HTTP call to Pusher batch API
          const timestamp = Math.floor(Date.now() / 1000);
          const body = JSON.stringify({ batch: events });

          const response = await fetch(
            `https://api-${pusherCluster}.pusher.com/apps/${pusherAppId}/batch_events`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "X-Pusher-Key": pusherKey,
              },
              body,
            }
          );

          if (!response.ok) {
            logger.warn(
              `[fan-out-notifications] Pusher batch push failed: ${response.status}`
            );
          }
        } catch (err) {
          logger.warn(
            "[fan-out-notifications] Failed to push realtime notification",
            err
          );
          // Non-critical: don't fail the whole function
        }
      }
    });

    logger.info(
      `[fan-out-notifications] Created ${totalCreated} notifications for ${recipients.length} recipients`
    );

    return {
      success: true,
      notificationsCreated: totalCreated,
      recipientsProcessed: recipients.length,
    };
  }
);