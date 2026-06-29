// src/constants/config.ts
// All app-wide constants in one place
// Import from here instead of hardcoding values anywhere else

// ─── CPS (Clicks Per Second) ──────────────────────────────
export const CPS_MIN = 1;
export const CPS_MAX = 100;
export const CPS_DEFAULT = 5;

// Quick-select CPS preset values shown as buttons
export const CPS_PRESETS = [1, 5, 10, 25, 50, 100] as const;

// Converts CPS to millisecond interval between clicks
// Example: 5 CPS → 200ms interval
export const cpsToInterval = (cps: number): number => {
  return Math.floor(1000 / cps);
};

// ─── Bubble Size ──────────────────────────────────────────
export type BubbleSize = 'small' | 'medium' | 'large';

// Pixel dimensions for each bubble size option
export const BUBBLE_SIZES: Record<BubbleSize, number> = {
  small: 48,
  medium: 64,
  large: 80,
};

export const BUBBLE_SIZE_DEFAULT: BubbleSize = 'medium';

// ─── Click Point ──────────────────────────────────────────
// Default position of the click point marker on screen
export const CLICK_POINT_DEFAULT_X = 200;
export const CLICK_POINT_DEFAULT_Y = 400;

// ─── Storage Keys ─────────────────────────────────────────
// AsyncStorage keys for persisting user settings
export const STORAGE_KEY_CPS = '@kurikku_cps';
export const STORAGE_KEY_BUBBLE_SIZE = '@kurikku_bubble_size';
export const STORAGE_KEY_CLICK_X = '@kurikku_click_x';
export const STORAGE_KEY_CLICK_Y = '@kurikku_click_y';

// ─── Native Module ────────────────────────────────────────
// Must match the name registered in AutoClickModule.kt
export const NATIVE_MODULE_NAME = 'AutoClickModule';

// ─── Accessibility ────────────────────────────────────────
// Package name used to deep-link into Accessibility Settings
export const APP_PACKAGE = 'com.kurikku';