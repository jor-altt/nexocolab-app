import { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, Image } from "react-native";
import { supabase } from "../../lib/supabase";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";

type Item = {
  id_uuid: string;
  title: string;
  category: string;
  user_id: string;
  available: boolean;
  image_url?: string;
};


export default function HomeScreen() {
  const [items, setItems] = useState<Item[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadItems = async () => {
    const { data, error } = await supabase
      .from("items")
      .select("*")
      .eq("available", true)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setItems(data);
    }
  };

  const requestItem = async (item: Item) => {
    if (!item.available) {
      Alert.alert("No disponible", "Este objeto ya fue prestado");
      return;
    }

    if (item.user_id === userId) {
      Alert.alert("Error", "No puedes solicitar tu propio objeto");
      return;
    }

    const { error } = await supabase.from("requests").insert([
      {
        item_id: item.id_uuid,
        owner_id: item.user_id,
        requester_id: userId,
        status: "pending",
      },
    ]);

    if (error) {
      Alert.alert("Error", error.message);
      return;
    }

    Alert.alert("Listo", "Solicitud enviada");
    await loadItems();
  };

useFocusEffect(
  useCallback(() => {
    const init = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const uid = sessionData.session?.user.id ?? null;
      setUserId(uid);

      if (uid) {
        await loadItems();
      }
    };

    init();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      const uid = session?.user.id ?? null;
      setUserId(uid);
      if (uid) {
        loadItems();
      }
    });

    return () => {
          // cleanup opcional
        };
      }, [])
    );


    const onRefresh = async () => {
      setRefreshing(true);
      await loadItems();
      setRefreshing(false);
    };

  return (
    <View style={styles.container}>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id_uuid}
        refreshing={refreshing}
        onRefresh={onRefresh}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.meta}>Categoría: {item.category}</Text>
            {item.image_url && (
              <Image
                source={{ uri: item.image_url }}
                style={styles.image}
              />
            )}
            <TouchableOpacity
              style={styles.button}
              onPress={() => requestItem(item)}
            >
              <Text style={styles.buttonText}>Solicitar</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  image: {
  width: "100%",
  height: 180,
  borderRadius: 10,
  marginTop: 8,
  },
  container: { flex: 1, padding: 12 },
  card: {
    backgroundColor: "#1f2933",
    padding: 14,
    borderRadius: 14,
    marginBottom: 12,
  },
  title: { color: "white", fontSize: 18, fontWeight: "700" },
  meta: { color: "#cbd5e1", marginVertical: 6 },
  button: {
    backgroundColor: "#2563eb",
    padding: 10,
    borderRadius: 8,
    marginTop: 8,
    alignItems: "center",
  },
  buttonText: { color: "white", fontWeight: "700" },
});