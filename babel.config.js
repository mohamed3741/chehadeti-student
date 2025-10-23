module.exports = function (api) {
    api.cache(true);
    return {
        presets: [
            ['babel-preset-expo', {
                lazyImports: true,
            }]
        ],
        plugins: [
            'inline-dotenv',
            'react-native-reanimated/plugin'
        ]
    };
};
