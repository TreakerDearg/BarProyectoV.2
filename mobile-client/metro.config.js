// ─────────────────────────────────────────────────────────────────────────────
// Metro config — Nebula Bar mobile client
// Fixes react-native-reanimated resolution on RN 0.86 + old architecture.
// ─────────────────────────────────────────────────────────────────────────────

const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Ensure reanimated's resolver can find react-native shims
// (needed when react-native-reanimated 3.x is used with RN 0.86+)
config.resolver = config.resolver ?? {};
config.resolver.resolveRequest = (context, moduleName, platform) => {
  // Redirect the missing shim to the actual ReactFabric implementation
  if (moduleName === 'react-native/Libraries/Renderer/shims/ReactNative') {
    return {
      filePath: require.resolve('react-native/Libraries/Renderer/shims/ReactFabric'),
      type: 'sourceFile',
    };
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
