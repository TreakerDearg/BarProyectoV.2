// ─────────────────────────────────────────────────────────────────────────────
// NEBULA BAR — App Entry Point (SDK 57 / React 19 / RN 0.86)
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useCallback } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';

// ── Fuentes Nocturne Gastronomy ───────────────────────────────────────────────
import {
  useFonts,
  Outfit_400Regular,
  Outfit_500Medium,
  Outfit_600SemiBold,
  Outfit_700Bold,
} from '@expo-google-fonts/outfit';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import * as SplashScreen from 'expo-splash-screen';

// ── Core services ─────────────────────────────────────────────────────────────
import { socketService }  from './src/socket/socketService';
import { useAuthStore }   from './src/stores/useAuthStore';

// ── Navigator ─────────────────────────────────────────────────────────────────
import AppNavigator from './src/navigation/AppNavigator';

// ── Theme ─────────────────────────────────────────────────────────────────────
import { Colors } from './src/theme/colors';

// SDK 57: preventAutoHideAsync es async y puede fallar silenciosamente
SplashScreen.preventAutoHideAsync().catch(() => {});

// ── Navigation theme (Nocturne) ───────────────────────────────────────────────
const NavigationTheme = {
  dark: true,
  colors: {
    primary:      Colors.primary,
    background:   Colors.background,
    card:         Colors.background,
    text:         Colors.onSurface,
    border:       Colors.outlineVariant,
    notification: Colors.error,
  },
  fonts: {
    regular: { fontFamily: 'Inter_400Regular',  fontWeight: '400' as const },
    medium:  { fontFamily: 'Inter_500Medium',   fontWeight: '500' as const },
    bold:    { fontFamily: 'Inter_600SemiBold', fontWeight: '600' as const },
    heavy:   { fontFamily: 'Inter_700Bold',     fontWeight: '700' as const },
  },
};

// ── Componente principal ──────────────────────────────────────────────────────
export default function App() {
  const loadSession = useAuthStore((s) => s.loadSession);

  const [fontsLoaded, fontError] = useFonts({
    Outfit_400Regular,
    Outfit_500Medium,
    Outfit_600SemiBold,
    Outfit_700Bold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  // Inicializar sesión y socket una sola vez
  useEffect(() => {
    loadSession();
    socketService.connect();
    return () => socketService.disconnect();
  }, []);

  // Ocultar splash cuando las fuentes estén listas
  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded || fontError) {
      await SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded, fontError]);

  // Mostrar fondo mientras cargan las fuentes
  if (!fontsLoaded && !fontError) {
    return <View style={{ flex: 1, backgroundColor: Colors.background }} />;
  }

  return (
    <SafeAreaProvider>
      <View
        style={{ flex: 1, backgroundColor: Colors.background }}
        onLayout={onLayoutRootView}
      >
        <StatusBar style="light" backgroundColor={Colors.background} />
        <NavigationContainer theme={NavigationTheme}>
          <AppNavigator />
        </NavigationContainer>
      </View>
    </SafeAreaProvider>
  );
}
