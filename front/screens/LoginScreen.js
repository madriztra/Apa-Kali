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
  Image, // ✅ tambahin ini
} from "react-native";
import { login } from "../auth";
import { useNavigation } from "@react-navigation/native";
import { moderateScale } from "react-native-size-matters"; // ✅ import biar scale aman

const API_URL = "https://apakalini.netlify.app/api";

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
          Alert.alert(
            "Login gagal",
            data.message || "Email atau password salah"
          );
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
      <View style={styles.overlay}>
        <Pressable onPress={goToHomeScreen} style={styles.kembaliButton}>
          <Image
            source={require("../assets/back-button.png")}
            style={styles.backIcon}
            resizeMode="contain"
          />
        </Pressable>

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
  backIcon: {
    width: moderateScale(30),
    height: moderateScale(30),
    tintColor: "#fff", // ✅ biar icon putih, opsional
  },
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  kembaliButton: {
    position: "absolute",
    top: Platform.OS === "web" ? 20 : 40,
    left: 20,
    zIndex: 99,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    borderRadius: 50, // bulat biar match sama icon
    padding: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 30,
    color: "#333",
  },
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
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
});
