// src/components/CPSSlider.tsx
// CPS (Clicks Per Second) slider with preset buttons
// Used on both HomeScreen and the floating control panel

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import Slider from '@react-native-community/slider';
import {CPS_MIN, CPS_MAX, CPS_PRESETS} from '@constants/config';

// ─── Props ────────────────────────────────────────────────
interface CPSSliderProps {
  // Current CPS value
  value: number;

  // Called whenever the CPS value changes
  onChange: (cps: number) => void;

  // Whether the slider should be disabled (e.g. while clicking is active)
  disabled?: boolean;
}

// ─── Component ────────────────────────────────────────────
const CPSSlider: React.FC<CPSSliderProps> = ({
  value,
  onChange,
  disabled = false,
}) => {
  // Handle slider value change — round to nearest integer
  const handleSliderChange = (raw: number) => {
    onChange(Math.round(raw));
  };

  return (
    <View style={styles.container}>

      {/* Section label + current value display */}
      <View style={styles.header}>
        <Text style={styles.label}>Clicks Per Second</Text>
        <View style={styles.valueBadge}>
          <Text style={styles.valueText}>{value} CPS</Text>
        </View>
      </View>

      {/* Draggable slider */}
      <Slider
        style={styles.slider}
        minimumValue={CPS_MIN}
        maximumValue={CPS_MAX}
        step={1}
        value={value}
        onValueChange={handleSliderChange}
        minimumTrackTintColor={disabled ? '#555555' : '#2196F3'}
        maximumTrackTintColor='#333333'
        thumbTintColor={disabled ? '#555555' : '#2196F3'}
        disabled={disabled}
      />

      {/* Min / Max labels under slider */}
      <View style={styles.rangeRow}>
        <Text style={styles.rangeText}>{CPS_MIN}</Text>
        <Text style={styles.rangeText}>{CPS_MAX}</Text>
      </View>

      {/* Quick preset buttons */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.presetsScroll}
        contentContainerStyle={styles.presetsContent}>
        {CPS_PRESETS.map((preset) => {
          const isActive = value === preset;
          return (
            <TouchableOpacity
              key={preset}
              style={[
                styles.presetButton,
                isActive && styles.presetButtonActive,
                disabled && styles.presetButtonDisabled,
              ]}
              onPress={() => !disabled && onChange(preset)}
              activeOpacity={0.7}>
              <Text
                style={[
                  styles.presetText,
                  isActive && styles.presetTextActive,
                  disabled && styles.presetTextDisabled,
                ]}>
                {preset}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

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

  // Header row: label on left, value badge on right
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },

  label: {
    color: '#AAAAAA',
    fontSize: 12,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },

  // Blue badge showing current CPS number
  valueBadge: {
    backgroundColor: '#1565C0',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },

  valueText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },

  slider: {
    width: '100%',
    height: 40,
  },

  // Min/Max labels row under slider
  rangeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: -6,
    marginBottom: 10,
    paddingHorizontal: 4,
  },

  rangeText: {
    color: '#666666',
    fontSize: 11,
  },

  // Horizontal scroll row of preset buttons
  presetsScroll: {
    marginTop: 4,
  },

  presetsContent: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 2,
  },

  presetButton: {
    borderWidth: 1,
    borderColor: '#333333',
    borderRadius: 6,
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: '#2A2A2A',
  },

  presetButtonActive: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },

  presetButtonDisabled: {
    borderColor: '#2A2A2A',
    backgroundColor: '#1A1A1A',
  },

  presetText: {
    color: '#CCCCCC',
    fontSize: 13,
    fontWeight: '500',
  },

  presetTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  presetTextDisabled: {
    color: '#444444',
  },
});

export default CPSSlider;