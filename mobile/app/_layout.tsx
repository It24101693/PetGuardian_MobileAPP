import React, { useEffect } from 'react';
import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { LoadingScreen } from '../components/ui/LoadingScreen';
import { LooperAssistant } from '../components/ui/LooperAssistant';

// This component handles the actual routing logic based on auth state
function RootLayoutNav() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';
    const isRoot = !segments.length || segments[0] === 'index';
    
    // Always show the welcome page when the app first loads at root
    if (isRoot) {
      router.replace('/(auth)/welcome');
    } else if (!isAuthenticated && !inAuthGroup) {
      // If trying to access protected routes while logged out, send to welcome
      router.replace('/(auth)/welcome');
    }
    // Note: We deliberately DO NOT auto-redirect authenticated users away from 
    // the auth group (like welcome screen) anymore. 
    // They can manually click "Go to Dashboard" on the landing page!
  }, [isAuthenticated, isLoading, segments, user]);

  if (isLoading) {
    return <LoadingScreen message="Waking up PetGuardian..." />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="index" options={{ headerShown: false }} />
    </Stack>
  );
}

// Root layout just sets up providers
export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={DefaultTheme}>
        <AuthProvider>
          <StatusBar style="dark" />
          <RootLayoutNav />
          <LooperAssistant />
        </AuthProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
