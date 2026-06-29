// metro.config.js
// Metro bundler configuration for React Native
// Handles TypeScript and asset resolution

const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 */
const defaultConfig = getDefaultConfig(__dirname);

const config = {
  resolver: {
    // Support TypeScript extensions
    sourceExts: [
      ...defaultConfig.resolver.sourceExts,
      'ts',
      'tsx',
    ],

    // Support common asset types
    assetExts: [
      ...defaultConfig.resolver.assetExts,
      'png',
      'jpg',
      'jpeg',
    ],
  },
};

module.exports = mergeConfig(defaultConfig, config);