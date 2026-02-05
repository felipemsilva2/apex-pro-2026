module.exports = {
    expo: {
        name: "NutriPro Athlete",
        slug: "nutripro-athlete",
        version: "1.0.0",
        orientation: "portrait",
        icon: "./assets/images/icon.png",
        scheme: "athleteapp",
        userInterfaceStyle: "dark",
        newArchEnabled: true,
        splash: {
            image: "./assets/images/splash-icon.png",
            resizeMode: "contain",
            backgroundColor: "#0A0A0B"
        },
        ios: {
            supportsTablet: true,
            bundleIdentifier: "com.nutripro.athlete"
        },
        android: {
            adaptiveIcon: {
                foregroundImage: "./assets/images/adaptive-icon.png",
                backgroundColor: "#0A0A0B"
            },
            package: "com.nutripro.athlete",
            edgeToEdgeEnabled: true,
            predictiveBackGestureEnabled: false
        },
        web: {
            bundler: "metro",
            output: "static",
            favicon: "./assets/images/favicon.png"
        },
        plugins: [
            "expo-router"
        ],
        experiments: {
            typedRoutes: true
        },
        extra: {
            // Expo Constants will make these available via Constants.expoConfig.extra
            supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
            supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
            eas: {
                projectId: "your-project-id" // Update this when you create an EAS project
            }
        }
    }
};
