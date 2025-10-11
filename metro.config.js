const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Optionnel : gérer SVG proprement
config.resolver.assetExts = [...config.resolver.assetExts, 'svg'];
config.resolver.sourceExts = config.resolver.sourceExts.filter(ext => ext !== 'svg');

module.exports = config;
