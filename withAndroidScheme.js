const { AndroidConfig, withAndroidManifest } = require("@expo/config-plugins");

const withAndroidScheme = (config, scheme) =>
    withAndroidManifest(config, (config) => {
        if (!AndroidConfig.Scheme.hasScheme(scheme, config.modResults)) {
            config.modResults = AndroidConfig.Scheme.appendScheme(
                scheme,
                config.modResults
            );
        }
        return config;
    });

module.exports = withAndroidScheme;
