import { useEffect, useState, useCallback } from "react";
import {
  View, Text, TextInput, StyleSheet, TouchableOpacity, Alert,
  Keyboard, FlatList, Image, ActivityIndicator
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { supabase } from "../../lib/supabase";

type MyItem = {
  id: number;
  id_uuid: string;
  title: string;
  category: string;
  image_url?: string;
  available: boolean;
};

export default function ProfileScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [sessionEmail, setSessionEmail] = useState<string | null>(null);
  const [myItems, setMyItems] = useState<MyItem[]>([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const loadMyItems = async (uid: string) => {
    setLoadingItems(true);
    const { data, error } = await supabase
      .from("items")
      .select("id, id_uuid, title, category, image_url, available")
      .eq("user_id", uid)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setMyItems(data);
      console.log("📦 Mis items cargados:", data.map(item => ({ id: item.id, title: item.title })));
    } else {
      console.log("Error cargando mis items:", error);
    }
    setLoadingItems(false);
  };

  const deleteItem = async (item: MyItem) => {
    Alert.alert(
      "Confirmar eliminación",
      `¿Eliminar "${item.title}" permanentemente?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              // 1. Eliminar imagen del storage
              if (item.image_url) {
                const fileName = item.image_url.split('/').pop();
                if (fileName) {
                  const { error: storageError } = await supabase.storage
                    .from("items")
                    .remove([fileName]);
                  if (storageError) console.log("Error al eliminar imagen:", storageError);
                }
              }

              // 2. Eliminar el objeto (ON DELETE CASCADE elimina las solicitudes automáticamente)
              const { error } = await supabase
                .from("items")
                .delete()
                .eq("id", item.id);

              if (error) {
                Alert.alert("Error", error.message);
              } else {
                Alert.alert("Eliminado", "Objeto eliminado correctamente");
                if (userId) await loadMyItems(userId);
              }
            } catch (err) {
              console.log("Excepción:", err);
              Alert.alert("Error", "Ocurrió un error inesperado");
            }
          },
        },
      ]
    );
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const user = data.session?.user ?? null;
      setSessionEmail(user?.email ?? null);
      setUserId(user?.id ?? null);
      if (user?.id) loadMyItems(user.id);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user ?? null;
      setSessionEmail(user?.email ?? null);
      setUserId(user?.id ?? null);
      if (user?.id) loadMyItems(user.id);
      else setMyItems([]);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (userId) {
        loadMyItems(userId);
      }
    }, [userId])
  );

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
    router.replace('/login');
  };

  if (sessionEmail) {
    return (
      <View style={styles.container}>
        <Text style={styles.h1}>Perfil</Text>
        <View style={styles.authenticatedCard}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{sessionEmail.charAt(0).toUpperCase()}</Text>
          </View>
          <Text style={styles.emailText}>{sessionEmail}</Text>
          <Text style={styles.statusText}>Sesión activa ✓</Text>
        </View>

        <Text style={styles.sectionTitle}>📦 Mis publicaciones</Text>
        {loadingItems ? (
          <ActivityIndicator color="#2563eb" style={{ marginVertical: 20 }} />
        ) : myItems.length === 0 ? (
          <Text style={styles.emptyText}>Aún no has publicado nada</Text>
        ) : (
          <FlatList
            data={myItems}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <View style={styles.itemCard}>
                {item.image_url && <Image source={{ uri: item.image_url }} style={styles.itemImage} />}
                <View style={styles.itemInfo}>
                  <Text style={styles.itemTitle}>{item.title}</Text>
                  <Text style={styles.itemCategory}>{item.category}</Text>
                  <Text style={[styles.itemStatus, item.available ? styles.available : styles.unavailable]}>
                    {item.available ? "Disponible" : "No disponible"}
                  </Text>
                </View>
                <TouchableOpacity style={styles.deleteButton} onPress={() => deleteItem(item)}>
                  <Text style={styles.deleteText}>🗑️ Eliminar</Text>
                </TouchableOpacity>
              </View>
            )}
            style={{ marginBottom: 12 }}
          />
        )}

        <TouchableOpacity style={[styles.button, styles.logout]} onPress={signOut}>
          <Text style={styles.buttonText}>Cerrar sesión</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.h1}>Perfil</Text>
      <Text style={styles.status}>{sessionEmail ? `Conectado: ${sessionEmail}` : "Sin sesión"}</Text>
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
  container: { flex: 1, padding: 16, backgroundColor: "#0f172a" },
  h1: { fontSize: 22, fontWeight: "700", color: "white", marginBottom: 12 },
  status: { color: "#cbd5e1", marginBottom: 12 },
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
  avatarText: { fontSize: 32, fontWeight: "700", color: "white" },
  emailText: { fontSize: 16, fontWeight: "600", color: "white", marginBottom: 8 },
  statusText: { fontSize: 13, color: "#16a34a", fontWeight: "500" },
  sectionTitle: { fontSize: 18, fontWeight: "700", color: "white", marginTop: 12, marginBottom: 12 },
  emptyText: { color: "#94a3b8", textAlign: "center", marginVertical: 20 },
  itemCard: {
    backgroundColor: "#1e293b",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  itemImage: { width: 60, height: 60, borderRadius: 8, marginRight: 12 },
  itemInfo: { flex: 1 },
  itemTitle: { color: "white", fontSize: 16, fontWeight: "600" },
  itemCategory: { color: "#94a3b8", fontSize: 12, marginTop: 2 },
  itemStatus: { fontSize: 12, marginTop: 4, fontWeight: "500" },
  available: { color: "#16a34a" },
  unavailable: { color: "#dc2626" },
  deleteButton: { backgroundColor: "#dc2626", paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8 },
  deleteText: { color: "white", fontWeight: "600", fontSize: 12 },
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
  logout: { backgroundColor: "#dc2626", marginTop: 20 },
  buttonText: { color: "white", fontWeight: "700" },
});