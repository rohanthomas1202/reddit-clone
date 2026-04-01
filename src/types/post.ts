import type { Timestamps, SoftDelete, ID, TimeRange, Nullable } from './index';
import type { UserSnippet, Award } from './user';
import type { CommunitySnippet, PostFlair, UserFlair, PostType } from './community';

// ============================================================
// ENUMS
// ============================================================

export type PostStatus = 'ACTIVE' | 'REMOVED' | 'DELETED' | 'SPAM' | 'LOCKED';

export type PostSortMode = 'hot' | 'new' | 'top' | 'rising' | 'controversial' | 'best';

// ============================================================
// MEDIA TYPES
// ============================================================

export interface PostMedia {
  id: ID;
  url: string;
  thumbnailUrl: string | null;
  width: number | null;
  height: number | null;
  mimeType: string;
  altText: string | null;
  order: number;
}

export interface LinkPreview {
  url: string;
  title: string | null;
  description: string | null;
  imageUrl: string | null;
  siteName: string | null;
  favicon: string | null;
  domain: string;
}

// ============================================================
// POLL TYPES
// ============================================================

export interface PollOption {
  id: ID;
  text: string;
  voteCount: number;
  percentage: number;
  isUserVote: boolean;
}

export interface Poll {
  id: ID;
  options: PollOption[];
  totalVotes: number;
  expiresAt: Date | null;
  isExpired: boolean;
  hasVoted: boolean;
  userVoteOptionId: ID | null;
}

// ============================================================
// CROSSPOST TYPES
// ============================================================

export interface CrosspostInfo {
  originalPostId: ID;
  originalPostTitle: string;
  originalCommunity: CommunitySnippet;
  originalAuthor: UserSnippet | null;
  crossposts: number;
}

// ============================================================
// CORE POST TYPES
// ============================================================

/** Minimal post info for embeds/references */
export interface PostSnippet {
  id: ID;
  title: string;
  communityName: string;
  score: number;
  commentCount: number;
  createdAt: Date;
}

/** Post card for feed display */
export interface PostCard extends Timestamps {
  id: ID;
  title: string;
  type: PostType;
  status: PostStatus;
  author: UserSnippet | null; // null if deleted
  community: CommunitySnippet;
  flair: PostFlair | null;
  userFlair: UserFlair | null;

  // Content (abbreviated for cards)
  body: string | null; // truncated
  bodyHtml: string | null; // truncated
  url: string | null;
  thumbnail: string | null;
  linkPreview: LinkPreview | null;
  media: PostMedia[];
  hasPoll: boolean;

  // Engagement
  score: number;
  upvoteCount: number;
  downvoteCount: number;
  commentCount: number;
  userVote: 1 | -1 | 0;
  isSaved: boolean;
  isHidden: boolean;

  // Awards
  awards: Award[];
  totalAwardCount: number;

  // Flags
  isNSFW: boolean;
  isSpoiler: boolean;
  isStickied: boolean;
  isLocked: boolean;
  isArchived: boolean;
  isOriginalContent: boolean;
  isCrosspost: boolean;
  crosspostInfo: CrosspostInfo | null;
  isEdited: boolean;
  editedAt: Date | null;

  // Mod info
  isRemoved: boolean;
  removalReason: string | null;
  distinguishType: 'moderator' | 'admin' | null;

  // Analytics
  viewCount: number;
  hotScore: number;
  trendingScore: number;
}

/** Full post detail */
export interface PostDetail extends Omit<PostCard, 'body' | 'bodyHtml'>, SoftDelete {
  body: string | null; // full body
  bodyHtml: string | null; // full HTML
  poll: Poll | null;
  outboundUrl: string | null;
  crosspostCount: number;
  shareUrl: string;
  suggestedSort: string | null;
  modNote: string | null;
  modNoteBy: UserSnippet | null;
}

/** Post creation input */
export interface CreatePostInput {
  title: string;
  type: PostType;
  communityName: string;
  body?: string;
  url?: string;
  flairId?: string;
  isNSFW?: boolean;
  isSpoiler?: boolean;
  isOriginalContent?: boolean;
  pollOptions?: string[];
  pollExpiresInDays?: number;
  mediaIds?: string[];
}

/** Post update input */
export interface UpdatePostInput {
  body?: string;
  flairId?: string | null;
  isNSFW?: boolean;
  isSpoiler?: boolean;
}

/** Vote result */
export interface VoteResult {
  score: number;
  upvoteCount: number;
  downvoteCount: number;
  userVote: 1 | -1 | 0;
  upvoteRatio: number;
}

/** Feed query params */
export interface FeedQueryParams {
  sort: PostSortMode;
  timeRange?: TimeRange;
  cursor?: string;
  limit?: number;
  communityName?: string;
  userId?: string;
  feedType?: 'home' | 'popular' | 'all' | 'community' | 'user';
}

/** Saved post */
export interface SavedPost {
  postId: ID;
  post: PostCard;
  savedAt: Date;
}

/** Post share info */
export interface PostShareInfo {
  url: string;
  title: string;
  text: string;
}

/** Pinned post */
export interface PinnedPostInfo {
  postId: ID;
  pinnedBy: UserSnippet;
  pinnedAt: Date;
  position: 1 | 2;
}

/** Post collection item */
export interface PostCollectionItem {
  post: PostCard;
  addedAt: Date;
  note: Nullable<string>;
}