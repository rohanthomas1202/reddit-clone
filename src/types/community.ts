import type { Timestamps, SoftDelete, ID, HexColor, Visibility, Nullable } from './index';
import type { UserSnippet, ModeratorPermission } from './user';

// ============================================================
// ENUMS
// ============================================================

export type CommunityType = 'PUBLIC' | 'PRIVATE' | 'RESTRICTED';

export type CommunityStatus = 'ACTIVE' | 'RESTRICTED' | 'BANNED' | 'QUARANTINED';

export type PostType = 'TEXT' | 'LINK' | 'IMAGE' | 'VIDEO' | 'POLL';

// ============================================================
// COMMUNITY TYPES
// ============================================================

/** Minimal community info for display */
export interface CommunitySnippet {
  id: ID;
  name: string;
  displayName: string;
  iconUrl: string | null;
  bannerUrl: string | null;
  memberCount: number;
  isNSFW: boolean;
  primaryColor: HexColor | null;
}

/** Community listing card */
export interface CommunityCard extends CommunitySnippet, Timestamps {
  description: string | null;
  onlineCount: number;
  isJoined: boolean;
  isFavorite: boolean;
  isMuted: boolean;
  type: CommunityType;
  status: CommunityStatus;
  tags: string[];
  category: string | null;
}

/** Full community details */
export interface CommunityDetail extends CommunityCard, SoftDelete {
  longDescription: string | null;
  rules: CommunityRule[];
  flairs: PostFlair[];
  moderators: CommunityModerator[];
  wikis: WikiPage[];
  customization: CommunityCustomization;
  stats: CommunityStats;
  allowedPostTypes: PostType[];
  requirePostFlair: boolean;
  isPostsLocked: boolean;
  isCommentsLocked: boolean;
  isSpoilerTagRequired: boolean;
  minAccountAgeToPost: number | null;
  minKarmaToPost: number | null;
  relatedCommunities: CommunitySnippet[];
}

/** Community rule */
export interface CommunityRule {
  id: ID;
  communityId: ID;
  order: number;
  title: string;
  description: string | null;
  reportReason: string | null;
  appliesTo: 'posts' | 'comments' | 'both';
  createdAt: Date;
}

/** Post flair */
export interface PostFlair {
  id: ID;
  communityId: ID;
  name: string;
  color: HexColor | null;
  backgroundColor: HexColor | null;
  textColor: 'light' | 'dark';
  emoji: string | null;
  cssClass: string | null;
  allowUserAssignment: boolean;
  isModOnly: boolean;
  order: number;
}

/** User flair (inside community) */
export interface UserFlair {
  id: ID;
  communityId: ID;
  userId: ID;
  text: string;
  emoji: string | null;
  backgroundColor: HexColor | null;
  textColor: 'light' | 'dark';
}

/** Community moderator */
export interface CommunityModerator {
  user: UserSnippet;
  permissions: ModeratorPermission[];
  addedAt: Date;
  addedBy: UserSnippet | null;
  isFounder: boolean;
  modNote: string | null;
}

/** Wiki page */
export interface WikiPage {
  id: ID;
  communityId: ID;
  slug: string;
  title: string;
  content: string;
  editedAt: Date;
  editedBy: UserSnippet | null;
  revision: number;
  visibility: Visibility;
}

/** Community customization */
export interface CommunityCustomization {
  primaryColor: HexColor | null;
  keyColor: HexColor | null;
  bannerHeight: 'short' | 'medium' | 'tall';
  bannerBackgroundColor: HexColor | null;
  bannerBackgroundImageUrl: string | null;
  mobileBannerImageUrl: string | null;
  iconImageUrl: string | null;
  communityIcon: string | null;
  stylesheet: string | null;
  headerTitle: string | null;
  welcomeMessage: string | null;
  submitText: string | null;
}

/** Community stats */
export interface CommunityStats {
  memberCount: number;
  onlineCount: number;
  postsToday: number;
  postsPerDay: number;
  commentsPerDay: number;
  rankBySize: number | null;
  createdAt: Date;
}

/** Community creation payload */
export interface CreateCommunityInput {
  name: string;
  displayName: string;
  description: string;
  type: CommunityType;
  isNSFW: boolean;
  primaryColor?: HexColor;
}

/** Community update payload */
export interface UpdateCommunityInput {
  displayName?: string;
  description?: string;
  longDescription?: string;
  type?: CommunityType;
  isNSFW?: boolean;
  allowedPostTypes?: PostType[];
  requirePostFlair?: boolean;
  isPostsLocked?: boolean;
  isCommentsLocked?: boolean;
  minAccountAgeToPost?: number | null;
  minKarmaToPost?: number | null;
}

/** Banned user in community */
export interface CommunityBan {
  id: ID;
  userId: ID;
  user: UserSnippet;
  communityId: ID;
  bannedBy: UserSnippet;
  reason: string;
  note: string | null;
  bannedAt: Date;
  expiresAt: Date | null;
  isPermanent: boolean;
}

/** Community join result */
export interface JoinCommunityResult {
  joined: boolean;
  memberCount: number;
  requiresApproval: boolean;
  isPendingApproval: boolean;
}

/** Trending community */
export interface TrendingCommunity extends CommunitySnippet {
  growthPercent: number;
  newMembersToday: number;
  topPost: Nullable<{
    id: ID;
    title: string;
    score: number;
  }>;
}