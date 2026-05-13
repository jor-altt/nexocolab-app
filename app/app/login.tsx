import { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, Alert, Keyboard } from 'react-native';
import { useRouter } from 'expo-router';  // 👈 Importa router
import { supabase } from '@/lib/supabase';

export default function LoginScreen() {
  const router = useRouter();  // 👈 Hook de navegación
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const signIn = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Completa todos los campos');
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);

    if (error) {
      Alert.alert('Error', error.message);
    } else {
      Keyboard.dismiss();
      // ✅ Redirige manualmente a la pantalla principal
      router.replace('/(tabs)/home');
    }
  };

  const signUp = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Completa todos los campos');
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signUp({ email, password });
    setLoading(false);

    if (error) {
      Alert.alert('Error', error.message);
    } else {
      Keyboard.dismiss();
      Alert.alert('Éxito', 'Revisa tu correo para confirmar la cuenta');
      // No redirigimos porque debe confirmar email primero
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#0f172a' }}>
      <Text style={{ fontSize: 32, fontWeight: 'bold', color: '#fff', marginBottom: 40, textAlign: 'center' }}>
        NexoColab
      </Text>
      <TextInput
        placeholder="Email"
        placeholderTextColor="#94a3b8"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        style={{
          backgroundColor: '#1e293b',
          color: '#fff',
          padding: 15,
          borderRadius: 10,
          marginBottom: 15,
        }}
      />
      <TextInput
        placeholder="Contraseña"
        placeholderTextColor="#94a3b8"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={{
          backgroundColor: '#1e293b',
          color: '#fff',
          padding: 15,
          borderRadius: 10,
          marginBottom: 20,
        }}
      />
      <TouchableOpacity
        onPress={signIn}
        disabled={loading}
        style={{
          backgroundColor: '#2563eb',
          padding: 15,
          borderRadius: 10,
          alignItems: 'center',
          marginBottom: 10,
        }}
      >
        <Text style={{ color: '#fff', fontWeight: 'bold' }}>{loading ? 'Cargando...' : 'Iniciar sesión'}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={signUp} disabled={loading}>
        <Text style={{ color: '#94a3b8', textAlign: 'center' }}>Crear cuenta</Text>
      </TouchableOpacity>
    </View>
  );
}