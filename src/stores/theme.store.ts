import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

// ============================================================
// TYPES
// ============================================================

export type ThemeMode = 'light' | 'dark' | 'system';
export type AccentColor = 'orange' | 'blue' | 'purple' | 'green' | 'red' | 'pink' | 'cyan';
export type FontSize = 'sm' | 'md' | 'lg';
export type ContentDensity = 'compact' | 'comfortable' | 'spacious';

export interface ThemeState {
  mode: ThemeMode;
  resolvedMode: 'light' | 'dark';
  accentColor: AccentColor;
  fontSize: FontSize;
  density: ContentDensity;
  reducedMotion: boolean;
  highContrast: boolean;
}

export interface ThemeActions {
  setMode: (mode: ThemeMode) => void;
  setResolvedMode: (mode: 'light' | 'dark') => void;
  setAccentColor: (color: AccentColor) => void;
  setFontSize: (size: FontSize) => void;
  setDensity: (density: ContentDensity) => void;
  setReducedMotion: (value: boolean) => void;
  setHighContrast: (value: boolean) => void;
  toggleMode: () => void;
  reset: () => void;
}

export type ThemeStore = ThemeState & ThemeActions;

// ============================================================
// DEFAULTS
// ============================================================

const DEFAULT_STATE: ThemeState = {
  mode: 'system',
  resolvedMode: 'dark',
  accentColor: 'orange',
  fontSize: 'md',
  density: 'comfortable',
  reducedMotion: false,
  highContrast: false,
};

// ============================================================
// ACCENT COLOR CSS VARIABLES MAP
// ============================================================

export const ACCENT_COLOR_MAP: Record<AccentColor, { primary: string; light: string; dark: string }> = {
  orange: { primary: '#FF4500', light: '#FF6534', dark: '#CC3700' },
  blue: { primary: '#0079D3', light: '#0095FF', dark: '#005FA3' },
  purple: { primary: '#7C3AED', light: '#9461FF', dark: '#5B21B6' },
  green: { primary: '#00BA7C', light: '#00D490', dark: '#008F5F' },
  red: { primary: '#E53E3E', light: '#FC5454', dark: '#C53030' },
  pink: { primary: '#EC4899', light: '#F472B6', dark: '#BE185D' },
  cyan: { primary: '#06B6D4', light: '#22D3EE', dark: '#0891B2' },
};

// ============================================================
// STORE
// ============================================================

export const useThemeStore = create<ThemeStore>()(
  persist(
    immer((set) => ({
      ...DEFAULT_STATE,

      setMode: (mode) =>
        set((state) => {
          state.mode = mode;
        }),

      setResolvedMode: (mode) =>
        set((state) => {
          state.resolvedMode = mode;
        }),

      setAccentColor: (color) =>
        set((state) => {
          state.accentColor = color;
        }),

      setFontSize: (size) =>
        set((state) => {
          state.fontSize = size;
        }),

      setDensity: (density) =>
        set((state) => {
          state.density = density;
        }),

      setReducedMotion: (value) =>
        set((state) => {
          state.reducedMotion = value;
        }),

      setHighContrast: (value) =>
        set((state) => {
          state.highContrast = value;
        }),

      toggleMode: () =>
        set((state) => {
          if (state.mode === 'light') {
            state.mode = 'dark';
            state.resolvedMode = 'dark';
          } else if (state.mode === 'dark') {
            state.mode = 'light';
            state.resolvedMode = 'light';
          } else {
            // system -> toggle to opposite of current resolved
            const newMode = state.resolvedMode === 'dark' ? 'light' : 'dark';
            state.mode = newMode;
            state.resolvedMode = newMode;
          }
        }),

      reset: () =>
        set((state) => {
          Object.assign(state, DEFAULT_STATE);
        }),
    })),
    {
      name: 'threadscape-theme',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        mode: state.mode,
        accentColor: state.accentColor,
        fontSize: state.fontSize,
        density: state.density,
        reducedMotion: state.reducedMotion,
        highContrast: state.highContrast,
      }),
    }
  )
);