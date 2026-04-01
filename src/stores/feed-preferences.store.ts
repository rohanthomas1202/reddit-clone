import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { PostSortMode } from '@/types/post';
import type { FeedType } from '@/types/feed';

// ============================================================
// TYPES
// ============================================================

export type FeedLayout = 'card' | 'compact' | 'list';
export type MediaPreference = 'always' | 'hover' | 'never';
export type TimeRange = 'hour' | 'day' | 'week' | 'month' | 'year' | 'all';

export interface FeedPreferencesState {
  layout: FeedLayout;
  defaultSort: PostSortMode;
  defaultTimeRange: TimeRange;
  showNSFW: boolean;
  blurNSFW: boolean;
  showSpoilers: boolean;
  blurSpoilers: boolean;
  autoplayVideos: boolean;
  mediaPreference: MediaPreference;
  showFlairs: boolean;
  showAwards: boolean;
  showUpvoteRatio: boolean;
  communityDefaults: Partial<Record<string, { sort: PostSortMode; layout: FeedLayout }>>;
  hiddenPostIds: string[];
  pinnedCommunities: string[];
  feedTypePreferences: Partial<Record<FeedType, { sort: PostSortMode }>>;
  postsPerPage: number;
  infiniteScroll: boolean;
  rememberScrollPosition: boolean;
}

export interface FeedPreferencesActions {
  setLayout: (layout: FeedLayout) => void;
  setDefaultSort: (sort: PostSortMode) => void;
  setDefaultTimeRange: (range: TimeRange) => void;
  setShowNSFW: (value: boolean) => void;
  setBlurNSFW: (value: boolean) => void;
  setShowSpoilers: (value: boolean) => void;
  setBlurSpoilers: (value: boolean) => void;
  setAutoplayVideos: (value: boolean) => void;
  setMediaPreference: (pref: MediaPreference) => void;
  setShowFlairs: (value: boolean) => void;
  setShowAwards: (value: boolean) => void;
  setShowUpvoteRatio: (value: boolean) => void;
  setCommunityDefault: (communityId: string, prefs: { sort: PostSortMode; layout: FeedLayout }) => void;
  removeCommunityDefault: (communityId: string) => void;
  hidePost: (postId: string) => void;
  unhidePost: (postId: string) => void;
  clearHiddenPosts: () => void;
  pinCommunity: (communityId: string) => void;
  unpinCommunity: (communityId: string) => void;
  setFeedTypePreference: (feedType: FeedType, prefs: { sort: PostSortMode }) => void;
  setPostsPerPage: (count: number) => void;
  setInfiniteScroll: (value: boolean) => void;
  setRememberScrollPosition: (value: boolean) => void;
  reset: () => void;
}

export type FeedPreferencesStore = FeedPreferencesState & FeedPreferencesActions;

// ============================================================
// DEFAULTS
// ============================================================

const DEFAULT_STATE: FeedPreferencesState = {
  layout: 'card',
  defaultSort: 'hot',
  defaultTimeRange: 'day',
  showNSFW: false,
  blurNSFW: true,
  showSpoilers: true,
  blurSpoilers: true,
  autoplayVideos: false,
  mediaPreference: 'always',
  showFlairs: true,
  showAwards: true,
  showUpvoteRatio: true,
  communityDefaults: {},
  hiddenPostIds: [],
  pinnedCommunities: [],
  feedTypePreferences: {},
  postsPerPage: 25,
  infiniteScroll: true,
  rememberScrollPosition: true,
};

// ============================================================
// STORE
// ============================================================

export const useFeedPreferencesStore = create<FeedPreferencesStore>()(
  persist(
    immer((set) => ({
      ...DEFAULT_STATE,

      setLayout: (layout) =>
        set((state) => {
          state.layout = layout;
        }),

      setDefaultSort: (sort) =>
        set((state) => {
          state.defaultSort = sort;
        }),

      setDefaultTimeRange: (range) =>
        set((state) => {
          state.defaultTimeRange = range;
        }),

      setShowNSFW: (value) =>
        set((state) => {
          state.showNSFW = value;
        }),

      setBlurNSFW: (value) =>
        set((state) => {
          state.blurNSFW = value;
        }),

      setShowSpoilers: (value) =>
        set((state) => {
          state.showSpoilers = value;
        }),

      setBlurSpoilers: (value) =>
        set((state) => {
          state.blurSpoilers = value;
        }),

      setAutoplayVideos: (value) =>
        set((state) => {
          state.autoplayVideos = value;
        }),

      setMediaPreference: (pref) =>
        set((state) => {
          state.mediaPreference = pref;
        }),

      setShowFlairs: (value) =>
        set((state) => {
          state.showFlairs = value;
        }),

      setShowAwards: (value) =>
        set((state) => {
          state.showAwards = value;
        }),

      setShowUpvoteRatio: (value) =>
        set((state) => {
          state.showUpvoteRatio = value;
        }),

      setCommunityDefault: (communityId, prefs) =>
        set((state) => {
          state.communityDefaults[communityId] = prefs;
        }),

      removeCommunityDefault: (communityId) =>
        set((state) => {
          delete state.communityDefaults[communityId];
        }),

      hidePost: (postId) =>
        set((state) => {
          if (!state.hiddenPostIds.includes(postId)) {
            state.hiddenPostIds.push(postId);
            // Cap at 1000 to avoid unbounded growth
            if (state.hiddenPostIds.length > 1000) {
              state.hiddenPostIds = state.hiddenPostIds.slice(-1000);
            }
          }
        }),

      unhidePost: (postId) =>
        set((state) => {
          state.hiddenPostIds = state.hiddenPostIds.filter((id) => id !== postId);
        }),

      clearHiddenPosts: () =>
        set((state) => {
          state.hiddenPostIds = [];
        }),

      pinCommunity: (communityId) =>
        set((state) => {
          if (!state.pinnedCommunities.includes(communityId)) {
            state.pinnedCommunities.unshift(communityId);
            // Cap at 10 pinned communities
            state.pinnedCommunities = state.pinnedCommunities.slice(0, 10);
          }
        }),

      unpinCommunity: (communityId) =>
        set((state) => {
          state.pinnedCommunities = state.pinnedCommunities.filter((id) => id !== communityId);
        }),

      setFeedTypePreference: (feedType, prefs) =>
        set((state) => {
          state.feedTypePreferences[feedType] = prefs;
        }),

      setPostsPerPage: (count) =>
        set((state) => {
          state.postsPerPage = Math.max(5, Math.min(100, count));
        }),

      setInfiniteScroll: (value) =>
        set((state) => {
          state.infiniteScroll = value;
        }),

      setRememberScrollPosition: (value) =>
        set((state) => {
          state.rememberScrollPosition = value;
        }),

      reset: () =>
        set((state) => {
          Object.assign(state, DEFAULT_STATE);
        }),
    })),
    {
      name: 'threadscape-feed-prefs',
      storage: createJSONStorage(() => localStorage),
    }
  )
);