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

// URL backend Anda (pastikan server sudah berjalan!)
const API_URL = 'https://apakalini.netlify.app';

const AdminScreen = ({ navigation }) => {
    const [leaderboard, setLeaderboard] = useState([]);
    const [lastFetchTimestamp, setLastFetchTimestamp] = useState(null);

    // --- FUNGSI BARU UNTUK BACKEND ---

    // Fungsi untuk mengambil data leaderboard dari backend
    const fetchLeaderboard = async () => {
        try {
            const response = await fetch(`${API_URL}/api/leaderboard`);
            if (!response.ok) {
                throw new Error('Gagal mengambil data dari server.');
            }
            const data = await response.json();
            setLeaderboard(data);
            setLastFetchTimestamp(new Date());
        } catch (error) {
            console.error("Gagal mengambil data leaderboard:", error);
            Alert.alert("Error", "Gagal mengambil data leaderboard. Cek koneksi server.");
        }
    };

    // Fungsi untuk mereset (menghapus) semua data leaderboard di backend
    const resetLeaderboard = async () => {
        Alert.alert(
            "Konfirmasi Reset",
            "Apakah Anda yakin ingin menghapus semua data skor? Aksi ini tidak bisa dibatalkan.",
            [
                { text: "Batal", style: "cancel" },
                { 
                    text: "Hapus", 
                    style: "destructive",
                    onPress: async () => {
                        try {
                            const response = await fetch(`${API_URL}/api/scores/reset`, {
                                method: 'DELETE',
                            });

                            if (!response.ok) {
                                throw new Error('Gagal mereset data di server.');
                            }

                            setLeaderboard([]); // Bersihkan state lokal setelah berhasil
                            Alert.alert("Sukses", "Data leaderboard berhasil direset.");
                        } catch (error) {
                            console.error("Gagal mereset leaderboard:", error);
                            Alert.alert("Error", "Gagal mereset leaderboard. Cek koneksi server.");
                        }
                    }
                }
            ]
        );
    };

    // Panggil fetchLeaderboard saat komponen pertama kali dimuat
    useEffect(() => {
        fetchLeaderboard();
    }, []);

    // Render item untuk FlatList
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
                        keyExtractor={(item, index) => `${item.name}-${item.score}-${item.timestamp}`}
                        style={styles.leaderboardList}
                        contentContainerStyle={styles.leaderboardContent}
                        ListEmptyComponent={<Text style={styles.emptyListText}>Belum ada data skor.</Text>}
                    />
                </View>

                <TouchableOpacity 
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Text style={styles.backButtonText}>Kembali</Text>
                </TouchableOpacity>

            </View>
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    background: {
        flex: 1,
    },
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
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 8,
    },
    leaderboardCard: {
        flex: 1,
    },
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
    resetButton: {
        backgroundColor: '#EF4444',
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    leaderboardList: {
        flex: 1,
        width: '100%',
    },
    leaderboardContent: {
        paddingBottom: 20,
    },
    leaderboardItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'rgba(51, 65, 85, 0.7)',
        borderRadius: 10,
        paddingHorizontal: 15,
        paddingVertical: 12,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#0EA5E9',
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
    backButton: {
        marginTop: 20,
        padding: 10,
    },
    backButtonText: {
        color: '#CBD5E1',
        fontSize: 16,
    },
});

export default AdminScreen;