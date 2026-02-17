import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'react-native': 'react-native-web',
      'react-native-background-actions': path.resolve(
        __dirname,
        'web/mocks/react-native-background-actions.js',
      ),
      'react-native-get-sms-android': path.resolve(
        __dirname,
        'web/mocks/react-native-get-sms-android.js',
      ),
      'react-native-encrypted-storage': path.resolve(
        __dirname,
        'web/mocks/react-native-encrypted-storage.js',
      ),
      'react-native-device-info': path.resolve(
        __dirname,
        'web/mocks/react-native-device-info.js',
      ),
      'react-native-webview': path.resolve(
        __dirname,
        'web/mocks/react-native-webview.js',
      ),
      'react-native-vector-icons': path.resolve(
        __dirname,
        'web/mocks/react-native-vector-icons.js',
      ),
    },
    extensions: ['.web.js', '.js', '.jsx', '.ts', '.tsx', '.json'],
  },
  define: {
    global: 'window',
    __DEV__: true,
    'process.env.NODE_ENV': JSON.stringify('development'),
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        '.js': 'jsx',
      },
    },
  },
  esbuild: {
    loader: 'jsx',
    include: /(src|web)\/.*\.js$/,
    exclude: [],
  },
});
