import configPlugins, { ConfigPlugin } from "@expo/config-plugins";

const { withProjectBuildGradle, withPodfile } = configPlugins;

const withAndroidPlugin: ConfigPlugin = (config) => {
  return withProjectBuildGradle(config, (config) => {
    let buildGradle = config.modResults.contents;
    config.modResults.contents = buildGradle;
    return config;
  });
};

const withIosPlugin: ConfigPlugin = (config) => {
  return withPodfile(config, (config) => {
    let podfile = config.modResults.contents;
    config.modResults.contents = podfile;
    return config;
  });
};

const withPlugin: ConfigPlugin = (config) => {
  config = withAndroidPlugin(config);
  return withIosPlugin(config);
};

export default withPlugin;
