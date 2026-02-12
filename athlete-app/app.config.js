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
            // Fallback values ensure EAS cloud builds work even without .env (which is gitignored)
            supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://boiqecrzszyjipdhddkn.supabase.co',
            supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJvaXFlY3J6c3p5amlwZGhkZGtuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk3MDcyNzUsImV4cCI6MjA4NTI4MzI3NX0.p2zEzs2ZLTRCiJjvnOCQku-feAVBNWjo7hQU4SRyBcI',
            eas: {
                projectId: "52201882-32af-43c2-8aa7-03bf7c424d43"
            }
        }
    }
};
