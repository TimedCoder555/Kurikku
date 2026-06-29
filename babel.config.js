// babel.config.js
// Babel configuration for React Native + TypeScript
// Enables path aliases defined in tsconfig.json

module.exports = {
  presets: ['@react-native/babel-preset'],

  plugins: [
    // Resolves @constants, @store, @modules, @screens, @components aliases
    [
      'module-resolver',
      {
        root: ['.'],
        extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
        alias: {
          '@constants': './src/constants',
          '@store': './src/store',
          '@modules': './src/modules',
          '@screens': './src/screens',
          '@components': './src/components',
        },
      },
    ],
  ],
};