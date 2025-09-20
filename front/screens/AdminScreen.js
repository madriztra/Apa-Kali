import React, { useState, useEffect } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    TouchableOpacity, 
    StatusBar, 
    ImageBackground,
    FlatList,
    Alert,
} from 'react-native';
import { checkAuth, logout } from "../auth"; // pakai flag sederhana

const API_URL = 'https://bpom-challenge-v2.netlify.app/api';

const handleApiResponse = (response) => {
    return response.json().then((data) => {
        if (!response.ok) {
            throw new Error(data.message || `Server error: ${response.status}`);
        }
        return data;
    });
};

const AdminScreen = ({ navigation }) => {
    const [leaderboard, setLeaderboard] = useState([]);
    const [lastFetchTimestamp, setLastFetchTimestamp] = useState(null);

    // proteksi sederhana
    useEffect(() => {
        if (!checkAuth()) {
            Alert.alert("Akses ditolak", "Silakan login dulu.");
            navigation.replace("LoginScreen");
        }
    }, []);

    // ambil leaderboard
    const fetchLeaderboard = () => {
        fetch(`${API_URL}/leaderboard`)
            .then(handleApiResponse)
            .then((data) => {
                setLeaderboard(data);
                setLastFetchTimestamp(new Date());
            })
            .catch((error) => {
                console.error("Gagal mengambil leaderboard:", error);
                Alert.alert("Error", error.message || "Gagal ambil leaderboard.");
            });
    };

const resetLeaderboard = async () => {
  try {
    const response = await fetch(`${API_URL}/scores/reset`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });

    const data = await response.json();
    if (response.ok) {
      Alert.alert("Sukses", data.message);
      fetchLeaderboard(); // ✅ refresh setelah reset
    } else {
      Alert.alert("Error", "Gagal reset: " + data.message);
    }
  } catch (err) {
    console.error("❌ Error reset leaderboard:", err);
    Alert.alert("Error", "Terjadi kesalahan saat reset leaderboard.");
  }
};



    useEffect(() => {
        fetchLeaderboard();
    }, []);

    const renderLeaderboardItem = ({ item, index }) => (
        <View style={styles.leaderboardItem}>
            <Text style={styles.rankText}>#{index + 1}</Text>
            <Text style={styles.leaderboardPlayerName}>{item.name}</Text>
            <Text style={styles.leaderboardScore}>{item.score}</Text>
        </View>
    );

    return (
        <ImageBackground
            source={require('../assets/splashbg.png')}
            style={styles.background}
            resizeMode="cover"
        >
            <StatusBar barStyle="light-content" />
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.headerText}>Dashboard Admin</Text>
                    <Text style={styles.subtitle}>Kelola Data Game</Text>
                </View>

                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Aksi Admin</Text>
                    <TouchableOpacity 
                        style={[styles.button, styles.resetButton]}
                        onPress={resetLeaderboard}
                    >
                        <Text style={styles.buttonText}>Reset Leaderboard</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={styles.button}
                        onPress={fetchLeaderboard}
                    >
                        <Text style={styles.buttonText}>Refresh Data</Text>
                    </TouchableOpacity>
                </View>

                <View style={[styles.card, styles.leaderboardCard]}>
                    <Text style={styles.cardTitle}>Riwayat Skor Pemain</Text>
                    {lastFetchTimestamp && (
                        <Text style={styles.lastUpdatedText}>
                            Terakhir di-refresh: {lastFetchTimestamp.toLocaleTimeString()}
                        </Text>
                    )}
                    <FlatList
                        data={leaderboard}
                        renderItem={renderLeaderboardItem}
                        keyExtractor={(item, index) => `${item._id || item.name}-${index}`}
                        style={styles.leaderboardList}
                        contentContainerStyle={styles.leaderboardContent}
                        ListEmptyComponent={<Text style={styles.emptyListText}>Belum ada data skor.</Text>}
                    />
                </View>

                <TouchableOpacity 
                    style={styles.backButton}
                    onPress={() => {
                        logout();
                        navigation.replace("HomeScreen");
                    }}
                >
                    <Text style={styles.backButtonText}>Logout</Text>
                </TouchableOpacity>
            </View>
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    background: { flex: 1 },
    container: {
        flex: 1,
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        alignItems: 'center',
        padding: 20,
    },
    header: {
        width: '100%',
        alignItems: 'center',
        marginBottom: 30,
        marginTop: 50,
    },
    headerText: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#FFFFFF',
        textTransform: 'uppercase',
    },
    subtitle: {
        fontSize: 16,
        color: '#CBD5E1',
        marginTop: 5,
    },
    card: {
        width: '90%',
        backgroundColor: '#1E293B',
        borderRadius: 15,
        padding: 20,
        marginBottom: 20,
    },
    leaderboardCard: { flex: 1 },
    cardTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#38BDF8',
        marginBottom: 15,
        textAlign: 'center',
    },
    button: {
        backgroundColor: '#0EA5E9',
        paddingVertical: 12,
        borderRadius: 10,
        marginBottom: 10,
        alignItems: 'center',
    },
    resetButton: { backgroundColor: '#EF4444' },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    leaderboardList: { flex: 1, width: '100%' },
    leaderboardContent: { paddingBottom: 20 },
    leaderboardItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'rgba(51, 65, 85, 0.7)',
        borderRadius: 10,
        paddingHorizontal: 15,
        paddingVertical: 12,
        marginBottom: 8,
    },
    rankText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#CBD5E1',
        width: 30,
    },
    leaderboardPlayerName: {
        flex: 1,
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
        marginLeft: 10,
    },
    leaderboardScore: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#38BDF8',
    },
    emptyListText: {
        color: '#94A3B8',
        textAlign: 'center',
        marginTop: 20,
        fontSize: 14,
    },
    lastUpdatedText: {
        fontSize: 12,
        color: '#94A3B8',
        textAlign: 'center',
        marginBottom: 10,
    },
    backButton: { marginTop: 20, padding: 10 },
    backButtonText: { color: '#CBD5E1', fontSize: 16 },
});

export default AdminScreen;

