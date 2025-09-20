import React, { useEffect, useState, useRef } from "react";
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
  Animated,
} from "react-native";
import { login } from "../auth";
import { useNavigation } from "@react-navigation/native";

const API_URL = "https://apakalini.netlify.app/api";

// --- SCALE UTK RESPONSIVE ---
const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Menggunakan Animated.ImageBackground untuk kompatibilitas
const AnimatedBg = Animated.createAnimatedComponent(ImageBackground);

// --- FUNGSI & HELPER UNTUK RESPONSIVE & WEB COMPATIBILITY ---
const guidelineBaseWidth = 375;
const scale = (size) => (SCREEN_WIDTH / guidelineBaseWidth) * size;
const moderateScale = (size, factor = 0.5) => size + (scale(size) - size) * factor;
const useSafeNativeDriver = Platform.OS !== 'web'; // Variabel ini tidak digunakan, tetapi saya tetap menyimpannya

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigation = useNavigation();

  // Variabel animasi yang tidak digunakan dihapus
  const formOpacity = useRef(new Animated.Value(0)).current;
  const formTranslateY = useRef(new Animated.Value(moderateScale(20))).current;
  const adminOpacity = useRef(new Animated.Value(0)).current;
  const adminTranslateY = useRef(new Animated.Value(moderateScale(10))).current;

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

  useEffect(() => {
          Animated.parallel([
              Animated.timing(formOpacity, {
                  toValue: 1,
                  delay: 300,
                  duration: 500,
                  useNativeDriver: useSafeNativeDriver,
              }),
              Animated.timing(formTranslateY, {
                  toValue: 0,
                  delay: 300,
                  duration: 500,
                  useNativeDriver: useSafeNativeDriver,
              }),
          ]).start();
      }, []);

  return (
    <AnimatedBg
      source={require("../assets/splashbg.png")}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <Pressable onPress={goToHomeScreen} style={styles.backButton}>
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
    </AnimatedBg>
  );
}

const styles = StyleSheet.create({
  // --- BACK BUTTON ---
  backButton: {
    position: "absolute",
    top: Platform.OS === "web" ? moderateScale(20) : moderateScale(40),
    left: moderateScale(20),
    zIndex: 99,
    // Perbaikan opasitas di sini
    borderRadius: 50,
    padding: 8,
  },
  backIcon: {
    width: moderateScale(85),
    height: moderateScale(85),
  },

  // --- BACKGROUND & LAYOUT ---
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.7)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },

  // --- TEXT & INPUT ---
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

  // --- BUTTON ---
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
