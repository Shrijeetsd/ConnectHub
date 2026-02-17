import {AppRegistry} from 'react-native';
import App from './src/App';
import appJson from './app.json';

// Simple polyfill for Buffer
import {Buffer} from 'buffer';
if (typeof window !== 'undefined') {
  window.Buffer = Buffer;
  window.process = window.process || {env: {NODE_ENV: 'development'}};
}

AppRegistry.registerComponent(appJson.name, () => App);

AppRegistry.runApplication(appJson.name, {
  initialProps: {},
  rootTag: document.getElementById('root'),
});
