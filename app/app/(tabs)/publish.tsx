import { useState } from "react";
import {
  View, Text, TextInput, StyleSheet, TouchableOpacity, Alert,
  Image, Modal, FlatList
} from "react-native";
import { supabase } from "../../lib/supabase";
import * as ImagePicker from "expo-image-picker";

export default function PublishScreen() {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");          // ← se llena con la opción elegida
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false); // ← control del modal

  // 📋 Todas las categorías (las que pediste)
  const categories = [
    "Electrónica",
    "Hogar",
    "Ropa",
    "Deportes",
    "Libros",
    "Herramientas",
    "Tecnología y accesorios",
    "Cocina",
    "Jardinería",
    "Juguetes y juegos",
    "Música e instrumentos",
    "Oficina y estudio",
    "Salud y bienestar",
    "Camping y viajes",
    "Mascotas",
    "Vehículos y accesorios",
    "Construcción y bricolaje",
    "Arte y manualidades",
    "Eventos y fiestas",
    "Otros",
  ];

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  // ⚠️ Esta función NO se toca → ya funciona correctamente
  const publish = async () => {
    let imageUrl = null;
    if (image) {
      const fileName = `${Date.now()}.jpg`;

      const response = await fetch(image);
      const arrayBuffer = await response.arrayBuffer();

      const { data, error } = await supabase.storage
        .from("items")
        .upload(fileName, arrayBuffer, {
          contentType: "image/jpeg",
        });

      if (error) {
        console.log("Error subiendo imagen:", error);
      } else {
        const { data: publicUrl } = supabase.storage
          .from("items")
          .getPublicUrl(fileName);
        imageUrl = publicUrl.publicUrl;
      }
    }

    if (!title.trim() || !category.trim()) {
      Alert.alert("Falta info", "Completa título y categoría");
      return;
    }

    setLoading(true);

    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData.session?.user.id;

    if (!userId) {
      setLoading(false);
      Alert.alert("Sin sesión", "Inicia sesión para publicar");
      return;
    }

    const { error } = await supabase.from("items").insert([
      {
        title: title.trim(),
        category: category.trim(),
        user_id: userId,
        image_url: imageUrl,
      },
    ]);

    setLoading(false);

    if (error) {
      Alert.alert("Error", error.message);
      return;
    }

    Alert.alert("Listo", "Objeto publicado");
    setTitle("");
    setCategory("");
    setImage(null);   // 👈 opcional: limpiar imagen después de publicar
  };

  // Función que se ejecuta al elegir una categoría en el modal
  const selectCategory = (cat: string) => {
    setCategory(cat);
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.h1}>Publicar objeto</Text>

      <Text style={styles.label}>Título</Text>
      <TextInput
        value={title}
        onChangeText={setTitle}
        placeholder="Ej: Taladro, Bicicleta..."
        placeholderTextColor="#94a3b8"
        style={styles.input}
      />

      <Text style={styles.label}>Categoría</Text>
      {/* 🔽 Reemplazamos el TextInput por un botón que abre el modal */}
      <TouchableOpacity
        style={styles.categoryButton}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.categoryButtonText}>
          {category ? category : "Seleccionar categoría"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={pickImage} style={styles.button}>
        <Text style={styles.buttonText}>Seleccionar imagen</Text>
      </TouchableOpacity>

      {image && (
        <Image
          source={{ uri: image }}
          style={{
            width: "100%",
            height: 200,
            borderRadius: 10,
            marginTop: 10,
          }}
        />
      )}

      <TouchableOpacity
        style={styles.button}
        onPress={publish}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? "Publicando..." : "Publicar"}
        </Text>
      </TouchableOpacity>

      <Text style={styles.note}>Nota: ya guarda en Supabase (real).</Text>

      {/* ========= MODAL DE CATEGORÍAS ========= */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Seleccionar categoría</Text>
            <FlatList
              data={categories}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => selectCategory(item)}
                >
                  <Text style={styles.modalItemText}>{item}</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.modalCloseText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  h1: { fontSize: 22, fontWeight: "700", color: "white", marginBottom: 12 },
  label: { color: "#cbd5e1", marginTop: 8, marginBottom: 6 },
  input: { backgroundColor: "#1f2933", color: "white", padding: 12, borderRadius: 10 },

  // Estilo del botón categoría (reemplaza al input)
  categoryButton: {
    backgroundColor: "#1f2933",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#3b82f6",
  },
  categoryButtonText: {
    color: "white",
    fontSize: 16,
  },

  button: { backgroundColor: "#2563eb", padding: 12, borderRadius: 10, marginTop: 14, alignItems: "center" },
  buttonText: { color: "white", fontWeight: "700" },
  note: { color: "#94a3b8", marginTop: 10 },

  // Estilos del modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "#1e293b",
    borderRadius: 20,
    padding: 20,
    width: "80%",
    maxHeight: "70%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
    marginBottom: 15,
    textAlign: "center",
  },
  modalItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#334155",
  },
  modalItemText: {
    color: "white",
    fontSize: 18,
    textAlign: "center",
  },
  modalCloseButton: {
    marginTop: 15,
    padding: 10,
    backgroundColor: "#dc2626",
    borderRadius: 10,
  },
  modalCloseText: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
});