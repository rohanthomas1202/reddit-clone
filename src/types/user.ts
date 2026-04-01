import type { Timestamps, SoftDelete, ID, HexColor, Nullable } from './index';

// ============================================================
// ENUMS (mirroring Prisma enums)
// ============================================================

export type UserRole = 'USER' | 'MOD' | 'ADMIN';

export type UserStatus = 'ACTIVE' | 'SUSPENDED' | 'BANNED' | 'DELETED';

export type NotificationFrequency = 'REALTIME' | 'DAILY' | 'WEEKLY' | 'NEVER';

// ============================================================
// CORE USER TYPES
// ============================================================

/** Minimal user info for display (e.g., in post author fields) */
export interface UserSnippet {
  id: ID;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  isVerified: boolean;
  karma: number;
}

/** Public user profile */
export interface UserProfile extends UserSnippet, Timestamps {
  bio: string | null;
  bannerUrl: string | null;
  website: string | null;
  location: string | null;
  role: UserRole;
  status: UserStatus;
  isNSFWEnabled: boolean;
  postKarma: number;
  commentKarma: number;
  awardKarma: number;
  isFriend: boolean;
  isBlocked: boolean;
  isFollowing: boolean;
  followerCount: number;
  followingCount: number;
  trophies: UserTrophy[];
  socialLinks: SocialLink[];
  pinnedPost: PinnedPost | null;
}

/** Full user object (for authenticated user's own data) */
export interface AuthUser extends Omit<UserProfile, 'isFriend' | 'isBlocked' | 'isFollowing'>, SoftDelete {
  email: string;
  emailVerified: boolean;
  twoFactorEnabled: boolean;
  preferences: UserPreferences;
  moderatingCommunities: ModeratingCommunity[];
  blockedUsers: UserSnippet[];
  savedPostIds: string[];
  hiddenPostIds: string[];
}

/** User preferences/settings */
export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  defaultFeed: 'home' | 'popular' | 'all';
  contentFilters: ContentFilter[];
  notificationSettings: NotificationSettings;
  privacySettings: PrivacySettings;
  displaySettings: DisplaySettings;
  emailSettings: EmailSettings;
}

export interface ContentFilter {
  type: 'nsfw' | 'spoiler' | 'community' | 'flair';
  value: string;
  enabled: boolean;
}

export interface NotificationSettings {
  upvotesOnPosts: boolean;
  upvotesOnComments: boolean;
  repliesToComments: boolean;
  newFollowers: boolean;
  communityUpdates: boolean;
  modMailMessages: boolean;
  mentionsInPosts: boolean;
  mentionsInComments: boolean;
  chatMessages: boolean;
  awards: boolean;
  frequency: NotificationFrequency;
}

export interface PrivacySettings {
  showOnlineStatus: boolean;
  allowFollowers: boolean;
  allowDirectMessages: 'everyone' | 'followers' | 'nobody';
  makeProfilePublic: boolean;
  showActiveCommunities: boolean;
  personalizeAds: boolean;
}

export interface DisplaySettings {
  useNewRedditLayout: boolean;
  expandPostsDefault: boolean;
  communityThemes: boolean;
  showFlairPosts: boolean;
  highlightNewComments: boolean;
  defaultCommentSort: 'best' | 'top' | 'new' | 'controversial' | 'old';
  postsPerPage: number;
}

export interface EmailSettings {
  digestEmails: boolean;
  unsubscribeAll: boolean;
  emailNotifications: boolean;
}

/** Trophy/achievement */
export interface UserTrophy {
  id: ID;
  name: string;
  description: string;
  iconUrl: string;
  awardedAt: Date;
}

/** Social link */
export interface SocialLink {
  platform: 'twitter' | 'instagram' | 'github' | 'linkedin' | 'twitch' | 'youtube' | 'website';
  url: string;
  displayText?: string;
}

/** Pinned post reference */
export interface PinnedPost {
  id: ID;
  title: string;
  communityName: string;
}

/** Community membership for moderating list */
export interface ModeratingCommunity {
  id: ID;
  name: string;
  displayName: string;
  iconUrl: string | null;
  memberCount: number;
  permissions: ModeratorPermission[];
}

export type ModeratorPermission =
  | 'ALL'
  | 'MANAGE_POSTS'
  | 'MANAGE_COMMENTS'
  | 'MANAGE_USERS'
  | 'MANAGE_SETTINGS'
  | 'MANAGE_FLAIR'
  | 'MANAGE_WIKI';

/** User karma breakdown */
export interface KarmaBreakdown {
  total: number;
  post: number;
  comment: number;
  award: number;
}

/** User overview stats */
export interface UserStats {
  totalPosts: number;
  totalComments: number;
  awardsGiven: number;
  awardsReceived: number;
  joinedCommunities: number;
  karma: KarmaBreakdown;
}

/** Friend/follow relationship */
export interface UserRelationship {
  userId: ID;
  targetUserId: ID;
  type: 'follow' | 'friend' | 'block';
  createdAt: Date;
}

/** Session user (minimal JWT data) */
export interface SessionUser {
  id: ID;
  username: string;
  email: string;
  avatarUrl: string | null;
  role: UserRole;
  karma: number;
  isVerified: boolean;
}

/** Award type */
export interface AwardType {
  id: ID;
  name: string;
  description: string;
  iconUrl: string;
  coinCost: number;
  karmaGiven: number;
  color: HexColor;
}

/** Award given to post/comment */
export interface Award {
  id: ID;
  type: AwardType;
  givenBy: UserSnippet | null; // null if anonymous
  givenAt: Date;
  message: Nullable<string>;
}

/** User community membership */
export interface CommunityMembership {
  communityId: ID;
  communityName: string;
  communityIcon: string | null;
  joinedAt: Date;
  isFavorite: boolean;
  isMuted: boolean;
  notificationLevel: 'all' | 'highlights' | 'none';
}