// src/App.tsx
// Root component of Kurikku
// Sets up the dark theme and renders the HomeScreen

import React from 'react';
import {
  SafeAreaView,
  StyleSheet,
  useColorScheme,
} from 'react-native';
import HomeScreen from '@screens/HomeScreen';

// ─── Component ────────────────────────────────────────────
const App: React.FC = () => {
  // Detect system color scheme (we force dark regardless)
  const _colorScheme = useColorScheme();

  return (
    <SafeAreaView style={styles.root}>
      <HomeScreen />
    </SafeAreaView>
  );
};

// ─── Styles ───────────────────────────────────────────────
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#121212',
  },
});

export default App;