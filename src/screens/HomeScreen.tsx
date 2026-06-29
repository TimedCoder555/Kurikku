// src/screens/HomeScreen.tsx
// Main screen of Kurikku
// Shows permissions, CPS slider, bubble size, start/stop controls

import React, {useEffect, useState, useCallback} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  StatusBar,
  AppState,
  AppStateStatus,
  Alert,
} from 'react-native';
import {useClickerStore} from '@store/clickerStore';
import {BUBBLE_SIZES} from '@constants/config';
import * as AutoClick from '@modules/AutoClickModule';
import PermissionButton from '@components/PermissionButton';
import CPSSlider from '@components/CPSSlider';
import BubbleSizeSelector from '@components/BubbleSizeSelector';

// ─── Component ────────────────────────────────────────────
const HomeScreen: React.FC = () => {
  // Pull state and actions from Zustand store
  const {
    cps,
    isRunning,
    bubbleSize,
    clickX,
    clickY,
    isLoaded,
    setCps,
    setIsRunning,
    setBubbleSize,
    loadSettings,
  } = useClickerStore();

  // Local permission states — re-checked whenever app comes to foreground
  const [overlayGranted, setOverlayGranted] = useState(false);
  const [accessibilityGranted, setAccessibilityGranted] = useState(false);

  // ─── Check permissions ──────────────────────────────────
  const checkPermissions = useCallback(async () => {
    const [overlay, accessibility] = await Promise.all([
      AutoClick.isOverlayPermissionGranted(),
      AutoClick.isAccessibilityEnabled(),
    ]);
    setOverlayGranted(overlay);
    setAccessibilityGranted(accessibility);
  }, []);

  // ─── On mount ───────────────────────────────────────────
  useEffect(() => {
    // Load persisted settings from AsyncStorage
    loadSettings();
    // Check current permission states
    checkPermissions();
  }, [loadSettings, checkPermissions]);

  // Re-check permissions when user returns from Settings
  useEffect(() => {
    const subscription = AppState.addEventListener(
      'change',
      (nextState: AppStateStatus) => {
        if (nextState === 'active') {
          checkPermissions();
        }
      },
    );
    return () => subscription.remove();
  }, [checkPermissions]);

  // ─── Start clicking ─────────────────────────────────────
  const handleStart = useCallback(() => {
    // Both permissions must be granted before starting
    if (!overlayGranted || !accessibilityGranted) {
      Alert.alert(
        'Permissions Required',
        'Please grant both Overlay and Accessibility permissions before starting.',
        [{text: 'OK'}],
      );
      return;
    }

    AutoClick.startClicking(clickX, clickY, cps);
    setIsRunning(true);

    // Show floating bubble when clicking starts
    AutoClick.showFloatingBubble(BUBBLE_SIZES[bubbleSize]);
  }, [
    overlayGranted,
    accessibilityGranted,
    clickX,
    clickY,
    cps,
    bubbleSize,
    setIsRunning,
  ]);

  // ─── Stop clicking ──────────────────────────────────────
  const handleStop = useCallback(() => {
    AutoClick.stopClicking();
    setIsRunning(false);
  }, [setIsRunning]);

  // ─── Bubble size change ─────────────────────────────────
  const handleBubbleSizeChange = useCallback(
    (size: typeof bubbleSize) => {
      setBubbleSize(size);
      // Update bubble size live if it is currently visible
      if (isRunning) {
        AutoClick.updateBubbleSize(BUBBLE_SIZES[size]);
      }
    },
    [setBubbleSize, isRunning],
  );

  // Wait until settings are loaded before rendering
  if (!isLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  // Both permissions must be granted to allow start
  const canStart = overlayGranted && accessibilityGranted;

  return (
    <View style={styles.root}>
      <StatusBar backgroundColor='#121212' barStyle='light-content' />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps='handled'>

        {/* ── App Title ─────────────────────────────────── */}
        <View style={styles.titleRow}>
          <Text style={styles.title}>Kurikku</Text>
          <View
            style={[
              styles.statusBadge,
              isRunning ? styles.badgeRunning : styles.badgeStopped,
            ]}>
            <Text style={styles.statusBadgeText}>
              {isRunning ? 'RUNNING' : 'IDLE'}
            </Text>
          </View>
        </View>

        <Text style={styles.subtitle}>Auto Clicker</Text>

        {/* ── Permissions ───────────────────────────────── */}
        <Text style={styles.sectionHeader}>Permissions</Text>

        <PermissionButton
          label='Overlay Permission'
          isGranted={overlayGranted}
          actionText='Enable'
          onPress={AutoClick.openOverlaySettings}
        />

        <PermissionButton
          label='Accessibility Service'
          isGranted={accessibilityGranted}
          actionText='Enable'
          onPress={AutoClick.openAccessibilitySettings}
        />

        {/* ── Safety notice ─────────────────────────────── */}
        <View style={styles.safetyBox}>
          <Text style={styles.safetyText}>
            Kurikku is designed for accessibility, testing, and repetitive
            automation in supported apps. Use responsibly and follow the rules
            of any app you automate.
          </Text>
        </View>

        {/* ── CPS Slider ────────────────────────────────── */}
        <Text style={styles.sectionHeader}>Click Speed</Text>

        <CPSSlider
          value={cps}
          onChange={setCps}
          disabled={isRunning}
        />

        {/* ── Click Point Info ──────────────────────────── */}
        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>Click Point</Text>
          <Text style={styles.infoValue}>
            X: {clickX}  Y: {clickY}
          </Text>
          <Text style={styles.infoHint}>
            Drag the marker on the overlay to reposition
          </Text>
        </View>

        {/* ── Bubble Size ───────────────────────────────── */}
        <Text style={styles.sectionHeader}>Bubble Settings</Text>

        <BubbleSizeSelector
          value={bubbleSize}
          onChange={handleBubbleSizeChange}
        />

        {/* ── Start / Stop Buttons ──────────────────────── */}
        <Text style={styles.sectionHeader}>Controls</Text>

        <View style={styles.controlRow}>
          {/* Start button — disabled while running or permissions missing */}
          <TouchableOpacity
            style={[
              styles.controlButton,
              styles.startButton,
              (isRunning || !canStart) && styles.buttonDisabled,
            ]}
            onPress={handleStart}
            disabled={isRunning || !canStart}
            activeOpacity={0.8}>
            <Text style={styles.controlButtonText}>▶  Start</Text>
          </TouchableOpacity>

          {/* Stop button — disabled while not running */}
          <TouchableOpacity
            style={[
              styles.controlButton,
              styles.stopButton,
              !isRunning && styles.buttonDisabled,
            ]}
            onPress={handleStop}
            disabled={!isRunning}
            activeOpacity={0.8}>
            <Text style={styles.controlButtonText}>⏹  Stop</Text>
          </TouchableOpacity>
        </View>

        {/* Bottom padding */}
        <View style={styles.bottomPad} />

      </ScrollView>
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#121212',
  },

  scroll: {
    flex: 1,
  },

  scrollContent: {
    padding: 16,
  },

  // Loading state
  loadingContainer: {
    flex: 1,
    backgroundColor: '#121212',
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingText: {
    color: '#AAAAAA',
    fontSize: 16,
  },

  // Title row
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },

  title: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: 1,
  },

  subtitle: {
    color: '#666666',
    fontSize: 13,
    marginTop: 2,
    marginBottom: 24,
  },

  // Running / Idle badge
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },

  badgeRunning: {
    backgroundColor: '#1B5E20',
  },

  badgeStopped: {
    backgroundColor: '#1A1A1A',
  },

  statusBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },

  // Section headers
  sectionHeader: {
    color: '#AAAAAA',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginTop: 20,
    marginBottom: 6,
    marginLeft: 2,
  },

  // Safety notice box
  safetyBox: {
    backgroundColor: '#1A1A00',
    borderLeftWidth: 3,
    borderLeftColor: '#FFC107',
    borderRadius: 6,
    padding: 12,
    marginTop: 10,
  },

  safetyText: {
    color: '#BBBBBB',
    fontSize: 12,
    lineHeight: 18,
  },

  // Click point info card
  infoCard: {
    backgroundColor: '#1E1E1E',
    borderRadius: 8,
    padding: 14,
    marginVertical: 6,
  },

  infoLabel: {
    color: '#AAAAAA',
    fontSize: 12,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 6,
  },

  infoValue: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },

  infoHint: {
    color: '#555555',
    fontSize: 11,
    marginTop: 4,
  },

  // Start / Stop button row
  controlRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },

  controlButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },

  startButton: {
    backgroundColor: '#2E7D32',
  },

  stopButton: {
    backgroundColor: '#C62828',
  },

  buttonDisabled: {
    backgroundColor: '#2A2A2A',
  },

  controlButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },

  bottomPad: {
    height: 32,
  },
});

export default HomeScreen;