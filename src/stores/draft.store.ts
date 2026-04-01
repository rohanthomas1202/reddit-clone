import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

// ============================================================
// TYPES
// ============================================================

export type DraftType = 'post' | 'comment' | 'message';
export type PostDraftType = 'text' | 'link' | 'image' | 'video';

export interface PostDraft {
  id: string;
  type: 'post';
  postType: PostDraftType;
  title: string;
  body: string;
  bodyJson?: unknown;
  url?: string;
  communityId?: string;
  communityName?: string;
  flairId?: string;
  tags: string[];
  isNSFW: boolean;
  isSpoiler: boolean;
  imageUrls: string[];
  savedAt: number;
  editingPostId?: string;
}

export interface CommentDraft {
  id: string;
  type: 'comment';
  body: string;
  bodyJson?: unknown;
  postId: string;
  parentCommentId?: string;
  savedAt: number;
  editingCommentId?: string;
}

export interface MessageDraft {
  id: string;
  type: 'message';
  body: string;
  recipientId?: string;
  recipientUsername?: string;
  conversationId?: string;
  savedAt: number;
}

export type Draft = PostDraft | CommentDraft | MessageDraft;

export interface DraftState {
  postDraft: PostDraft | null;
  commentDrafts: Record<string, CommentDraft>; // keyed by postId + parentCommentId
  messageDrafts: Record<string, MessageDraft>; // keyed by conversationId
  lastSaved: number | null;
  isDirty: boolean;
}

export interface DraftActions {
  // Post draft
  setPostDraft: (draft: Partial<PostDraft>) => void;
  clearPostDraft: () => void;
  initPostDraft: (communityId?: string, communityName?: string, postType?: PostDraftType) => void;

  // Comment drafts
  setCommentDraft: (key: string, draft: Partial<CommentDraft>) => void;
  clearCommentDraft: (key: string) => void;
  getCommentDraftKey: (postId: string, parentCommentId?: string) => string;

  // Message drafts
  setMessageDraft: (conversationId: string, draft: Partial<MessageDraft>) => void;
  clearMessageDraft: (conversationId: string) => void;

  // Meta
  markSaved: () => void;
  setDirty: (value: boolean) => void;
  clearAll: () => void;
}

export type DraftStore = DraftState & DraftActions;

// ============================================================
// HELPERS
// ============================================================

let _draftCounter = 0;
function generateDraftId(prefix: string): string {
  return `${prefix}-${Date.now()}-${++_draftCounter}`;
}

function createEmptyPostDraft(
  communityId?: string,
  communityName?: string,
  postType: PostDraftType = 'text'
): PostDraft {
  return {
    id: generateDraftId('post'),
    type: 'post',
    postType,
    title: '',
    body: '',
    bodyJson: undefined,
    url: '',
    communityId,
    communityName,
    flairId: undefined,
    tags: [],
    isNSFW: false,
    isSpoiler: false,
    imageUrls: [],
    savedAt: Date.now(),
  };
}

// ============================================================
// DEFAULTS
// ============================================================

const DEFAULT_STATE: DraftState = {
  postDraft: null,
  commentDrafts: {},
  messageDrafts: {},
  lastSaved: null,
  isDirty: false,
};

// ============================================================
// STORE
// ============================================================

export const useDraftStore = create<DraftStore>()(
  persist(
    immer((set, get) => ({
      ...DEFAULT_STATE,

      setPostDraft: (draft) =>
        set((state) => {
          if (state.postDraft) {
            Object.assign(state.postDraft, draft, { savedAt: Date.now() });
          } else {
            state.postDraft = { ...createEmptyPostDraft(), ...draft };
          }
          state.isDirty = true;
        }),

      clearPostDraft: () =>
        set((state) => {
          state.postDraft = null;
          state.isDirty = false;
        }),

      initPostDraft: (communityId, communityName, postType) =>
        set((state) => {
          state.postDraft = createEmptyPostDraft(communityId, communityName, postType);
          state.isDirty = false;
        }),

      setCommentDraft: (key, draft) =>
        set((state) => {
          const existing = state.commentDrafts[key];
          if (existing) {
            Object.assign(existing, draft, { savedAt: Date.now() });
          } else {
            state.commentDrafts[key] = {
              id: generateDraftId('comment'),
              type: 'comment',
              body: '',
              postId: '',
              savedAt: Date.now(),
              ...draft,
            };
          }
          state.isDirty = true;
        }),

      clearCommentDraft: (key) =>
        set((state) => {
          delete state.commentDrafts[key];
        }),

      getCommentDraftKey: (postId, parentCommentId) =>
        parentCommentId ? `${postId}:${parentCommentId}` : postId,

      setMessageDraft: (conversationId, draft) =>
        set((state) => {
          const existing = state.messageDrafts[conversationId];
          if (existing) {
            Object.assign(existing, draft, { savedAt: Date.now() });
          } else {
            state.messageDrafts[conversationId] = {
              id: generateDraftId('message'),
              type: 'message',
              body: '',
              conversationId,
              savedAt: Date.now(),
              ...draft,
            };
          }
          state.isDirty = true;
        }),

      clearMessageDraft: (conversationId) =>
        set((state) => {
          delete state.messageDrafts[conversationId];
        }),

      markSaved: () =>
        set((state) => {
          state.lastSaved = Date.now();
          state.isDirty = false;
        }),

      setDirty: (value) =>
        set((state) => {
          state.isDirty = value;
        }),

      clearAll: () =>
        set((state) => {
          state.postDraft = null;
          state.commentDrafts = {};
          state.messageDrafts = {};
          state.lastSaved = null;
          state.isDirty = false;
        }),
    })),
    {
      name: 'threadscape-drafts',
      storage: createJSONStorage(() => localStorage),
      // Avoid persisting large bodyJson objects that could bloat localStorage
      partialize: (state) => ({
        postDraft: state.postDraft
          ? { ...state.postDraft, bodyJson: undefined }
          : null,
        commentDrafts: Object.fromEntries(
          Object.entries(state.commentDrafts).map(([k, v]) => [
            k,
            { ...v, bodyJson: undefined },
          ])
        ),
        messageDrafts: state.messageDrafts,
        lastSaved: state.lastSaved,
        isDirty: state.isDirty,
      }),
    }
  )
);