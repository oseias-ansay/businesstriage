const { getDefaultConfig } = require('expo/metro-config');

module.exports = (() => {
  const config = getDefaultConfig(__dirname);

  const { transformer, resolver } = config;

  config.transformer = {
    ...transformer,
    babelTransformerPath: require.resolve('react-native-svg-transformer'),
  };
  
  config.resolver = {
    ...resolver,
    assetExts: resolver.assetExts.filter((ext) => ext !== 'svg'),
    sourceExts: [...resolver.sourceExts, 'svg'],
    resolveRequest: (context, moduleName, platform) => {
      // Mock react-dom para React Native
      if (moduleName === 'react-dom') {
        return {
          filePath: require.resolve('react-native'),
          type: 'sourceFile',
        };
      }
      // Retorna o resolver padrão para outros módulos
      return context.resolveRequest(context, moduleName, platform);
    },
  };

  return config;
})();