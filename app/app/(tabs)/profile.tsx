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
      Keyboard.dismiss();
      Alert.alert("Listo", "Cuenta creada. Revisa correo.");
    }
  };

  const signIn = async () => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      Alert.alert("Error", error.message);
    } else {
      Keyboard.dismiss();
      Alert.alert("OK", "Sesión iniciada");
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    Keyboard.dismiss();
    Alert.alert("OK", "Sesión cerrada");
  };

  // 👇 Si está autenticado, mostrar solo info y botón cerrar sesión
  if (sessionEmail) {
    return (
      <View style={styles.container}>
        <Text style={styles.h1}>Perfil</Text>

        {/* Card de usuario autenticado */}
        <View style={styles.authenticatedCard}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>
              {sessionEmail.charAt(0).toUpperCase()}
            </Text>
          </View>
          
          <Text style={styles.emailText}>{sessionEmail}</Text>
          <Text style={styles.statusText}>Sesión activa ✓</Text>
        </View>

        {/* Botón cerrar sesión */}
        <TouchableOpacity style={[styles.button, styles.logout]} onPress={signOut}>
          <Text style={styles.buttonText}>Cerrar sesión</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // 👇 Si NO está autenticado, mostrar formulario de login/registro
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  h1: { fontSize: 22, fontWeight: "700", color: "white", marginBottom: 12 },
  status: { color: "#cbd5e1", marginBottom: 12 },
  
  // Estilos para usuario autenticado
  authenticatedCard: {
    backgroundColor: "#1f2933",
    padding: 24,
    borderRadius: 14,
    alignItems: "center",
    marginBottom: 24,
    marginTop: 20,
  },
  
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#2563eb",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  
  avatarText: {
    fontSize: 32,
    fontWeight: "700",
    color: "white",
  },
  
  emailText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
    marginBottom: 8,
  },
  
  statusText: {
    fontSize: 13,
    color: "#16a34a",
    fontWeight: "500",
  },
  
  // Estilos para formulario
  input: {
    backgroundColor: "#1f2933",
    color: "white",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },
  
  button: {
    backgroundColor: "#2563eb",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: "center",
  },
  
  logout: {
    backgroundColor: "#dc2626",
  },
  
  buttonText: {
    color: "white",
    fontWeight: "700",
  },
});
