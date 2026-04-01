import type { ID, TimeRange } from './index';
import type { PostCard, PostSortMode, FeedQueryParams } from './post';
import type { CommunityCard, TrendingCommunity } from './community';
import type { UserSnippet } from './user';

// ============================================================
// FEED TYPES
// ============================================================

export type FeedType = 'home' | 'popular' | 'all' | 'community' | 'user' | 'saved' | 'hidden' | 'search';

export type FeedItemType = 'post' | 'community_highlight' | 'ad' | 'trending_banner';

/** Base feed item */
interface FeedItemBase {
  id: string;
  type: FeedItemType;
  position: number;
}

/** Post feed item */
export interface PostFeedItem extends FeedItemBase {
  type: 'post';
  data: PostCard;
}

/** Community highlight in feed */
export interface CommunityFeedItem extends FeedItemBase {
  type: 'community_highlight';
  data: CommunityCard;
}

/** Trending banner in feed */
export interface TrendingBannerItem extends FeedItemBase {
  type: 'trending_banner';
  data: {
    title: string;
    communities: TrendingCommunity[];
  };
}

/** Union feed item */
export type FeedItem = PostFeedItem | CommunityFeedItem | TrendingBannerItem;

/** Feed page data */
export interface FeedPage {
  items: FeedItem[];
  nextCursor: string | null;
  hasMore: boolean;
  total?: number;
  seenIds: string[];
}

/** Feed state for TanStack Query */
export interface FeedState {
  pages: FeedPage[];
  params: FeedQueryParams;
  isFetching: boolean;
  isFetchingNextPage: boolean;
  hasNextPage: boolean;
  error: Error | null;
}

/** Hot feed item (cached in Redis) */
export interface HotFeedItem {
  postId: ID;
  score: number;
  communityId: ID;
  cachedAt: number; // unix timestamp
}

/** Trending topic */
export interface TrendingTopic {
  id: ID;
  title: string;
  description: string | null;
  imageUrl: string | null;
  postCount: number;
  commentCount: number;
  communities: CommunityCard[];
  timeRange: TimeRange;
}

/** Feed sidebar data */
export interface FeedSidebar {
  type: FeedType;
  communityInfo?: CommunityCard;
  rules?: Array<{ title: string; description: string | null }>;
  moderators?: UserSnippet[];
  relatedCommunities?: CommunityCard[];
  trendingPosts?: PostCard[];
  premiumPromo?: boolean;
}

/** Scroll position state */
export interface ScrollState {
  postId: ID;
  scrollY: number;
  savedAt: number;
}

/** Feed filter options */
export interface FeedFilterOptions {
  sort: PostSortMode;
  timeRange: TimeRange;
  showNSFW: boolean;
  showSpoilers: boolean;
  filterFlairs: string[];
  filterCommunities: string[];
}

/** Feed layout preference */
export type FeedLayout = 'card' | 'compact' | 'list';

/** Announcement/sticky post in feed */
export interface FeedAnnouncement {
  id: ID;
  title: string;
  body: string;
  url: string | null;
  communityName: string | null;
  expiresAt: Date | null;
  type: 'info' | 'warning' | 'announcement';
}