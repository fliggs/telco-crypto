const { getDefaultConfig } = require("expo/metro-config");
const {
  wrapWithReanimatedMetroConfig,
} = require("react-native-reanimated/metro-config");

const config = getDefaultConfig(__dirname);

config.transformer = {
  ...config.transformer,
  babelTransformerPath: require.resolve("react-native-svg-transformer/expo"),
};

config.resolver = {
  ...config.resolver,
  assetExts: config.resolver.assetExts.filter((ext) => ext !== "svg"),
  sourceExts: [...config.resolver.sourceExts, "svg"],
  resolveRequest: (context, moduleName, platform) => {
    if (moduleName === "crypto" || moduleName === "node:crypto") {
      return context.resolveRequest(
        context,
        "react-native-quick-crypto",
        platform
      );
    }
    return context.resolveRequest(context, moduleName, platform);
  },
};

module.exports = wrapWithReanimatedMetroConfig(config);
