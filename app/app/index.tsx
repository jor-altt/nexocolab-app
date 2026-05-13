import { useEffect } from 'react';
import { useRouter, useRootNavigationState } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { ActivityIndicator, View } from 'react-native';

export default function Index() {
  const router = useRouter();
  const navigationState = useRootNavigationState();
  const isAuthenticated = useAuth();

  useEffect(() => {
    // Esperar a que la navegación esté lista
    if (!navigationState?.key) return;

    console.log('🔄 Navegación lista, isAuthenticated:', isAuthenticated);

    if (isAuthenticated === true) {
      console.log('✅ Redirigiendo a (tabs)/home');
      router.replace('/(tabs)/home');
    } else if (isAuthenticated === false) {
      console.log('❌ Redirigiendo a /login');
      router.replace('/login');
    }
  }, [navigationState?.key, isAuthenticated]);

  if (isAuthenticated === null || !navigationState?.key) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f172a' }}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  // Mientras redirige, mostrar carga
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f172a' }}>
      <ActivityIndicator size="large" color="#2563eb" />
    </View>
  );
}