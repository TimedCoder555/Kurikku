// src/components/BubbleSizeSelector.tsx
// Bubble size picker — Small, Medium, Large
// Displays three selectable buttons and updates the store

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import {BubbleSize, BUBBLE_SIZES} from '@constants/config';

// ─── Props ────────────────────────────────────────────────
interface BubbleSizeSelectorProps {
  // Currently selected size
  value: BubbleSize;

  // Called when user selects a different size
  onChange: (size: BubbleSize) => void;

  // Whether the selector should be disabled
  disabled?: boolean;
}

// ─── Size options to render ────────────────────────────────
const SIZE_OPTIONS: {key: BubbleSize; label: string}[] = [
  {key: 'small', label: 'Small'},
  {key: 'medium', label: 'Medium'},
  {key: 'large', label: 'Large'},
];

// ─── Component ────────────────────────────────────────────
const BubbleSizeSelector: React.FC<BubbleSizeSelectorProps> = ({
  value,
  onChange,
  disabled = false,
}) => {
  return (
    <View style={styles.container}>

      {/* Section label */}
      <Text style={styles.label}>Bubble Size</Text>

      {/* Three size option buttons in a row */}
      <View style={styles.row}>
        {SIZE_OPTIONS.map(({key, label}) => {
          const isActive = value === key;
          const sizePx = BUBBLE_SIZES[key];

          return (
            <TouchableOpacity
              key={key}
              style={[
                styles.option,
                isActive && styles.optionActive,
                disabled && styles.optionDisabled,
              ]}
              onPress={() => !disabled && onChange(key)}
              activeOpacity={0.7}>

              {/* Preview circle showing relative bubble size */}
              <View
                style={[
                  styles.previewCircle,
                  {
                    width: sizePx * 0.4,
                    height: sizePx * 0.4,
                    borderRadius: (sizePx * 0.4) / 2,
                  },
                  isActive
                    ? styles.previewCircleActive
                    : styles.previewCircleInactive,
                ]}
              />

              {/* Size label */}
              <Text
                style={[
                  styles.optionText,
                  isActive && styles.optionTextActive,
                  disabled && styles.optionTextDisabled,
                ]}>
                {label}
              </Text>

              {/* Pixel size hint */}
              <Text style={styles.pixelHint}>{sizePx}px</Text>

            </TouchableOpacity>
          );
        })}
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
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 12,
  },

  // Three buttons side by side with equal width
  row: {
    flexDirection: 'row',
    gap: 8,
  },

  option: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333333',
    backgroundColor: '#2A2A2A',
    gap: 6,
  },

  optionActive: {
    borderColor: '#2196F3',
    backgroundColor: '#1565C0',
  },

  optionDisabled: {
    borderColor: '#2A2A2A',
    backgroundColor: '#1A1A1A',
  },

  // Circle preview — size scales with bubble size value
  previewCircle: {
    backgroundColor: '#555555',
  },

  previewCircleActive: {
    backgroundColor: '#FFFFFF',
  },

  previewCircleInactive: {
    backgroundColor: '#555555',
  },

  optionText: {
    color: '#CCCCCC',
    fontSize: 13,
    fontWeight: '500',
  },

  optionTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  optionTextDisabled: {
    color: '#444444',
  },

  // Small pixel size label below the option name
  pixelHint: {
    color: '#666666',
    fontSize: 10,
  },
});

export default BubbleSizeSelector;