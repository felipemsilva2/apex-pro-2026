const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const { pathToFileURL } = require('url');

const config = getDefaultConfig(__dirname);

// Add support for .cjs files (needed for date-fns v4)
config.resolver.sourceExts.push('cjs');

// Fix for Windows absolute path issue in Node 25 ESM loader
try {
    module.exports = withNativeWind(config, { input: "./global.css" });
} catch (e) {
    // If it still fails, try to provide more info
    console.error("Metro config error:", e);
    module.exports = config;
}
