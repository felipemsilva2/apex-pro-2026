import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { CrashScreen } from '../components/CrashScreen';

import { View, Text } from 'react-native';
import { useColorScheme } from '@/components/useColorScheme';
import {
  Syne_400Regular,
  Syne_700Bold,
  Syne_800ExtraBold
} from '@expo-google-fonts/syne';
import {
  Outfit_400Regular,
  Outfit_600SemiBold,
  Outfit_700Bold
} from '@expo-google-fonts/outfit';
import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_700Bold
} from '@expo-google-fonts/plus-jakarta-sans';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
try {
  SplashScreen.preventAutoHideAsync();
} catch (e) {
  console.warn('[Layout] SplashScreen.preventAutoHideAsync() failed:', e);
}

const queryClient = new QueryClient();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    Syne_400Regular,
    Syne_700Bold,
    Syne_800ExtraBold,
    Outfit_400Regular,
    Outfit_600SemiBold,
    Outfit_700Bold,
    PlusJakartaSans_400Regular,
    PlusJakartaSans_700Bold,
    ...FontAwesome.font,
  });

  // Log font loading errors instead of throwing (which causes SIGABRT crash)
  const [fontError, setFontError] = useState<Error | null>(null);

  useEffect(() => {
    if (error) {
      console.error('[Layout] Font loading error:', error.message, error);
      setFontError(error);
      // Still hide splash so the user sees something
      try { SplashScreen.hideAsync(); } catch (e) { /* ignore */ }
    }
  }, [error]);

  useEffect(() => {
    if (loaded) {
      try { SplashScreen.hideAsync(); } catch (e) {
        console.warn('[Layout] SplashScreen.hideAsync() failed:', e);
      }
    }
  }, [loaded]);

  // Show a fallback error screen instead of crashing
  if (fontError) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0A0A0B', alignItems: 'center', justifyContent: 'center', padding: 30 }}>
        <Text style={{ color: '#FF3B30', fontWeight: '900', fontSize: 18, marginBottom: 10 }}>ERRO DE INICIALIZAÇÃO</Text>
        <Text style={{ color: 'rgba(255,255,255,0.5)', textAlign: 'center', fontSize: 13, lineHeight: 20 }}>
          {fontError.message || 'Erro ao carregar recursos do app.'}
        </Text>
        <Text style={{ color: 'rgba(255,255,255,0.3)', marginTop: 20, fontSize: 11 }}>Tente reinstalar o app.</Text>
      </View>
    );
  }

  if (!loaded) {
    return null;
  }

  return (
    <CrashScreen>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <RootLayoutNav />
        </AuthProvider>
      </QueryClientProvider>
    </CrashScreen>
  );
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { user, loading, profile } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {


    if (loading) return;

    const segments_array = Array.isArray(segments) ? segments : [];
    const inAuthGroup = segments_array[0] === '(auth)';
    const inBlockedPage = segments_array[0] === 'blocked';
    const inLegalPage = segments_array[0] === 'terms' || segments_array[0] === 'privacy';
    const inAcceptancePage = segments_array[0] === 'terms-acceptance';
    const isSuspended = profile?.status === 'suspended' || profile?.status === 'cancelled';

    // Check if terms are accepted (if user is logged in and profile loaded)
    const needsToAcceptTerms = user && profile && !profile.terms_accepted_at;



    if (!user && !inAuthGroup && !inLegalPage) {

      router.replace('/(auth)/login');
    } else if (user && isSuspended && !inBlockedPage) {

      router.replace('/blocked');
    } else if (user && !isSuspended && needsToAcceptTerms && !inAcceptancePage && !inLegalPage) {

      router.replace('/terms-acceptance');
    } else if (user && !isSuspended && !needsToAcceptTerms && (inAuthGroup || inBlockedPage || inAcceptancePage)) {

      router.replace('/(tabs)');
    }
  }, [user, profile?.status, segments, loading]);

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0A0A0B', alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: '#D4FF00', fontWeight: '900', fontStyle: 'italic', textTransform: 'uppercase', letterSpacing: 2 }}>
          CARREGANDO // PREPARANDO TREINO...
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#0A0A0B' }}>
      <ThemeProvider value={DarkTheme}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
          <Stack.Screen name="terms" options={{ presentation: 'modal', headerShown: false }} />
          <Stack.Screen name="privacy" options={{ presentation: 'modal', headerShown: false }} />
          <Stack.Screen name="terms-acceptance" options={{ headerShown: false, gestureEnabled: false }} />
        </Stack>
      </ThemeProvider>
    </View>
  );
}
