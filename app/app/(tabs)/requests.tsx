import { useEffect, useState, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity
} from "react-native";
import { supabase } from "../../lib/supabase";

type Request = {
  id: string;
  item_id: string; // 👈 agregar esto
  status: string;
  items: {
    title: string;
  };
};

export default function RequestsScreen() {
  const [received, setReceived] = useState<Request[]>([]);
  const [sent, setSent] = useState<Request[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const updateStatus = async (requestId: string, newStatus: string, itemId: string) => {
    console.log("Updating request:", requestId, newStatus);
    console.log("Item to update:", itemId);

    const { error } = await supabase
      .from("requests")
      .update({ status: newStatus })
      .eq("id", requestId);

    if (error) {
      console.log("Request update error:", error);
      return;
    }

    if (newStatus === "approved") {
      const { error: itemError } = await supabase
        .from("items")
        .update({ available: false })
        .eq("id_uuid", itemId);

      if (itemError) {
        console.log("Item update error:", itemError);
      } else {
        console.log("Item marked unavailable");
      }
    }

    if (userId) {
      loadRequests(userId);
    }
  };

  const loadRequests = async (uid: string) => {
    // 📥 Recibidas (soy dueño)
    const { data: receivedData } = await supabase
      .from("requests")
      .select(`
        *,
        items ( title )
      `)
      .eq("owner_id", uid)
      .order("created_at", { ascending: false });

    // 📤 Enviadas (soy solicitante)
    const { data: sentData } = await supabase
      .from("requests")
      .select(`
        *,
        items ( title )
      `)
      .eq("requester_id", uid)
      .order("created_at", { ascending: false });

    if (receivedData) setReceived(receivedData);
    if (sentData) setSent(sentData);
  };

useFocusEffect(
  useCallback(() => {
    const init = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const uid = sessionData.session?.user.id ?? null;
      setUserId(uid);
      if (uid) await loadRequests(uid);
    };

    init();
  }, [])
);

  const onRefresh = async () => {
    setRefreshing(true);
    if (userId) {
      await loadRequests(userId);
    }
    setRefreshing(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>📥 Solicitudes Recibidas</Text>

      {received.length === 0 ? (
        <Text style={styles.empty}>No tienes solicitudes recibidas</Text>
      ) : (
        <FlatList
          data={received}
          refreshing={refreshing}
          onRefresh={onRefresh}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.title}>{item.items?.title}</Text>
              <Text style={styles.meta}>Estado: {item.status}</Text>

              {item.status === "pending" && (
                <View style={styles.actions}>
                  <TouchableOpacity
                    style={styles.approve}
                    onPress={() => updateStatus(item.id, "approved", item.item_id)}
                  >
                    <Text style={styles.buttonText}>Aprobar</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.reject}
                    onPress={() => updateStatus(item.id, "rejected", item.item_id)}
                  >
                    <Text style={styles.buttonText}>Rechazar</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
        />
      )}

      <Text style={styles.sectionTitle}>📤 Solicitudes Enviadas</Text>

      {sent.length === 0 ? (
        <Text style={styles.empty}>No has enviado solicitudes</Text>
      ) : (
        <FlatList
          data={sent}
          refreshing={refreshing}
          onRefresh={onRefresh}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.title}>{item.items?.title}</Text>
              <Text style={styles.meta}>Estado: {item.status}</Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 12 },
  sectionTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "700",
    marginVertical: 10,
  },
  card: {
    backgroundColor: "#1f2933",
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
  },
  title: {
  color: "white",
  fontSize: 16,
  fontWeight: "700",
  },
  actions: {
    flexDirection: "row",
    marginTop: 8,
    gap: 8,
  },
  approve: {
    backgroundColor: "#16a34a",
    padding: 8,
    borderRadius: 6,
    flex: 1,
    alignItems: "center",
  },
  reject: {
    backgroundColor: "#dc2626",
    padding: 8,
    borderRadius: 6,
    flex: 1,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontWeight: "700",
  },
  meta: { color: "#cbd5e1" },
  empty: { color: "#94a3b8", marginBottom: 10 },
});