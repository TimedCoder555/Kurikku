// src/components/PermissionButton.tsx
// Reusable component for displaying a permission status and action button
// Used for both Overlay and Accessibility permissions on HomeScreen

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from 'react-native';

// ─── Props ────────────────────────────────────────────────
interface PermissionButtonProps {
  // Label shown above the button (e.g. "Overlay Permission")
  label: string;

  // Whether the permission is currently granted
  isGranted: boolean;

  // Text shown on the button when permission is NOT granted
  actionText: string;

  // Called when user taps the button (only active when not granted)
  onPress: () => void;

  // Optional extra style for the container
  style?: ViewStyle;
}

// ─── Component ────────────────────────────────────────────
const PermissionButton: React.FC<PermissionButtonProps> = ({
  label,
  isGranted,
  actionText,
  onPress,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      {/* Permission label */}
      <Text style={styles.label}>{label}</Text>

      <View style={styles.row}>
        {/* Status indicator dot — green if granted, red if not */}
        <View
          style={[
            styles.statusDot,
            isGranted ? styles.dotGranted : styles.dotDenied,
          ]}
        />

        {/* Status text */}
        <Text
          style={[
            styles.statusText,
            isGranted ? styles.textGranted : styles.textDenied,
          ]}>
          {isGranted ? 'Granted' : 'Not Granted'}
        </Text>

        {/* Action button — disabled when already granted */}
        {!isGranted && (
          <TouchableOpacity
            style={styles.button}
            onPress={onPress}
            activeOpacity={0.7}>
            <Text style={styles.buttonText}>{actionText}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1E1E1E',
    borderRadius: 8,
    padding: 14,
    marginVertical: 6,
  },

  label: {
    color: '#AAAAAA',
    fontSize: 12,
    marginBottom: 8,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  // Small colored dot showing permission status
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },

  dotGranted: {
    backgroundColor: '#4CAF50',
  },

  dotDenied: {
    backgroundColor: '#F44336',
  },

  statusText: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },

  textGranted: {
    color: '#4CAF50',
  },

  textDenied: {
    color: '#F44336',
  },

  // Enable button shown only when permission is not granted
  button: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 6,
  },

  buttonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
});

export default PermissionButton;