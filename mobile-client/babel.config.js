module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    // reanimated 4.x: el plugin lo inyecta babel-preset-expo automáticamente.
    // NO agregar 'react-native-reanimated/plugin' manualmente.
  };
};
