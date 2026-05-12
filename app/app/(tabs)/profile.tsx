import { useEffect, useState } from "react";
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, Keyboard } from "react-native";
import { supabase } from "../../lib/supabase";

export default function ProfileScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [sessionEmail, setSessionEmail] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSessionEmail(data.session?.user.email ?? null);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSessionEmail(session?.user.email ?? null);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const signUp = async () => {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
      Alert.alert("Error", error.message);
    } else {
      Keyboard.dismiss(); // 👈 Cierra el teclado
      Alert.alert("Listo", "Cuenta creada. Revisa correo.");
    }
  };

  const signIn = async () => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      Alert.alert("Error", error.message);
    } else {
      Keyboard.dismiss(); // 👈 Cierra el teclado
      Alert.alert("OK", "Sesión iniciada");
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    Keyboard.dismiss(); // 👈 Cierra el teclado
    Alert.alert("OK", "Sesión cerrada");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.h1}>Perfil</Text>

      <Text style={styles.status}>
        {sessionEmail ? `Conectado: ${sessionEmail}` : "Sin sesión"}
      </Text>

      <TextInput
        placeholder="Email"
        placeholderTextColor="#94a3b8"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        style={styles.input}
      />

      <TextInput
        placeholder="Password"
        placeholderTextColor="#94a3b8"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />

      <TouchableOpacity style={styles.button} onPress={signUp}>
        <Text style={styles.buttonText}>Crear cuenta</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={signIn}>
        <Text style={styles.buttonText}>Iniciar sesión</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, styles.secondary]} onPress={signOut}>
        <Text style={styles.buttonText}>Cerrar sesión</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  h1: { fontSize: 22, fontWeight: "700", color: "white", marginBottom: 12 },
  status: { color: "#cbd5e1", marginBottom: 12 },
  input: { backgroundColor: "#1f2933", color: "white", padding: 12, borderRadius: 10, marginBottom: 10 },
  button: { backgroundColor: "#2563eb", padding: 12, borderRadius: 10, marginBottom: 10, alignItems: "center" },
  secondary: { backgroundColor: "#334155" },
  buttonText: { color: "white", fontWeight: "700" },
});
