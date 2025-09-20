import React, { useState, useEffect, useRef } from "react";
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

// --- FUNGSI SKALA UNTUK RESPONSIF ---
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const guidelineBaseWidth = 375;
const scale = (size) => (SCREEN_WIDTH / guidelineBaseWidth) * size;
const moderateScale = (size, factor = 0.5) => size + (scale(size) - size) * factor;

// Menggunakan Animated.ImageBackground untuk kompatibilitas
const AnimatedBg = Animated.createAnimatedComponent(ImageBackground);

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigation = useNavigation();

  const formOpacity = useRef(new Animated.Value(0)).current;
  const formTranslateY = useRef(new Animated.Value(moderateScale(20))).current;

  // Tidak ada animasi untuk admin, jadi variabel ini dihapus
  // const adminOpacity = useRef(new Animated.Value(0)).current;
  // const adminTranslateY = useRef(new Animated.Value(moderateScale(10))).current;

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
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.timing(formTranslateY, {
        toValue: 0,
        delay: 300,
        duration: 500,
        useNativeDriver: Platform.OS !== 'web',
      }),
    ]).start();
  }, []);

  return (
    <ImageBackground
      source={require('../assets/splashbg.png')}
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

        <Image
            source={require('../assets/title.png')}
            style={styles.logo}
            resizeMode="contain"
        />

        <Animated.View style={[styles.loginContainer, { opacity: formOpacity, transform: [{ translateY: formTranslateY }] }]}>
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
        </Animated.View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
    // --- Latar Belakang dan Kontainer Utama ---
    background: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
    overlay: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: moderateScale(20),
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },

    // --- Tombol-tombol ---
    soundButton: {
        position: 'absolute',
        top: Platform.OS === 'web' ? moderateScale(20) : moderateScale(40),
        right: moderateScale(20),
        zIndex: 99,
    },
    backButton: {
        position: "absolute",
        top: Platform.OS === "web" ? moderateScale(20) : moderateScale(40),
        left: moderateScale(20),
        zIndex: 99,
        borderRadius: 50,
        padding: 8,
    },
    adminButton: {
        position: 'absolute',
        top: Platform.OS === 'web' ? moderateScale(20) : moderateScale(50),
        left: moderateScale(20),
        zIndex: 99,
    },
    button: {
        width: "100%",
        backgroundColor: "#007bff",
        paddingVertical: moderateScale(14),
        borderRadius: moderateScale(12),
        alignItems: "center",
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: moderateScale(2) },
        shadowRadius: moderateScale(6),
        elevation: 3,
    },
    playButton: {
        width: moderateScale(160),
        height: moderateScale(160),
    },
    buttonText: {
        color: "#fff",
        fontSize: moderateScale(18),
        fontWeight: "600",
    },

    // --- Ikon & Gambar ---
    soundIcon: {
        width: moderateScale(70),
        height: moderateScale(70),
    },
    backIcon: {
        width: moderateScale(81),
        height: moderateScale(81),
        marginTop: moderateScale(-11),
        left: moderateScale(-8),
    },
    adminIcon: {
        width: moderateScale(85),
        height: moderateScale(85),
    },
    logo: {
        width: moderateScale(300),
        height: moderateScale(120),
        marginBottom: moderateScale(40),
    },

    // --- Teks & Input ---
    title: {
        fontSize: moderateScale(28),
        fontWeight: "bold",
        marginBottom: moderateScale(30),
        color: "#333",
    },
    loginContainer: {
        width: '100%',
        alignItems: 'center',
    },
    input: {
        width: "100%",
        height: moderateScale(50),
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: moderateScale(12),
        paddingHorizontal: moderateScale(15),
        fontSize: moderateScale(16),
        marginBottom: moderateScale(15),
        backgroundColor: "#fff",
    },
});