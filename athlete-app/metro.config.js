const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Add support for .cjs files (needed for date-fns v4)
config.resolver.sourceExts.push('cjs');

module.exports = config;
