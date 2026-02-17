import './src/polyfills'; // MUST BE THE FIRST IMPORT

import { AppRegistry } from 'react-native';
import * as Sentry from '@sentry/react-native';
import App from './App';
import { name as appName } from './app.json';

global.process.env.NODE_ENV = __DEV__ ? 'development' : 'production';

// Safe Sentry Initialization
const isSentryEnabled = !__DEV__ && process.env.SENTRY_DSN;

if (isSentryEnabled) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 1.0,
  });
}

AppRegistry.registerComponent(appName, () => isSentryEnabled ? Sentry.wrap(App) : App);
