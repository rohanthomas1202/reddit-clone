import type { Timestamps, SoftDelete, ID, Nullable } from './index';
import type { UserSnippet, Award } from './user';
import type { PostSnippet } from './post';

// ============================================================
// ENUMS
// ============================================================

export type CommentStatus = 'ACTIVE' | 'REMOVED' | 'DELETED' | 'SPAM';

export type CommentSortMode = 'best' | 'top' | 'new' | 'controversial' | 'old' | 'qa';

// ============================================================
// CORE COMMENT TYPES
// ============================================================

/** Comment author with flair info */
export interface CommentAuthor extends UserSnippet {
  communityFlair: Nullable<{
    text: string;
    emoji: Nullable<string>;
    backgroundColor: Nullable<string>;
    textColor: 'light' | 'dark';
  }>;
  isOP: boolean; // is original poster of the thread
  isMod: boolean; // is mod of the community
  isAdmin: boolean;
}

/** Core comment (single node) */
export interface Comment extends Timestamps, SoftDelete {
  id: ID;
  postId: ID;
  parentId: ID | null;
  depth: number;
  path: string; // materialized path: "0.1.3" etc.

  author: CommentAuthor | null; // null if deleted
  body: string;
  bodyHtml: string;

  // Engagement
  score: number;
  upvoteCount: number;
  downvoteCount: number;
  userVote: 1 | -1 | 0;
  isSaved: boolean;

  // Awards
  awards: Award[];
  totalAwardCount: number;

  // Flags
  isEdited: boolean;
  editedAt: Date | null;
  isStickied: boolean;
  isLocked: boolean;
  isCollapsed: boolean;
  isNew: boolean; // highlighted for logged-in user
  distinguishType: 'moderator' | 'admin' | null;

  // Removal
  status: CommentStatus;
  removalReason: Nullable<string>;

  // Reply tree metadata
  replyCount: number;
  hasMoreReplies: boolean;
  moreRepliesCount: number;
}

/** Comment in tree structure (with nested replies) */
export interface CommentTreeNode extends Comment {
  replies: CommentTreeNode[];
  isLoadingReplies: boolean;
  isExpanded: boolean;
}

/** Flat comment with context (for notifications / inbox) */
export interface CommentWithContext extends Comment {
  post: PostSnippet;
  parentComment: Nullable<Pick<Comment, 'id' | 'body' | 'author'>>;
  communityName: string;
  communityIcon: Nullable<string>;
}

/** Comment creation input */
export interface CreateCommentInput {
  postId: ID;
  parentId?: ID;
  body: string;
}

/** Comment update input */
export interface UpdateCommentInput {
  body: string;
}

/** More replies placeholder (Reddit's "load more" pattern) */
export interface MoreReplies {
  type: 'more';
  parentId: ID | null;
  depth: number;
  count: number;
  ids: ID[];
  cursor: Nullable<string>;
}

/** Comment thread item — union of comment node or more-replies */
export type CommentThreadItem = CommentTreeNode | MoreReplies;

/** Comment sort params */
export interface CommentSortParams {
  sort: CommentSortMode;
  context?: number; // for permalink context
  depth?: number;
  limit?: number;
  cursor?: string;
}

/** Comment vote result */
export interface CommentVoteResult {
  commentId: ID;
  score: number;
  upvoteCount: number;
  downvoteCount: number;
  userVote: 1 | -1 | 0;
}

/** Comment mod action */
export interface CommentModAction {
  commentId: ID;
  action: 'remove' | 'approve' | 'lock' | 'unlock' | 'distinguish' | 'sticky';
  reason?: string;
  modNote?: string;
}

/** Comment report */
export interface CommentReport {
  commentId: ID;
  reason: string;
  details?: string;
}

/** Inbox comment item */
export interface InboxComment {
  id: ID;
  type: 'comment_reply' | 'post_reply' | 'mention';
  comment: CommentWithContext;
  isRead: boolean;
  receivedAt: Date;
}