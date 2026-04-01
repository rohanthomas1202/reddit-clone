import { Inngest } from "inngest";
import { z } from "zod";

// ============================================================
// INNGEST CLIENT SINGLETON
// ============================================================

export const inngest = new Inngest({
  id: "threadscape",
  name: "Threadscape",
  // Middleware for logging and error tracking
  middleware: [
    {
      name: "Logger",
      init: () => ({
        onFunctionRun: ({ fn }: { fn: { name: string } }) => ({
          transformOutput: ({ result, step }: { result: { error?: Error }; step?: { displayName?: string } }) => {
            if (result.error) {
              console.error(`[Inngest] Function ${fn.name} failed at step "${step?.displayName ?? "unknown"}"`, result.error);
            }
            return result;
          },
        }),
      }),
    },
  ],
});

// ============================================================
// EVENT TYPE DEFINITIONS
// ============================================================

// Hot score events
export type ComputeHotScoresEvent = {
  name: "scores/compute.hot";
  data: {
    triggeredAt: string;
  };
};

// Notification fan-out events
export type FanOutNotificationsEvent = {
  name: "notifications/fan-out";
  data: {
    type:
      | "post_comment"
      | "comment_reply"
      | "post_upvote"
      | "comment_upvote"
      | "mention"
      | "community_invite"
      | "community_approved"
      | "new_follower"
      | "award_received"
      | "mod_action"
      | "post_crosspost";
    actorId: string;
    recipientIds: string[];
    entityId: string;
    entityType: "post" | "comment" | "community" | "user";
    metadata?: Record<string, unknown>;
  };
};

// Image upload processing events
export type ProcessImageUploadEvent = {
  name: "images/process.upload";
  data: {
    fileKey: string;
    fileUrl: string;
    fileSize: number;
    mimeType: string;
    userId: string;
    entityId: string;
    entityType: "post" | "community_banner" | "community_icon" | "user_avatar";
  };
};

// Search index sync events
export type SyncSearchIndexEvent = {
  name: "search/sync.index";
  data: {
    operation: "upsert" | "delete";
    entityType: "post" | "comment" | "community" | "user";
    entityId: string;
  };
};

// Karma recalculation events
export type RecalculateKarmaEvent = {
  name: "karma/recalculate";
  data: {
    userId: string;
    reason: "vote_change" | "post_removed" | "comment_removed" | "post_restored" | "comment_restored" | "manual";
  };
};

// Verification email events
export type SendVerificationEmailEvent = {
  name: "email/send.verification";
  data: {
    userId: string;
    email: string;
    username: string;
    token: string;
    expiresAt: string;
  };
};

// Password reset email events
export type SendPasswordResetEmailEvent = {
  name: "email/send.password-reset";
  data: {
    userId: string;
    email: string;
    username: string;
    token: string;
    expiresAt: string;
    ipAddress?: string;
    userAgent?: string;
  };
};

// Auto-flag reported content events
export type AutoFlagReportedContentEvent = {
  name: "moderation/auto-flag";
  data: {
    reportId: string;
    contentType: "post" | "comment" | "user";
    contentId: string;
    communityId?: string;
    reportCount: number;
    reportReasons: string[];
  };
};

// Cleanup expired bans events
export type CleanupExpiredBansEvent = {
  name: "moderation/cleanup.bans";
  data: {
    triggeredAt: string;
  };
};

// Union of all event types
export type ThreadscapeEvents =
  | ComputeHotScoresEvent
  | FanOutNotificationsEvent
  | ProcessImageUploadEvent
  | SyncSearchIndexEvent
  | RecalculateKarmaEvent
  | SendVerificationEmailEvent
  | SendPasswordResetEmailEvent
  | AutoFlagReportedContentEvent
  | CleanupExpiredBansEvent;

// ============================================================
// TYPED INNGEST CLIENT HELPER
// ============================================================

/**
 * Send a typed event to Inngest
 */
export async function sendInngestEvent(
  event: ThreadscapeEvents
): Promise<void> {
  await inngest.send(event);
}

// ============================================================
// ZOD VALIDATION SCHEMAS FOR EVENTS
// ============================================================

export const fanOutNotificationsSchema = z.object({
  type: z.enum([
    "post_comment",
    "comment_reply",
    "post_upvote",
    "comment_upvote",
    "mention",
    "community_invite",
    "community_approved",
    "new_follower",
    "award_received",
    "mod_action",
    "post_crosspost",
  ]),
  actorId: z.string().cuid(),
  recipientIds: z.array(z.string().cuid()).min(1),
  entityId: z.string().cuid(),
  entityType: z.enum(["post", "comment", "community", "user"]),
  metadata: z.record(z.unknown()).optional(),
});

export const processImageUploadSchema = z.object({
  fileKey: z.string().min(1),
  fileUrl: z.string().url(),
  fileSize: z.number().positive(),
  mimeType: z.string().min(1),
  userId: z.string().cuid(),
  entityId: z.string().cuid(),
  entityType: z.enum([
    "post",
    "community_banner",
    "community_icon",
    "user_avatar",
  ]),
});

export const syncSearchIndexSchema = z.object({
  operation: z.enum(["upsert", "delete"]),
  entityType: z.enum(["post", "comment", "community", "user"]),
  entityId: z.string().cuid(),
});

export const recalculateKarmaSchema = z.object({
  userId: z.string().cuid(),
  reason: z.enum([
    "vote_change",
    "post_removed",
    "comment_removed",
    "post_restored",
    "comment_restored",
    "manual",
  ]),
});