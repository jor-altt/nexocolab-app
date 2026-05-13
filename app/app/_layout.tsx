import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/hooks/useAuth';
import { ActivityIndicator, View } from 'react-native';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const isAuthenticated = useAuth();

  if (isAuthenticated === null) {
    return (
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f172a' }}>
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? <Stack.Screen name="login" /> : <Stack.Screen name="(tabs)" />}
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}