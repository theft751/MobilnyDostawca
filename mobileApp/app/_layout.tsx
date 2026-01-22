import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { useEffect } from 'react';
import { useRouter, useSegments } from 'expo-router';

function RootLayoutNav() {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === 'login' || segments[0] === 'register';
    const inProtectedRoute = segments[0] === 'deliveries' || segments[0] === 'delivery-details';

    if (!user && !inAuthGroup) {
      router.replace('/login');
    } else if (user && inAuthGroup) {
      router.replace('/');
    }
  }, [user, loading, segments]);

  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="register" options={{ headerShown: false }} />
      <Stack.Screen name="deliveries" options={{ headerShown: false }} />
      <Stack.Screen name="delivery-details" options={{ headerShown: false }} />
      <Stack.Screen name="manager-dashboard" options={{ headerShown: false }} />
      <Stack.Screen name="manager-deliveries" options={{ headerShown: false }} />
      <Stack.Screen name="create-delivery" options={{ headerShown: false }} />
      <Stack.Screen name="select-driver" options={{ headerShown: false }} />
      <Stack.Screen name="add-product" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <AuthProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <RootLayoutNav />
        <StatusBar style="auto" />
      </ThemeProvider>
    </AuthProvider>
  );
}
