// src/store/clickerStore.ts
// Global state management using Zustand
// Holds all runtime state for the auto clicker

import {create} from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  CPS_DEFAULT,
  BUBBLE_SIZE_DEFAULT,
  CLICK_POINT_DEFAULT_X,
  CLICK_POINT_DEFAULT_Y,
  STORAGE_KEY_CPS,
  STORAGE_KEY_BUBBLE_SIZE,
  STORAGE_KEY_CLICK_X,
  STORAGE_KEY_CLICK_Y,
  BubbleSize,
} from '@constants/config';

// ─── State Shape ──────────────────────────────────────────
interface ClickerState {
  // Current clicks per second value
  cps: number;

  // Whether the auto clicker is actively running
  isRunning: boolean;

  // Selected bubble size
  bubbleSize: BubbleSize;

  // Click point position on screen (in pixels)
  clickX: number;
  clickY: number;

  // Whether settings have been loaded from storage
  isLoaded: boolean;

  // ─── Actions ────────────────────────────────────────────
  setCps: (cps: number) => void;
  setIsRunning: (running: boolean) => void;
  setBubbleSize: (size: BubbleSize) => void;
  setClickPoint: (x: number, y: number) => void;

  // Load persisted settings from AsyncStorage
  loadSettings: () => Promise<void>;
}

// ─── Store ────────────────────────────────────────────────
export const useClickerStore = create<ClickerState>((set) => ({
  // Default values used before storage is loaded
  cps: CPS_DEFAULT,
  isRunning: false,
  bubbleSize: BUBBLE_SIZE_DEFAULT,
  clickX: CLICK_POINT_DEFAULT_X,
  clickY: CLICK_POINT_DEFAULT_Y,
  isLoaded: false,

  // Update CPS and persist to storage
  setCps: async (cps: number) => {
    set({cps});
    await AsyncStorage.setItem(STORAGE_KEY_CPS, String(cps));
  },

  // Update running state (no persistence needed — resets on app restart)
  setIsRunning: (running: boolean) => {
    set({isRunning: running});
  },

  // Update bubble size and persist to storage
  setBubbleSize: async (size: BubbleSize) => {
    set({bubbleSize: size});
    await AsyncStorage.setItem(STORAGE_KEY_BUBBLE_SIZE, size);
  },

  // Update click point position and persist to storage
  setClickPoint: async (x: number, y: number) => {
    set({clickX: x, clickY: y});
    await AsyncStorage.setItem(STORAGE_KEY_CLICK_X, String(x));
    await AsyncStorage.setItem(STORAGE_KEY_CLICK_Y, String(y));
  },

  // Load all persisted settings from AsyncStorage on app start
  loadSettings: async () => {
    try {
      const [cpsRaw, sizeRaw, xRaw, yRaw] = await AsyncStorage.multiGet([
        STORAGE_KEY_CPS,
        STORAGE_KEY_BUBBLE_SIZE,
        STORAGE_KEY_CLICK_X,
        STORAGE_KEY_CLICK_Y,
      ]);

      // Parse each value with fallback to defaults
      const cps = cpsRaw[1] ? parseInt(cpsRaw[1], 10) : CPS_DEFAULT;
      const bubbleSize = (sizeRaw[1] as BubbleSize) ?? BUBBLE_SIZE_DEFAULT;
      const clickX = xRaw[1] ? parseInt(xRaw[1], 10) : CLICK_POINT_DEFAULT_X;
      const clickY = yRaw[1] ? parseInt(yRaw[1], 10) : CLICK_POINT_DEFAULT_Y;

      set({cps, bubbleSize, clickX, clickY, isLoaded: true});
    } catch (error) {
      // If storage fails, continue with defaults
      console.warn('Kurikku: Failed to load settings:', error);
      set({isLoaded: true});
    }
  },
}));