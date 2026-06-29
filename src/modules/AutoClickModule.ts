// src/modules/AutoClickModule.ts
// TypeScript bridge to the Kotlin AutoClickModule native module
// All calls to native Android functionality go through here

import {NativeModules, Platform} from 'react-native';
import {NATIVE_MODULE_NAME, cpsToInterval} from '@constants/config';

// ─── Native Module Type Definition ────────────────────────
// Must match the methods exposed in AutoClickModule.kt exactly
interface AutoClickNativeModule {
  // Start clicking at the given screen position with the given interval
  startClicking: (x: number, y: number, intervalMs: number) => void;

  // Stop all clicking immediately
  stopClicking: () => void;

  // Check if the Accessibility Service is currently enabled
  isAccessibilityEnabled: () => Promise<boolean>;

  // Open the Accessibility Settings screen so user can enable the service
  openAccessibilitySettings: () => void;

  // Check if the Overlay (draw over other apps) permission is granted
  isOverlayPermissionGranted: () => Promise<boolean>;

  // Open the Overlay permission settings screen
  openOverlaySettings: () => void;

  // Show the floating bubble over other apps
  showFloatingBubble: (sizePx: number) => void;

  // Hide the floating bubble
  hideFloatingBubble: () => void;

  // Update the bubble size while it is visible
  updateBubbleSize: (sizePx: number) => void;
}

// ─── Module Access ────────────────────────────────────────
// Pull the native module from NativeModules by its registered name
const {AutoClickModule: NativeAutoClick} = NativeModules as {
  AutoClickModule: AutoClickNativeModule;
};

// Guard: warn clearly if the native module is missing
// This happens if the Kotlin side is not linked or built yet
if (!NativeAutoClick && Platform.OS === 'android') {
  console.error(
    'Kurikku: AutoClickModule native module not found. ' +
    'Make sure the Kotlin module is registered in MainApplication.kt ' +
    'and the app has been rebuilt.',
  );
}

// ─── Exported Bridge Functions ────────────────────────────

/**
 * Start the auto clicker at a specific screen coordinate.
 * Converts CPS to millisecond interval before calling native.
 */
export const startClicking = (
  x: number,
  y: number,
  cps: number,
): void => {
  const intervalMs = cpsToInterval(cps);
  NativeAutoClick?.startClicking(x, y, intervalMs);
};

/**
 * Stop the auto clicker immediately.
 */
export const stopClicking = (): void => {
  NativeAutoClick?.stopClicking();
};

/**
 * Returns true if the Kurikku Accessibility Service is enabled.
 */
export const isAccessibilityEnabled = (): Promise<boolean> => {
  return NativeAutoClick?.isAccessibilityEnabled() ?? Promise.resolve(false);
};

/**
 * Opens Android Accessibility Settings so the user can
 * manually enable the Kurikku Accessibility Service.
 */
export const openAccessibilitySettings = (): void => {
  NativeAutoClick?.openAccessibilitySettings();
};

/**
 * Returns true if the overlay (draw over other apps) permission is granted.
 */
export const isOverlayPermissionGranted = (): Promise<boolean> => {
  return NativeAutoClick?.isOverlayPermissionGranted() ?? Promise.resolve(false);
};

/**
 * Opens Android overlay permission settings for this app.
 */
export const openOverlaySettings = (): void => {
  NativeAutoClick?.openOverlaySettings();
};

/**
 * Show the floating bubble with the given size in pixels.
 */
export const showFloatingBubble = (sizePx: number): void => {
  NativeAutoClick?.showFloatingBubble(sizePx);
};

/**
 * Hide the floating bubble.
 */
export const hideFloatingBubble = (): void => {
  NativeAutoClick?.hideFloatingBubble();
};

/**
 * Update bubble size while it is already visible.
 */
export const updateBubbleSize = (sizePx: number): void => {
  NativeAutoClick?.updateBubbleSize(sizePx);
};