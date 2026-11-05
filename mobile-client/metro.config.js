// ─────────────────────────────────────────────────────────────────────────────
// Metro config — Nebula Bar mobile client
// SDK 58 / RN 0.88.1 / reanimated 4.7.x / worklets 0.13.x
//
// ESTRATEGIA:
// exports=true  → RN 0.88 resuelve TODOS sus subpath exports nativamente
//   (setup-env, asset-registry, unstable-internals, react-private-interface, etc.)
// resolveRequest intercepta ANTES de que Metro lea exports field:
//   - expo → main: build/Expo.js (expo tiene exports con types anidados que rompen Metro)
//   - @react-navigation/* → lib/commonjs (su exports usa import=ESM que Metro no procesa)
// extraNodeModules → RN exports para pipeline de assets (.ttf)
// ─────────────────────────────────────────────────────────────────────────────

const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');
const fs   = require('fs');

const config = getDefaultConfig(__dirname);
config.resolver = config.resolver ?? {};

config.resolver.unstable_enablePackageExports = true;

const nmRoot  = path.resolve(__dirname, 'node_modules');
const rnRoot  = path.join(nmRoot, 'react-native');
const navRoot = path.join(nmRoot, '@react-navigation');

// ── Módulos a interceptar ANTES de que Metro lea su exports field ────────────
const INTERCEPT = {};

// expo: su exports tiene "types" anidado como objeto → Metro no puede procesarlo.
// Forzar resolución via main: build/Expo.js
INTERCEPT['expo'] = path.join(nmRoot, 'expo', 'build', 'Expo.js');

// @react-navigation/*: su exports usa import → ESM. Forzar CJS o src/.
['native', 'bottom-tabs', 'native-stack', 'core', 'elements', 'routers'].forEach((pkg) => {
  const cjs = path.join(navRoot, pkg, 'lib', 'commonjs', 'index.js');
  if (fs.existsSync(cjs)) {
    INTERCEPT[`@react-navigation/${pkg}`] = cjs;
  } else {
    // Sin CJS → usar src/ TypeScript (Metro lo transpila)
    const src = path.join(navRoot, pkg, 'src', 'index.tsx');
    if (fs.existsSync(src)) {
      INTERCEPT[`@react-navigation/${pkg}`] = src;
    }
  }
});

// ── RN exports públicos para pipeline de assets (.ttf) ───────────────────────
const RN_EXPORTS = {
  'react-native/asset-registry':
    path.join(rnRoot, 'src', 'asset-registry.js'),
  'react-native/unstable-internals-do-not-use':
    path.join(rnRoot, 'src', 'unstable-internals-do-not-use.js'),
  'react-native/react-private-interface':
    path.join(rnRoot, 'src', 'react-private-interface.js'),
};

config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  ...RN_EXPORTS,
  ...INTERCEPT,
};

config.resolver.resolveRequest = (context, moduleName, platform) => {
  // Interceptar antes de que Metro consulte exports field
  if (INTERCEPT[moduleName]) {
    return { filePath: INTERCEPT[moduleName], type: 'sourceFile' };
  }
  if (RN_EXPORTS[moduleName]) {
    return { filePath: RN_EXPORTS[moduleName], type: 'sourceFile' };
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
