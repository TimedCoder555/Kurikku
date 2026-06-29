// index.js
// App entry point — registers the root React Native component
// This is the first file Android loads when the app starts

import {AppRegistry} from 'react-native';
import App from './src/App';
import {name as appName} from './app.json';

// Register the root component with the app name defined in app.json
AppRegistry.registerComponent(appName, () => App);