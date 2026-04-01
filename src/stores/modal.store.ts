import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

// ============================================================
// TYPES
// ============================================================

export type ModalType =
  | 'auth'
  | 'create-post'
  | 'create-community'
  | 'edit-post'
  | 'edit-comment'
  | 'delete-confirm'
  | 'report'
  | 'share'
  | 'award'
  | 'image-viewer'
  | 'search'
  | 'user-profile'
  | 'community-settings'
  | 'mod-action'
  | 'invite-moderator'
  | 'post-flair'
  | 'user-flair'
  | 'keyboard-shortcuts'
  | 'notifications'
  | 'settings';

export interface ModalConfig {
  id: string;
  type: ModalType;
  props?: Record<string, unknown>;
  onClose?: () => void;
  onConfirm?: (data?: unknown) => void | Promise<void>;
  closable?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

export interface ModalState {
  stack: ModalConfig[];
  isAnimating: boolean;
}

export interface ModalActions {
  open: (config: Omit<ModalConfig, 'id'> & { id?: string }) => string;
  close: (id?: string) => void;
  closeAll: () => void;
  replace: (config: Omit<ModalConfig, 'id'> & { id?: string }) => string;
  setAnimating: (value: boolean) => void;
  updateProps: (id: string, props: Record<string, unknown>) => void;
}

export type ModalStore = ModalState & ModalActions;

// ============================================================
// HELPERS
// ============================================================

let _idCounter = 0;
function generateModalId(): string {
  return `modal-${Date.now()}-${++_idCounter}`;
}

// ============================================================
// STORE
// ============================================================

export const useModalStore = create<ModalStore>()(
  immer((set, get) => ({
    stack: [],
    isAnimating: false,

    open: (config) => {
      const id = config.id ?? generateModalId();
      const modal: ModalConfig = {
        closable: true,
        size: 'md',
        ...config,
        id,
      };
      set((state) => {
        state.stack.push(modal);
      });
      return id;
    },

    close: (id) => {
      set((state) => {
        if (id) {
          const idx = state.stack.findIndex((m) => m.id === id);
          if (idx !== -1) {
            const modal = state.stack[idx];
            modal?.onClose?.();
            state.stack.splice(idx, 1);
          }
        } else {
          // Close topmost
          const top = state.stack[state.stack.length - 1];
          if (top) {
            top.onClose?.();
            state.stack.pop();
          }
        }
      });
    },

    closeAll: () => {
      set((state) => {
        state.stack.forEach((m) => m.onClose?.());
        state.stack = [];
      });
    },

    replace: (config) => {
      const id = config.id ?? generateModalId();
      const modal: ModalConfig = {
        closable: true,
        size: 'md',
        ...config,
        id,
      };
      set((state) => {
        const top = state.stack[state.stack.length - 1];
        top?.onClose?.();
        if (state.stack.length > 0) {
          state.stack[state.stack.length - 1] = modal;
        } else {
          state.stack.push(modal);
        }
      });
      return id;
    },

    setAnimating: (value) => {
      set((state) => {
        state.isAnimating = value;
      });
    },

    updateProps: (id, props) => {
      set((state) => {
        const modal = state.stack.find((m) => m.id === id);
        if (modal) {
          modal.props = { ...modal.props, ...props };
        }
      });
    },
  }))
);

// ============================================================
// CONVENIENCE SELECTORS
// ============================================================

export const useActiveModal = () =>
  useModalStore((state) => state.stack[state.stack.length - 1] ?? null);

export const useModalById = (id: string) =>
  useModalStore((state) => state.stack.find((m) => m.id === id) ?? null);

export const useIsModalOpen = (type?: ModalType) =>
  useModalStore((state) =>
    type ? state.stack.some((m) => m.type === type) : state.stack.length > 0
  );