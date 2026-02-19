const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const path = require('path');

/**
 * Metro configuration
 * https://facebook.github.io/metro/docs/configuration
 *
 * @type {import('metro-config').MetroConfig}
 */
const defaultConfig = getDefaultConfig(__dirname);

const config = {
  resolver: {
    unstable_enablePackageExports: true,
    sourceExts: [...defaultConfig.resolver.sourceExts, 'cjs'],
    extraNodeModules: {
      ...require('node-libs-react-native'),
      crypto: require.resolve('react-native-crypto'),
      http2: path.resolve(__dirname, 'empty.js'),
      dns: path.resolve(__dirname, 'empty.js'),
      net: path.resolve(__dirname, 'empty.js'),
      tls: path.resolve(__dirname, 'empty.js'),
      fs: path.resolve(__dirname, 'empty.js'),
      zlib: path.resolve(__dirname, 'zlib-mock.js'),
    },
    resolverMainFields: ['react-native', 'browser', 'main'],
  },
};

module.exports = mergeConfig(defaultConfig, config);
