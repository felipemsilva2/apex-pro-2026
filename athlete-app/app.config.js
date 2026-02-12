module.exports = {
    expo: {
        name: "Apex Pro",
        slug: "apex-pro-app",
        version: "1.0.0",
        orientation: "portrait",
        icon: "./assets/images/icon.png",
        scheme: "apexpro",
        userInterfaceStyle: "dark",
        newArchEnabled: false,
        splash: {
            image: "./assets/images/splash-icon.png",
            resizeMode: "contain",
            backgroundColor: "#0A0A0C"
        },
        ios: {
            supportsTablet: true,
            bundleIdentifier: "com.apexpro.app",
            infoPlist: {
                NSCameraUsageDescription: "Precisamos de acesso à câmera para você tirar fotos da sua evolução física.",
                NSPhotoLibraryUsageDescription: "Precisamos de acesso à sua galeria para você selecionar fotos de check-in e exames.",
                ITSAppUsesNonExemptEncryption: false
            }
        },
        android: {
            adaptiveIcon: {
                foregroundImage: "./assets/images/adaptive-icon.png",
                backgroundColor: "#0A0A0C"
            },
            package: "com.apexpro.app",
            edgeToEdgeEnabled: true,
            predictiveBackGestureEnabled: false
        },
        web: {
            bundler: "metro",
            output: "static",
            favicon: "./assets/images/favicon.png"
        },
        plugins: [
            "expo-router",
            "expo-notifications",
            "@react-native-community/datetimepicker"
        ],
        experiments: {
            typedRoutes: true
        },
        extra: {
            // Expo Constants will make these available via Constants.expoConfig.extra
            supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
            supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
            eas: {
                projectId: "52201882-32af-43c2-8aa7-03bf7c424d43"
            }
        }
    }
};
