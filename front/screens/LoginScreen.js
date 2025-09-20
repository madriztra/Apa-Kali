import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Pressable,
  Platform,
  ImageBackground,
  Image,
  Dimensions,
} from "react-native";
import { login } from "../auth";
import { useNavigation } from "@react-navigation/native";

const API_URL = "https://apakalini.netlify.app/api";

const guidelineBaseWidth = 375;
const { width: SCREEN_WIDTH } = Dimensions.get("window");
const scale = (size) => (SCREEN_WIDTH / guidelineBaseWidth) * size;
const moderateScale = (size, factor = 0.5) => size + (scale(size) - size) * factor;

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigation = useNavigation();

  const handleLogin = () => {
    fetch(`${API_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("Login response:", data);

        if (data.message && data.message.includes("Login berhasil")) {
          login();
          navigation.reset({
            index: 0,
            routes: [{ name: "AdminScreen" }],
          });
        } else {
          Alert.alert("Login gagal", data.message || "Email atau password salah");
        }
      })
      .catch((err) => {
        console.error("Error login:", err);
        Alert.alert("Error", "Terjadi kesalahan saat login");
      });
  };

  const goToHomeScreen = () => {
    navigation.replace("HomeScreen");
  };

  return (
    <ImageBackground
      source={require("../assets/splashbg.png")}
      style={styles.background}
      resizeMode="cover"
    >
      
        <Pressable onPress={goToHomeScreen}>
          <Image
            source={require("../assets/back-button.png")}
            style={styles.backIcon}
            resizeMode="contain"
          />
        </Pressable>
        <View style={styles.overlay}>
        <Text style={styles.title}>Login</Text>

        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="Email"
          style={styles.input}
          placeholderTextColor="#999"
        />

        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder="Password"
          secureTextEntry
          style={styles.input}
          placeholderTextColor="#999"
        />

        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Masuk</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  // --- BACK BUTTON ---
    backButton: {
        position: 'absolute',
        top: Platform.OS === 'web' ? moderateScale(20) : moderateScale(50),
        left: moderateScale(20),
        zIndex: 99,
    },
    backIcon: {
        width: moderateScale(85),
        height: moderateScale(85),
    },
  background: { flex: 1, width: "100%", height: "100%" },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  title: { fontSize: 28, fontWeight: "bold", marginBottom: 30, color: "#333" },
  input: {
    width: "100%",
    height: 50,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 12,
    paddingHorizontal: 15,
    fontSize: 16,
    marginBottom: 15,
    backgroundColor: "#fff",
  },
  button: {
    width: "100%",
    backgroundColor: "#007bff",
    paddingVertical: 2,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3,
  },
  buttonText: { color: "#fff", fontSize: 18, fontWeight: "600" },
});




